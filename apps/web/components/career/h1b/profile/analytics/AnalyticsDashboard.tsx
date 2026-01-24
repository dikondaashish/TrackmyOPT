"use client";

import { useMemo } from "react";
import { Database } from "@/types/supabase";
import { TrendingUp, DollarSign, Clock, PieChart, Briefcase, Scale } from "lucide-react";

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

        // 5. Legal Intelligence
        const lawFirms = filings.reduce((acc, f) => {
            // Using lawfirm_name as primary based on type definition
            const firm = f.lawfirm_name || 'In-House/Other';
            acc[firm] = (acc[firm] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topLawFirms = Object.entries(lawFirms)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // 6. Geographic Presence
        const cities = filings.reduce((acc, f) => {
            if (f.worksite_city && f.worksite_state) {
                const loc = `${f.worksite_city}, ${f.worksite_state}`;
                acc[loc] = (acc[loc] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topLocations = Object.entries(cities)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            medianSalary,
            salaryRange: { p25, p75 },
            avgProcessingTime,
            statusCounts,
            topRoles,
            topLawFirms,
            topLocations,
            total: filings.length
        };
    }, [filings]);

    if (!stats) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Row: Core Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ... existing Salary, Processing, Roles cards ... */}
                {/* Refactored slightly to fit new layout structure if needed, but keeping simple for now */}
                {/* Salary Insights */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Salary Insights</h3>
                    </div>

                    <div className="mt-auto space-y-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Median Salary</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                                ${(stats.medianSalary / 1000).toFixed(0)}k
                            </p>
                        </div>

                        {/* Custom Range Visualization */}
                        <div className="relative pt-6 pb-2">
                            {/* Track */}
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden" />

                            {/* Range Bar (25th to 75th) - Centered roughly for visual effect since we don't have max */}
                            {/* Ideally dynamic width based on range spread relative to median, but static visual for now is safer without max salary */}
                            <div className="absolute top-6 h-2 bg-emerald-500/30 dark:bg-emerald-500/20 rounded-full left-[15%] right-[15%]" />
                            <div className="absolute top-6 h-2 bg-emerald-500 rounded-full left-[35%] right-[35%]" />

                            {/* Markers */}
                            {/* Median Marker */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-1 h-3 bg-emerald-600 dark:bg-emerald-400 mb-9" /> {/* Tick */}
                            </div>

                            {/* Labels */}
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <div className="text-left">
                                    <span className="block font-bold text-gray-900 dark:text-white">${(stats.salaryRange.p25 / 1000).toFixed(0)}k</span>
                                    <span className="text-xs text-gray-500">25th Percentile</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-900 dark:text-white">${(stats.salaryRange.p75 / 1000).toFixed(0)}k</span>
                                    <span className="text-xs text-gray-500">75th Percentile</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Processing Speed */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Processing Speed</h3>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 items-center">
                        {/* Speed Metric */}
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Time</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                                {stats.avgProcessingTime < 1 ? "< 1" : stats.avgProcessingTime}
                                <span className="text-lg font-medium text-gray-500 ml-1">days</span>
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium bg-emerald-50 dark:bg-emerald-900/20 inline-block px-2 py-1 rounded">
                                Fast Processing
                            </p>
                        </div>

                        {/* Status Donut Chart */}
                        <div className="relative flex flex-col items-center justify-center">
                            {/* CSS Conic Gradient Donut */}
                            {(() => {
                                const certified = stats.statusCounts['Certified'] || 0;
                                const certifiedPct = Math.round((certified / stats.total) * 100);
                                const withdrawn = stats.statusCounts['Withdrawn'] || 0;
                                const withdrawnPct = Math.round((withdrawn / stats.total) * 100);
                                const denied = (stats.statusCounts['Denied'] || 0) + (stats.statusCounts['Certified - Withdrawn'] || 0);

                                // Colors: Certified=Emerald, Withdrawn=Gray, Denied=Red
                                const gradient = `conic-gradient(
                                    #10B981 0% ${certifiedPct}%, 
                                    #9CA3AF ${certifiedPct}% ${certifiedPct + withdrawnPct}%,
                                    #EF4444 ${certifiedPct + withdrawnPct}% 100%
                                )`;

                                return (
                                    <div className="relative w-24 h-24 rounded-full" style={{ background: gradient }}>
                                        {/* Inner White Circle making it a donut */}
                                        <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="block text-xl font-bold text-gray-900 dark:text-white">{certifiedPct}%</span>
                                                <span className="text-[10px] text-gray-500 uppercase">Success</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Legend */}
                            <div className="flex gap-3 justify-center mt-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] text-gray-500">Certified</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    <span className="text-[10px] text-gray-500">Other</span>
                                </div>
                            </div>
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
                        {stats.topRoles.map(([role, count]: [string, number], i: number) => (
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

            {/* Bottom Row: Advanced Insights (Legal & Geo) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geographic Presence */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Worksite Hotspots</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {stats.topLocations.map(([loc, count], i) => (
                            <div key={loc} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-gray-500 uppercase font-medium">Location #{i + 1}</p>
                                <p className="font-semibold text-gray-900 dark:text-white truncate" title={loc}>{loc}</p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{count} filings</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legal Partners */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg">
                            <Scale className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Legal Representation</h3>
                    </div>
                    <div className="space-y-4">
                        {stats.topLawFirms.map(([firm, count], i) => (
                            <div key={firm} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl transition-colors">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 pr-4">{firm}</span>
                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-lg font-semibold">
                                    {count} cases
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

