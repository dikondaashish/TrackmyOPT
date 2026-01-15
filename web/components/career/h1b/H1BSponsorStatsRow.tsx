"use client";

import { Building2, TrendingUp, Bookmark, Calendar } from "lucide-react";

interface H1BSponsorStatsRowProps {
    totalSponsors: number;
    highSponsors: number;
    savedSponsors: number;
}

export function H1BSponsorStatsRow({ totalSponsors, highSponsors, savedSponsors }: H1BSponsorStatsRowProps) {
    const stats = [
        {
            label: "Total Sponsors",
            value: totalSponsors > 1000 ? `${(totalSponsors / 1000).toFixed(0)}K+` : totalSponsors.toLocaleString(),
            icon: Building2,
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            iconColor: "text-blue-500",
            borderColor: "border-blue-100 dark:border-blue-800/30"
        },
        {
            label: "High Sponsors",
            value: highSponsors.toLocaleString(),
            icon: TrendingUp,
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            iconColor: "text-amber-500",
            borderColor: "border-amber-100 dark:border-amber-800/30"
        },
        {
            label: "Saved Sponsors",
            value: savedSponsors.toLocaleString(),
            icon: Bookmark,
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            iconColor: "text-purple-500",
            borderColor: "border-purple-100 dark:border-purple-800/30"
        },
        {
            label: "Updated",
            value: "Monthly",
            icon: Calendar,
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
            iconColor: "text-yellow-600",
            borderColor: "border-yellow-100 dark:border-yellow-800/30"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className={`rounded-xl ${stat.bgColor} border ${stat.borderColor} p-4 flex items-center gap-3 transition-all hover:scale-[1.02]`}
                >
                    <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
