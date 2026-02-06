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
            label: "Total Applications",
            value: totalApps,
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            label: "Active Interviews",
            value: activeInterviews,
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            label: "Follow-ups Due",
            value: followupsDue,
            icon: Bell,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            label: "Offers Received",
            value: offers,
            icon: Trophy,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
            {stats.map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center gap-3 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors w-full min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${stat.bg}`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] leading-snug text-gray-500 dark:text-gray-400 font-medium mb-0.5 whitespace-pre-wrap break-words">
                            {stat.label.replace(' ', '\n')}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white leading-none truncate">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
