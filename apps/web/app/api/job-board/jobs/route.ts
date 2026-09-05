import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findActiveTrackerStatus, inferJobFacts } from '@/lib/job-board/filters';
import { parseResumeJobProfile, scoreJobForResume, type ResumeJobMatch } from '@/lib/job-board/resume-match';
import { listServerJobs, type ServerJobRecord } from '@/lib/job-board/server-job-store';

const PAGE_SIZE = 50;

const DATE_WINDOWS: Record<string, number> = {
  '1h': 1,
  '6h': 6,
  '12h': 12,
  '24h': 24,
  '48h': 48,
  '7d': 24 * 7,
  '30d': 24 * 30,
};

function safeTerm(value: string) {
  return value.replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
}

function mapOracleJob(row: ServerJobRecord, employerMatch: FeedEmployerMatch | null, visaSignals: FeedVisaSignal[], trackerEntries: TrackerEntry[]) {
  return {
    id: row.id,
    title: row.title,
    company_name: row.companyName,
    employer_board_name: row.employerBoardName,
    location: row.location,
    department: row.department,
    job_url: row.jobUrl,
    posted_at: row.postedAt,
    first_seen_at: row.firstSeenAt,
    last_confirmed_at: row.lastConfirmedAt,
    source_ats: row.sourceAts,
    description: null,
    employer_match: employerMatch,
    visa_signals: visaSignals,
    tracker_status: findActiveTrackerStatus(
      {
        company_name: row.companyName,
        employer_board_name: row.employerBoardName,
        title: row.title,
        job_url: row.jobUrl,
      },
      trackerEntries,
    ),
    company_website: null,
  };
}

type FeedEmployerMatch = {
  canonical_h1b_sponsor_id: string | null;
  confidence: number;
  review_status: string;
};

type FeedVisaSignal = {
  signal_type: string;
  evidence_snippet: string;
  source_url: string;
  observed_date: string;
  confidence: number;
  source: string;
};

type TrackerEntry = {
  job_url: string | null;
  company_name: string | null;
  role_title: string | null;
  status: string | null;
  is_archived: boolean | null;
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get('page') || '1') || 1);
  const scope = params.get('searchScope') || 'title_description';
  const queryText = safeTerm(params.get('query') || '');
  const exclude = safeTerm(params.get('exclude') || '');
  const location = safeTerm(params.get('location') || '');
  const company = safeTerm(params.get('company') || '');
  const date = params.get('date') || 'any';
  const workplace = params.get('workplace') || 'all';
  const degree = params.get('degree') || 'all';
  const experience = params.get('experience') || 'all';
  const evidence = params.get('evidence') || 'all';
  const role = params.get('role') || 'all';
  const jobType = params.get('jobType') || 'all';
  const employmentType = params.get('employmentType') || 'all';
  const tracker = params.get('tracker') || 'all';
  const resumeId = params.get('resumeId');

  const trackerResult = await supabase
    .from('job_applications')
    .select('job_url, company_name, role_title, status, is_archived')
    .eq('user_id', user.id);
  if (trackerResult.error) return NextResponse.json({ error: 'Unable to load tracker filters' }, { status: 500 });
  const trackerEntries = trackerResult.data || [];

  const activeEntries = trackerEntries.filter(
    (entry) =>
      !entry.is_archived &&
      (tracker !== 'applied' ||
        (entry.status && entry.status.toLowerCase() !== 'wishlist')),
  );
  const trackerUrls = [
    ...new Set(
      activeEntries
        .map((entry) => entry.job_url)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const storeQuery: Record<string, string | number | undefined> = {
    page,
    pageSize: PAGE_SIZE,
    query: queryText || undefined,
    searchScope: scope,
    exclude: exclude || undefined,
    location: location && location !== 'all' ? location : undefined,
    companyName: company && company !== 'all' ? company : undefined,
    workplace: workplace !== 'all' ? workplace : undefined,
    degree: degree !== 'all' ? degree : undefined,
    experience: experience !== 'all' ? experience : undefined,
    employerEvidence: evidence === 'source_backed' ? evidence : undefined,
    role: role !== 'all' ? role : undefined,
    jobType: jobType !== 'all' ? jobType : undefined,
    employmentType: employmentType !== 'all' ? employmentType : undefined,
  };
  if (date !== 'any' && DATE_WINDOWS[date]) {
    storeQuery.postedAfter = new Date(
      Date.now() - DATE_WINDOWS[date] * 60 * 60 * 1000,
    ).toISOString();
  }
  if (tracker === 'saved' || tracker === 'applied') {
    if (!trackerUrls.length)
      return NextResponse.json({ jobs: [], total: 0, page, pageSize: PAGE_SIZE });
    storeQuery.includeJobUrls = trackerUrls.join(',');
  } else if (tracker === 'not_saved' && trackerUrls.length) {
    storeQuery.excludeJobUrls = trackerUrls.join(',');
  }
  let storePage;
  try {
    storePage = await listServerJobs(storeQuery);
  } catch {
    return NextResponse.json({ error: 'Unable to load verified jobs' }, { status: 500 });
  }
  const matchIds = [
    ...new Set(storePage.rows.map((row) => row.employerMatchId).filter(Boolean)),
  ] as string[];
  const matchesResult = matchIds.length
    ? await supabase
        .from('employer_matches')
        .select('id, canonical_h1b_sponsor_id, confidence, review_status')
        .in('id', matchIds)
    : { data: [], error: null };
  if (matchesResult.error)
    return NextResponse.json({ error: 'Unable to load job evidence' }, { status: 500 });
  const matchesById = new Map(
    (matchesResult.data || []).map((match) => [
      String(match.id),
      {
        canonical_h1b_sponsor_id: match.canonical_h1b_sponsor_id,
        confidence: Number(match.confidence),
        review_status: String(match.review_status),
      } satisfies FeedEmployerMatch,
    ]),
  );
  const signalsByJobId = new Map<string, FeedVisaSignal[]>();
  for (const signal of storePage.visaSignals || []) {
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
  const jobs = storePage.rows.map((row) =>
    mapOracleJob(
      row,
      row.employerMatchId ? matchesById.get(row.employerMatchId) || null : null,
      signalsByJobId.get(row.id) || [],
      trackerEntries,
    ),
  );
  const resumeMatches = new Map<string, ResumeJobMatch>();
  if (resumeId && storePage.rows.length) {
    const resumeResult = await supabase.from('resumes').select('structured_data').eq('id', resumeId).eq('user_id', user.id).maybeSingle();
    const cachedProfile = resumeResult.data && typeof resumeResult.data.structured_data === 'object' && resumeResult.data.structured_data
      ? (resumeResult.data.structured_data as Record<string, unknown>).jobMatchProfile
      : null;
    const profile = cachedProfile && typeof cachedProfile === 'object'
      ? parseResumeJobProfile((cachedProfile as Record<string, unknown>).profile)
      : null;
    if (profile) {
      for (const row of storePage.rows) {
        const scoringJob = {
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
        resumeMatches.set(row.id, scoreJobForResume(profile, scoringJob, inferJobFacts(scoringJob)));
      }
    }
  }
  const jobsWithMatches = jobs.map((job) => ({ ...job, resume_match: resumeMatches.get(job.id) || null }));
  return NextResponse.json({ jobs: jobsWithMatches, total: storePage.total, page, pageSize: PAGE_SIZE });
}
