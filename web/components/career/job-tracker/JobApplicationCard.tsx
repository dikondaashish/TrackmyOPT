"use client";

import { JobApplication } from "@/lib/career/job-tracker/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import { MapPin, Bell, ExternalLink, MoreHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface JobApplicationCardProps {
    application: JobApplication;
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

    // Follow-up logic
    const today = new Date().toISOString().split('T')[0];
    const isFollowupDue = application.next_follow_up_at && application.next_follow_up_at <= today;
    const isFollowupSoon = application.next_follow_up_at && application.next_follow_up_at > today;
    // You could check if it's within 2 days for "Soon"

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                "group relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                isDragging ? "opacity-50" : "opacity-100"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-4">
                    {application.company_name}
                </h3>
                {application.job_url && (
                    <a
                        href={application.job_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">
                {application.role_title}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-auto">
                {application.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                        <MapPin className="w-3 h-3" />
                        {application.location}
                    </span>
                )}

                {isFollowupDue && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                        <Bell className="w-3 h-3 fill-current" />
                        Due
                    </span>
                )}
            </div>

            {application.applied_at && (
                <div className="mt-3 text-[10px] text-gray-400 text-right">
                    Applied {formatDistanceToNow(parseISO(application.applied_at), { addSuffix: true })}
                </div>
            )}
        </div>
    );
}
