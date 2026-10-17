import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), limit: vi.fn(), maybeSingle: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@/lib/auth/rate-limit', () => ({ default: () => ({ check: mocks.limit }) }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) }) }),
}));
import { GET } from './route';

const config = {
  schemaVersion: 1,
  version: '2026-10-17.1',
  issuedAt: '2026-10-17T00:00:00.000Z',
  expiresAt: '2026-10-24T00:00:00.000Z',
  killSwitches: { platforms: { workday: { disabled: true, reason: 'site_change' } } },
};
const get = (headers: Record<string, string> = {}) =>
  GET(new NextRequest('https://www.trackmyopt.com/api/extension/config', { headers }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('user-1');
  mocks.limit.mockResolvedValue({ isRateLimited: false });
  mocks.maybeSingle.mockResolvedValue({ data: { version: config.version, config }, error: null });
});

it('requires authentication', async () => {
  mocks.auth.mockResolvedValueOnce(null);
  expect((await get()).status).toBe(401);
});

it('serves the active config with an ETag and honours If-None-Match', async () => {
  const first = await get();
  expect(first.status).toBe(200);
  const etag = first.headers.get('etag')!;
  expect(etag).toMatch(/^"[a-f0-9]{32}"$/);
  expect(await first.json()).toEqual({ config });
  expect(first.headers.get('cache-control')).toBe('private, no-cache');
  const second = await get({ 'If-None-Match': etag });
  expect(second.status).toBe(304);
  expect((await get({ 'If-None-Match': '"other"' })).status).toBe(200);
});

it('returns 204 when no config is active or the table is not migrated yet', async () => {
  mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
  expect((await get()).status).toBe(204);
  mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST205' } });
  expect((await get()).status).toBe(204);
});

it('never serves a stored row that fails the bundled schema', async () => {
  mocks.maybeSingle.mockResolvedValueOnce({ data: { version: config.version, config: { ...config, script: 'x' } }, error: null });
  expect((await get()).status).toBe(500);
  mocks.maybeSingle.mockResolvedValueOnce({ data: { version: '2026-10-17.9', config }, error: null });
  expect((await get()).status).toBe(500);
});
