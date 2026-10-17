import { experienceBucket, inferTextJobFacts, type JobDegreeLevel, type JobTypeKind } from './job-facts';
import { matchesPlaceKeys, readJobLocation } from './us-location';

export type VisaSignalSummary = {
  signal_type: string;
};

export type FilterableJob = {
  title: string;
  company_name: string;
  employer_board_name: string | null;
  location: string | null;
  department: string | null;
  description: string | null;
  posted_at: string | null;
  tracker_status: string | null;
  employer_match: {
    canonical_h1b_sponsor_id: string | null;
    review_status: string;
  } | null;
  visa_signals: VisaSignalSummary[];
};

type TrackerMatchJob = Pick<FilterableJob, 'company_name' | 'employer_board_name' | 'title'> & {
  job_url: string | null;
};

export type TrackerEntrySummary = {
  job_url: string | null;
  company_name: string | null;
  role_title: string | null;
  status: string | null;
  is_archived: boolean | null;
};

export type DegreeLevel = JobDegreeLevel;
export type RoleFamily = 'engineering' | 'data' | 'product' | 'design' | 'operations' | 'sales' | 'other';
export type JobDateWindow = 'any' | '1h' | '6h' | '12h' | '24h' | '48h' | '7d' | '30d';

export type JobFacts = {
  workplace: 'remote' | 'hybrid' | 'on_site' | 'unspecified';
  degreeLevels: DegreeLevel[];
  minimumExperienceYears: number | null;
  experience: 'entry' | 'mid' | 'senior' | 'unspecified';
  roles: RoleFamily[];
  jobType: 'internship' | 'contract' | 'temporary' | 'permanent' | 'unspecified';
  employmentType: 'full_time' | 'part_time' | 'unspecified';
};

export type JobFilters = {
  searchScope: 'title_description' | 'title' | 'company';
  query: string;
  exclude: string;
  date: JobDateWindow;
  /** US place keys (`state:CA`, `city:Boston, MA`, `remote:us`); any matches. */
  places: string[];
  workplace: 'all' | JobFacts['workplace'];
  company: string;
  degree: 'all' | DegreeLevel | 'unspecified';
  experience: 'all' | JobFacts['experience'];
  evidence: 'all' | 'source_backed';
  role: 'all' | RoleFamily;
  jobType: 'all' | JobFacts['jobType'];
  employmentType: 'all' | JobFacts['employmentType'];
  tracker: 'all' | 'saved' | 'not_saved' | 'applied';
};

export const EMPTY_JOB_FILTERS: JobFilters = {
  searchScope: 'title_description',
  query: '',
  exclude: '',
  date: 'any',
  places: [],
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

export function normalizeJobText(value: string | null | undefined) {
  return value
    ?.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, ' and ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase() || '';
}

function normalizeJobUrl(value: string | null | undefined) {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return value.trim().replace(/\/$/, '');
  }
}

export function findActiveTrackerStatus(job: TrackerMatchJob, entries: TrackerEntrySummary[]) {
  const jobUrl = normalizeJobUrl(job.job_url);
  const company = normalizeJobText(job.company_name || job.employer_board_name);
  const title = normalizeJobText(job.title);
  return entries.find((entry) => {
    if (entry.is_archived) return false;
    if (jobUrl) return normalizeJobUrl(entry.job_url) === jobUrl;
    return normalizeJobText(entry.company_name) === company && normalizeJobText(entry.role_title) === title;
  })?.status || null;
}

function inferRoles(title: string): RoleFamily[] {
  const roles: RoleFamily[] = [];
  if (/\b(data|analyst|analytics|scientist|machine learning|ml|artificial intelligence|ai)\b/.test(title)) roles.push('data');
  if (/\b(engineer|engineering|developer|software|platform|security|devops|site reliability|sre|firmware)\b/.test(title)) roles.push('engineering');
  if (/\b(product|product manager|product owner)\b/.test(title)) roles.push('product');
  if (/\b(design|designer|ux|ui|user experience|user interface)\b/.test(title)) roles.push('design');
  if (/\b(operations|strategy|customer success|support|deployment|program manager|project manager)\b/.test(title)) roles.push('operations');
  if (/\b(sales|account executive|business development|revenue|solutions consultant)\b/.test(title)) roles.push('sales');
  return roles.length ? roles : ['other'];
}

/** Whole-word title terms, matching the API's job-board filters. */
const TITLE_JOB_TYPES: [JobTypeKind, RegExp][] = [
  ['internship', /\b(intern|interns|internship|internships)\b/],
  ['contract', /\b(contract|contractor|freelance)\b/],
  ['temporary', /\b(temporary|temp|fixed[ -]term)\b/],
  ['permanent', /\bpermanent\b/],
];

function statedWorkplace(value: string): JobFacts['workplace'] | null {
  if (/\bhybrid\b/.test(value)) return 'hybrid';
  if (/\bremote\b/.test(value)) return 'remote';
  if (/\b(on[ -]?site|in[ -]?office)\b/.test(value)) return 'on_site';
  return null;
}

/**
 * Facts shown on a job card and used by resume matching. Description evidence
 * comes from the module the API uses for its stored filter flags, so a card
 * and the server-side filters read a posting the same way. A stated location
 * wins over the title, which wins over the description; within each,
 * hybrid > remote > on-site.
 */
