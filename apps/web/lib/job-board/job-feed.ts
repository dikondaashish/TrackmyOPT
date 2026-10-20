import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  findActiveTrackerStatus,
  inferJobFacts,
  normalizeJobText,
  type JobFilters,
  type TrackerEntrySummary,
} from './filters';
import { parseResumeJobProfile, scoreJobForResume, type ResumeJobMatch, type ResumeJobProfile } from './resume-match';
import { listServerJobs, type ServerJobPage, type ServerJobQuery, type ServerJobRecord } from './server-job-store';

// The verified job feed for one user: Oracle job records joined with employer
// evidence, logos, tracker status and resume ranking. The jobs page and
// /api/job-board/jobs both build pages here so they return the same cards.

export const JOB_FEED_PAGE_SIZE = 50;
/**
 * Resume ranking orders the newest this-many matching jobs by score; pages
 * after them stay in date order. A multiple of the page size, so ranked and
 * date-ordered pages meet without gaps or repeats.
 */
export const RESUME_RANKING_POOL = 300;
const POOL_PAGE_SIZE = 100;

const DATE_WINDOW_HOURS: Record<Exclude<JobFilters['date'], 'any'>, number> = {
  '1h': 1,
  '6h': 6,
  '12h': 12,
  '24h': 24,
  '48h': 48,
  '7d': 24 * 7,
  '30d': 24 * 30,
};

export type FeedVisaSignal = {
  signal_type: string;
  evidence_snippet: string;
  source_url: string;
  observed_date: string;
  confidence: number;
  source: string;
};

export type FeedJob = {
  id: string;
  title: string;
  company_name: string;
  employer_board_name: string | null;
  location: string | null;
  department: string | null;
  /** Loaded on demand from /api/job-board/jobs/[id]/description. */
  description: null;
  job_url: string | null;
  posted_at: string | null;
  first_seen_at: string;
  last_confirmed_at: string;
  source_ats: string;
  company_website: string | null;
  tracker_status: string | null;
  employer_match: {
    canonical_h1b_sponsor_id: string | null;
    confidence: number;
    review_status: string;
  } | null;
  visa_signals: FeedVisaSignal[];
  resume_match: ResumeJobMatch | null;
};

export type JobFeedPage = {
  jobs: FeedJob[];
  total: number;
  page: number;
  pageSize: number;
  /** How many of the newest matching jobs are ordered by resume score; 0 without ranking. */
  rankedCount: number;
};

/** A feed read that failed; the message is static and safe to report. */
export class JobFeedError extends Error {
  constructor(readonly stage: 'jobs' | 'evidence', cause: unknown) {
    super(`Verified job feed ${stage} read failed`, { cause });
    this.name = 'JobFeedError';
  }
}

/** The job-match profile cached on a saved resume, if it has one. */
export function cachedResumeJobProfile(structuredData: unknown): { source: 'ai' | 'deterministic'; profile: ResumeJobProfile } | null {
  if (!structuredData || typeof structuredData !== 'object' || Array.isArray(structuredData)) return null;
  const cached = (structuredData as Record<string, unknown>).jobMatchProfile;
  if (!cached || typeof cached !== 'object' || Array.isArray(cached)) return null;
  const source = (cached as Record<string, unknown>).source;
  const profile = parseResumeJobProfile((cached as Record<string, unknown>).profile);
  if ((source !== 'ai' && source !== 'deterministic') || !profile) return null;
  return { source, profile };
}

/** Tracker entries that count as saved, or as applied (past the wishlist). */
function trackerEntriesFor(scope: JobFilters['tracker'], entries: TrackerEntrySummary[]) {
  return entries.filter((entry) => !entry.is_archived
    && (scope !== 'applied' || (entry.status && normalizeJobText(entry.status) !== 'wishlist')));
}

/**
 * Stored job URLs a tracker URL may correspond to. Tracker matching ignores
 * the fragment and a trailing slash, so the job store filter must too.
 */
function trackerUrlVariants(entries: TrackerEntrySummary[]) {
  const urls = new Set<string>();
  for (const entry of entries) {
    const raw = entry.job_url?.trim();
    if (!raw) continue;
    let base = raw;
    try {
      const url = new URL(raw);
      url.hash = '';
      base = url.toString();
    } catch {
      // Not an absolute URL; match it as entered.
    }
    const bare = base.replace(/\/$/, '');
    for (const url of [raw, bare, `${bare}/`]) urls.add(url);
  }
  return [...urls];
}

