/**
 * Weekly "how long did filings from this week take" trend.
 *
 * Two guards keep this honest:
 *
 * 1. Maturity. A case only appears here once it is approved, so a week filed
 *    more recently than the typical processing time contains nothing but its
 *    fastest cases and plots as a dramatic speed-up that never happened. Weeks
 *    younger than the cohort's own p75 processing time are excluded.
 *
 *    Note this is deliberately an age test, not a "share resolved" test: in the
 *    partner data, old weeks also sit at 30-40% resolved because reporters stop
 *    updating their own rows, so a completion-ratio guard throws away months of
 *    settled history to defend against censoring that can no longer occur.
 *
 * 2. Median, not mean. Rows are AI-parsed from Reddit and carry occasional
 *    absurd values; one bad row moves a mean and not a median.
 */

import { isUsableDuration, percentile } from "./estimate";

export type WeeklyTrendRow = {
  init_date: string | null;
  days_to_approval: number | null;
};

export type WeeklyTrendPoint = {
  /** Monday of the filing week, YYYY-MM-DD */
  weekStart: string;
  /** Short axis label, MM-DD */
  label: string;
  medianDays: number;
  p25Days: number;
  p75Days: number;
  sampleSize: number;
};

/** Weeks with fewer resolved cases than this are too noisy to plot. */
export const MIN_WEEK_SAMPLE = 5;

/** Bounds on the maturity horizon, so a thin or skewed cohort can't set an absurd one. */
const MIN_HORIZON_DAYS = 30;
const MAX_HORIZON_DAYS = 240;
const DAY_MS = 86_400_000;

/** Monday (UTC) of the week containing an ISO date, or null if unparseable. */
export function isoWeekStart(date: string | null | undefined): string | null {
  const ms = parseUtcDate(date);
  if (ms === null) return null;
  const d = new Date(ms);
  // getUTCDay: 0=Sunday → shift so Monday starts the week
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** Midnight-UTC epoch ms for a leading `YYYY-MM-DD`, or null if unparseable.
 *  Shared so every duration analysis agrees on what a filing date means. */
export function parseUtcDate(date: string | null | undefined): number | null {
  if (!date) return null;
  const m = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const ms = Date.parse(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * The date before which a cohort's filings can be trusted as settled.
 *
 * A stage only appears in the data once it has happened, so anything anchored
 * more recently than the cohort's own p75 duration contains only its fastest
 * cases. Callers pass durations for the stage they are measuring — approval,
 * biometrics, card production — since each settles on its own timescale, and
 * `minHorizonDays` floors the horizon so a very fast stage still gets a
 * sensible buffer. Returns null when there is nothing to measure.
 */
export function maturityCutoffMs(
  sortedDurations: number[],
  now: number = Date.now(),
  minHorizonDays: number = MIN_HORIZON_DAYS
): number | null {
  if (!sortedDurations.length) return null;
  const horizonDays = Math.min(
    MAX_HORIZON_DAYS,
    Math.max(minHorizonDays, percentile(sortedDurations, 0.75))
  );
  return now - horizonDays * DAY_MS;
}

/**
 * Keep only rows filed long enough ago that their slow cases could have been
 * decided. Applies to any duration analysis, not just the weekly trend: a
 * histogram built without this under-counts its own long tail, because the
 * slow half of recent filings has not shown up in the data yet.
 *
 * The horizon is the pool's own p75 duration, so a fast premium cohort keeps
 * far more history than a slow regular one.
 */
export function filterMatureRows<T extends WeeklyTrendRow>(
  rows: T[],
  now: number = Date.now()
): T[] {
  const durations = rows
    .map((r) => r.days_to_approval)
    .filter(isUsableDuration)
    .sort((a, b) => a - b);

  const cutoff = maturityCutoffMs(durations, now);
  if (cutoff === null) return [];

  return rows.filter((row) => {
    const weekMs = parseUtcDate(isoWeekStart(row.init_date));
    return weekMs !== null && weekMs <= cutoff;
  });
}

export function buildWeeklyProcessingTrend(
  rows: WeeklyTrendRow[],
  opts: { maxWeeks?: number; now?: number } = {}
): WeeklyTrendPoint[] {
  const maxWeeks = opts.maxWeeks ?? 26;

  const buckets = new Map<string, number[]>();
  for (const row of filterMatureRows(rows, opts.now)) {
    if (!isUsableDuration(row.days_to_approval)) continue;
    const week = isoWeekStart(row.init_date);
    if (!week) continue;
    const bucket = buckets.get(week);
    if (bucket) bucket.push(row.days_to_approval);
    else buckets.set(week, [row.days_to_approval]);
  }

  const points: WeeklyTrendPoint[] = [];
  for (const [weekStart, days] of buckets) {
    if (days.length < MIN_WEEK_SAMPLE) continue;
    const sorted = days.sort((a, b) => a - b);
    points.push({
      weekStart,
      label: weekStart.slice(5),
      medianDays: percentile(sorted, 0.5),
      p25Days: percentile(sorted, 0.25),
      p75Days: percentile(sorted, 0.75),
      sampleSize: sorted.length,
    });
  }

  return points
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-maxWeeks);
}
