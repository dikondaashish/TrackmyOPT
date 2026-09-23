'use client';

import type { EmploymentStats } from './employment-history-helpers';

interface EmploymentStatsSummaryProps {
  stats: EmploymentStats;
  maxUnemploymentDays: number;
  showComplianceNumbers: boolean;
  trackingIncomplete: boolean;
  betweenJobsEmpty: boolean;
}

export function EmploymentStatsSummary({
  stats,
  maxUnemploymentDays,
  showComplianceNumbers,
  trackingIncomplete,
  betweenJobsEmpty,
}: EmploymentStatsSummaryProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 border-b border-border bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-3 dark:from-card dark:via-card dark:to-blue-950/20 sm:grid-cols-4 sm:gap-3 sm:p-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-2 py-3 text-center dark:border-emerald-950 dark:bg-emerald-950/20">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {showComplianceNumbers ? stats.totalEmployedDays : '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            Days Employed
          </p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-2 py-3 text-center dark:border-blue-950 dark:bg-blue-950/20">
          <p
            className={`text-2xl font-bold ${
              !showComplianceNumbers
                ? 'text-muted-foreground'
                : stats.totalUnemployedDays >= maxUnemploymentDays * 0.9
                  ? 'text-red-600 dark:text-red-400'
                  : stats.totalUnemployedDays >= maxUnemploymentDays * 0.75
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {showComplianceNumbers ? stats.totalUnemployedDays : '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            {trackingIncomplete ? 'Pending setup' : 'Days Unemployed'}
          </p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50/70 px-2 py-3 text-center dark:border-violet-950 dark:bg-violet-950/20">
          <p className="text-2xl font-bold text-primary">
            {showComplianceNumbers ? stats.currentStreak : '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            Current Streak
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 px-2 py-3 text-center dark:border-slate-800 dark:bg-slate-950/20">
          <p
            className={`text-2xl font-bold ${
              !showComplianceNumbers
                ? 'text-muted-foreground'
                : stats.longestGap > 30
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
            }`}
          >
            {showComplianceNumbers ? stats.longestGap : '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            Longest Gap
          </p>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Unemployment days used
          </span>
          <span className="shrink-0 font-semibold text-foreground">
            {showComplianceNumbers
              ? `${stats.totalUnemployedDays} / ${maxUnemploymentDays}`
              : 'Complete dates and job history to calculate'}
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Unemployment days used"
          aria-valuemin={0}
          aria-valuemax={maxUnemploymentDays}
          aria-valuenow={
            showComplianceNumbers ? stats.totalUnemployedDays : undefined
          }
        >
          {showComplianceNumbers ? (
            <div
              className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${
                stats.totalUnemployedDays >= maxUnemploymentDays * 0.9
                  ? 'bg-red-500'
                  : stats.totalUnemployedDays >= maxUnemploymentDays * 0.75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (stats.totalUnemployedDays / maxUnemploymentDays) * 100)}%`,
              }}
            />
          ) : (
            <div className="h-full w-full border-2 border-dashed border-muted-foreground/30 bg-transparent" />
          )}
        </div>
        {trackingIncomplete && (
          <p className="mt-2 text-xs text-muted-foreground">
            Include every job since OPT started — check &quot;I currently work
            here&quot; for your present job.
          </p>
        )}
        {betweenJobsEmpty && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            You confirmed you&apos;re between jobs. Add a job anytime to update
            this count.
          </p>
        )}
      </div>
    </>
  );
}
