import { BriefcaseBusiness } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { JobRunwaySummary } from '@/components/career/jobs/JobRunwayPersonalization';
import { JobBoardExplorer } from '@/components/career/jobs/JobBoardExplorer';
import type { ActiveResumeMatch } from '@/components/career/jobs/ResumeJobMatcher';
import { EMPTY_JOB_FILTERS } from '@/lib/job-board/filters';
import { hasJobFilterParams, NO_RESUME, readJobSearchParams, toUrlSearchParams } from '@/lib/job-board/filter-params';
import { cachedResumeJobProfile, countSavedJobs, loadJobFeed } from '@/lib/job-board/job-feed';
import { deriveResumeJobFilters } from '@/lib/job-board/resume-filter-defaults';
import { listServerJobFacets, type ServerJobFacets } from '@/lib/job-board/server-job-store';
import { getRunwayContext, type StoredOptStatus } from '@/lib/job-board/runway';
import type { EmploymentSpan } from '@/lib/immigration/opt-calculations';

export const dynamic = 'force-dynamic';

/** Longest the page waits for filter options before using the loaded jobs' values. */
const FACETS_WAIT_MS = 3_000;

type SavedResumeRow = { id: string; filename: string | null; structured_data: unknown };

function resumeMatchFor(resume: SavedResumeRow): ActiveResumeMatch | null {
  const cached = cachedResumeJobProfile(resume.structured_data);
  return cached ? { resumeId: String(resume.id), filename: resume.filename || 'Untitled resume', ...cached } : null;
}

/** The resume the URL names; otherwise the newest resume with a cached match profile. */
function chooseResumeMatch(resumes: SavedResumeRow[], resumeId: string | null): ActiveResumeMatch | null {
  if (resumeId === NO_RESUME) return null;
  if (resumeId) {
    const named = resumes.find((resume) => String(resume.id) === resumeId);
    return named ? resumeMatchFor(named) : null;
  }
  for (const resume of resumes) {
    const match = resumeMatchFor(resume);
    if (match) return match;
  }
  return null;
}

export default async function VerifiedJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = toUrlSearchParams(await searchParams);
  const search = readJobSearchParams(params);

  // The Location and Company options must cover every open job, not only
  // the first page. Without them the explorer falls back to page values.
  // Started now and awaited last, and bounded, so it never holds the page:
  // a slow read still finishes and fills the API's cache for the next visit.
  const facetsPromise = Promise.race([
    listServerJobFacets().catch((): ServerJobFacets | null => {
      console.error('[job-board] Filter options unavailable; falling back to first-page values');
      return null;
    }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), FACETS_WAIT_MS)),
  ]);
  const [optStatusResult, employmentResult, trackerResult, resumesResult] = await Promise.all([
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
  if (trackerResult.error || resumesResult.error) throw new Error('Unable to load verified jobs');
  if (optStatusResult.error || employmentResult.error) throw new Error('Unable to load OPT runway');

  const now = new Date();
  const runway = getRunwayContext(
    optStatusResult.data as StoredOptStatus | null,
    (employmentResult.data || []).map((span) => ({ ...span, is_current: !span.end_date })) as EmploymentSpan[],
    now,
  );
  const trackerEntries = trackerResult.data || [];
  const savedResumeRows = resumesResult.data || [];
  const initialResumeMatch = chooseResumeMatch(savedResumeRows, search.resumeId);
  // A link or reload keeps its filters; a fresh visit with a saved resume
  // starts from that resume's suggested filters (which need the place options).
  const initialFilters = hasJobFilterParams(params)
    ? search.filters
    : initialResumeMatch && !search.resumeId
      ? deriveResumeJobFilters(initialResumeMatch.profile, ((await facetsPromise)?.places || []).map((place) => place.key))
      : EMPTY_JOB_FILTERS;

  const feedPromise = loadJobFeed({
    filters: initialFilters,
    page: search.page,
    trackerEntries,
    resumeProfile: initialResumeMatch?.profile ?? null,
    asOf: now,
  });
  const [feed, facets] = await Promise.all([feedPromise, facetsPromise]);

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
          Browse jobs and add them to your resume queue.
        </p>
      </header>

      <JobRunwaySummary runway={runway} />

      <JobBoardExplorer
        jobs={feed.jobs}
        totalJobs={feed.total}
        serverMode
        initialPage={feed.page}
        pageSize={feed.pageSize}
        rankedCount={feed.rankedCount}
        initialFilters={initialFilters}
        savedCount={countSavedJobs(trackerEntries)}
        placeOptions={facets?.places}
        companyOptions={facets?.companies}
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
