import { ConfigService } from '@nestjs/config';
import { JobBoardService } from './job-board.service';
import {
  JobBoardProcessor,
  SlowJobBoardProcessor,
} from './job-board.processor';
import { jobBoardWorkerProviders } from './job-board.module';
import {
  isJobBoardWorkerEnabled,
  parseExcludedSourceIds,
  parseProviderMinGaps,
  readPacingWindowMs,
  redisEvictionPolicy,
} from './ingestion-automation-config';
import {
  calculatePacingGapMs,
  MIN_INTER_REQUEST_GAP_MS,
  PACING_TARGET_WINDOW_MS,
  selectFailedSourcesForRecovery,
} from './source-job-planning';

const context = {
  schedulerRunId: 'job-board-hour-2026-10-15T18',
  triggerOrigin: 'github_actions' as const,
  jobStoreKind: 'oracle' as const,
  runStartedAt: '2026-10-15T18:05:00Z',
};

function service(settings: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test',
    JOB_DATA_STORE: 'oracle',
    ...settings,
  };
  const queue = (jobs: unknown[] = []) => ({
    getJobs: jest.fn().mockResolvedValue(jobs),
    addBulk: jest.fn().mockResolvedValue([]),
    pause: jest.fn().mockResolvedValue(undefined),
    resume: jest.fn().mockResolvedValue(undefined),
    isPaused: jest.fn().mockResolvedValue(false),
    getJob: jest.fn(),
    client: {
      info: jest.fn().mockResolvedValue('maxmemory_policy:noeviction\r\n'),
    },
  });
  const normal = queue();
  const slow = queue();
  const instance = new JobBoardService(
    { get: (key: string) => values[key] } as ConfigService,
    normal as never,
    slow as never,
    {} as never,
    {} as never,
    {} as never,
  );
  return { instance, normal, slow };
}

/** Mimics PostgREST paging: each range returns at most 1,000 rows. */
function enabledSources(ids: string[]) {
  const rows = ids.map((id) => ({ id }));
  const query = {
    select: () => query,
    eq: () => query,
    order: () => query,
    range: (from: number, to: number) =>
      Promise.resolve({
        data: rows.slice(from, Math.min(to + 1, from + 1_000)),
        error: null,
      }),
  };
  return { from: () => query };
}

describe('dedicated worker', () => {
  it('registers Bull consumers unless JOB_BOARD_WORKER_ENABLED is false', () => {
    expect(jobBoardWorkerProviders({})).toEqual([
      JobBoardProcessor,
      SlowJobBoardProcessor,
    ]);
    expect(
      jobBoardWorkerProviders({ JOB_BOARD_WORKER_ENABLED: 'true' }),
    ).toHaveLength(2);
    expect(
      jobBoardWorkerProviders({ JOB_BOARD_WORKER_ENABLED: 'false' }),
    ).toEqual([]);
    expect(isJobBoardWorkerEnabled(false)).toBe(false);
    expect(isJobBoardWorkerEnabled(undefined)).toBe(true);
  });

  it('never pauses the shared queues from a non-worker process, even with the boot guard on', async () => {
    const { instance, normal, slow } = service({
      JOB_BOARD_WORKER_ENABLED: false,
      JOB_BOARD_QUEUE_PAUSE_ON_BOOT: true,
    });
    await instance.onModuleInit();
    expect(normal.pause).not.toHaveBeenCalled();
    expect(slow.pause).not.toHaveBeenCalled();
  });

  it('keeps the existing emergency boot pause on the worker', async () => {
    const { instance, normal, slow } = service({
      JOB_BOARD_QUEUE_PAUSE_ON_BOOT: true,
    });
    await instance.onModuleInit();
    expect(normal.pause).toHaveBeenCalledTimes(1);
    expect(slow.pause).toHaveBeenCalledTimes(1);
  });

  it('reports an evicting Redis policy on worker boot', async () => {
    const { instance, normal } = service();
    normal.client.info.mockResolvedValue('maxmemory_policy:allkeys-lru\r\n');
    const error = jest.fn();
    (instance as unknown as { logger: unknown }).logger = {
      error,
      warn: jest.fn(),
      log: jest.fn(),
    };
    await instance.onModuleInit();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('maxmemory-policy is allkeys-lru'),
    );
    expect(
      redisEvictionPolicy('# Memory\r\nmaxmemory_policy:noeviction\r\n'),
    ).toBe('noeviction');
  });
});

