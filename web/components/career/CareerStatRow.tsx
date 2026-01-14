"use client";

import { FileText, Calendar, AlertCircle } from "lucide-react";

interface CareerStatRowProps {
    applicationsCount: number;
    interviewsCount: number;
    followUpsDueCount: number;
}

export function CareerStatRow({
    applicationsCount,
    interviewsCount,
    followUpsDueCount
}: CareerStatRowProps) {
    const stats = [
        {
            label: "Applications",
            count: applicationsCount,
            icon: FileText,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30"
        },
        {
            label: "Interviews",
            count: interviewsCount,
            icon: Calendar,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30"
        },
        {
            label: "Follow-ups Due",
            count: followUpsDueCount,
            icon: AlertCircle,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/30"
        },
    ];

    return (
        <div className="flex flex-wrap gap-4 sm:gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border"
                >
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
