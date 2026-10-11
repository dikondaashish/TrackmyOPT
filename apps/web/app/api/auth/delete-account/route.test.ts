import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  user: { id: 'synthetic-owner', email: 'owner@example.test' },
  cleanup: vi.fn(), deleteUser: vi.fn(), signOut: vi.fn(), captureMessage: vi.fn(),
  billingError: null as unknown, customer: null as string | null,
}));
vi.mock('@sentry/nextjs', () => ({ captureMessage: m.captureMessage }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: vi.fn(), set: vi.fn() }) }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth: {
  getUser: async () => ({ data: { user: m.user }, error: null }), signOut: m.signOut,
} }) }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({
  auth: { admin: { deleteUser: m.deleteUser } },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({
    data: { stripe_customer_id: m.customer }, error: m.billingError,
  }) }) }) }),
}) }));
vi.mock('@/lib/privacy/delete-account-data', () => ({ deleteAccountData: m.cleanup }));
import { DELETE } from './route';

beforeEach(() => {
  vi.clearAllMocks(); m.billingError = null; m.customer = null;
  m.cleanup.mockResolvedValue(undefined);
  m.deleteUser.mockResolvedValue({ error: null });
  m.signOut.mockResolvedValue({ error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
describe('account deletion outcome', () => {
  it('hard-deletes Auth only after cleanup succeeds', async () => {
    expect((await DELETE()).status).toBe(200);
    expect(m.cleanup).toHaveBeenCalledWith(expect.anything(), m.user.id, m.user.email);
    expect(m.deleteUser).toHaveBeenCalledWith(m.user.id);
    expect(m.cleanup.mock.invocationCallOrder[0]).toBeLessThan(m.deleteUser.mock.invocationCallOrder[0]);
  });
  it('returns a monitored failure instead of false success on partial cleanup', async () => {
    m.cleanup.mockRejectedValue(new Error('private receipt IOE0000000001'));
    expect((await DELETE()).status).toBe(500);
    expect(m.deleteUser).not.toHaveBeenCalled();
    expect(m.signOut).not.toHaveBeenCalled();
    expect(m.captureMessage).toHaveBeenCalledWith('DELETE /api/auth/delete-account returned HTTP 500', 'error');
    expect(JSON.stringify(m.captureMessage.mock.calls)).not.toContain('IOE');
  });
  it('stops before deleting data if billing lookup fails', async () => {
    m.billingError = { message: 'private' };
    expect((await DELETE()).status).toBe(500);
    expect(m.cleanup).not.toHaveBeenCalled();
    expect(m.deleteUser).not.toHaveBeenCalled();
  });
  it('reports an Auth failure without claiming the account is deleted', async () => {
    m.deleteUser.mockResolvedValue({ error: { message: 'private' } });
    expect((await DELETE()).status).toBe(500);
    expect(m.signOut).not.toHaveBeenCalled();
  });
});
