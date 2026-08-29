'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Bookmark, BriefcaseBusiness, CalendarDays, ChevronDown, MapPin, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { EmployerEvidencePanel } from '@/components/career/jobs/EmployerEvidencePanel';
import { JobCardActions } from '@/components/career/jobs/JobCardActions';
import { JobUrgencyLabels } from '@/components/career/jobs/JobRunwayPersonalization';
import { isRecentlyPosted, type RunwayContext } from '@/lib/job-board/runway';

type VisaSignal = {
  signal_type: string;
  evidence_snippet: string;
  source_url: string;
  observed_date: string;
  confidence: number;
  source: string;
};

type ExplorerJob = {
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
  tracker_status: string | null;
  employer_match: {
    canonical_h1b_sponsor_id: string | null;
    confidence: number;
    review_status: string;
  } | null;
  visa_signals: VisaSignal[];
};

type JobFacts = {
  workplace: 'remote' | 'hybrid' | 'on_site' | 'unspecified';
  degree: 'bachelor' | 'master' | 'doctorate' | 'unspecified';
  experience: 'entry' | 'mid' | 'senior' | 'unspecified';
  role: 'engineering' | 'data' | 'product' | 'design' | 'operations' | 'sales' | 'other';
  jobType: 'internship' | 'contract' | 'temporary' | 'permanent';
  employmentType: 'full_time' | 'part_time' | 'unspecified';
};

type JobFilters = {
  searchScope: 'title_description' | 'title' | 'company';
  query: string;
  exclude: string;
  date: 'any' | '1' | '3' | '7' | '30';
  location: string;
  workplace: 'all' | JobFacts['workplace'];
  company: string;
  degree: 'all' | JobFacts['degree'];
  experience: 'all' | JobFacts['experience'];
  evidence: 'all' | 'source_backed';
  role: 'all' | JobFacts['role'];
  jobType: 'all' | JobFacts['jobType'];
  employmentType: 'all' | JobFacts['employmentType'];
  tracker: 'all' | 'saved' | 'not_saved' | 'applied';
};

const emptyFilters: JobFilters = {
  searchScope: 'title_description',
  query: '',
  exclude: '',
  date: 'any',
  location: 'all',
  workplace: 'all',
  company: 'all',
  degree: 'all',
  experience: 'all',
  evidence: 'all',
  role: 'all',
  jobType: 'all',
  employmentType: 'all',
  tracker: 'all',
};

const jobDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

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

function formatDate(value: string | null) {
  if (!value) return 'Date not provided';
  return jobDateFormatter.format(new Date(value));
}

function compact(value: string | null | undefined) {
  return value?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase() || '';
}

function getFacts(job: ExplorerJob): JobFacts {
  const title = compact(job.title);
  const text = `${title} ${compact(job.description)} ${compact(job.location)}`;
  const experienceMatch = text.match(/\b(\d{1,2})\s*(?:\+|[-–]\s*\d+)?\s*(?:years|yrs)\b/i);
  const minimumYears = experienceMatch ? Number(experienceMatch[1]) : null;

  return {
    workplace: /\bhybrid\b/.test(text) ? 'hybrid' : /\bremote\b/.test(text) ? 'remote' : /\b(on[ -]?site|in[ -]?office)\b/.test(text) ? 'on_site' : 'unspecified',
    degree: /\b(ph\.?d|doctorate|doctoral)\b/.test(text) ? 'doctorate' : /\b(master'?s|mba|m\.s\.)\b/.test(text) ? 'master' : /\b(bachelor'?s|b\.s\.|b\.a\.)\b/.test(text) ? 'bachelor' : 'unspecified',
    experience: minimumYears === null ? 'unspecified' : minimumYears <= 2 ? 'entry' : minimumYears <= 5 ? 'mid' : 'senior',
    role: /\b(engineer|developer|software|platform|security)\b/.test(title) ? 'engineering' : /\b(data|analyst|analytics|scientist)\b/.test(title) ? 'data' : /\bproduct\b/.test(title) ? 'product' : /\b(design|ux|ui)\b/.test(title) ? 'design' : /\b(sales|account executive|business development)\b/.test(title) ? 'sales' : /\b(operations|strategy|customer success|support|deployment)\b/.test(title) ? 'operations' : 'other',
    jobType: /\b(intern|internship)\b/.test(text) ? 'internship' : /\b(contract|contractor|freelance)\b/.test(text) ? 'contract' : /\b(temporary|temp)\b/.test(text) ? 'temporary' : 'permanent',
    employmentType: /\bpart[ -]?time\b/.test(text) ? 'part_time' : /\bfull[ -]?time\b/.test(text) ? 'full_time' : 'unspecified',
  };
}

