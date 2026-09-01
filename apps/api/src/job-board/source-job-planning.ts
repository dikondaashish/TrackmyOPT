import type { SchedulerContext } from './scheduler-run-id';

const STAGGER_WINDOW_MS = 60 * 60 * 1000;
const JITTER_MS = 1_500;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function staggerDelayMs(sourceId: string, index: number, total: number) {
  if (total <= 1) return 0;
  const evenlySpaced = Math.floor(
    (index * (STAGGER_WINDOW_MS - 1)) / (total - 1),
  );
  const jitter = (stableHash(sourceId) % (JITTER_MS * 2 + 1)) - JITTER_MS;
  return Math.max(0, Math.min(STAGGER_WINDOW_MS - 1, evenlySpaced + jitter));
}

export function planSourceIngestionJobs(
  sourceIds: string[],
  context: SchedulerContext = {
    schedulerRunId: 'job-board-manual-adhoc',
    triggerOrigin: 'manual',
  },
) {
  // Every trigger uses the same deterministic pacing. Manual runs are exempt
  // from hourly deduplication, not from the source concurrency/rate budget.
  const orderedSourceIds = [...sourceIds].sort();
  return orderedSourceIds.map((sourceId, index) => ({
    name: 'ingest-source',
    data: { sourceId, ...context },
    opts: {
      jobId: `${context.schedulerRunId}:${sourceId}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      delay: staggerDelayMs(sourceId, index, orderedSourceIds.length),
      removeOnComplete: true,
      removeOnFail: false,
    },
  }));
}
