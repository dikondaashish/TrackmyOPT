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

function slotHoursFor(weekday: string) {
  return weekday === 'Sat' || weekday === 'Sun'
    ? WEEKEND_SLOT_HOURS
    : WEEKDAY_SLOT_HOURS;
}

/** Slot starts within [from, to], oldest first. */
export function scheduledSlotsBetween(from: Date, to: Date) {
  const slots: Date[] = [];
  for (let t = from.getTime() - DAY_MS; t <= to.getTime() + DAY_MS; t += DAY_MS) {
    const local = localParts(new Date(t));
    for (const hour of slotHoursFor(local.weekday)) {
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

/** A firing up to this long after a slot start still dispatches that slot. */
export const SLOT_GRACE_MS = 90 * 60_000;

/**
 * The slot `now` belongs to (start <= now < start + grace), or null. Mirrors
 * `scheduledSlot` in scripts/operations/job-board-schedule.mjs. The run ID is
 * derived from the slot start, so every firing inside one slot maps to the
 * same `job-board-hour-*` ID and the API's scheduler ledger suppresses the
 * duplicates.
 */
export function scheduledSlot(now: Date, graceMs = SLOT_GRACE_MS) {
  const local = localParts(now);
  for (const hour of slotHoursFor(local.weekday)) {
    const slotStart = newYorkTimeToUtc(local.year, local.month, local.day, hour);
    const elapsed = now.getTime() - slotStart.getTime();
    if (elapsed >= 0 && elapsed < graceMs) {
      return { slotStart, runId: slotRunId(slotStart) };
    }
  }
  return null;
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

/**
 * JOB_BOARD_SCHEDULE_START: ISO instant the schedule was switched on. Slots
 * before it were never meant to run, so they are not reported as missing.
 * Unset or invalid disables the missing-run check entirely.
 */
export function parseScheduleStart(raw: string | undefined): Date | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function evaluateIngestionHealth(
  now: Date,
  runs: readonly SchedulerRunRow[],
  recentAudits: readonly AuditRow[],
  scheduleStart: Date | null = null
): IngestionHealth {
  const dispatched = new Set(
    runs
      .filter((run) => run.dispatch_status === 'queued')
      .map((run) => run.scheduler_run_id)
  );
  const lookbackStart = new Date(now.getTime() - LOOKBACK_MS);
  const missingRuns = scheduleStart
    ? scheduledSlotsBetween(
        scheduleStart > lookbackStart ? scheduleStart : lookbackStart,
        new Date(now.getTime() - MISSING_RUN_GRACE_MS)
      )
        .map(slotRunId)
        .filter((id) => !dispatched.has(id))
    : [];

  // Only each source's latest audit counts: a source that failed in an
  // earlier run of the window and succeeded in a later one has recovered,
  // so last night's failures stop alerting once tonight's run fixes them.
  const latest = new Map<string, AuditRow>();
  for (const row of [...recentAudits].sort((a, b) =>
    b.run_at.localeCompare(a.run_at)
  )) {
    if (!latest.has(row.source_id)) latest.set(row.source_id, row);
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
