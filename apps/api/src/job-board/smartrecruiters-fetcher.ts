import { smartRecruitersJobFacts } from './ats-job-facts';
import type {
  AtsScraperFetchResult,
  AuthorizedAtsSourceInput,
  ScrapedAtsJob,
} from './ats-scrapers.runner';
import type { WorkdayFetchOptions, WorkdayStoredJob } from './workday-fetcher';

/**
 * Native reader for SmartRecruiters' public posting API:
 *   GET https://api.smartrecruiters.com/v1/companies/{company}/postings?country=us
 *   GET https://api.smartrecruiters.com/v1/companies/{company}/postings/{id}
 *
 * The list (100 per page) already carries title, location, posting date,
 * employment type and remote/hybrid flags, so only the description needs the
 * detail request. Like Workday, the detail is read only for postings not
 * stored yet (plus a rotating share of stored ones), at most `maxNewDetails`
 * new ones per run. Company identifiers are case-insensitive; an unknown
 * company returns an empty list rather than 404.
 */

const API = 'https://api.smartrecruiters.com/v1/companies';
const PAGE_LIMIT = 100;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_MAX_NEW_DETAILS = 400;
const DEFAULT_DEADLINE_MS = 10 * 60_000;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

export type SmartRecruitersFetchOptions = WorkdayFetchOptions;

type Labeled = { id?: string; label?: string };
type Posting = {
  id?: string;
  name?: string;
  releasedDate?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
    hybrid?: boolean;
  };
  department?: Labeled;
  function?: Labeled;
  typeOfEmployment?: Labeled;
};
type ListResponse = { totalFound?: number; content?: Posting[] };
type Section = { title?: string; text?: string };
type DetailResponse = {
  postingUrl?: string;
  applyUrl?: string;
  jobAd?: { sections?: Record<string, Section | undefined> };
};

/** Section order of the posting page. */
const SECTIONS = [
  'companyDescription',
  'jobDescription',
  'qualifications',
  'additionalInformation',
];

export function smartRecruitersDescription(
  detail: DetailResponse,
): string | null {
  const sections = detail.jobAd?.sections ?? {};
  const parts = SECTIONS.map((key) => sections[key])
    .filter((section): section is Section => Boolean(section?.text?.trim()))
    .map(
      (section) =>
        `${section.title ? `<h3>${section.title}</h3>` : ''}${section.text}`,
    );
  return parts.length ? parts.join('\n') : null;
}

/** "Sunnyvale, CA", "Remote, US" or the country alone. */
export function smartRecruitersLocation(
  location: Posting['location'],
): string | null {
  if (!location) return null;
  const country = (location.country || '').toUpperCase();
  const place = [location.city, location.region]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
  if (place) return place;
  if (location.remote) return country ? `Remote, ${country}` : 'Remote';
  return country || null;
}

