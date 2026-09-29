// @vitest-environment node
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { POST as login } from './route';
import { POST as logout } from '../logout/route';
import { GET as setup } from '../../../admin/setup/route';
const m = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
  ip: vi.fn(),
  account: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: m.signIn,
      signOut: m.signOut,
      verifyOtp: m.verifyOtp,
    },
  }),
}));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  AUTH_RATE_LIMIT: { limit: 5, windowSeconds: 900 },
  checkRateLimitByIP: m.ip,
  checkRateLimitByAccount: m.account,
  rateLimitResponse: (r: { unavailable?: boolean }) =>
    NextResponse.json(
      { error: 'Try again later' },
      { status: r.unavailable ? 503 : 429 }
    ),
}));
const user = {
  email_confirmed_at: '2026-09-29',
  app_metadata: { email_campaign_admin: true },
};
function request(
  path: string,
  origin = 'https://www.trackmyopt.com',
  body: object = {
    email: 'admin@example.invalid',
    password: 'test-only-password',
  }
) {
  return new NextRequest(`https://www.trackmyopt.com${path}`, {
    method: 'POST',
    headers: { origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  m.ip.mockResolvedValue({ success: true });
  m.account.mockResolvedValue({ success: true });
  m.signIn.mockResolvedValue({ data: { user, session: {} }, error: null });
  m.signOut.mockResolvedValue({ error: null });
  m.verifyOtp.mockResolvedValue({ data: { user, session: {} }, error: null });
});
it('authenticates an approved account and returns no credentials or tokens', async () => {
  const result = await login(request('/api/admin/login'));
  expect(await result.json()).toEqual({ success: true });
  expect(result.headers.get('cache-control')).toContain('no-store');
  expect(m.signIn).toHaveBeenCalledWith({
    email: 'admin@example.invalid',
    password: 'test-only-password',
  });
});
it('uses the same denial for wrong passwords and ordinary accounts, clearing ordinary sessions', async () => {
  m.signIn
    .mockResolvedValueOnce({ data: {}, error: {} })
    .mockResolvedValueOnce({
      data: {
        session: {},
        user: {
          ...user,
          app_metadata: {},
          user_metadata: { email_campaign_admin: true },
        },
      },
      error: null,
    });
  const wrong = await login(request('/api/admin/login'));
  const unapproved = await login(request('/api/admin/login'));
  expect(wrong.status).toBe(401);
  expect(unapproved.status).toBe(401);
  expect(await wrong.json()).toEqual(await unapproved.json());
  expect(m.signOut).toHaveBeenCalledWith({ scope: 'local' });
});
it('blocks cross-origin login and logout without creating sessions', async () => {
  expect(
    (await login(request('/api/admin/login', 'https://evil.test'))).status
  ).toBe(403);
  expect(
    (await logout(request('/api/admin/logout', 'https://evil.test'))).status
  ).toBe(403);
  expect(m.signIn).not.toHaveBeenCalled();
  expect(m.signOut).not.toHaveBeenCalled();
});
it.each([false, true])(
  'stops authentication when rate protection denies (unavailable=%s)',
  async (unavailable) => {
    m.ip.mockResolvedValue({ success: false, unavailable });
    expect((await login(request('/api/admin/login'))).status).toBe(
      unavailable ? 503 : 429
    );
    expect(m.signIn).not.toHaveBeenCalled();
  }
);
it('checks account throttling and rejects malformed inputs', async () => {
  expect(
    (
      await login(
        request('/api/admin/login', undefined, { email: 'bad', password: '' })
      )
    ).status
  ).toBe(400);
  m.account.mockResolvedValue({ success: false });
  expect((await login(request('/api/admin/login'))).status).toBe(429);
  expect(m.signIn).not.toHaveBeenCalled();
});
it('signs out the current session without revoking other devices', async () => {
  expect((await logout(request('/api/admin/logout'))).status).toBe(200);
  expect(m.signOut).toHaveBeenCalledWith({ scope: 'local' });
});
it('accepts only an approved invitation and strips its token before password entry', async () => {
  const result = await setup(
    new NextRequest(
      'https://www.trackmyopt.com/admin/setup?token_hash=test-only-invite&next=https://evil.test'
    )
  );
  expect(m.verifyOtp).toHaveBeenCalledWith({
    token_hash: 'test-only-invite',
    type: 'invite',
  });
  expect(result.headers.get('location')).toBe(
    'https://www.trackmyopt.com/auth/reset-password'
  );
  expect(result.headers.get('referrer-policy')).toBe('no-referrer');
  m.verifyOtp.mockResolvedValue({
    data: { user: { ...user, app_metadata: {} }, session: {} },
    error: null,
  });
  expect(
    (
      await setup(
        new NextRequest(
          'https://www.trackmyopt.com/admin/setup?token_hash=test-only-invite'
        )
      )
    ).headers.get('location')
  ).toBe('https://www.trackmyopt.com/admin/login?error=setup');
  expect(m.signOut).toHaveBeenCalledWith({ scope: 'local' });
});
