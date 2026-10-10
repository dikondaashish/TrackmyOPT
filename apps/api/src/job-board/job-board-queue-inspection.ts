import type * as Bull from 'bull';
import { summarizeIngestionRun } from './ingestion-run-status';
import { fetchAllPages } from './paginate';
import type { SchedulerContext } from './scheduler-run-id';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Read-only snapshot of both job-board Bull queues. */
export async function readIngestionQueueState(
  queue: Bull.Queue,
  slowQueue: Bull.Queue,
  jobStore: string,
) {
  const [normal, slow, normalPaused, slowPaused] = await Promise.all([
    queue.getJobCounts(),
    slowQueue.getJobCounts(),
    queue.isPaused(),
    slowQueue.isPaused(),
  ]);
  const queued = await Promise.all([
    queue.getJobs(['waiting', 'active', 'delayed', 'paused']),
    slowQueue.getJobs(['waiting', 'active', 'delayed', 'paused']),
  ]);
  const queuedRunCounts = new Map<string, number>();
  for (const job of queued.flat()) {
    const schedulerRunId = (
      job.data as { schedulerRunId?: unknown } | undefined
    )?.schedulerRunId;
    if (typeof schedulerRunId === 'string')
      queuedRunCounts.set(
        schedulerRunId,
        (queuedRunCounts.get(schedulerRunId) || 0) + 1,
      );
  }
  return {
    queues: {
      'job-board': normal,
      'job-board-slow': slow,
    },
    queuesPaused: { normal: normalPaused, slow: slowPaused },
    queuedRunCounts: Object.fromEntries(
      [...queuedRunCounts.entries()].sort(([a], [b]) => a.localeCompare(b)),
    ),
    jobStore,
    note: 'Bull does not retain stalled jobs as a persistent queue state; inspect worker logs for stall events.',
  };
}

/** Bull jobs from both queues belonging to one scheduler run, with state. */
export async function queueJobsForRun(
  queue: Bull.Queue,
  slowQueue: Bull.Queue,
  schedulerRunId: string,
  states: Bull.JobStatus[],
) {
  const jobs = await Promise.all([
    queue.getJobs(states),
    slowQueue.getJobs(states),
  ]);
  const matching = jobs.flat().filter((job) => {
    const data = job.data as Partial<SchedulerContext> | undefined;
    return data?.schedulerRunId === schedulerRunId;
  });
  return Promise.all(
    matching.map(async (job) => ({ job, state: await job.getState() })),
  );
}

/** Read-only run supervision; validation of the run ID stays with the caller. */
export async function readIngestionRunStatus(
  supabase: SupabaseClient,
  queue: Bull.Queue,
  slowQueue: Bull.Queue,
  schedulerRunId: string,
  jobStore: string,
) {
  const job = await queue.getJob(schedulerRunId);
  const audits = await fetchAllPages(async (from, to) => {
    const result = await supabase
      .from('ingestion_audit_log')
      .select('source_id,status,run_at')
      .eq('scheduler_run_id', schedulerRunId)
      .order('run_at', { ascending: false })
      .order('id')
      .range(from, to);
    return { data: result.data || [], error: result.error };
  });
  const runnableStates: Bull.JobStatus[] = [
    'waiting',
    'active',
    'delayed',
    'paused',
  ];
  const [normal, slow, normalPaused, slowPaused] = await Promise.all([
    queue.getJobs(runnableStates),
    slowQueue.getJobs(runnableStates),
    queue.isPaused(),
    slowQueue.isPaused(),
  ]);
  const runnable = [...normal, ...slow].filter(
    (candidate) =>
      (candidate.data as SchedulerContext).schedulerRunId === schedulerRunId,
  ).length;
  const manifest = (job?.data as { sourceIds?: string[] } | undefined)
    ?.sourceIds;
  return {
    schedulerRunId,
    ...summarizeIngestionRun(
      manifest,
      audits,
      runnable,
      job ? await job.getState() : 'missing',
    ),
    queuesPaused: { normal: normalPaused, slow: slowPaused },
    jobStore,
  };
}
