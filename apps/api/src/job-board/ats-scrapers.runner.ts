import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';
import {
  ashbyJobFacts,
  greenhouseJobFacts,
  leverJobFacts,
} from './ats-job-facts';
import { ashbyLocations } from './us-job-eligibility';
import { fetchWorkdayJobs, type WorkdayFetchOptions } from './workday-fetcher';

export interface ScrapedAtsJob {
  external_job_id: string;
  title: string;
  company_name: string;
  location: string | null;
  department: string | null;
  description: string | null;
  job_url: string | null;
  posted_at: string | null;
  /** Structured workplace from the ATS ("remote" | "hybrid" | "on_site"). */
  workplace_type?: string | null;
  /** Structured employment types from the ATS (see AtsEmploymentType). */
  employment_types?: string[];
  /** Countries the ATS states for the job's locations (Ashby addresses). */
  location_countries?: string[];
}

export interface AuthorizedAtsSourceInput {
  ats_type: string;
  board_token: string;
  base_url: string;
  employer_board_name?: string | null;
}

export interface AtsScraperFetchMetadata {
  adapter: string;
  complete: boolean;
  requests_made: number;
}

export interface AtsScraperFetchResult {
  jobs: ScrapedAtsJob[];
  metadata: AtsScraperFetchMetadata;
}

export interface AtsScraperRunnerOptions {
  scriptPath?: string;
  /** Stored postings and limits for the native Workday reader. */
  workday?: WorkdayFetchOptions;
  pythonCommand?: string;
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export class AtsScraperRunnerError extends Error {
  constructor(
    message: string,
    readonly requestsMade: number,
  ) {
    super(message);
    this.name = 'AtsScraperRunnerError';
  }
}

const DEFAULT_TIMEOUT_MS = 2 * 60_000;
const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024 * 1024;

type NativeAtsPayload = Record<string, unknown>;

function stringValue(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function nestedName(value: unknown): string | null {
  if (typeof value === 'string') return stringValue(value);
  if (value && typeof value === 'object') {
    return stringValue((value as { name?: unknown }).name);
  }
  return null;
}

function joinNames(value: unknown): string | null {
  if (!Array.isArray(value)) return nestedName(value);
  const names = value.map(nestedName).filter((name): name is string => !!name);
  return names.length ? names.join(', ') : null;
}

/** ISO 3166 alpha-2 codes Lever uses, for the few countries we name. */
const LEVER_COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
};

/**
 * Lever splits a posting into the description, titled lists (requirements,
 * responsibilities, ...) and closing text; the stored description joins them
 * in the order the posting page shows.
 */
function leverDescription(item: Record<string, unknown>): string | null {
  const parts: string[] = [];
  const description = stringValue(item.description);
  if (description) parts.push(description);
  if (Array.isArray(item.lists)) {
    for (const list of item.lists) {
      if (!list || typeof list !== 'object') continue;
      const { text, content } = list as { text?: unknown; content?: unknown };
      const heading = stringValue(text);
      const body = stringValue(content);
      if (!body) continue;
      parts.push(`${heading ? `<h3>${heading}</h3>` : ''}<ul>${body}</ul>`);
    }
  }
  const additional = stringValue(item.additional);
  if (additional) parts.push(additional);
  return parts.length ? parts.join('\n') : null;
}

function leverLocation(item: Record<string, unknown>): string | null {
  const categories = (item.categories ?? {}) as {
    location?: unknown;
    allLocations?: unknown;
  };
  const all = Array.isArray(categories.allLocations)
    ? categories.allLocations.map(stringValue).filter((v): v is string => !!v)
    : [];
  const locations = all.length ? all : [stringValue(categories.location)];
  const joined = [...new Set(locations.filter((v): v is string => !!v))].join(
    ' | ',
  );
  return joined ? joined.slice(0, 1000) : null;
}

function normalizeNativeJobs(
  atsType: 'greenhouse' | 'ashby' | 'lever',
  payload: NativeAtsPayload,
  employerBoardName?: string | null,
): ScrapedAtsJob[] {
  const rawJobs = Array.isArray(payload) ? payload : payload.jobs;
  if (!Array.isArray(rawJobs)) {
    throw new Error(`Invalid ${atsType} response: jobs array missing`);
  }
  const ids = new Set<string>();
  const jobs: ScrapedAtsJob[] = [];
  for (const raw of rawJobs) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid normalized job schema');
    }
    const item = raw as Record<string, unknown>;
    const externalId = stringValue(item.id ?? item.jobId ?? item.externalJobId);
    // Lever names the title `text`.
    const title = stringValue(atsType === 'lever' ? item.text : item.title);
    if (!externalId || !title) throw new Error('Invalid normalized job schema');
    if (ids.has(externalId)) {
      throw new Error(`Duplicate external_job_id ${externalId}`);
    }
    ids.add(externalId);

