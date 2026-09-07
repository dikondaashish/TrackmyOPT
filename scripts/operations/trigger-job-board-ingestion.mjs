import { pathToFileURL } from 'node:url';

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(url, options, timeoutMs) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function jsonRequest(url, options, timeoutMs) {
  const response = await request(url, options, timeoutMs);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const pathname = new URL(url).pathname;
    const detail =
      typeof body?.message === 'string' ? `: ${body.message}` : '';
    throw new Error(
      `Request returned ${response.status} for ${pathname}${detail}`,
    );
  }
  return body;
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
    } catch (error) {
      console.warn(`API wake attempt ${attempt} failed: ${error.message}`);
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

export async function superviseJobBoardIngestion({
  apiUrl,
  apiKey,
  schedulerId,
  allowHttp = false,
  pollIntervalMs = 15_000,
  maxDurationMs = 90 * 60 * 1000,
} = {}) {
  if (!apiUrl) throw new Error('Render API URL is required');
  if (!apiKey) throw new Error('API secret is required');
  if (!schedulerId) throw new Error('Scheduler run ID is required');

  const baseUrl = new URL(apiUrl);
  if (!allowHttp && baseUrl.protocol !== 'https:') {
    throw new Error('Render API URL must use HTTPS');
  }
  const headers = { 'x-api-key': apiKey };
  const startedAt = Date.now();
  let lastStatus;
  while (Date.now() - startedAt <= maxDurationMs) {
    // Keep a Free web service awake while its Bull worker drains persisted
    // jobs. Each request is bounded and the loop is restart-safe.
    await jsonRequest(baseUrl, { method: 'GET' }, 60_000);
    await jsonRequest(
      new URL('/job-board/ops/ingestion-queue/resume', baseUrl),
      { method: 'POST', headers },
      30_000,
    );
    const recovery = await jsonRequest(
      new URL(
        `/job-board/ops/ingestion-runs/${encodeURIComponent(schedulerId)}/recover`,
        baseUrl,
      ),
      { method: 'POST', headers },
      60_000,
    );
    const status = await jsonRequest(
      new URL(
        `/job-board/ops/ingestion-runs/${encodeURIComponent(schedulerId)}`,
        baseUrl,
      ),
      { method: 'GET', headers },
      60_000,
    );
    lastStatus = status;
    console.log(
      `Ingestion ${schedulerId}: selected=${status.selectedSources} terminal=${status.terminalAudits} queued=${status.queuedJobs} active=${status.activeJobs} unaccounted=${status.unaccountedSources} requeued=${recovery.sourcesRequeued}`,
    );
    if (
      status.selectedSources > 0 &&
      status.terminalAudits >= status.selectedSources &&
      status.queuedJobs === 0 &&
      status.activeJobs === 0 &&
      status.unaccountedSources === 0
    ) {
      return status;
    }
    await sleep(pollIntervalMs);
  }
  throw new Error(
    `Ingestion supervision timed out: ${JSON.stringify(lastStatus || {})}`,
  );
}

async function main() {
  const result = await triggerJobBoardIngestion({
    apiUrl: process.env.RENDER_API_URL,
    apiKey: process.env.API_SECRET_KEY,
    schedulerId: process.env.SCHEDULER_RUN_ID,
    triggerOrigin: process.env.TRIGGER_ORIGIN || 'github_actions',
  });

  console.log(
    `Job-board ingestion ${result.status} successfully (job ${result.jobId})`
  );
  if (process.env.SUPERVISE_INGESTION === 'true') {
    await superviseJobBoardIngestion({
      apiUrl: process.env.RENDER_API_URL,
      apiKey: process.env.API_SECRET_KEY,
      schedulerId: process.env.SCHEDULER_RUN_ID,
    });
    console.log('Job-board ingestion reached terminal outcomes for all selected sources');
  }
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
