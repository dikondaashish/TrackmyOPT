import {
  BadRequestException,
  Controller,
  Headers,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { JobBoardService } from './job-board.service';
import { JobVisaSignalService } from './job-visa-signal.service';
import type { JobStoreSearch } from './job-data-store.contract';
import {
  normalizeSchedulerRunId,
  normalizeTriggerOrigin,
} from './scheduler-run-id';

@Controller('job-board')
export class JobBoardController {
  constructor(
    private readonly jobBoard: JobBoardService,
    private readonly visaSignals: JobVisaSignalService,
  ) {}

  /**
   * Internal server-to-server read boundary for job records. The app-wide
   * API-key guard protects this route; user-owned tracker/evidence data stays
   * in the web/Supabase composition layer.
   */
  @Get('jobs')
  async listJobs(@Query() query: Record<string, string | undefined>) {
    const page = positiveInteger(query.page, 1);
    const pageSize = Math.min(100, positiveInteger(query.pageSize, 50));
    const result = await this.jobBoard.listJobs({
      page,
      pageSize,
      query: query.query,
      searchScope: asSearchScope(query.searchScope),
      exclude: query.exclude,
      sourceAts: query.sourceAts,
      companyName: query.companyName,
      location: query.location,
      workplace: asWorkplace(query.workplace),
      degree: asDegree(query.degree),
      experience: asExperience(query.experience),
      employerEvidence:
        query.employerEvidence === 'source_backed' ? 'source_backed' : 'all',
      role: asRole(query.role),
      jobType: asJobType(query.jobType),
      employmentType: asEmploymentType(query.employmentType),
      listingStatus: asListingStatus(query.listingStatus),
      postedAfter: query.postedAfter,
      sortBy:
        query.sortBy === 'last_confirmed_at'
          ? 'last_confirmed_at'
          : 'posted_at',
      includeJobUrls: splitList(query.includeJobUrls),
      excludeJobUrls: splitList(query.excludeJobUrls),
    });
    const signals = await this.visaSignals.listForJobs(
      result.rows.map((row) => row.id),
    );
    return { ...result, visaSignals: signals };
  }

  @Get('jobs/:id')
  async getJob(@Param('id') id: string) {
    const job = await this.jobBoard.getJob(id);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

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

  /** Temporary API-key-protected operational controls, disabled by default. */
  @Get('ops/ingestion-queue')
  getIngestionQueueState() {
    return this.jobBoard.getIngestionQueueState();
  }

  @Post('ops/ingestion-queue/pause')
  pauseIngestionQueues() {
    return this.jobBoard.pauseIngestionQueues();
  }

  @Post('ops/ingestion-queue/resume')
  resumeIngestionQueues() {
    return this.jobBoard.resumeIngestionQueues();
  }
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function asSearchScope(
  value: string | undefined,
): JobStoreSearch['searchScope'] {
  return value === 'title' || value === 'company' ? value : 'title_description';
}

function asWorkplace(value: string | undefined): JobStoreSearch['workplace'] {
  return value === 'remote' ||
    value === 'hybrid' ||
    value === 'on_site' ||
    value === 'unspecified'
    ? value
    : 'all';
}

function asDegree(value: string | undefined): JobStoreSearch['degree'] {
  return value === 'bachelor' ||
    value === 'master' ||
    value === 'doctorate' ||
    value === 'unspecified'
    ? value
    : 'all';
}

function asExperience(value: string | undefined): JobStoreSearch['experience'] {
  return value === 'entry' ||
    value === 'mid' ||
    value === 'senior' ||
    value === 'unspecified'
    ? value
    : 'all';
}

function asRole(value: string | undefined): JobStoreSearch['role'] {
  return value === 'engineering' ||
    value === 'data' ||
    value === 'product' ||
    value === 'design' ||
    value === 'operations' ||
    value === 'sales' ||
    value === 'other'
    ? value
    : 'all';
}

function asJobType(value: string | undefined): JobStoreSearch['jobType'] {
  return value === 'internship' ||
    value === 'contract' ||
    value === 'temporary' ||
    value === 'permanent' ||
    value === 'unspecified'
    ? value
    : 'all';
}

function asEmploymentType(
  value: string | undefined,
): JobStoreSearch['employmentType'] {
  return value === 'full_time' ||
    value === 'part_time' ||
    value === 'unspecified'
    ? value
    : 'all';
}

function asListingStatus(
  value: string | undefined,
): JobStoreSearch['listingStatus'] {
  return value === 'stale' || value === 'removed' ? value : 'open';
}

function splitList(value: string | undefined) {
  return value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
