import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  capture: vi.fn(),
  fingerprint: vi.fn(),
  tables: {} as Record<string, { data: unknown[]; error: null | { message: string } }>,
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  withScope: (fn: (scope: unknown) => void) =>
    fn({ setFingerprint: m.fingerprint, setTag: vi.fn() }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({
    from: (table: string) => {
      const query = {
        select: () => query,
        like: () => query,
        gte: () => query,
        order: () => query,
        limit: () => Promise.resolve(m.tables[table]),
        // Like PostgREST: at most 1,000 rows per range.
        range: (from: number, to: number) =>
          Promise.resolve({
            ...m.tables[table],
            data: m.tables[table].data.slice(from, Math.min(to + 1, from + 1_000)),
          }),
      };
      return query;
    },
  }),
}));

import { GET } from './route';

const request = () =>
  new NextRequest('https://example.test/api/cron/job-board-ingestion-health');

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: new Date('2026-10-16T16:00:00Z') });
  m.tables.scheduler_runs = { data: [], error: null };
  m.tables.ingestion_audit_log = { data: [], error: null };
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

it('does nothing until explicitly enabled', async () => {
  const response = await GET(request());
  expect(await response.json()).toEqual({ ok: true, skipped: 'disabled' });
  expect(m.capture).not.toHaveBeenCalled();
});

it('reports missing runs and Oracle failures as separate Sentry issues without raw error text', async () => {
  vi.stubEnv('JOB_BOARD_INGESTION_HEALTH_ENABLED', 'true');
  vi.stubEnv('JOB_BOARD_SCHEDULE_START', '2026-10-15T00:00:00Z');
  m.tables.scheduler_runs = {
    data: [{ scheduler_run_id: 'job-board-hour-2026-10-15T18', dispatch_status: 'queued' }],
    error: null,
  };
  m.tables.ingestion_audit_log = {
    data: [
      {
        source_id: 's1',
        scheduler_run_id: 'job-board-hour-2026-10-15T18',
        status: 'failed',
        error_message: 'ORA-00054: resource busy and acquire with NOWAIT',
        run_at: '2026-10-15T18:10:00Z',
      },
    ],
    error: null,
  };
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    ok: false,
    missingRuns: ['job-board-hour-2026-10-16T01'],
    failedSources: 1,
    errorCodes: ['ORA-00054'],
  });
  expect(m.fingerprint.mock.calls.map((call) => call[0][1])).toEqual([
    'missing-run',
    'oracle-error',
    'failed-source',
  ]);
  for (const [message] of m.capture.mock.calls)
    expect(message).not.toMatch(/resource busy|s1/);
});

it('returns 503 when the audit tables cannot be read', async () => {
  vi.stubEnv('JOB_BOARD_INGESTION_HEALTH_ENABLED', 'true');
  m.tables.ingestion_audit_log = { data: [], error: { message: 'down' } };
  const response = await GET(request());
  expect(response.status).toBe(503);
});

it('counts failures beyond the first 1,000 audit rows', async () => {
  vi.stubEnv('JOB_BOARD_INGESTION_HEALTH_ENABLED', 'true');
  vi.stubEnv('JOB_BOARD_SCHEDULE_START', '2026-10-16T00:00:00Z');
  const run = 'job-board-hour-2026-10-16T01';
  m.tables.scheduler_runs = { data: [{ scheduler_run_id: run, dispatch_status: 'queued' }], error: null };
  m.tables.ingestion_audit_log = {
    data: Array.from({ length: 1_400 }, (_, index) => ({
      source_id: `s${index}`,
      scheduler_run_id: run,
      // Only sources past the first page failed, as in a quota outage late in a run.
      status: index < 1_000 ? 'succeeded' : 'failed',
      error_message: index < 1_000 ? null : "ORA-01536: space quota exceeded for tablespace 'DATA'",
      run_at: '2026-10-16T02:00:00Z',
    })),
    error: null,
  };
  const body = await (await GET(request())).json();
  expect(body).toMatchObject({ ok: false, failedSources: 400, errorCodes: ['ORA-01536'] });
});
