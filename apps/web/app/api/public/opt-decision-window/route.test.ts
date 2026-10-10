import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  checkRateLimitByIP: vi.fn(),
  getCommunityEstimate: vi.fn(),
}));

vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByIP: mocks.checkRateLimitByIP,
  rateLimitResponse: (result: { retryAfter?: number }) =>
    Response.json(
      { ok: false, error: 'rate limited' },
      { status: 429, headers: { 'Retry-After': String(result.retryAfter || 60) } }
    ),
}));

vi.mock('@/lib/community-opt/get-estimate', () => ({
  getCommunityEstimate: mocks.getCommunityEstimate,
}));

import { GET } from './route';

afterEach(() => vi.useRealTimers());

function req(query: string) {
  return new NextRequest(
    `http://localhost/api/public/opt-decision-window?${query}`
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
  vi.clearAllMocks();
  mocks.checkRateLimitByIP.mockResolvedValue({
    success: true,
    limit: 20,
    remaining: 19,
    reset: Math.floor(Date.now() / 1000) + 3600,
  });
});

describe('GET /api/public/opt-decision-window', () => {
  it('rejects missing received date', async () => {
    const res = await GET(req('case_kind=initial_opt'));
    expect(res.status).toBe(400);
    expect(mocks.getCommunityEstimate).not.toHaveBeenCalled();
  });

  it('returns a public decision-window summary', async () => {
    mocks.getCommunityEstimate.mockResolvedValue({
      prediction: {
        medianDays: 90,
        p25Days: 70,
        p75Days: 110,
        cohortSize: 40,
        caseKind: 'initial_opt',
        matchLevel: 'kind',
        sourceNote: 'Community reports',
      },
    });

    const res = await GET(
      req('received=2026-01-15&case_kind=initial_opt&receipt_prefix=IOE')
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.estimate.medianDays).toBe(90);
    expect(body.estimate.p25Days).toBe(70);
    expect(body.estimate.p75Days).toBe(110);
    expect(body.daysSinceFiled).toBeGreaterThan(0);
    expect(mocks.getCommunityEstimate).toHaveBeenCalledWith(
      expect.objectContaining({
        receiptPrefix: 'IOE',
        receivedDate: '2026-01-15',
      })
    );
  });
});
