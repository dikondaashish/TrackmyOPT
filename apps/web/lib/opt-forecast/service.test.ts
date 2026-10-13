import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getCaseForecast,
  loadObservations,
  recordObservation,
  refreshForecasts,
} from './service';

function database(results: Record<string, unknown[]>) {
  const calls: Array<{
    table: string;
    filters: Array<[string, unknown]>;
    operation?: string;
    payload?: unknown;
  }> = [];
  const from = vi.fn((table: string) => {
    const call: {
      table: string;
      filters: Array<[string, unknown]>;
      operation?: string;
      payload?: unknown;
    } = { table, filters: [] };
    calls.push(call);
    const finish = () =>
      Promise.resolve(results[table]?.shift() ?? { data: null, error: null });
    const q = {
      select: () => q,
      eq: (k: string, v: unknown) => {
        call.filters.push([k, v]);
        return q;
      },
      lte: () => q,
      gte: () => q,
      in: () => q,
      order: () => q,
      limit: () => q,
      insert: (payload: unknown) => {
        call.operation = 'insert';
        call.payload = payload;
        return q;
      },
      update: (payload: unknown) => {
        call.operation = 'update';
        call.payload = payload;
        return q;
      },
      single: finish,
      maybeSingle: finish,
      then: (resolve: (v: unknown) => unknown) => finish().then(resolve),
    };
    return q;
  });
  const rpc = vi.fn();
  return { db: { from, rpc } as unknown as SupabaseClient, from, rpc, calls };
}
it('does not read private observations or persist a forecast for a foreign enrollment', async () => {
  const m = database({ case_status: [{ data: null, error: null }] });
  expect(await getCaseForecast(m.db, 'case', 'owner')).toBeNull();
  expect(m.calls).toEqual([
    {
      table: 'case_status',
      filters: [
        ['id', 'case'],
        ['user_id', 'owner'],
      ],
    },
  ]);
});
it('does not read pooled data before source authorization', async () => {
  const m = database({
    opt_forecast_policy: [
      { data: { uscis_training_authorized: false }, error: null },
    ],
  });
  m.rpc.mockResolvedValue({
    data: { id: 'run', state: 'review_required' },
    error: null,
  });
  expect(
    await refreshForecasts(m.db, new Date('2026-10-13T16:15:00Z'))
  ).toMatchObject({ state: 'review_required' });
  expect(m.rpc).toHaveBeenCalledTimes(1);
  expect(m.rpc.mock.calls[0]![0]).toBe('claim_opt_forecast_run');
  expect(m.from.mock.calls.map((x) => x[0])).toEqual(['opt_forecast_policy']);
});
it('waits for incomplete daily synchronization', async () => {
  const m = database({
    opt_forecast_policy: [
      { data: { uscis_training_authorized: true }, error: null },
    ],
    case_check_jobs: [{ data: null, error: null, count: 12 }],
  });
  expect(
    await refreshForecasts(m.db, new Date('2026-10-13T16:15:00Z'))
  ).toMatchObject({ state: 'waiting_for_sync', pendingJobs: 12 });
  expect(m.rpc).not.toHaveBeenCalled();
});
it('fails closed on an observation read error instead of fitting a truncated cohort', async () => {
  const m = database({});
  m.rpc.mockResolvedValue({ data: null, error: { message: 'private' } });
  await expect(loadObservations(m.db, '2026-10-13T00:00:00Z')).rejects.toThrow(
    'OPT forecast evidence read failed'
  );
});
it('sends only allowlisted provider fields and returns deletion races honestly', async () => {
  const m = database({});
  m.rpc.mockResolvedValue({ data: false, error: null });
  expect(
    await recordObservation(
      m.db,
      'case',
      {
        receiptNumber: 'IOE0000000001',
        status: 'Case Was Received',
        caseType: 'I-765',
        receivedDate: null,
        description: 'private',
        histCaseStatus: [],
      },
      '2026-10-13T00:00:00Z'
    )
  ).toBe(false);
  const input = m.rpc.mock.calls[0]![1];
  expect(input.p_provider).toEqual({
    status: 'Case Was Received',
    form: 'I-765',
    received: null,
    events: [],
  });
});
