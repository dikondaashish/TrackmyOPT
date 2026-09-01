import { planSourceIngestionJobs } from './source-job-planning';

describe('source ingestion job planning', () => {
  it('creates one independently retryable queue job per enabled source', () => {
    const context = {
      schedulerRunId: 'job-board-hour-2026-09-01T03',
      triggerOrigin: 'cron_jobs_org' as const,
    };
    expect(planSourceIngestionJobs(['source-a', 'source-b'], context)).toEqual([
      {
        name: 'ingest-source',
        data: { sourceId: 'source-a', ...context },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 30_000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      {
        name: 'ingest-source',
        data: { sourceId: 'source-b', ...context },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 30_000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
    ]);
  });

  it('does not enqueue an orchestration job when no source is enabled', () => {
    expect(
      planSourceIngestionJobs([], {
        schedulerRunId: 'job-board-hour-2026-09-01T03',
        triggerOrigin: 'cron_jobs_org',
      }),
    ).toEqual([]);
  });
});