/** Counted the same way as each card's "Tracker:" badge. */
export function countSavedJobs(entries: TrackerEntrySummary[]) {
  return trackerEntriesFor('saved', entries).length;
}

function storeQuery(filters: JobFilters, entries: TrackerEntrySummary[], asOf: Date): ServerJobQuery | null {
  const query: ServerJobQuery = {
    query: filters.query.trim() || undefined,
    searchScope: filters.searchScope,
    exclude: filters.exclude.trim() || undefined,
    places: filters.places.length ? filters.places.join('|') : undefined,
    // The board lists US jobs; saved and applied jobs show wherever they are.
    country: filters.tracker === 'saved' || filters.tracker === 'applied' ? undefined : 'us',
    companyName: filters.company !== 'all' ? filters.company : undefined,
    workplace: filters.workplace !== 'all' ? filters.workplace : undefined,
    degree: filters.degree !== 'all' ? filters.degree : undefined,
    experience: filters.experience !== 'all' ? filters.experience : undefined,
    employerEvidence: filters.evidence === 'source_backed' ? filters.evidence : undefined,
    role: filters.role !== 'all' ? filters.role : undefined,
    jobType: filters.jobType !== 'all' ? filters.jobType : undefined,
    employmentType: filters.employmentType !== 'all' ? filters.employmentType : undefined,
  };
  if (filters.date !== 'any') {
    query.postedAfter = new Date(asOf.getTime() - DATE_WINDOW_HOURS[filters.date] * 60 * 60 * 1000).toISOString();
  }
  if (filters.tracker !== 'all') {
    const urls = trackerUrlVariants(trackerEntriesFor(filters.tracker === 'not_saved' ? 'saved' : filters.tracker, entries));
    if (filters.tracker === 'not_saved') {
      if (urls.length) query.excludeJobUrls = urls;
    } else {
      if (!urls.length) return null;
      query.includeJobUrls = urls;
    }
  }
  return query;
}

function scoringJob(row: ServerJobRecord) {
  return {
    title: row.title,
    company_name: row.companyName,
    employer_board_name: row.employerBoardName,
    location: row.location,
    department: row.department,
    description: row.description,
    posted_at: row.postedAt,
    tracker_status: null,
    employer_match: null,
    visa_signals: [],
  };
}

async function readStore(query: ServerJobQuery): Promise<ServerJobPage> {
  try {
    return await listServerJobs(query);
  } catch (error) {
    throw new JobFeedError('jobs', error);
  }
}

/** One page of rows, ranked by resume score across the newest RESUME_RANKING_POOL jobs when a profile is given. */
async function readPage(query: ServerJobQuery, page: number, profile: ResumeJobProfile | null) {
  const start = (page - 1) * JOB_FEED_PAGE_SIZE;
  if (!profile || start >= RESUME_RANKING_POOL) {
    const result = await readStore({ ...query, page, pageSize: JOB_FEED_PAGE_SIZE });
    return { ...result, rankedCount: 0, scores: new Map<string, ResumeJobMatch>() };
  }
  const first = await readStore({ ...query, page: 1, pageSize: POOL_PAGE_SIZE });
  const poolPages = Math.ceil(Math.min(first.total, RESUME_RANKING_POOL) / POOL_PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, poolPages - 1) }, (_, index) => readStore({ ...query, page: index + 2, pageSize: POOL_PAGE_SIZE })),
  );
  const pool = [first, ...rest];
  const rows = pool.flatMap((result) => result.rows).slice(0, RESUME_RANKING_POOL);
  const scores = new Map(rows.map((row) => {
    const job = scoringJob(row);
    return [row.id, scoreJobForResume(profile, job, inferJobFacts(job))];
  }));
  // Array sort is stable, so equal scores keep newest-first order.
  const ranked = [...rows].sort((left, right) => scores.get(right.id)!.score - scores.get(left.id)!.score);
  return {
    rows: ranked.slice(start, start + JOB_FEED_PAGE_SIZE),
    total: first.total,
    visaSignals: pool.flatMap((result) => result.visaSignals || []),
    rankedCount: rows.length,
    scores,
  };
}

