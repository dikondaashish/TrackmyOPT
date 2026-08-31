import { planSourceIngestionJobs } from './source-job-planning';

describe('source ingestion job planning', () => {
  it('creates one independently retryable queue job per enabled source', () => {
    expect(planSourceIngestionJobs(['source-a', 'source-b'])).toEqual([
      {
        name: 'ingest-source',
        data: { sourceId: 'source-a' },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 30_000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      {
        name: 'ingest-source',
        data: { sourceId: 'source-b' },
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
    expect(planSourceIngestionJobs([])).toEqual([]);
  });
});
