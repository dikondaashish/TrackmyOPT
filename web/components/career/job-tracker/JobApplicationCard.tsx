"use client";

import { JobApplication } from "@/lib/career/job-tracker/types";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { MapPin, Bell, ExternalLink, Calendar, AlertCircle, Clock, Award } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { getFollowupBadgeInfo, getRelativeDate } from "@/lib/career/job-tracker/filtering";

interface JobApplicationCardProps {
    application: JobApplication & {
        sponsor_h1b?: boolean;
        is_archived?: boolean;
    };
    onClick: () => void;
}

export function JobApplicationCard({ application, onClick }: JobApplicationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: application.id,
        data: {
            type: "JobCard",
            application
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Follow-up badge logic
    const followupBadge = application.next_follow_up_at
        ? getFollowupBadgeInfo(application.next_follow_up_at)
        : null;

    const badgeColors = {
        overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
        today: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        soon: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        none: ""
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                "group relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50 shadow-lg rotate-2",
                application.is_archived && "opacity-60"
            )}
        >
            {/* Follow-up Badge - Top Right */}
            {followupBadge && followupBadge.variant !== "none" && (
                <div className={cn(
                    "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                    badgeColors[followupBadge.variant]
                )}>
                    {followupBadge.variant === "overdue" && <AlertCircle className="w-3 h-3 inline mr-0.5" />}
                    {followupBadge.text}
                </div>
            )}

            {/* Header: Company + Job Link */}
            <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-4 text-[15px]">
                    {application.company_name}
                </h3>
                <div className="flex items-center gap-1">
                    {application.sponsor_h1b && (
                        <span className="text-emerald-500" title="Sponsors H-1B">
                            <Award className="w-3.5 h-3.5" />
                        </span>
                    )}
                    {application.job_url && (
                        <a
                            href={application.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open job posting in new tab"
                            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>
            </div>

            {/* Role Title */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
                {application.role_title}
            </p>

            {/* Location & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {application.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3" />
                        {application.location}
                    </span>
                )}
            </div>

            {/* Dates Section */}
            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                {application.applied_at && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Applied {getRelativeDate(application.applied_at)}</span>
                    </div>
                )}
                {application.next_follow_up_at && (
                    <div className={cn(
                        "flex items-center gap-1.5 text-[11px]",
                        followupBadge?.variant === "overdue" && "text-red-500 dark:text-red-400",
                        followupBadge?.variant === "today" && "text-orange-500 dark:text-orange-400",
                        followupBadge?.variant === "soon" && "text-yellow-600 dark:text-yellow-400",
                        followupBadge?.variant === "none" && "text-gray-400"
                    )}>
                        <Bell className="w-3 h-3" />
                        <span>Follow-up: {getRelativeDate(application.next_follow_up_at)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
