import { readJobLocation } from './us-location';
import type {
  AtsScraperFetchResult,
  AuthorizedAtsSourceInput,
  ScrapedAtsJob,
} from './ats-scrapers.runner';

/**
 * Native reader for Workday career sites, through the public JSON API their
 * own pages use:
 *   POST https://{tenant}.{shard}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs
 *   GET  https://{tenant}.{shard}.myworkdayjobs.com/wday/cxs/{tenant}/{site}{externalPath}
 *
 * The list returns 20 postings per page without descriptions, and reports at
 * most 2,000 results per query. So the reader:
 * - asks only for US postings when the site has a country filter;
 * - splits a query that reaches 2,000 by another filter (job category, ...);
 * - fetches the detail page (description, every location, posting date) only
 *   for postings it has not stored yet, plus a small rotating share of stored
 *   ones so edits are picked up within about a week. Stored postings reuse
 *   their saved details, so a normal run costs a few list pages per site;
 * - fetches at most `maxNewDetails` new postings per run, so a large first
 *   load spreads over a few runs instead of exceeding the time limit.
 */

export const WORKDAY_PAGE_LIMIT = 20;
export const WORKDAY_RESULT_CAP = 2000;
const MAX_SPLIT_DEPTH = 3;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_MAX_NEW_DETAILS = 400;
const DEFAULT_DEADLINE_MS = 10 * 60_000;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;
const USER_AGENT =
  'Mozilla/5.0 (compatible; TrackMyOPT/1.0; +https://www.trackmyopt.com)';

export type WorkdayBoard = { origin: string; tenant: string; site: string };

/** `https://{tenant}.{shard}.myworkdayjobs.com/{site}` (locale prefix allowed). */
export function parseWorkdayBoard(boardUrl: string): WorkdayBoard {
  const url = new URL(boardUrl);
  const host = /^([a-z0-9-]+)\.(wd\d+)\.myworkdayjobs\.com$/i.exec(
    url.hostname,
  );
  const parts = url.pathname.split('/').filter(Boolean);
  const site = /^[a-z]{2}-[A-Z]{2}$/.test(parts[0] || '') ? parts[1] : parts[0];
  if (!host || !site || !/^[A-Za-z0-9_-]+$/.test(site)) {
    throw new Error('Invalid Workday board URL');
  }
  return {
    origin: `https://${url.hostname.toLowerCase()}`,
    tenant: host[1].toLowerCase(),
    site,
  };
}

/** Saved details of a stored posting, reused instead of a detail request. */
export type WorkdayStoredJob = {
  location: string | null;
  description: string | null;
  postedAt: string | null;
  jobUrl: string | null;
  department: string | null;
};

export type WorkdayFetchOptions = {
  /** Stored postings by external job ID. */
  stored?: ReadonlyMap<string, WorkdayStoredJob>;
  /** True for stored postings whose details are re-read this run. */
  refresh?: (externalJobId: string) => boolean;
  maxNewDetails?: number;
  deadlineMs?: number;
  concurrency?: number;
  fetchImpl?: typeof fetch;
};

type Facet = {
  facetParameter?: string;
  descriptor?: string;
  id?: string;
  count?: number;
  values?: Facet[];
};
type Posting = {
  title?: string;
  externalPath?: string;
  locationsText?: string;
  postedOn?: string;
};
type ListResponse = {
  total?: number;
  jobPostings?: Posting[];
  facets?: Facet[];
};
type DetailResponse = {
  jobPostingInfo?: {
    title?: string;
    jobDescription?: string;
    location?: string;
    additionalLocations?: string[];
    startDate?: string;
    externalUrl?: string;
    country?: { descriptor?: string };
    jobRequisitionLocation?: { country?: { descriptor?: string } };
  };
};
type AppliedFacets = Record<string, string[]>;

const US_COUNTRY = /^(?:united states(?: of america)?|usa|us)$/i;

