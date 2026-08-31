const SCHEDULER_RUN_ID = /^job-board-hour-\d{4}-\d{2}-\d{2}T\d{2}$/;

export function normalizeSchedulerRunId(value: unknown): string | null {
  return typeof value === 'string' && SCHEDULER_RUN_ID.test(value)
    ? value
    : null;
}

export function planIngestionOrchestratorOptions(
  schedulerRunId: string | null,
) {
  const retryOptions = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 30_000 },
    removeOnFail: false,
  };

  return schedulerRunId
    ? {
        ...retryOptions,
        jobId: schedulerRunId,
        // Bull must retain recent completed job IDs for duplicate wake-ups
        // in the same UTC hour to resolve to the existing job.
        removeOnComplete: 3,
      }
    : { ...retryOptions, removeOnComplete: true };
}
