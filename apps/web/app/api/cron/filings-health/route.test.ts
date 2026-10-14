import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  oracleHealth: vi.fn(),
  report: vi.fn(),
  limit: vi.fn(),
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@/lib/career/h1b/filings-store', async () => {
  const actual = await vi.importActual<
    typeof import('@/lib/career/h1b/filings-store')
  >('@/lib/career/h1b/filings-store');
  return {
    ...actual,
    checkOracleFilingsHealth: m.oracleHealth,
    reportOracleFilingsFailure: m.report,
  };
});
vi.mock('@/lib/supabase/filings', () => ({
  getSupabaseFilingsClient: () => ({
    from: () => ({ select: () => ({ limit: m.limit }) }),
  }),
}));

import { GET } from './route';

const request = () =>
  new NextRequest('https://example.test/api/cron/filings-health');

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('SUPABASE_FILINGS_URL', 'https://filings.example.test');
  vi.stubEnv('SUPABASE_FILINGS_SERVICE_ROLE_KEY', 'synthetic');
  m.limit.mockResolvedValue({ data: [{ id: 'a' }], error: null });
  m.oracleHealth.mockResolvedValue({ ok: true, rowsChecked: 1, durationMs: 4 });
});
afterEach(() => vi.unstubAllEnvs());

it('probes only Supabase while Oracle is not selected', async () => {
  vi.stubEnv('H1B_FILINGS_STORE', '');
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    ok: true,
    primary: 'supabase',
  });
  expect(m.oracleHealth).not.toHaveBeenCalled();
});

it('probes Oracle and the still-configured Supabase project', async () => {
  vi.stubEnv('H1B_FILINGS_STORE', 'oracle');
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    ok: true,
    primary: 'oracle',
    oracle: { ok: true, rowsChecked: 1 },
    supabase: { rowsChecked: 1 },
  });
});

it('returns 503 and reports when the Oracle probe fails', async () => {
  vi.stubEnv('H1B_FILINGS_STORE', 'oracle');
  m.oracleHealth.mockRejectedValue(new Error('down'));
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(m.report).toHaveBeenCalledWith('health', false);
});

it('returns 503 when the configured Supabase project fails', async () => {
  vi.stubEnv('H1B_FILINGS_STORE', 'oracle');
  m.limit.mockResolvedValue({ data: null, error: { message: 'paused' } });
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(m.report).not.toHaveBeenCalled();
});

it('runs Oracle-only once the Supabase project is retired', async () => {
  vi.stubEnv('H1B_FILINGS_STORE', 'oracle');
  vi.stubEnv('SUPABASE_FILINGS_SERVICE_ROLE_KEY', '');
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(m.limit).not.toHaveBeenCalled();
});
