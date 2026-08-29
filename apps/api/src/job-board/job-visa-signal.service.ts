import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { detectPostingVisaSignals } from './job-visa-signal';

const DOL_H1B_DATA_URL = 'https://www.dol.gov/agencies/eta/foreign-labor/performance';

@Injectable()
export class JobVisaSignalService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService) {
    this.supabase = createClient(
      config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    );
  }

  async syncSource(sourceId: string) {
    const { data: jobs, error: jobsError } = await this.supabase
      .from('jobs')
      .select('id, description, job_url, employer_match_id')
      .eq('source_id', sourceId);
    if (jobsError) throw new Error(jobsError.message);

    const jobIds = (jobs || []).map((job) => String(job.id));
    if (!jobIds.length) return;
    const { error: removePostingSignalsError } = await this.supabase
      .from('job_visa_signals')
      .delete()
      .in('job_id', jobIds)
      .eq('source', 'employer_posting');
    if (removePostingSignalsError) throw new Error(removePostingSignalsError.message);

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
    if (postingSignals.length) {
      const { error } = await this.supabase.from('job_visa_signals').insert(postingSignals);
      if (error) throw new Error(error.message);
    }

    const matchIds = [...new Set((jobs || []).map((job) => job.employer_match_id).filter(Boolean))] as string[];
    if (!matchIds.length) return;
    const { data: matches, error: matchesError } = await this.supabase
      .from('employer_matches')
      .select('id, canonical_h1b_sponsor_id, review_status')
      .in('id', matchIds)
      .in('review_status', ['auto', 'confirmed'])
      .not('canonical_h1b_sponsor_id', 'is', null);
    if (matchesError) throw new Error(matchesError.message);

    const sponsorIds = [...new Set((matches || []).map((match) => match.canonical_h1b_sponsor_id).filter(Boolean))] as string[];
    if (!sponsorIds.length) return;
    const { data: sponsors, error: sponsorsError } = await this.supabase
      .from('h1b_sponsors')
      .select('id, name, total_approvals, approvals_2025')
      .in('id', sponsorIds);
    if (sponsorsError) throw new Error(sponsorsError.message);
    const sponsorsById = new Map((sponsors || []).map((sponsor) => [String(sponsor.id), sponsor]));
    const sponsorByMatchId = new Map((matches || []).map((match) => [String(match.id), sponsorsById.get(String(match.canonical_h1b_sponsor_id))]));

    const historicalSignals = (jobs || []).flatMap((job) => {
      const sponsor = job.employer_match_id ? sponsorByMatchId.get(String(job.employer_match_id)) : undefined;
      if (!sponsor) return [];
      const total = sponsor.total_approvals ?? 0;
      const recent = sponsor.approvals_2025 ?? 0;
      return [{
        job_id: job.id,
        signal_type: 'historical_h1b_sponsor',
        evidence_snippet: `${sponsor.name} has ${total} historical H-1B/LCA approvals in TrackMyOPT's sponsor dataset, including ${recent} recorded for 2025. This is employer history, not a guarantee for this role.`,
        source_url: DOL_H1B_DATA_URL,
        observed_date: observedDate,
        confidence: 0.95,
        source: 'sponsor_history_db',
      }];
    });
    if (historicalSignals.length) {
      const { error } = await this.supabase
        .from('job_visa_signals')
        .upsert(historicalSignals, { onConflict: 'job_id,signal_type,source,source_url' });
      if (error) throw new Error(error.message);
    }
  }
}
