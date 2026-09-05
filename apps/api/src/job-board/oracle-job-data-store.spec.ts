import {
  OracleJobDataStore,
  ORACLE_ISO_TZ_FORMAT,
  ORACLE_DESCRIPTION_FLAGS,
  descriptionFilterFlags,
  normalizeOracleTimestamp,
  toOracleTimestamp,
  type OracleConnection,
  type OracleDriver,
} from './oracle-job-data-store';
import type { JobStoreRecord } from './job-data-store.contract';

const now = '2026-09-03T12:00:00.000Z';

function record(overrides: Partial<JobStoreRecord> = {}): JobStoreRecord {
  return {
    id: 'job-1',
    sourceId: 'source-1',
    sourceAts: 'greenhouse',
    boardToken: 'northbeam',
    externalJobId: 'external-1',
    title: 'Software Engineer',
    companyName: 'North Beam',
    location: 'Remote',
    department: 'Engineering',
    description: 'Build reliable systems.',
    jobUrl: 'https://example.com/job-1',
    postedAt: now,
    updatedAt: now,
    optEligible: true,
    stemOptEligible: false,
    cptEligible: null,
    h1bSponsorStatus: null,
    createdAt: now,
    firstSeenAt: now,
    lastConfirmedAt: now,
    listingStatus: 'open',
    employerBoardName: 'North Beam',
    sourceTrustTier: 'verified_ats',
    employerMatchId: null,
    missingSinceAt: null,
    removedAt: null,
    ...overrides,
  };
}

function setup() {
  const executed: Array<{
    sql: string;
    binds?: Record<string, unknown>;
    options?: Record<string, unknown>;
  }> = [];
  const connection: OracleConnection = {
    execute: <T>(sql: string, binds?: Record<string, unknown>) => {
      executed.push({ sql, binds });
      if (sql.includes('COUNT(*)'))
        return Promise.resolve({ rows: [{ TOTAL: 1 }] } as { rows: T[] });
      if (sql.includes('external_job_id AS')) {
        return Promise.resolve({
          rows: [
            {
              ID: 'job-1',
              EXTERNAL_JOB_ID: 'external-1',
              LISTING_STATUS: 'open',
            },
            {
              ID: 'job-2',
              EXTERNAL_JOB_ID: 'external-2',
              LISTING_STATUS: 'stale',
            },
          ],
        } as { rows: T[] });
      }
      if (sql.trim().startsWith('SELECT 1 AS'))
        return Promise.resolve({ rows: [{ ok: 1 }] } as { rows: T[] });
      return Promise.resolve({
        rows: [
          {
            ID: 'job-1',
            SOURCE_ID: 'source-1',
            SOURCE_ATS: 'greenhouse',
            BOARD_TOKEN: 'northbeam',
            EXTERNAL_JOB_ID: 'external-1',
            TITLE: 'Software Engineer',
            COMPANY_NAME: 'North Beam',
            LOCATION: 'Remote',
            DEPARTMENT: 'Engineering',
            DESCRIPTION: 'Build reliable systems.',
            JOB_URL: 'https://example.com/job-1',
            POSTED_AT: new Date(now),
            UPDATED_AT: new Date(now),
            OPT_ELIGIBLE: 1,
            STEM_OPT_ELIGIBLE: 0,
            CPT_ELIGIBLE: null,
            H1B_SPONSOR_STATUS: null,
            CREATED_AT: new Date(now),
            FIRST_SEEN_AT: new Date(now),
            LAST_CONFIRMED_AT: new Date(now),
            LISTING_STATUS: 'open',
            EMPLOYER_BOARD_NAME: 'North Beam',
            SOURCE_TRUST_TIER: 'verified_ats',
            EMPLOYER_MATCH_ID: null,
            MISSING_SINCE_AT: null,
            REMOVED_AT: null,
          },
        ],
      } as { rows: T[] });
    },
    executeMany: (sql, binds, options) => {
      executed.push({ sql, binds: binds[0], options });
      return Promise.resolve({ rowsAffected: binds.length });
    },
    commit: () => Promise.resolve(),
    rollback: () => Promise.resolve(),
    close: () => Promise.resolve(),
  };
  const driver: OracleDriver = {
    OUT_FORMAT_OBJECT: 4002,
    STRING: 2001,
    CLOB: 2002,
    NUMBER: 2010,
    createPool: () =>
      Promise.resolve({
        getConnection: () => Promise.resolve(connection),
        close: () => Promise.resolve(),
      }),
  };
  return { connection, driver, executed };
}

