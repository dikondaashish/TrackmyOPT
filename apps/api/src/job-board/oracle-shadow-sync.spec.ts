import type { JobDataStore, JobStoreRecord } from './job-data-store.contract';
import {
  assertSupabaseProductionStore,
  SHADOW_SYNC_MAX_LIMIT,
  SHADOW_SYNC_JOB_COLUMNS,
  createSupabaseJobsPageFetcher,
  mapSupabaseJob,
  parseShadowSyncArgs,
  runOracleShadowSync,
  type SupabaseJobRow,
} from './oracle-shadow-sync';

const now = '2026-09-04T12:00:00.000Z';

function sourceRow(overrides: Partial<SupabaseJobRow> = {}): SupabaseJobRow {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    source_id: '00000000-0000-4000-8000-000000000002',
    source_ats: 'greenhouse',
    board_token: 'northbeam',
    external_job_id: 'external-1',
    title: 'Software Engineer',
    company_name: 'North Beam',
    location: 'Remote',
    department: 'Engineering',
    description: 'Build reliable systems.',
    job_url: 'https://example.com/job-1',
    posted_at: now,
    updated_at: now,
    opt_eligible: true,
    stem_opt_eligible: false,
    cpt_eligible: null,
    h1b_sponsor_status: null,
    created_at: now,
    first_seen_at: now,
    last_confirmed_at: now,
    listing_status: 'open',
    employer_board_name: 'North Beam',
    source_trust_tier: 'verified_ats',
    employer_match_id: null,
    missing_since_at: null,
    removed_at: null,
    ...overrides,
  };
}

function oracleRecord(row: SupabaseJobRow): JobStoreRecord {
  return mapSupabaseJob(row);
}

function fakeStore(rowsById: Map<string, JobStoreRecord>) {
  const store: Pick<JobDataStore, 'healthCheck' | 'upsertJobs' | 'getJob'> = {
    healthCheck: jest.fn().mockResolvedValue(undefined),
    upsertJobs: jest.fn((rows: readonly JobStoreRecord[]) => {
      for (const row of rows) rowsById.set(row.id, row);
      return Promise.resolve();
    }),
    getJob: jest.fn((id: string) => Promise.resolve(rowsById.get(id) || null)),
  };
  return store;
}