    if (atsType === 'lever') {
      const facts = leverJobFacts(item);
      const categories = (item.categories ?? {}) as {
        team?: unknown;
        department?: unknown;
      };
      const country = stringValue(item.country)?.toUpperCase();
      const createdAt =
        typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)
          ? new Date(item.createdAt).toISOString()
          : null;
      jobs.push({
        external_job_id: externalId,
        title: title.slice(0, 1000),
        company_name: stringValue(employerBoardName) || '',
        location: leverLocation(item),
        department:
          stringValue(categories.department) || stringValue(categories.team),
        description: leverDescription(item),
        job_url: stringValue(item.hostedUrl ?? item.applyUrl),
        // Lever publishes no separate posting date; creation is the closest.
        posted_at: createdAt,
        workplace_type: facts.workplace,
        employment_types: facts.employmentTypes,
        location_countries: country
          ? [LEVER_COUNTRY_NAMES[country] ?? country]
          : [],
      });
    } else if (atsType === 'greenhouse') {
      const facts = greenhouseJobFacts(item.metadata);
      jobs.push({
        external_job_id: externalId,
        title,
        company_name:
          nestedName(item.company) || stringValue(item.company_name) || '',
        location: nestedName(item.location),
        department: joinNames(item.departments) || joinNames(item.department),
        description: stringValue(item.content),
        job_url: stringValue(item.absolute_url ?? item.url),
        posted_at: stringValue(item.first_published ?? item.updated_at),
        workplace_type: facts.workplace,
        employment_types: facts.employmentTypes,
      });
    } else {
      const facts = ashbyJobFacts(item);
      const places = ashbyLocations(item);
      jobs.push({
        external_job_id: externalId,
        title,
        company_name:
          stringValue(item.companyName) ||
          stringValue(item.company_name) ||
          stringValue(employerBoardName) ||
          '',
        location: places.location,
        location_countries: places.countries,
        department: stringValue(item.department) || stringValue(item.team),
        description:
          stringValue(item.descriptionHtml) ||
          stringValue(item.descriptionPlain) ||
          stringValue(item.description),
        job_url: stringValue(item.applyUrl ?? item.jobUrl ?? item.url),
        posted_at: stringValue(item.publishedAt ?? item.updatedAt),
        workplace_type: facts.workplace,
        employment_types: facts.employmentTypes,
      });
    }
  }
  return jobs;
}

