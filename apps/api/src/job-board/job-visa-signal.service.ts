import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { detectPostingVisaSignals } from './job-visa-signal';
import { fetchAllPages } from './paginate';

const DOL_H1B_DATA_URL =
  'https://www.dol.gov/agencies/eta/foreign-labor/performance';
const SIGNAL_BATCH_SIZE = 250;

type QueryError = { message: string };
type JobVisaRow = {
  id: string;
  description: string | null;
  job_url: string | null;
  employer_match_id: string | null;
};
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

@Injectable()
export class JobVisaSignalService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService) {
    this.supabase = createClient(
      config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }

  async syncSource(sourceId: string) {
    const jobs = await fetchAllPages<JobVisaRow>(async (from, to) => {
      const result = await this.supabase
        .from('jobs')
        .select('id, description, job_url, employer_match_id')
        .eq('source_id', sourceId)
        .range(from, to);
      return {
        data: (result.data || []) as JobVisaRow[],
        error: result.error ? { message: result.error.message } : null,
      };
    });

    const jobIds = (jobs || []).map((job) => String(job.id));
    if (!jobIds.length) return;
    for (let offset = 0; offset < jobIds.length; offset += SIGNAL_BATCH_SIZE) {
      const { error } = await this.supabase
        .from('job_visa_signals')
        .delete()
        .in('job_id', jobIds.slice(offset, offset + SIGNAL_BATCH_SIZE))
        .eq('source', 'employer_posting');
      if (error) throw new Error(error.message);
    }

    const observedDate = new Date().toISOString().slice(0, 10);
    const postingSignals = (jobs || []).flatMap((job) => {
      if (!job.job_url?.startsWith('https://')) return [];
      return detectPostingVisaSignals(job.description).map((signal) => ({
        job_id: job.id,
        signal_type: signal.signalType,
        evidence_snippet: signal.evidenceSnippet,
        source_url: job.job_url,
        observed_date: observedDate,
        confidence: signal.confidence,
        source: 'employer_posting',
      }));
    });
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

    const matchIds = [
      ...new Set(
        (jobs || []).map((job) => job.employer_match_id).filter(Boolean),
      ),
    ] as string[];
    if (!matchIds.length) return;
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
    if (!sponsorIds.length) return;
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

    const historicalSignals = (jobs || []).flatMap((job) => {
      const sponsor = job.employer_match_id
        ? sponsorByMatchId.get(String(job.employer_match_id))
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
}
