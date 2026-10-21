import {
  JOB_REMOVAL_MIN_MISSING_SECONDS,
  OracleJobDataStore,
  ORACLE_ISO_TZ_FORMAT,
  ORACLE_DESCRIPTION_FLAG_MASKS,
  ORACLE_DESCRIPTION_FLAGS,
  descriptionFilterFlags,
  normalizeOracleTimestamp,
  oracleErrorCode,
  oracleOperationLabel,
  toOracleTimestamp,
  type OracleConnection,
  type OracleDriver,
} from './oracle-job-data-store';
import type { JobStoreRecord, JobStoreSearch } from './job-data-store.contract';
import { buildOracleJobSearchFilter } from './oracle-job-search-query';

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
      if (sql.trim().startsWith('DELETE'))
        return Promise.resolve({ rowsAffected: 1 });
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

describe('OracleJobDataStore incremental ingestion', () => {
  const config = (incrementalIngestion: boolean) => ({
    connectString: 'test',
    user: 'APP',
    password: 'test',
    poolMax: 1,
    incrementalIngestion,
  });

  it('keeps the original MERGE, binds and read when the flag is off', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(config(false), driver);
    quietLogger(store);
    expect(store.supportsIncrementalIngestion).toBe(false);
    await store.upsertJobs([record({ contentHash: 'v1.x.y' })]);
    await store.listSourceJobsForIngestion('source-1');
    expect(executed.map((call) => call.sql).join('\n')).not.toContain(
      'content_hash',
    );
    expect(executed[0].binds).not.toHaveProperty('content_hash');
    expect(executed.some((call) => /JOB_SEARCH/i.test(call.sql))).toBe(true);
  });

  it('writes content_hash and only the requested search rows when enabled', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(config(true), driver);
    quietLogger(store);
    await store.upsertJobs(
      [
        record({ id: 'a', contentHash: 'hash-a' }),
        record({ id: 'b', externalJobId: 'b' }),
      ],
      { searchJobIds: new Set(['b']) },
    );
    const merge = executed.find((call) =>
      call.sql.startsWith('MERGE INTO jobs'),
    );
    expect(merge?.sql).toContain('target.content_hash = incoming.content_hash');
    expect(merge?.sql).toContain('content_hash)');
    expect(merge?.binds).toMatchObject({ id: 'a', content_hash: 'hash-a' });
    expect(
      (merge?.options?.bindDefs as Record<string, unknown>).content_hash,
    ).toEqual({ type: driver.STRING, maxSize: 140 });
    const search = executed.find((call) => /JOB_SEARCH/i.test(call.sql));
    expect(search?.binds).toMatchObject({ job_id: 'b' });
  });

  it('refreshes only the filter flags when no description changed', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(config(true), driver);
    quietLogger(store);
    await store.upsertJobs(
      [
        record({
          description: 'Build reliable systems.',
          atsFacts: { workplace: 'remote', employmentTypes: ['full_time'] },
        }),
      ],
      { searchJobIds: new Set() },
    );
    const searchWrites = executed.filter((call) =>
      /JOB_SEARCH/i.test(call.sql),
    );
    expect(searchWrites).toHaveLength(1);
    // The text columns behind the Oracle Text index are never touched.
    expect(searchWrites[0].sql).toMatch(
      /^UPDATE ADMIN\.TRACKMYOPT_JOB_SEARCH\s+SET description_filter_flags = :description_filter_flags\s+WHERE job_id = :job_id/,
    );
    expect(searchWrites[0].sql).not.toMatch(/search_text/);
    expect(searchWrites[0].binds).toEqual({
      job_id: 'job-1',
      description_filter_flags:
        ORACLE_DESCRIPTION_FLAGS.atsRemote |
        ORACLE_DESCRIPTION_FLAGS.atsFullTime,
    });
    expect(searchWrites[0].options?.bindDefs).toMatchObject({
      job_id: { type: 2001 },
      description_filter_flags: { type: 2010 },
    });
    expect(
      executed.some((call) => call.sql.startsWith('MERGE INTO jobs')),
    ).toBe(true);
  });

  it('reads content_hash for change detection when enabled', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(config(true), driver);
    quietLogger(store);
    await store.listSourceJobsForIngestion('source-1');
    expect(executed[0].sql).toContain('content_hash AS "CONTENT_HASH"');
  });

  it('confirms only open rows and commits only when every row matched', async () => {
    const { connection, driver, executed } = setup();
    const store = new OracleJobDataStore(config(true), driver);
    quietLogger(store);
    const commit = jest.spyOn(connection, 'commit');
    await store.confirmJobs(['a', 'b'], '2026-10-14T23:00:00.000Z');
    const confirm = executed.find((call) => call.sql.startsWith('UPDATE jobs'));
    expect(confirm?.sql).toContain("listing_status = 'open'");
    expect(confirm?.sql).not.toMatch(/description|search/i);
    expect(commit).toHaveBeenCalledTimes(1);

    connection.executeMany = () => Promise.resolve({ rowsAffected: 1 });
    const rollback = jest.spyOn(connection, 'rollback');
    commit.mockClear();
    await expect(
      store.confirmJobs(['a', 'b'], '2026-10-14T23:00:00.000Z'),
    ).rejects.toThrow('confirmation count changed');
    expect(commit).not.toHaveBeenCalled();
    expect(rollback).toHaveBeenCalledTimes(1);
  });

  it('updates only employer_match_id, including clearing a link', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(config(true), driver);
    quietLogger(store);
    await store.updateEmployerMatches([{ id: 'a', employerMatchId: null }]);
    const update = executed.find((call) => call.sql.startsWith('UPDATE jobs'));
    expect(update?.sql).toMatch(
      /SET\s+employer_match_id = :employer_match_id\s+WHERE id = :id/,
    );
    expect(update?.binds).toEqual({ id: 'a', employer_match_id: null });
  });

  it('does nothing for empty confirm or link batches', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(config(true), driver);
    await store.confirmJobs([], '2026-10-14T23:00:00.000Z');
    await store.updateEmployerMatches([]);
    await store.upsertJobs([]);
    expect(executed).toHaveLength(0);
  });
});

