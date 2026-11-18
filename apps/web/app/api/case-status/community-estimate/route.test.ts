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
it('gives a free or expired subscription the headline wait and nothing that places the case', async () => {
  m.plan.mockResolvedValue('free');
  m.estimate.mockResolvedValue({
    prediction: {
      medianDays: 96,
      cohortSize: 412,
      caseKind: 'initial_opt',
      premiumProcessing: false,
      matchLevel: 'case_kind',
      sourceNote: 'Community reports',
      p25Days: 80,
      p75Days: 120,
    },
    stages: {
      biometrics: { stage: 'biometrics', medianDays: 23, p25Days: 16, p75Days: 28, sampleSize: 900 },
      cardProduced: null,
      cardDelivered: null,
      sourceNote: 'Community reports',
    },
    heatmap: [{ month: '2026-04', buckets: [1, 2, 3, 4, 5, 6] }],
    weeklyTrend: [{ week: '2026-04-06' }],
    histogram: { bins: [1] },
    similarFiling: { medianDays: 99 },
    evidence: { included: 1 },
    premiumUpgrade: { sampleSize: 3 },
  });
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  const body = await response.json();
  expect(body).toEqual({
    ok: true,
    planTier: 'free',
    evidence: null,
    premiumUpgrade: null,
    summary: {
      medianDays: 96,
      cohortSize: 412,
      caseKind: 'initial_opt',
      premiumProcessing: false,
      matchLevel: 'case_kind',
      sourceNote: 'Community reports',
    },
    prediction: null,
    heatmap: [],
    weeklyTrend: [],
    histogram: null,
    similarFiling: null,
    stages: {
      biometrics: { stage: 'biometrics', medianDays: 23 },
      cardProduced: null,
      cardDelivered: null,
      sourceNote: 'Community reports',
    },
  });
  expect(JSON.stringify(body)).not.toMatch(/p25|p75|sampleSize/);
});
it('returns current premium metrics without shared caching', async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect((await response.json()).planTier).toBe('pro');
  expect(m.estimate).toHaveBeenCalledTimes(1);
});
