import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  plan: vi.fn(),
  estimate: vi.fn(),
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: m.auth }));
vi.mock('@/lib/premium/user-plan-tier', () => ({
  getActiveUserPlanTier: m.plan,
}));
vi.mock('@/lib/community-opt/get-estimate', () => ({
  getCommunityEstimate: m.estimate,
}));
import { GET } from './route';
const request = () =>
  new NextRequest(
    'https://example.test/api/case-status/community-estimate?receipt_prefix=IOE'
  );
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue('owner');
  m.plan.mockResolvedValue('pro');
  m.estimate.mockResolvedValue({ prediction: null, stages: null, heatmap: [] });
});
it('requires authentication before reading plans or metrics', async () => {
  m.auth.mockResolvedValue(null);
  expect((await GET(request())).status).toBe(401);
  expect(m.plan).not.toHaveBeenCalled();
  expect(m.estimate).not.toHaveBeenCalled();
});
it('does not calculate or return metrics for a free or expired subscription', async () => {
  m.plan.mockResolvedValue('free');
  const response = await GET(request());
  expect(response.status).toBe(403);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(m.estimate).not.toHaveBeenCalled();
});
it('returns current premium metrics without shared caching', async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect((await response.json()).planTier).toBe('pro');
  expect(m.estimate).toHaveBeenCalledTimes(1);
});
