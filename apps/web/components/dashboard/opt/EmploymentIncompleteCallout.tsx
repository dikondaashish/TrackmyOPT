"use client";

import { AlertCircle, Briefcase, Plus } from "lucide-react";
import { formatOptDateForDisplay } from "@/lib/immigration/employment-tracking";

interface EmploymentIncompleteCalloutProps {
  optStartDate: string;
  onAddJob?: () => void;
  onBetweenJobs?: () => void;
  variant?: "full" | "compact";
  showActions?: boolean;
}

export function EmploymentIncompleteCallout({
  optStartDate,
  onAddJob,
  onBetweenJobs,
  variant = "full",
  showActions = true,
}: EmploymentIncompleteCalloutProps) {
  const formattedStart = formatOptDateForDisplay(optStartDate);

  if (variant === "compact") {
    return (
      <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Add your job history</strong> to calculate real unemployment days. Numbers below are
          placeholders until you enter employers.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-50">
            Unemployment clock needs your job history
          </h3>
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            You set OPT start to <strong>{formattedStart}</strong>. Without employment records, we
            cannot tell which days you were employed. USCIS only counts days without qualifying work
            in your field — add each job with start and end dates.
          </p>
          {showActions && (
            <div className="flex flex-wrap gap-2 pt-1">
              {onAddJob && (
                <button
                  type="button"
                  onClick={onAddJob}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add current or past job
                </button>
              )}
              {onBetweenJobs && (
                <button
                  type="button"
                  onClick={onBetweenJobs}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-900 hover:bg-white dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  I&apos;m between jobs
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
