/**
 * Enqueues one scheduled job-board ingestion run on the Render API. Mirrors
 * `triggerJobBoardIngestion` in scripts/operations/trigger-job-board-ingestion.mjs
 * (wake, then POST /job-board/ingest-enabled-sources) but never supervises
 * the run: the job-board-ingestion-health cron and the worker's Sentry bridge
 * cover that, and supervision would not fit a Vercel function.
 */

/** The Render service that consumes the job-board queues (same URL the
 * manual GitHub workflow wakes). Free Render services sleep when idle. */
export const DEFAULT_JOB_BOARD_WORKER_URL = 'https://trackmyopt-api.onrender.com';

export type DispatchFailureReason =
  | 'api-unreachable'
  | 'auth-rejected'
  | 'http-error'
  | 'invalid-response';

export class DispatchError extends Error {
  constructor(
    readonly reason: DispatchFailureReason,
    readonly status?: number
  ) {
    super(`Job-board dispatch failed: ${reason}${status ? ` (${status})` : ''}`);
    this.name = 'DispatchError';
  }
}

export type DispatchOptions = {
  apiUrl: string;
  apiKey: string;
  schedulerRunId: string;
  /** Extra services to wake before enqueueing (deduplicated with apiUrl). */
  wakeUrls?: string[];
  triggerOrigin?: string;
  fetchImpl?: typeof fetch;
  wait?: (ms: number) => Promise<void>;
  wakeAttempts?: number;
  wakeTimeoutMs?: number;
  wakeRetryDelayMs?: number;
  enqueueTimeoutMs?: number;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Render's health path is `/`; a cold start can take about a minute. */
async function wake(
  url: URL,
  fetchImpl: typeof fetch,
  wait: (ms: number) => Promise<void>,
  attempts: number,
  timeoutMs: number,
  retryDelayMs: number
) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        method: 'GET',
        redirect: 'error',
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return;
    } catch {
      // Cold start or network error: retry below.
    }
    if (attempt < attempts) await wait(retryDelayMs);
  }
  throw new DispatchError('api-unreachable');
}

export async function dispatchScheduledIngestion({
  apiUrl,
  apiKey,
  schedulerRunId,
  wakeUrls = [],
  triggerOrigin = 'vercel_cron',
  fetchImpl = fetch,
  wait = sleep,
  // 3 × 60 s + 2 × 10 s + 30 s enqueue stays inside a 300 s function.
  wakeAttempts = 3,
  wakeTimeoutMs = 60_000,
  wakeRetryDelayMs = 10_000,
  enqueueTimeoutMs = 30_000,
}: DispatchOptions): Promise<{ status: 'queued' | 'suppressed'; jobId: string }> {
  const baseUrl = new URL(apiUrl);
  const targets = [baseUrl, ...wakeUrls.map((url) => new URL(url))];
  if (targets.some((url) => url.protocol !== 'https:')) {
    throw new Error('Job-board API URLs must use HTTPS');
  }
  const unique = [...new Map(targets.map((url) => [url.origin, url])).values()];
  await Promise.all(
    unique.map((url) =>
      wake(url, fetchImpl, wait, wakeAttempts, wakeTimeoutMs, wakeRetryDelayMs)
    )
  );

  let response: Response;
  try {
    response = await fetchImpl(new URL('/job-board/ingest-enabled-sources', baseUrl), {
      method: 'POST',
      redirect: 'error',
      cache: 'no-store',
      headers: {
        'x-api-key': apiKey,
        'x-scheduler-run-id': schedulerRunId,
        'x-trigger-origin': triggerOrigin,
      },
      signal: AbortSignal.timeout(enqueueTimeoutMs),
    });
  } catch {
    throw new DispatchError('api-unreachable');
  }
  if (response.status === 401 || response.status === 403) {
    throw new DispatchError('auth-rejected', response.status);
  }
  if (!response.ok) throw new DispatchError('http-error', response.status);

  let result: { status?: unknown; jobId?: unknown } | null;
  try {
    result = await response.json();
  } catch {
    throw new DispatchError('invalid-response');
  }
  if (
    (result?.status !== 'queued' && result?.status !== 'suppressed') ||
    result.jobId == null
  ) {
    throw new DispatchError('invalid-response');
  }
  return { status: result.status, jobId: String(result.jobId) };
}
