"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle, AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobFollowup, JobApplication } from "@/lib/career/job-tracker/types";
import { categorizeFollowups, getRelativeDate } from "@/lib/career/job-tracker/filtering";
import { markFollowupDone } from "@/app/dashboard/career/job-tracker/actions";

interface FollowupWithApp extends JobFollowup {
    company_name?: string;
    role_title?: string;
    application_id?: string;
}

interface FollowupsDueWidgetProps {
    applications: (JobApplication & { job_followups?: JobFollowup[] })[];
    onCardClick?: (app: JobApplication) => void;
}

export function FollowupsDueWidget({ applications, onCardClick }: FollowupsDueWidgetProps) {
    const router = useRouter();

    // Extract all pending followups with application info
    const allFollowups = useMemo(() => {
        const followups: FollowupWithApp[] = [];

        applications.forEach(app => {
            if (app.job_followups) {
                app.job_followups.forEach(fp => {
                    if (fp.status === "pending") {
                        followups.push({
                            ...fp,
                            company_name: app.company_name,
                            role_title: app.role_title,
                            application_id: app.id
                        });
                    }
                });
            }
        });

        // Sort by date (earliest first)
        return followups.sort((a, b) =>
            new Date(a.followup_at).getTime() - new Date(b.followup_at).getTime()
        );
    }, [applications]);

    // Categorize
    const { dueToday, dueThisWeek, overdue } = useMemo(() => {
        return categorizeFollowups(allFollowups);
    }, [allFollowups]);

    // Get next 5 followups (prioritize overdue, then today, then week)
    const upcomingFollowups = useMemo(() => {
        return [...overdue, ...dueToday, ...dueThisWeek].slice(0, 5) as FollowupWithApp[];
    }, [overdue, dueToday, dueThisWeek]);

    const handleMarkDone = async (followupId: string) => {
        await markFollowupDone(followupId);
        router.refresh();
    };

    const handleItemClick = (applicationId: string) => {
        const app = applications.find(a => a.id === applicationId);
        if (app && onCardClick) {
            onCardClick(app);
        }
    };

    const totalPending = overdue.length + dueToday.length + dueThisWeek.length;

    if (totalPending === 0) {
        return (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Follow-ups</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    🎉 No follow-ups due. You're on track!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Follow-ups Due</h3>
            </div>

            {/* Stats Row */}
            <div className="flex gap-4 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overdue:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{overdue.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Today:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{dueToday.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">This Week:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{dueThisWeek.length}</span>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {upcomingFollowups.map(fp => {
                    const isOverdue = overdue.some(o => o.id === fp.id);
                    const isToday = dueToday.some(t => t.id === fp.id);

                    return (
                        <div
                            key={fp.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                            onClick={() => fp.application_id && handleItemClick(fp.application_id)}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-full ${isOverdue
                                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                        : isToday
                                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"
                                    }`}>
                                    {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                        {fp.company_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {fp.role_title}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-medium ${isOverdue
                                            ? "text-red-600 dark:text-red-400"
                                            : isToday
                                                ? "text-orange-600 dark:text-orange-400"
                                                : "text-gray-600 dark:text-gray-400"
                                        }`}>
                                        {getRelativeDate(fp.followup_at)}
                                    </p>
                                    <p className="text-xs text-gray-400">{fp.followup_type}</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="ml-3 text-xs shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkDone(fp.id);
                                }}
                            >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Done
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
