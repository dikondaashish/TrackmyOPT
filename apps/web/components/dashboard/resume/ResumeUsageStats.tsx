"use client";

import { useEffect, useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UsageData {
    resumeUsage: number;
    resumeLimit: number;
}

export function ResumeUsageStats({ compact = false }: { compact?: boolean }) {
    const [stats, setStats] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/user/usage');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        resumeUsage: data.resumeUsage,
                        resumeLimit: data.resumeLimit
                    });
                }
            } catch (error) {
                console.error('Failed to fetch usage:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return null;
    if (!stats) return null;

    const { resumeUsage, resumeLimit } = stats;
    const percentage = Math.min((resumeUsage / resumeLimit) * 100, 100);
    const isLimitReached = resumeUsage >= resumeLimit;
    const isNearLimit = percentage >= 80;

    return (
        <div
            className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm transition-all ${compact ? 'px-3 py-1.5 mr-4 flex items-center justify-between gap-3 min-w-[140px]' : 'p-4 mb-6 block'}`}
            title={compact ? "Resumes generated this month" : undefined}
        >
            {compact ? (
                <>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 leading-tight mb-0.5">
                            Monthly Usage
                        </span>
                        <div className="flex items-baseline gap-1.5 font-mono">
                            <span className={`text-sm font-bold ${isLimitReached ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {resumeUsage}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">/ {resumeLimit}</span>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <svg className="w-9 h-9 transform -rotate-90">
                            <circle
                                className="text-gray-100 dark:text-gray-800"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="transparent"
                                r="16"
                                cx="18"
                                cy="18"
                            />
                            <circle
                                className={isLimitReached ? 'text-red-500' : 'text-blue-600 dark:text-blue-500'}
                                strokeWidth="3"
                                strokeDasharray={2 * Math.PI * 16}
                                strokeDashoffset={(2 * Math.PI * 16) - (percentage / 100) * (2 * Math.PI * 16)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="16"
                                cx="18"
                                cy="18"
                            />
                        </svg>
                    </div>
                </>
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
                            <span className={`text-lg font-bold ${isLimitReached ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                {resumeUsage}
                            </span>
                            <span className="text-gray-400 text-sm"> / {resumeLimit}</span>
                        </div>
                    </div>

                    <Progress value={percentage} className={`h-2 mb-3 ${isLimitReached ? 'bg-red-100 dark:bg-red-900/30 [&>div]:bg-red-600' : ''}`} />

                    {isNearLimit && !isLimitReached && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                            You are approaching your monthly limit.
                        </p>
                    )}

                    {isLimitReached && (
                        <div className="flex items-center justify-between gap-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Limit reached. Upgrade for more.
                            </p>
                            <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs" asChild>
                                <Link href="/dashboard/settings/billing">Upgrade Plan</Link>
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
