import { pathToFileURL } from 'node:url';

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(url, options, timeoutMs) {
  return fetch(url, {
    ...options,
    redirect: 'error',
    signal: AbortSignal.timeout(timeoutMs),
  });
}

export function schedulerRunId(now = new Date()) {
  return `job-board-hour-${now.toISOString().slice(0, 13)}`;
}

export async function triggerJobBoardIngestion({
  apiUrl,
  apiKey,
  allowHttp = false,
  healthAttempts = 3,
  retryDelayMs = 15_000,
  requestTimeoutMs = 120_000,
  now = new Date(),
  schedulerId = schedulerRunId(now),
  triggerOrigin = 'github_actions',
} = {}) {
  if (!apiUrl) throw new Error('Render API URL is required');
  if (!apiKey) throw new Error('API secret is required');

  const baseUrl = new URL(apiUrl);
  if (!allowHttp && baseUrl.protocol !== 'https:') {
    throw new Error('Render API URL must use HTTPS');
  }

  let healthy = false;
  for (let attempt = 1; attempt <= healthAttempts; attempt += 1) {
    try {
      const response = await request(
        baseUrl,
        { method: 'GET' },
        requestTimeoutMs
      );
      if (response.ok) {
        healthy = true;
        break;
      }
      console.warn(`API wake attempt ${attempt} returned ${response.status}`);
    } catch {
      console.warn(`API wake attempt ${attempt} failed`);
    }

    if (attempt < healthAttempts) await sleep(retryDelayMs);
  }

  if (!healthy) {
    throw new Error(
      `Render API was not ready after ${healthAttempts} attempts`
    );
  }

  const ingestionUrl = new URL('/job-board/ingest-enabled-sources', baseUrl);
  const response = await request(
    ingestionUrl,
    {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-scheduler-run-id': schedulerId,
        'x-trigger-origin': triggerOrigin,
      },
    },
    30_000
  );

  if (!response.ok) {
    throw new Error(`Ingestion endpoint returned ${response.status}`);
  }

  const result = await response.json();
  if (
    !['queued', 'suppressed'].includes(result?.status) ||
    result.jobId == null
  ) {
    throw new Error('Ingestion endpoint did not return a scheduler job ID');
  }

  return { status: result.status, jobId: String(result.jobId) };
}

/** The runner owns the whole bounded run, not just the enqueue HTTP request.
 * These authenticated progress reads also prevent idle spin-down while work is
 * in progress. There is no permanent keep-alive or automatic queue resume. */
export async function superviseIngestion({
  apiUrl, apiKey, schedulerId, pollMs = 45_000, deadlineMs = 120 * 60_000,
  requestTimeoutMs = 120_000, fetchImpl = fetch, wait = sleep, clock = Date.now,
  onProgress = () => {},
}) {
  if (!apiKey || !/^job-board-(manual-[A-Za-z0-9][A-Za-z0-9._:-]{0,127}|hour-\d{4}-\d{2}-\d{2}T\d{2})$/.test(schedulerId)) {
    throw new Error('Invalid supervision configuration');
  }
  const url = new URL(`/job-board/ingestion-runs/${encodeURIComponent(schedulerId)}`, apiUrl);
  if (url.protocol !== 'https:') throw new Error('Supervision requires HTTPS');
  const started = clock();
  let unavailable = 0;
  while (clock() - started < deadlineMs) {
    let response;
    try {
      response = await fetchImpl(url, {
        headers: { 'x-api-key': apiKey }, redirect: 'error',
        signal: AbortSignal.timeout(Math.max(1, Math.min(requestTimeoutMs, deadlineMs - (clock() - started)))),
      });
    } catch {
      if (++unavailable >= 3) throw new Error('Run supervision unavailable; inspect existing run, do not redispatch');
      await wait(pollMs);
      continue;
    }
    if (!response.ok) {
      if (![502, 503, 504].includes(response.status) || ++unavailable >= 3) {
        throw new Error(`Run supervision returned HTTP ${response.status}`);
      }
      await wait(pollMs);
      continue;
    }
    unavailable = 0;
    const result = await response.json();
    if (result.schedulerRunId !== schedulerId || !['running', 'completed', 'failed'].includes(result.status)) {
      throw new Error('Invalid run supervision response');
    }
    onProgress({ status: result.status, selected: result.selected, terminal: result.terminal,
      succeeded: result.succeeded, failed: result.failed, started: result.started,
      missing: result.missing, runnable: result.runnable });
    if (result.status === 'completed' && result.manifestAvailable && result.terminal === result.selected && result.failed === 0 && result.missing === 0 && result.started === 0 && result.runnable === 0) return result;
    if (result.status !== 'running') throw new Error('Ingestion incomplete or failed; inspect existing run, do not redispatch');
    if (result.queuesPaused?.normal || result.queuesPaused?.slow) throw new Error('Ingestion queue is paused; no automatic resume permitted');
    await wait(pollMs);
  }
  throw new Error('Ingestion supervision deadline exceeded; do not redispatch');
}

async function main() {
  const config = {
    apiUrl: process.env.RENDER_API_URL,
    apiKey: process.env.API_SECRET_KEY,
    schedulerId: process.env.SCHEDULER_RUN_ID || schedulerRunId(),
    triggerOrigin: process.env.TRIGGER_ORIGIN || 'github_actions',
  };
  if (process.env.MONITOR_ONLY !== 'true') {
    const result = await triggerJobBoardIngestion(config);
    console.log(`Job-board dispatch ${result.status}`);
  }
  await superviseIngestion({ ...config, onProgress: (progress) => console.log(JSON.stringify(progress)) });
  console.log('Job-board run has a terminal audit for every selected source');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(`Job-board scheduler failed: ${error.message}`);
    process.exitCode = 1;
  });
}
