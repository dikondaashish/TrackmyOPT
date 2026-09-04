import {
  OracleJobDataStore,
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
      if (sql.includes('SELECT 1'))
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
    const bindDefs = executed[0]?.options?.bindDefs as
      | Record<string, { type: unknown }>
      | undefined;
    expect(Object.keys(bindDefs || {})).toHaveLength(26);
    expect(bindDefs?.description?.type).toBe(2002);
    expect(bindDefs?.id).toBeDefined();
    expect(bindDefs?.removed_at).toBeDefined();
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
    });
    expect(executed[1]?.binds).toEqual({ query: '%engineer%' });
    expect(page.total).toBe(1);
    expect(page.rows[0]).toMatchObject({
      id: 'job-1',
      optEligible: true,
      stemOptEligible: false,
    });
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
    const update = executed.find((entry) =>
      entry.sql.includes('UPDATE jobs SET'),
    );
    expect(update?.binds).toEqual({ id: 'job-2' });

    const beforeEmpty = executed.length;
    await store.reconcileSource('source-1', []);
    expect(executed).toHaveLength(beforeEmpty);
  });
});
