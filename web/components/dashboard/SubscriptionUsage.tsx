import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';

interface UsageStats {
    jobsCount: number;
    jobLimit: number;
}

export function SubscriptionUsage() {
    const [stats, setStats] = useState<UsageStats>({ jobsCount: 0, jobLimit: 5 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsage() {
            try {
                const res = await fetch('/api/user/usage');
                if (res.ok) {
                    const data = await res.json();
                    setStats({ jobsCount: data.jobsCount || 0, jobLimit: data.jobLimit || 5 });
                }
            } catch (error) {
                console.error('Failed to fetch usage stats', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsage();
    }, []);

    const percentage = Math.min((stats.jobsCount / stats.jobLimit) * 100, 100);
    const isNearLimit = percentage >= 80;

    return (
        <div className="space-y-1">
            <h4 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                Usage Limits
            </h4>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Backlogged Jobs</span>
                        <span className={`font-medium ${isNearLimit ? 'text-amber-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {stats.jobsCount} / {stats.jobLimit}
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    {isNearLimit && (
                        <p className="text-xs text-amber-500 mt-2">
                            You are reaching your free limit. Upgrade to track unlimited jobs.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