function isSourceBacked(job: ExplorerJob) {
  return Boolean(
    job.employer_match?.canonical_h1b_sponsor_id
    && ['auto', 'confirmed'].includes(job.employer_match.review_status)
    && job.visa_signals.length > 0,
  );
}

function isWithinDateRange(date: string | null, days: JobFilters['date']) {
  if (days === 'any') return true;
  if (!date) return false;
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return false;
  return timestamp >= Date.now() - Number(days) * 24 * 60 * 60 * 1000;
}

function hasAppliedStatus(status: string | null) {
  return status?.toLowerCase() === 'applied';
}

function matchesFilters(job: ExplorerJob, facts: JobFacts, filters: JobFilters, saved: boolean) {
  const query = compact(filters.query);
  const excluded = compact(filters.exclude);
  const company = job.company_name || job.employer_board_name || '';
  const searchable = filters.searchScope === 'title'
    ? compact(job.title)
    : filters.searchScope === 'company'
      ? compact(company)
      : `${compact(job.title)} ${compact(job.description)}`;
  const everything = `${compact(job.title)} ${compact(company)} ${compact(job.description)}`;

  return (!query || searchable.includes(query))
    && (!excluded || !everything.includes(excluded))
    && isWithinDateRange(job.posted_at, filters.date)
    && (filters.location === 'all' || job.location === filters.location)
    && (filters.company === 'all' || company === filters.company)
    && (filters.workplace === 'all' || facts.workplace === filters.workplace)
    && (filters.degree === 'all' || facts.degree === filters.degree)
    && (filters.experience === 'all' || facts.experience === filters.experience)
    && (filters.evidence === 'all' || isSourceBacked(job))
    && (filters.role === 'all' || facts.role === filters.role)
    && (filters.jobType === 'all' || facts.jobType === filters.jobType)
    && (filters.employmentType === 'all' || facts.employmentType === filters.employmentType)
    && (filters.tracker === 'all' || (filters.tracker === 'saved' && saved) || (filters.tracker === 'not_saved' && !saved) || (filters.tracker === 'applied' && hasAppliedStatus(job.tracker_status)));
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
        className="min-h-11 max-w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
    </label>
  );
}

