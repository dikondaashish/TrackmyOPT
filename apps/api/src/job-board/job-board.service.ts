import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as Bull from 'bull';
import {
  fetchAuthorizedAtsJobs,
  type ScrapedAtsJob,
} from './ats-scrapers.runner';
import { EmployerMatchService } from './employer-match.service';
import { JobVisaSignalService } from './job-visa-signal.service';
import {
  planListingReconciliation,
  type PersistedJobListing,
} from './job-listing-reconciliation';

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

  async queueEnabledSources() {
    return this.queue.add(
      'ingest-enabled-sources',
      {},
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 30_000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async ingestEnabledSources() {
    const { data, error } = await this.supabase
      .from('ats_sources')
      .select(
        'id, ats_type, board_token, base_url, company_id, employer_board_name, enabled',
      )
      .eq('enabled', true);
    if (error) throw new Error(error.message);

    const results: IngestionResult[] = [];
    for (const source of (data || []) as AtsSource[]) {
      results.push(await this.ingestSource(source));
    }
    return results;
  }

  private async ingestSource(source: AtsSource) {
    if (!source.enabled)
      return { sourceId: source.id, skipped: 'source_disabled' };
    if (!source.employer_board_name?.trim()) {
      throw new Error(
        `Source ${source.id} requires employer_board_name before ingestion`,
      );
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
      const scraped = await fetchAuthorizedAtsJobs(source);
      const persistence = await this.persistSourceJobs(source, scraped);
      await this.complete(
        reservation.audit_log_id,
        scraped.length,
        persistence,
      );
      return { sourceId: source.id, jobsFound: scraped.length, ...persistence };
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
        message,
      );
      this.logger.error(`Job-board source ${source.id} failed: ${message}`);
      throw error;
    }
  }

  private async persistSourceJobs(source: AtsSource, scraped: ScrapedAtsJob[]) {
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
    const reconciliation = planListingReconciliation(persistedJobs, ids);
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
      failure_message: failure || null,
    });
    if (error)
      this.logger.error(
        `Could not complete ingestion audit ${id}: ${error.message}`,
      );
  }
}
