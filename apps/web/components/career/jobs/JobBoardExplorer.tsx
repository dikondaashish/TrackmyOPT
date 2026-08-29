'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Bookmark, ChevronDown, FileText, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { EmployerEvidencePanel } from '@/components/career/jobs/EmployerEvidencePanel';
import { atsSourceName, AtsSourceLogo, JobCompanyLogo } from '@/components/career/jobs/JobBrandLogo';
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
  company_website: string | null;
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

function requirementLabel(facts: JobFacts) {
  const labels = [
    facts.workplace === 'on_site' ? 'On-site' : facts.workplace === 'unspecified' ? null : facts.workplace[0].toUpperCase() + facts.workplace.slice(1),
    facts.employmentType === 'full_time' ? 'Full-time' : facts.employmentType === 'part_time' ? 'Part-time' : null,
    facts.experience === 'entry' ? '0–2 years' : facts.experience === 'mid' ? '3–5 years' : facts.experience === 'senior' ? '6+ years' : null,
    facts.degree === 'bachelor' ? "Bachelor's" : facts.degree === 'master' ? "Master's" : facts.degree === 'doctorate' ? 'Doctorate' : null,
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
}: {
  job: ExplorerJob;
  facts: JobFacts;
  runway: RunwayContext | null;
  asOf: Date;
  saved: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSaved: () => void;
}) {
  const companyName = job.company_name || job.employer_board_name || 'Employer';
  const requirements = requirementLabel(facts);
  const sponsorEvidenced = isSourceBacked(job);

  return (
    <article className="relative rounded-[1.4rem] border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <JobCompanyLogo companyName={companyName} website={job.company_website} />
          <div className="min-w-0 flex-1">
            <button type="button" onClick={onToggle} aria-expanded={expanded} className="group flex min-h-11 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-950 group-hover:text-blue-800 dark:text-white dark:group-hover:text-blue-200">{job.title}</h2>
              <ChevronDown className={`size-5 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <p className="mt-1 text-base font-medium text-slate-600 dark:text-slate-300">{companyName} <span className="px-1 text-slate-300 dark:text-slate-600">·</span> {job.location || 'Location not provided'} <span className="px-1 text-slate-300 dark:text-slate-600">·</span> {formatDate(job.posted_at)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {requirements.map((label) => <span key={label} className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{label}</span>)}
              {sponsorEvidenced && <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">Source-backed employer history</span>}
              {job.tracker_status && <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">In tracker: {job.tracker_status}</span>}
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400"><AtsSourceLogo sourceAts={job.source_ats} /> {atsSourceName(job.source_ats)} verified source{job.department ? ` · ${job.department}` : ''}</p>
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
        <div className="rounded-b-[1.35rem] border-t border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/30 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div>
              <h3 className="inline-flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white"><FileText className="size-4 text-blue-700 dark:text-blue-300" aria-hidden="true" /> Job description</h3>
              <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                {readableDescription(job.description)}
              </div>
            </div>
            <aside className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Details</h3>
              <dl className="space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Source:</dt> <dd className="inline">{atsSourceName(job.source_ats)} verified employer board</dd></div>
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Posted:</dt> <dd className="inline">{formatDate(job.posted_at)}</dd></div>
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Confirmed:</dt> <dd className="inline">{formatDate(job.last_confirmed_at)}</dd></div>
                <div><dt className="inline font-semibold text-slate-800 dark:text-slate-100">Role:</dt> <dd className="inline">{facts.role.replace('_', ' ')}</dd></div>
              </dl>
              <JobUrgencyLabels recentlyPosted={isRecentlyPosted(job.first_seen_at, asOf)} sponsorEvidenced={sponsorEvidenced} runway={runway} />
            </aside>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800"><EmployerEvidencePanel employerBoardName={job.employer_board_name} match={job.employer_match} signals={job.visa_signals || []} /></div>
          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Saving adds this listing to your tracker. “Apply on ATS” opens the original employer posting and never submits an application for you.</p>
        </div>
      )}
    </article>
  );
}

export function JobBoardExplorer({ jobs, runway, asOf }: { jobs: ExplorerJob[]; runway: RunwayContext | null; asOf: string }) {
  const [draft, setDraft] = useState<JobFilters>(emptyFilters);
  const [filters, setFilters] = useState<JobFilters>(emptyFilters);
  const [savedJobIds, setSavedJobIds] = useState(() => initialSavedJobIds(jobs));
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const asOfDate = useMemo(() => new Date(asOf), [asOf]);

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
        <div className="space-y-4">
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
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