describe('OracleJobDataStore call timeout', () => {
  it('bounds every pooled connection with the configured call timeout', async () => {
    const { connection, driver } = setup();
    const store = new OracleJobDataStore(
      {
        connectString: 'test',
        user: 'APP',
        password: 'test',
        poolMax: 1,
        callTimeoutMs: 45_000,
      },
      driver,
    );
    await store.healthCheck();
    expect(connection.callTimeout).toBe(45_000);
  });

  it('defaults to a finite call timeout when none is configured', async () => {
    const { connection, driver } = setup();
    const store = new OracleJobDataStore(
      { connectString: 'test', user: 'APP', password: 'test', poolMax: 1 },
      driver,
    );
    await store.healthCheck();
    expect(connection.callTimeout).toBe(1_800_000);
  });

  it('rolls back, releases the connection and fails when a write times out', async () => {
    const { connection, driver } = setup();
    // The driver rejects a round trip that exceeds callTimeout (for example a
    // MERGE waiting on a row lock); the job must fail rather than hang.
    connection.executeMany = () =>
      Promise.reject(new Error('NJS-123: call timeout of 45000 ms exceeded'));
    const rollback = jest.spyOn(connection, 'rollback');
    const close = jest.spyOn(connection, 'close');
    const commit = jest.spyOn(connection, 'commit');
    const store = new OracleJobDataStore(
      {
        connectString: 'test',
        user: 'APP',
        password: 'test',
        poolMax: 1,
        callTimeoutMs: 45_000,
      },
      driver,
    );
    const log = quietLogger(store);
    await expect(
      store.reconcileSource('source-1', ['external-2']),
    ).rejects.toThrow('NJS-123');
    expect(commit).not.toHaveBeenCalled();
    expect(rollback).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(log.warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /^Oracle UPDATE jobs rows=1 failed after \d+ms \(NJS-123\)$/,
      ),
    );
  });

  it('preserves the original error when the rollback also fails', async () => {
    const { connection, driver } = setup();
    connection.executeMany = () =>
      Promise.reject(new Error('NJS-123: call timeout of 45000 ms exceeded'));
    connection.rollback = () =>
      Promise.reject(
        new Error('NJS-500: connection to the Oracle Database was broken'),
      );
    const close = jest.spyOn(connection, 'close');
    const store = new OracleJobDataStore(
      { connectString: 'test', user: 'APP', password: 'test', poolMax: 1 },
      driver,
    );
    const log = quietLogger(store);
    await expect(
      store.reconcileSource('source-1', ['external-2']),
    ).rejects.toThrow('NJS-123');
    expect(close).toHaveBeenCalledTimes(1);
    expect(log.warn).toHaveBeenCalledWith(
      'Oracle rollback failed (NJS-500); the original error is preserved',
    );
  });

  it('logs every write and commit duration with no SQL text or bind values', async () => {
    const { driver } = setup();
    const store = new OracleJobDataStore(
      { connectString: 'test', user: 'APP', password: 'test', poolMax: 1 },
      driver,
    );
    const log = quietLogger(store);
    await store.reconcileSource('source-1', ['external-2']);
    const lines = log.log.mock.calls.map(([line]) => String(line));
    expect(lines).toEqual([
      expect.stringMatching(/^Oracle UPDATE jobs rows=1 took \d+ms$/),
      expect.stringMatching(/^Oracle COMMIT rows=0 took \d+ms$/),
    ]);
    expect(lines.join('\n')).not.toMatch(/external|source-1|listing_status/);
  });

  it('labels statements by kind and table only', () => {
    expect(
      oracleOperationLabel('  MERGE INTO jobs t USING (SELECT :id FROM dual)'),
    ).toBe('MERGE INTO jobs');
    expect(
      oracleOperationLabel('DELETE FROM job_visa_signals WHERE x = 1'),
    ).toBe('DELETE FROM job_visa_signals');
    expect(
      oracleOperationLabel('SELECT id FROM jobs WHERE source_id = :s'),
    ).toBe('SELECT jobs');
    expect(oracleOperationLabel('BEGIN secret(); END;')).toBe('OTHER');
    expect(
      oracleErrorCode(new Error('ORA-00060: deadlock detected while')),
    ).toBe('ORA-00060');
    expect(oracleErrorCode(new Error('password=hunter2'))).toBe('unknown');
  });
});

