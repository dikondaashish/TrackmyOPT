// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
const m = vi.hoisted(() => ({ auth: vi.fn(), admin: vi.fn(), limit: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: m.auth }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: m.admin }));
vi.mock('@/lib/auth/api-rate-limit', async (original) => ({
  ...(await original<object>()),
  checkRateLimitByUser: m.limit,
}));
function setup(results: object[]) {
  const q = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve(results.shift()).then(resolve),
  };
  const db = {
    from: vi.fn().mockReturnValue(q),
    auth: {
      admin: {
        getUserById: vi
          .fn()
          .mockResolvedValue({
            data: { user: { email: 'synthetic@example.invalid' } },
            error: null,
          }),
      },
    },
  };
  m.admin.mockReturnValue(db);
  return { q, db };
}
function request(
  body: unknown = { enabled: true },
  origin = 'https://www.trackmyopt.com'
) {
  return new NextRequest(
    'https://www.trackmyopt.com/api/email/marketing-preferences',
    {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue('owner');
  m.limit.mockResolvedValue({ success: true });
});
afterEach(() => vi.unstubAllEnvs());
it('NULL or missing preferences display off and cannot select another account', async () => {
  const { q } = setup([{ data: null, error: null }]);
  expect(await (await GET(request())).json()).toEqual({ enabled: false });
  expect(q.eq).toHaveBeenCalledWith('user_id', 'owner');
});
it('requires signed-in same-origin explicit boolean choice before any mutation', async () => {
  const { q } = setup([]);
  m.auth.mockResolvedValueOnce(null);
  expect((await POST(request())).status).toBe(401);
  expect(
    (await POST(request({ enabled: true }, 'https://foreign.invalid'))).status
  ).toBe(403);
  for (const body of [
    { enabled: 'true' },
    { enabled: true, userId: 'someone-else' },
    {},
  ])
    expect((await POST(request(body))).status).toBe(400);
  expect(q.update).not.toHaveBeenCalled();
  expect(q.insert).not.toHaveBeenCalled();
});
it('updates only marketing preference, preserving case and reminder settings', async () => {
  const { q } = setup([{ data: [{ user_id: 'owner' }], error: null }]);
  expect((await POST(request({ enabled: false }))).status).toBe(200);
  expect(q.update).toHaveBeenCalledExactlyOnceWith({ marketing_emails: false });
  expect(q.eq).toHaveBeenCalledWith('user_id', 'owner');
  expect(q.insert).not.toHaveBeenCalled();
});
it('creates an explicitly chosen preference at the current account email, safely handling races', async () => {
  const { q } = setup([
    { data: [], error: null },
    { error: { code: '23505' } },
    { data: [{ user_id: 'owner' }], error: null },
  ]);
  expect((await POST(request())).status).toBe(200);
  expect(q.insert).toHaveBeenCalledWith({
    user_id: 'owner',
    email_address: 'synthetic@example.invalid',
    marketing_emails: true,
  });
  expect(q.update).toHaveBeenCalledTimes(2);
});
it('does not claim success after database, account or limiter failure', async () => {
  setup([{ error: { message: 'private' } }]);
  const res = await POST(request());
  expect(res.status).toBe(503);
  expect(await res.text()).not.toContain('private');
  const { q, db } = setup([]);
  m.limit.mockResolvedValueOnce({
    success: false,
    unavailable: true,
    retryAfter: 60,
  });
  expect((await POST(request())).status).toBe(503);
  expect(q.update).not.toHaveBeenCalled();
  setup([{ data: [], error: null }]);
  vi.mocked(m.admin().auth.admin.getUserById).mockResolvedValueOnce({
    data: { user: null },
    error: { status: 404 },
  });
  expect((await POST(request())).status).toBe(409);
  expect(db.auth.admin.getUserById).not.toHaveBeenCalled();
});
