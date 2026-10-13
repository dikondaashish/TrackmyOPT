import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  plan: vi.fn(),
  forecast: vi.fn(),
  capture: vi.fn(),
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: m.auth }));
vi.mock('@/lib/premium/user-plan-tier', () => ({
  getActiveUserPlanTier: m.plan,
}));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: () => ({}) }));
vi.mock('@/lib/opt-forecast/service', () => ({ getCaseForecast: m.forecast }));
vi.mock('@sentry/nextjs', () => ({ captureMessage: m.capture }));
import { GET } from './route';
const id = '00000000-0000-0000-0000-000000000001';
const request = (caseId = id) =>
  new NextRequest(
    `https://example.test/api/case-status/forecast?case_id=${caseId}`
  );
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue('owner');
  m.plan.mockResolvedValue('pro');
  m.forecast.mockResolvedValue({ state: 'shadow' });
});
it('rejects authentication and malformed IDs before reading case evidence', async () => {
  m.auth.mockResolvedValueOnce(null);
  expect((await GET(request())).status).toBe(401);
  expect((await GET(request('IOE0000000001'))).status).toBe(400);
  expect(m.forecast).not.toHaveBeenCalled();
});
it('gates free/expired users before any forecast read', async () => {
  m.plan.mockResolvedValue('free');
  expect((await GET(request())).status).toBe(403);
  expect(m.forecast).not.toHaveBeenCalled();
  expect(m.capture).not.toHaveBeenCalled();
});
it('requires the exact owner and keeps responses out of shared caches', async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(m.forecast).toHaveBeenCalledWith({}, id, 'owner');
  m.forecast.mockResolvedValue(null);
  expect((await GET(request())).status).toBe(404);
});
it('reports a static Sentry signal on unexpected failures without applicant data', async () => {
  m.forecast.mockRejectedValue(new Error('sensitive applicant detail'));
  const response = await GET(request());
  expect(response.status).toBe(500);
  expect(m.capture).toHaveBeenCalledWith(
    'GET /api/case-status/forecast returned HTTP 500',
    'error'
  );
  expect(await response.text()).not.toContain('sensitive');
});
