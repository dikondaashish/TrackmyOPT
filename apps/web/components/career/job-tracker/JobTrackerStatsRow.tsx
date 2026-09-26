"use client";

import { JobApplication } from "@/lib/career/job-tracker/types";
import { FileText, Users, Bell, Trophy } from "lucide-react";

interface JobTrackerStatsRowProps {
    applications: JobApplication[];
}

export function JobTrackerStatsRow({ applications }: JobTrackerStatsRowProps) {
    const totalApps = applications.length;
    const activeInterviews = applications.filter(a => ["Recruiter Screen", "Interviewing", "Final Round"].includes(a.status)).length;
    const offers = applications.filter(a => a.status === "Offer").length;

    // Check next_follow_up_at to see created logic? Or just simple count from applications? 
    // The requirement says "Follow-ups Due". 
    // We can filter applications having next_follow_up_at <= today
    const startOfToday = new Date().toISOString().split('T')[0];
    const followupsDue = applications.filter(a => a.next_follow_up_at && a.next_follow_up_at <= startOfToday).length;

    const stats = [
        {
            label: "Applications",
            value: totalApps,
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            label: "Interviews",
            value: activeInterviews,
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            label: "Follow-ups due",
            value: followupsDue,
            icon: Bell,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            label: "Offers",
            value: offers,
            icon: Trophy,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Application summary">
            {stats.map((stat) => (
                <div key={stat.label} className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                        <stat.icon className={`size-4 ${stat.color}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-semibold leading-none text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="mt-1 whitespace-nowrap text-[11px] leading-none text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
