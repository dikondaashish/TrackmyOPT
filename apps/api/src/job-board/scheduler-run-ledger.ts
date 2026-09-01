import type { SchedulerContext } from './scheduler-run-id';

export type SchedulerAttemptOutcome = 'queued' | 'suppressed' | 'failed';

export type SchedulerAttempt = SchedulerContext & {
  bullJobId: string;
  outcome: SchedulerAttemptOutcome;
  queuedAt: string | null;
};

export interface SchedulerRunStore {
  claim(context: SchedulerContext): Promise<boolean>;
  markQueued(schedulerRunId: string, queuedAt: string): Promise<void>;
  recordAttempt(attempt: SchedulerAttempt): Promise<void>;
  releaseClaim(schedulerRunId: string): Promise<void>;
}

export async function queueSchedulerRun(
  context: SchedulerContext,
  store: SchedulerRunStore,
  enqueue: () => Promise<{ id?: string | number }>,
) {
  const bullJobId = context.schedulerRunId;
  const claimed = await store.claim(context);
  if (!claimed) {
    await store.recordAttempt({
      ...context,
      bullJobId,
      outcome: 'suppressed',
      queuedAt: null,
    });
    return { status: 'suppressed' as const, jobId: bullJobId };
  }

  let job: { id?: string | number };
  try {
    job = await enqueue();
  } catch (error) {
    await store.recordAttempt({
      ...context,
      bullJobId,
      outcome: 'failed',
      queuedAt: null,
    });
    await store.releaseClaim(context.schedulerRunId);
    throw error;
  }

  const queuedAt = new Date().toISOString();
  await store.markQueued(context.schedulerRunId, queuedAt);
  await store.recordAttempt({
    ...context,
    bullJobId: String(job.id ?? bullJobId),
    outcome: 'queued',
    queuedAt,
  });
  return { status: 'queued' as const, jobId: String(job.id ?? bullJobId) };
}