describe('overlap guard', () => {
  it('defers a full run while another run still has a queued or active Bull job', async () => {
    const { instance, normal } = service();
    (instance as unknown as { supabase: unknown }).supabase = enabledSources([
      'a',
    ]);
    // An "active" job holds a renewed Bull lock for as long as it runs, so a
    // multi-hour run keeps blocking: there is no TTL to expire.
    normal.getJobs.mockResolvedValue([
      {
        name: 'ingest-source',
        data: { sourceId: 'x', schedulerRunId: 'job-board-manual-backfill' },
      },
    ]);
    const result = await instance.enqueueEnabledSourceJobs(context);
    expect(result).toMatchObject({
      deferred: true,
      sourcesQueued: 0,
      deferredReason: 'overlap guard: another ingestion run is still active',
    });
    expect(normal.addBulk).not.toHaveBeenCalled();
  });

  it('ignores the run itself and company discovery work', async () => {
    const { instance, normal } = service();
    const internal = instance as unknown as {
      supabase: unknown;
      getSlowSourceIds: () => Promise<Set<string>>;
    };
    internal.supabase = enabledSources(['a']);
    internal.getSlowSourceIds = () => Promise.resolve(new Set());
    normal.getJobs.mockResolvedValue([
      { name: 'ingest-enabled-sources', data: context },
      { name: 'discover-company-batch', data: {} },
    ]);
    const result = await instance.enqueueEnabledSourceJobs(context);
    expect(result).toMatchObject({ deferred: false, sourcesQueued: 1 });
  });
});

