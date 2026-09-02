import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findActiveTrackerStatus, inferJobFacts } from '@/lib/job-board/filters';
import { parseResumeJobProfile, scoreJobForResume, type ResumeJobMatch } from '@/lib/job-board/resume-match';

const PAGE_SIZE = 50;
const JOB_SELECT = 'id, title, company_name, employer_board_name, location, department, job_url, posted_at, first_seen_at, last_confirmed_at, source_ats, employer_match:employer_matches(canonical_h1b_sponsor_id, confidence, review_status), visa_signals:job_visa_signals(signal_type, evidence_snippet, source_url, observed_date, confidence, source)';

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

function pattern(value: string) {
  return `%${safeTerm(value)}%`;
}

function parseList(value: string | null) {
  return value?.split(',').map((item) => safeTerm(item)).filter(Boolean) || [];
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get('page') || '1') || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
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

  let jobsQuery = supabase
    .from('jobs')
    .select(JOB_SELECT, { count: 'exact' })
    .eq('listing_status', 'open')
    .eq('source_trust_tier', 'verified_ats');

  if (queryText) {
    if (scope === 'title') jobsQuery = jobsQuery.ilike('title', pattern(queryText));
    else if (scope === 'company') jobsQuery = jobsQuery.or(`company_name.ilike.${pattern(queryText)},employer_board_name.ilike.${pattern(queryText)}`);
    else jobsQuery = jobsQuery.or(`title.ilike.${pattern(queryText)},description.ilike.${pattern(queryText)},company_name.ilike.${pattern(queryText)},employer_board_name.ilike.${pattern(queryText)}`);
  }
  if (exclude) {
    for (const column of ['title', 'company_name', 'employer_board_name', 'description', 'location', 'department']) {
      jobsQuery = jobsQuery.not(column, 'ilike', pattern(exclude));
    }
  }
  if (location && location !== 'all') jobsQuery = jobsQuery.eq('location', location);
  if (company && company !== 'all') jobsQuery = jobsQuery.or(`company_name.eq.${company},employer_board_name.eq.${company}`);
  if (date !== 'any' && DATE_WINDOWS[date]) jobsQuery = jobsQuery.gte('posted_at', new Date(Date.now() - DATE_WINDOWS[date] * 60 * 60 * 1000).toISOString());

  if (workplace !== 'all') {
    if (workplace === 'remote') jobsQuery = jobsQuery.or(`location.ilike.%remote%,description.ilike.%remote%`);
    else if (workplace === 'hybrid') jobsQuery = jobsQuery.or(`location.ilike.%hybrid%,description.ilike.%hybrid%`);
    else if (workplace === 'on_site') jobsQuery = jobsQuery.or(`location.ilike.%on-site%,location.ilike.%onsite%,location.ilike.%in-office%,description.ilike.%on-site%,description.ilike.%onsite%`);
    else jobsQuery = jobsQuery.not('location', 'ilike', '%remote%').not('location', 'ilike', '%hybrid%');
  }

  if (degree === 'bachelor') jobsQuery = jobsQuery.or('description.ilike.%bachelor%,description.ilike.%b.s.%,description.ilike.%b.a.%');
  if (degree === 'master') jobsQuery = jobsQuery.or('description.ilike.%master%,description.ilike.%m.s.%,description.ilike.%mba%');
  if (degree === 'doctorate') jobsQuery = jobsQuery.or('description.ilike.%ph.d.%,description.ilike.%doctorate%,description.ilike.%doctoral%');
  if (degree === 'unspecified') jobsQuery = jobsQuery.not('description', 'ilike', '%bachelor%').not('description', 'ilike', '%master%').not('description', 'ilike', '%doctorate%');

  if (experience === 'entry') jobsQuery = jobsQuery.or('description.ilike.%0 year%,description.ilike.%1 year%,description.ilike.%2 year%');
  if (experience === 'mid') jobsQuery = jobsQuery.or('description.ilike.%3 year%,description.ilike.%4 year%,description.ilike.%5 year%');
  if (experience === 'senior') jobsQuery = jobsQuery.or('description.ilike.%6 year%,description.ilike.%7 year%,description.ilike.%8 year%,description.ilike.%9 year%,description.ilike.%10 year%');

  const rolePatterns: Record<string, string> = {
    engineering: 'engineer,engineering,developer,software,platform,security,devops,site reliability,sre,firmware',
    data: 'data,analyst,analytics,scientist,machine learning,ml,artificial intelligence,ai',
    product: 'product,product manager,product owner',
    design: 'design,designer,ux,ui,user experience,user interface',
    operations: 'operations,strategy,customer success,support,deployment,program manager,project manager',
    sales: 'sales,account executive,business development,revenue,solutions consultant',
    other: '',
  };
  if (role !== 'all') {
    const terms = parseList(rolePatterns[role] || '');
    if (terms.length) jobsQuery = jobsQuery.or(terms.map((term) => `title.ilike.${pattern(term)}`).join(','));
  }
  if (jobType === 'internship') jobsQuery = jobsQuery.or('title.ilike.%intern%,description.ilike.%internship%');
  if (jobType === 'contract') jobsQuery = jobsQuery.or('title.ilike.%contract%,description.ilike.%contractor%');
  if (jobType === 'temporary') jobsQuery = jobsQuery.or('title.ilike.%temporary%,description.ilike.%fixed-term%');
  if (jobType === 'permanent') jobsQuery = jobsQuery.or('description.ilike.%permanent%,description.ilike.%regular employee%');
  if (employmentType === 'full_time') jobsQuery = jobsQuery.or('description.ilike.%full-time%,description.ilike.%full time%,description.ilike.%fte%');
  if (employmentType === 'part_time') jobsQuery = jobsQuery.or('description.ilike.%part-time%,description.ilike.%part time%');
  if (evidence === 'source_backed') jobsQuery = jobsQuery.not('employer_matches', 'is', null);

  if (tracker !== 'all') {
    const activeEntries = trackerEntries.filter((entry) => !entry.is_archived && (tracker !== 'applied' || (entry.status && entry.status.toLowerCase() !== 'wishlist')));
    const urls = [...new Set(activeEntries.map((entry) => entry.job_url).filter((value): value is string => Boolean(value)))];
    if (tracker === 'saved' || tracker === 'applied') {
      if (!urls.length) return NextResponse.json({ jobs: [], total: 0, page, pageSize: PAGE_SIZE });
      jobsQuery = jobsQuery.in('job_url', urls);
    } else if (tracker === 'not_saved' && urls.length) {
      jobsQuery = jobsQuery.not('job_url', 'in', `(${urls.join(',')})`);
    }
  }

  const { data, error, count } = await jobsQuery
    .order('posted_at', { ascending: false, nullsFirst: false })
    .range(from, to);
  if (error) return NextResponse.json({ error: 'Unable to load verified jobs' }, { status: 500 });

  const jobs = (data || []).map((job) => ({
    ...job,
    employer_match: Array.isArray(job.employer_match) ? job.employer_match[0] || null : job.employer_match,
    tracker_status: findActiveTrackerStatus(job, trackerEntries),
    company_website: null,
  }));
  const resumeMatches = new Map<string, ResumeJobMatch>();
  if (resumeId && jobs.length) {
    const resumeResult = await supabase.from('resumes').select('structured_data').eq('id', resumeId).eq('user_id', user.id).maybeSingle();
    const cachedProfile = resumeResult.data && typeof resumeResult.data.structured_data === 'object' && resumeResult.data.structured_data
      ? (resumeResult.data.structured_data as Record<string, unknown>).jobMatchProfile
      : null;
    const profile = cachedProfile && typeof cachedProfile === 'object'
      ? parseResumeJobProfile((cachedProfile as Record<string, unknown>).profile)
      : null;
    if (profile) {
      const descriptionsResult = await supabase
        .from('jobs')
        .select('id, title, company_name, employer_board_name, location, department, description, posted_at')
        .in('id', jobs.map((job) => job.id));
      for (const job of descriptionsResult.data || []) {
        const scoringJob = {
          ...job,
          tracker_status: null,
          employer_match: null,
          visa_signals: [],
        };
        resumeMatches.set(String(job.id), scoreJobForResume(profile, scoringJob, inferJobFacts(scoringJob)));
      }
    }
  }
  const jobsWithMatches = jobs.map((job) => ({ ...job, resume_match: resumeMatches.get(job.id) || null }));
  return NextResponse.json({ jobs: jobsWithMatches, total: count || 0, page, pageSize: PAGE_SIZE });
}