/** Facet groups with selectable values, including nested location groups. */
function selectableFacets(
  facets: Facet[] | undefined,
): { param: string; values: Facet[] }[] {
  const out: { param: string; values: Facet[] }[] = [];
  for (const facet of facets || []) {
    const values = facet.values || [];
    const selectable = values.filter(
      (value) => value.id && typeof value.count === 'number',
    );
    if (facet.facetParameter && selectable.length)
      out.push({ param: facet.facetParameter, values: selectable });
    out.push(
      ...selectableFacets(values.filter((value) => value.facetParameter)),
    );
  }
  return out;
}

/** The site's country filter value for the United States, if it has one. */
export function findUsCountryFilter(
  facets: Facet[] | undefined,
): AppliedFacets | null {
  for (const facet of selectableFacets(facets)) {
    const us = facet.values.find((value) =>
      US_COUNTRY.test((value.descriptor || '').trim()),
    );
    if (us?.id) return { [facet.param]: [us.id] };
  }
  return null;
}

/** "…_JR2024570-1" -> "JR2024570-1": the posting ID ending the external path. */
export function workdayJobId(externalPath: string): string {
  const last = externalPath.split('/').filter(Boolean).pop() || externalPath;
  return (/_([A-Za-z0-9-]+)$/.exec(last)?.[1] || last).slice(0, 255);
}

function isoDate(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const parsed = Date.parse(value.length === 10 ? `${value}T12:00:00Z` : value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

class Limiter {
  private active = 0;
  private readonly waiting: (() => void)[] = [];
  constructor(private readonly limit: number) {}
  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit)
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      this.waiting.shift()?.();
    }
  }
}

