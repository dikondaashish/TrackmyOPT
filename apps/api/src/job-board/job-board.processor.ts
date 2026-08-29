import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { JobBoardService } from './job-board.service';

@Processor('job-board')
export class JobBoardProcessor {
  private readonly logger = new Logger(JobBoardProcessor.name);

  constructor(private readonly jobBoard: JobBoardService) {}

  @Process('ingest-enabled-sources')
  async ingestEnabledSources(_job: Bull.Job<Record<string, never>>) {
    const result = await this.jobBoard.ingestEnabledSources();
    this.logger.log(`Verified job-board ingestion completed for ${result.length} sources`);
    return result;
  }
}
