"use client";

import { Users } from "lucide-react";
import type { CommunitySummary } from "@/lib/community-opt/types";

interface CommunitySummaryCardProps {
  summary: CommunitySummary | null;
  daysSinceFiled?: number;
}

const KIND_LABEL: Record<CommunitySummary["caseKind"], string> = {
  initial_opt: "initial OPT",
  stem_extension: "STEM OPT extension",
};

/**
 * The headline community wait, shown on every plan.
 *
 * Free plans get this instead of the full estimate panel: the typical wait for
 * a matching case, and how far along the user is against it, with nothing that
 * places them inside the distribution.
 */
export function CommunitySummaryCard({
  summary,
  daysSinceFiled = 0,
}: CommunitySummaryCardProps) {
  if (!summary) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Not enough community reports yet for a typical wait on this case type.
      </p>
    );
  }

  const remaining = summary.medianDays - daysSinceFiled;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <p className="text-sm font-semibold text-foreground">
          Typical community wait
        </p>
      </div>

      <div className="flex items-end gap-3">
        <p className="text-3xl font-bold text-foreground leading-none">
          {summary.medianDays}
          <span className="text-base font-semibold text-muted-foreground ml-1">
            days
          </span>
        </p>
        <p className="text-xs text-muted-foreground pb-1">
          median for {summary.premiumProcessing ? "premium" : "regular"}{" "}
          {KIND_LABEL[summary.caseKind]} · {summary.cohortSize.toLocaleString()}{" "}
          reports
        </p>
      </div>

      {daysSinceFiled > 0 && (
        <p className="text-xs text-muted-foreground">
          {remaining > 0 ? (
            <>
              You are {daysSinceFiled} days in — about {remaining} days short of
              the typical wait.
            </>
          ) : (
            <>
              You are {daysSinceFiled} days in, past the typical wait. Roughly
              half of reported cases take longer than the median.
            </>
          )}
        </p>
      )}
    </div>
  );
}
