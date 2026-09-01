import { planSourceIngestionJobs } from './source-job-planning';

describe('source ingestion job planning', () => {
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
      expect(typeof job.opts.delay).toBe('number');
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

  it('spreads hourly source starts across the hour deterministically', () => {
    const jobs = planSourceIngestionJobs(['source-b', 'source-a', 'source-c'], {
      schedulerRunId: 'job-board-hour-2026-09-01T03',
      triggerOrigin: 'cron_jobs_org',
    });
    expect(jobs.map((job) => job.data.sourceId)).toEqual([
      'source-a',
      'source-b',
      'source-c',
    ]);
    expect(jobs.every((job) => typeof job.opts.delay === 'number')).toBe(true);
    expect(jobs[0].opts.delay).toBeLessThan(jobs[1].opts.delay as number);
    expect(jobs[1].opts.delay).toBeLessThan(jobs[2].opts.delay as number);
  });

  it('does not delay manual source runs', () => {
    const [job] = planSourceIngestionJobs(['source-a'], {
      schedulerRunId: 'job-board-manual-smoke',
      triggerOrigin: 'manual',
    });
    expect(job.opts.delay).toBeUndefined();
  });
});
