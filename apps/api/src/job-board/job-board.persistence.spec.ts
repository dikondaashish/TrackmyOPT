import { ConfigService } from '@nestjs/config';
import { JobBoardService } from './job-board.service';
import type { JobStoreRecord } from './job-data-store.contract';

const now = '2026-09-06T12:00:00.000Z';
function row(overrides: Partial<JobStoreRecord> = {}): JobStoreRecord {
  return {
    id: 'job',
    sourceId: 'source',
    sourceAts: 'greenhouse',
    boardToken: 'board',
    externalJobId: 'external',
    title: 'Engineer',
    companyName: 'Example',
    location: null,
    department: null,
    description: 'Sponsorship available',
    jobUrl: 'https://example.com/job',
    postedAt: now,
    updatedAt: now,
    createdAt: now,
    firstSeenAt: now,
    lastConfirmedAt: now,
    listingStatus: 'open',
    employerBoardName: 'Example',
    sourceTrustTier: 'verified_ats',
    employerMatchId: null,
    missingSinceAt: null,
    removedAt: null,
    optEligible: null,
    stemOptEligible: null,
    cptEligible: null,
    h1bSponsorStatus: null,
    ...overrides,
  };
}

function setup() {
  const config = {
    get: (key: string) =>
      ({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test',
        JOB_DATA_STORE: 'oracle',
      })[key],
  } as unknown as ConfigService;
  const store = {
    listSourceJobs: jest.fn().mockResolvedValue([]),
    listSourceJobsForIngestion: jest.fn().mockResolvedValue([]),
    upsertJobs: jest
      .fn<Promise<void>, [readonly JobStoreRecord[]]>()
      .mockResolvedValue(undefined),
    reconcileSource: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
  };
  const employer = {
    syncSource: jest
      .fn()
      .mockResolvedValue(new Map([['Example', 'match-new']])),
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
      jobs: unknown[],
      complete: boolean,
      runStartedAt?: string,
      outsideUsExternalIds?: readonly string[],
    ): Promise<unknown>;
    storeContext(context: unknown): unknown;
    activeSourceWork: Set<Promise<unknown>>;
    inFlightAuditIds: Set<string>;
    complete: jest.Mock;
    supabase: { from: jest.Mock; rpc: jest.Mock };
  };
  internals.supabase = {
    from: jest.fn(() => {
      throw new Error('unexpected direct database mutation');
    }),
    rpc: jest.fn(),
  };
  const source = {
    id: 'source',
    ats_type: 'greenhouse',
    board_token: 'board',
    employer_board_name: 'Example',
    enabled: true,
  };
  const scraped = {
    external_job_id: 'external',
    title: 'Updated Engineer',
    company_name: 'Example',
    location: 'Remote',
    department: null,
    description: 'Sponsorship available',
    job_url: 'https://example.com/job',
    posted_at: now,
  };
  return { service, internals, store, employer, visa, source, scraped };
}

