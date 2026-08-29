import { BriefcaseBusiness, MapPin } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EmployerEvidencePanel } from '@/components/career/jobs/EmployerEvidencePanel';
import { JobRunwaySummary, JobUrgencyLabels } from '@/components/career/jobs/JobRunwayPersonalization';
import { JobCardActions } from '@/components/career/jobs/JobCardActions';
import { getRunwayContext, isRecentlyPosted, type StoredOptStatus } from '@/lib/job-board/runway';
import type { EmploymentSpan } from '@/lib/immigration/opt-calculations';

export const dynamic = 'force-dynamic';

type FeedJob = {
  id: string;
  title: string;
  company_name: string;
  employer_board_name: string | null;
  location: string | null;
  department: string | null;
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

function formatDate(value: string | null) {
  if (!value) return 'Date not provided';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default async function VerifiedJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [jobsResult, optStatusResult, employmentResult] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, title, company_name, employer_board_name, location, department, job_url, posted_at, first_seen_at, last_confirmed_at, source_ats, employer_match:employer_matches(canonical_h1b_sponsor_id, confidence, review_status), visa_signals:job_visa_signals(signal_type, evidence_snippet, source_url, observed_date, confidence, source)')
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
  ]);
  if (jobsResult.error) throw new Error('Unable to load verified jobs');
  if (optStatusResult.error || employmentResult.error) throw new Error('Unable to load OPT runway');

  const now = new Date();
  const runway = getRunwayContext(
    optStatusResult.data as StoredOptStatus | null,
    (employmentResult.data || []).map((span) => ({ ...span, is_current: !span.end_date })) as EmploymentSpan[],
    now,
  );
  const jobs = ((jobsResult.data || []) as FeedJobQueryResult[]).map((job) => ({
    ...job,
    employer_match: Array.isArray(job.employer_match) ? job.employer_match[0] || null : job.employer_match,
  }));

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <BriefcaseBusiness className="size-4" /> Verified ATS jobs
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Jobs from approved employer boards</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Listings come directly from authorized ATS boards and link back to the original employer posting. Employer context is shown only when it has dated, source-backed evidence.
        </p>
      </header>

      <JobRunwaySummary runway={runway} />

      {jobs.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <h2 className="font-semibold text-gray-950 dark:text-white">No verified jobs are live yet</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Approved boards will appear here after their first successful ingestion run.</p>
        </section>
      ) : (
        <section className="grid gap-4">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Verified {job.source_ats} source</p>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">{job.title}</h2>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{job.company_name || job.employer_board_name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {job.location && <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{job.location}</span>}
                    {job.department && <span>{job.department}</span>}
                    <span>Posted {formatDate(job.posted_at)}</span>
                    <span>Confirmed {formatDate(job.last_confirmed_at)}</span>
                  </div>
                </div>
              </div>
              <JobUrgencyLabels
                recentlyPosted={isRecentlyPosted(job.first_seen_at, now)}
                sponsorEvidenced={Boolean(
                  job.employer_match?.canonical_h1b_sponsor_id
                  && ['auto', 'confirmed'].includes(job.employer_match.review_status)
                  && job.visa_signals.length > 0,
                )}
                runway={runway}
              />
              <EmployerEvidencePanel
                employerBoardName={job.employer_board_name}
                match={job.employer_match}
                signals={job.visa_signals || []}
              />
              <JobCardActions
                jobId={job.id}
                companyName={job.company_name || job.employer_board_name || 'Employer'}
                title={job.title}
                jobUrl={job.job_url}
                sponsorId={job.employer_match?.canonical_h1b_sponsor_id || null}
              />
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
