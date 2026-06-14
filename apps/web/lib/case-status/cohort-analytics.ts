/**
 * Cohort analytics for nearby-case analysis: status/case-type distributions,
 * approval rate, processing-time estimates, and a simple outcome prediction.
 */

import { isApproved, isRejected } from "@/lib/immigration/uscis-checker";

export type CohortCaseCategory = "approved" | "denied" | "in_progress" | "invalid";

export type CohortCase = {
  receiptNumber: string;
  serial: number;
  currentStatus: string | null;
  caseType: string | null;
  statusDate: string | null;
  receivedDate: string | null;
  isValid: boolean;
  category: CohortCaseCategory;
  isCenter: boolean;
};

export type DistributionItem = { label: string; count: number; pct: number };

export type CohortAnalytics = {
  totalValid: number;
  totalScanned: number;
  totalRequested: number;
  pending: number;
  approvalRatePct: number | null;
  completedCount: number;
  processing: {
    avgMonths: number | null;
    fastestMonths: number | null;
    slowestMonths: number | null;
  };
  statusDistribution: DistributionItem[];
  caseTypeDistribution: DistributionItem[];
  prediction: {
    caseType: string | null;
    label: string;
    probabilityPct: number | null;
    avgDays: number | null;
    sampleSize: number;
  };
  cases: CohortCase[];
};

export function categorizeStatus(
  status: string | null,
  isValid: boolean
): CohortCaseCategory {
  if (!isValid) return "invalid";
  if (isApproved(status)) return "approved";
  if (isRejected(status)) return "denied";
  return "in_progress";
}

/** Tolerant parser for our stored date strings ("Month Day, Year" or ISO). */
function parseLooseDate(value: string | null): Date | null {
  if (!value) return null;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return null;
  return new Date(ts);
}

function monthsBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return ms / (1000 * 60 * 60 * 24 * 30.44);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function buildDistribution(
  values: Array<string | null>,
  fallback: string,
  total: number
): DistributionItem[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = v && v.trim() ? v.trim() : fallback;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export type CohortInput = {
  cases: CohortCase[];
  totalRequested: number;
};

export function computeCohortAnalytics({
  cases,
  totalRequested,
}: CohortInput): CohortAnalytics {
  const valid = cases.filter((c) => c.category !== "invalid");
  const totalScanned = cases.length;
  const totalValid = valid.length;

  const approved = valid.filter((c) => c.category === "approved");
  const denied = valid.filter((c) => c.category === "denied");
  const completed = approved.length + denied.length;
  const approvalRatePct =
    completed > 0 ? Math.round((approved.length / completed) * 100) : null;

  // Processing time estimates from received -> latest status date on completed cases.
  const processingMonths: number[] = [];
  for (const c of [...approved, ...denied]) {
    const start = parseLooseDate(c.receivedDate);
    const end = parseLooseDate(c.statusDate);
    if (start && end) {
      const m = monthsBetween(start, end);
      if (m > 0 && m < 120) processingMonths.push(m);
    }
  }

  const processing = {
    avgMonths: processingMonths.length
      ? round1(processingMonths.reduce((a, b) => a + b, 0) / processingMonths.length)
      : null,
    fastestMonths: processingMonths.length ? round1(Math.min(...processingMonths)) : null,
    slowestMonths: processingMonths.length ? round1(Math.max(...processingMonths)) : null,
  };

  const center = cases.find((c) => c.isCenter);
  const centerType = center?.caseType ?? null;

  // Prediction: among same-case-type completed cases, approval probability + avg days.
  const sameType = valid.filter(
    (c) => centerType && c.caseType && c.caseType === centerType
  );
  const sameTypeCompleted = sameType.filter(
    (c) => c.category === "approved" || c.category === "denied"
  );
  const sameTypeApproved = sameType.filter((c) => c.category === "approved");
  const predictionAvgDays = (() => {
    const days: number[] = [];
    for (const c of sameTypeApproved) {
      const start = parseLooseDate(c.receivedDate);
      const end = parseLooseDate(c.statusDate);
      if (start && end) {
        const d = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (d > 0 && d < 3650) days.push(d);
      }
    }
    return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null;
  })();

  const prediction = {
    caseType: centerType,
    label:
      sameTypeApproved.length > 0
        ? "Approval / Case Decision Rendered"
        : "Outcome pending — not enough completed cases",
    probabilityPct:
      sameTypeCompleted.length > 0
        ? Math.round((sameTypeApproved.length / sameTypeCompleted.length) * 100)
        : null,
    avgDays: predictionAvgDays,
    sampleSize: sameType.length,
  };

  return {
    totalValid,
    totalScanned,
    totalRequested,
    pending: Math.max(0, totalRequested - totalScanned),
    approvalRatePct,
    completedCount: completed,
    processing,
    statusDistribution: buildDistribution(
      valid.map((c) => c.currentStatus),
      "Status not available",
      totalValid
    ),
    caseTypeDistribution: buildDistribution(
      valid.map((c) => c.caseType),
      "Unknown",
      totalValid
    ),
    prediction,
    cases,
  };
}
