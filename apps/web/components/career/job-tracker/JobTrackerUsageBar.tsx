"use client";

import { Zap } from "lucide-react";
import type { JobApplication } from "@/lib/career/job-tracker/types";

interface JobTrackerUsageBarProps {
  applications: JobApplication[];
  planTier: string | null;
}

/** Jobs are unlimited on Free — show count only, no fake limit. */
export function JobTrackerUsageBar({
  applications,
  planTier,
}: JobTrackerUsageBarProps) {
  const isPremium = planTier && planTier.toLowerCase() !== "free";
  const currentCount = applications.filter((a) => !a.is_archived).length;

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
        <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-current" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
          Unlimited Job Tracking Active
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800">
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {currentCount === 0
          ? "Job tracking included on Free"
          : `${currentCount} job${currentCount === 1 ? "" : "s"} tracked`}
      </span>
    </div>
  );
}
