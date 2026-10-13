import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  refresh: vi.fn(),
  capture: vi.fn(),
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: m.auth }));
vi.mock('@/lib/opt-forecast/service', () => ({ refreshForecasts: m.refresh }));
vi.mock('@sentry/nextjs', () => ({ captureMessage: m.capture }));
import { GET } from './route';
const request = () =>
  new NextRequest('https://example.test/api/cron/refresh-opt-forecasts');
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockReturnValue(null);
});
it('rejects unauthorized refresh without doing any work', async () => {
  m.auth.mockReturnValue(NextResponse.json({}, { status: 401 }));
  expect((await GET(request())).status).toBe(401);
  expect(m.refresh).not.toHaveBeenCalled();
});
it('returns expected review and waiting states without misreporting an outage', async () => {
  m.refresh.mockResolvedValue({ ok: true, state: 'review_required' });
  expect((await GET(request())).status).toBe(200);
  expect(m.capture).not.toHaveBeenCalled();
});
it('reports static cron failures', async () => {
  m.refresh.mockRejectedValue(new Error('private DB response'));
  expect((await GET(request())).status).toBe(500);
  expect(m.capture).toHaveBeenCalledWith(
    'GET /api/cron/refresh-opt-forecasts returned HTTP 500',
    'error'
  );
});
