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

export function ResumeUsageStats() {
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
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isLimitReached ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Monthly Usage
                        </h3>
                        <p className="text-xs text-gray-500">
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
        </div>
    );
}