describe('OracleJobDataStore shadow adapter', () => {
  it('upserts migration evidence without deleting, truncating, or losing the source identity', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'test',
        user: 'test',
        password: 'test-only',
        poolMax: 2,
      },
      driver,
    );
    await store.upsertVisaSignals([
      {
        id: 'signal-1',
        jobId: 'job-1',
        signalType: 'opt_accepted_stated',
        evidenceSnippet: 'Original evidence',
        sourceUrl: 'https://example.test/job',
        observedDate: '2026-09-04',
        confidence: 0.95,
        source: 'employer_posting',
      },
    ]);
    expect(executed.some((call) => /DELETE|TRUNCATE/.test(call.sql))).toBe(
      false,
    );
    const merge = executed.find((call) =>
      call.sql.includes('MERGE INTO job_visa_signals'),
    );
    expect(merge?.binds).toMatchObject({
      id: 'signal-1',
      evidence_snippet: 'Original evidence',
      observed_date: '2026-09-04',
      confidence: 0.95,
    });
  });

  it('does not execute an empty evidence batch', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'test',
        user: 'test',
        password: 'test-only',
        poolMax: 2,
      },
      driver,
    );
    await store.upsertVisaSignals([]);
    expect(executed).toHaveLength(0);
  });

  it('rejects oversized evidence instead of silently truncating it', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'test',
        user: 'test',
        password: 'test-only',
        poolMax: 2,
      },
      driver,
    );
    await expect(
      store.upsertVisaSignals([
        {
          jobId: 'job-1',
          signalType: 'opt_accepted_stated',
          evidenceSnippet: 'x'.repeat(2001),
          sourceUrl: 'https://example.test/job',
          observedDate: '2026-09-04',
          confidence: 0.95,
          source: 'employer_posting',
        },
      ]),
    ).rejects.toThrow('Evidence exceeds Oracle column limits');
    expect(executed).toHaveLength(0);
  });
  it('connects with a bounded pool and runs the Oracle health query', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.healthCheck();

    expect(executed[0]?.sql).toBe('SELECT 1 AS "ok" FROM dual');
  });

  it('reuses one pool when concurrent first operations initialize the store', async () => {
    const { connection } = setup();
    let createPoolCalls = 0;
    let releasePool!: () => void;
    const poolReady = new Promise<void>((resolve) => {
      releasePool = resolve;
    });
    const driver: OracleDriver = {
      OUT_FORMAT_OBJECT: 4002,
      createPool: async () => {
        createPoolCalls += 1;
        await poolReady;
        return {
          getConnection: () => Promise.resolve(connection),
          close: () => Promise.resolve(),
        };
      },
    };
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    const first = store.healthCheck();
    const second = store.healthCheck();
    await Promise.resolve();
    releasePool();
    await Promise.all([first, second]);

    expect(createPoolCalls).toBe(1);
  });

  it('does not recreate a pool after a clean shutdown', async () => {
    const { driver } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.close();

    await expect(store.healthCheck()).rejects.toThrow(
      'Oracle job store is closed',
    );
  });

  it('upserts rows with the source/external identity key and commits atomically', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.upsertJobs([record()]);

    expect(executed[0]?.sql).toContain('MERGE INTO jobs target');
    expect(executed[0]?.sql).toContain(
      'target.external_job_id = incoming.external_job_id',
    );
    expect(executed[0]?.sql).toContain(':cpt_eligible cpt_eligible');
    const bindDefs = executed[0]?.options?.bindDefs as
      | Record<string, { type: unknown }>
      | undefined;
    expect(Object.keys(bindDefs || {})).toHaveLength(26);
    expect(bindDefs?.description?.type).toBe(2002);
    expect(bindDefs?.cpt_eligible).toBeDefined();
    expect(bindDefs?.id).toBeDefined();
    expect(bindDefs?.removed_at).toBeDefined();
    const searchMerge = executed.find((call) =>
      call.sql.includes('MERGE INTO ADMIN.TRACKMYOPT_JOB_SEARCH'),
    );
    expect(searchMerge?.binds).toMatchObject({
      job_id: 'job-1',
      search_text: 'build reliable systems.'.toLowerCase(),
      search_text_index: 'build reliable systems+'.toLowerCase(),
      description_filter_flags: 0,
    });
    expect(searchMerge?.options?.bindDefs).toMatchObject({
      job_id: { type: 2001 },
      search_text: { type: 2002 },
      search_text_index: { type: 2002 },
      description_filter_flags: { type: 2010 },
    });
  });

  it('materializes exact Supabase-compatible description filter flags', () => {
    const flags = descriptionFilterFlags(
      'Remote role. Master degree. 6 years. Full-time contractor.',
    );
    expect(flags & ORACLE_DESCRIPTION_FLAGS.remote).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.degreeMaster).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.experienceSenior).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.employmentFullTime).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.typeContract).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.hybrid).toBeFalsy();
  });

  it('binds UTC timestamps with an explicit offset and preserves the instant on read-back', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );
    const source = '2026-09-03T08:00:00.123-04:00';

    await store.upsertJobs([
      record({
        postedAt: source,
        updatedAt: source,
        createdAt: source,
        firstSeenAt: source,
        lastConfirmedAt: source,
      }),
    ]);

    const binds = executed[0]?.binds;
    expect(binds?.posted_at).toBe('2026-09-03T12:00:00.123+00:00');
    expect(executed[0]?.sql).toContain(
      `TO_TIMESTAMP_TZ(:posted_at, '${ORACLE_ISO_TZ_FORMAT}')`,
    );
    expect(normalizeOracleTimestamp(new Date(String(binds?.posted_at)))).toBe(
      new Date(source).toISOString(),
    );
  });

  it('corrects stale lifecycle timestamp representations on matched rows', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.upsertJobs([
      record({
        createdAt: '2026-08-29T18:38:54.171125+00:00',
        firstSeenAt: '2026-08-29T18:38:54.171125+00:00',
      }),
    ]);

    expect(executed[0]?.sql).toContain(
      'target.created_at = incoming.created_at',
    );
    expect(executed[0]?.sql).toContain(
      'target.first_seen_at = incoming.first_seen_at',
    );
    expect(executed[0]?.binds).toMatchObject({
      created_at: '2026-08-29T18:38:54.171+00:00',
      first_seen_at: '2026-08-29T18:38:54.171+00:00',
    });
  });

  it('normalizes fractional seconds beyond JavaScript millisecond precision', () => {
    const source = '2026-09-03T12:00:00.123987+00:00';
    const bound = toOracleTimestamp(source);

    expect(bound).toBe('2026-09-03T12:00:00.123+00:00');
    expect(normalizeOracleTimestamp(new Date(String(bound)))).toBe(
      '2026-09-03T12:00:00.123Z',
    );
  });

  it('uses the timezone-aware representation for postedAfter filters', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.listJobs({
      page: 1,
      pageSize: 10,
      postedAfter: '2026-09-03T08:00:00-04:00',
    });

    expect(executed[0]?.sql).toContain(
      `TO_TIMESTAMP_TZ(:postedAfter, '${ORACLE_ISO_TZ_FORMAT}')`,
    );
    expect(executed[0]?.binds).toMatchObject({
      postedAfter: '2026-09-03T12:00:00.000+00:00',
    });
  });

  it('supports filtered, paginated reads and maps Oracle rows to the neutral schema', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    const page = await store.listJobs({
      page: 2,
      pageSize: 50,
      query: 'engineer',
    });

    expect(executed[0]?.sql).toContain(
      'OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY',
    );
    expect(executed[0]?.binds).toMatchObject({
      offset: 50,
      pageSize: 50,
      query: '%engineer%',
      queryToken: '%engineer%',
    });
    expect(executed[1]?.binds).toMatchObject({
      query: '%engineer%',
    });
    expect(page.total).toBe(1);
    expect(page.rows[0]).toMatchObject({
      id: 'job-1',
      optEligible: true,
      stemOptEligible: false,
    });
  });

  it('uses Oracle Text for description predicates while keeping substring verification', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.listJobs({
      page: 1,
      pageSize: 10,
      query: 'data engineer',
      workplace: 'remote',
    });

    expect(executed[0]?.sql).toContain(
      'CONTAINS(s.search_text_index, :queryToken, 1) > 0',
    );
    expect(executed[0]?.sql).toContain(
      'DBMS_LOB.INSTR(s.search_text, :queryTokenExact) > 0',
    );
    expect(executed[0]?.sql).not.toContain('DBMS_LOB.INSTR(LOWER(description)');
    expect(executed[0]?.binds).toMatchObject({
      queryToken: '%data engineer%',
      queryTokenExact: 'data engineer',
      workplaceRemoteFlag: ORACLE_DESCRIPTION_FLAGS.remote,
    });
  });

  it('keeps punctuation-sensitive description searches on the source CLOB', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.listJobs({ page: 1, pageSize: 10, query: 'c++' });

    expect(executed[0]?.sql).toContain(
      'CONTAINS(s.search_text_index, :queryToken, 1) > 0',
    );
    expect(executed[0]?.sql).toContain(
      'DBMS_LOB.INSTR(s.search_text, :queryTokenExact) > 0',
    );
    expect(executed[0]?.binds).toMatchObject({
      queryToken: '%c++%',
      queryTokenExact: 'c++',
    });
  });

  it('reads Oracle-side visa signals by stable job IDs', async () => {
    const { driver, executed, connection } = setup();
    connection.execute = (<T>(sql: string, binds?: Record<string, unknown>) => {
      executed.push({ sql, binds });
      if (sql.includes('FROM job_visa_signals')) {
        return Promise.resolve({
          rows: [
            {
              JOB_ID: 'job-1',
              SIGNAL_TYPE: 'future_sponsorship_stated',
              EVIDENCE_SNIPPET: 'Sponsorship available.',
              SOURCE_URL: 'https://example.test/job-1',
              OBSERVED_DATE: new Date('2026-09-04T00:00:00.000Z'),
              CONFIDENCE: 0.9,
              SOURCE: 'employer_posting',
            },
          ],
        } as { rows: T[] });
      }
      return Promise.resolve({ rows: [] } as { rows: T[] });
    }) as OracleConnection['execute'];
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await expect(store.listVisaSignals(['job-1'])).resolves.toEqual([
      {
        jobId: 'job-1',
        signalType: 'future_sponsorship_stated',
        evidenceSnippet: 'Sponsorship available.',
        sourceUrl: 'https://example.test/job-1',
        observedDate: '2026-09-04',
        confidence: 0.9,
        source: 'employer_posting',
      },
    ]);
    expect(executed.at(-1)?.sql).toContain('job_id IN (:jobId0)');
    expect(executed.at(-1)?.binds).toEqual({ jobId0: 'job-1' });
  });

  it.each([
    ['exclude', { exclude: 'clearance' }, 'NOT LIKE :exclude'],
    ['workplace', { workplace: 'remote' }, 'description_filter_flags'],
    ['degree', { degree: 'master' }, 'description_filter_flags'],
    ['experience', { experience: 'senior' }, 'description_filter_flags'],
    ['role', { role: 'engineering' }, 'role0'],
    ['job type', { jobType: 'internship' }, "LOWER(title) LIKE '%intern%'"],
    [
      'employment type',
      { employmentType: 'full_time' },
      'description_filter_flags',
    ],
    [
      'employer evidence',
      { employerEvidence: 'source_backed' },
      'employer_match_id IS NOT NULL',
    ],
    [
      'saved URL scope',
      { includeJobUrls: ['https://example.test/job-1'] },
      'job_url IN (:includeUrl0)',
    ],
  ])(
    'translates %s into a server-side SQL predicate',
    async (_name, filters, fragment) => {
      const { driver, executed } = setup();
      const store = new OracleJobDataStore(
        {
          connectString: 'tcps://oracle.example/service',
          user: 'TRACKMYOPT_JOBS',
          password: 'test-only',
          poolMax: 4,
        },
        driver,
      );
      await store.listJobs({ page: 1, pageSize: 10, ...filters });
      expect(executed[0]?.sql).toContain(fragment);
    },
  );

  it('keeps unspecified degree semantics aligned with Supabase', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );
    await store.listJobs({ page: 1, pageSize: 10, degree: 'unspecified' });
    expect(executed[0]?.sql).toContain(':degreeUnspecifiedFlags');
    expect(executed[0]?.sql).not.toContain('DBMS_LOB.INSTR');
  });

  it('does not infer unspecified job type from title text', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );
    await store.listJobs({ page: 1, pageSize: 10, jobType: 'unspecified' });
    expect(executed[0]?.sql).toContain(':jobTypeUnspecifiedFlags');
    expect(executed[0]?.sql).not.toContain("LOWER(title) LIKE '%intern%'");
  });

  it('reconciles missing IDs with stale then removed lifecycle and never mass-removes an empty feed', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.reconcileSource('source-1', ['external-1']);
    const read = executed.find((entry) =>
      entry.sql.includes('FETCH NEXT :pageSize ROWS ONLY'),
    );
    expect(read?.binds).toEqual({
      sourceId: 'source-1',
      offset: 0,
      pageSize: 500,
    });
    const update = executed.find((entry) =>
      entry.sql.includes('UPDATE jobs SET'),
    );
    expect(update?.binds).toEqual({ id: 'job-2' });

    const beforeEmpty = executed.length;
    await store.reconcileSource('source-1', []);
    expect(executed).toHaveLength(beforeEmpty);
  });

  it('writes composed visa signals in Oracle without creating a Supabase job FK', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );

    await store.replaceVisaSignals(
      ['job-1'],
      [
        {
          job_id: 'job-1',
          signal_type: 'future_sponsorship_stated',
          evidence_snippet: 'Sponsorship available.',
          source_url: 'https://example.test/job-1',
          observed_date: '2026-09-04',
          confidence: 0.9,
          source: 'employer_posting',
        },
      ],
    );

    expect(
      executed.some((entry) =>
        entry.sql.includes('DELETE FROM job_visa_signals'),
      ),
    ).toBe(true);
    expect(
      executed.some((entry) =>
        entry.sql.includes('MERGE INTO job_visa_signals'),
      ),
    ).toBe(true);
  });
});
