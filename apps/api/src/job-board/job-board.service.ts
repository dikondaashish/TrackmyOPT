import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as Bull from 'bull';
import { fetchAuthorizedAtsJobs, type ScrapedAtsJob } from './ats-scrapers.runner';
import { EmployerMatchService } from './employer-match.service';
import { JobVisaSignalService } from './job-visa-signal.service';

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
  | { sourceId: string; jobsFound: number; jobsNew: number; jobsDuplicate: number };

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
    );
  }

  async queueEnabledSources() {
    return this.queue.add('ingest-enabled-sources', {}, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async ingestEnabledSources() {
    const { data, error } = await this.supabase
      .from('ats_sources')
      .select('id, ats_type, board_token, base_url, company_id, employer_board_name, enabled')
      .eq('enabled', true);
    if (error) throw new Error(error.message);

    const results: IngestionResult[] = [];
    for (const source of (data || []) as AtsSource[]) {
      results.push(await this.ingestSource(source));
    }
    return results;
  }

  private async ingestSource(source: AtsSource) {
    if (!source.enabled) return { sourceId: source.id, skipped: 'source_disabled' };
    if (!source.employer_board_name?.trim()) {
      throw new Error(`Source ${source.id} requires employer_board_name before ingestion`);
    }

    const { data: reservationRows, error: reservationError } = await this.supabase.rpc(
      'reserve_ats_ingestion', { source: source.id },
    );
    if (reservationError) throw new Error(reservationError.message);
    const reservation = (reservationRows as Reservation[] | null)?.[0];
    if (!reservation?.accepted) return { sourceId: source.id, skipped: reservation?.reason || 'not_reserved' };

    try {
      const scraped = await fetchAuthorizedAtsJobs(source);
      const { jobsNew, jobsDuplicate } = await this.persistSourceJobs(source, scraped);
      await this.complete(reservation.audit_log_id, scraped.length, jobsNew, jobsDuplicate);
      return { sourceId: source.id, jobsFound: scraped.length, jobsNew, jobsDuplicate };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown ingestion error';
      await this.complete(reservation.audit_log_id, 0, 0, 0, message);
      this.logger.error(`Job-board source ${source.id} failed: ${message}`);
      throw error;
    }
  }

  private async persistSourceJobs(source: AtsSource, scraped: ScrapedAtsJob[]) {
    const ids = [...new Set(scraped.map((job) => job.external_job_id))];
    const existing = ids.length
      ? await this.supabase.from('jobs')
        .select('id, external_job_id')
        .eq('source_id', source.id)
        .in('external_job_id', ids)
      : { data: [], error: null };
    if (existing.error) throw new Error(existing.error.message);
    const existingByExternalId = new Map<string, string>();
    for (const job of existing.data || []) {
      existingByExternalId.set(String(job.external_job_id), String(job.id));
    }
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
    }));
    const fresh = records.filter((job) => !existingByExternalId.has(job.external_job_id));
    if (fresh.length) {
      const { error } = await this.supabase.from('jobs').insert(fresh);
      if (error) throw new Error(error.message);
    }
    for (const job of records.filter((row) => existingByExternalId.has(row.external_job_id))) {
      const { external_job_id: _externalJobId, ...updates } = job;
      const { error } = await this.supabase.from('jobs').update(updates)
        .eq('id', existingByExternalId.get(job.external_job_id));
      if (error) throw new Error(error.message);
    }

    // A successful full-board response is authoritative: absent postings are
    // retained for history but removed from the active verified feed.
    let closeQuery = this.supabase.from('jobs')
      .update({ listing_status: 'removed', last_confirmed_at: now })
      .eq('source_id', source.id)
      .eq('listing_status', 'open');
    if (ids.length) {
      const idList = `(${ids.map((id) => `"${id.replaceAll('"', '\\"')}"`).join(',')})`;
      closeQuery = closeQuery.not('external_job_id', 'in', idList);
    }
    const { error: staleError } = await closeQuery;
    if (staleError) throw new Error(staleError.message);
    await this.employerMatches.syncSource(source);
    await this.visaSignals.syncSource(source.id);
    return { jobsNew: fresh.length, jobsDuplicate: records.length - fresh.length };
  }

  private async complete(id: string, found: number, added: number, duplicate: number, failure?: string) {
    const { error } = await this.supabase.rpc('complete_ats_ingestion', {
      audit_id: id,
      found_count: found,
      new_count: added,
      duplicate_count: duplicate,
      failure_message: failure || null,
    });
    if (error) this.logger.error(`Could not complete ingestion audit ${id}: ${error.message}`);
  }
}