function quietLogger(store: OracleJobDataStore) {
  const logger = { log: jest.fn(), warn: jest.fn() };
  (store as unknown as { logger: typeof logger }).logger = logger;
  return logger;
}

describe('OracleJobDataStore shadow adapter', () => {
  it('guards lifecycle promotion with the persisted run time in UTC', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      { connectString: 'test', user: 'APP', password: 'test', poolMax: 1 },
      driver,
    );
    await store.reconcileSource(
      'source-1',
      ['external-1'],
      '2026-09-06T06:00:00.000-04:00',
    );
    const update = executed.find((entry) =>
      entry.sql.includes('UPDATE jobs SET'),
    );
    expect(update?.sql).toContain(
      'missing_since_at < TO_TIMESTAMP_TZ(:runStartedAt',
    );
    expect(update?.binds).toEqual({
      id: 'job-2',
      runStartedAt: '2026-09-06T10:00:00.000+00:00',
      minMissingSeconds: JOB_REMOVAL_MIN_MISSING_SECONDS,
    });
  });

  it('uses a CLOB-free projection for live ingestion reconciliation', async () => {
    const { driver, executed } = setup();
    const store = new OracleJobDataStore(
      { connectString: 'test', user: 'APP', password: 'test', poolMax: 1 },
      driver,
    );

    await expect(store.listSourceJobsForIngestion('source-1')).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'job-1',
          externalJobId: 'external-1',
          listingStatus: 'open',
        }),
      ]),
    );
    const query = executed.find(
      (entry) =>
        entry.sql.includes('FROM jobs') && entry.sql.includes('COMPANY_NAME'),
    );
    expect(query?.sql).not.toContain('DESCRIPTION');
    expect(query?.sql).toContain('MISSING_SINCE_AT');
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
      store.replaceVisaSignals(
        ['job-1'],
        [
          {
            job_id: 'job-1',
            signal_type: 'opt_accepted_stated',
            evidence_snippet: 'x'.repeat(2001),
            source_url: 'https://example.test/job',
            observed_date: '2026-09-04',
            confidence: 0.95,
            source: 'employer_posting',
          },
        ],
      ),
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

  it('materializes whole-word description filter flags', () => {
    const flags = descriptionFilterFlags(
      '<p>This is a remote role.</p><p>Master’s degree and 6+ years of experience. Full-time contract position.</p>',
    );
    expect(flags & ORACLE_DESCRIPTION_FLAGS.remote).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.degreeMaster).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.experienceSenior).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.experienceEntry).toBeFalsy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.employmentFullTime).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.typeContract).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.hybrid).toBeFalsy();
    expect(flags & ORACLE_DESCRIPTION_FLAG_MASKS.ats).toBe(0);
  });

  it('drops the substring matches the old flags produced', () => {
    const flags = descriptionFilterFlags(
      'Act as Scrum Master. 12 years in business. Collaborate with remote teams on hybrid cloud. As a federal contractor we welcome permanent residents.',
    );
    expect(flags).toBe(0);
  });

  it('adds structured ATS facts as separate bits', () => {
    const flags = descriptionFilterFlags('Hybrid work model.', {
      workplace: 'on_site',
      employmentTypes: ['internship'],
    });
    expect(flags & ORACLE_DESCRIPTION_FLAGS.hybrid).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.atsOnSite).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAGS.atsInternship).toBeTruthy();
    expect(flags & ORACLE_DESCRIPTION_FLAG_MASKS.atsEmployment).toBe(0);
    // NUMBER(10) holds every combination.
    expect(ORACLE_DESCRIPTION_FLAG_MASKS.ats | 0x7fff).toBeLessThan(
      10_000_000_000,
    );
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

  it('orders newest posting first with a stable id tiebreak', async () => {
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

    await store.listJobs({ page: 1, pageSize: 10 });

    expect(executed[0]?.sql).toContain(
      'ORDER BY COALESCE(posted_at, first_seen_at) DESC NULLS LAST, id ASC',
    );
  });

  it('lists every open location and company for the filter options', async () => {
    const { driver, executed, connection } = setup();
    connection.execute = (<T>(sql: string, binds?: Record<string, unknown>) => {
      executed.push({ sql, binds });
      const rows = sql.includes('GROUP BY location')
        ? [
            { LOCATION: 'San Francisco, CA', N: 3 },
            { LOCATION: 'Remote - US', N: 2 },
            { LOCATION: 'London', N: 4 },
          ]
        : sql.includes('COALESCE(company_name')
          ? [{ VALUE: 'figma' }, { VALUE: 'Anthropic' }, { VALUE: 'Cursor' }]
          : [{ VALUE: 'San Francisco, CA' }, { VALUE: 'Remote - US' }];
      return Promise.resolve({ rows } as { rows: T[] });
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

    await expect(store.listJobFacets()).resolves.toEqual({
      locations: ['Remote - US', 'San Francisco, CA'],
      companies: ['Anthropic', 'Cursor', 'figma'],
      places: [
        { key: 'state:CA', kind: 'state', label: 'California', count: 3 },
        {
          key: 'city:San Francisco, CA',
          kind: 'city',
          label: 'San Francisco, CA',
          count: 3,
        },
        { key: 'remote:us', kind: 'remote', label: 'Remote (US)', count: 2 },
      ],
    });
    for (const call of executed) {
      expect(call.sql).toContain("listing_status = 'open'");
      expect(call.sql).toContain("source_trust_tier = 'verified_ats'");
      expect(call.sql).not.toMatch(/FETCH NEXT|OFFSET/);
    }
    // Company options cover the US board only.
    const companies = executed.find((call) =>
      call.sql.includes('COALESCE(company_name'),
    );
    expect(companies?.binds).toMatchObject({ nonUsLocation0: 'London' });
  });

  it('skips the COUNT query when the caller already knows the total', async () => {
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
    await expect(
      store.listJobs({ page: 2, pageSize: 100, withTotal: false }),
    ).resolves.toMatchObject({ total: 0 });
    expect(executed.some((call) => call.sql.includes('COUNT(*)'))).toBe(false);
  });

  it('reads the location index once and reuses it across searches', async () => {
    const { driver, executed, connection } = setup();
    const base = connection.execute.bind(
      connection,
    ) as OracleConnection['execute'];
    connection.execute = (<T>(sql: string, binds?: Record<string, unknown>) => {
      if (sql.includes('GROUP BY location')) {
        executed.push({ sql, binds });
        return Promise.resolve({
          rows: [
            { LOCATION: 'Boston, MA', N: 5 },
            { LOCATION: 'Paris, France', N: 2 },
          ],
        } as { rows: T[] });
      }
      return base(sql, binds);
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

    await store.listJobs({ page: 1, pageSize: 10, country: 'us' });
    await store.listJobs({ page: 1, pageSize: 10, places: ['state:MA'] });
    await store.listJobs({ page: 1, pageSize: 10 });

    expect(
      executed.filter((call) => call.sql.includes('GROUP BY location')),
    ).toHaveLength(1);
    const searches = executed.filter((call) => call.sql.includes('ORDER BY'));
    expect(searches[0].binds).toMatchObject({
      nonUsLocation0: 'Paris, France',
    });
    expect(searches[1].binds).toMatchObject({ placeLocation0: 'Boston, MA' });
    expect(searches[2].sql).not.toContain('location IN');
    expect(searches[2].sql).not.toContain('location NOT IN');
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
    });
    expect(executed[0]?.sql).toContain(
      `BITAND((SELECT NVL(MAX(s.description_filter_flags), 0)`,
    );
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

  it.each<[string, Partial<JobStoreSearch>, string]>([
    ['exclude', { exclude: 'clearance' }, 'NOT LIKE :exclude'],
    ['workplace', { workplace: 'remote' }, 'description_filter_flags'],
    ['degree', { degree: 'master' }, 'description_filter_flags'],
    ['experience', { experience: 'senior' }, 'description_filter_flags'],
    ['role', { role: 'engineering' }, 'REGEXP_LIKE(LOWER(title), :role)'],
    [
      'job type',
      { jobType: 'internship' },
      'REGEXP_LIKE(LOWER(title), :jobType_internship)',
    ],
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

  it('treats unspecified degree as no degree evidence at all', async () => {
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
    expect(executed[0]?.sql).toContain(
      `, ${ORACLE_DESCRIPTION_FLAG_MASKS.degrees}) = 0`,
    );
    expect(executed[0]?.sql).not.toContain('DBMS_LOB.INSTR');
  });

  it('lets the structured ATS workplace decide before location and text', () => {
    const flags = `(SELECT NVL(MAX(s.description_filter_flags), 0) FROM ADMIN.TRACKMYOPT_JOB_SEARCH s WHERE s.job_id = jobs.id)`;
    const { atsWorkplace } = ORACLE_DESCRIPTION_FLAG_MASKS;
    const noAts = `BITAND(${flags}, ${atsWorkplace}) = 0`;
    const where = (workplace: JobStoreSearch['workplace']) =>
      buildOracleJobSearchFilter({ page: 1, pageSize: 10, workplace }).where;
    expect(where('hybrid')).toContain(
      `(BITAND(${flags}, ${ORACLE_DESCRIPTION_FLAGS.atsHybrid}) != 0 OR (${noAts} AND`,
    );
    expect(where('remote')).toContain(
      `(BITAND(${flags}, ${ORACLE_DESCRIPTION_FLAGS.atsRemote}) != 0 OR (${noAts} AND`,
    );
    expect(where('on_site')).toContain(
      `(BITAND(${flags}, ${ORACLE_DESCRIPTION_FLAGS.atsOnSite}) != 0 OR (${noAts} AND`,
    );
    expect(where('unspecified')).toContain(`(${noAts} AND`);
  });

  it('prefers the ATS full/part-time field over description wording', () => {
    const { where } = buildOracleJobSearchFilter({
      page: 1,
      pageSize: 10,
      employmentType: 'part_time',
    });
    expect(where).toContain(
      `, ${ORACLE_DESCRIPTION_FLAGS.atsPartTime}) != 0 OR (BITAND(`,
    );
    expect(where).toContain(
      `, ${ORACLE_DESCRIPTION_FLAG_MASKS.atsEmployment}) = 0 AND BITAND(`,
    );
  });

  it('counts ATS internships alongside title and description evidence', () => {
    const { where } = buildOracleJobSearchFilter({
      page: 1,
      pageSize: 10,
      jobType: 'internship',
    });
    expect(where).toContain(
      `, ${
        ORACLE_DESCRIPTION_FLAGS.typeInternship |
        ORACLE_DESCRIPTION_FLAGS.atsInternship
      }) != 0`,
    );
  });

  it('excludes title evidence from the unspecified job type', async () => {
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
    expect(executed[0]?.sql).toContain(
      'NOT (REGEXP_LIKE(LOWER(title), :jobType_internship)',
    );
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
    expect(update?.binds).toEqual({
      id: 'job-2',
      runStartedAt: null,
      minMissingSeconds: JOB_REMOVAL_MIN_MISSING_SECONDS,
    });
    expect(JOB_REMOVAL_MIN_MISSING_SECONDS).toBe(72_000);
    // stale -> removed needs an earlier miss older than the threshold even
    // without a scheduler runStartedAt, so manual reruns cannot remove jobs.
    const sql = update?.sql.replace(/\s+/g, ' ') ?? '';
    expect(sql).toContain(
      "OR (listing_status = 'stale' AND missing_since_at IS NOT NULL AND missing_since_at <= SYSTIMESTAMP - NUMTODSINTERVAL(:minMissingSeconds, 'SECOND')",
    );
    // A stale row lacking missing_since_at is only timestamped, never removed.
    expect(sql).toContain(
      "CASE WHEN listing_status = 'open' OR missing_since_at IS NULL THEN 'stale' ELSE 'removed' END",
    );
    expect(sql).toContain(
      "removed_at = CASE WHEN listing_status = 'stale' AND missing_since_at IS NOT NULL THEN SYSTIMESTAMP",
    );
    expect(sql).not.toMatch(
      /:runStartedAt IS NULL OR missing_since_at IS NULL/,
    );

    const beforeEmpty = executed.length;
    await store.reconcileSource('source-1', []);
    expect(executed).toHaveLength(beforeEmpty);
  });

  it('returns the lifecycle transitions it actually committed', async () => {
    const config = {
      connectString: 'tcps://oracle.example/service',
      user: 'TRACKMYOPT_JOBS',
      password: 'test-only',
      poolMax: 4,
    };
    // setup() lists job-1 (open, external-1) and job-2 (stale, external-2).
    const removedByRule = setup();
    const removingStore = new OracleJobDataStore(config, removedByRule.driver);
    // job-2 missing and past the 20-hour window: the UPDATE changes 1 row.
    await expect(
      removingStore.reconcileSource('source-1', ['external-1']),
    ).resolves.toEqual({ staleCount: 0, removedCount: 1 });

    const blocked = setup();
    blocked.connection.executeMany = () => Promise.resolve({ rowsAffected: 0 });
    const blockedStore = new OracleJobDataStore(config, blocked.driver);
    // Inside the window the UPDATE matches nothing, so nothing was removed.
    await expect(
      blockedStore.reconcileSource('source-1', ['external-1']),
    ).resolves.toEqual({ staleCount: 0, removedCount: 0 });

    const bothMissing = setup();
    bothMissing.connection.executeMany = () =>
      Promise.resolve({ rowsAffected: 1 });
    const bothStore = new OracleJobDataStore(config, bothMissing.driver);
    // job-1 open -> stale always applies; job-2 stayed stale (1 row changed).
    await expect(
      bothStore.reconcileSource('source-1', ['unrelated']),
    ).resolves.toEqual({ staleCount: 1, removedCount: 0 });

    await expect(bothStore.reconcileSource('source-1', [])).resolves.toEqual({
      staleCount: 0,
      removedCount: 0,
    });
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

  it('deletes jobs even when DELETE on the ADMIN search table is not granted', async () => {
    const { driver, connection } = setup();
    const statements: string[] = [];
    let commits = 0;
    connection.executeMany = ((sql: string, binds: readonly unknown[]) => {
      statements.push(sql.split(' WHERE')[0]);
      if (sql.includes('TRACKMYOPT_JOB_SEARCH'))
        return Promise.reject(
          new Error(
            'ORA-41900: missing DELETE privilege on "ADMIN"."TRACKMYOPT_JOB_SEARCH"',
          ),
        );
      return Promise.resolve({ rowsAffected: binds.length });
    }) as OracleConnection['executeMany'];
    connection.commit = () => {
      commits++;
      return Promise.resolve();
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

    await expect(store.deleteJobs(['a', 'b', 'a'])).resolves.toBe(2);
    await expect(store.deleteJobs(['c'])).resolves.toBe(1);

    expect(commits).toBe(2);
    // The search delete is tried once, then skipped.
    expect(statements).toEqual([
      'DELETE FROM job_visa_signals',
      'DELETE FROM ADMIN.TRACKMYOPT_JOB_SEARCH',
      'DELETE FROM jobs',
      'DELETE FROM job_visa_signals',
      'DELETE FROM jobs',
    ]);
  });

  it('still fails a delete on any other error', async () => {
    const { driver, connection } = setup();
    connection.executeMany = (() =>
      Promise.reject(
        new Error('ORA-00060: deadlock detected'),
      )) as OracleConnection['executeMany'];
    const store = new OracleJobDataStore(
      {
        connectString: 'tcps://oracle.example/service',
        user: 'TRACKMYOPT_JOBS',
        password: 'test-only',
        poolMax: 4,
      },
      driver,
    );
    await expect(store.deleteJobs(['a'])).rejects.toThrow('ORA-00060');
  });
});
