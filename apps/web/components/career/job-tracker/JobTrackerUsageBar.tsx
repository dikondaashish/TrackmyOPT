"use client";

import { JobApplication } from "@/lib/career/job-tracker/types";

import { Zap } from "lucide-react";

interface JobTrackerUsageBarProps {
    applications: JobApplication[];
    planTier: string | null;
}

export function JobTrackerUsageBar({ applications, planTier }: JobTrackerUsageBarProps) {
    const isPremium = planTier === 'pro' || planTier === 'dedicated';
    const limit = 5;
    const currentCount = applications.filter(a => !a.is_archived).length;
    const progress = (currentCount / limit) * 100;

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
        <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Free Tier Usage</span>
                <span className={`${currentCount >= limit ? 'text-red-500 font-bold' : 'text-gray-700 font-semibold'}`}>
                    {currentCount} / {limit} Jobs
                </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${currentCount >= limit ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            {currentCount >= limit && (
                <p className="text-[10px] text-red-500 font-medium animate-pulse">
                    Limit reached. Upgrade to Pro for unlimited jobs.
                </p>
            )}
        </div>
    );
}
