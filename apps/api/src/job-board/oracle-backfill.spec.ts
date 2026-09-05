import { createHash } from 'node:crypto';
import type { JobDataStore, JobStoreRecord } from './job-data-store.contract';
import {
  BACKFILL_MAX_BATCH,
  canonicalTimestamp,
  canonicalJobHash,
  parseBackfillCheckpoint,
  parseBackfillLimit,
  runOracleBackfillBatch,
} from './oracle-backfill';

const job: JobStoreRecord = {
  id: 'job-1',
  sourceId: 'source-1',
  sourceAts: 'greenhouse',
  boardToken: 'board',
  externalJobId: 'external-1',
  title: 'Software Engineer',
  companyName: 'Example',
  location: 'Remote',
  department: 'Engineering',
  description: 'Build systems',
  jobUrl: 'https://example.test/job-1',
  postedAt: '2026-09-04T00:00:00.000Z',
  updatedAt: '2026-09-04T00:00:00.000Z',
  optEligible: null,
  stemOptEligible: null,
  cptEligible: null,
  h1bSponsorStatus: null,
  createdAt: '2026-09-04T00:00:00.000Z',
  firstSeenAt: '2026-09-04T00:00:00.000Z',
  lastConfirmedAt: '2026-09-04T00:00:00.000Z',
  listingStatus: 'open',
  employerBoardName: 'Example',
  sourceTrustTier: 'verified_ats',
  employerMatchId: null,
  missingSinceAt: null,
  removedAt: null,
};

