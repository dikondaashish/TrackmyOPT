'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Bookmark, ChevronDown, FileText, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { EmployerEvidencePanel } from '@/components/career/jobs/EmployerEvidencePanel';
import { AtsSourceLogo, JobCompanyLogo } from '@/components/career/jobs/JobBrandLogo';
import { atsSourceName } from '@/components/career/jobs/JobBrandLogo.utils';
import { JobCardActions } from '@/components/career/jobs/JobCardActions';
import { JobUrgencyLabels } from '@/components/career/jobs/JobRunwayPersonalization';
import { ResumeJobMatcher, type ActiveResumeMatch, type SavedResumeOption } from '@/components/career/jobs/ResumeJobMatcher';
import {
  EMPTY_JOB_FILTERS,
  hasPositiveSponsorshipEvidence,
  hasSourceBackedEmployerHistory,
  inferJobFacts,
  matchesJobFilters,
  type FilterableJob,
  type JobFacts,
  type JobFilters,
} from '@/lib/job-board/filters';
import { scoreJobForResume, type ResumeJobMatch } from '@/lib/job-board/resume-match';
import { isRecentlyPosted, type RunwayContext } from '@/lib/job-board/runway';

type VisaSignal = {
  signal_type: string;
  evidence_snippet: string;
  source_url: string;
  observed_date: string;
  confidence: number;
  source: string;
};

type ExplorerJob = FilterableJob & {
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
  company_website: string | null;
  tracker_status: string | null;
  employer_match: {
    canonical_h1b_sponsor_id: string | null;
    confidence: number;
    review_status: string;
  } | null;
  visa_signals: VisaSignal[];
};

const EMPTY_SAVED_RESUMES: SavedResumeOption[] = [];