export function JobBoardExplorer({ jobs, runway }: { jobs: ExplorerJob[]; runway: RunwayContext | null }) {
  const [draft, setDraft] = useState<JobFilters>(emptyFilters);
  const [filters, setFilters] = useState<JobFilters>(emptyFilters);
  const [savedJobIds, setSavedJobIds] = useState(() => new Set(jobs.filter((job) => job.tracker_status).map((job) => job.id)));

  const factsByJob = useMemo(() => new Map(jobs.map((job) => [job.id, getFacts(job)])), [jobs]);
  const locations = useMemo(() => [...new Set(jobs.map((job) => job.location).filter((value): value is string => Boolean(value)))].sort(), [jobs]);
  const companies = useMemo(() => [...new Set(jobs.map((job) => job.company_name || job.employer_board_name).filter((value): value is string => Boolean(value)))].sort(), [jobs]);
  const visibleJobs = useMemo(() => jobs.filter((job) => matchesFilters(job, factsByJob.get(job.id)!, filters, savedJobIds.has(job.id))), [factsByJob, filters, jobs, savedJobIds]);

  const updateDraft = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
  };

  return (
    <section className="space-y-5" aria-label="Verified job search">
      <form
        className="rounded-[1.5rem] border border-slate-200 bg-[#f7f9ff] p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950">
            <FilterSelect label="Search scope" value={draft.searchScope} onChange={(value) => updateDraft('searchScope', value as JobFilters['searchScope'])}>
              <option value="title_description">Title + description</option>
              <option value="title">Title only</option>
              <option value="company">Company</option>
            </FilterSelect>
            <span className="h-7 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
            <Search className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search verified jobs</span>
              <input
                value={draft.query}
                onChange={(event) => updateDraft('query', event.target.value)}
                placeholder="Search title or keyword"
                className="h-11 w-full min-w-0 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </label>
          </div>

          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
            <span className="font-semibold text-slate-500">Exclude</span>
            <input
              value={draft.exclude}
              onChange={(event) => updateDraft('exclude', event.target.value)}
              placeholder="Hide jobs mentioning a keyword"
              className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-slate-700 dark:text-slate-200"><SlidersHorizontal className="size-4" aria-hidden="true" /> Filters</span>
            <FilterSelect label="Date" value={draft.date} onChange={(value) => updateDraft('date', value as JobFilters['date'])}>
              <option value="any">Date</option><option value="1">Past 24 hours</option><option value="3">Past 3 days</option><option value="7">Past week</option><option value="30">Past month</option>
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
            <FilterSelect label="Degree level" value={draft.degree} onChange={(value) => updateDraft('degree', value as JobFilters['degree'])}>
              <option value="all">Degree level</option><option value="bachelor">Bachelor's</option><option value="master">Master's</option><option value="doctorate">Doctorate</option><option value="unspecified">Not specified</option>
            </FilterSelect>
            <FilterSelect label="Maximum experience" value={draft.experience} onChange={(value) => updateDraft('experience', value as JobFilters['experience'])}>
              <option value="all">Max experience</option><option value="entry">0–2 years</option><option value="mid">3–5 years</option><option value="senior">6+ years</option><option value="unspecified">Not specified</option>
            </FilterSelect>
            <FilterSelect label="Employer evidence" value={draft.evidence} onChange={(value) => updateDraft('evidence', value as JobFilters['evidence'])}>
              <option value="all">Employer evidence</option><option value="source_backed">Source-backed history</option>
            </FilterSelect>
            <FilterSelect label="Role" value={draft.role} onChange={(value) => updateDraft('role', value as JobFilters['role'])}>
              <option value="all">Role</option><option value="engineering">Engineering</option><option value="data">Data & analytics</option><option value="product">Product</option><option value="design">Design</option><option value="operations">Operations</option><option value="sales">Sales</option><option value="other">Other</option>
            </FilterSelect>
            <FilterSelect label="Job type" value={draft.jobType} onChange={(value) => updateDraft('jobType', value as JobFilters['jobType'])}>
              <option value="all">Job type</option><option value="internship">Internship</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="permanent">Permanent / unspecified</option>
            </FilterSelect>
            <FilterSelect label="Employment type" value={draft.employmentType} onChange={(value) => updateDraft('employmentType', value as JobFilters['employmentType'])}>
              <option value="all">Employment type</option><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="unspecified">Not specified</option>
            </FilterSelect>
            <FilterSelect label="Tracker status" value={draft.tracker} onChange={(value) => updateDraft('tracker', value as JobFilters['tracker'])}>
              <option value="all">Tracker status</option><option value="saved">Saved</option><option value="not_saved">Not saved</option><option value="applied">Manually applied</option>
            </FilterSelect>
            <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"><RotateCcw className="size-4" aria-hidden="true" /> Clear</button>
            <button type="submit" className="ml-auto inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Apply filters</button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200" aria-live="polite">{visibleJobs.length} {visibleJobs.length === 1 ? 'verified job' : 'verified jobs'} found</p>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200"><Bookmark className="size-4" aria-hidden="true" /> Saved {savedJobIds.size}</span>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-950 dark:text-white">No verified jobs match these filters</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Try removing a filter or searching with a broader term. Only authorized employer-board listings appear here.</p>
          <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {visibleJobs.map((job) => {
            const sponsorEvidenced = isSourceBacked(job);
            const facts = factsByJob.get(job.id)!;
            const saved = savedJobIds.has(job.id);
            return (
              <article key={job.id} className={`group flex h-full flex-col overflow-hidden rounded-[1.5rem] border shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)] motion-reduce:transform-none dark:shadow-none ${sourceCardTone(job.source_ats)}`}>
                <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center rounded-full border border-slate-950/10 bg-white/50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.11em] text-slate-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200">{job.source_ats} verified</span>
                    <span className="shrink-0 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Confirmed {formatDate(job.last_confirmed_at)}</span>
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
                    {job.tracker_status && <span className="mt-2 inline-flex rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-950">In tracker: {job.tracker_status}</span>}
                  </div>
                  <JobUrgencyLabels recentlyPosted={isRecentlyPosted(job.first_seen_at, new Date())} sponsorEvidenced={sponsorEvidenced} runway={runway} />
                  <EmployerEvidencePanel employerBoardName={job.employer_board_name} match={job.employer_match} signals={job.visa_signals || []} />
                </div>
                <JobCardActions
                  jobId={job.id}
                  companyName={job.company_name || job.employer_board_name || 'Employer'}
                  title={job.title}
                  jobUrl={job.job_url}
                  sponsorId={job.employer_match?.canonical_h1b_sponsor_id || null}
                  initialSaved={saved}
                  onSaved={() => setSavedJobIds((current) => new Set(current).add(job.id))}
                />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
