import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { JobBoardService } from './job-board.service';
import { CompanyDiscoveryService } from './company-discovery.service';

@Processor('job-board')
export class JobBoardProcessor {
  private readonly logger = new Logger(JobBoardProcessor.name);

  constructor(
    private readonly jobBoard: JobBoardService,
    private readonly companyDiscovery: CompanyDiscoveryService,
  ) {}

  @Process('ingest-enabled-sources')
  async ingestEnabledSources() {
    const result = await this.jobBoard.enqueueEnabledSourceJobs();
    this.logger.log(
      `Queued ${result.sourcesQueued} independently retryable ATS source jobs`,
    );
    return result;
  }

  @Process('ingest-source')
  async ingestSource(job: Bull.Job<{ sourceId: string }>) {
    return this.jobBoard.ingestSourceById(job.data.sourceId);
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