async function sponsorWebsites(sponsorIds: string[]) {
  const websites = new Map<string, string>();
  if (!sponsorIds.length) return websites;
  const { data, error } = await getSupabaseAdminClient().from('h1b_sponsors').select('id, website').in('id', sponsorIds);
  if (error) {
    // Logos fall back to initials; the jobs still load.
    Sentry.captureException(new Error('Verified job feed employer logo read failed'));
    return websites;
  }
  for (const sponsor of data || []) if (sponsor.website) websites.set(String(sponsor.id), String(sponsor.website));
  return websites;
}

export async function loadJobFeed({
  filters,
  page,
  trackerEntries,
  resumeProfile,
  asOf = new Date(),
}: {
  filters: JobFilters;
  page: number;
  trackerEntries: TrackerEntrySummary[];
  resumeProfile: ResumeJobProfile | null;
  asOf?: Date;
}): Promise<JobFeedPage> {
  const query = storeQuery(filters, trackerEntries, asOf);
  if (!query) return { jobs: [], total: 0, page, pageSize: JOB_FEED_PAGE_SIZE, rankedCount: 0 };
  const result = await readPage(query, page, resumeProfile);

  // Match IDs come only from verified jobs the Oracle job API returned. The
  // service-role read replaces an RLS policy that joined the retired Supabase
  // jobs table, so it exposes the same match metadata for the same jobs.
  const matchIds = [...new Set(result.rows.map((row) => row.employerMatchId).filter((id): id is string => Boolean(id)))];
  const matchesResult = matchIds.length
    ? await getSupabaseAdminClient().from('employer_matches').select('id, canonical_h1b_sponsor_id, confidence, review_status').in('id', matchIds)
    : { data: [], error: null };
  if (matchesResult.error) throw new JobFeedError('evidence', matchesResult.error);
  const matchesById = new Map((matchesResult.data || []).map((match) => [String(match.id), {
    canonical_h1b_sponsor_id: match.canonical_h1b_sponsor_id ? String(match.canonical_h1b_sponsor_id) : null,
    confidence: Number(match.confidence),
    review_status: String(match.review_status),
  }]));
  const websites = await sponsorWebsites([...new Set([...matchesById.values()]
    .map((match) => match.canonical_h1b_sponsor_id)
    .filter((id): id is string => Boolean(id)))]);

  const signalsByJobId = new Map<string, FeedVisaSignal[]>();
  for (const signal of result.visaSignals || []) {
    const list = signalsByJobId.get(String(signal.jobId)) || [];
    list.push({
      signal_type: String(signal.signalType),
      evidence_snippet: String(signal.evidenceSnippet),
      source_url: String(signal.sourceUrl),
      observed_date: String(signal.observedDate),
      confidence: Number(signal.confidence),
      source: String(signal.source),
    });
    signalsByJobId.set(String(signal.jobId), list);
  }

  const jobs = result.rows.map((row): FeedJob => {
    const match = row.employerMatchId ? matchesById.get(row.employerMatchId) || null : null;
    const job = scoringJob(row);
    return {
      id: row.id,
      title: row.title,
      company_name: row.companyName,
      employer_board_name: row.employerBoardName,
      location: row.location,
      department: row.department,
      description: null,
      job_url: row.jobUrl,
      posted_at: row.postedAt,
      first_seen_at: row.firstSeenAt,
      last_confirmed_at: row.lastConfirmedAt,
      source_ats: row.sourceAts,
      company_website: match?.canonical_h1b_sponsor_id ? websites.get(match.canonical_h1b_sponsor_id) || null : null,
      tracker_status: findActiveTrackerStatus({ ...job, job_url: row.jobUrl }, trackerEntries),
      employer_match: match,
      visa_signals: signalsByJobId.get(row.id) || [],
      resume_match: resumeProfile
        ? result.scores.get(row.id) || scoreJobForResume(resumeProfile, job, inferJobFacts(job))
        : null,
    };
  });
  return { jobs, total: result.total, page, pageSize: JOB_FEED_PAGE_SIZE, rankedCount: result.rankedCount };
}
