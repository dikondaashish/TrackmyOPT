import { addDaysIso } from "@/lib/case-status/safe-dates";
import { COMMUNITY_REPORTS_MESSAGING } from "@/lib/messaging/product-copy";
import type {
  CommunityEstimate,
  CommunityHeatmapRow,
  CommunityCaseKind,
  CommunityServiceCenter,
} from "./types";

export const MIN_COHORT_FOR_ESTIMATE = 15;

/**
 * Plausible filing-to-approval window. Partner rows are AI-parsed from Reddit
 * and contain both 1-day "approvals" and 3676-day values; anything outside
 * this range is a parse error rather than a real case, and every duration
 * analysis has to agree on that or the charts disagree with each other.
 */
export const MIN_APPROVAL_DAYS = 7;
export const MAX_APPROVAL_DAYS = 400;

export function isUsableDuration(days: number | null | undefined): days is number {
  return (
    typeof days === "number" &&
    days >= MIN_APPROVAL_DAYS &&
    days <= MAX_APPROVAL_DAYS
  );
}

const DISTRIBUTION_LABELS = [
  "<60d",
  "60–75d",
  "75–90d",
  "90–105d",
  "105–120d",
  "120d+",
] as const;

/** Shared with product-copy so Estimate / reports never disagree on disclaimer. */
export const COMMUNITY_ESTIMATE_SOURCE_NOTE =
  COMMUNITY_REPORTS_MESSAGING.sourceNote;
/** Linear-interpolated percentile over an ascending-sorted list. */
export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  if (sorted.length === 1) return sorted[0]!;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  const w = idx - lo;
  return Math.round(sorted[lo]! * (1 - w) + sorted[hi]! * w);
}

/** Bucket for the 6-bar summary histogram. Shared so the server-built
 *  distribution and the client's highlighted bar can never disagree. */
export function bucketIndex(days: number): number {
  if (days < 60) return 0;
  if (days < 75) return 1;
  if (days < 90) return 2;
  if (days < 105) return 3;
  if (days < 120) return 4;
  return 5;
}

export function buildDistribution(
  daysList: number[]
): Array<{ label: string; count: number }> {
  const counts = [0, 0, 0, 0, 0, 0];
  for (const d of daysList) counts[bucketIndex(d)]! += 1;
  return DISTRIBUTION_LABELS.map((label, i) => ({
    label,
    count: counts[i]!,
  }));
}

export type HistogramBin = {
  /** Inclusive lower edge, in days. */
  from: number;
  /** Inclusive upper edge, in days. */
  to: number;
  /** Axis label, e.g. "35–41d". */
  label: string;
  count: number;
};

export type ProcessingHistogram = {
  bins: HistogramBin[];
  totalCases: number;
  medianDays: number;
};

/** Below this the shape of a histogram is noise, so we show nothing. */
export const MIN_CASES_FOR_HISTOGRAM = 40;

/**
 * Fine-grained "how many cases landed in each time range" histogram.
 *
 * Callers should pass durations already restricted to a single premium /
 * regular segment and to mature filing weeks — mixing the two segments makes
 * this bimodal, and including immature weeks truncates the right tail.
 */
export function buildProcessingHistogram(
  daysList: number[],
  binDays = 7
): ProcessingHistogram | null {
  const sorted = daysList.filter(isUsableDuration).sort((a, b) => a - b);
  if (sorted.length < MIN_CASES_FOR_HISTOGRAM) return null;

  // Trim the extreme tail so a handful of 300-day cases don't flatten the
  // chart into an unreadable strip; the trimmed cases are still counted in
  // the final bin.
  const upper = Math.max(percentile(sorted, 0.98), sorted[0]! + binDays);
  const firstEdge = Math.floor(sorted[0]! / binDays) * binDays;
  const binCount = Math.max(1, Math.ceil((upper - firstEdge) / binDays));

  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => {
    const from = firstEdge + i * binDays;
    const to = from + binDays - 1;
    return { from, to, label: `${from}–${to}d`, count: 0 };
  });

  for (const d of sorted) {
    const idx = Math.min(bins.length - 1, Math.floor((d - firstEdge) / binDays));
    bins[idx]!.count += 1;
  }

  return {
    bins,
    totalCases: sorted.length,
    medianDays: percentile(sorted, 0.5),
  };
}

export type TimelineSample = {
  days_to_approval: number;
  approve_date: string | null;
  init_date: string | null;
  service_center: CommunityServiceCenter | null;
  premium_processing: boolean;
  case_kind: CommunityCaseKind;
};

/**
 * Pick the tightest cohort that still clears MIN_COHORT_FOR_ESTIMATE.
 * center+pp → pp only → kind only.
 */
