export function planSourceIngestionJobs(sourceIds: string[]) {
  return sourceIds.map((sourceId) => ({
    name: 'ingest-source',
    data: { sourceId },
    opts: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }));
}
