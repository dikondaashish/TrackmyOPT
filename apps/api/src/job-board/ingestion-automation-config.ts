import { PACING_TARGET_WINDOW_MS } from './source-job-planning';

/**
 * Settings for unattended ingestion. Every default reproduces the behaviour
 * before these settings existed, so deploying the code changes nothing until
 * a variable is set.
 */

/** Unset or anything but "false" keeps this process consuming Bull jobs. */
export function isJobBoardWorkerEnabled(raw: unknown) {
  if (raw === false) return false;
  return typeof raw !== 'string' || raw.trim().toLowerCase() !== 'false';
}

const MIN_PACING_WINDOW_MS = 60_000;
const MAX_PACING_WINDOW_MS = 6 * 60 * 60_000;

/** JOB_BOARD_PACING_WINDOW_MS; invalid or out-of-range values use 40 min. */
export function readPacingWindowMs(raw: unknown) {
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) &&
    parsed >= MIN_PACING_WINDOW_MS &&
    parsed <= MAX_PACING_WINDOW_MS
    ? parsed
    : PACING_TARGET_WINDOW_MS;
}

const MAX_PROVIDER_GAP_MS = 10 * 60_000;

/**
 * JOB_BOARD_PROVIDER_MIN_GAP_MS, e.g. "greenhouse=5000,workday=15000": the
 * minimum time between two source fetches on the same ATS provider. Entries
 * that are malformed or out of range are ignored; unset means no extra limit.
 */
export function parseProviderMinGaps(raw: unknown) {
  const gaps = new Map<string, number>();
  if (typeof raw !== 'string') return gaps;
  for (const entry of raw.split(',')) {
    const [name, value] = entry.split('=').map((part) => part?.trim());
    const ms = Number(value);
    if (
      name &&
      /^[a-z0-9_-]+$/i.test(name) &&
      Number.isSafeInteger(ms) &&
      ms >= 0 &&
      ms <= MAX_PROVIDER_GAP_MS
    )
      gaps.set(name.toLowerCase(), ms);
  }
  return gaps;
}

/** Bull keeps jobs as plain Redis keys; any eviction policy can drop them. */
export function redisEvictionPolicy(info: string) {
  return /^maxmemory_policy:(\S+)/m.exec(info)?.[1] ?? null;
}
