import { pathToFileURL } from 'node:url';

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(url, options, timeoutMs) {
  return fetch(url, {
    ...options,
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
        'x-scheduler-run-id': schedulerRunId(now),
      },
    },
    30_000
  );

  if (!response.ok) {
    throw new Error(`Ingestion endpoint returned ${response.status}`);
  }

  const result = await response.json();
  if (result?.status !== 'queued' || result.jobId == null) {
    throw new Error('Ingestion endpoint did not return a queued job ID');
  }

  return { status: result.status, jobId: String(result.jobId) };
}

async function main() {
  const result = await triggerJobBoardIngestion({
    apiUrl: process.env.RENDER_API_URL,
    apiKey: process.env.API_SECRET_KEY,
  });

  console.log(`Job-board ingestion queued successfully (job ${result.jobId})`);
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