export async function fetchSmartRecruitersJobs(
  source: AuthorizedAtsSourceInput,
  options: SmartRecruitersFetchOptions = {},
): Promise<AtsScraperFetchResult> {
  const company = source.board_token.trim();
  if (!/^[A-Za-z0-9_-]+$/.test(company))
    throw new Error('Invalid SmartRecruiters company');
  const doFetch = options.fetchImpl ?? fetch;
  const deadline = Date.now() + (options.deadlineMs ?? DEFAULT_DEADLINE_MS);
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const base = `${API}/${encodeURIComponent(company)}/postings`;
  let requestsMade = 0;

  const request = async <T>(url: string): Promise<T | null> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (Date.now() > deadline)
        throw new Error('SmartRecruiters fetch exceeded its time limit');
      requestsMade++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await doFetch(url, {
          headers: {
            accept: 'application/json',
            'user-agent': 'TrackMyOPT/1.0',
          },
          signal: controller.signal,
        });
        if (response.status === 404) return null;
        if (response.status === 429 || response.status >= 500) {
          if (attempt === MAX_ATTEMPTS)
            throw new Error(`SmartRecruiters HTTP ${response.status}`);
          await new Promise((resolve) =>
            setTimeout(resolve, 1500 * 2 ** attempt),
          );
          continue;
        }
        if (!response.ok)
          throw new Error(`SmartRecruiters HTTP ${response.status}`);
        return (await response.json()) as T;
      } catch (error) {
        if (
          attempt === MAX_ATTEMPTS ||
          (error instanceof Error &&
            error.message.startsWith('SmartRecruiters HTTP'))
        )
          throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, 1500 * 2 ** attempt),
        );
      } finally {
        clearTimeout(timer);
      }
    }
    return null;
  };

  // US postings only; pages are fetched in order (the API is offset-based).
  const postings: Posting[] = [];
  for (let offset = 0; ; offset += PAGE_LIMIT) {
    const page = await request<ListResponse>(
      `${base}?country=us&limit=${PAGE_LIMIT}&offset=${offset}`,
    );
    if (!page) throw new Error('SmartRecruiters company not found');
    postings.push(...(page.content || []));
    if (!page.content?.length || offset + PAGE_LIMIT >= (page.totalFound ?? 0))
      break;
  }

  const stored = options.stored ?? new Map<string, WorkdayStoredJob>();
  const maxNew = options.maxNewDetails ?? DEFAULT_MAX_NEW_DETAILS;
  const jobs: ScrapedAtsJob[] = [];
  const toDetail: { posting: Posting; base: ScrapedAtsJob; known: boolean }[] =
    [];
  let newDetails = 0;
  for (const posting of postings) {
    if (!posting.id || !posting.name) continue;
    const facts = smartRecruitersJobFacts(posting);
    const listed: ScrapedAtsJob = {
      external_job_id: posting.id,
      title: posting.name.slice(0, 1000),
      company_name: source.employer_board_name || '',
      location: smartRecruitersLocation(posting.location),
      department: posting.department?.label || posting.function?.label || null,
      description: null,
      job_url: null,
      posted_at: posting.releasedDate || null,
      workplace_type: facts.workplace,
      employment_types: facts.employmentTypes,
      location_countries:
        posting.location?.country?.toLowerCase() === 'us'
          ? ['United States']
          : [],
    };
    const known = stored.get(posting.id);
    if (known && !options.refresh?.(posting.id)) {
      jobs.push({
        ...listed,
        description: known.description,
        job_url: known.jobUrl,
      });
      continue;
    }
    if (!known) {
      if (newDetails >= maxNew) continue; // read in a later run
      newDetails++;
    }
    toDetail.push({ posting, base: listed, known: Boolean(known) });
  }

  // Read details with bounded concurrency.
  let next = 0;
  const results: (ScrapedAtsJob | null)[] = toDetail.map(() => null);
  const worker = async () => {
    for (let index = next++; index < toDetail.length; index = next++) {
      const { posting, base: listed } = toDetail[index];
      const known = stored.get(posting.id!);
      if (Date.now() > deadline - 30_000) {
        results[index] = known
          ? { ...listed, description: known.description, job_url: known.jobUrl }
          : null;
        continue;
      }
      const detail = await request<DetailResponse>(
        `${base}/${encodeURIComponent(posting.id!)}`,
      ).catch(() => null);
      if (!detail) {
        results[index] = known
          ? { ...listed, description: known.description, job_url: known.jobUrl }
          : null;
        continue;
      }
      results[index] = {
        ...listed,
        description: smartRecruitersDescription(detail),
        job_url:
          detail.postingUrl ||
          detail.applyUrl ||
          `https://jobs.smartrecruiters.com/${company}/${posting.id}`,
      };
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, toDetail.length) }, worker),
  );
  for (const job of results) if (job) jobs.push(job);

  return {
    jobs,
    metadata: {
      adapter: 'smartrecruiters',
      complete: true,
      requests_made: requestsMade,
    },
  };
}
