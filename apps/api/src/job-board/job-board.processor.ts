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

@Processor('job-board')
export class JobBoardProcessor {
  private readonly logger = new Logger(JobBoardProcessor.name);

  constructor(
    private readonly jobBoard: JobBoardService,
    private readonly companyDiscovery: CompanyDiscoveryService,
  ) {}

  @Process('ingest-enabled-sources')
  async ingestEnabledSources(job: Bull.Job<SchedulerContext>) {
    const result = await this.jobBoard.enqueueEnabledSourceJobs(job.data);
    this.logger.log(
      `Queued ${result.sourcesQueued} independently retryable ATS source jobs`,
    );
    return result;
  }

  @Process({ name: 'ingest-source', concurrency: 2 })
  async ingestSource(job: Bull.Job<{ sourceId: string } & SchedulerContext>) {
    return this.jobBoard.ingestSourceById(job.data.sourceId, job.data);
  }

  @OnQueueStalled({ name: 'ingest-source' })
  async onSourceStalled(
    job: Bull.Job<{ sourceId: string } & SchedulerContext>,
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
    job: Bull.Job<{ sourceId: string } & SchedulerContext>,
    error: Error,
  ) {
    const attempts = job.opts.attempts || 3;
    if (job.attemptsMade < attempts) return;
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
