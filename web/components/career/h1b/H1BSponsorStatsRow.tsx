"use client";

import { Building2, TrendingUp, Bookmark, Calendar } from "lucide-react";

interface H1BSponsorStatsRowProps {
    totalSponsors: number;
    highSponsors: number;
    savedCount: number;
}

export function H1BSponsorStatsRow({ totalSponsors, highSponsors, savedCount }: H1BSponsorStatsRowProps) {
    const stats = [
        {
            icon: Building2,
            label: "Total Sponsors",
            value: `${totalSponsors.toLocaleString()}+`,
            gradient: "from-blue-500 to-indigo-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/30",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
            icon: TrendingUp,
            label: "High Sponsors",
            value: highSponsors.toLocaleString(),
            gradient: "from-emerald-500 to-teal-600",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
            borderColor: "border-emerald-200 dark:border-emerald-800",
        },
        {
            icon: Bookmark,
            label: "Saved Sponsors",
            value: savedCount.toString(),
            gradient: "from-purple-500 to-violet-600",
            bgColor: "bg-purple-50 dark:bg-purple-900/30",
            borderColor: "border-purple-200 dark:border-purple-800",
        },
        {
            icon: Calendar,
            label: "Updated",
            value: "Monthly",
            gradient: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-50 dark:bg-amber-900/30",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`relative overflow-hidden rounded-xl ${stat.bgColor} border ${stat.borderColor} p-4`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