describe('ingestion store ownership and persistence', () => {
  it('sends creation, lifecycle and newly linked evidence through the Oracle store', async () => {
    const { internals, source, scraped, store, visa } = setup();
    await internals.persistSourceJobs(source, [scraped], true);
    expect(store.upsertJobs).toHaveBeenCalledTimes(2);
    const created = store.upsertJobs.mock.calls[0][0][0];
    expect(created).toMatchObject({
      sourceId: 'source',
      externalJobId: 'external',
      listingStatus: 'open',
      missingSinceAt: null,
      removedAt: null,
    });
    expect(created.id).toBeTruthy();
    expect(store.reconcileSource).toHaveBeenCalledWith(
      'source',
      ['external'],
      undefined,
    );
    expect(visa.syncSource).toHaveBeenCalledWith('source', [
      expect.objectContaining({
        id: created.id,
        employerMatchId: 'match-new',
      }),
    ]);
    expect(internals.supabase.from).not.toHaveBeenCalled();
  });

  it.each(['open', 'stale', 'removed'] as const)(
    'preserves identity and reopens a seen %s job with current lifecycle timestamps',
    async (listingStatus) => {
      const { internals, source, scraped, store } = setup();
      store.listSourceJobsForIngestion.mockResolvedValue([
        row({ listingStatus, missingSinceAt: now, removedAt: now }),
      ]);
      await internals.persistSourceJobs(source, [scraped], true);
      const updated = store.upsertJobs.mock.calls[0][0][0];
      expect(updated).toMatchObject({
        id: 'job',
        title: 'Updated Engineer',
        createdAt: now,
        firstSeenAt: now,
        listingStatus: 'open',
        missingSinceAt: null,
        removedAt: null,
      });
      expect(Date.parse(updated.lastConfirmedAt)).toBeGreaterThan(
        Date.parse(now),
      );
      expect(updated.updatedAt).toBe(updated.lastConfirmedAt);
    },
  );

  // Bull work persisted before the Supabase store was removed still carries
  // jobStoreKind "supabase"; it must never run against the Oracle store.
  it.each([undefined, 'supabase'])(
    'rejects persisted work with missing/different store %s before source reservation or mutation',
    async (jobStoreKind) => {
      const { service, internals, store } = setup();
      const context = {
        schedulerRunId: 'job-board-hour-2026-09-06T17',
        triggerOrigin: 'cron_jobs_org' as const,
        jobStoreKind: jobStoreKind as never,
      };
      await expect(service.ingestSourceById('source', context)).rejects.toThrow(
        'job_store_mismatch',
      );
      expect(await service.enqueueEnabledSourceJobs(context)).toMatchObject({
        deferred: true,
        deferredReason: 'job_store_mismatch',
      });
      expect(internals.supabase.from).not.toHaveBeenCalled();
      expect(internals.supabase.rpc).not.toHaveBeenCalled();
      expect(store.upsertJobs).not.toHaveBeenCalled();
    },
  );

  it('stamps the server-selected store, overriding any caller value', () => {
    const { internals } = setup();
    expect(
      internals.storeContext({
        schedulerRunId: 'run',
        triggerOrigin: 'manual',
        jobStoreKind: 'supabase',
      }),
    ).toMatchObject({ jobStoreKind: 'oracle' });
  });

  it('does not make an active audit retryable before persistence has drained', async () => {
    const { service, internals, store } = setup();
    let release!: () => void;
    const active = new Promise<void>((resolve) => {
      release = resolve;
    }).then(() => {
      internals.inFlightAuditIds.delete('audit');
    });
    internals.inFlightAuditIds.add('audit');
    internals.activeSourceWork.add(active);
    internals.complete = jest.fn();
    const shutdown = service.onModuleDestroy();
    await Promise.resolve();
    expect(internals.complete).not.toHaveBeenCalled();
    expect(store.close).not.toHaveBeenCalled();
    release();
    await shutdown;
    expect(internals.complete).not.toHaveBeenCalled();
    expect(store.close).toHaveBeenCalledTimes(1);
  });
});

