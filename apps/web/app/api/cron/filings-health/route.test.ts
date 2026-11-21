import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  oracleHealth: vi.fn(),
  report: vi.fn(),
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@/lib/career/h1b/filings-store', () => ({
  checkOracleFilingsHealth: m.oracleHealth,
  reportOracleFilingsFailure: m.report,
}));

import { GET } from './route';

const request = () =>
  new NextRequest('https://example.test/api/cron/filings-health');

beforeEach(() => {
  vi.clearAllMocks();
  m.oracleHealth.mockResolvedValue({ ok: true, rowsChecked: 1, durationMs: 4 });
});

it('returns 200 when the Oracle probe succeeds', async () => {
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    ok: true,
    oracle: { ok: true, rowsChecked: 1 },
  });
  expect(m.report).not.toHaveBeenCalled();
});

it('returns 503 and reports when the Oracle probe throws', async () => {
  m.oracleHealth.mockRejectedValue(new Error('down'));
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(m.report).toHaveBeenCalledWith('health');
});

it('returns 503 and reports when the Oracle probe is not ok', async () => {
  m.oracleHealth.mockResolvedValue({ ok: false });
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(m.report).toHaveBeenCalledWith('health');
});
