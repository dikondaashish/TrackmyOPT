"use client";

import { Search, TrendingUp, Users2, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDisplayDateShort } from "@/lib/case-status/safe-dates";
import { bucketIndex, MIN_COHORT_FOR_ESTIMATE } from "@/lib/community-opt/estimate";
import type { CommunityEstimate } from "@/lib/community-opt/types";

interface PredictionPanelProps {
  daysSinceFiled: number;
  prediction?: CommunityEstimate;
  /** Minimum cohort size to show predictions */
  minCohort?: number;
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

function DataGate({ minCohort }: { minCohort: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
      <Search className="w-8 h-8 text-muted-foreground" />
      <p className="font-semibold text-foreground text-sm">Not enough matched community data yet</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        We need {minCohort}+ completed community reports for cases like yours.
        Estimates refresh after the next community data sync.
      </p>
    </div>
  );
}

export function PredictionPanel({
  daysSinceFiled,
  prediction,
  minCohort = MIN_COHORT_FOR_ESTIMATE,
}: PredictionPanelProps) {
  if (!prediction || prediction.cohortSize < minCohort) {
    return <DataGate minCohort={minCohort} />;
  }

  const {
    medianDays,
    p25Days,
    p75Days,
    estimatedDecisionRange,
    distribution,
    cohortPosition,
    cohortSize,
    fastestDays,
    approvalsLast24h,
    sourceNote,
  } = prediction;
  const max = Math.max(...distribution.map((d) => d.count), 1);
  const low = p25Days ?? medianDays;
  const high = p75Days ?? medianDays;

  const currentBucket = bucketIndex(daysSinceFiled);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Typical wait
            </p>
          </div>
          <p className="text-lg font-extrabold text-foreground">{medianDays} days</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Median to approval · middle 50% {low}–{high}d · {cohortSize} reports
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Estimated window
            </p>
          </div>
          <p className="text-sm font-bold text-foreground">
            {formatDisplayDateShort(estimatedDecisionRange[0])} – {formatDisplayDateShort(estimatedDecisionRange[1])}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on p25–p75 · you are on day {daysSinceFiled}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <Users2 className="w-3.5 h-3.5" />
          {cohortSize} completed community reports
        </span>
        {fastestDays !== undefined && (
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Fastest reported: {fastestDays}d
          </span>
        )}
        {approvalsLast24h !== undefined && approvalsLast24h > 0 && (
          <span>{approvalsLast24h} approvals in last 24 hours</span>
        )}
      </div>

      <div className="text-xs text-muted-foreground px-1 space-y-0.5">
        <p>
          <span className="font-semibold text-foreground">{cohortPosition.behind.toLocaleString()}</span> similar
          cases took longer ·{" "}
          <span className="font-semibold text-foreground">{cohortPosition.ahead.toLocaleString()}</span> were
          already decided by day {daysSinceFiled}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">Days to approval distribution</p>
        <div className="flex items-end gap-1.5 h-24">
          {distribution.map((d, i) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 h-full">
              <Bar count={d.count} max={max} isCurrentBucket={i === currentBucket} />
              <span className="text-[9px] text-muted-foreground leading-none text-center whitespace-nowrap">
                {d.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Day {daysSinceFiled} — highlighted bar · planning reference only
        </p>
      </div>

      {sourceNote && (
        <p className="text-[10px] text-muted-foreground px-1 leading-relaxed">{sourceNote}</p>
      )}
    </div>
  );
}
