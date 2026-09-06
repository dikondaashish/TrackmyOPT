import type { JobDataStoreKind } from './job-data-store.config';

const HOURLY_RUN_ID = /^job-board-hour-\d{4}-\d{2}-\d{2}T\d{2}$/;
const MANUAL_RUN_ID = /^job-board-manual-[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export const TRIGGER_ORIGINS = [
  'cron_jobs_org',
  'github_actions',
  'manual',
  'unknown',
] as const;

export type TriggerOrigin = (typeof TRIGGER_ORIGINS)[number];

export type SchedulerContext = {
  schedulerRunId: string;
  triggerOrigin: TriggerOrigin;
};

/** Assigned by the API, never accepted from scheduler headers. Persisted Bull
 * work must not change its destination when a deployment changes stores. */
export type IngestionStoreContext = SchedulerContext & {
  jobStoreKind: JobDataStoreKind;
  runStartedAt: string;
};

export function ingestionReservationParams(
  sourceId: string,
  context: SchedulerContext,
) {
  return {
    source: sourceId,
    scheduler_id: context.schedulerRunId,
    origin: context.triggerOrigin,
  };
}

export function normalizeSchedulerRunId(value: unknown): string | null {
  return typeof value === 'string' &&
    (HOURLY_RUN_ID.test(value) || MANUAL_RUN_ID.test(value))
    ? value
    : null;
}

export function normalizeTriggerOrigin(value: unknown): TriggerOrigin {
  return typeof value === 'string' &&
    TRIGGER_ORIGINS.includes(value as TriggerOrigin)
    ? (value as TriggerOrigin)
    : 'unknown';
}

export function planIngestionOrchestratorOptions(schedulerRunId: string) {
  const retryOptions = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 30_000 },
    removeOnFail: false,
  };

  return {
    ...retryOptions,
    jobId: schedulerRunId,
    // Bull must retain recent completed job IDs as a second dedupe layer.
    removeOnComplete: 3,
  };
}
