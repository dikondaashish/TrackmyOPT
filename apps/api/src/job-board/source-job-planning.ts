import type { SchedulerContext } from './scheduler-run-id';

/** Keep source starts below a burst while targeting a roughly 40-minute run. */
export const PACING_TARGET_WINDOW_MS = 40 * 60 * 1000;
export const MIN_INTER_REQUEST_GAP_MS = 3_500;

export function calculatePacingGapMs(sourceCount: number) {
  if (sourceCount <= 1) return MIN_INTER_REQUEST_GAP_MS;
  return Math.max(
    MIN_INTER_REQUEST_GAP_MS,
    Math.floor(PACING_TARGET_WINDOW_MS / (sourceCount - 1)),
  );
}

/** Sources whose latest succeeded audit took longer than the slow threshold. */
export const SLOW_SOURCE_DURATION_MS = 60_000;

export function selectSlowSourceIds(
  sourceIds: readonly string[],
  audits: readonly {
    source_id: unknown;
    run_at: unknown;
    completed_at: unknown;
  }[],
  thresholdMs = SLOW_SOURCE_DURATION_MS,
) {
  if (!sourceIds.length) return new Set<string>();
  const latestDurationBySource = new Map<string, number>();
  for (const row of audits) {
    const sourceId = String(row.source_id || '');
    if (!sourceId || latestDurationBySource.has(sourceId)) continue;
    const started = Date.parse(String(row.run_at));
    const completed = Date.parse(String(row.completed_at));
    if (Number.isFinite(started) && Number.isFinite(completed)) {
      latestDurationBySource.set(sourceId, Math.max(0, completed - started));
    }
  }
  return new Set(
    sourceIds.filter(
      (sourceId) => (latestDurationBySource.get(sourceId) || 0) > thresholdMs,
    ),
  );
}

export function planSourceIngestionJobs(
  sourceIds: string[],
  context: SchedulerContext = {
    schedulerRunId: 'job-board-manual-adhoc',
    triggerOrigin: 'manual',
  },
  pacingGapMs = calculatePacingGapMs(sourceIds.length),
) {
  // Every trigger uses the same pacing. Manual runs are exempt from hourly
  // deduplication, not from the source concurrency/rate budget. The worker
  // reserves the next request slot when it is ready, so completed sources do
  // not leave a fixed-delay queue idling.
  const orderedSourceIds = [...sourceIds].sort();
  return orderedSourceIds.map((sourceId) => ({
    name: 'ingest-source',
    data: { sourceId, pacingGapMs, ...context },
    opts: {
      jobId: `${context.schedulerRunId}:${sourceId}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      delay: 0,
      removeOnComplete: true,
      removeOnFail: false,
    },
  }));
}