describe('Oracle backfill planning', () => {
  describe('canonical timestamp hashing', () => {
    const timestampFields = [
      'postedAt',
      'updatedAt',
      'createdAt',
      'firstSeenAt',
      'lastConfirmedAt',
      'missingSinceAt',
      'removedAt',
    ] as const;

    it('normalizes equivalent UTC representations across every timestamp field', () => {
      for (const field of timestampFields) {
        const source = {
          ...job,
          [field]: '2026-09-04T10:00:00.000+00:00',
        };
        const equivalent = {
          ...job,
          [field]: '2026-09-04T06:00:00.000-04:00',
        };
        expect(canonicalJobHash(source)).toBe(canonicalJobHash(equivalent));
      }
    });

    it('normalizes sub-millisecond precision to the adapter millisecond contract', () => {
      expect(canonicalTimestamp('2026-09-04T10:00:00.123001+00:00')).toBe(
        '2026-09-04T10:00:00.123Z',
      );
      expect(
        canonicalJobHash({
          ...job,
          updatedAt: '2026-09-04T10:00:00.123001+00:00',
        }),
      ).toBe(
        canonicalJobHash({
          ...job,
          updatedAt: '2026-09-04T10:00:00.123999Z',
        }),
      );
    });

    it('detects a real one-millisecond timestamp difference', () => {
      expect(
        canonicalJobHash({
          ...job,
          updatedAt: '2026-09-04T10:00:00.123Z',
        }),
      ).not.toBe(
        canonicalJobHash({
          ...job,
          updatedAt: '2026-09-04T10:00:00.124Z',
        }),
      );
    });

    it('keeps null timestamps empty and preserves description hashing', () => {
      expect(canonicalTimestamp(null)).toBeNull();
      expect(canonicalJobHash(job)).toBe(canonicalJobHash({ ...job }));
      expect(canonicalJobHash(job)).not.toBe(
        canonicalJobHash({ ...job, description: 'Build systems differently' }),
      );
    });

    it('accepts the previously observed amtechsoftware timestamp representations', () => {
      const source = {
        ...job,
        postedAt: '2026-06-17T08:22:48+00:00',
        updatedAt: '2026-09-02T15:07:13.867041+00:00',
        createdAt: '2026-09-02T15:07:13.867041+00:00',
        firstSeenAt: '2026-09-02T15:07:13.867041+00:00',
        lastConfirmedAt: '2026-09-03T06:07:14.894+00:00',
        missingSinceAt: '2026-09-04T00:15:34.686+00:00',
        removedAt: '2026-09-04T06:16:28.857+00:00',
      };
      const oracleReadBack = {
        ...source,
        postedAt: '2026-06-17T08:22:48.000Z',
        updatedAt: '2026-09-02T15:07:13.867Z',
        createdAt: '2026-09-02T15:07:13.867Z',
        firstSeenAt: '2026-09-02T15:07:13.867Z',
        lastConfirmedAt: '2026-09-03T06:07:14.894Z',
        missingSinceAt: '2026-09-04T00:15:34.686Z',
        removedAt: '2026-09-04T06:16:28.857Z',
      };
      expect(canonicalJobHash(source)).toBe(canonicalJobHash(oracleReadBack));
    });
  });

  it('requires bounded limits and validates checkpoints', () => {
    expect(parseBackfillLimit('100')).toBe(100);
    expect(() => parseBackfillLimit(String(BACKFILL_MAX_BATCH + 1))).toThrow();
    expect(parseBackfillCheckpoint(null)).toMatchObject({
      sourceIndex: 0,
      offset: 0,
    });
    expect(() =>
      parseBackfillCheckpoint({ sourceIndex: -1, offset: 0, processed: 0 }),
    ).toThrow();
  });

  it('copies a bounded page, verifies every row, and advances a resumable checkpoint', async () => {
    const target = new Map<string, JobStoreRecord>();
    const sourceStore: Pick<JobDataStore, 'listSourceJobsPage'> = {
      listSourceJobsPage: jest
        .fn()
        .mockResolvedValue({ rows: [job], total: 1 }),
    };
    const targetStore: Pick<JobDataStore, 'upsertJobs' | 'getJob'> = {
      upsertJobs: jest.fn((rows: readonly JobStoreRecord[]) => {
        for (const row of rows) target.set(row.id, row);
        return Promise.resolve();
      }),
      getJob: jest.fn((id: string) => Promise.resolve(target.get(id) || null)),
    };
    const result = await runOracleBackfillBatch({
      sources: [{ id: 'source-1' }],
      checkpoint: parseBackfillCheckpoint(null),
      limit: 1,
      sourceStore,
      targetStore,
    });

    expect(result).toMatchObject({
      processed: 1,
      submitted: 1,
      verified: 1,
      failures: [],
    });
    expect(result.checkpoint).toMatchObject({
      sourceIndex: 1,
      offset: 0,
      processed: 1,
    });
    expect(result.checksum).toBe(
      createHash('sha256').update(canonicalJobHash(job)).digest('hex'),
    );
  });

  it('accepts equivalent timestamp representations during read-back before advancing the checkpoint', async () => {
    const source = {
      ...job,
      postedAt: '2026-06-17T08:22:48+00:00',
      updatedAt: '2026-09-02T15:07:13.867041+00:00',
      createdAt: '2026-09-02T15:07:13.867041+00:00',
      firstSeenAt: '2026-09-02T15:07:13.867041+00:00',
      lastConfirmedAt: '2026-09-03T06:07:14.894+00:00',
      missingSinceAt: '2026-09-04T00:15:34.686+00:00',
      removedAt: '2026-09-04T06:16:28.857+00:00',
    };
    const stored = {
      ...source,
      postedAt: '2026-06-17T08:22:48.000Z',
      updatedAt: '2026-09-02T15:07:13.867Z',
      createdAt: '2026-09-02T15:07:13.867Z',
      firstSeenAt: '2026-09-02T15:07:13.867Z',
      lastConfirmedAt: '2026-09-03T06:07:14.894Z',
      missingSinceAt: '2026-09-04T00:15:34.686Z',
      removedAt: '2026-09-04T06:16:28.857Z',
    };
    const sourceStore: Pick<JobDataStore, 'listSourceJobsPage'> = {
      listSourceJobsPage: jest
        .fn()
        .mockResolvedValue({ rows: [source], total: 1 }),
    };
    const targetStore: Pick<JobDataStore, 'upsertJobs' | 'getJob'> = {
      upsertJobs: jest.fn().mockResolvedValue(undefined),
      getJob: jest.fn().mockResolvedValue(stored),
    };

    const result = await runOracleBackfillBatch({
      sources: [{ id: 'source-1' }],
      checkpoint: parseBackfillCheckpoint(null),
      limit: 1,
      sourceStore,
      targetStore,
    });

    expect(result).toMatchObject({
      processed: 1,
      submitted: 1,
      verified: 1,
      failures: [],
      checkpoint: { sourceIndex: 1, offset: 0, processed: 1 },
    });
  });

  it('does not reconcile or delete when a target write fails', async () => {
    const sourceStore: Pick<JobDataStore, 'listSourceJobsPage'> = {
      listSourceJobsPage: jest
        .fn()
        .mockResolvedValue({ rows: [job], total: 1 }),
    };
    const targetStore: Pick<JobDataStore, 'upsertJobs' | 'getJob'> = {
      upsertJobs: jest
        .fn()
        .mockRejectedValue(new Error('temporary target failure')),
      getJob: jest.fn(),
    };
    const result = await runOracleBackfillBatch({
      sources: [{ id: 'source-1' }],
      checkpoint: parseBackfillCheckpoint(null),
      limit: 1,
      sourceStore,
      targetStore,
    });
    expect(result.failures).toEqual([
      { sourceId: 'source-1', message: 'temporary target failure' },
    ]);
    expect(targetStore.getJob).not.toHaveBeenCalled();
  });

  it('surfaces source page failures without writing or advancing the checkpoint', async () => {
    const sourceStore: Pick<JobDataStore, 'listSourceJobsPage'> = {
      listSourceJobsPage: jest
        .fn()
        .mockRejectedValue(
          new Error('column jobs.cpt_eligible does not exist'),
        ),
    };
    const targetStore: Pick<JobDataStore, 'upsertJobs' | 'getJob'> = {
      upsertJobs: jest.fn(),
      getJob: jest.fn(),
    };
    const result = await runOracleBackfillBatch({
      sources: [{ id: 'source-1' }],
      checkpoint: parseBackfillCheckpoint(null),
      limit: 100,
      sourceStore,
      targetStore,
    });

    expect(result).toMatchObject({
      processed: 0,
      submitted: 0,
      verified: 0,
      failures: [
        {
          sourceId: 'source-1',
          message:
            'source page read failed: column jobs.cpt_eligible does not exist',
        },
      ],
      checkpoint: {
        sourceIndex: 0,
        offset: 0,
        processed: 0,
      },
    });
    expect(targetStore.upsertJobs).not.toHaveBeenCalled();
  });

  it('copies every lifecycle state and remains idempotent when the batch is rerun', async () => {
    const lifecycleRows: JobStoreRecord[] = [
      { ...job, id: 'job-open', listingStatus: 'open' },
      {
        ...job,
        id: 'job-stale',
        listingStatus: 'stale',
        missingSinceAt: '2026-09-03T00:00:00.000Z',
      },
      {
        ...job,
        id: 'job-removed',
        listingStatus: 'removed',
        removedAt: '2026-09-04T00:00:00.000Z',
      },
    ];
    const target = new Map<string, JobStoreRecord>();
    const sourceStore: Pick<JobDataStore, 'listSourceJobsPage'> = {
      listSourceJobsPage: jest.fn().mockResolvedValue({
        rows: lifecycleRows,
        total: lifecycleRows.length,
      }),
    };
    const targetStore: Pick<JobDataStore, 'upsertJobs' | 'getJob'> = {
      upsertJobs: jest.fn((rows: readonly JobStoreRecord[]) => {
        for (const row of rows) target.set(row.id, row);
        return Promise.resolve();
      }),
      getJob: jest.fn((id: string) => Promise.resolve(target.get(id) || null)),
    };

    const first = await runOracleBackfillBatch({
      sources: [{ id: 'source-1' }],
      checkpoint: parseBackfillCheckpoint(null),
      limit: lifecycleRows.length,
      sourceStore,
      targetStore,
    });
    const second = await runOracleBackfillBatch({
      sources: [{ id: 'source-1' }],
      checkpoint: parseBackfillCheckpoint(null),
      limit: lifecycleRows.length,
      sourceStore,
      targetStore,
    });

    expect(first).toMatchObject({
      processed: 3,
      submitted: 3,
      verified: 3,
      failures: [],
    });
    expect(second).toMatchObject({
      processed: 3,
      submitted: 3,
      verified: 3,
      failures: [],
    });
    expect([...target.values()].map((row) => row.listingStatus).sort()).toEqual(
      ['open', 'removed', 'stale'],
    );
    expect(targetStore.upsertJobs).toHaveBeenCalledTimes(2);
    expect(sourceStore.listSourceJobsPage).toHaveBeenCalledTimes(2);
  });

  it('advances source pages deterministically without skipping or repeating sources', async () => {
    const rowsBySource = new Map([
      ['source-a', [{ ...job, id: 'job-a', sourceId: 'source-a' }]],
      ['source-b', [{ ...job, id: 'job-b', sourceId: 'source-b' }]],
    ]);
    const calls: Array<[string, number, number]> = [];
    const sourceStore: Pick<JobDataStore, 'listSourceJobsPage'> = {
      listSourceJobsPage: jest.fn(
        (sourceId: string, offset: number, pageSize: number) => {
          calls.push([sourceId, offset, pageSize]);
          const rows = rowsBySource.get(sourceId) || [];
          return Promise.resolve({ rows, total: rows.length });
        },
      ),
    };
    const target = new Map<string, JobStoreRecord>();
    const targetStore: Pick<JobDataStore, 'upsertJobs' | 'getJob'> = {
      upsertJobs: jest.fn((rows: readonly JobStoreRecord[]) => {
        for (const row of rows) target.set(row.id, row);
        return Promise.resolve();
      }),
      getJob: jest.fn((id: string) => Promise.resolve(target.get(id) || null)),
    };

    const result = await runOracleBackfillBatch({
      sources: [{ id: 'source-a' }, { id: 'source-b' }],
      checkpoint: parseBackfillCheckpoint(null),
      limit: 2,
      sourceStore,
      targetStore,
    });

    expect(result.failures).toEqual([]);
    expect(calls).toEqual([
      ['source-a', 0, 2],
      ['source-b', 0, 1],
    ]);
    expect(result.checkpoint).toMatchObject({
      sourceIndex: 2,
      offset: 0,
      processed: 2,
    });
  });
});