export function inferJobFacts(job: FilterableJob): JobFacts {
  const title = normalizeJobText(job.title);
  const location = normalizeJobText(job.location);
  const text = inferTextJobFacts(job.description);

  const descriptionWorkplace = text.workplaces.includes('hybrid')
    ? 'hybrid'
    : text.workplaces.includes('remote')
      ? 'remote'
      : text.workplaces.includes('on_site')
        ? 'on_site'
        : 'unspecified';
  const workplace = statedWorkplace(location)
    ?? statedWorkplace(title)
    ?? descriptionWorkplace;

  const jobTypes = new Set<JobTypeKind>(text.jobTypes);
  for (const [type, pattern] of TITLE_JOB_TYPES) if (pattern.test(title)) jobTypes.add(type);
  const jobType = TITLE_JOB_TYPES.map(([type]) => type).find((type) => jobTypes.has(type)) || 'unspecified';

  const partTime = /\bpart[ -]?time\b/.test(title) || text.employmentTypes.includes('part_time');
  const fullTime = /\b(full[ -]?time|fte)\b/.test(title) || text.employmentTypes.includes('full_time');
  const minimumExperienceYears = text.minimumExperienceYears;

  return {
    workplace,
    degreeLevels: text.degreeLevels,
    minimumExperienceYears,
    experience: experienceBucket(minimumExperienceYears) || 'unspecified',
    roles: inferRoles(title),
    jobType,
    employmentType: partTime ? 'part_time' : fullTime ? 'full_time' : 'unspecified',
  };
}

function hasConfirmedEmployerIdentity(job: FilterableJob) {
  return Boolean(
    job.employer_match?.canonical_h1b_sponsor_id
    && ['auto', 'confirmed'].includes(job.employer_match.review_status),
  );
}

export function hasSourceBackedEmployerHistory(job: FilterableJob) {
  return hasConfirmedEmployerIdentity(job) && job.visa_signals.some((signal) => (
    ['historical_h1b_sponsor', 'historical_h1b_filing'].includes(signal.signal_type)
  ));
}

export function hasPositiveSponsorshipEvidence(job: FilterableJob) {
  return job.visa_signals.some((signal) => signal.signal_type === 'future_sponsorship_stated')
    || hasSourceBackedEmployerHistory(job);
}

const JOB_DATE_WINDOW_HOURS: Record<Exclude<JobDateWindow, 'any'>, number> = {
  '1h': 1,
  '6h': 6,
  '12h': 12,
  '24h': 24,
  '48h': 48,
  '7d': 7 * 24,
  '30d': 30 * 24,
};

export function isWithinDateRange(date: string | null, window: JobDateWindow, asOf: Date) {
  if (window === 'any') return true;
  if (!date || Number.isNaN(asOf.getTime())) return false;
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return false;
  const reference = asOf.getTime();
  return timestamp <= reference
    && timestamp >= reference - JOB_DATE_WINDOW_HOURS[window] * 60 * 60 * 1000;
}

function matchesExperience(facts: JobFacts, filter: JobFilters['experience']) {
  if (filter === 'all') return true;
  if (filter === 'unspecified') return facts.minimumExperienceYears === null;
  if (facts.minimumExperienceYears === null) return false;
  if (filter === 'entry') return facts.minimumExperienceYears <= 2;
  if (filter === 'mid') return facts.minimumExperienceYears <= 5;
  return true;
}

function isManuallyApplied(status: string | null) {
  return Boolean(status && normalizeJobText(status) !== 'wishlist');
}

export function matchesJobFilters(job: FilterableJob, facts: JobFacts, filters: JobFilters, saved: boolean, asOf: Date) {
  const query = normalizeJobText(filters.query);
  const excluded = normalizeJobText(filters.exclude);
  const company = job.company_name || job.employer_board_name || '';
  const searchable = filters.searchScope === 'title'
    ? normalizeJobText(job.title)
    : filters.searchScope === 'company'
      ? normalizeJobText(company)
      : `${normalizeJobText(job.title)} ${normalizeJobText(job.description)}`;
  const allJobContent = [job.title, company, job.description, job.location, job.department].map(normalizeJobText).join(' ');
  const place = readJobLocation(job.location);
  const degreeMatches = filters.degree === 'all'
    || (filters.degree === 'unspecified' ? facts.degreeLevels.length === 0 : facts.degreeLevels.includes(filters.degree));

  return (!query || searchable.includes(query))
    && (!excluded || !allJobContent.includes(excluded))
    && isWithinDateRange(job.posted_at, filters.date, asOf)
    // The board is for US jobs; saved and applied jobs stay visible wherever they are.
    && (filters.tracker === 'saved' || filters.tracker === 'applied' || place.scope !== 'non_us')
    && matchesPlaceKeys(place, filters.places)
    && (filters.company === 'all' || normalizeJobText(company) === normalizeJobText(filters.company))
    && (filters.workplace === 'all' || facts.workplace === filters.workplace)
    && degreeMatches
    && matchesExperience(facts, filters.experience)
    && (filters.evidence === 'all' || hasSourceBackedEmployerHistory(job))
    && (filters.role === 'all' || facts.roles.includes(filters.role))
    && (filters.jobType === 'all' || facts.jobType === filters.jobType)
    && (filters.employmentType === 'all' || facts.employmentType === filters.employmentType)
    && (filters.tracker === 'all'
      || (filters.tracker === 'saved' && saved)
      || (filters.tracker === 'not_saved' && !saved)
      || (filters.tracker === 'applied' && isManuallyApplied(job.tracker_status)));
}
