import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { fetchAllPages } from './paginate';
import {
  planListingReconciliation,
  type PersistedJobListing,
} from './job-listing-reconciliation';
import type {
  JobDataStore,
  JobStorePage,
  JobStoreRecord,
  JobStoreSearch,
} from './job-data-store.contract';

const UPSERT_CHUNK_SIZE = 250;
export const SUPABASE_JOB_COLUMNS =
  'id, source_id, source_ats, board_token, external_job_id, title, company_name, location, department, description, job_url, posted_at, updated_at, opt_eligible, stem_opt_eligible, cpt_eligible, h1b_sponsor_status, created_at, first_seen_at, last_confirmed_at, listing_status, employer_board_name, source_trust_tier, employer_match_id, missing_since_at, removed_at';

type SupabaseJobRow = Record<string, unknown>;

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

function nullableBoolean(value: unknown): boolean | null {
  return value == null ? null : Boolean(value);
}

export function mapSupabaseJobRow(row: SupabaseJobRow): JobStoreRecord {
  return {
    id: String(row.id),
    sourceId: String(row.source_id),
    sourceAts: String(row.source_ats),
    boardToken: String(row.board_token),
    externalJobId: String(row.external_job_id),
    title: String(row.title),
    companyName: String(row.company_name),
    location: nullableString(row.location),
    department: nullableString(row.department),
    description: nullableString(row.description),
    jobUrl: nullableString(row.job_url),
    postedAt: nullableString(row.posted_at),
    updatedAt: String(row.updated_at),
    optEligible: nullableBoolean(row.opt_eligible),
    stemOptEligible: nullableBoolean(row.stem_opt_eligible),
    cptEligible: nullableBoolean(row.cpt_eligible),
    h1bSponsorStatus: nullableString(row.h1b_sponsor_status),
    createdAt: String(row.created_at),
    firstSeenAt: String(row.first_seen_at),
    lastConfirmedAt: String(row.last_confirmed_at),
    listingStatus: String(
      row.listing_status,
    ) as JobStoreRecord['listingStatus'],
    employerBoardName: nullableString(row.employer_board_name),
    sourceTrustTier: String(row.source_trust_tier),
    employerMatchId: nullableString(row.employer_match_id),
    missingSinceAt: nullableString(row.missing_since_at),
    removedAt: nullableString(row.removed_at),
  };
}

function toRow(job: JobStoreRecord) {
  return {
    id: job.id,
    source_id: job.sourceId,
    source_ats: job.sourceAts,
    board_token: job.boardToken,
    external_job_id: job.externalJobId,
    title: job.title,
    company_name: job.companyName,
    location: job.location,
    department: job.department,
    description: job.description,
    job_url: job.jobUrl,
    posted_at: job.postedAt,
    updated_at: job.updatedAt,
    opt_eligible: job.optEligible,
    stem_opt_eligible: job.stemOptEligible,
    cpt_eligible: job.cptEligible,
    h1b_sponsor_status: job.h1bSponsorStatus,
    created_at: job.createdAt,
    first_seen_at: job.firstSeenAt,
    last_confirmed_at: job.lastConfirmedAt,
    listing_status: job.listingStatus,
    employer_board_name: job.employerBoardName,
    source_trust_tier: job.sourceTrustTier,
    employer_match_id: job.employerMatchId,
    missing_since_at: job.missingSinceAt,
    removed_at: job.removedAt,
  };
}

export class SupabaseJobDataStore implements JobDataStore {
  constructor(private readonly supabase: SupabaseClient) {}

