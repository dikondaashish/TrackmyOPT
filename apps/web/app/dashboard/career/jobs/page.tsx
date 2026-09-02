import { BriefcaseBusiness } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { JobRunwaySummary } from '@/components/career/jobs/JobRunwayPersonalization';
import { JobBoardExplorer } from '@/components/career/jobs/JobBoardExplorer';
import type { ActiveResumeMatch } from '@/components/career/jobs/ResumeJobMatcher';
import { findActiveTrackerStatus } from '@/lib/job-board/filters';
import { parseResumeJobProfile } from '@/lib/job-board/resume-match';
import { getRunwayContext, type StoredOptStatus } from '@/lib/job-board/runway';
import type { EmploymentSpan } from '@/lib/immigration/opt-calculations';

export const dynamic = 'force-dynamic';

type FeedJob = {
  id: string;
  title: string;
  company_name: string;
  employer_board_name: string | null;
  location: string | null;
  department: string | null;
  description: string | null;
  job_url: string | null;
  posted_at: string | null;
  first_seen_at: string;
  last_confirmed_at: string;
  source_ats: string;
  employer_match: {
    canonical_h1b_sponsor_id: string | null;
    confidence: number;
    review_status: string;
  } | null;
  visa_signals: Array<{
    signal_type: string;
    evidence_snippet: string;
    source_url: string;
    observed_date: string;
    confidence: number;
    source: string;
  }>;
};

type FeedJobQueryResult = Omit<FeedJob, 'employer_match'> & {
  employer_match: FeedJob['employer_match'] | FeedJob['employer_match'][];
};

function restoreResumeMatch(resumes: Array<{ id: string; filename: string | null; structured_data: unknown }>): ActiveResumeMatch | null {
  for (const resume of resumes) {
    if (!resume.structured_data || typeof resume.structured_data !== 'object' || Array.isArray(resume.structured_data)) continue;
    const cached = (resume.structured_data as Record<string, unknown>).jobMatchProfile;
    if (!cached || typeof cached !== 'object' || Array.isArray(cached)) continue;
    const source = (cached as Record<string, unknown>).source;
    const profile = parseResumeJobProfile((cached as Record<string, unknown>).profile);
    if ((source !== 'ai' && source !== 'deterministic') || !profile) continue;
    return {
      resumeId: String(resume.id),
      filename: resume.filename || 'Untitled resume',
      source,
      profile,
    };
  }
  return null;
}

export default async function VerifiedJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [jobsResult, optStatusResult, employmentResult, trackerResult, resumesResult] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, title, company_name, employer_board_name, location, department, job_url, posted_at, first_seen_at, last_confirmed_at, source_ats, employer_match:employer_matches(canonical_h1b_sponsor_id, confidence, review_status), visa_signals:job_visa_signals(signal_type, evidence_snippet, source_url, observed_date, confidence, source)', { count: 'exact' })
      .eq('listing_status', 'open')
      .eq('source_trust_tier', 'verified_ats')
      .order('posted_at', { ascending: false, nullsFirst: false })
      .range(0, 49),
    supabase
      .from('opt_status')
      .select('opt_start_date, opt_ead_end_date, stem_start_date')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('employment_spans')
      .select('id, employer_name, start_date, end_date')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true }),
    supabase
      .from('job_applications')
      .select('job_url, company_name, role_title, status, is_archived')
      .eq('user_id', user.id),
    supabase
      .from('resumes')
      .select('id, filename, updated_at, created_at, structured_data')
      .eq('user_id', user.id)
      .not('content', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(50),
  ]);
  if (jobsResult.error || trackerResult.error || resumesResult.error) throw new Error('Unable to load verified jobs');
  if (optStatusResult.error || employmentResult.error) throw new Error('Unable to load OPT runway');

  const now = new Date();
  const runway = getRunwayContext(
    optStatusResult.data as StoredOptStatus | null,
    (employmentResult.data || []).map((span) => ({ ...span, is_current: !span.end_date })) as EmploymentSpan[],
    now,
  );
  const trackerEntries = trackerResult.data || [];
  const matchedJobs = ((jobsResult.data || []) as FeedJobQueryResult[]).map((job) => ({
    ...job,
    description: null,
    employer_match: Array.isArray(job.employer_match) ? job.employer_match[0] || null : job.employer_match,
  }));
  const sponsorIds = [...new Set(matchedJobs.map((job) => job.employer_match?.canonical_h1b_sponsor_id).filter((id): id is string => Boolean(id)))];
  const sponsorWebsiteById = new Map<string, string | null>();
  if (sponsorIds.length > 0) {
    const { data: sponsors, error: sponsorError } = await getSupabaseAdminClient()
      .from('h1b_sponsors')
      .select('id, website')
      .in('id', sponsorIds);
    if (sponsorError) throw new Error('Unable to load verified employer logos');
    for (const sponsor of sponsors || []) sponsorWebsiteById.set(String(sponsor.id), sponsor.website ? String(sponsor.website) : null);
  }

  const jobs = matchedJobs.map((job) => {
    return {
      ...job,
      company_website: job.employer_match?.canonical_h1b_sponsor_id
        ? sponsorWebsiteById.get(job.employer_match.canonical_h1b_sponsor_id) || null
        : null,
      tracker_status: findActiveTrackerStatus(job, trackerEntries),
    };
  });
  const savedResumeRows = resumesResult.data || [];
  const initialResumeMatch = restoreResumeMatch(savedResumeRows);

  return (
    <main className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5 sm:py-5">
      <header className="max-w-4xl space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-gray-950 sm:text-3xl dark:text-white">Find verified jobs</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
            <BriefcaseBusiness className="size-3.5" aria-hidden="true" /> Employer boards
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Browse jobs and add them to your resume queue. {jobsResult.count || 0} results.
        </p>
      </header>

      <JobRunwaySummary runway={runway} />

      <JobBoardExplorer
        jobs={jobs}
        totalJobs={jobsResult.count || 0}
        serverMode
        runway={runway}
        asOf={now.toISOString()}
        savedResumes={savedResumeRows.map((resume) => ({
          id: String(resume.id),
          filename: resume.filename || 'Untitled resume',
          updatedAt: resume.updated_at || resume.created_at,
        }))}
        initialResumeMatch={initialResumeMatch}
      />
    </main>
  );
}
