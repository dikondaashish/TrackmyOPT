import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { detectPostingVisaSignals } from './job-visa-signal';
import type {
  JobDataStore,
  JobStoreRecord,
  JobStoreVisaSignal,
} from './job-data-store.contract';
import { JOB_DATA_STORE } from './job-data-store.provider';

const DOL_H1B_DATA_URL =
  'https://www.dol.gov/agencies/eta/foreign-labor/performance';
const SIGNAL_BATCH_SIZE = 250;

type QueryError = { message: string };
type EmployerMatchRow = {
  id: string;
  canonical_h1b_sponsor_id: string;
  review_status: string;
};
type SponsorRow = {
  id: string;
  name: string;
  total_approvals: number | null;
  approvals_2025: number | null;
};

type VisaSignalPayload = {
  job_id: string;
  signal_type: string;
  evidence_snippet: string;
  source_url: string;
  observed_date: string;
  confidence: number;
  source: string;
};

type OracleEvidenceWriter = {
  replaceVisaSignals(
    jobIds: readonly string[],
    signals: readonly VisaSignalPayload[],
  ): Promise<void>;
};

type OracleEvidenceReader = {
  listVisaSignals(jobIds: readonly string[]): Promise<JobStoreVisaSignal[]>;
};

@Injectable()
export class JobVisaSignalService {
  private readonly supabase: SupabaseClient;

  constructor(
    config: ConfigService,
    @Inject(JOB_DATA_STORE) private readonly jobStore: JobDataStore,
  ) {
    this.supabase = createClient(
      config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }

  async syncSource(
    sourceId: string,
    jobs: readonly Pick<
      JobStoreRecord,
      'id' | 'description' | 'jobUrl' | 'employerMatchId'
    >[],
  ) {
    const jobIds = jobs.map((job) => String(job.id));
    if (!jobIds.length) return;

    const observedDate = new Date().toISOString().slice(0, 10);
    const postingSignals = jobs.flatMap((job) => {
      const sourceUrl = job.jobUrl;
      if (!sourceUrl?.startsWith('https://')) return [];
      return detectPostingVisaSignals(job.description).map((signal) => ({
        job_id: job.id,
        signal_type: signal.signalType,
        evidence_snippet: signal.evidenceSnippet,
        source_url: sourceUrl,
        observed_date: observedDate,
        confidence: signal.confidence,
        source: 'employer_posting',
      }));
    });

    const matchIds = [
      ...new Set(jobs.map((job) => job.employerMatchId).filter(Boolean)),
    ] as string[];
    let historicalSignals: VisaSignalPayload[] = [];
    if (matchIds.length) {
      const { data: matches, error: matchesError } = (await this.supabase
        .from('employer_matches')
        .select('id, canonical_h1b_sponsor_id, review_status')
        .in('id', matchIds)
        .in('review_status', ['auto', 'confirmed'])
        .not('canonical_h1b_sponsor_id', 'is', null)) as unknown as {
        data: EmployerMatchRow[] | null;
        error: QueryError | null;
      };
      if (matchesError) throw new Error(matchesError.message);

      const sponsorIds = [
        ...new Set(
          (matches || [])
            .map((match) => match.canonical_h1b_sponsor_id)
            .filter(Boolean),
        ),
      ] as string[];
      if (sponsorIds.length) {
        const { data: sponsors, error: sponsorsError } = (await this.supabase
          .from('h1b_sponsors')
          .select('id, name, total_approvals, approvals_2025')
          .in('id', sponsorIds)) as unknown as {
          data: SponsorRow[] | null;
          error: QueryError | null;
        };
        if (sponsorsError) throw new Error(sponsorsError.message);
        const sponsorsById = new Map(
          (sponsors || []).map((sponsor) => [String(sponsor.id), sponsor]),
        );
        const sponsorByMatchId = new Map(
          (matches || []).map((match) => [
            String(match.id),
            sponsorsById.get(String(match.canonical_h1b_sponsor_id)),
          ]),
        );
        historicalSignals = jobs.flatMap((job) => {
          const sponsor = job.employerMatchId
            ? sponsorByMatchId.get(String(job.employerMatchId))
            : undefined;
          if (!sponsor) return [];
          const total = sponsor.total_approvals ?? 0;
          const recent = sponsor.approvals_2025 ?? 0;
          return [
            {
              job_id: job.id,
              signal_type: 'historical_h1b_sponsor',
              evidence_snippet: `${sponsor.name} has ${total} historical H-1B/LCA approvals in TrackMyOPT's sponsor dataset, including ${recent} recorded for 2025. This is employer history, not a guarantee for this role.`,
              source_url: DOL_H1B_DATA_URL,
              observed_date: observedDate,
              confidence: 0.95,
              source: 'sponsor_history_db',
            },
          ];
        });
      }
    }
    const allSignals = [...postingSignals, ...historicalSignals];
    const oracleWriter = this.jobStore as JobDataStore &
      Partial<OracleEvidenceWriter>;
    if (oracleWriter.replaceVisaSignals) {
      await oracleWriter.replaceVisaSignals(jobIds, allSignals);
      return;
    }

    for (let offset = 0; offset < jobIds.length; offset += SIGNAL_BATCH_SIZE) {
      const { error } = await this.supabase
        .from('job_visa_signals')
        .delete()
        .in('job_id', jobIds.slice(offset, offset + SIGNAL_BATCH_SIZE))
        .eq('source', 'employer_posting');
      if (error) throw new Error(error.message);
    }
    for (
      let offset = 0;
      offset < postingSignals.length;
      offset += SIGNAL_BATCH_SIZE
    ) {
      const { error } = await this.supabase
        .from('job_visa_signals')
        .insert(postingSignals.slice(offset, offset + SIGNAL_BATCH_SIZE));
      if (error) throw new Error(error.message);
    }
    for (
      let offset = 0;
      offset < historicalSignals.length;
      offset += SIGNAL_BATCH_SIZE
    ) {
      const { error } = await this.supabase
        .from('job_visa_signals')
        .upsert(historicalSignals.slice(offset, offset + SIGNAL_BATCH_SIZE), {
          onConflict: 'job_id,signal_type,source,source_url',
        });
      if (error) throw new Error(error.message);
    }
  }

  /** Read evidence from the selected job store while keeping sponsor identity
   * and H-1B history in Supabase. This is the composed read path used by the
   * internal job API when Oracle owns job records. */
  async listForJobs(jobIds: readonly string[]): Promise<JobStoreVisaSignal[]> {
    if (!jobIds.length) return [];
    const oracleReader = this.jobStore as JobDataStore &
      Partial<OracleEvidenceReader>;
    if (oracleReader.listVisaSignals) {
      return oracleReader.listVisaSignals(jobIds);
    }
    const result = await this.supabase
      .from('job_visa_signals')
      .select(
        'job_id, signal_type, evidence_snippet, source_url, observed_date, confidence, source',
      )
      .in('job_id', [...jobIds]);
    if (result.error) throw new Error(result.error.message);
    return (result.data || []).map((row) => ({
      jobId: String(row.job_id),
      signalType: String(row.signal_type),
      evidenceSnippet: String(row.evidence_snippet),
      sourceUrl: String(row.source_url),
      observedDate: String(row.observed_date),
      confidence: Number(row.confidence),
      source: String(row.source),
    }));
  }
}
