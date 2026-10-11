// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildPendingCaseEmail,
  createMonitoringToken,
  isVerifiedPendingCase,
  loadCasePromotionRecipient,
  requireCasePromotionProvider,
  sendCasePromotion,
  verifyMonitoringToken,
} from './pending-case-email';
import { verifyUnsubscribeToken } from './campaign-unsubscribe';
const billing = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock('stripe', () => ({
  default: class {
    subscriptions = { list: billing.list };
  },
}));
const userId = '10000000-0000-4000-8000-000000000001';
const caseId = '20000000-0000-4000-8000-000000000001';
const secret = 'synthetic-signing-secret';
const now = Date.parse('2026-10-12T12:00:00Z');
function setup(
  overrides: Record<string, unknown> = {},
  errors: Record<string, object> = {}
) {
  const rows: Record<string, unknown> = {
    profiles: {
      premium_status: false,
      plan_tier: 'free',
      pro_free_trial_consumed: false,
      stripe_customer_id: null,
    },
    email_preferences: { marketing_emails: true },
    pending_case_email_sequences: { case_id: caseId },
    payment_transactions: [],
    blocked_emails: null,
    case_status: {
      current_status: 'Case Was Received And A Receipt Notice Was Sent',
      last_checked_at: new Date(now - 3600_000).toISOString(),
      last_check_failed_at: null,
    },
    ...overrides,
  };
  const updates: object[] = [];
  const q = (table: string) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      update: vi.fn().mockImplementation((value: object) => {
        updates.push(value);
        return chain;
      }),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve({
          data: rows[table],
          error: errors[table] ?? null,
        }).then(resolve),
    };
    return chain;
  };
  const account = vi.fn().mockResolvedValue({
    data: {
      user: {
        id: userId,
        email: 'Test@Example.invalid',
        email_confirmed_at: '2026-10-01',
        is_anonymous: false,
      },
    },
    error: null,
  });
  const rpc = vi.fn().mockResolvedValue({ data: userId, error: null });
  const client = {
    from: vi.fn(q),
    auth: { admin: { getUserById: account } },
    rpc,
  } as unknown as SupabaseClient;
  const sendMail = vi.fn().mockResolvedValue({
    accepted: ['test@example.invalid'],
    messageId: 'synthetic-smtp-id',
  });
  return { client, rows, updates, account, rpc, sendMail };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.clearAllMocks();
  vi.stubEnv('PENDING_CASE_EMAILS_ENABLED', 'true');
  vi.stubEnv('CAMPAIGN_MARKETING_PROVIDER_APPROVED', 'true');
  for (const [key, value] of Object.entries({
    CAMPAIGN_SMTP_HOST: 'smtp.marketing.example.invalid',
    CAMPAIGN_SMTP_PORT: '587',
    CAMPAIGN_SMTP_USER: 'synthetic',
    CAMPAIGN_SMTP_PASS: 'synthetic',
    CAMPAIGN_FROM_EMAIL: 'support@trackmyopt.com',
    EMAIL_LINK_SIGNING_SECRET: secret,
    STRIPE_SECRET_KEY: 'sk_test_synthetic',
  }))
    vi.stubEnv(key, value);
  billing.list.mockResolvedValue({ data: [] });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});
