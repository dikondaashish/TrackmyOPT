import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({ sync: vi.fn(), fetch: vi.fn() }));
vi.mock('@/app/api/case-status/check/route', () => ({ POST: m.sync }));
import { POST } from './route';
const request = (key = 'synthetic-key') =>
  new NextRequest('https://example.test/api/internal/uscis-status', {
    method: 'POST',
    headers: { 'x-api-key': key },
    body: JSON.stringify({
      userId: '10000000-0000-0000-0000-000000000001',
      receiptNumber: 'IOE0000000001',
    }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('API_SECRET_KEY', 'synthetic-key');
  vi.stubEnv('CRON_SECRET', 'synthetic-cron');
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://worker.example.test');
  vi.stubGlobal('fetch', m.fetch);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it('does not contact the worker or provider for an unauthenticated request', async () => {
  expect((await POST(request('wrong'))).status).toBe(401);
  expect(m.fetch).not.toHaveBeenCalled();
  expect(m.sync).not.toHaveBeenCalled();
});
it('uses the complete persistence flow with an explicit daily trigger', async () => {
  m.fetch.mockResolvedValue(new Response(null, { status: 200 }));
  m.sync.mockResolvedValue(
    Response.json({ ok: true, data: { status: 'Approved' } })
  );
  expect((await POST(request())).status).toBe(200);
  const delegated = m.sync.mock.calls[0][0] as NextRequest;
  expect(delegated.headers.get('X-Check-Trigger')).toBe('daily');
  expect(delegated.headers.get('X-Force-Refresh')).toBe('true');
  expect(delegated.headers.get('X-Internal-Secret')).toBe('synthetic-cron');
});
it('does not spend USCIS requests when the worker is unavailable', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  m.fetch.mockResolvedValue(new Response(null, { status: 503 }));
  expect((await POST(request())).status).toBe(503);
  expect(m.sync).not.toHaveBeenCalled();
});
