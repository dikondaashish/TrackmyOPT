import {
  calculatePacingGapMs,
  MIN_INTER_REQUEST_GAP_MS,
  planSourceIngestionJobs,
  selectSlowSourceIds,
} from './source-job-planning';
import {
  JOB_BOARD_SOURCE_CONCURRENCY,
  JOB_BOARD_SLOW_SOURCE_CONCURRENCY,
} from './job-board.processor';

describe('source ingestion job planning', () => {
  it('keeps source workers bounded for the shared Oracle pool', () => {
    expect(JOB_BOARD_SOURCE_CONCURRENCY).toBe(1);
    expect(JOB_BOARD_SLOW_SOURCE_CONCURRENCY).toBe(1);
  });
  it('creates one independently retryable queue job per enabled source', () => {
    const context = {
      schedulerRunId: 'job-board-hour-2026-09-01T03',
      triggerOrigin: 'cron_jobs_org' as const,
    };
    const jobs = planSourceIngestionJobs(['source-a', 'source-b'], context);
    expect(jobs).toHaveLength(2);
    expect(jobs.map((job) => job.name)).toEqual([
      'ingest-source',
      'ingest-source',
    ]);
    expect(jobs.map((job) => job.data.sourceId)).toEqual([
      'source-a',
      'source-b',
    ]);
    for (const job of jobs) {
      expect(job.data.schedulerRunId).toBe(context.schedulerRunId);
      expect(job.data.triggerOrigin).toBe(context.triggerOrigin);
      expect(job.opts.attempts).toBe(3);
      expect(job.opts.backoff).toEqual({ type: 'exponential', delay: 30_000 });
      expect(job.opts.delay).toBe(0);
      expect(job.data.pacingGapMs).toBe(calculatePacingGapMs(2));
      expect(job.opts.removeOnComplete).toBe(true);
      expect(job.opts.removeOnFail).toBe(false);
    }
  });

  it('does not enqueue an orchestration job when no source is enabled', () => {
    expect(
      planSourceIngestionJobs([], {
        schedulerRunId: 'job-board-hour-2026-09-01T03',
        triggerOrigin: 'cron_jobs_org',
      }),
    ).toEqual([]);
  });

  it('uses a compressed pacing target without fixed delayed queue jobs', () => {
    const jobs = planSourceIngestionJobs(['source-b', 'source-a', 'source-c'], {
      schedulerRunId: 'job-board-hour-2026-09-01T03',
      triggerOrigin: 'cron_jobs_org',
    });
    expect(jobs.map((job) => job.data.sourceId)).toEqual([
      'source-a',
      'source-b',
      'source-c',
    ]);
    expect(jobs.every((job) => job.opts.delay === 0)).toBe(true);
    expect(
      jobs.every((job) => job.data.pacingGapMs === calculatePacingGapMs(3)),
    ).toBe(true);
  });

  it('paces manual source runs while keeping their IDs independent of hourly dedupe', () => {
    const jobs = planSourceIngestionJobs(['source-b', 'source-a'], {
      schedulerRunId: 'job-board-manual-smoke',
      triggerOrigin: 'manual',
    });
    expect(jobs.map((job) => job.data.sourceId)).toEqual([
      'source-a',
      'source-b',
    ]);
    expect(jobs.every((job) => job.opts.delay === 0)).toBe(true);
    expect(
      jobs.every((job) => job.data.pacingGapMs === calculatePacingGapMs(2)),
    ).toBe(true);
    expect(jobs[0].opts.jobId).toBe('job-board-manual-smoke:source-a');
  });

  it('keeps the global request rate bounded as source volume changes', () => {
    expect(calculatePacingGapMs(174)).toBe(13_872);
    expect(calculatePacingGapMs(692)).toBe(3_500);
    expect(calculatePacingGapMs(692)).toBeGreaterThanOrEqual(
      MIN_INTER_REQUEST_GAP_MS,
    );
  });

  it('marks only sources whose latest succeeded audit exceeded the slow threshold', () => {
    const slow = selectSlowSourceIds(
      ['fast', 'slow', 'missing'],
      [
        {
          source_id: 'slow',
          run_at: '2026-09-06T12:00:00.000Z',
          completed_at: '2026-09-06T12:01:01.000Z',
        },
        {
          source_id: 'fast',
          run_at: '2026-09-06T12:00:00.000Z',
          completed_at: '2026-09-06T12:00:30.000Z',
        },
        {
          source_id: 'slow',
          run_at: '2026-09-06T11:00:00.000Z',
          completed_at: '2026-09-06T11:00:10.000Z',
        },
      ],
    );
    expect([...slow].sort()).toEqual(['slow']);
  });
});