export function selectCohort(
  rows: TimelineSample[],
  opts: {
    caseKind: CommunityCaseKind;
    serviceCenter: CommunityServiceCenter | null;
    premiumProcessing: boolean;
  }
): { samples: TimelineSample[]; matchLevel: CommunityEstimate["matchLevel"] } {
  const kindRows = rows.filter((r) => r.case_kind === opts.caseKind);

  if (opts.serviceCenter) {
    const centerPp = kindRows.filter(
      (r) =>
        r.service_center === opts.serviceCenter &&
        r.premium_processing === opts.premiumProcessing
    );
    if (centerPp.length >= MIN_COHORT_FOR_ESTIMATE) {
      return { samples: centerPp, matchLevel: "center_pp" };
    }
  }

  const ppOnly = kindRows.filter(
    (r) => r.premium_processing === opts.premiumProcessing
  );
  if (ppOnly.length >= MIN_COHORT_FOR_ESTIMATE) {
    return { samples: ppOnly, matchLevel: "pp" };
  }

  if (kindRows.length >= MIN_COHORT_FOR_ESTIMATE) {
    return { samples: kindRows, matchLevel: "kind" };
  }

  return { samples: [], matchLevel: "none" };
}

export function buildEstimateFromSamples(
  samples: TimelineSample[],
  opts: {
    daysSinceFiled: number;
    receivedDate: string | null;
    matchLevel: CommunityEstimate["matchLevel"];
    caseKind: CommunityCaseKind;
    serviceCenter: CommunityServiceCenter | null;
    premiumProcessing: boolean;
    nowMs?: number;
  }
): CommunityEstimate | null {
  if (samples.length < MIN_COHORT_FOR_ESTIMATE || opts.matchLevel === "none") {
    return null;
  }

  const days = samples.map((s) => s.days_to_approval).sort((a, b) => a - b);
  const medianDays = percentile(days, 0.5);
  const p25Days = percentile(days, 0.25);
  const p75Days = percentile(days, 0.75);
  const fastestDays = days[0]!;

  const behind = days.filter((d) => d > opts.daysSinceFiled).length;
  const ahead = days.filter((d) => d <= opts.daysSinceFiled).length;
  const percentileRank =
    days.length === 0
      ? 50
      : Math.max(
          1,
          Math.min(99, Math.round((ahead / days.length) * 100))
        );

  const start = opts.receivedDate;
  const low = addDaysIso(start, Math.max(0, p25Days - opts.daysSinceFiled));
  const high = addDaysIso(start, Math.max(0, p75Days - opts.daysSinceFiled));
  // If no filing date, show absolute calendar estimate from "today"
  const todayIso = new Date(opts.nowMs ?? Date.now()).toISOString().slice(0, 10);
  const rangeStart =
    low ?? addDaysIso(todayIso, Math.max(0, p25Days - opts.daysSinceFiled)) ?? todayIso;
  const rangeEnd =
    high ?? addDaysIso(todayIso, Math.max(0, p75Days - opts.daysSinceFiled)) ?? todayIso;

  const dayMs = 24 * 60 * 60 * 1000;
  const now = opts.nowMs ?? Date.now();
  const approvalsLast24h = samples.filter((s) => {
    if (!s.approve_date) return false;
    const t = Date.parse(`${s.approve_date}T12:00:00Z`);
    return !Number.isNaN(t) && now - t < dayMs;
  }).length;

  return {
    cohortSize: samples.length,
    medianDays,
    p25Days,
    p75Days,
    fastestDays,
    estimatedDecisionRange: [rangeStart, rangeEnd],
    distribution: buildDistribution(days),
    cohortPosition: {
      behind,
      ahead,
      percentile: percentileRank,
    },
    approvalsLast24h,
    matchLevel: opts.matchLevel,
    caseKind: opts.caseKind,
    serviceCenter: opts.serviceCenter,
    premiumProcessing: opts.premiumProcessing,
    sourceNote: COMMUNITY_ESTIMATE_SOURCE_NOTE,
  };
}

/** Filing-month × days-to-approval heatmap for the Analytics heatmap tab. */
export function buildHeatmap(
  samples: TimelineSample[],
  maxMonths = 6
): CommunityHeatmapRow[] {
  const byMonth = new Map<string, number[]>();
  for (const s of samples) {
    if (!s.init_date) continue;
    const month = s.init_date.slice(0, 7);
    const buckets = byMonth.get(month) ?? [0, 0, 0, 0, 0, 0];
    buckets[bucketIndex(s.days_to_approval)]! += 1;
    byMonth.set(month, buckets);
  }
  return [...byMonth.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, maxMonths)
    .reverse()
    .map(([month, buckets]) => ({ month, buckets }));
}
