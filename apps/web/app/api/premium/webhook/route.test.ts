import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieveSubscription: vi.fn(),
  applyStripeCheckoutSession: vi.fn(),
  reconcileCustomerBilling: vi.fn(),
  resolveUserForStripeCustomer: vi.fn(),
  captureServerEvent: vi.fn(),
  fulfillResumeCreditCheckout: vi.fn(),
  applyResumeCreditRefund: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'stripe-signature': 'signed' })),
}));
vi.mock('stripe', () => ({
  default: class StripeMock {
    webhooks = { constructEvent: mocks.constructEvent };
    subscriptions = {
      retrieve: mocks.retrieveSubscription,
      list: vi.fn(),
      cancel: vi.fn(),
    };
  },
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  })),
}));
vi.mock('@/lib/stripe/require-live-key-in-production', () => ({
  requireLiveStripeKeyInProduction: vi.fn(),
}));
vi.mock('@/lib/premium/apply-stripe-checkout-session', () => ({
  applyStripeCheckoutSession: mocks.applyStripeCheckoutSession,
}));
vi.mock('@/lib/premium/stripe-subscription-sync', () => ({
  cancelOtherCustomerSubscriptions: vi.fn(),
  getPlanFromSubscription: vi.fn(() => 'pro'),
  reconcileCustomerBilling: mocks.reconcileCustomerBilling,
  subscriptionHasPendingUpdate: vi.fn(() => false),
  syncProfileFromSubscription: vi.fn(),
}));
vi.mock('@/lib/notifications/transactional/billing', () => ({
  sendPaymentFailedEmail: vi.fn(),
  sendRefundAcknowledgmentEmail: vi.fn(),
  sendSubscriptionEndedEmail: vi.fn(),
  sendUnusedCancelWinbackEmail: vi.fn(),
  sendCancellationConfirmedEmail: vi.fn(),
  sendSubscriptionReceiptEmail: vi.fn(),
}));
vi.mock('@/lib/notifications/transactional/trials', () => ({
  sendTrialEndingEmail: vi.fn(),
  sendTrialStartedEmail: vi.fn(),
}));
vi.mock('@/lib/notifications/transactional/stripe-users', () => ({
  resolveUserById: vi.fn(),
  resolveUserForStripeCustomer: mocks.resolveUserForStripeCustomer,
}));
vi.mock('@/lib/billing/record-billing-consent', () => ({
  recordBillingConsentEvent: vi.fn(),
}));
vi.mock('@/lib/posthog-server', () => ({
  captureServerEvent: mocks.captureServerEvent,
  normalizeBillingInterval: vi.fn(() => 'month'),
  normalizePlanTier: vi.fn(() => 'pro'),
}));
vi.mock('@/lib/posthog/billing-analytics', () => ({
  billingInsertId: vi.fn(() => 'insert-id'),
  buildPaymentSucceededCapture: vi.fn(() => ({})),
}));
vi.mock('@/lib/posthog/ltv-sync', () => ({
  syncUserLtvToPostHog: vi.fn(),
}));
vi.mock('@/lib/resume-credits/fulfillment', () => ({
  isResumeCreditCheckout: vi.fn(
    (session: { metadata?: { purchase_type?: string } }) =>
      session.metadata?.purchase_type === 'resume_credit_pack'
  ),
  fulfillResumeCreditCheckout: mocks.fulfillResumeCreditCheckout,
  applyResumeCreditRefund: mocks.applyResumeCreditRefund,
}));

import { POST } from './route';

function webhookRequest() {
  return new NextRequest('https://www.trackmyopt.com/api/premium/webhook', {
    method: 'POST',
    body: '{}',
  });
}

