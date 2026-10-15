/**
 * Health evaluation for the scheduled job-board ingestion. Pure functions:
 * the cron route reads the audit tables and reports what this returns.
 *
 * The schedule mirrors scripts/operations/job-board-schedule.mjs:
 * Monday–Friday 14:00 and 21:00, Saturday–Sunday 21:00, America/New_York.
 */
export const SCHEDULE_TIME_ZONE = 'America/New_York';
const WEEKDAY_SLOT_HOURS = [14, 21];
const WEEKEND_SLOT_HOURS = [21];

const DAY_MS = 24 * 60 * 60_000;

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHEDULE_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  weekday: 'short',
});

function localParts(date: Date) {
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday,
  };
}

function zoneOffsetMs(date: Date) {
  const p = localParts(date);
  return (
    Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) -
    Math.floor(date.getTime() / 1000) * 1000
  );
}

export function newYorkTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number
) {
  const guess = Date.UTC(year, month - 1, day, hour);
  const first = guess - zoneOffsetMs(new Date(guess));
  return new Date(guess - zoneOffsetMs(new Date(first)));
}

/** Slot starts within [from, to], oldest first. */
export function scheduledSlotsBetween(from: Date, to: Date) {
  const slots: Date[] = [];
  for (let t = from.getTime() - DAY_MS; t <= to.getTime() + DAY_MS; t += DAY_MS) {
    const local = localParts(new Date(t));
    const hours =
      local.weekday === 'Sat' || local.weekday === 'Sun'
        ? WEEKEND_SLOT_HOURS
        : WEEKDAY_SLOT_HOURS;
    for (const hour of hours) {
      const start = newYorkTimeToUtc(local.year, local.month, local.day, hour);
      if (
        start >= from &&
        start <= to &&
        !slots.some((slot) => slot.getTime() === start.getTime())
      )
        slots.push(start);
    }
  }
  return slots.sort((a, b) => a.getTime() - b.getTime());
}

export function slotRunId(slotStart: Date) {
  return `job-board-hour-${slotStart.toISOString().slice(0, 13)}`;
}

export type SchedulerRunRow = {
  scheduler_run_id: string;
  dispatch_status: string | null;
};
export type AuditRow = {
  source_id: string;
  scheduler_run_id: string | null;
  status: string;
  error_message: string | null;
  run_at: string;
};

export type IngestionHealth = {
  missingRuns: string[];
  failedSources: number;
  oracleErrorSources: number;
  stalledSources: number;
  errorCodes: string[];
};

/** A slot is only "missing" after this long, so a slow start is not flagged. */
export const MISSING_RUN_GRACE_MS = 3 * 60 * 60_000;
/** Look back one day plus slack so every slot is checked at least once. */
export const LOOKBACK_MS = 26 * 60 * 60_000;
/** A source audit still "started" after this long is treated as stalled. */
export const STALLED_AFTER_MS = 90 * 60_000;

const ORACLE_CODE = /\b(ORA-\d{5}|NJS-\d{3}|DPI-\d{4})\b/;

export function evaluateIngestionHealth(
  now: Date,
  runs: readonly SchedulerRunRow[],
  recentAudits: readonly AuditRow[]
): IngestionHealth {
  const dispatched = new Set(
    runs
      .filter((run) => run.dispatch_status === 'queued')
      .map((run) => run.scheduler_run_id)
  );
  const missingRuns = scheduledSlotsBetween(
    new Date(now.getTime() - LOOKBACK_MS),
    new Date(now.getTime() - MISSING_RUN_GRACE_MS)
  )
    .map(slotRunId)
    .filter((id) => !dispatched.has(id));

  // Only the latest audit per (run, source) counts: a recovered source that
  // later succeeded is not a failure.
  const latest = new Map<string, AuditRow>();
  for (const row of [...recentAudits].sort((a, b) =>
    b.run_at.localeCompare(a.run_at)
  )) {
    const key = `${row.scheduler_run_id}|${row.source_id}`;
    if (!latest.has(key)) latest.set(key, row);
  }
  const failed = [...latest.values()].filter((row) => row.status === 'failed');
  const codes = failed
    .map((row) => ORACLE_CODE.exec(row.error_message ?? '')?.[1])
    .filter((code): code is string => Boolean(code));
  const stalledSources = [...latest.values()].filter(
    (row) =>
      row.status === 'started' &&
      now.getTime() - Date.parse(row.run_at) > STALLED_AFTER_MS
  ).length;
  return {
    missingRuns,
    failedSources: failed.length,
    oracleErrorSources: codes.length,
    stalledSources,
    errorCodes: [...new Set(codes)].sort(),
  };
}
