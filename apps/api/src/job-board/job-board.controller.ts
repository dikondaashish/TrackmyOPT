import { Controller, Post } from '@nestjs/common';
import { JobBoardService } from './job-board.service';

@Controller('job-board')
export class JobBoardController {
  constructor(private readonly jobBoard: JobBoardService) {}

  // Protected by the app-wide API-key guard. This only queues enabled,
  // previously authorized sources; it never accepts arbitrary board URLs.
  @Post('ingest-enabled-sources')
  async queueEnabledSources() {
    const job = await this.jobBoard.queueEnabledSources();
    return { status: 'queued', jobId: job.id };
  }
}
