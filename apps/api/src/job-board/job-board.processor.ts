import {
  OnQueueError,
  OnQueueFailed,
  OnQueueStalled,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger, Optional } from '@nestjs/common';
import * as Bull from 'bull';
import { JobBoardService } from './job-board.service';
import { CompanyDiscoveryService } from './company-discovery.service';
import type { SchedulerContext } from './scheduler-run-id';
import { sourceRetryDecision } from './ingestion-retry-policy';
import { JobBoardFailureReporter } from './job-board-failure-reporter';

/**
 * Run a source job and stop Bull's remaining attempts when the failure is
 * persistent (see ingestion-retry-policy.ts); the error is still rethrown.
 */
export async function runSourceJob<T>(
  job: Pick<Bull.Job, 'failedReason' | 'discard'>,
  work: () => Promise<T>,
): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (sourceRetryDecision(error, job.failedReason) === 'discard')
      await job.discard();
    throw error;
  }
}

// Oracle's Always Free service has a small connection budget. Keep one normal
// source and one slow source in flight per process; the shared Oracle pool and
// user-facing reads retain the remaining capacity.
export const JOB_BOARD_SOURCE_CONCURRENCY = 1;
export const JOB_BOARD_SLOW_SOURCE_CONCURRENCY = 1;

@Processor('job-board')
export class JobBoardProcessor {
  private readonly logger = new Logger(JobBoardProcessor.name);

  constructor(
    private readonly jobBoard: JobBoardService,
    private readonly companyDiscovery: CompanyDiscoveryService,
    @Optional() private readonly failureReporter?: JobBoardFailureReporter,
  ) {}

  /** Redis/Bull connection or command errors; only a fixed signal is sent. */
  @OnQueueError()
  onQueueError() {
    this.logger.error('Job-board queue error');
    void this.failureReporter?.report('queue-error');
  }

  // Bull adds concurrency across named registrations. One wildcard dispatcher
  // enforces the normal lane's limit across coordinator/source/discovery work.
  @Process({ name: '*', concurrency: JOB_BOARD_SOURCE_CONCURRENCY })
  async process(
    job: Bull.Job<
      SchedulerContext & {
        sourceId: string;
        sourceIds?: string[];
        pacingGapMs?: number;
      }
    >,
  ) {
    switch (job.name) {
      case 'ingest-enabled-sources':
        return this.ingestEnabledSources(job);
      case 'ingest-source':
        return this.ingestSource(job);
      case 'discover-company-batch':
        return this.discoverCompanyBatch();
      default:
        throw new Error('Unknown job-board job type');
    }
  }

  async ingestEnabledSources(
    job: Bull.Job<SchedulerContext & { sourceIds?: string[] }>,
  ) {
    const result = await this.jobBoard.enqueueEnabledSourceJobs(
      job.data,
      async (sourceIds) => job.update({ ...job.data, sourceIds }),
    );
    if (result.deferred) {
      await this.jobBoard.markSchedulerRunDeferred(
        job.data.schedulerRunId,
        result.deferredReason || 'job-board work deferred',
      );
    }
    this.logger.log(
      `Queued ${result.sourcesQueued} independently retryable ATS source jobs (${result.slowSourcesQueued} slow-lane)`,
    );
    return result;
  }

  async ingestSource(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
  ) {
    return runSourceJob(job, () =>
      this.jobBoard.ingestSourceById(job.data.sourceId, job.data),
    );
  }

  @OnQueueStalled({ name: 'ingest-source' })
  async onSourceStalled(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
  ) {
    this.logger.warn(
      `ATS source job ${job.id} stalled; Bull will allow one bounded replay`,
    );
    void this.failureReporter?.report('source-stalled');
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      await this.jobBoard.markSourceAuditFailed(
        job.data.sourceId,
        job.data,
        'stalled job exceeded retry limit',
      );
    }
  }

  @OnQueueFailed({ name: 'ingest-source' })
  async onSourceFailed(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
    error: Error,
  ) {
    const attempts = job.opts.attempts || 3;
    // Bull's stalled counter is independent of attemptsMade. Exhausting the
    // stall allowance is terminal even when no ordinary retry was consumed.
    if (
      job.attemptsMade < attempts &&
      !error.message.includes('job stalled more than allowable limit')
    )
      return;
    await this.jobBoard.markSourceAuditFailed(
      job.data.sourceId,
      job.data,
      `source job exhausted retries: ${error.message}`,
    );
  }

  async discoverCompanyBatch() {
    const result = await this.companyDiscovery.discoverNextBatch(10);
    this.logger.log(
      `Company discovery checked ${result.companiesAttempted} companies and queued ${result.boardsQueuedForReview} boards`,
    );
    return result;
  }
}

/** Slow boards run in an isolated lane so one large response cannot consume
 * both normal worker slots for the rest of the hourly window. */
@Processor('job-board-slow')
export class SlowJobBoardProcessor {
  private readonly logger = new Logger(SlowJobBoardProcessor.name);

  constructor(
    private readonly jobBoard: JobBoardService,
    @Optional() private readonly failureReporter?: JobBoardFailureReporter,
  ) {}

  @OnQueueError()
  onQueueError() {
    this.logger.error('Slow job-board queue error');
    void this.failureReporter?.report('queue-error');
  }

  @Process({
    name: 'ingest-source',
    concurrency: JOB_BOARD_SLOW_SOURCE_CONCURRENCY,
  })
  async ingestSource(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
  ) {
    return runSourceJob(job, () =>
      this.jobBoard.ingestSourceById(job.data.sourceId, job.data),
    );
  }

  @OnQueueStalled({ name: 'ingest-source' })
  async onSourceStalled(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
  ) {
    this.logger.warn(`Slow ATS source job ${job.id} stalled`);
    void this.failureReporter?.report('source-stalled');
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      await this.jobBoard.markSourceAuditFailed(
        job.data.sourceId,
        job.data,
        'stalled job exceeded retry limit',
      );
    }
  }

  @OnQueueFailed({ name: 'ingest-source' })
  async onSourceFailed(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
    error: Error,
  ) {
    const attempts = job.opts.attempts || 3;
    if (
      job.attemptsMade < attempts &&
      !error.message.includes('job stalled more than allowable limit')
    )
      return;
    await this.jobBoard.markSourceAuditFailed(
      job.data.sourceId,
      job.data,
      `source job exhausted retries: ${error.message}`,
    );
  }
}
