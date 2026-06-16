"use client";

import { Search, TrendingUp, Users2, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Distribution {
  label: string;
  count: number;
}

interface CohortPosition {
  behind: number;
  ahead: number;
  percentile: number;
}

interface PredictionSummary {
  cohortSize: number;
  approvalRate: number;    // 0–1
  medianDays: number;
  estimatedDecisionRange: [string, string];
  distribution: Distribution[];
  cohortPosition: CohortPosition;
  fastestDays?: number;
  approvalsLast24h?: number;
}

interface PredictionPanelProps {
  daysSinceFiled: number;
  prediction?: PredictionSummary;
  /** Minimum cohort size to show predictions */
  minCohort?: number;
}

const MIN_COHORT_DEFAULT = 20;

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

function fmtDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return iso; }
}

function Bar({ count, max, isCurrentBucket }: { count: number; max: number; isCurrentBucket: boolean }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="relative h-full flex flex-col justify-end">
      <div
        className={cn(
          "w-full rounded-t transition-all duration-500",
          isCurrentBucket
            ? "bg-blue-500 ring-2 ring-blue-300 dark:ring-blue-700"
            : "bg-gray-200 dark:bg-gray-700"
        )}
        style={{ height: `${Math.max(pct, 4)}%` }}
      />
    </div>
  );
}

function DataGate({ cohortSize, minCohort }: { cohortSize: number; minCohort: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
      <Search className="w-8 h-8 text-muted-foreground" />
      <p className="font-semibold text-foreground text-sm">Not enough data yet</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        We need {minCohort}+ similar cases for reliable predictions.
        {cohortSize > 0
          ? ` Currently tracking ${cohortSize} nearby cases — check back soon.`
          : " We'll update this as more cases are processed."}
      </p>
    </div>
  );
}

export function PredictionPanel({ daysSinceFiled, prediction, minCohort = MIN_COHORT_DEFAULT }: PredictionPanelProps) {
  if (!prediction || prediction.cohortSize < minCohort) {
    return <DataGate cohortSize={prediction?.cohortSize ?? 0} minCohort={minCohort} />;
  }

  const { approvalRate, medianDays, estimatedDecisionRange, distribution, cohortPosition, cohortSize, fastestDays, approvalsLast24h } = prediction;
  const pctLabel = Math.round(approvalRate * 100);
  const max = Math.max(...distribution.map((d) => d.count), 1);

  // Determine which histogram bucket the current day falls into
  const getBucketIndex = (days: number) => {
    if (days < 60)  return 0;
    if (days < 75)  return 1;
    if (days < 90)  return 2;
    if (days < 105) return 3;
    if (days < 120) return 4;
    return 5;
  };
  const currentBucket = getBucketIndex(daysSinceFiled);

  return (
    <div className="space-y-5">
      {/* Summary block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Outcome */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Likely Outcome</p>
          </div>
          <p className="text-lg font-extrabold text-foreground">Approval likely</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pctLabel}% based on {cohortSize} completed cases
          </p>
        </div>

        {/* Estimate */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Estimated Decision</p>
          </div>
          <p className="text-sm font-bold text-foreground">
            {fmtDateShort(estimatedDecisionRange[0])} – {fmtDate(estimatedDecisionRange[1])}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Median {medianDays}d · You are on day {daysSinceFiled}
          </p>
        </div>
      </div>

      {/* Cohort row */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <Users2 className="w-3.5 h-3.5" />
          {cohortSize} cases within ±100 receipts
        </span>
        {fastestDays && (
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Fastest nearby: {fastestDays}d
          </span>
        )}
        {approvalsLast24h !== undefined && (
          <span>{approvalsLast24h} approvals in last 24 hours</span>
        )}
      </div>

      {/* Cohort position */}
      <div className="text-xs text-muted-foreground px-1 space-y-0.5">
        <p>
          <span className="font-semibold text-foreground">{cohortPosition.behind.toLocaleString()}</span> cases behind you ·{" "}
          <span className="font-semibold text-foreground">{cohortPosition.ahead.toLocaleString()}</span> ahead ·{" "}
          Top <span className="font-semibold text-blue-600 dark:text-blue-400">{cohortPosition.percentile}%</span>
        </p>
      </div>

      {/* Distribution histogram */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Days to approval distribution</p>
        <div className="flex items-end gap-1.5 h-24">
          {distribution.map((d, i) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 h-full">
              <Bar count={d.count} max={max} isCurrentBucket={i === currentBucket} />
              <span className="text-[9px] text-muted-foreground leading-none text-center whitespace-nowrap">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          {daysSinceFiled >= 90 && daysSinceFiled < 120
            ? `Day ${daysSinceFiled} — past the peak 90–105 day range, still within normal distribution`
            : `Day ${daysSinceFiled} — shown in the highlighted bar`}
        </p>
      </div>
    </div>
  );
}
