import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({ count: vi.fn(), fetch: vi.fn(), or: vi.fn() }));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@/lib/case-status/worker-observability', () => ({
  observeCaseWorker: (_worker: unknown, _req: unknown, run: () => unknown) =>
    run(),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => {
      const q = {
        select: () => q,
        gte: () => q,
        lt: () => q,
        in: () => q,
        or: m.or,
      };
      return q;
    },
  }),
}));
import { GET } from './route';
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://worker.example.test');
  vi.stubEnv('API_SECRET_KEY', 'synthetic-key');
  vi.stubGlobal('fetch', m.fetch);
  m.or.mockResolvedValue({ count: 0, error: null });
  m.fetch.mockResolvedValue(Response.json({ count: 3, queued: 5 }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it('reports actual dispatch and excludes expected failed provider outcomes from issue counts', async () => {
  const response = await GET(
    new NextRequest('https://example.test/api/cron/check-case-status')
  );
  expect(await response.json()).toMatchObject({
    ok: true,
    eligible: 3,
    queued: 5,
  });
  expect(m.or).toHaveBeenCalledWith(
    'state.neq.failed,error_code.is.null,error_code.not.in.(USCIS_RATE_LIMITED,USCIS_CASE_UNAVAILABLE,USCIS_INVALID_RECEIPT)'
  );
});
it('does not query health or queue work during a dry run', async () => {
  const response = await GET(
    new NextRequest('https://example.test/api/cron/check-case-status?dry_run=1')
  );
  expect(await response.json()).toMatchObject({
    ok: true,
    dryRun: true,
    queued: 0,
  });
  expect(m.or).not.toHaveBeenCalled();
  expect(m.fetch.mock.calls[0][0]).toContain('?dry_run=1');
});