describe('ingestion stage watchdog', () => {
  afterEach(() => jest.useRealTimers());

  function logger(service: JobBoardService) {
    const internals = service as unknown as {
      logger: { warn: jest.Mock; error: jest.Mock };
    };
    internals.logger = { warn: jest.fn(), error: jest.fn() };
    return internals.logger;
  }

  it('names the stage a hanging write is stuck in, without job content', async () => {
    jest.useFakeTimers();
    const { internals, source, scraped, store } = setup();
    const log = logger(internals as unknown as JobBoardService);
    let release!: () => void;
    store.upsertJobs.mockImplementationOnce(
      () => new Promise<void>((resolve) => (release = resolve)),
    );
    const pending = internals.persistSourceJobs(source, [scraped], true);
    await jest.advanceTimersByTimeAsync(125_000);
    expect(log.warn).toHaveBeenCalledWith(
      'Job-board source source still in stage store-upsert after 60s',
    );
    expect(log.warn).toHaveBeenCalledWith(
      'Job-board source source still in stage store-upsert after 120s',
    );
    const messages = log.warn.mock.calls.map(([message]) => String(message));
    expect(messages.join('\n')).not.toContain('Updated Engineer');
    release();
    await pending;
    log.warn.mockClear();
    await jest.advanceTimersByTimeAsync(120_000);
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('reports the failing stage and propagates the original error', async () => {
    const { internals, source, scraped, store, visa } = setup();
    const log = logger(internals as unknown as JobBoardService);
    store.upsertJobs.mockRejectedValueOnce(
      new Error('NJS-123: call timeout of 1800000 ms exceeded'),
    );
    await expect(
      internals.persistSourceJobs(source, [scraped], true),
    ).rejects.toThrow('NJS-123');
    expect(log.warn).toHaveBeenCalledWith(
      'Job-board source source failed in stage store-upsert after 0s',
    );
    expect(store.reconcileSource).not.toHaveBeenCalled();
    expect(visa.syncSource).not.toHaveBeenCalled();
  });

  it('does not log anything for a healthy source', async () => {
    const { internals, source, scraped } = setup();
    const log = logger(internals as unknown as JobBoardService);
    await internals.persistSourceJobs(source, [scraped], true);
    expect(log.warn).not.toHaveBeenCalled();
  });
});

describe('audit lifecycle counts', () => {
  // One open job and one stale job are missing from the board. The in-memory
  // plan predicts 1 stale and 1 removed; Oracle only removes after 20 hours.
  function withMissingJobs() {
    const ctx = setup();
    ctx.store.listSourceJobsForIngestion.mockResolvedValue([
      row({ id: 'kept', externalJobId: 'external' }),
      row({ id: 'gone-open', externalJobId: 'gone-open' }),
      row({
        id: 'gone-stale',
        externalJobId: 'gone-stale',
        listingStatus: 'stale',
        missingSinceAt: '2026-09-06T08:00:00.000Z',
      }),
    ]);
    return ctx;
  }

  it('reports the transitions the store committed, not the in-memory plan', async () => {
    const { internals, source, scraped, store } = withMissingJobs();
    // Inside the 20-hour window: the stale job stays stale.
    store.reconcileSource.mockResolvedValue({ staleCount: 1, removedCount: 0 });
    await expect(
      internals.persistSourceJobs(source, [scraped], true),
    ).resolves.toMatchObject({ jobsStale: 1, jobsRemoved: 0 });
  });

  it('keeps plan counts for stores that do not report committed transitions', async () => {
    const { internals, source, scraped } = withMissingJobs();
    await expect(
      internals.persistSourceJobs(source, [scraped], true),
    ).resolves.toMatchObject({ jobsStale: 1, jobsRemoved: 1 });
  });
});

describe('ingestion of jobs outside the United States', () => {
  it('deletes stored jobs that the ATS now lists outside the US', async () => {
    const { internals, source, scraped, store } = setup();
    store.listSourceJobsForIngestion.mockResolvedValue([
      { id: 'job', externalJobId: 'external', listingStatus: 'open' },
      { id: 'job-london', externalJobId: 'london', listingStatus: 'open' },
    ]);
    const deleteJobs = jest.fn().mockResolvedValue(1);
    Object.assign(store, { deleteJobs });

    await internals.persistSourceJobs(source, [scraped], true, undefined, [
      'london',
      'never-stored',
    ]);

    expect(deleteJobs).toHaveBeenCalledWith(['job-london']);
    // The deleted job is not reconciled (it would otherwise go stale).
    expect(store.reconcileSource).toHaveBeenCalledWith(
      'source',
      ['external'],
      undefined,
    );
  });

  it('does not fail a board whose jobs are all outside the US', async () => {
    const { internals, source, store } = setup();
    store.listSourceJobsForIngestion.mockResolvedValue([
      { id: 'job-old', externalJobId: 'old-us', listingStatus: 'removed' },
    ]);
    await expect(
      internals.persistSourceJobs(source, [], true, undefined, ['paris']),
    ).resolves.toMatchObject({ jobsNew: 0 });
  });
});
