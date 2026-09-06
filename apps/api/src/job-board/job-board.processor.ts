import {
  OnQueueFailed,
  OnQueueStalled,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { JobBoardService } from './job-board.service';
import { CompanyDiscoveryService } from './company-discovery.service';
import type { SchedulerContext } from './scheduler-run-id';

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
  ) {}

  @Process('ingest-enabled-sources')
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

  @Process({ name: 'ingest-source', concurrency: JOB_BOARD_SOURCE_CONCURRENCY })
  async ingestSource(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
  ) {
    return this.jobBoard.ingestSourceById(job.data.sourceId, job.data);
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

  @Process('discover-company-batch')
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

  constructor(private readonly jobBoard: JobBoardService) {}

  @Process({
    name: 'ingest-source',
    concurrency: JOB_BOARD_SLOW_SOURCE_CONCURRENCY,
  })
  async ingestSource(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
  ) {
    return this.jobBoard.ingestSourceById(job.data.sourceId, job.data);
  }

  @OnQueueStalled({ name: 'ingest-source' })
  async onSourceStalled(
    job: Bull.Job<
      { sourceId: string; pacingGapMs?: number } & SchedulerContext
    >,
  ) {
    this.logger.warn(`Slow ATS source job ${job.id} stalled`);
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