const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function formatDate(value: string | null) {
  if (!value) return 'Date not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date not provided';
  return `${shortMonthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function initialSavedJobIds(jobs: ExplorerJob[]) {
  const ids = new Set<string>();
  for (const job of jobs) {
    if (job.tracker_status) ids.add(job.id);
  }
  return ids;
}

function FilterSelect({ label, value, onChange, children }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 max-w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
    </label>
  );
}

function requirementLabel(facts: JobFacts) {
  const labels = [
    facts.workplace === 'on_site' ? 'On-site' : facts.workplace === 'unspecified' ? null : facts.workplace[0].toUpperCase() + facts.workplace.slice(1),
    facts.employmentType === 'full_time' ? 'Full-time' : facts.employmentType === 'part_time' ? 'Part-time' : null,
    facts.experience === 'entry' ? '0–2 years' : facts.experience === 'mid' ? '3–5 years' : facts.experience === 'senior' ? '6+ years' : null,
    facts.degreeLevels.length ? facts.degreeLevels.map((degree) => degree === 'bachelor' ? "Bachelor's" : degree === 'master' ? "Master's" : 'Doctorate').join(' / ') : null,
  ];
  return labels.filter((label): label is string => Boolean(label));
}

function readableDescription(description: string | null) {
  return description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'The employer has not provided a job description on this authorized board.';
}

function JobListItem({
  job,
  facts,
  runway,
  asOf,
  saved,
  expanded,
  onToggle,
  onSaved,
  resumeMatch,
}: {
  job: ExplorerJob;
  facts: JobFacts;
  runway: RunwayContext | null;
  asOf: Date;
  saved: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSaved: () => void;
  resumeMatch: ResumeJobMatch | null;
}) {
  const companyName = job.company_name || job.employer_board_name || 'Employer';
  const requirements = requirementLabel(facts);
  const employerHistory = hasSourceBackedEmployerHistory(job);
  const sponsorEvidenced = hasPositiveSponsorshipEvidence(job);

  return (
    <article className="relative rounded-xl border border-slate-200 bg-white transition-colors duration-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
      <div className="flex flex-col gap-3 p-3.5 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <JobCompanyLogo companyName={companyName} website={job.company_website} />
          <div className="min-w-0 flex-1">
            <button type="button" onClick={onToggle} aria-expanded={expanded} className="group flex min-h-11 items-center gap-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              <h2 className="text-base font-semibold leading-5 tracking-[-0.01em] text-slate-950 group-hover:text-blue-800 sm:text-[1.05rem] dark:text-white dark:group-hover:text-blue-200">{job.title}</h2>
              <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">{companyName} <span className="px-0.5 text-slate-300 dark:text-slate-600">·</span> {job.location || 'Location not provided'} <span className="px-0.5 text-slate-300 dark:text-slate-600">·</span> {formatDate(job.posted_at)}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {resumeMatch && <span className={`rounded-md px-2 py-0.5 text-xs font-semibold leading-5 ${resumeMatch.score >= 75 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200' : resumeMatch.score >= 50 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}>{resumeMatch.score}% match</span>}
              {requirements.map((label) => <span key={label} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium leading-5 text-slate-600 dark:bg-slate-900 dark:text-slate-300">{label}</span>)}
              {employerHistory && <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium leading-5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200">Source-backed history</span>}
              {job.tracker_status && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium leading-5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200">Tracker: {job.tracker_status}</span>}
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><AtsSourceLogo sourceAts={job.source_ats} /> {atsSourceName(job.source_ats)} verified{job.department ? ` · ${job.department}` : ''}</p>
          </div>
        </div>
        <JobCardActions
          jobId={job.id}
          companyName={companyName}
          title={job.title}
          jobUrl={job.job_url}
          sponsorId={job.employer_match?.canonical_h1b_sponsor_id || null}
          initialSaved={saved}
          onSaved={onSaved}
          variant="list"
        />
      </div>

      {expanded && (
        <div className="rounded-b-[0.7rem] border-t border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div>
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><FileText className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" /> Job description</h3>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-[0.8125rem] leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                {readableDescription(job.description)}
              </div>
            </div>
            <aside className="space-y-2.5 border-t border-slate-200 pt-4 dark:border-slate-800 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Details</h3>
              <dl className="space-y-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Source:</dt> <dd className="inline">{atsSourceName(job.source_ats)} verified employer board</dd></div>
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Posted:</dt> <dd className="inline">{formatDate(job.posted_at)}</dd></div>
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Confirmed:</dt> <dd className="inline">{formatDate(job.last_confirmed_at)}</dd></div>
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Role:</dt> <dd className="inline">{facts.roles.join(', ').replaceAll('_', ' ')}</dd></div>
              </dl>
              <JobUrgencyLabels recentlyPosted={isRecentlyPosted(job.first_seen_at, asOf)} sponsorEvidenced={sponsorEvidenced} runway={runway} />
            </aside>
          </div>
          {resumeMatch && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/60 dark:bg-blue-950/20">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Why this job matches</h3>
              <ul className="mt-1.5 space-y-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                {resumeMatch.reasons.map((reason) => <li key={reason} className="flex gap-2"><span className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />{reason}</li>)}
              </ul>
              {resumeMatch.matchedSkills.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{resumeMatch.matchedSkills.map((skill) => <span key={skill} className="rounded bg-white px-1.5 py-0.5 text-[0.6875rem] font-medium text-blue-800 dark:bg-slate-950 dark:text-blue-200">{skill}</span>)}</div>}
              <p className="mt-2 text-[0.6875rem] leading-4 text-slate-500 dark:text-slate-400">This is a qualification-text comparison, not a hiring or sponsorship prediction.</p>
            </div>
          )}
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800"><EmployerEvidencePanel employerBoardName={job.employer_board_name} match={job.employer_match} signals={job.visa_signals || []} /></div>
          <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Saving adds this listing to your tracker. “Apply on ATS” only opens the employer posting.</p>
        </div>
      )}
    </article>
  );
}

export function JobBoardExplorer({ jobs, runway, asOf, savedResumes = EMPTY_SAVED_RESUMES }: { jobs: ExplorerJob[]; runway: RunwayContext | null; asOf: string; savedResumes?: SavedResumeOption[] }) {
  const [draft, setDraft] = useState<JobFilters>(EMPTY_JOB_FILTERS);
  const [filters, setFilters] = useState<JobFilters>(EMPTY_JOB_FILTERS);
  const [savedJobIds, setSavedJobIds] = useState(() => initialSavedJobIds(jobs));
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [activeResumeMatch, setActiveResumeMatch] = useState<ActiveResumeMatch | null>(null);
  const asOfDate = useMemo(() => new Date(asOf), [asOf]);

  const factsByJob = useMemo(() => new Map(jobs.map((job) => [job.id, inferJobFacts(job)])), [jobs]);
  const locations = useMemo(() => [...new Set(jobs.map((job) => job.location).filter((value): value is string => Boolean(value)))].sort(), [jobs]);
  const companies = useMemo(() => [...new Set(jobs.map((job) => job.company_name || job.employer_board_name).filter((value): value is string => Boolean(value)))].sort(), [jobs]);
  const resumeMatches = useMemo(() => new Map(jobs.map((job) => [
    job.id,
    activeResumeMatch ? scoreJobForResume(activeResumeMatch.profile, job, factsByJob.get(job.id)!) : null,
  ])), [activeResumeMatch, factsByJob, jobs]);
  const visibleJobs = useMemo(() => jobs
    .filter((job) => matchesJobFilters(job, factsByJob.get(job.id)!, filters, savedJobIds.has(job.id), asOfDate))
    .sort((left, right) => activeResumeMatch ? (resumeMatches.get(right.id)?.score || 0) - (resumeMatches.get(left.id)?.score || 0) : 0),
  [activeResumeMatch, asOfDate, factsByJob, filters, jobs, resumeMatches, savedJobIds]);

  const updateDraft = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setDraft(EMPTY_JOB_FILTERS);
    setFilters(EMPTY_JOB_FILTERS);
  };

  return (
    <section className="space-y-3" aria-label="Verified job search">
      <ResumeJobMatcher savedResumes={savedResumes} activeMatch={activeResumeMatch} onMatch={setActiveResumeMatch} onClear={() => setActiveResumeMatch(null)} />
      <form
        className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          event.currentTarget.querySelector<HTMLDetailsElement>('[data-advanced-filters]')?.removeAttribute('open');
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-600/15 dark:border-slate-700 dark:bg-slate-950">
            <FilterSelect label="Search scope" value={draft.searchScope} onChange={(value) => updateDraft('searchScope', value as JobFilters['searchScope'])}>
              <option value="title_description">Title + description</option>
              <option value="title">Title only</option>
              <option value="company">Company</option>
            </FilterSelect>
            <span className="h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search verified jobs</span>
              <input
                value={draft.query}
                onChange={(event) => updateDraft('query', event.target.value)}
                placeholder="Search title or keyword"
                className="h-11 w-full min-w-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect label="Date" value={draft.date} onChange={(value) => updateDraft('date', value as JobFilters['date'])}>
              <option value="any">Date</option><option value="1h">Past hour</option><option value="6h">Past 6 hours</option><option value="12h">Past 12 hours</option><option value="24h">Past 24 hours</option><option value="48h">Past 48 hours</option><option value="7d">Past week</option><option value="30d">Past month</option>
            </FilterSelect>
            <FilterSelect label="Location" value={draft.location} onChange={(value) => updateDraft('location', value)}>
              <option value="all">Location</option>{locations.map((location) => <option key={location} value={location}>{location}</option>)}
            </FilterSelect>
            <FilterSelect label="Workplace" value={draft.workplace} onChange={(value) => updateDraft('workplace', value as JobFilters['workplace'])}>
              <option value="all">Workplace</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="on_site">On-site</option><option value="unspecified">Not specified</option>
            </FilterSelect>
            <FilterSelect label="Company" value={draft.company} onChange={(value) => updateDraft('company', value)}>
              <option value="all">Companies</option>{companies.map((company) => <option key={company} value={company}>{company}</option>)}
            </FilterSelect>
            <FilterSelect label="Role" value={draft.role} onChange={(value) => updateDraft('role', value as JobFilters['role'])}>
              <option value="all">Role</option><option value="engineering">Engineering</option><option value="data">Data & analytics</option><option value="product">Product</option><option value="design">Design</option><option value="operations">Operations</option><option value="sales">Sales</option><option value="other">Other</option>
            </FilterSelect>
            <details className="group relative w-full sm:w-auto" data-advanced-filters>
              <summary className="inline-flex min-h-11 w-full cursor-pointer list-none items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                <SlidersHorizontal className="size-4" aria-hidden="true" /> More filters <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="absolute left-0 z-20 mt-2 w-[min(40rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:right-0 sm:left-auto dark:border-slate-700 dark:bg-slate-950">
                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700">
                  <span className="font-medium text-slate-500">Exclude</span>
                  <input
                    aria-label="Exclude jobs containing"
                    value={draft.exclude}
                    onChange={(event) => updateDraft('exclude', event.target.value)}
                    placeholder="Hide jobs mentioning a keyword"
                    className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <FilterSelect label="Degree level" value={draft.degree} onChange={(value) => updateDraft('degree', value as JobFilters['degree'])}>
                    <option value="all">Degree level</option><option value="bachelor">Bachelor's</option><option value="master">Master's</option><option value="doctorate">Doctorate</option><option value="unspecified">Not specified</option>
                  </FilterSelect>
                  <FilterSelect label="Maximum experience" value={draft.experience} onChange={(value) => updateDraft('experience', value as JobFilters['experience'])}>
                    <option value="all">Max experience</option><option value="entry">Up to 2 years required</option><option value="mid">Up to 5 years required</option><option value="senior">Any stated experience</option><option value="unspecified">Not specified</option>
                  </FilterSelect>
                  <FilterSelect label="Employer evidence" value={draft.evidence} onChange={(value) => updateDraft('evidence', value as JobFilters['evidence'])}>
                    <option value="all">Employer evidence</option><option value="source_backed">Source-backed history</option>
                  </FilterSelect>
                  <FilterSelect label="Job type" value={draft.jobType} onChange={(value) => updateDraft('jobType', value as JobFilters['jobType'])}>
                    <option value="all">Job type</option><option value="internship">Internship</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="permanent">Permanent</option><option value="unspecified">Not specified</option>
                  </FilterSelect>
                  <FilterSelect label="Employment type" value={draft.employmentType} onChange={(value) => updateDraft('employmentType', value as JobFilters['employmentType'])}>
                    <option value="all">Employment type</option><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="unspecified">Not specified</option>
                  </FilterSelect>
                  <FilterSelect label="Tracker status" value={draft.tracker} onChange={(value) => updateDraft('tracker', value as JobFilters['tracker'])}>
                    <option value="all">Tracker status</option><option value="saved">Saved</option><option value="not_saved">Not saved</option><option value="applied">Manually applied</option>
                  </FilterSelect>
                </div>
              </div>
            </details>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"><RotateCcw className="size-4" aria-hidden="true" /> Clear</button>
              <button type="submit" aria-label="Apply filters" className="inline-flex min-h-11 items-center rounded-lg bg-slate-950 px-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Apply</button>
            </div>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300" aria-live="polite">{visibleJobs.length} {visibleJobs.length === 1 ? 'job' : 'jobs'}{activeResumeMatch ? ' ranked for your resume' : ''}</p>
        <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300"><Bookmark className="size-3.5" aria-hidden="true" /> Saved {savedJobIds.size}</span>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-950 dark:text-white">No verified jobs match these filters</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Try removing a filter or searching with a broader term. Only authorized employer-board listings appear here.</p>
          <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleJobs.map((job) => {
            const facts = factsByJob.get(job.id)!;
            const saved = savedJobIds.has(job.id);
            return (
              <JobListItem
                key={job.id}
                job={job}
                facts={facts}
                runway={runway}
                asOf={asOfDate}
                saved={saved}
                expanded={expandedJobId === job.id}
                onToggle={() => setExpandedJobId((current) => current === job.id ? null : job.id)}
                onSaved={() => setSavedJobIds((current) => new Set(current).add(job.id))}
                resumeMatch={resumeMatches.get(job.id) || null}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
