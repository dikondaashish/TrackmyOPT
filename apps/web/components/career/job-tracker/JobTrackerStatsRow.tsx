"use client";

import { JobApplication } from "@/lib/career/job-tracker/types";
import { FileText, Users, Bell, Trophy } from "lucide-react";
import { format } from "date-fns";
import { useClientDate } from "@/hooks/useClientDate";

interface JobTrackerStatsRowProps {
    applications: JobApplication[];
}

export function JobTrackerStatsRow({ applications }: JobTrackerStatsRowProps) {
    const clientDate = useClientDate();
    const totalApps = applications.length;
    const activeInterviews = applications.filter(a => ["Recruiter Screen", "Interviewing", "Final Round"].includes(a.status)).length;
    const offers = applications.filter(a => a.status === "Offer").length;

    // Use the visitor's calendar day after hydration, including date-only follow-ups.
    const startOfToday = clientDate ? format(new Date(), "yyyy-MM-dd") : null;
    const followupsDue = startOfToday
        ? applications.filter(a => a.next_follow_up_at && a.next_follow_up_at <= startOfToday).length
        : "…";

    const stats = [
        {
            label: "Applications",
            value: totalApps,
            icon: FileText,
            color: "text-blue-600 dark:text-blue-300",
            bg: "bg-blue-50 dark:bg-blue-950"
        },
        {
            label: "Interviews",
            value: activeInterviews,
            icon: Users,
            color: "text-violet-600 dark:text-violet-300",
            bg: "bg-violet-50 dark:bg-violet-950"
        },
        {
            label: "Follow-ups due",
            value: followupsDue,
            icon: Bell,
            color: "text-amber-600 dark:text-amber-300",
            bg: "bg-amber-50 dark:bg-amber-950"
        },
        {
            label: "Offers",
            value: offers,
            icon: Trophy,
            color: "text-emerald-600 dark:text-emerald-300",
            bg: "bg-emerald-50 dark:bg-emerald-950"
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Application summary">
            {stats.map((stat) => (
                <div key={stat.label} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 shadow-card">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                        <stat.icon className={`size-4 ${stat.color}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-semibold leading-none text-foreground">{stat.value}</p>
                        <p className="mt-1 whitespace-nowrap text-[11px] leading-none text-muted-foreground">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
