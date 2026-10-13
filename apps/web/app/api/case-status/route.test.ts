import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({ premium: false, planError: false }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: async () => 'owner' }));
vi.mock('@/lib/notifications/email-service', () => ({
  sendEnrollmentEmail: vi.fn(),
}));
vi.mock('@/lib/posthog-server', () => ({
  captureServerEvent: vi.fn(),
  normalizePlanTier: () => 'free',
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from() {
      const row = {
        id: 'case',
        user_id: 'owner',
        receipt_number: 'IOE0000000001',
        current_status: 'Approved',
        status_history: [{ status: 'Approved', date: '' }],
        free_visible_status: {
          current_status: 'Received',
          status_history: [{ status: 'Received', date: '' }],
        },
      };
      const q = {
        select: () => q,
        eq: () => q,
        order: () => q,
        maybeSingle: async () => ({
          data: { premium_status: m.premium },
          error: m.planError ? { message: 'private' } : null,
        }),
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve({ data: [row], error: null }).then(resolve),
      };
      return q;
    },
  }),
}));
import { GET } from './route';
beforeEach(() => {
  m.premium = false;
  m.planError = false;
});
it('does not return background-synced data to a free dashboard', async () => {
  const body = await (
    await GET(new NextRequest('https://example.test/api/case-status'))
  ).json();
  expect(body.data.current_status).toBe('Received');
  expect(body.cases[0].status_history[0].status).toBe('Received');
  expect(body.data.free_visible_status).toBeUndefined();
  expect(body.isPremium).toBe(false);
});
it('returns the current sync to an active premium dashboard', async () => {
  m.premium = true;
  const body = await (
    await GET(new NextRequest('https://example.test/api/case-status'))
  ).json();
  expect(body.data.current_status).toBe('Approved');
  expect(body.isPremium).toBe(true);
});
it('does not leak the current sync when plan verification fails', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  m.planError = true;
  const response = await GET(
    new NextRequest('https://example.test/api/case-status')
  );
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain('Approved');
});
