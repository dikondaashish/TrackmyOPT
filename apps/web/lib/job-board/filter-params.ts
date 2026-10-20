import { EMPTY_JOB_FILTERS, type JobFilters } from './filters';
import { cleanSearchTerm, exactFilterValue } from './request-filters';
import { parsePlaceKeys } from './us-location';

// Job board filters as URL search params, shared by the page URL, the
// explorer's requests and /api/job-board/jobs, so a reload or shared link
// shows the same search. Defaults are left out to keep URLs short.

type ChoiceKey = Exclude<keyof JobFilters, 'query' | 'exclude' | 'company' | 'places'>;

const CHOICES: { [K in ChoiceKey]: readonly JobFilters[K][] } = {
  searchScope: ['title_description', 'title', 'company'],
  date: ['any', '1h', '6h', '12h', '24h', '48h', '7d', '30d'],
  workplace: ['all', 'remote', 'hybrid', 'on_site', 'unspecified'],
  degree: ['all', 'bachelor', 'master', 'doctorate', 'unspecified'],
  experience: ['all', 'entry', 'mid', 'senior', 'unspecified'],
  evidence: ['all', 'source_backed'],
  role: ['all', 'engineering', 'data', 'product', 'design', 'operations', 'sales', 'other'],
  jobType: ['all', 'internship', 'contract', 'temporary', 'permanent', 'unspecified'],
  employmentType: ['all', 'full_time', 'part_time', 'unspecified'],
  tracker: ['all', 'saved', 'not_saved', 'applied'],
};

const CHOICE_KEYS = Object.keys(CHOICES) as ChoiceKey[];
const FILTER_KEYS = [...CHOICE_KEYS, 'query', 'exclude', 'company', 'place'];

/** `resumeId` value that keeps resume ranking off after the user cleared it. */
export const NO_RESUME = 'none';

export type JobSearchState = {
  filters: JobFilters;
  page: number;
  /** A resume ID, `NO_RESUME`, or null when the URL does not say. */
  resumeId: string | null;
};

export function jobSearchParams({ filters, page, resumeId }: JobSearchState) {
  const params = new URLSearchParams({ page: String(page) });
  for (const key of CHOICE_KEYS) {
    if (filters[key] !== EMPTY_JOB_FILTERS[key]) params.set(key, filters[key]);
  }
  if (filters.query.trim()) params.set('query', filters.query);
  if (filters.exclude.trim()) params.set('exclude', filters.exclude);
  if (filters.company !== EMPTY_JOB_FILTERS.company) params.set('company', filters.company);
  for (const key of filters.places) params.append('place', key);
  if (resumeId) params.set('resumeId', resumeId);
  return params;
}

function choice<K extends ChoiceKey>(params: URLSearchParams, key: K): JobFilters[K] {
  const value = params.get(key) as JobFilters[K] | null;
  return value !== null && CHOICES[key].includes(value) ? value : EMPTY_JOB_FILTERS[key];
}

export function readJobSearchParams(params: URLSearchParams): JobSearchState {
  const filters = { ...EMPTY_JOB_FILTERS };
  for (const key of CHOICE_KEYS) (filters as Record<ChoiceKey, string>)[key] = choice(params, key);
  filters.query = cleanSearchTerm(params.get('query') || '');
  filters.exclude = cleanSearchTerm(params.get('exclude') || '');
  filters.company = exactFilterValue(params.get('company') || '') || EMPTY_JOB_FILTERS.company;
  filters.places = parsePlaceKeys(params.getAll('place'));
  const page = Number(params.get('page'));
  return {
    filters,
    page: Number.isInteger(page) && page > 0 ? Math.min(page, 10_000) : 1,
    resumeId: params.get('resumeId')?.slice(0, 64) || null,
  };
}

/** True when the URL names any filter, so it, not resume defaults, sets the search. */
export function hasJobFilterParams(params: URLSearchParams) {
  return FILTER_KEYS.some((key) => params.has(key));
}

/** Next.js page `searchParams` as URLSearchParams. */
export function toUrlSearchParams(record: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, item);
  }
  return params;
}
