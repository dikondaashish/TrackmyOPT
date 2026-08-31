import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as Bull from 'bull';
import {
  AtsScraperRunnerError,
  fetchAuthorizedAtsJobs,
  type ScrapedAtsJob,
} from './ats-scrapers.runner';
import { EmployerMatchService } from './employer-match.service';
import { JobVisaSignalService } from './job-visa-signal.service';
import {
  planListingReconciliation,
  type PersistedJobListing,
} from './job-listing-reconciliation';
import { planSourceIngestionJobs } from './source-job-planning';
import {
  classifySourceError,
  planSourceFailure,
  planSourceSuccess,
  shouldAttemptSource,
  toSourceHealthDatabaseUpdate,
} from './source-health';
import { planIngestionOrchestratorOptions } from './scheduler-run-id';

type AtsSource = {
  id: string;
  ats_type: string;
  board_token: string;
  base_url: string;
  company_id: string | null;
  employer_board_name: string | null;
  enabled: boolean;
};

type Reservation = { audit_log_id: string; accepted: boolean; reason: string };
type IngestionResult =
  | { sourceId: string; skipped: string }
  | {
      sourceId: string;
      jobsFound: number;
      jobsNew: number;
      jobsDuplicate: number;
      jobsStale: number;
      jobsRemoved: number;
      jobsReopened: number;
    };

type PersistenceResult = {
  jobsNew: number;
  jobsDuplicate: number;
  jobsStale: number;
  jobsRemoved: number;
  jobsReopened: number;
};

type SourceBoardHealth = {
  id: string;
  consecutive_failures: number;
  circuit_state: 'closed' | 'open';
  next_retry_at: string | null;
};

