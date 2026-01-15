"use client";

import { useMemo } from "react";
import { Database } from "@/types/supabase";
import { TrendingUp, DollarSign, Clock, PieChart, Briefcase } from "lucide-react";

type H1BFilingRow = Database['public']['Tables']['h1b_filings']['Row'];

interface AnalyticsDashboardProps {
    filings: H1BFilingRow[];
}

export function AnalyticsDashboard({ filings }: AnalyticsDashboardProps) {
    const stats = useMemo(() => {
        if (!filings.length) return null;

        // 1. Salary Analytics
        const salaries = filings
            .map(f => f.wage_rate_from)
            .filter((w): w is number => typeof w === 'number' && w > 0);

        const sortedSalaries = [...salaries].sort((a, b) => a - b);
        const medianSalary = sortedSalaries[Math.floor(sortedSalaries.length / 2)] || 0;
        const p25 = sortedSalaries[Math.floor(sortedSalaries.length * 0.25)] || 0;
        const p75 = sortedSalaries[Math.floor(sortedSalaries.length * 0.75)] || 0;

        // 2. Processing Time (Decision - Received)
        const processingTimes = filings
            .filter(f => f.decision_date && f.received_date)
            .map(f => {
                const start = new Date(f.received_date!).getTime();
                const end = new Date(f.decision_date!).getTime();
                return (end - start) / (1000 * 60 * 60 * 24); // Days
            })
            .filter(d => d >= 0);

        const avgProcessingTime = processingTimes.length
            ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
            : 0;

        // 3. Status Breakdown
        const statusCounts = filings.reduce((acc, f) => {
            const status = f.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 4. Job Roles
        const jobRoles = filings.reduce((acc, f) => {
            const title = f.job_title || 'Unknown';
            acc[title] = (acc[title] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topRoles = Object.entries(jobRoles)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            medianSalary,
            salaryRange: { p25, p75 },
            avgProcessingTime,
            statusCounts,
            topRoles,
            total: filings.length
        };
    }, [filings]);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Salary Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Salary Insights</h3>
                </div>

                <div className="mt-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Median Salary</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        ${(stats.medianSalary / 1000).toFixed(0)}k
                    </p>

                    <div className="mt-4 relative h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        {/* Simple range visualization */}
                        <div className="absolute h-full bg-green-200 dark:bg-green-900/40 w-full" />
                        <div
                            className="absolute h-full bg-green-500 dark:bg-green-500"
                            style={{
                                left: '20%', // Simplified visualization
                                width: '60%'
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>${(stats.salaryRange.p25 / 1000).toFixed(0)}k (25th)</span>
                        <span>${(stats.salaryRange.p75 / 1000).toFixed(0)}k (75th)</span>
                    </div>
                </div>
            </div>

            {/* Processing Speed */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Processing Speed</h3>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Decision Time</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.avgProcessingTime < 1 ? "< 1" : stats.avgProcessingTime} <span className="text-sm font-normal text-gray-500">days</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        {Object.entries(stats.statusCounts).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status === 'Certified' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                    <span className="text-gray-600 dark:text-gray-300">{status}</span>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {Math.round((count / stats.total) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Job Roles */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Top Roles</h3>
                </div>

                <div className="space-y-4">
                    {stats.topRoles.map(([role, count], i) => (
                        <div key={role} className="flex items-center justify-between group">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={role}>
                                    {role}
                                </p>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full group-hover:bg-purple-400 transition-colors"
                                        style={{ width: `${(count / stats.topRoles[0][1]) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                                {count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
