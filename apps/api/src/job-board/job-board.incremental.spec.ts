import { ConfigService } from '@nestjs/config';
import { JobBoardService } from './job-board.service';
import type {
  JobStoreEmployerMatchUpdate,
  JobStorePersistenceRecord,
  JobStoreRecord,
  JobStoreUpsertOptions,
} from './job-data-store.contract';
import {
  descriptionDigest,
  jobContentHash,
  metadataDigest,
  parseContentHash,
} from './job-content-hash';
import { planIncrementalWrites } from './job-board-records';
import { sourceRetryDecision } from './ingestion-retry-policy';
import { runSourceJob } from './job-board.processor';

const SOURCE = {
  id: 'source',
  ats_type: 'greenhouse',
  board_token: 'board',
  employer_board_name: 'Example',
  enabled: true,
};

type Scraped = {
  external_job_id: string;
  title: string;
  company_name: string;
  location: string | null;
  department: string | null;
  description: string | null;
  job_url: string | null;
  posted_at: string | null;
};

function scraped(overrides: Partial<Scraped> = {}): Scraped {
  return {
    external_job_id: 'ext-1',
    title: 'Engineer',
    company_name: 'Example',
    location: 'Remote',
    department: 'Eng',
    description: 'Build things. Salary $120k. Sponsorship available.',
    job_url: 'https://example.com/jobs/1',
    posted_at: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Hash of what buildJobStoreRecords produces for a scraped job of SOURCE. */
function hashOf(job: Scraped) {
  return jobContentHash({
    title: job.title,
    companyName: job.company_name,
    location: job.location,
    department: job.department,
    description: job.description,
    jobUrl: job.job_url,
    postedAt: job.posted_at,
    employerBoardName: SOURCE.employer_board_name,
  });
}

function existing(
  overrides: Partial<JobStorePersistenceRecord> = {},
): JobStorePersistenceRecord {
  return {
    id: 'job-1',
    externalJobId: 'ext-1',
    companyName: 'Example',
    optEligible: null,
    stemOptEligible: null,
    cptEligible: null,
    h1bSponsorStatus: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    firstSeenAt: '2026-09-01T00:00:00.000Z',
    employerMatchId: 'match-1',
    listingStatus: 'open',
    missingSinceAt: null,
    contentHash: hashOf(scraped()),
    ...overrides,
  };
}

function setup({
  incremental = true,
  persisted = [existing()],
  matchId = 'match-1',
}: {
  incremental?: boolean;
  persisted?: JobStorePersistenceRecord[];
  matchId?: string;
} = {}) {
  const config = {
    get: (key: string) =>
      ({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test',
        JOB_DATA_STORE: 'oracle',
      })[key],
  } as unknown as ConfigService;
  const store = {
    supportsIncrementalIngestion: incremental,
    listSourceJobsForIngestion: jest.fn().mockResolvedValue(persisted),
    upsertJobs: jest
      .fn<Promise<void>, [readonly JobStoreRecord[], JobStoreUpsertOptions?]>()
      .mockResolvedValue(undefined),
    confirmJobs: jest
      .fn<Promise<void>, [readonly string[], string]>()
      .mockResolvedValue(undefined),
    updateEmployerMatches: jest
      .fn<Promise<void>, [readonly JobStoreEmployerMatchUpdate[]]>()
      .mockResolvedValue(undefined),
    reconcileSource: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
  };
  const employer = {
    syncSource: jest.fn().mockResolvedValue(new Map([['Example', matchId]])),
  };
  const visa = { syncSource: jest.fn().mockResolvedValue(undefined) };
  const service = new JobBoardService(
    config,
    {} as never,
    {} as never,
    employer as never,
    visa as never,
    store as never,
  );
  const internals = service as unknown as {
    persistSourceJobs(
      source: unknown,
      jobs: Scraped[],
      complete: boolean,
    ): Promise<{
      jobsNew: number;
      jobsDuplicate: number;
      jobsStale: number;
      jobsRemoved: number;
      jobsReopened: number;
    }>;
    logger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock };
  };
  internals.logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const persist = (jobs: Scraped[], complete = true) =>
    internals.persistSourceJobs(SOURCE, jobs, complete);
  return { store, employer, visa, persist };
}

describe('content hash', () => {
  it('ignores insignificant formatting and timestamp representation', () => {
    const base = scraped();
    expect(
      hashOf({
        ...base,
        title: '  Engineer \n',
        description: `${base.description}\r\n`,
        posted_at: '2026-09-30T20:00:00-04:00',
      }),
    ).toBe(hashOf(base));
    expect(hashOf({ ...base, department: '' })).toBe(
      hashOf({ ...base, department: null }),
    );
  });

  it('separates description and metadata changes', () => {
    const base = scraped();
    const before = parseContentHash(hashOf(base));
    const salary = parseContentHash(
      hashOf({ ...base, description: 'Build things. Salary $150k.' }),
    );
    const moved = parseContentHash(hashOf({ ...base, location: 'Austin, TX' }));
    expect(salary?.description).not.toBe(before?.description);
    expect(salary?.metadata).toBe(before?.metadata);
    expect(moved?.description).toBe(before?.description);
    expect(moved?.metadata).not.toBe(before?.metadata);
    expect(descriptionDigest(null)).toBe(descriptionDigest('   '));
    expect(
      metadataDigest({
        title: 'a',
        companyName: 'b',
        location: null,
        department: null,
        description: null,
        jobUrl: null,
        postedAt: 'not a date',
        employerBoardName: null,
      }),
    ).toMatch(/^[0-9a-f]{64}$/);
  });

  it('treats a missing or foreign hash as unknown', () => {
    expect(parseContentHash(null)).toBeNull();
    expect(parseContentHash('v0.abc.def')).toBeNull();
    expect(hashOf(scraped())).toHaveLength(132);
  });
});

describe('incremental ingestion', () => {
  it('1. inserts a new job with its search row and hash', async () => {
    const { store, persist } = setup({ persisted: [] });
    const result = await persist([scraped()]);
    const [rows, options] = store.upsertJobs.mock.calls[0];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      externalJobId: 'ext-1',
      listingStatus: 'open',
      contentHash: hashOf(scraped()),
    });
    expect([...(options?.searchJobIds || [])]).toEqual([rows[0].id]);
    expect(store.confirmJobs).toHaveBeenCalledWith([], expect.any(String));
    expect(result.jobsNew).toBe(1);
  });

  it('2. only confirms an unchanged open job', async () => {
    const { store, persist } = setup();
    const result = await persist([scraped()]);
    expect(store.upsertJobs).toHaveBeenCalledWith([], {
      searchJobIds: new Set(),
    });
    expect(store.confirmJobs).toHaveBeenCalledWith(
      ['job-1'],
      expect.any(String),
    );
    expect(result).toMatchObject({ jobsNew: 0, jobsDuplicate: 1 });
  });

  it('3. rewrites the job and its search row when the description changes', async () => {
    const { store, persist } = setup();
    await persist([scraped({ description: 'New responsibilities.' })]);
    const [rows, options] = store.upsertJobs.mock.calls[0];
    expect(rows.map((row) => row.id)).toEqual(['job-1']);
    expect(rows[0].description).toBe('New responsibilities.');
    expect([...(options?.searchJobIds || [])]).toEqual(['job-1']);
    expect(store.confirmJobs).toHaveBeenCalledWith([], expect.any(String));
  });

  it('4. updates metadata (salary in text, location, title) without reindexing search when only metadata changes', async () => {
    const { store, persist } = setup();
    await persist([
      scraped({ location: 'Austin, TX', title: 'Senior Engineer' }),
    ]);
    const [rows, options] = store.upsertJobs.mock.calls[0];
    expect(rows[0]).toMatchObject({
      id: 'job-1',
      location: 'Austin, TX',
      title: 'Senior Engineer',
    });
    expect(options?.searchJobIds?.size).toBe(0);
  });

  it('4b. rewrites a job whose structured ATS facts changed without reindexing its text', async () => {
    const { store, persist } = setup();
    await persist([
      {
        ...scraped(),
        workplace_type: 'hybrid',
        employment_types: ['full_time'],
      } as Scraped,
    ]);
    const [rows, options] = store.upsertJobs.mock.calls[0];
    expect(rows[0]).toMatchObject({
      id: 'job-1',
      atsFacts: { workplace: 'hybrid', employmentTypes: ['full_time'] },
    });
    // The store refreshes only the flags of rows outside searchJobIds.
    expect(options?.searchJobIds?.size).toBe(0);
    expect(store.confirmJobs).toHaveBeenCalledWith([], expect.any(String));
  });

  it('4c. keeps hashes of jobs without structured ATS facts unchanged', () => {
    const fields = {
      title: 'Engineer',
      companyName: 'Example',
      location: null,
      department: null,
      description: 'Build things.',
      jobUrl: null,
      postedAt: null,
      employerBoardName: null,
    };
    expect(
      metadataDigest({
        ...fields,
        atsFacts: { workplace: null, employmentTypes: [] },
      }),
    ).toBe(metadataDigest(fields));
    expect(
      metadataDigest({
        ...fields,
        atsFacts: { workplace: 'remote', employmentTypes: [] },
      }),
    ).not.toBe(metadataDigest(fields));
  });

  it.each(['stale', 'removed'] as const)(
    '5. reopens a %s job through the full write path even when unchanged',
    async (listingStatus) => {
      const { store, persist } = setup({
        persisted: [
          existing({
            listingStatus,
            missingSinceAt: '2026-10-01T00:00:00.000Z',
          }),
        ],
      });
      const result = await persist([scraped()]);
      const [rows, options] = store.upsertJobs.mock.calls[0];
      expect(rows[0]).toMatchObject({
        id: 'job-1',
        listingStatus: 'open',
        missingSinceAt: null,
        removedAt: null,
      });
      expect(options?.searchJobIds?.size).toBe(0);
      expect(store.confirmJobs).toHaveBeenCalledWith([], expect.any(String));
      expect(result.jobsReopened).toBe(1);
    },
  );

  it('6. reconciles a job missing from a complete response', async () => {
    const { store, persist } = setup({
      persisted: [
        existing(),
        existing({ id: 'job-2', externalJobId: 'ext-2' }),
      ],
    });
    const result = await persist([scraped()]);
    expect(store.reconcileSource).toHaveBeenCalledWith(
      'source',
      ['ext-1'],
      undefined,
    );
    expect(result.jobsStale).toBe(1);
  });

  it('7. makes no write or reconciliation for an incomplete response', async () => {
    const { store, persist } = setup();
    await expect(persist([scraped()], false)).rejects.toThrow(
      'ATS response is not complete',
    );
    expect(store.upsertJobs).not.toHaveBeenCalled();
    expect(store.confirmJobs).not.toHaveBeenCalled();
    expect(store.reconcileSource).not.toHaveBeenCalled();
  });

  it('8. writes only employer links that changed', async () => {
    const reassigned = setup({ matchId: 'match-2' });
    await reassigned.persist([scraped()]);
    expect(reassigned.store.updateEmployerMatches).toHaveBeenCalledWith([
      { id: 'job-1', employerMatchId: 'match-2' },
    ]);
    expect(reassigned.store.upsertJobs).toHaveBeenCalledTimes(1);

    const same = setup();
    await same.persist([scraped()]);
    expect(same.store.updateEmployerMatches).toHaveBeenCalledWith([]);

    const linked = setup({ persisted: [existing({ employerMatchId: null })] });
    await linked.persist([scraped()]);
    expect(linked.store.updateEmployerMatches).toHaveBeenCalledWith([
      { id: 'job-1', employerMatchId: 'match-1' },
    ]);
  });

  it('9. a repeated identical ingestion writes no content or search rows', async () => {
    const { store, persist } = setup({
      persisted: [
        existing(),
        existing({
          id: 'job-2',
          externalJobId: 'ext-2',
          contentHash: hashOf(scraped({ external_job_id: 'ext-2' })),
        }),
      ],
    });
    await persist([scraped(), scraped({ external_job_id: 'ext-2' })]);
    expect(store.upsertJobs).toHaveBeenCalledWith([], {
      searchJobIds: new Set(),
    });
    expect(store.confirmJobs).toHaveBeenCalledWith(
      ['job-1', 'job-2'],
      expect.any(String),
    );
    expect(store.updateEmployerMatches).toHaveBeenCalledWith([]);
  });

  it('backfills a legacy row without a hash through the full path', async () => {
    const { store, persist } = setup({
      persisted: [existing({ contentHash: null })],
    });
    await persist([scraped()]);
    const [rows, options] = store.upsertJobs.mock.calls[0];
    expect(rows[0].contentHash).toBe(hashOf(scraped()));
    expect([...(options?.searchJobIds || [])]).toEqual(['job-1']);
  });

  it('11. with the flag off keeps the original two full upserts', async () => {
    const { store, persist } = setup({ incremental: false });
    await persist([scraped()]);
    expect(store.upsertJobs).toHaveBeenCalledTimes(2);
    for (const [rows, options] of store.upsertJobs.mock.calls) {
      expect(rows).toHaveLength(1);
      expect(options).toBeUndefined();
    }
    expect(store.confirmJobs).not.toHaveBeenCalled();
    expect(store.updateEmployerMatches).not.toHaveBeenCalled();
  });
});

