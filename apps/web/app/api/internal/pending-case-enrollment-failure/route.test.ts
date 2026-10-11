// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({
  capture: vi.fn(),
  flush: vi.fn(),
  allowance: vi.fn(),
}));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  flush: m.flush,
}));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByUser: m.allowance,
  rateLimitResponse: () => new Response(null, { status: 429 }),
}));
import { POST } from './route';
const request = (secret = 'synthetic-test-secret', body?: string) =>
  new NextRequest(
    'https://www.trackmyopt.com/api/internal/pending-case-enrollment-failure',
    { method: 'POST', headers: { Authorization: `Bearer ${secret}` }, body }
  );
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('CRON_SECRET', 'synthetic-test-secret');
  m.allowance.mockResolvedValue({ success: true });
  m.flush.mockResolvedValue(true);
});
afterEach(() => vi.unstubAllEnvs());
it('rejects unauthenticated signals before recording anything', async () => {
  expect((await POST(request('wrong'))).status).toBe(401);
  expect(m.capture).not.toHaveBeenCalled();
  expect(m.allowance).not.toHaveBeenCalled();
});
it('rejects caller-supplied diagnostic data without reading or forwarding it', async () => {
  expect(
    (await POST(request(undefined, '{"case":"IOE0000000001"}'))).status
  ).toBe(400);
  expect(m.capture).not.toHaveBeenCalled();
  expect(m.allowance).not.toHaveBeenCalled();
});
it('records only the static worker failure and flushes before acknowledging', async () => {
  expect((await POST(request())).status).toBe(200);
  expect(m.capture).toHaveBeenCalledWith(
    'Render pending case email enrollment failed',
    'error'
  );
  expect(m.flush).toHaveBeenCalledWith(2_000);
  expect(JSON.stringify(m.capture.mock.calls)).not.toContain(
    'synthetic-test-secret'
  );
});
it('accepts an empty HTTP body stream from the Render fetch transport', async () => {
  const streamed = request(undefined, '');
  expect(streamed.body).not.toBeNull();
  expect((await POST(streamed)).status).toBe(200);
  expect(m.capture).toHaveBeenCalledWith('Render pending case email enrollment failed', 'error');
});
it('limits repeated authenticated reports before sending to Sentry', async () => {
  m.allowance.mockResolvedValue({ success: false });
  expect((await POST(request())).status).toBe(429);
  expect(m.capture).not.toHaveBeenCalled();
  expect(m.flush).not.toHaveBeenCalled();
});
it('does not acknowledge a reporting timeout as success', async () => {
  m.flush.mockResolvedValue(false);
  expect((await POST(request())).status).toBe(503);
});
