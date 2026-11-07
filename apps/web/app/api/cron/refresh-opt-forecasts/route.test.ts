import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  refresh: vi.fn(),
  capture: vi.fn(),
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: m.auth }));
vi.mock('@/lib/opt-forecast/service', async (importOriginal) => ({
  forecastFailureMessage: (await importOriginal<typeof import('@/lib/opt-forecast/service')>())
    .forecastFailureMessage,
  refreshForecasts: m.refresh,
}));
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
it('logs the static failing stage, never a raw error message', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  m.refresh.mockRejectedValue(new Error('OPT forecast membership write failed'));
  expect((await GET(request())).status).toBe(500);
  expect(errorSpy).toHaveBeenCalledWith('OPT forecast membership write failed');
  m.refresh.mockRejectedValue(new TypeError('private DB response'));
  await GET(request());
  expect(errorSpy).toHaveBeenLastCalledWith('OPT forecast refresh failed (TypeError)');
  expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('private');
  errorSpy.mockRestore();
});
