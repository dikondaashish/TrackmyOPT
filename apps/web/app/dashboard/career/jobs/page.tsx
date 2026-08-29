import { BriefcaseBusiness } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { JobRunwaySummary } from '@/components/career/jobs/JobRunwayPersonalization';
import { JobBoardExplorer } from '@/components/career/jobs/JobBoardExplorer';
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

export default async function VerifiedJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [jobsResult, optStatusResult, employmentResult, trackerResult] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, title, company_name, employer_board_name, location, department, description, job_url, posted_at, first_seen_at, last_confirmed_at, source_ats, employer_match:employer_matches(canonical_h1b_sponsor_id, confidence, review_status), visa_signals:job_visa_signals(signal_type, evidence_snippet, source_url, observed_date, confidence, source)')
      .eq('listing_status', 'open')
      .eq('source_trust_tier', 'verified_ats')
      .order('posted_at', { ascending: false, nullsFirst: false }),
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
      .select('job_url, company_name, role_title, status')
      .eq('user_id', user.id),
  ]);
  if (jobsResult.error || trackerResult.error) throw new Error('Unable to load verified jobs');
  if (optStatusResult.error || employmentResult.error) throw new Error('Unable to load OPT runway');

  const now = new Date();
  const runway = getRunwayContext(
    optStatusResult.data as StoredOptStatus | null,
    (employmentResult.data || []).map((span) => ({ ...span, is_current: !span.end_date })) as EmploymentSpan[],
    now,
  );
  const trackerEntries = trackerResult.data || [];
  const jobs = ((jobsResult.data || []) as FeedJobQueryResult[]).map((job) => {
    const trackerEntry = trackerEntries.find((entry) => (
      (job.job_url && entry.job_url === job.job_url)
      || (!job.job_url
        && entry.company_name === (job.company_name || job.employer_board_name)
        && entry.role_title === job.title)
    ));
    return {
      ...job,
      employer_match: Array.isArray(job.employer_match) ? job.employer_match[0] || null : job.employer_match,
      tracker_status: trackerEntry?.status || null,
    };
  });

  return (
    <main className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:py-10">
      <header className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
          <BriefcaseBusiness className="size-4" aria-hidden="true" /> Verified employer boards
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-gray-950 sm:text-4xl dark:text-white">Find your next verified role</h1>
        <p className="max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
          Listings come directly from authorized ATS boards and link back to the original employer posting. Employer context is shown only when it has dated, source-backed evidence.
        </p>
      </header>

      <JobRunwaySummary runway={runway} />

      <JobBoardExplorer jobs={jobs} runway={runway} asOf={now.toISOString()} />
    </main>
  );
}
