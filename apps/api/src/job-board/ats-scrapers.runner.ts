import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

export interface ScrapedAtsJob {
  external_job_id: string;
  title: string;
  company_name: string;
  location: string | null;
  department: string | null;
  description: string | null;
  job_url: string | null;
  posted_at: string | null;
}

export interface AuthorizedAtsSourceInput {
  ats_type: string;
  board_token: string;
  base_url: string;
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

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function fetchAuthorizedAtsJobs(
  source: AuthorizedAtsSourceInput,
  options: AtsScraperRunnerOptions = {},
): Promise<AtsScraperFetchResult> {
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
