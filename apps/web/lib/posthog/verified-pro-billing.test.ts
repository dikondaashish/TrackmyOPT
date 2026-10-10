import { beforeEach, describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';
import { captureServerEvent } from '@/lib/posthog-server';
import {
  captureProIntroCancellation,
  stableBillingCaptureIdentity,
  captureVerifiedProIntro,
  captureVerifiedProRenewal,
  invoiceSubscriptionId,
} from './verified-pro-billing';
import { normalizeProCheckoutSource } from './pro-conversion';
vi.mock('@/lib/posthog-server', () => ({ captureServerEvent: vi.fn() }));
const stripe = {} as Stripe;
const paidInvoice = {
  status: 'paid',
  amount_paid: 99,
  currency: 'usd',
  status_transitions: { paid_at: 900 },
};
const session = {
  invoice: paidInvoice,
  id: 'cs_example',
  livemode: true,
  mode: 'subscription',
  status: 'complete',
  payment_status: 'paid',
  amount_total: 99,
  currency: 'usd',
  metadata: {
    planId: 'pro',
    include_pro_intro: 'true',
    interval: 'month',
    checkout_source: 'case_status',
  },
} as unknown as Stripe.Checkout.Session;
const subscription = {
  id: 'sub_example',
  trial_end: 1000,
  metadata: {
    planId: 'pro',
    include_pro_intro: 'true',
    interval: 'month',
    checkout_source: 'case_status',
  },
} as unknown as Stripe.Subscription;
const invoice = {
  id: 'in_example',
  status_transitions: { paid_at: 1010 },
  livemode: true,
  status: 'paid',
  amount_paid: 499,
  currency: 'usd',
  billing_reason: 'subscription_cycle',
  parent: { subscription_details: { subscription: 'sub_example' } },
  lines: { data: [{ period: { start: 1000 } }] },
} as unknown as Stripe.Invoice;
beforeEach(() => vi.clearAllMocks());
describe('verified paid-intro measurement', () => {
  it('deduplicates verified starts by session across webhook and confirm paths', async () => {
    await captureVerifiedProIntro('user', session, stripe);
    await captureVerifiedProIntro('user', session, stripe);
    expect(vi.mocked(captureServerEvent).mock.calls[0]).toEqual(
      vi.mocked(captureServerEvent).mock.calls[1]
    );
    expect(captureServerEvent).toHaveBeenCalledWith(
      'user',
      'pro_paid_intro_started',
      expect.objectContaining({
        $insert_id: 'pro_paid_intro_started:cs_example',
        amount_cents: 99,
        source: 'case_status',
      }),
      expect.objectContaining({
        timestamp: new Date(900000),
        uuid: expect.any(String),
      })
    );
  });
  it.each([
    { payment_status: 'unpaid' },
    { payment_status: 'no_payment_required' },
    { status: 'open' },
    { amount_total: 0 },
    { amount_total: 499 },
    { livemode: false },
    { currency: 'eur' },
    { metadata: { planId: 'dedicated' } },
  ])('does not count an unqualified purchase %j', async (changes) => {
    await captureVerifiedProIntro(
      'user',
      { ...session, ...changes } as Stripe.Checkout.Session,
      stripe
    );
    expect(captureServerEvent).not.toHaveBeenCalled();
  });
  it('counts a delayed first renewal from its billing period and uses stable identities', async () => {
    await captureVerifiedProRenewal('user', invoice, subscription);
    expect(captureServerEvent).toHaveBeenCalledWith(
      'user',
      'pro_paid_intro_renewed',
      expect.objectContaining({
        $insert_id: 'pro_paid_intro_renewed:sub_example',
        amount_cents: 499,
      }),
      expect.objectContaining({ timestamp: new Date(1010000) })
    );
  });
  it('does not count a later renewal as first renewal', async () => {
    await captureVerifiedProRenewal(
      'user',
      {
        ...invoice,
        lines: { data: [{ period: { start: 2000 } }] },
      } as Stripe.Invoice,
      subscription
    );
    expect(captureServerEvent).toHaveBeenCalledTimes(1);
    expect(captureServerEvent).toHaveBeenCalledWith(
      'user',
      'pro_subscription_renewed',
      expect.anything(),
      expect.anything()
    );
  });
  it.each([
    { status_transitions: {} },
    { status: 'open' },
    { amount_paid: 0 },
    { billing_reason: 'subscription_update' },
    { livemode: false },
  ])('excludes unpaid/test/proration invoices %j', async (changes) => {
    await captureVerifiedProRenewal(
      'user',
      { ...invoice, ...changes } as Stripe.Invoice,
      subscription
    );
    expect(captureServerEvent).not.toHaveBeenCalled();
  });
  it('reads modern and historical invoice subscription references', () => {
    expect(invoiceSubscriptionId(invoice)).toBe('sub_example');
    expect(
      invoiceSubscriptionId({
        subscription: { id: 'sub_old' },
      } as unknown as Stripe.Invoice)
    ).toBe('sub_old');
    expect(invoiceSubscriptionId({} as Stripe.Invoice)).toBeNull();
  });
  it('does not propagate arbitrary attribution or personal data', () => {
    expect(
      normalizeProCheckoutSource('https://example.com?email=private')
    ).toBe('unknown');
  });
});

describe('stable billing identity and cancellation requests', () => {
  it('uses a stable valid UUID and Stripe timestamp across delayed retries', () => {
    const identity = stableBillingCaptureIdentity('intro:cs_123', 900);
    expect(identity).toEqual(stableBillingCaptureIdentity('intro:cs_123', 900));
    expect(identity.uuid).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-5[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/
    );
    expect(identity.uuid).not.toBe(
      stableBillingCaptureIdentity('intro:cs_other', 900).uuid
    );
    expect(identity.timestamp).toEqual(new Date(900000));
  });
  it('counts disabling renewal during the intro, before the subscription ends', async () => {
    await captureProIntroCancellation('user', {
      ...subscription,
      livemode: true,
      status: 'trialing',
      cancel_at_period_end: true,
      canceled_at: 950,
    } as Stripe.Subscription);
    expect(captureServerEvent).toHaveBeenCalledWith(
      'user',
      'pro_intro_cancellation_requested',
      expect.objectContaining({ during_intro: true }),
      expect.objectContaining({ timestamp: new Date(950000) })
    );
  });
  it('does not count a resumed renewal or test subscription as a request', async () => {
    await captureProIntroCancellation('user', {
      ...subscription,
      livemode: true,
      cancel_at_period_end: false,
      canceled_at: 950,
    } as Stripe.Subscription);
    await captureProIntroCancellation('user', {
      ...subscription,
      livemode: false,
      cancel_at_period_end: true,
      canceled_at: 950,
    } as Stripe.Subscription);
    expect(captureServerEvent).not.toHaveBeenCalled();
  });
  it('leaves payment success unaffected if invoice reporting is temporarily unavailable', async () => {
    await captureVerifiedProIntro('user', { ...session, invoice: 'in_123' }, {
      invoices: {
        retrieve: vi.fn().mockRejectedValue(new Error('unavailable')),
      },
    } as unknown as Stripe);
    expect(captureServerEvent).not.toHaveBeenCalled();
  });
});
