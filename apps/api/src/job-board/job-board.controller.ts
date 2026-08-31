import { Controller, Headers, Post } from '@nestjs/common';
import { JobBoardService } from './job-board.service';
import { normalizeSchedulerRunId } from './scheduler-run-id';

@Controller('job-board')
export class JobBoardController {
  constructor(private readonly jobBoard: JobBoardService) {}

  // Protected by the app-wide API-key guard. This only queues enabled,
  // previously authorized sources; it never accepts arbitrary board URLs.
  @Post('ingest-enabled-sources')
  async queueEnabledSources(
    @Headers('x-scheduler-run-id') schedulerRunId?: string,
  ) {
    const job = await this.jobBoard.queueEnabledSources(
      normalizeSchedulerRunId(schedulerRunId),
    );
    return { status: 'queued', jobId: job.id };
  }

  // Discovery is deliberately review-only: it records candidates in
  // ats_boards/source_verification_queue and never enables ats_sources.
  @Post('discover-companies')
  async queueCompanyDiscovery() {
    const job = await this.jobBoard.queueCompanyDiscovery();
    return { status: 'queued', jobId: job.id };
  }
}