async function fetchNativeAtsJobs(
  source: AuthorizedAtsSourceInput,
  timeoutMs: number,
  maxOutputBytes: number,
): Promise<AtsScraperFetchResult> {
  const encodedToken = encodeURIComponent(source.board_token);
  const url =
    source.ats_type === 'greenhouse'
      ? `https://boards-api.greenhouse.io/v1/boards/${encodedToken}/jobs?content=true`
      : source.ats_type === 'lever'
        ? `https://api.lever.co/v0/postings/${encodedToken}?mode=json`
        : `https://api.ashbyhq.com/posting-api/job-board/${encodedToken}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  let body: string;
  try {
    response = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'TrackMyOPT/1.0' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new AtsScraperRunnerError(
        `${source.ats_type} HTTP ${response.status}`,
        1,
      );
    }
    // Keep the deadline active through body consumption. A response can
    // resolve its headers promptly but hang while streaming a large body;
    // clearing the timer immediately after fetch would leave the Bull job
    // active indefinitely and defeat restart recovery.
    body = await response.text();
  } catch (error) {
    if (error instanceof AtsScraperRunnerError) throw error;
    const reason = error instanceof Error ? error.message : 'request failed';
    throw new AtsScraperRunnerError(
      `${source.ats_type} request failed: ${reason}`,
      1,
    );
  } finally {
    clearTimeout(timeout);
  }
  if (Buffer.byteLength(body) > maxOutputBytes) {
    throw new AtsScraperRunnerError(
      `${source.ats_type} response exceeded the ${maxOutputBytes}-byte output limit`,
      1,
    );
  }
  let payload: NativeAtsPayload;
  try {
    payload = JSON.parse(body) as NativeAtsPayload;
  } catch {
    throw new AtsScraperRunnerError(
      `Invalid ${source.ats_type} JSON response`,
      1,
    );
  }
  try {
    return {
      jobs: normalizeNativeJobs(
        source.ats_type as 'greenhouse' | 'ashby' | 'lever',
        payload,
        source.employer_board_name,
      ),
      metadata: {
        adapter: source.ats_type,
        complete: true,
        requests_made: 1,
      },
    };
  } catch (error) {
    throw new AtsScraperRunnerError(
      error instanceof Error ? error.message : 'Invalid normalized job schema',
      1,
    );
  }
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function fetchAuthorizedAtsJobs(
  source: AuthorizedAtsSourceInput,
  options: AtsScraperRunnerOptions = {},
): Promise<AtsScraperFetchResult> {
  const timeoutMs =
    options.timeoutMs ||
    positiveInteger(
      process.env.ATS_SCRAPERS_RUNNER_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
    );
  const maxOutputBytes =
    options.maxOutputBytes ||
    positiveInteger(
      process.env.ATS_SCRAPERS_MAX_OUTPUT_BYTES,
      DEFAULT_MAX_OUTPUT_BYTES,
    );
  if (
    !options.scriptPath &&
    (source.ats_type === 'greenhouse' ||
      source.ats_type === 'ashby' ||
      source.ats_type === 'lever')
  ) {
    return fetchNativeAtsJobs(source, timeoutMs, maxOutputBytes);
  }
  if (!options.scriptPath && source.ats_type === 'workday') {
    return fetchWorkdayJobs(source, options.workday).catch((error: unknown) => {
      throw new AtsScraperRunnerError(
        error instanceof Error ? error.message : 'Workday fetch failed',
        0,
      );
    });
  }
  return new Promise((resolve, reject) => {
    const scriptPath =
      options.scriptPath ||
      [
        path.resolve(process.cwd(), 'scripts/job-board/fetch_ats_jobs.py'),
        path.resolve(
          process.cwd(),
          '../../scripts/job-board/fetch_ats_jobs.py',
        ),
      ].find(existsSync);
    if (!scriptPath) {
      reject(new Error('ats-scrapers runner script was not found'));
      return;
    }

    const child = spawn(
      options.pythonCommand || process.env.ATS_SCRAPERS_PYTHON || 'python3',
      [scriptPath],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    let stdout = '';
    let stderr = '';
    let outputBytes = 0;
    let settled = false;

    const timeout = setTimeout(() => {
      fail(new Error(`ats-scrapers timed out after ${timeoutMs}ms`), true);
    }, timeoutMs);

    function fail(error: Error, kill = false) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (kill && child.exitCode === null) child.kill('SIGKILL');
      reject(error);
    }

    function appendOutput(target: 'stdout' | 'stderr', chunk: string) {
      outputBytes += Buffer.byteLength(chunk);
      if (outputBytes > maxOutputBytes) {
        fail(
          new Error(
            `ats-scrapers exceeded the ${maxOutputBytes}-byte output limit`,
          ),
          true,
        );
        return;
      }
      if (target === 'stdout') stdout += chunk;
      else stderr += chunk;
    }

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => appendOutput('stdout', chunk));
    child.stderr.on('data', (chunk: string) => appendOutput('stderr', chunk));
    child.once('error', (error) => fail(error));
    child.once('close', (code) => {
      if (settled) return;
      clearTimeout(timeout);
      if (code !== 0) {
        let adapterMessage = stderr.trim();
        let requestsMade = 0;
        try {
          const failure = JSON.parse(stdout) as {
            error?: unknown;
            metadata?: { requests_made?: unknown };
          };
          if (typeof failure.error === 'string' && failure.error.trim()) {
            adapterMessage = failure.error.trim();
          }
          const measured = failure.metadata?.requests_made;
          if (Number.isSafeInteger(measured) && Number(measured) >= 0) {
            requestsMade = Number(measured);
          }
        } catch {
          // Older/nonconforming adapters still surface stderr and count zero.
        }
        fail(
          new AtsScraperRunnerError(
            `ats-scrapers exited with code ${code}: ${adapterMessage}`,
            requestsMade,
          ),
        );
        return;
      }
      try {
        const response = JSON.parse(stdout) as AtsScraperFetchResult;
        if (!Array.isArray(response.jobs))
          throw new Error('Invalid scraper response');
        if (
          !response.metadata ||
          response.metadata.adapter !== source.ats_type ||
          response.metadata.complete !== true ||
          !Number.isSafeInteger(response.metadata.requests_made) ||
          response.metadata.requests_made < 1
        ) {
          throw new Error('Invalid scraper metadata');
        }
        const ids = new Set<string>();
        for (const job of response.jobs) {
          if (
            !job ||
            typeof job.external_job_id !== 'string' ||
            !job.external_job_id.trim() ||
            typeof job.title !== 'string' ||
            !job.title.trim() ||
            typeof job.company_name !== 'string'
          ) {
            throw new Error('Invalid normalized job schema');
          }
          if (ids.has(job.external_job_id)) {
            throw new Error(`Duplicate external_job_id ${job.external_job_id}`);
          }
          ids.add(job.external_job_id);
        }
        settled = true;
        resolve(response);
      } catch (error) {
        fail(
          error instanceof Error
            ? error
            : new Error('Invalid scraper response'),
        );
      }
    });
    child.stdin.once('error', (error) => fail(error));
    child.stdin.end(JSON.stringify(source));
  });
}
