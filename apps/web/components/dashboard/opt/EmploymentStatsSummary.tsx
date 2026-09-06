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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {showComplianceNumbers ? stats.totalEmployedDays : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Days Employed</p>
        </div>
        <div className="text-center">
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
          <p className="text-xs text-muted-foreground mt-1">
            {trackingIncomplete ? 'Pending setup' : 'Days Unemployed'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {showComplianceNumbers ? stats.currentStreak : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Current Streak</p>
        </div>
        <div className="text-center">
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
          <p className="text-xs text-muted-foreground mt-1">Longest Gap</p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Unemployment Days Used</span>
          <span>
            {showComplianceNumbers
              ? `${stats.totalUnemployedDays} / ${maxUnemploymentDays}`
              : 'Add jobs to calculate'}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          {showComplianceNumbers ? (
            <div
              className={`h-full transition-all duration-500 ${
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
