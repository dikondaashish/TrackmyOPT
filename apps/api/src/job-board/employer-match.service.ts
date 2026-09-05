import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  decideEmployerMatch,
  normalizeEmployerName,
  type SponsorCandidate,
} from './employer-matcher';
import type { JobStoreRecord } from './job-data-store.contract';

export type EmployerMatchSource = {
  id: string;
  company_id: string | null;
};

type EmployerMatchIdRow = { id: string };
type QueryError = { message: string };

@Injectable()
export class EmployerMatchService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService) {
    this.supabase = createClient(
      config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }

  /**
   * Resolve employer evidence from the records already read by the selected
   * job store. This is intentionally store-agnostic: Oracle jobs must not be
   * looked up through Supabase, and Supabase remains the source of truth for
   * the employer_matches evidence table.
   */
  async syncSource(
    source: EmployerMatchSource,
    jobs: readonly Pick<JobStoreRecord, 'companyName'>[],
  ): Promise<Map<string, string>> {
    const names = [
      ...new Set(jobs.map((job) => job.companyName?.trim()).filter(Boolean)),
    ] as string[];
    const matchIds = new Map<string, string>();
    for (const jobSourceCompanyName of names) {
      const resolution = source.company_id
        ? {
            canonicalH1bSponsorId: source.company_id,
            matchMethod: 'reviewed' as const,
            confidence: 1,
            reviewStatus: 'confirmed' as const,
            reviewNote:
              'Configured employer identity selected during approved source onboarding.',
          }
        : await this.resolveExactCandidate(jobSourceCompanyName);
      const normalizedSourceCompanyName =
        normalizeEmployerName(jobSourceCompanyName);
      const { data: match, error: matchError } = (await this.supabase
        .from('employer_matches')
        .upsert(
          {
            source_id: source.id,
            job_source_company_name: jobSourceCompanyName,
            normalized_source_company_name: normalizedSourceCompanyName,
            canonical_h1b_sponsor_id: resolution.canonicalH1bSponsorId,
            match_method: resolution.matchMethod,
            confidence: resolution.confidence,
            review_status: resolution.reviewStatus,
            review_note: resolution.reviewNote || null,
          },
          { onConflict: 'source_id,normalized_source_company_name' },
        )
        .select('id')
        .single()) as unknown as {
        data: EmployerMatchIdRow | null;
        error: QueryError | null;
      };
      if (matchError) throw new Error(matchError.message);
      if (!match) throw new Error('Employer match was not returned');
      matchIds.set(jobSourceCompanyName, String(match.id));
    }
    return matchIds;
  }

  private async resolveExactCandidate(jobSourceCompanyName: string) {
    // This is a candidate lookup, never a jobs→sponsors database join. The
    // intermediate decision is persisted before a job can reference a sponsor.
    const { data, error } = (await this.supabase.rpc(
      'find_h1b_sponsor_match_candidates',
      { company_name: jobSourceCompanyName },
    )) as unknown as {
      data: SponsorCandidate[] | null;
      error: QueryError | null;
    };
    if (error) throw new Error(error.message);
    const decision = decideEmployerMatch(jobSourceCompanyName, data || []);
    return { ...decision, reviewNote: null };
  }
}