describe('Stripe webhook retry contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_webhook';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    mocks.applyResumeCreditRefund.mockResolvedValue({ handled: false });
  });

  it('returns 500 when checkout entitlement application fails', async () => {
    mocks.constructEvent.mockReturnValue({
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          metadata: { supabase_user_id: 'user-1' },
        },
      },
    });
    mocks.applyStripeCheckoutSession.mockResolvedValue({
      ok: false,
      reason: 'profile_update_failed',
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(500);
  });

  it('records a verified paid intro even when a pending row or confirm path already recorded checkout', async () => {
    mocks.captureServerEvent.mockResolvedValue(undefined);
    mocks.constructEvent.mockReturnValue({
      id: 'evt_intro',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_intro',
          livemode: true,
          mode: 'subscription',
          invoice: {
            status: 'paid',
            amount_paid: 99,
            currency: 'usd',
            status_transitions: { paid_at: 900 },
          },
          status: 'complete',
          payment_status: 'paid',
          amount_total: 99,
          currency: 'usd',
          metadata: {
            supabase_user_id: 'user-1',
            planId: 'pro',
            include_pro_intro: 'true',
            checkout_source: 'case_status',
          },
        },
      },
    });
    mocks.applyStripeCheckoutSession.mockResolvedValue({
      ok: true,
      alreadyRecorded: true,
    });
    expect((await POST(webhookRequest())).status).toBe(200);
    expect(mocks.captureServerEvent).toHaveBeenCalledWith(
      'user-1',
      'pro_paid_intro_started',
      expect.objectContaining({ amount_cents: 99, source: 'case_status' }),
      expect.anything()
    );
  });

  it('does not capture conversion after a bad signature', async () => {
    mocks.constructEvent.mockImplementationOnce(() => {
      throw new Error('invalid signature');
    });
    expect((await POST(webhookRequest())).status).toBe(400);
    expect(mocks.applyStripeCheckoutSession).not.toHaveBeenCalled();
    expect(mocks.captureServerEvent).not.toHaveBeenCalled();
  });

  it('handles current invoice parent schema and measures first renewal', async () => {
    mocks.captureServerEvent.mockResolvedValue(undefined);
    mocks.constructEvent.mockReturnValue({
      id: 'evt_renew',
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_renew',
          status_transitions: { paid_at: 1010 },
          customer: 'cus_1',
          status: 'paid',
          livemode: true,
          amount_paid: 499,
          currency: 'usd',
          billing_reason: 'subscription_cycle',
          parent: { subscription_details: { subscription: 'sub_1' } },
          lines: { data: [{ period: { start: 1000 } }] },
        },
      },
    });
    mocks.retrieveSubscription.mockResolvedValue({
      id: 'sub_1',
      trial_end: 1000,
      metadata: { planId: 'pro', include_pro_intro: 'true', interval: 'month' },
    });
    mocks.resolveUserForStripeCustomer.mockResolvedValue({
      userId: 'user-1',
      email: 'example@example.com',
    });
    mocks.reconcileCustomerBilling.mockResolvedValue({
      action: 'synced',
      planTier: 'pro',
    });
    expect((await POST(webhookRequest())).status).toBe(200);
    expect(mocks.captureServerEvent).toHaveBeenCalledWith(
      'user-1',
      'pro_paid_intro_renewed',
      expect.objectContaining({ amount_cents: 499 }),
      expect.anything()
    );
  });

  it('returns 500 when subscription revocation reconciliation throws', async () => {
    mocks.constructEvent.mockReturnValue({
      id: 'evt_deleted',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_deleted',
          customer: 'cus_123',
          status: 'canceled',
          metadata: {},
        },
      },
    });
    mocks.resolveUserForStripeCustomer.mockResolvedValue({
      userId: 'user-1',
      email: 'person@example.com',
      firstName: 'Person',
    });
    mocks.reconcileCustomerBilling.mockRejectedValue(
      new Error('database unavailable')
    );

    const response = await POST(webhookRequest());

    expect(response.status).toBe(500);
  });

  it('fulfills a paid resume-credit checkout without granting premium', async () => {
    mocks.constructEvent.mockReturnValue({
      id: 'evt_credit_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_credit',
          status: 'complete',
          payment_status: 'paid',
          metadata: {
            purchase_type: 'resume_credit_pack',
            supabase_user_id: 'user-1',
          },
        },
      },
    });
    mocks.fulfillResumeCreditCheckout.mockResolvedValue({
      alreadyGranted: false,
      creditBalance: 10,
      creditsGranted: 10,
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    expect(mocks.fulfillResumeCreditCheckout).toHaveBeenCalledOnce();
    expect(mocks.applyStripeCheckoutSession).not.toHaveBeenCalled();
  });

  it('handles a credit refund without revoking the subscription', async () => {
    mocks.constructEvent.mockReturnValue({
      id: 'evt_credit_refund',
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_credit',
          payment_intent: 'pi_credit',
          amount: 100,
          amount_refunded: 100,
        },
      },
    });
    mocks.applyResumeCreditRefund.mockResolvedValue({
      handled: true,
      userId: 'user-1',
      creditsRevoked: 10,
      creditBalance: 0,
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    expect(mocks.applyResumeCreditRefund).toHaveBeenCalledOnce();
    expect(mocks.reconcileCustomerBilling).not.toHaveBeenCalled();
  });

  it('acknowledges after a successful revocation even when analytics fails', async () => {
    mocks.constructEvent.mockReturnValue({
      id: 'evt_deleted',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_deleted',
          customer: 'cus_123',
          status: 'canceled',
          metadata: {},
          cancellation_details: { feedback: 'unused' },
        },
      },
    });
    mocks.resolveUserForStripeCustomer.mockResolvedValue({
      userId: 'user-1',
      email: 'person@example.com',
      firstName: 'Person',
    });
    mocks.reconcileCustomerBilling.mockResolvedValue({ action: 'revoked' });
    mocks.captureServerEvent.mockRejectedValue(
      new Error('analytics unavailable')
    );

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
  });
});
