"use client";

import { useMemo } from "react";
import { JobApplication } from "@/lib/career/job-tracker/types";
import { isToday, parseISO, differenceInHours, differenceInDays, addDays } from "date-fns";
import { Bell, Video, AlertCircle, Check, Calendar, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "./CompanyLogo";

interface TodaysTasksWidgetProps {
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
    onMarkFollowupDone?: (appId: string) => void;
}

interface TaskItem {
    id: string;
    type: "followup" | "interview" | "stale";
    title: string;
    subtitle: string;
    application: JobApplication;
    priority: "high" | "medium" | "low";
}

export function TodaysTasksWidget({ applications, onCardClick, onMarkFollowupDone }: TodaysTasksWidgetProps) {
    const tasks = useMemo(() => {
        const now = new Date();
        const taskList: TaskItem[] = [];

        applications.forEach(app => {
            // Follow-ups due today or overdue
            if (app.next_follow_up_at) {
                const followupDate = parseISO(app.next_follow_up_at);
                const isOverdue = followupDate < now && !isToday(followupDate);
                const isDueToday = isToday(followupDate);

                if (isOverdue || isDueToday) {
                    taskList.push({
                        id: `followup-${app.id}`,
                        type: "followup",
                        title: isOverdue ? "Overdue follow-up" : "Follow-up due today",
                        subtitle: app.company_name,
                        application: app,
                        priority: isOverdue ? "high" : "medium"
                    });
                }
            }

            // Interviews in next 48 hours
            const appInterviews = (app as any).job_interviews || (app as any).interviews || [];
            if (Array.isArray(appInterviews)) {
                appInterviews.forEach((interview: any) => {
                    if (interview.date) {
                        const interviewDate = parseISO(interview.date);
                        const hoursUntil = differenceInHours(interviewDate, now);

                        if (hoursUntil >= 0 && hoursUntil <= 48) {
                            taskList.push({
                                id: `interview-${app.id}-${interview.date}`,
                                type: "interview",
                                title: interview.round_name || "Interview",
                                subtitle: `${app.company_name}${hoursUntil <= 24 ? " (Tomorrow)" : ""}`,
                                application: app,
                                priority: hoursUntil <= 24 ? "high" : "medium"
                            });
                        }
                    }
                });
            }

            // Stale applications (applied 7+ days ago with no follow-up scheduled)
            if (app.applied_at && !app.next_follow_up_at && app.status !== "Rejected" && app.status !== "Offer") {
                const appliedDate = parseISO(app.applied_at);
                const daysSinceApplied = differenceInDays(now, appliedDate);

                if (daysSinceApplied >= 7) {
                    taskList.push({
                        id: `stale-${app.id}`,
                        type: "stale",
                        title: "No follow-up scheduled",
                        subtitle: `${app.company_name} • Applied ${daysSinceApplied} days ago`,
                        application: app,
                        priority: "low"
                    });
                }
            }
        });

        // Sort by priority
        return taskList.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [applications]);

    const getTaskIcon = (type: TaskItem["type"]) => {
        switch (type) {
            case "followup":
                return Bell;
            case "interview":
                return Video;
            case "stale":
                return AlertCircle;
        }
    };

    const getTaskColor = (type: TaskItem["type"], priority: TaskItem["priority"]) => {
        if (priority === "high") {
            return "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400";
        }
        switch (type) {
            case "followup":
                return "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400";
            case "interview":
                return "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400";
            case "stale":
                return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
        }
    };

    if (tasks.length === 0) {
        return (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <PartyPopper className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">
                            You&apos;re all caught up today!
                        </h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            No pending tasks. Keep applying and following up!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Task List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-[300px] overflow-y-auto">
                {tasks.slice(0, 5).map(task => {
                    const Icon = getTaskIcon(task.type);
                    const colorClass = getTaskColor(task.type, task.priority);

                    return (
                        <div
                            key={task.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                            {/* Icon */}
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                                <Icon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => onCardClick(task.application)}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {task.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {task.subtitle}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1">
                                {task.type === "followup" && onMarkFollowupDone && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMarkFollowupDone(task.application.id);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                        title="Mark as done"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More */}
            {tasks.length > 5 && (
                <div className="px-4 py-2 text-center border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{tasks.length - 5} more tasks
                    </span>
                </div>
            )}
        </div>
    );
}