export async function fetchWorkdayJobs(
  source: AuthorizedAtsSourceInput,
  options: WorkdayFetchOptions = {},
): Promise<AtsScraperFetchResult> {
  const board = parseWorkdayBoard(source.base_url || source.board_token);
  const doFetch = options.fetchImpl ?? fetch;
  const deadline = Date.now() + (options.deadlineMs ?? DEFAULT_DEADLINE_MS);
  const limiter = new Limiter(options.concurrency ?? DEFAULT_CONCURRENCY);
  const api = `${board.origin}/wday/cxs/${board.tenant}/${board.site}`;
  let requestsMade = 0;

  const request = async <T>(url: string, body?: unknown): Promise<T | null> =>
    limiter.run(async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (Date.now() > deadline)
          throw new Error('Workday fetch exceeded its time limit');
        requestsMade++;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
          const response = await doFetch(url, {
            method: body ? 'POST' : 'GET',
            headers: {
              accept: 'application/json',
              'accept-language': 'en-US',
              'user-agent': USER_AGENT,
              ...(body ? { 'content-type': 'application/json' } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });
          if (response.status === 404) return null;
          if (response.status === 429 || response.status >= 500) {
            if (attempt === MAX_ATTEMPTS)
              throw new Error(`Workday HTTP ${response.status}`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1500 * 2 ** attempt),
            );
            continue;
          }
          if (!response.ok) throw new Error(`Workday HTTP ${response.status}`);
          return (await response.json()) as T;
        } catch (error) {
          if (
            attempt === MAX_ATTEMPTS ||
            (error instanceof Error && error.message.startsWith('Workday HTTP'))
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
    });

  const listPage = (applied: AppliedFacets, offset: number) =>
    request<ListResponse>(`${api}/jobs`, {
      appliedFacets: applied,
      limit: WORKDAY_PAGE_LIMIT,
      offset,
      searchText: '',
    });

  const postings = new Map<string, Posting>();
  const absorb = (page: ListResponse | null) => {
    for (const posting of page?.jobPostings || []) {
      if (posting.externalPath) postings.set(posting.externalPath, posting);
    }
  };

  /** Every posting matching `applied`, splitting queries that hit the cap. */
  const exhaust = async (
    applied: AppliedFacets,
    depth: number,
  ): Promise<void> => {
    const first = await listPage(applied, 0);
    if (!first) throw new Error('Workday site not found');
    absorb(first);
    const total = first.total ?? 0;
    if (total < WORKDAY_RESULT_CAP) {
      const offsets: number[] = [];
      for (
        let offset = WORKDAY_PAGE_LIMIT;
        offset < total;
        offset += WORKDAY_PAGE_LIMIT
      )
        offsets.push(offset);
      const pages = await Promise.all(
        offsets.map((offset) => listPage(applied, offset)),
      );
      pages.forEach(absorb);
      return;
    }
    if (depth >= MAX_SPLIT_DEPTH)
      throw new Error('Workday site exceeds the listing limits');
    const split = selectableFacets(first.facets).find(
      (facet) => !(facet.param in applied) && facet.values.length > 1,
    );
    if (!split) throw new Error('Workday site exceeds the listing limits');
    for (const value of split.values) {
      if (value.id && (value.count ?? 0) > 0)
        await exhaust({ ...applied, [split.param]: [value.id] }, depth + 1);
    }
  };

  const probe = await listPage({}, 0);
  if (!probe) throw new Error('Workday site not found');
  const usFilter = findUsCountryFilter(probe.facets);
  await exhaust(usFilter ?? {}, 0);

  const stored = options.stored ?? new Map<string, WorkdayStoredJob>();
  const maxNew = options.maxNewDetails ?? DEFAULT_MAX_NEW_DETAILS;
  const jobs: ScrapedAtsJob[] = [];
  const toDetail: { id: string; posting: Posting; known?: WorkdayStoredJob }[] =
    [];
  let newDetails = 0;
  for (const posting of postings.values()) {
    const id = workdayJobId(posting.externalPath!);
    const known = stored.get(id);
    if (known && !options.refresh?.(id)) {
      jobs.push({
        external_job_id: id,
        title: posting.title || '',
        company_name: source.employer_board_name || '',
        location: known.location,
        department: known.department,
        description: known.description,
        job_url: known.jobUrl,
        posted_at: known.postedAt,
      });
      continue;
    }
    // Without a country filter, skip postings whose listed location is
    // plainly outside the US rather than reading their details every run.
    if (
      !usFilter &&
      readJobLocation(posting.locationsText || null).scope === 'non_us'
    )
      continue;
    if (!known) {
      if (newDetails >= maxNew) continue; // read in a later run
      newDetails++;
    }
    toDetail.push({ id, posting, known });
  }

  const detailed = await Promise.all(
    toDetail.map(async ({ id, posting, known }) => {
      if (Date.now() > deadline - 30_000)
        return known ? { id, posting, known, info: null } : null;
      const detail = await request<DetailResponse>(
        `${api}${posting.externalPath}`,
      ).catch(() => null);
      return { id, posting, known, info: detail?.jobPostingInfo ?? null };
    }),
  );
  for (const item of detailed) {
    if (!item) continue;
    const { id, posting, known, info } = item;
    if (!info) {
      // Keep a stored posting whose refresh failed; skip an unread new one.
      if (known)
        jobs.push({
          external_job_id: id,
          title: posting.title || '',
          company_name: source.employer_board_name || '',
          location: known.location,
          department: known.department,
          description: known.description,
          job_url: known.jobUrl,
          posted_at: known.postedAt,
        });
      continue;
    }
    const locations = [info.location, ...(info.additionalLocations || [])]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));
    const countries = [
      info.country?.descriptor,
      info.jobRequisitionLocation?.country?.descriptor,
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));
    jobs.push({
      external_job_id: id,
      title: info.title || posting.title || '',
      company_name: source.employer_board_name || '',
      location:
        [...new Set(locations)].join(' | ').slice(0, 1000) ||
        posting.locationsText ||
        null,
      department: known?.department ?? null,
      description: info.jobDescription || null,
      job_url:
        info.externalUrl ||
        `${board.origin}/${board.site}${posting.externalPath}`,
      posted_at: isoDate(info.startDate) ?? known?.postedAt ?? null,
      location_countries: [...new Set(countries)],
    });
  }

  return {
    jobs: jobs.filter((job) => job.title),
    metadata: {
      adapter: 'workday',
      complete: true,
      requests_made: requestsMade,
    },
  };
}
