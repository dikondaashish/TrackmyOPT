import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  retrieve: vi.fn(),
  apply: vi.fn(),
  capture: vi.fn(),
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.user }));
vi.mock('@/lib/stripe/require-live-key-in-production', () => ({
  requireLiveStripeKeyInProduction: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({})) }));
vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { retrieve: mocks.retrieve } };
  },
}));
vi.mock('@/lib/premium/apply-stripe-checkout-session', () => ({
  applyStripeCheckoutSession: mocks.apply,
}));
vi.mock('@/lib/posthog-server', () => ({
  captureServerEvent: mocks.capture,
  normalizePlanTier: (v: string) => v,
}));
import { POST } from './route';
const paid = {
  id: 'cs_paid',
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
    supabase_user_id: 'owner',
    planId: 'pro',
    include_pro_intro: 'true',
    checkout_source: 'case_status',
  },
};
const request = () =>
  new NextRequest('https://example.com/api/premium/confirm-checkout', {
    method: 'POST',
    body: JSON.stringify({ sessionId: 'cs_paid' }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue('owner');
  mocks.retrieve.mockResolvedValue(paid);
  mocks.apply.mockResolvedValue({ ok: true, alreadyRecorded: true });
});
describe('verified intro on authenticated checkout confirmation', () => {
  it('captures a paid intro even with an existing payment row', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.capture).toHaveBeenCalledWith(
      'owner',
      'pro_paid_intro_started',
      expect.objectContaining({ $insert_id: 'pro_paid_intro_started:cs_paid' }),
      expect.anything()
    );
  });
  it('does not retrieve Stripe data for unauthenticated callers', async () => {
    mocks.user.mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(mocks.retrieve).not.toHaveBeenCalled();
    expect(mocks.capture).not.toHaveBeenCalled();
  });
  it('does not apply or count another account’s purchase', async () => {
    mocks.user.mockResolvedValue('other');
    expect((await POST(request())).status).toBe(403);
    expect(mocks.apply).not.toHaveBeenCalled();
    expect(mocks.capture).not.toHaveBeenCalled();
  });
  it('does not grant or count an unpaid purchase', async () => {
    mocks.retrieve.mockResolvedValue({ ...paid, payment_status: 'unpaid' });
    expect((await POST(request())).status).toBe(400);
    expect(mocks.apply).not.toHaveBeenCalled();
    expect(mocks.capture).not.toHaveBeenCalled();
  });
  it('does not count a failed entitlement application', async () => {
    mocks.apply.mockResolvedValue({ ok: false, reason: 'failed' });
    expect((await POST(request())).status).toBe(500);
    expect(mocks.capture).not.toHaveBeenCalled();
  });
});
