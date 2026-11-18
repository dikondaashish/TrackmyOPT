// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  auth: vi.fn(),
  limit: vi.fn(),
  profile: vi.fn(),
  authUser: vi.fn(),
  createSession: vi.fn(),
  consent: vi.fn(),
  capture: vi.fn(),
}));

vi.mock('@/lib/sentry/api-errors', () => ({
  withSentryApiErrors: (handler: unknown) => handler,
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: m.auth }));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByUser: m.limit,
  rateLimitResponse: () => new Response('limited', { status: 429 }),
  addRateLimitHeaders: (response: Response) => response,
}));
vi.mock('@/lib/stripe/require-live-key-in-production', () => ({
  requireLiveStripeKeyInProduction: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: m.profile }) }),
    }),
    auth: { admin: { getUserById: m.authUser } },
  }),
}));
vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { create: m.createSession } };
  },
}));
vi.mock('@/lib/billing/record-billing-consent', () => ({
  recordBillingConsentEvent: m.consent,
}));
vi.mock('@/lib/posthog-server', () => ({ captureServerEvent: m.capture }));

import { POST } from './route';

const request = (body: unknown) =>
  new NextRequest('https://example.test/api/premium/case-pass/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'user-agent': 'vitest' },
    body: JSON.stringify(body),
  });
const accepted = { nonRefundableAccepted: true, source: 'case_status' };
const freeProfile = {
  plan_tier: null,
  premium_status: false,
  subscription_expires_at: null,
  stripe_customer_id: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://db.example.test');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.trackmyopt.com');
  m.auth.mockResolvedValue('user-1');
  m.limit.mockResolvedValue({ success: true });
  m.profile.mockResolvedValue({ data: freeProfile, error: null });
  m.authUser.mockResolvedValue({
    data: { user: { email: 'student@example.test' } },
    error: null,
  });
  m.createSession.mockResolvedValue({
    id: 'cs_test_1',
    url: 'https://checkout.stripe.com/c/pay/cs_test_1',
  });
  m.consent.mockResolvedValue({ ok: true });
});

it('requires sign-in and the consent box before touching Stripe', async () => {
  m.auth.mockResolvedValueOnce(null);
  expect((await POST(request(accepted))).status).toBe(401);
  expect((await POST(request({ source: 'case_status' }))).status).toBe(400);
  expect(
    (await POST(request({ nonRefundableAccepted: 'yes' }))).status
  ).toBe(400);
  expect(m.createSession).not.toHaveBeenCalled();
});

it('refuses an account that already has paid access', async () => {
  m.profile.mockResolvedValue({
    data: { ...freeProfile, premium_status: true, plan_tier: 'pro' },
    error: null,
  });
  const response = await POST(request(accepted));
  expect(response.status).toBe(409);
  expect((await response.json()).code).toBe('already_premium');
  expect(m.createSession).not.toHaveBeenCalled();
});

it('creates a one-time $9.99 checkout and records the consent', async () => {
  const response = await POST(request(accepted));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    type: 'checkout',
    url: 'https://checkout.stripe.com/c/pay/cs_test_1',
  });

  const session = m.createSession.mock.calls[0]![0];
  expect(session.mode).toBe('payment');
  expect(session.subscription_data).toBeUndefined();
  expect(session.customer_email).toBe('student@example.test');
  expect(session.line_items).toEqual([
    {
      quantity: 1,
      price_data: expect.objectContaining({
        currency: 'usd',
        unit_amount: 999,
      }),
    },
  ]);
  const metadata = {
    purchase_type: 'case_pass',
    planId: 'pro',
    supabase_user_id: 'user-1',
    checkout_source: 'case_status',
    pass_days: '180',
  };
  expect(session.metadata).toEqual(metadata);
  expect(session.payment_intent_data).toEqual({ metadata });
  expect(session.success_url).toBe(
    'https://www.trackmyopt.com/premium/success?session_id={CHECKOUT_SESSION_ID}&planId=pro&pass=1'
  );

  expect(m.consent).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: 'user-1',
      eventType: 'case_pass_checkout_consent',
      stripeCheckoutSessionId: 'cs_test_1',
      userAgent: 'vitest',
      metadata: expect.objectContaining({
        plan_id: 'case_pass',
        amount_cents: 999,
        pass_days: 180,
        consent_text: expect.stringContaining('non-refundable'),
      }),
    })
  );
  expect(m.capture).toHaveBeenCalledWith(
    'user-1',
    'checkout_started',
    expect.objectContaining({ plan_id: 'case_pass', amount_cents: 999 })
  );
});

it('reuses the saved Stripe customer instead of creating one', async () => {
  m.profile.mockResolvedValue({
    data: { ...freeProfile, stripe_customer_id: 'cus_1' },
    error: null,
  });
  await POST(request(accepted));
  const session = m.createSession.mock.calls[0]![0];
  expect(session.customer).toBe('cus_1');
  expect(session.customer_email).toBeUndefined();
  expect(session.customer_creation).toBeUndefined();
  expect(m.authUser).not.toHaveBeenCalled();
});

it('returns a 500 without leaking details when Stripe fails', async () => {
  m.createSession.mockRejectedValue(new Error('card network secret detail'));
  const response = await POST(request(accepted));
  expect(response.status).toBe(500);
  expect(JSON.stringify(await response.json())).not.toContain('secret');
  expect(m.consent).not.toHaveBeenCalled();
});

it('applies the rate limit', async () => {
  m.limit.mockResolvedValue({ success: false });
  expect((await POST(request(accepted))).status).toBe(429);
  expect(m.createSession).not.toHaveBeenCalled();
});