  static fromEnvironment(env: Record<string, string | undefined>) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'Supabase job store requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      );
    }
    return new SupabaseJobDataStore(
      createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      }) as unknown as SupabaseClient,
    );
  }

  async healthCheck() {
    const { error } = await this.supabase
      .from('jobs')
      .select('id', { head: true, count: 'exact' })
      .limit(1);
    if (error) throw new Error(error.message);
  }

  async listJobs(query: JobStoreSearch): Promise<JobStorePage> {
    const page = Math.max(1, Math.floor(query.page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize)));
    let request = this.supabase
      .from('jobs')
      .select(SUPABASE_JOB_COLUMNS, { count: 'exact' })
      .eq('source_trust_tier', 'verified_ats');
    if (query.listingStatus && query.listingStatus !== 'all')
      request = request.eq('listing_status', query.listingStatus);
    else if (!query.listingStatus)
      request = request.eq('listing_status', 'open');
    if (query.sourceId) request = request.eq('source_id', query.sourceId);
    if (query.query?.trim()) {
      const term = `%${query.query.trim().toLowerCase()}%`;
      const scope = query.searchScope || 'title_description';
      request = request.or(
        scope === 'title'
          ? `title.ilike.${term}`
          : scope === 'company'
            ? `company_name.ilike.${term},employer_board_name.ilike.${term}`
            : `title.ilike.${term},company_name.ilike.${term},employer_board_name.ilike.${term},description.ilike.${term}`,
      );
    }
    if (query.exclude?.trim()) {
      const term = `%${query.exclude.trim().toLowerCase()}%`;
      for (const column of [
        'title',
        'company_name',
        'employer_board_name',
        'location',
        'department',
        'description',
      ]) {
        request = request.not(column, 'ilike', term);
      }
    }
    if (query.sourceAts) request = request.eq('source_ats', query.sourceAts);
    if (query.companyName)
      request = request.or(
        `company_name.eq.${query.companyName},employer_board_name.eq.${query.companyName}`,
      );
    if (query.location) request = request.eq('location', query.location);
    if (query.postedAfter)
      request = request.gte('posted_at', query.postedAfter);
    if (query.workplace && query.workplace !== 'all') {
      if (query.workplace === 'remote') {
        request = request.or(
          'location.ilike.%remote%,description.ilike.%remote%',
        );
      } else if (query.workplace === 'hybrid') {
        request = request.or(
          'location.ilike.%hybrid%,description.ilike.%hybrid%',
        );
      } else if (query.workplace === 'on_site') {
        request = request.or(
          'location.ilike.%on-site%,location.ilike.%onsite%,location.ilike.%in-office%,description.ilike.%on-site%,description.ilike.%onsite%',
        );
      } else {
        request = request
          .not('location', 'ilike', '%remote%')
          .not('location', 'ilike', '%hybrid%')
          .not('description', 'ilike', '%remote%')
          .not('description', 'ilike', '%hybrid%');
      }
    }
    const anyDescription = (patterns: string[]) =>
      patterns.map((pattern) => `description.ilike.%${pattern}%`).join(',');
    const degreePatterns: Record<string, string[]> = {
      bachelor: ['bachelor', 'b.s.', 'b.a.'],
      master: ['master', 'm.s.', 'mba'],
      doctorate: ['ph.d.', 'doctorate', 'doctoral'],
    };
    if (query.degree && query.degree !== 'all') {
      const patterns = degreePatterns[query.degree];
      if (patterns) request = request.or(anyDescription(patterns));
      else {
        for (const pattern of ['bachelor', 'master', 'doctorate'])
          request = request.not('description', 'ilike', `%${pattern}%`);
      }
    }
    const experiencePatterns: Record<string, string[]> = {
      entry: ['0 year', '1 year', '2 year'],
      mid: ['3 year', '4 year', '5 year'],
      senior: ['6 year', '7 year', '8 year', '9 year', '10 year'],
    };
    if (query.experience && query.experience !== 'all') {
      const patterns = experiencePatterns[query.experience];
      if (patterns) request = request.or(anyDescription(patterns));
      else {
        for (const pattern of Object.values(experiencePatterns).flat())
          request = request.not('description', 'ilike', `%${pattern}%`);
      }
    }
    const rolePatterns: Record<string, string[]> = {
      engineering: [
        'engineer',
        'engineering',
        'developer',
        'software',
        'platform',
        'security',
        'devops',
        'site reliability',
        'sre',
        'firmware',
      ],
      data: [
        'data',
        'analyst',
        'analytics',
        'scientist',
        'machine learning',
        'ml',
        'artificial intelligence',
        'ai',
      ],
      product: ['product', 'product manager', 'product owner'],
      design: [
        'design',
        'designer',
        'ux',
        'ui',
        'user experience',
        'user interface',
      ],
      operations: [
        'operations',
        'strategy',
        'customer success',
        'support',
        'deployment',
        'program manager',
        'project manager',
      ],
      sales: [
        'sales',
        'account executive',
        'business development',
        'revenue',
        'solutions consultant',
      ],
    };
    if (query.role && query.role !== 'all') {
      const patterns = rolePatterns[query.role];
      if (patterns)
        request = request.or(
          patterns.map((pattern) => `title.ilike.%${pattern}%`).join(','),
        );
      else if (query.role === 'other') {
        for (const pattern of Object.values(rolePatterns).flat())
          request = request.not('title', 'ilike', `%${pattern}%`);
      }
    }
    const typePatterns: Record<string, string[]> = {
      internship: ['internship'],
      contract: ['contractor'],
      temporary: ['temporary', 'fixed-term'],
      permanent: ['permanent', 'regular employee'],
      full_time: ['full-time', 'full time', 'fte'],
      part_time: ['part-time', 'part time'],
    };
    if (query.jobType && query.jobType !== 'all') {
      const patterns = typePatterns[query.jobType];
      if (patterns) {
        const titlePattern =
          query.jobType === 'internship'
            ? 'title.ilike.%intern%'
            : query.jobType === 'contract'
              ? 'title.ilike.%contract%'
              : query.jobType === 'temporary'
                ? 'title.ilike.%temporary%'
                : null;
        request = request.or(
          titlePattern
            ? `${titlePattern},${anyDescription(patterns)}`
            : anyDescription(patterns),
        );
      } else if (query.jobType === 'unspecified') {
        for (const pattern of Object.values(typePatterns)
          .flat()
          .filter(
            (value) =>
              ![
                'full-time',
                'full time',
                'fte',
                'part-time',
                'part time',
              ].includes(value),
          )) {
          request = request.not('description', 'ilike', `%${pattern}%`);
        }
      }
    }
    if (query.employmentType && query.employmentType !== 'all') {
      const patterns = typePatterns[query.employmentType];
      if (patterns) request = request.or(anyDescription(patterns));
      else if (query.employmentType === 'unspecified') {
        for (const pattern of [
          ...typePatterns.full_time,
          ...typePatterns.part_time,
        ])
          request = request.not('description', 'ilike', `%${pattern}%`);
      }
    }
    if (query.employerEvidence === 'source_backed')
      request = request.not('employer_match_id', 'is', null);
    if (query.includeJobUrls?.length)
      request = request.in('job_url', [...query.includeJobUrls]);
    if (query.excludeJobUrls?.length)
      request = request.not(
        'job_url',
        'in',
        `(${query.excludeJobUrls.join(',')})`,
      );
    const result = await request
      .order(
        query.sortBy === 'last_confirmed_at'
          ? 'last_confirmed_at'
          : 'posted_at',
        {
          ascending: false,
          nullsFirst: false,
        },
      )
      .order('id', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (result.error) throw new Error(result.error.message);
    return {
      rows: (result.data || []).map((row) =>
        mapSupabaseJobRow(row as SupabaseJobRow),
      ),
      total: result.count || 0,
    };
  }

  async listSourceJobs(sourceId: string) {
    const rows = await fetchAllPages<JobStoreRecord>(async (from, to) => {
      const result = await this.supabase
        .from('jobs')
        .select(SUPABASE_JOB_COLUMNS)
        .eq('source_id', sourceId)
        .order('id', { ascending: true })
        .range(from, to);
      return {
        data: (result.data || []).map((row) =>
          mapSupabaseJobRow(row as SupabaseJobRow),
        ),
        error: result.error ? { message: result.error.message } : null,
      };
    });
    return rows;
  }

  async listSourceJobsPage(
    sourceId: string,
    offset: number,
    pageSize: number,
  ): Promise<JobStorePage> {
    const safeOffset = Math.max(0, Math.floor(offset));
    const safePageSize = Math.min(500, Math.max(1, Math.floor(pageSize)));
    const result = await this.supabase
      .from('jobs')
      .select(SUPABASE_JOB_COLUMNS, { count: 'exact' })
      .eq('source_id', sourceId)
      .eq('source_trust_tier', 'verified_ats')
      .order('id', { ascending: true })
      .range(safeOffset, safeOffset + safePageSize - 1);
    if (result.error) throw new Error(result.error.message);
    return {
      rows: (result.data || []).map((row) =>
        mapSupabaseJobRow(row as SupabaseJobRow),
      ),
      total: result.count || 0,
    };
  }

  async getJob(id: string) {
    const result = await this.supabase
      .from('jobs')
      .select(SUPABASE_JOB_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return result.data
      ? mapSupabaseJobRow(result.data as SupabaseJobRow)
      : null;
  }

  async upsertJobs(rows: readonly JobStoreRecord[]) {
    for (let offset = 0; offset < rows.length; offset += UPSERT_CHUNK_SIZE) {
      const result = await this.supabase
        .from('jobs')
        .upsert(rows.slice(offset, offset + UPSERT_CHUNK_SIZE).map(toRow), {
          onConflict: 'source_ats,board_token,external_job_id',
        });
      if (result.error) throw new Error(result.error.message);
    }
  }

  async reconcileSource(
    sourceId: string,
    seenExternalJobIds: readonly string[],
  ) {
    if (!seenExternalJobIds.length) return;
    const persisted = await this.listSourceJobs(sourceId);
    const plan = planListingReconciliation(
      persisted.map((job) => ({
        id: job.id,
        external_job_id: job.externalJobId,
        listing_status: job.listingStatus,
      })) as PersistedJobListing[],
      seenExternalJobIds,
      { complete: true },
    );
    const now = new Date().toISOString();
    if (plan.staleJobIds.length) {
      const result = await this.supabase
        .from('jobs')
        .update({
          listing_status: 'stale',
          missing_since_at: now,
          removed_at: null,
        })
        .in('id', plan.staleJobIds);
      if (result.error) throw new Error(result.error.message);
    }
    if (plan.removedJobIds.length) {
      const result = await this.supabase
        .from('jobs')
        .update({ listing_status: 'removed', removed_at: now })
        .in('id', plan.removedJobIds);
      if (result.error) throw new Error(result.error.message);
    }
    if (plan.reopenedJobIds.length) {
      const result = await this.supabase
        .from('jobs')
        .update({
          listing_status: 'open',
          missing_since_at: null,
          removed_at: null,
        })
        .in('id', plan.reopenedJobIds);
      if (result.error) throw new Error(result.error.message);
    }
  }
}
