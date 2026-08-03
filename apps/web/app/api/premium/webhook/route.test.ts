import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  applyStripeCheckoutSession: vi.fn(),
  reconcileCustomerBilling: vi.fn(),
  resolveUserForStripeCustomer: vi.fn(),
  captureServerEvent: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'stripe-signature': 'signed' })),
}));
vi.mock('stripe', () => ({
  default: class StripeMock {
    webhooks = { constructEvent: mocks.constructEvent };
    subscriptions = {
      retrieve: vi.fn(),
      list: vi.fn(),
      cancel: vi.fn(),
    };
  },
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
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

import { POST } from './route';

function webhookRequest() {
  return new NextRequest(
    'https://www.trackmyopt.com/api/premium/webhook',
    {
      method: 'POST',
      body: '{}',
    },
  );
}

describe('Stripe webhook retry contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_webhook';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
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
      new Error('database unavailable'),
    );

    const response = await POST(webhookRequest());

    expect(response.status).toBe(500);
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
      new Error('analytics unavailable'),
    );

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
  });
});
