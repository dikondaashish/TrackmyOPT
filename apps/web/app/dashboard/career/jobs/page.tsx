import { BriefcaseBusiness, CalendarDays, MapPin } from 'lucide-react';
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

const jobDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(value: string | null) {
  if (!value) return 'Date not provided';
  return jobDateFormatter.format(new Date(value));
}

function sourceCardTone(sourceAts: string) {
  switch (sourceAts.toLowerCase()) {
    case 'greenhouse':
      return 'border-emerald-200 bg-[#daf8e8] dark:border-emerald-900 dark:bg-emerald-950/50';
    case 'ashby':
      return 'border-amber-200 bg-[#fff0bd] dark:border-amber-900 dark:bg-amber-950/50';
    default:
      return 'border-indigo-200 bg-[#e7e6ff] dark:border-indigo-900 dark:bg-indigo-950/50';
  }
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

      {jobs.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <h2 className="font-semibold text-gray-950 dark:text-white">No verified jobs are live yet</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Approved boards will appear here after their first successful ingestion run.</p>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <article key={job.id} className={`group flex h-full flex-col overflow-hidden rounded-[1.5rem] border shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)] motion-reduce:transform-none dark:shadow-none ${sourceCardTone(job.source_ats)}`}>
              <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex items-center rounded-full border border-slate-950/10 bg-white/50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.11em] text-slate-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200">
                    {job.source_ats} verified
                  </span>
                  <span className="shrink-0 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                    Confirmed {formatDate(job.last_confirmed_at)}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <h2 className="text-xl font-bold leading-snug tracking-[-0.02em] text-slate-950 dark:text-white">{job.title}</h2>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{job.company_name || job.employer_board_name}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {job.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" aria-hidden="true" />{job.location}</span>}
                    {job.location && (job.department || job.posted_at) && <span aria-hidden="true">·</span>}
                    {job.department && <span>{job.department}</span>}
                    {job.department && job.posted_at && <span aria-hidden="true">·</span>}
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />Posted {formatDate(job.posted_at)}</span>
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
              </div>
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