describe('planIncrementalWrites', () => {
  it('never confirms a row whose status is open but still marked missing', () => {
    const record = {
      id: 'job-1',
      externalJobId: 'ext-1',
      title: 'Engineer',
      companyName: 'Example',
      location: 'Remote',
      department: 'Eng',
      description: scraped().description,
      jobUrl: 'https://example.com/jobs/1',
      postedAt: '2026-10-01T00:00:00.000Z',
      employerBoardName: 'Example',
    } as JobStoreRecord;
    const plan = planIncrementalWrites(
      [record],
      new Map([
        ['ext-1', existing({ missingSinceAt: '2026-10-01T00:00:00.000Z' })],
      ]),
    );
    expect(plan.confirmIds).toEqual([]);
    expect(plan.writeRows).toHaveLength(1);
  });
});

describe('10. source retry policy', () => {
  const error = (message: string) => new Error(message);

  it('discards lock waits that already timed out in Oracle', () => {
    for (const code of ['ORA-00054', 'ORA-30006', 'ORA-04021', 'ORA-02049'])
      expect(sourceRetryDecision(error(`${code}: resource busy`))).toBe(
        'discard',
      );
  });

  it('retries the first call timeout and discards a repeated one', () => {
    const timeout = error('NJS-123: call timeout of 1800000 ms exceeded');
    expect(sourceRetryDecision(timeout, null)).toBe('retry');
    expect(
      sourceRetryDecision(
        timeout,
        'NJS-123: call timeout of 1800000 ms exceeded',
      ),
    ).toBe('discard');
    expect(sourceRetryDecision(timeout, 'greenhouse HTTP 503')).toBe('retry');
  });

  it('keeps retries for transient and non-Oracle failures', () => {
    for (const message of [
      'NJS-500: connection to the Oracle Database was broken',
      'ORA-00060: deadlock detected',
      'ORA-03113: end-of-file on communication channel',
      'greenhouse HTTP 502',
      'Source has no successful or policy-terminal audit',
    ])
      expect(sourceRetryDecision(error(message))).toBe('retry');
    expect(sourceRetryDecision('not an error')).toBe('retry');
  });

  it('runSourceJob discards before rethrowing only for persistent failures', async () => {
    const job = {
      failedReason: undefined as string | undefined,
      discard: jest.fn(),
    };
    await expect(
      runSourceJob(job, () => Promise.reject(error('ORA-30006: timeout'))),
    ).rejects.toThrow('ORA-30006');
    expect(job.discard).toHaveBeenCalledTimes(1);

    job.discard.mockClear();
    await expect(
      runSourceJob(job, () => Promise.reject(error('greenhouse HTTP 500'))),
    ).rejects.toThrow('HTTP 500');
    expect(job.discard).not.toHaveBeenCalled();
    await expect(runSourceJob(job, () => Promise.resolve(7))).resolves.toBe(7);
  });
});
