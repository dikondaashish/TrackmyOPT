// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({
  capture: vi.fn(),
  flush: vi.fn(),
  allowance: vi.fn(),
  fingerprint: vi.fn(),
}));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  flush: m.flush,
  withScope: (fn: (scope: unknown) => void) =>
    fn({ setFingerprint: m.fingerprint, setTag: vi.fn() }),
}));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByUser: m.allowance,
  rateLimitResponse: () => new Response(null, { status: 429 }),
}));
import { POST } from './route';
const call = (kind: string, key = 'synthetic-test-key', body?: string) =>
  POST(
    new NextRequest(
      `https://www.trackmyopt.com/api/internal/job-board-worker-failure/${kind}`,
      { method: 'POST', headers: { 'x-api-key': key }, body }
    ),
    { params: Promise.resolve({ kind }) }
  );
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('API_SECRET_KEY', 'synthetic-test-key');
  m.allowance.mockResolvedValue({ success: true });
  m.flush.mockResolvedValue(true);
});
afterEach(() => vi.unstubAllEnvs());

it('rejects unauthenticated signals before recording anything', async () => {
  expect((await call('queue-error', 'wrong')).status).toBe(401);
  expect(m.capture).not.toHaveBeenCalled();
  expect(m.allowance).not.toHaveBeenCalled();
});

it('rejects unknown kinds and any caller-supplied body', async () => {
  expect((await call('anything-else')).status).toBe(400);
  expect((await call('queue-error', undefined, '{"source":"x"}')).status).toBe(400);
  expect(m.capture).not.toHaveBeenCalled();
});

it.each([
  ['queue-error', 'Render job-board worker: Bull/Redis queue error'],
  ['source-stalled', 'Render job-board worker: ingestion source job stalled'],
  ['redis-eviction', 'Render job-board worker: Redis maxmemory-policy is not noeviction'],
])('records only the fixed %s message as its own issue', async (kind, message) => {
  expect((await call(kind)).status).toBe(200);
  expect(m.capture).toHaveBeenCalledWith(message, 'error');
  expect(m.fingerprint).toHaveBeenCalledWith(['job-board-worker', kind]);
  expect(m.flush).toHaveBeenCalled();
});

it('honours the per-kind rate limit', async () => {
  m.allowance.mockResolvedValue({ success: false });
  expect((await call('source-stalled')).status).toBe(429);
  expect(m.capture).not.toHaveBeenCalled();
});
