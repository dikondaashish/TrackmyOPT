"use client";

import { ArrowRight, LockKeyhole, Users } from 'lucide-react';
import type { CommunitySummary } from '@/lib/community-opt/types';
import { getCommunityCaseKindLabel } from '@/lib/case-status/filing-category';
import { CASE_STATUS_MESSAGING } from '@/lib/messaging/product-copy';

interface CommunitySummaryCardProps {
  summary: CommunitySummary | null;
  daysSinceFiled?: number;
  onUpgrade?: () => void;
}

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
  onUpgrade,
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
          median for {summary.premiumProcessing ? "premium" : "standard"}{" "}
          {getCommunityCaseKindLabel(summary.caseKind)} · {summary.cohortSize.toLocaleString()}{" "}
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

      {onUpgrade && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3.5 dark:border-violet-900 dark:bg-violet-950/40">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-violet-700 dark:text-violet-300" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-violet-950 dark:text-violet-100">
                {CASE_STATUS_MESSAGING.caseInsightInlineTitle}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-violet-800 dark:text-violet-200">
                {CASE_STATUS_MESSAGING.caseInsightInlineBody}
              </p>
              <button
                type="button"
                onClick={onUpgrade}
                className="mt-2 inline-flex min-h-11 cursor-pointer items-center text-xs font-bold text-violet-700 underline-offset-4 transition-colors hover:text-violet-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 dark:text-violet-300 dark:hover:text-violet-100"
              >
                {CASE_STATUS_MESSAGING.caseInsightCta}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
