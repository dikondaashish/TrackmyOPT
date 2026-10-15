import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { scheduledSlot } from './job-board-schedule.mjs';

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
    if (result.status !== 'running') {
      const error = new Error('Ingestion incomplete or failed; inspect existing run, do not redispatch');
      error.result = result;
      throw error;
    }
    if (result.queuesPaused?.normal || result.queuesPaused?.slow) throw new Error('Ingestion queue is paused; no automatic resume permitted');
    await wait(pollMs);
  }
  throw new Error('Ingestion supervision deadline exceeded; do not redispatch');
}

/** True when every remaining problem is a failed source that can be retried. */
export function onlyFailedSourcesRemain(result) {
  return Boolean(
    result && result.manifestAvailable && result.failed > 0 &&
    result.started === 0 && result.runnable === 0 && result.missing === 0
  );
}

/** Requeue only the run's failed sources (idempotent on the API side). */
export async function recoverFailedSources({ apiUrl, apiKey, schedulerId, fetchImpl = fetch }) {
  const url = new URL(`/job-board/ops/ingestion-runs/${encodeURIComponent(schedulerId)}/recover-failed`, apiUrl);
  if (url.protocol !== 'https:') throw new Error('Recovery requires HTTPS');
  const response = await fetchImpl(url, {
    method: 'POST', headers: { 'x-api-key': apiKey }, redirect: 'error',
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Failed-source recovery returned HTTP ${response.status}`);
  return response.json();
}

export function runSummary(schedulerId, result, recovered) {
  const lines = [
    `### Job-board ingestion \`${schedulerId}\``,
    '',
    '| Selected | Succeeded | Failed | Still started | Missing |',
    '|---|---|---|---|---|',
    `| ${result?.selected ?? '?'} | ${result?.succeeded ?? '?'} | ${result?.failed ?? '?'} | ${result?.started ?? '?'} | ${result?.missing ?? '?'} |`,
  ];
  if (recovered) lines.push('', `Failed sources requeued once: ${recovered.sourcesRequeued}`);
  return `${lines.join('\n')}\n`;
}

async function writeSummary(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, text);
}

async function main() {
  const config = {
    apiUrl: process.env.RENDER_API_URL,
    apiKey: process.env.API_SECRET_KEY,
    schedulerId: process.env.SCHEDULER_RUN_ID || schedulerRunId(),
    triggerOrigin: process.env.TRIGGER_ORIGIN || 'github_actions',
  };
  if (process.env.SCHEDULED === 'true') {
    // Scheduled firings outside a New York slot window exit without effect.
    const slot = scheduledSlot();
    if (!slot) {
      console.log('Not inside a scheduled ingestion slot; nothing to do');
      return;
    }
    config.schedulerId = slot.runId;
    console.log(`Scheduled slot ${slot.localSlot} -> ${slot.runId}`);
  }
  if (process.env.MONITOR_ONLY !== 'true') {
    const result = await triggerJobBoardIngestion(config);
    console.log(`Job-board dispatch ${result.status}`);
    if (result.status === 'suppressed' && process.env.SCHEDULED === 'true') {
      // Another firing of this slot already dispatched and supervises it.
      console.log('Slot already dispatched; not supervising twice');
      return;
    }
  }
  const onProgress = (progress) => console.log(JSON.stringify(progress));
  try {
    const result = await superviseIngestion({ ...config, onProgress });
    await writeSummary(runSummary(config.schedulerId, result));
  } catch (error) {
    if (process.env.AUTO_RECOVER_FAILED !== 'true' || !onlyFailedSourcesRemain(error.result)) {
      await writeSummary(runSummary(config.schedulerId, error.result));
      throw error;
    }
    // One targeted recovery per run: only failed sources, never successful ones.
    const recovered = await recoverFailedSources(config);
    console.log(`Requeued ${recovered.sourcesRequeued} failed sources once`);
    try {
      const result = await superviseIngestion({ ...config, onProgress });
      await writeSummary(runSummary(config.schedulerId, result, recovered));
    } catch (retryError) {
      await writeSummary(runSummary(config.schedulerId, retryError.result, recovered));
      throw retryError;
    }
  }
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