describe('source selection', () => {
  it('queues every enabled source past the 1,000-row page limit', async () => {
    const { instance, normal } = service();
    const ids = Array.from(
      { length: 1_261 },
      (_, index) =>
        `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    );
    const internal = instance as unknown as {
      supabase: unknown;
      getSlowSourceIds: () => Promise<Set<string>>;
    };
    internal.supabase = enabledSources(ids);
    internal.getSlowSourceIds = () => Promise.resolve(new Set());
    normal.getJobs.mockResolvedValue([]);
    let manifest: string[] = [];
    const result = await instance.enqueueEnabledSourceJobs(
      context,
      (sourceIds) => {
        manifest = sourceIds;
        return Promise.resolve();
      },
    );
    expect(result).toMatchObject({ deferred: false, sourcesQueued: 1_261 });
    expect(manifest).toHaveLength(1_261);
  });
});

describe('pacing and provider limits', () => {
  it('keeps the 40-minute default and accepts a bounded override', () => {
    expect(readPacingWindowMs(undefined)).toBe(PACING_TARGET_WINDOW_MS);
    expect(readPacingWindowMs('abc')).toBe(PACING_TARGET_WINDOW_MS);
    expect(readPacingWindowMs(1_000)).toBe(PACING_TARGET_WINDOW_MS);
    expect(readPacingWindowMs(15 * 60_000)).toBe(15 * 60_000);
    expect(calculatePacingGapMs(172)).toBe(
      Math.floor(PACING_TARGET_WINDOW_MS / 171),
    );
    expect(calculatePacingGapMs(172, 5 * 60_000)).toBe(
      MIN_INTER_REQUEST_GAP_MS,
    );
  });

  it('parses provider gaps and drops malformed entries', () => {
    expect([
      ...parseProviderMinGaps(
        'greenhouse=5000, Workday=15000,bad,ashby=-1,lever=x,smart recruiters=1',
      ),
    ]).toEqual([
      ['greenhouse', 5000],
      ['workday', 15000],
    ]);
    expect(parseProviderMinGaps(undefined).size).toBe(0);
  });

  it('spaces fetches to the same provider by its minimum gap', async () => {
    jest.useFakeTimers({ now: 1_000_000 });
    try {
      const { instance } = service({
        JOB_BOARD_PROVIDER_MIN_GAP_MS: 'workday=20000',
      });
      const internal = instance as unknown as {
        waitForRequestSlot: (gap: number, provider?: string) => Promise<void>;
      };
      const slot = (gap: number, provider: string): Promise<void> =>
        internal.waitForRequestSlot(gap, provider);
      await slot(MIN_INTER_REQUEST_GAP_MS, 'workday');
      let second = false;
      const pending = slot(MIN_INTER_REQUEST_GAP_MS, 'workday').then(() => {
        second = true;
      });
      await jest.advanceTimersByTimeAsync(MIN_INTER_REQUEST_GAP_MS + 1);
      expect(second).toBe(false);
      await jest.advanceTimersByTimeAsync(20_000);
      await pending;
      expect(second).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('targeted recovery', () => {
  it('selects only failed sources without pending work', () => {
    expect(
      selectFailedSourcesForRecovery(
        [
          'ok',
          'failed',
          'retried-ok',
          'started',
          'missing',
          'queued',
          'failed',
        ],
        [
          { source_id: 'ok', status: 'succeeded' },
          { source_id: 'failed', status: 'failed' },
          // Newest first: the latest attempt succeeded.
          { source_id: 'retried-ok', status: 'succeeded' },
          { source_id: 'retried-ok', status: 'failed' },
          { source_id: 'started', status: 'started' },
          { source_id: 'queued', status: 'failed' },
        ],
        ['queued'],
      ),
    ).toEqual(['failed']);
  });

  it('requeues failed sources under fresh job IDs and is idempotent while they are pending', async () => {
    const { instance, normal } = service({
      JOB_BOARD_QUEUE_CONTROL_ENABLED: true,
    });
    const internal = instance as unknown as {
      supabase: unknown;
      getSlowSourceIds: () => Promise<Set<string>>;
    };
    internal.getSlowSourceIds = () => Promise.resolve(new Set());
    const audits = [
      { source_id: 'b', status: 'failed', run_at: '2026-10-15T18:20:00Z' },
      { source_id: 'a', status: 'succeeded', run_at: '2026-10-15T18:10:00Z' },
    ];
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      range: () => Promise.resolve({ data: audits, error: null }),
    };
    internal.supabase = { from: () => query };
    normal.getJob.mockResolvedValue({
      data: { ...context, sourceIds: ['a', 'b'] },
    });
    const failedJob = {
      getState: () => Promise.resolve('failed'),
      data: { ...context, sourceId: 'b' },
      opts: { jobId: `${context.schedulerRunId}:b` },
    };
    normal.getJobs.mockImplementation((states: string[]) =>
      Promise.resolve(states.includes('failed') ? [failedJob] : []),
    );

    const first = await instance.recoverFailedSources(context.schedulerRunId);
    expect(first).toMatchObject({ sourcesRequeued: 1, sourceIds: ['b'] });
    const added = (normal.addBulk.mock.calls as unknown[][])[0][0] as {
      data: { sourceId: string; runStartedAt: string };
      opts: { jobId: string };
    }[];
    expect(added).toHaveLength(1);
    expect(added[0].data).toMatchObject({
      sourceId: 'b',
      runStartedAt: context.runStartedAt,
    });
    expect(added[0].opts.jobId).toMatch(/:b:recover-\d+$/);

    // While the recovery job is pending, a second call queues nothing.
    normal.getJobs.mockImplementation(() =>
      Promise.resolve([
        {
          getState: () => Promise.resolve('waiting'),
          data: { ...context, sourceId: 'b' },
        },
      ]),
    );
    normal.addBulk.mockClear();
    const second = await instance.recoverFailedSources(context.schedulerRunId);
    expect(second).toMatchObject({ sourcesRequeued: 0 });
    expect(normal.addBulk).not.toHaveBeenCalled();
  });

  it('refuses while queues are paused or queue control is disabled', async () => {
    const off = service();
    await expect(
      off.instance.recoverFailedSources(context.schedulerRunId),
    ).rejects.toThrow('queue control is disabled');
    const paused = service({ JOB_BOARD_QUEUE_CONTROL_ENABLED: true });
    paused.slow.isPaused.mockResolvedValue(true);
    await expect(
      paused.instance.recoverFailedSources(context.schedulerRunId),
    ).rejects.toThrow('ingestion_queue_paused');
  });
});

describe('excluded sources', () => {
  const amboss = '21b6d1cf-de4c-42b7-8a6f-5f2de2fd641d';

  it('parses only well-formed source IDs', () => {
    expect([
      ...parseExcludedSourceIds(` ${amboss.toUpperCase()} ,bad-id,, `),
    ]).toEqual([amboss]);
    expect(parseExcludedSourceIds(undefined).size).toBe(0);
  });

  it('leaves an excluded source out of the full-run manifest only', async () => {
    const { instance, normal } = service({
      JOB_BOARD_EXCLUDED_SOURCE_IDS: amboss,
    });
    const internal = instance as unknown as {
      supabase: unknown;
      getSlowSourceIds: () => Promise<Set<string>>;
    };
    internal.supabase = enabledSources([amboss, 'other-source']);
    internal.getSlowSourceIds = () => Promise.resolve(new Set());
    const saved: string[][] = [];
    const result = await instance.enqueueEnabledSourceJobs(context, (ids) => {
      saved.push(ids);
      return Promise.resolve();
    });
    expect(saved).toEqual([['other-source']]);
    expect(result).toMatchObject({ sourcesQueued: 1 });
    expect(normal.addBulk).toHaveBeenCalledTimes(1);
  });
});