describe('oracle shadow sync', () => {
  it('uses an explicit 26-column projection', () => {
    expect(SHADOW_SYNC_JOB_COLUMNS).not.toContain('*');
    expect(SHADOW_SYNC_JOB_COLUMNS.split(',')).toHaveLength(26);
    expect(SHADOW_SYNC_JOB_COLUMNS).toContain('description');
    expect(SHADOW_SYNC_JOB_COLUMNS).toContain('removed_at');
  });

  it('maps all shared Supabase fields without changing values', () => {
    const source = sourceRow();
    expect(mapSupabaseJob(source)).toEqual(oracleRecord(source));
  });

  it('reads only one source, verified open jobs, and never exposes write methods', async () => {
    const calls: string[] = [];
    const pageFetcher = createSupabaseJobsPageFetcher(
      {
        from(table: string) {
          expect(table).toBe('jobs');
          type FakeBuilder = {
            select(columns: string): FakeBuilder;
            eq(column: string, value: string): FakeBuilder;
            order(column: string, options: { ascending: boolean }): FakeBuilder;
            range(
              from: number,
              to: number,
            ): Promise<{
              data: readonly SupabaseJobRow[];
              error: null;
            }>;
          };
          const builder: FakeBuilder = {
            select(columns: string) {
              expect(columns).toBe(SHADOW_SYNC_JOB_COLUMNS);
              calls.push(`select:${columns}`);
              return builder;
            },
            eq(column: string, value: string) {
              calls.push(`eq:${column}:${value}`);
              return builder;
            },
            order(column: string, options: { ascending: boolean }) {
              calls.push(`order:${column}:${options.ascending}`);
              return builder;
            },
            range(from: number, to: number) {
              calls.push(`range:${from}:${to}`);
              return Promise.resolve({ data: [sourceRow()], error: null });
            },
          };
          return builder;
        },
      },
      '00000000-0000-4000-8000-000000000002',
    );

    const result = await pageFetcher(0, 4);

    expect(result.data).toHaveLength(1);
    expect(calls).toEqual([
      `select:${SHADOW_SYNC_JOB_COLUMNS}`,
      'eq:source_id:00000000-0000-4000-8000-000000000002',
      'eq:listing_status:open',
      'eq:source_trust_tier:verified_ats',
      'order:id:true',
      'range:0:4',
    ]);
  });

  it('enforces a required write flag, source id, limit, and the hard 100-row cap', () => {
    expect(() => parseShadowSyncArgs([])).toThrow(/--source-id is required/i);
    expect(() =>
      parseShadowSyncArgs([
        '--source-id',
        '00000000-0000-4000-8000-000000000002',
        '--limit',
        '5',
      ]),
    ).toThrow(/--write is required/i);
    expect(() =>
      parseShadowSyncArgs([
        '--source-id',
        '00000000-0000-4000-8000-000000000002',
        '--limit',
        String(SHADOW_SYNC_MAX_LIMIT + 1),
        '--write',
      ]),
    ).toThrow(/100/);
    expect(() =>
      parseShadowSyncArgs([
        '--source-id',
        '00000000-0000-4000-8000-000000000002',
        '--limit',
        'all',
        '--write',
      ]),
    ).toThrow(/limit/i);
  });

  it('rejects an Oracle production-store flag while allowing the Supabase default', () => {
    expect(() => assertSupabaseProductionStore(undefined)).not.toThrow();
    expect(() => assertSupabaseProductionStore('supabase')).not.toThrow();
    expect(() => assertSupabaseProductionStore('oracle')).toThrow(/supabase/i);
  });

  it('upserts a bounded batch, verifies every row, and never reconciles', async () => {
    const first = sourceRow();
    const second = sourceRow({
      id: '00000000-0000-4000-8000-000000000003',
      external_job_id: 'external-2',
      title: 'Platform Engineer',
    });
    const rowsById = new Map<string, JobStoreRecord>();
    const store = fakeStore(rowsById);
    const result = await runOracleShadowSync({
      sourceId: first.source_id,
      limit: 2,
      fetchPage: jest
        .fn()
        .mockResolvedValueOnce({ data: [first, second], error: null }),
      store,
    });

    expect(result).toMatchObject({
      selectedRows: 2,
      rowsSubmitted: 2,
      rowsVerified: 2,
      mismatches: 0,
      idempotenceChecked: false,
    });
    expect(store.healthCheck).toHaveBeenCalledTimes(1);
    expect(store.upsertJobs).toHaveBeenCalledTimes(1);
    expect(store.getJob).toHaveBeenCalledTimes(2);
  });

  it('runs the identical upsert twice only when idempotence verification is explicitly enabled', async () => {
    const source = sourceRow();
    const rowsById = new Map<string, JobStoreRecord>();
    const store = fakeStore(rowsById);
    const result = await runOracleShadowSync({
      sourceId: source.source_id,
      limit: 1,
      verifyIdempotence: true,
      fetchPage: jest.fn().mockResolvedValue({ data: [source], error: null }),
      store,
    });

    expect(result).toMatchObject({
      idempotenceChecked: true,
      idempotenceVerified: true,
    });
    expect(store.upsertJobs).toHaveBeenCalledTimes(2);
    expect(store.getJob).toHaveBeenCalledTimes(2);
  });

  it('fails on a read-back mismatch and does not claim success', async () => {
    const source = sourceRow();
    const store = {
      healthCheck: jest.fn().mockResolvedValue(undefined),
      upsertJobs: jest.fn().mockResolvedValue(undefined),
      getJob: jest.fn().mockResolvedValue({
        ...mapSupabaseJob(source),
        title: 'Different title',
      }),
    } as Pick<JobDataStore, 'healthCheck' | 'upsertJobs' | 'getJob'>;

    await expect(
      runOracleShadowSync({
        sourceId: source.source_id,
        limit: 1,
        fetchPage: jest.fn().mockResolvedValue({ data: [source], error: null }),
        store,
      }),
    ).rejects.toMatchObject({ code: 'oracle_readback_mismatch' });
  });

  it('checks Oracle before reading Supabase and leaves Supabase untouched when Oracle fails', async () => {
    const fetchPage = jest.fn();
    const store = {
      healthCheck: jest
        .fn()
        .mockRejectedValue(new Error('private Oracle detail')),
      upsertJobs: jest.fn(),
      getJob: jest.fn(),
    } as Pick<JobDataStore, 'healthCheck' | 'upsertJobs' | 'getJob'>;

    await expect(
      runOracleShadowSync({
        sourceId: '00000000-0000-4000-8000-000000000002',
        limit: 1,
        fetchPage,
        store,
      }),
    ).rejects.toMatchObject({ code: 'oracle_health_failed' });
    expect(fetchPage).not.toHaveBeenCalled();
    expect(store.upsertJobs).not.toHaveBeenCalled();
    expect(store.getJob).not.toHaveBeenCalled();
  });

  it('does not invoke reconciliation, even for a capped partial batch', async () => {
    const source = sourceRow();
    const rowsById = new Map<string, JobStoreRecord>();
    const reconcileSource = jest.fn();
    const store = { ...fakeStore(rowsById), reconcileSource } as Pick<
      JobDataStore,
      'healthCheck' | 'upsertJobs' | 'getJob'
    > & { reconcileSource: jest.Mock };

    await runOracleShadowSync({
      sourceId: source.source_id,
      limit: 1,
      fetchPage: jest.fn().mockResolvedValue({ data: [source], error: null }),
      store,
    });

    expect(reconcileSource).not.toHaveBeenCalled();
  });
});
