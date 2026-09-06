import { ConfigService } from '@nestjs/config';
import { JobBoardService } from './job-board.service';
import type { JobStoreRecord } from './job-data-store.contract';
import { compareIdentityRows, signalHash } from './oracle-ingestion-repair';

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

function setup(kind = 'oracle') {
  const config = {
    get: (key: string) =>
      ({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test',
        JOB_DATA_STORE: kind,
      })[key],
  } as unknown as ConfigService;
  const store = {
    listSourceJobs: jest.fn().mockResolvedValue([]),
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
  it.each(['oracle', 'supabase'])(
    'sends creation, lifecycle and newly linked evidence through the selected %s store',
    async (kind) => {
      const { internals, source, scraped, store, visa } = setup(kind);
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
    },
  );

  it.each(['open', 'stale', 'removed'] as const)(
    'preserves identity and reopens a seen %s job with current lifecycle timestamps',
    async (listingStatus) => {
      const { internals, source, scraped, store } = setup();
      store.listSourceJobs.mockResolvedValue([
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

  it.each([undefined, 'supabase'])(
    'rejects persisted work with missing/different store %s before source reservation or mutation',
    async (jobStoreKind) => {
      const { service, internals, store } = setup();
      const context = {
        schedulerRunId: 'job-board-hour-2026-09-06T17',
        triggerOrigin: 'cron_jobs_org' as const,
        jobStoreKind: jobStoreKind as 'supabase' | undefined,
      };
      expect(await service.ingestSourceById('source', context)).toEqual({
        sourceId: 'source',
        skipped: 'job_store_mismatch',
      });
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

describe('bounded ingestion delta accounting', () => {
  it('compares natural identity and detects missing, UUID, lifecycle and content separately', () => {
    const source = row({
      id: 'canonical',
      listingStatus: 'removed',
      removedAt: now,
    });
    const delta = compareIdentityRows([source], [row()])[0];
    expect(delta).toMatchObject({
      missing: false,
      uuid: true,
      oracleId: 'job',
      lifecycle: { supabase: 'removed', oracle: 'open' },
    });
    expect(delta.fields).toEqual(
      expect.arrayContaining(['id', 'listingStatus', 'removedAt']),
    );
    expect(compareIdentityRows([source], [])[0].missing).toBe(true);
  });
  it('is idempotent and canonicalizes every timestamp without hiding descriptions', () => {
    expect(
      compareIdentityRows(
        [row()],
        [row({ postedAt: '2026-09-06T08:00:00.000-04:00' })],
      ),
    ).toEqual([]);
    const delta = compareIdentityRows(
      [row()],
      [row({ description: 'different private contents' })],
    );
    expect(delta[0].fields).toContain('description');
    expect(JSON.stringify(delta)).not.toContain('different private contents');
  });
  it('rejects duplicate natural identity rather than choosing an arbitrary target', () => {
    expect(() =>
      compareIdentityRows([row()], [row(), row({ id: 'duplicate' })]),
    ).toThrow('Duplicate target');
  });
  it('hashes all evidence content, including observation date', () => {
    const signal = {
      jobId: 'job',
      signalType: 'historical_h1b_sponsor',
      evidenceSnippet: 'history',
      sourceUrl: 'https://example.com',
      observedDate: '2026-09-06',
      confidence: 0.95,
      source: 'sponsor_history_db',
    };
    expect(signalHash(signal)).not.toBe(
      signalHash({ ...signal, observedDate: '2026-09-05' }),
    );
  });
});
