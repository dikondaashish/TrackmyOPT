import {
  BadRequestException,
  Controller,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { JobBoardService } from './job-board.service';
import {
  normalizeSchedulerRunId,
  normalizeTriggerOrigin,
} from './scheduler-run-id';

@Controller('job-board')
export class JobBoardController {
  constructor(private readonly jobBoard: JobBoardService) {}

  // Protected by the app-wide API-key guard. This only queues enabled,
  // previously authorized sources; it never accepts arbitrary board URLs.
  @Post('ingest-enabled-sources')
  async queueEnabledSources(
    @Headers('x-scheduler-run-id') schedulerRunId?: string,
    @Headers('x-trigger-origin') triggerOrigin?: string,
  ) {
    const normalizedRunId = normalizeSchedulerRunId(schedulerRunId);
    if (!normalizedRunId) {
      throw new BadRequestException(
        'A valid x-scheduler-run-id header is required',
      );
    }
    return this.jobBoard.queueEnabledSources({
      schedulerRunId: normalizedRunId,
      triggerOrigin: normalizeTriggerOrigin(triggerOrigin),
    });
  }

  /** Targeted recovery endpoint; authentication is provided by the app-wide API-key guard. */
  @Post('ingest-source/:sourceId')
  async queueSingleSource(
    @Param('sourceId') sourceId: string,
    @Headers('x-scheduler-run-id') schedulerRunId?: string,
    @Headers('x-trigger-origin') triggerOrigin?: string,
  ) {
    const normalizedRunId = normalizeSchedulerRunId(schedulerRunId);
    if (!normalizedRunId) {
      throw new BadRequestException(
        'A valid x-scheduler-run-id header is required',
      );
    }
    if (!sourceId?.trim()) {
      throw new BadRequestException('sourceId is required');
    }
    return this.jobBoard.queueSingleSource(sourceId, {
      schedulerRunId: normalizedRunId,
      triggerOrigin: normalizeTriggerOrigin(triggerOrigin),
    });
  }

  // Discovery is deliberately review-only: it records candidates in
  // ats_boards/source_verification_queue and never enables ats_sources.
  @Post('discover-companies')
  async queueCompanyDiscovery() {
    const job = await this.jobBoard.queueCompanyDiscovery();
    return { status: 'queued', jobId: job.id };
  }
}
