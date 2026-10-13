import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({
  user: '10000000-0000-0000-0000-000000000001' as string | null,
  rpc: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: async () => m.user }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc: m.rpc }),
}));
import { POST } from './route';
const caseId = '00000000-0000-0000-0000-000000000002';
const request = () =>
  new NextRequest('https://example.test/api/case-status/refresh', {
    method: 'POST',
    body: JSON.stringify({ case_id: caseId }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  m.user = '10000000-0000-0000-0000-000000000001';
  vi.stubGlobal('fetch', m.fetch);
});
afterEach(() => vi.unstubAllGlobals());
it('returns the first stored free result without a provider call', async () => {
  m.rpc.mockResolvedValue({ data: { source: 'database' } });
  expect(await (await POST(request())).json()).toEqual({
    ok: true,
    source: 'database',
  });
  expect(m.fetch).not.toHaveBeenCalled();
  expect(m.rpc).toHaveBeenCalledWith('prepare_case_refresh', {
    p_case_id: caseId,
    p_user_id: m.user,
  });
});
it('uses USCIS for the durable next-click action and awaits successful persistence', async () => {
  m.rpc.mockResolvedValue({
    data: { source: 'uscis', receipt_number: 'IOE0000000001' },
  });
  m.fetch.mockResolvedValue(Response.json({ ok: true }));
  expect(await (await POST(request())).json()).toEqual({
    ok: true,
    source: 'uscis',
  });
  expect(m.fetch).toHaveBeenCalledTimes(1);
});
it('never falls back to another case when a requested case is foreign or removed', async () => {
  m.rpc.mockResolvedValue({ data: { source: 'missing' } });
  expect((await POST(request())).status).toBe(404);
  expect(m.fetch).not.toHaveBeenCalled();
});
it('does not consume an allowance for an unauthenticated caller', async () => {
  m.user = null;
  expect((await POST(request())).status).toBe(401);
  expect(m.rpc).not.toHaveBeenCalled();
  expect(m.fetch).not.toHaveBeenCalled();
});
it('keeps throttling separate from unexpected errors', async () => {
  m.rpc.mockResolvedValue({ data: { source: 'cooldown', retry_after: 299 } });
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBe('299');
  expect(m.fetch).not.toHaveBeenCalled();
});
it('fails closed when the atomic refresh preparation is unavailable', async () => {
  m.rpc.mockResolvedValue({ error: { message: 'private' } });
  await expect(POST(request())).rejects.toThrow(
    'Manual case refresh preparation failed'
  );
  expect(m.fetch).not.toHaveBeenCalled();
});
it('does not report success for a failed check inside HTTP 200', async () => {
  m.rpc.mockResolvedValue({
    data: { source: 'uscis', receipt_number: 'IOE0000000001' },
  });
  m.fetch.mockResolvedValue(Response.json({ ok: false }));
  expect((await POST(request())).status).toBe(400);
});
