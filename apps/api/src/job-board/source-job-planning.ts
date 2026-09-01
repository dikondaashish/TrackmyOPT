import type { SchedulerContext } from './scheduler-run-id';

export function planSourceIngestionJobs(
  sourceIds: string[],
  context: SchedulerContext,
) {
  return sourceIds.map((sourceId) => ({
    name: 'ingest-source',
    data: { sourceId, ...context },
    opts: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }));
}