@Injectable()
export class JobBoardService {
  private readonly logger = new Logger(JobBoardService.name);
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('job-board') private readonly queue: Bull.Queue,
    private readonly employerMatches: EmployerMatchService,
    private readonly visaSignals: JobVisaSignalService,
  ) {
    this.supabase = createClient(
      this.config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }

  async queueEnabledSources(schedulerRunId: string | null = null) {
    return this.queue.add(
      'ingest-enabled-sources',
      {},
      planIngestionOrchestratorOptions(schedulerRunId),
    );
  }

  async queueCompanyDiscovery() {
    return this.queue.add(
      'discover-company-batch',
      {},
      {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async enqueueEnabledSourceJobs() {
    const { data, error } = await this.supabase
      .from('ats_sources')
      .select('id')
      .eq('enabled', true);
    if (error) throw new Error(error.message);
    const jobs = planSourceIngestionJobs(
      (data || []).map((source) => String(source.id)),
    );
    if (jobs.length) await this.queue.addBulk(jobs);
    return { sourcesQueued: jobs.length };
  }

  async ingestSourceById(sourceId: string): Promise<IngestionResult> {
    const { data, error } = await this.supabase
      .from('ats_sources')
      .select(
        'id, ats_type, board_token, base_url, company_id, employer_board_name, enabled',
      )
      .eq('id', sourceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error(`Unknown ATS source ${sourceId}`);
    return this.ingestSource(data as AtsSource);
  }

  private async ingestSource(source: AtsSource) {
    if (!source.enabled)
      return { sourceId: source.id, skipped: 'source_disabled' };
    if (!source.employer_board_name?.trim()) {
      throw new Error(
        `Source ${source.id} requires employer_board_name before ingestion`,
      );
    }
    const sourceBoard = await this.getSourceBoardHealth(source.id);
    if (
      sourceBoard &&
      !shouldAttemptSource({
        circuitState: sourceBoard.circuit_state,
        nextRetryAt: sourceBoard.next_retry_at,
        now: new Date(),
      })
    ) {
      return { sourceId: source.id, skipped: 'source_circuit_open' };
    }

    const { data: reservationRows, error: reservationError } =
      (await this.supabase.rpc('reserve_ats_ingestion', {
        source: source.id,
      })) as unknown as {
        data: Reservation[] | null;
        error: { message: string } | null;
      };
    if (reservationError) throw new Error(reservationError.message);
    const reservation = reservationRows?.[0];
    if (!reservation?.accepted)
      return {
        sourceId: source.id,
        skipped: reservation?.reason || 'not_reserved',
      };

    try {
      const fetched = await fetchAuthorizedAtsJobs(source);
      const persistence = await this.persistSourceJobs(
        source,
        fetched.jobs,
        fetched.metadata.complete,
      );
      await this.complete(
        reservation.audit_log_id,
        fetched.jobs.length,
        persistence,
        fetched.metadata.requests_made,
      );
      try {
        await this.recordSourceSuccess(sourceBoard?.id);
      } catch (healthError) {
        const message =
          healthError instanceof Error
            ? healthError.message
            : 'Unknown source health update error';
        this.logger.error(
          `Ingestion succeeded but source health could not be recorded for ${source.id}: ${message}`,
        );
      }
      return {
        sourceId: source.id,
        jobsFound: fetched.jobs.length,
        ...persistence,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown ingestion error';
      await this.complete(
        reservation.audit_log_id,
        0,
        {
          jobsNew: 0,
          jobsDuplicate: 0,
          jobsStale: 0,
          jobsRemoved: 0,
          jobsReopened: 0,
        },
        error instanceof AtsScraperRunnerError ? error.requestsMade : 0,
        message,
      );
      await this.recordSourceFailure(sourceBoard, message);
      this.logger.error(`Job-board source ${source.id} failed: ${message}`);
      throw error;
    }
  }

  private async persistSourceJobs(
    source: AtsSource,
    scraped: ScrapedAtsJob[],
    responseComplete: boolean,
  ) {
    const ids = [...new Set(scraped.map((job) => job.external_job_id))];
    const existing = await this.supabase
      .from('jobs')
      .select('id, external_job_id, listing_status')
      .eq('source_id', source.id);
    if (existing.error) throw new Error(existing.error.message);
    const persistedJobs = (existing.data || []) as PersistedJobListing[];
    const existingByExternalId = new Map<string, string>();
    for (const job of persistedJobs) {
      existingByExternalId.set(String(job.external_job_id), String(job.id));
    }
    const reconciliation = planListingReconciliation(persistedJobs, ids, {
      complete: responseComplete,
    });
    const now = new Date().toISOString();
    const records = scraped.map((job) => ({
      ...job,
      source_id: source.id,
      source_ats: source.ats_type,
      board_token: source.board_token,
      company_name: job.company_name || source.employer_board_name,
      employer_board_name: source.employer_board_name,
      listing_status: 'open',
      source_trust_tier: 'verified_ats',
      last_confirmed_at: now,
      missing_since_at: null,
      removed_at: null,
    }));
    const fresh = records.filter(
      (job) => !existingByExternalId.has(job.external_job_id),
    );
    if (fresh.length) {
      const { error } = await this.supabase.from('jobs').insert(fresh);
      if (error) throw new Error(error.message);
    }
    for (const job of records.filter((row) =>
      existingByExternalId.has(row.external_job_id),
    )) {
      const { error } = await this.supabase
        .from('jobs')
        .update(job)
        .eq('id', existingByExternalId.get(job.external_job_id));
      if (error) throw new Error(error.message);
    }

    if (reconciliation.staleJobIds.length) {
      const { error } = await this.supabase
        .from('jobs')
        .update({
          listing_status: 'stale',
          missing_since_at: now,
          removed_at: null,
        })
        .in('id', reconciliation.staleJobIds);
      if (error) throw new Error(error.message);
    }
    if (reconciliation.removedJobIds.length) {
      const { error } = await this.supabase
        .from('jobs')
        .update({ listing_status: 'removed', removed_at: now })
        .in('id', reconciliation.removedJobIds);
      if (error) throw new Error(error.message);
    }
    await this.employerMatches.syncSource(source);
    await this.visaSignals.syncSource(source.id);
    return {
      jobsNew: fresh.length,
      jobsDuplicate: records.length - fresh.length,
      jobsStale: reconciliation.staleJobIds.length,
      jobsRemoved: reconciliation.removedJobIds.length,
      jobsReopened: reconciliation.reopenedJobIds.length,
    };
  }

  private async complete(
    id: string,
    found: number,
    result: PersistenceResult,
    httpRequestsMade: number,
    failure?: string,
  ) {
    const { error } = await this.supabase.rpc('complete_ats_ingestion', {
      audit_id: id,
      found_count: found,
      new_count: result.jobsNew,
      duplicate_count: result.jobsDuplicate,
      stale_count: result.jobsStale,
      removed_count: result.jobsRemoved,
      reopened_count: result.jobsReopened,
      http_request_count: httpRequestsMade,
      failure_message: failure || null,
    });
    if (error)
      this.logger.error(
        `Could not complete ingestion audit ${id}: ${error.message}`,
      );
  }

  private async getSourceBoardHealth(sourceId: string) {
    const { data, error } = await this.supabase
      .from('ats_boards')
      .select('id, consecutive_failures, circuit_state, next_retry_at')
      .eq('legacy_source_id', sourceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as SourceBoardHealth | null;
  }

  private async recordSourceSuccess(boardId?: string) {
    if (!boardId) return;
    const now = new Date().toISOString();
    const health = planSourceSuccess();
    const { error } = await this.supabase
      .from('ats_boards')
      .update({
        ...toSourceHealthDatabaseUpdate(health),
        last_fetch_at: now,
        last_success_at: now,
      })
      .eq('id', boardId);
    if (error) throw new Error(error.message);
  }

  private async recordSourceFailure(
    board: SourceBoardHealth | null,
    message: string,
  ) {
    if (!board) return;
    const now = new Date();
    const plan = planSourceFailure({
      consecutiveFailures: board.consecutive_failures,
      now,
    });
    const classification = classifySourceError(message);
    const nowIso = now.toISOString();
    const update = await this.supabase
      .from('ats_boards')
      .update({
        ...toSourceHealthDatabaseUpdate(plan),
        last_fetch_at: nowIso,
        last_failure_at: nowIso,
      })
      .eq('id', board.id);
    if (update.error) throw new Error(update.error.message);
    const errorLog = await this.supabase.from('source_errors').insert({
      ats_board_id: board.id,
      error_type: classification.errorType,
      message,
      retryable: classification.retryable,
      metadata: {
        consecutive_failures: plan.consecutiveFailures,
        circuit_state: plan.circuitState,
      },
    });
    if (errorLog.error) throw new Error(errorLog.error.message);
  }
}
