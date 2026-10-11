// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createMonitoringToken } from '@/lib/notifications/pending-case-email';
import { POST } from './route';
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  admin: vi.fn(),
  recipient: vi.fn(),
  event: vi.fn(),
  limiter: vi.fn(),
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: m.auth }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: m.admin }));
vi.mock('@/lib/posthog-server', () => ({ captureServerEvent: m.event }));
vi.mock('@/lib/auth/api-rate-limit', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  checkRateLimitByUser: m.limiter,
}));
vi.mock('@/lib/notifications/pending-case-email', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  loadCasePromotionRecipient: m.recipient,
}));
const id = '00000000-0000-4000-8000-000000000001',
  userId = 'owner-id',
  secret = 'synthetic-signing-secret';
function request(
  token = createMonitoringToken(id, secret),
  headers: Record<string, string> = {}
) {
  return new NextRequest(
    'https://www.trackmyopt.com/api/premium/monitoring-engagement',
    {
      method: 'POST',
      headers: {
        origin: 'https://www.trackmyopt.com',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ token }),
    }
  );
}
function setup(data: unknown = { id }, error: unknown = null) {
  const q = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  };
  const db = {
    from: vi.fn().mockReturnValue(q),
    rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
  };
  m.admin.mockReturnValue(db);
  return { db, q };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('PENDING_CASE_EMAILS_ENABLED', 'true');
  vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', secret);
  m.auth.mockResolvedValue(userId);
  m.recipient.mockResolvedValue({ email: 'synthetic@example.invalid' });
  m.limiter.mockResolvedValue({ success: true });
});
afterEach(() => vi.unstubAllEnvs());
it('requires authentication and same-origin deliberate browser activity before private reads', async () => {
  setup();
  m.auth.mockResolvedValueOnce(null);
  expect((await POST(request())).status).toBe(401);
  expect(
    (await POST(request(undefined, { origin: 'https://attacker.invalid' })))
      .status
  ).toBe(403);
  expect(
    (await POST(request(undefined, { 'user-agent': 'Proofpoint scanner' })))
      .status
  ).toBe(403);
  expect(m.admin).not.toHaveBeenCalled();
  expect(m.recipient).not.toHaveBeenCalled();
});
it('rejects forged and expired capabilities without privileged reads', async () => {
  setup();
  for (const token of [
    'forged',
    createMonitoringToken(id, secret, Date.now() - 15 * 24 * 3600_000),
  ])
    expect((await POST(request(token))).status).toBe(400);
  expect(m.admin).not.toHaveBeenCalled();
});
it('verifies exact signed message ownership before billing reads or engagement', async () => {
  const { db, q } = setup(null);
  expect((await POST(request())).status).toBe(409);
  expect(q.eq).toHaveBeenCalledWith('id', id);
  expect(q.eq).toHaveBeenCalledWith('user_id', userId);
  expect(q.eq).toHaveBeenCalledWith('status', 'sent');
  expect(m.recipient).not.toHaveBeenCalled();
  expect(m.limiter).not.toHaveBeenCalled();
  expect(db.rpc).not.toHaveBeenCalled();
});
it('stops if pending, paid, deletion or marketing eligibility changed', async () => {
  const { db } = setup();
  m.recipient.mockResolvedValue(null);
  expect((await POST(request())).status).toBe(409);
  expect(db.rpc).not.toHaveBeenCalled();
  expect(m.event).not.toHaveBeenCalled();
});
it('records only an eligible signed-in visit and emits one low-cardinality event', async () => {
  const { db } = setup();
  expect((await POST(request())).status).toBe(200);
  expect(db.rpc).toHaveBeenCalledWith('engage_pending_case_offer', {
    p_user_id: userId,
    p_message_id: id,
  });
  expect(m.event).toHaveBeenCalledWith(userId, 'pending_case_offer_engaged', {
    experiment: 'pending_case_v1',
    source: 'pending_case_email',
  });
  db.rpc.mockResolvedValueOnce({ data: false, error: null });
  expect((await POST(request())).status).toBe(200);
  expect(m.event).toHaveBeenCalledTimes(1);
});
it('fails closed on limiter and database outages with no side effect', async () => {
  const { db } = setup();
  m.limiter.mockResolvedValueOnce({
    success: false,
    unavailable: true,
    retryAfter: 60,
  });
  expect((await POST(request())).status).toBe(503);
  expect(db.rpc).not.toHaveBeenCalled();
  expect(m.recipient).not.toHaveBeenCalled();
  db.rpc.mockResolvedValueOnce({ error: { message: 'private detail' } });
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain('private detail');
});
it('disabled experiment and oversized payload never access recipient records', async () => {
  setup();
  vi.stubEnv('PENDING_CASE_EMAILS_ENABLED', 'false');
  expect((await POST(request())).status).toBe(409);
  vi.stubEnv('PENDING_CASE_EMAILS_ENABLED', 'true');
  expect(
    (await POST(request(undefined, { 'content-length': '9000' }))).status
  ).toBe(413);
  expect(m.admin).not.toHaveBeenCalled();
});
