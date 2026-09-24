import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
const m = vi.hoisted(() => ({ auth: vi.fn(), create: vi.fn(), tier: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: m.auth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: m.create }));
vi.mock('@/lib/premium/user-plan-tier', () => ({
  getActiveUserPlanTier: m.tier,
}));
const req = (body: unknown) =>
  new NextRequest('https://example.test/api/case-status/digest-preferences', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue('owner');
  m.tier.mockResolvedValue('pro');
});
it.each([GET, PATCH])('requires authentication', async (fn) => {
  m.auth.mockResolvedValue(null);
  expect((await fn(req({ enabled: true }))).status).toBe(401);
  expect(m.create).not.toHaveBeenCalled();
});
it('rejects owner spoofing', async () => {
  expect((await PATCH(req({ enabled: true, user_id: 'other' }))).status).toBe(
    400
  );
});
it('lets a downgraded user opt out and persists only the authenticated owner', async () => {
  m.tier.mockResolvedValue('free');
  const upsert = vi.fn().mockResolvedValue({ error: null });
  m.create.mockReturnValue({ from: () => ({ upsert }) });
  expect((await PATCH(req({ enabled: false }))).status).toBe(200);
  expect(upsert).toHaveBeenCalledWith(
    expect.objectContaining({ user_id: 'owner', enabled: false }),
    expect.anything()
  );
});
it('does not enable free users', async () => {
  m.tier.mockResolvedValue('free');
  m.create.mockReturnValue({});
  expect((await PATCH(req({ enabled: true }))).status).toBe(403);
});
