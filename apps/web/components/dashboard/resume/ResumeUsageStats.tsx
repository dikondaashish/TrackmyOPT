"use client";

import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface ResumeUsageData {
    resumeUsage: number;
    resumeLimit: number;
    resumeCreditBalance: number;
    canBuyResumeCredits: boolean;
}

export function ResumeUsageStats({
    compact = false,
    stats,
    onBuyCredits,
    onUpgrade,
}: {
    compact?: boolean;
    stats: ResumeUsageData | null;
    onBuyCredits?: () => void;
    onUpgrade?: () => void;
}) {
    if (!stats) return null;

    const {
        resumeUsage,
        resumeLimit,
        resumeCreditBalance,
        canBuyResumeCredits,
    } = stats;
    const percentage = Math.min((resumeUsage / resumeLimit) * 100, 100);
    const isLimitReached = resumeUsage >= resumeLimit;
    const isNearLimit = percentage >= 80;

    const loadCreditsAction =
        canBuyResumeCredits && onBuyCredits ? (
            <button
                type="button"
                onClick={onBuyCredits}
                className={`font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ${
                    compact ? 'text-[10px] text-left' : 'text-xs'
                }`}
            >
                Load credits
            </button>
        ) : onUpgrade ? (
            <button
                type="button"
                onClick={onUpgrade}
                className={`font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ${
                    compact ? 'text-[10px] text-left' : 'text-xs'
                }`}
            >
                Upgrade for more
            </button>
        ) : null;

    return (
        <div
            className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm transition-all ${compact ? 'px-3 py-2' : 'p-4 mb-6 block'}`}
            title={compact ? "Resumes generated this month" : undefined}
        >
            {compact ? (
                <div className="flex min-w-[200px] flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase leading-tight tracking-wider text-gray-400 dark:text-gray-500">
                            Monthly Usage
                        </span>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                            {Math.round(percentage)}% used
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-1.5 font-mono">
                            <span className={`text-sm font-bold ${isLimitReached ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {resumeUsage}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">/ {resumeLimit}</span>
                        </div>
                        {loadCreditsAction}
                    </div>
                    <Progress
                        value={percentage}
                        aria-label={`${resumeUsage} of ${resumeLimit} resumes used this month`}
                        className={`h-2.5 w-full ${
                            isLimitReached
                                ? 'bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-600'
                                : isNearLimit
                                  ? 'bg-amber-100 dark:bg-amber-900/30 [&>div]:bg-amber-500'
                                  : 'bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-600'
                        }`}
                    />
                    {resumeCreditBalance > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {resumeCreditBalance} credits loaded
                        </span>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${isLimitReached ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Monthly Usage
                                </h3>
                                <p className="text-xs text-gray-500 whitespace-nowrap">
                                    Resumes generated this month
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-baseline justify-end gap-1.5">
                                <span className={`text-lg font-bold ${isLimitReached ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                    {resumeUsage}
                                </span>
                                <span className="text-gray-400 text-sm">/ {resumeLimit}</span>
                            </div>
                            <div className="mt-1 flex justify-end">{loadCreditsAction}</div>
                        </div>
                    </div>

                    <Progress
                        value={percentage}
                        aria-label={`${resumeUsage} of ${resumeLimit} resumes used this month`}
                        className={`h-2.5 mb-1 w-full ${
                            isLimitReached
                                ? 'bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-600'
                                : isNearLimit
                                  ? 'bg-amber-100 dark:bg-amber-900/30 [&>div]:bg-amber-500'
                                  : 'bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-600'
                        }`}
                    />
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {Math.round(percentage)}% of monthly allowance used
                        {resumeCreditBalance > 0 ? ` · ${resumeCreditBalance} credits loaded` : ''}
                    </p>

                    {isNearLimit && !isLimitReached && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                            You are approaching your monthly limit.
                        </p>
                    )}

                    {isLimitReached && (
                        <div className="flex items-center justify-between gap-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                {canBuyResumeCredits
                                    ? `Monthly allowance used. ${resumeCreditBalance} purchased credits available.`
                                    : 'Monthly resume limit reached. Upgrade to Pro for more ATS-optimized resumes.'}
                            </p>
                            {canBuyResumeCredits ? (
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs"
                                    onClick={onBuyCredits}
                                >
                                    Buy credits
                                </Button>
                            ) : (
                                <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs" asChild>
                                    <Link href="/premium/checkout?planId=pro&interval=year">Upgrade to Pro</Link>
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