describe('verified pending status', () => {
  it.each([
    'Case Was Received And A Receipt Notice Was Sent',
    'Case Is Being Actively Reviewed By USCIS',
    'Case Was Transferred',
    'Case Was Updated To Show Fingerprints Were Taken',
  ])('accepts a fresh successful pending check: %s', (current_status) => {
    expect(
      isVerifiedPendingCase(
        {
          current_status,
          last_checked_at: new Date(now - 3600_000).toISOString(),
        },
        now
      )
    ).toBe(true);
  });
  it.each([
    'Case Was Approved',
    'Case Was Denied',
    'Request for Initial Evidence Was Sent',
    'Case Was Received. Request for Evidence',
    'Interview Was Scheduled',
    'Unknown',
    'Status will be fetched',
    'Case Was Received but Error',
  ])(
    'excludes final, action-required and unknown status: %s',
    (current_status) => {
      expect(
        isVerifiedPendingCase(
          { current_status, last_checked_at: new Date(now).toISOString() },
          now
        )
      ).toBe(false);
    }
  );
  it('rejects stale, future, invalid and failed checks', () => {
    for (const last_checked_at of [
      new Date(now - 72 * 3600_000).toISOString(),
      new Date(now + 1).toISOString(),
      'invalid',
      null,
    ])
      expect(
        isVerifiedPendingCase(
          { current_status: 'Case Was Received', last_checked_at },
          now
        )
      ).toBe(false);
    expect(
      isVerifiedPendingCase(
        {
          current_status: 'Case Was Received',
          last_checked_at: new Date(now).toISOString(),
          last_check_failed_at: '2026-10-12',
        },
        now
      )
    ).toBe(false);
  });
});
it('binds an expiring purpose-specific token without exposing a case number or email', () => {
  const token = createMonitoringToken(userId, secret, now);
  expect(verifyMonitoringToken(token, secret, now)).toBe(userId);
  for (const value of [
    token + 'x',
    token + '.extra',
    'x'.repeat(513),
    token.split('.')[0] + '.invalid',
  ])
    expect(verifyMonitoringToken(value, secret, now)).toBeNull();
  expect(verifyMonitoringToken(token, 'wrong', now)).toBeNull();
  expect(
    verifyMonitoringToken(token, secret, now + 14 * 24 * 3600_000)
  ).toBeNull();
  expect(verifyUnsubscribeToken(token, secret)).toBeNull();
});
it('requires provider approval and supports the owner-approved existing Zoho account', () => {
  expect(() =>
    requireCasePromotionProvider({
      SMTP_HOST: 'smtp.zeptomail.com',
      SMTP_USER: 'x',
      SMTP_PASS: 'x',
    })
  ).toThrow('approval');
  // Inert fixture strings: this provider-options test never connects to SMTP.
  const configured = {
    CAMPAIGN_MARKETING_PROVIDER_APPROVED: 'true',
    SMTP_HOST: 'smtp.zeptomail.com',
    SMTP_PORT: '587',
    SMTP_USER: 'synthetic',
    SMTP_PASS: 'synthetic',
    SMTP_FROM_EMAIL: 'support@trackmyopt.com',
  };
  expect(requireCasePromotionProvider(configured)).toMatchObject({
    host: 'smtp.zeptomail.com',
    port: 587,
    requireTLS: true,
  });
  expect(() =>
    requireCasePromotionProvider({ ...configured, SMTP_PASS: undefined })
  ).toThrow('complete');
});
it.each(['pending_case_first', 'pending_case_followup'] as const)(
  'discloses truthful monitoring, prices and unsubscribe in %s',
  (kind) => {
    const body = buildPendingCaseEmail(
      kind,
      'https://www.trackmyopt.com/premium/monitoring',
      'https://www.trackmyopt.com/unsubscribe'
    );
    expect(body.text).toContain('$0.99 for 7 days, then $4.99/month');
    expect(body.text).toContain('$49.99/year');
    expect(body.text).toContain('Cancel before renewal');
    expect(body.html).toContain('https://www.trackmyopt.com/unsubscribe');
    expect(body.html).not.toContain('${');
    expect(body.text).not.toMatch(
      /guaranteed|exact decision date|don.t worry/i
    );
  }
);
it('loads only a verified, opted-in, unpaid owner and checks case ownership', async () => {
  const m = setup();
  expect(await loadCasePromotionRecipient(m.client, userId)).toMatchObject({
    email: 'test@example.invalid',
  });
  expect(m.account).toHaveBeenCalledWith(userId);
  expect(m.client.from).toHaveBeenCalledWith('case_status');
});
it.each([
  { profiles: { premium_status: true, plan_tier: 'pro' } },
  { profiles: { premium_status: false, plan_tier: 'dedicated' } },
  {
    profiles: {
      premium_status: false,
      plan_tier: 'free',
      pro_free_trial_consumed: true,
    },
  },
  { email_preferences: { marketing_emails: false } },
  { email_preferences: { marketing_emails: null } },
  { payment_transactions: [{ id: 'paid' }] },
  { blocked_emails: { id: 'block' } },
  { pending_case_email_sequences: { case_id: null } },
  { case_status: null },
  {
    case_status: {
      current_status: 'Case Was Approved',
      last_checked_at: new Date(now).toISOString(),
    },
  },
])('does not send to an ineligible recipient (%j)', async (overrides) => {
  const m = setup(overrides);
  expect(
    await sendCasePromotion({
      supabase: m.client,
      userId,
      kind: 'pending_case_first',
      sendMail: m.sendMail,
    })
  ).toEqual({ status: 'skipped' });
  expect(m.rpc).not.toHaveBeenCalled();
  expect(m.sendMail).not.toHaveBeenCalled();
});
it('stops on deletion and on Stripe subscription history despite delayed local state', async () => {
  const m = setup();
  m.account.mockResolvedValueOnce({
    data: { user: null },
    error: { status: 404 },
  });
  expect(await loadCasePromotionRecipient(m.client, userId)).toBeNull();
  const n = setup({
    profiles: {
      premium_status: false,
      plan_tier: 'free',
      stripe_customer_id: 'cus_synthetic',
    },
  });
  billing.list.mockResolvedValueOnce({ data: [{ id: 'sub_synthetic' }] });
  expect(await loadCasePromotionRecipient(n.client, userId)).toBeNull();
  expect(billing.list).toHaveBeenCalledWith({
    customer: 'cus_synthetic',
    status: 'all',
    limit: 1,
  });
});
it.each([
  'profiles',
  'email_preferences',
  'payment_transactions',
  'pending_case_email_sequences',
  'case_status',
  'blocked_emails',
])('fails closed on %s read failure', async (table) => {
  const m = setup({}, { [table]: { message: 'private database detail' } });
  await expect(
    sendCasePromotion({
      supabase: m.client,
      userId,
      kind: 'pending_case_first',
      sendMail: m.sendMail,
    })
  ).rejects.toThrow(/unavailable/);
  expect(m.sendMail).not.toHaveBeenCalled();
});
it('fails closed on billing verification outage', async () => {
  const m = setup({
    profiles: {
      premium_status: false,
      plan_tier: 'free',
      stripe_customer_id: 'cus_synthetic',
    },
  });
  billing.list.mockRejectedValueOnce(new Error('Provider unavailable'));
  await expect(
    sendCasePromotion({
      supabase: m.client,
      userId,
      kind: 'pending_case_first',
      sendMail: m.sendMail,
    })
  ).rejects.toThrow();
  expect(m.rpc).not.toHaveBeenCalled();
  expect(m.sendMail).not.toHaveBeenCalled();
});
it('reserves atomically, rechecks eligibility and attempts SMTP once with valid unsubscribe headers', async () => {
  const m = setup();
  const result = await sendCasePromotion({
    supabase: m.client,
    userId,
    kind: 'pending_case_first',
    sendMail: m.sendMail,
  });
  expect(result.status).toBe('sent');
  expect(m.account).toHaveBeenCalledTimes(2);
  expect(m.sendMail).toHaveBeenCalledTimes(1);
  expect(m.rpc.mock.invocationCallOrder[0]).toBeLessThan(
    m.sendMail.mock.invocationCallOrder[0]
  );
  const mail = m.sendMail.mock.calls[0][0];
  const unsub = new URL(mail.headers['List-Unsubscribe'].slice(1, -1));
  expect(verifyUnsubscribeToken(unsub.searchParams.get('token'), secret)).toBe(
    result.queueId
  );
  expect(mail.text).toContain(unsub.toString());
  expect(mail.html).toContain(unsub.toString());
  expect(m.updates).toContainEqual(expect.objectContaining({ status: 'sent' }));
});
it('does not send on cap/deduplication or reservation failure', async () => {
  const m = setup();
  m.rpc.mockResolvedValueOnce({ data: null, error: null });
  expect(
    (
      await sendCasePromotion({
        supabase: m.client,
        userId,
        kind: 'pending_case_first',
        sendMail: m.sendMail,
      })
    ).status
  ).toBe('skipped');
  m.rpc.mockResolvedValueOnce({ data: null, error: { message: 'private' } });
  await expect(
    sendCasePromotion({
      supabase: m.client,
      userId,
      kind: 'pending_case_first',
      sendMail: m.sendMail,
    })
  ).rejects.toThrow('reservation failed');
  expect(m.sendMail).not.toHaveBeenCalled();
});
it('cancels before SMTP when marketing permission changes after reservation', async () => {
  const m = setup();
  m.rpc.mockImplementationOnce(async () => {
    m.rows.email_preferences = { marketing_emails: false };
    return { data: userId, error: null };
  });
  expect(
    (
      await sendCasePromotion({
        supabase: m.client,
        userId,
        kind: 'pending_case_first',
        sendMail: m.sendMail,
      })
    ).status
  ).toBe('skipped');
  expect(m.updates).toContainEqual({ status: 'cancelled' });
  expect(m.sendMail).not.toHaveBeenCalled();
});
it('holds an ambiguous send without retrying, and reports sent-but-unpersisted outcomes', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const m = setup();
  m.sendMail.mockRejectedValueOnce(
    new Error('SMTP timeout with applicant details')
  );
  expect(
    (
      await sendCasePromotion({
        supabase: m.client,
        userId,
        kind: 'pending_case_first',
        sendMail: m.sendMail,
      })
    ).status
  ).toBe('needs_review');
  expect(m.sendMail).toHaveBeenCalledTimes(1);
  expect(m.updates).toContainEqual(
    expect.objectContaining({ status: 'campaign_unknown' })
  );
  const n = setup(
    {},
    { email_queue: { message: 'private persistence failure' } }
  );
  expect(
    (
      await sendCasePromotion({
        supabase: n.client,
        userId,
        kind: 'pending_case_first',
        sendMail: n.sendMail,
      })
    ).status
  ).toBe('needs_review');
  expect(log).toHaveBeenCalledWith(
    'Case promotion sent result persistence failed'
  );
  log.mockRestore();
});
it('routes checkout recovery through the same cap and puts unsubscribe inside the HTML document', async () => {
  const m = setup();
  await sendCasePromotion({
    supabase: m.client,
    userId,
    kind: 'checkout_recovery',
    recoveryBodies: {
      subject: 'Finish checkout',
      html: '<html><body><p>Checkout</p></body></html>',
      text: 'Checkout',
    },
    sendMail: m.sendMail,
  });
  expect(m.rpc).toHaveBeenCalledWith(
    'reserve_case_promotion',
    expect.objectContaining({ p_kind: 'checkout_recovery' })
  );
  expect(m.sendMail.mock.calls[0][0].html).toMatch(
    /Unsubscribe<\/a>[\s\S]*<\/body>/
  );
});
it('the disabled feature performs no reads, reservations or sends', async () => {
  vi.stubEnv('PENDING_CASE_EMAILS_ENABLED', 'false');
  const m = setup();
  expect(
    (
      await sendCasePromotion({
        supabase: m.client,
        userId,
        kind: 'pending_case_first',
        sendMail: m.sendMail,
      })
    ).status
  ).toBe('skipped');
  expect(m.client.from).not.toHaveBeenCalled();
  expect(m.sendMail).not.toHaveBeenCalled();
});
