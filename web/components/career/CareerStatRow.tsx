"use client";

import { Briefcase, Users, Bell } from "lucide-react";

interface CareerStatRowProps {
    applicationsCount: number;
    interviewsCount: number;
    followUpsDueCount: number;
}

export function CareerStatRow({
    applicationsCount,
    interviewsCount,
    followUpsDueCount,
}: CareerStatRowProps) {
    const stats = [
        {
            icon: Briefcase,
            label: "Applications",
            value: applicationsCount,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            icon: Users,
            label: "Interviews",
            value: interviewsCount,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        },
        {
            icon: Bell,
            label: "Follow-ups Due",
            value: followUpsDueCount,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-100 dark:bg-amber-900/30",
        },
    ];

    return (
        <div className="flex flex-wrap gap-4 sm:gap-6">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border/50 shadow-sm"
                >
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
