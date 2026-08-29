import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { decideEmployerMatch, normalizeEmployerName, type SponsorCandidate } from './employer-matcher';

export type EmployerMatchSource = {
  id: string;
  company_id: string | null;
};

@Injectable()
export class EmployerMatchService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService) {
    this.supabase = createClient(
      config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    );
  }

  async syncSource(source: EmployerMatchSource) {
    const { data: jobs, error: jobsError } = await this.supabase
      .from('jobs')
      .select('company_name')
      .eq('source_id', source.id);
    if (jobsError) throw new Error(jobsError.message);

    const names = [...new Set((jobs || []).map((job) => job.company_name?.trim()).filter(Boolean))] as string[];
    for (const jobSourceCompanyName of names) {
      const resolution = source.company_id
        ? {
          canonicalH1bSponsorId: source.company_id,
          matchMethod: 'reviewed' as const,
          confidence: 1,
          reviewStatus: 'confirmed' as const,
          reviewNote: 'Configured employer identity selected during approved source onboarding.',
        }
        : await this.resolveExactCandidate(jobSourceCompanyName);
      const normalizedSourceCompanyName = normalizeEmployerName(jobSourceCompanyName);
      const { data: match, error: matchError } = await this.supabase
        .from('employer_matches')
        .upsert({
          source_id: source.id,
          job_source_company_name: jobSourceCompanyName,
          normalized_source_company_name: normalizedSourceCompanyName,
          canonical_h1b_sponsor_id: resolution.canonicalH1bSponsorId,
          match_method: resolution.matchMethod,
          confidence: resolution.confidence,
          review_status: resolution.reviewStatus,
          review_note: resolution.reviewNote || null,
        }, { onConflict: 'source_id,normalized_source_company_name' })
        .select('id')
        .single();
      if (matchError) throw new Error(matchError.message);

      const { error: linkError } = await this.supabase
        .from('jobs')
        .update({ employer_match_id: match.id })
        .eq('source_id', source.id)
        .eq('company_name', jobSourceCompanyName);
      if (linkError) throw new Error(linkError.message);
    }
  }

  private async resolveExactCandidate(jobSourceCompanyName: string) {
    // This is a candidate lookup, never a jobs→sponsors database join. The
    // intermediate decision is persisted before a job can reference a sponsor.
    const { data, error } = await this.supabase
      .rpc('find_h1b_sponsor_match_candidates', { company_name: jobSourceCompanyName });
    if (error) throw new Error(error.message);
    const decision = decideEmployerMatch(jobSourceCompanyName, (data || []) as SponsorCandidate[]);
    return { ...decision, reviewNote: null };
  }
}
