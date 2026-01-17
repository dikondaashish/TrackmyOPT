"use client";

import { JobApplication } from "@/lib/career/job-tracker/types";
import { MapPin, ExternalLink, Calendar, AlertCircle, Bell, Award } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { getFollowupBadgeInfo, getRelativeDate } from "@/lib/career/job-tracker/filtering";
import { CompanyLogo } from "./CompanyLogo";

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

    const badgeStyles = {
        overdue: {
            bg: "bg-gradient-to-r from-red-500 to-rose-600",
            text: "text-white",
            shadow: "shadow-red-200 dark:shadow-red-900/30"
        },
        today: {
            bg: "bg-gradient-to-r from-amber-500 to-orange-600",
            text: "text-white",
            shadow: "shadow-amber-200 dark:shadow-amber-900/30"
        },
        soon: {
            bg: "bg-gradient-to-r from-yellow-400 to-amber-500",
            text: "text-white",
            shadow: "shadow-yellow-200 dark:shadow-yellow-900/30"
        },
        none: { bg: "", text: "", shadow: "" }
    };

    // Generate company initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate consistent color based on company name
    const getAvatarColor = (name: string) => {
        const colors = [
            "from-violet-500 to-purple-600",
            "from-blue-500 to-indigo-600",
            "from-cyan-500 to-teal-600",
            "from-emerald-500 to-green-600",
            "from-rose-500 to-pink-600",
            "from-amber-500 to-orange-600",
            "from-slate-500 to-gray-600",
        ];
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                "group relative bg-white dark:bg-gray-800/90 rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing",
                // Premium shadow and border
                "shadow-sm hover:shadow-lg",
                "border border-gray-100 dark:border-gray-700/50",
                "hover:border-gray-200 dark:hover:border-gray-600",
                // Hover lift effect
                "hover:-translate-y-0.5",
                // Dragging state
                isDragging && "opacity-60 shadow-2xl rotate-2 scale-105",
                // Archived state
                application.is_archived && "opacity-50 grayscale"
            )}
        >
            {/* Follow-up Badge - Floating */}
            {followupBadge && followupBadge.variant !== "none" && (
                <div className={cn(
                    "absolute -top-2.5 -right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1",
                    badgeStyles[followupBadge.variant].bg,
                    badgeStyles[followupBadge.variant].text,
                    badgeStyles[followupBadge.variant].shadow
                )}>
                    {followupBadge.variant === "overdue" && <AlertCircle className="w-3 h-3" />}
                    {followupBadge.text}
                </div>
            )}

            {/* Card Content */}
            <div className="p-4">
                {/* Header Row: Avatar + Company Info */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Company Logo */}
                    <CompanyLogo
                        companyName={application.company_name}
                        jobUrl={application.job_url}
                        size="md"
                    />

                    {/* Company & Role */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-[15px] leading-tight">
                                {application.company_name}
                            </h3>
                            {/* H-1B Badge */}
                            {application.sponsor_h1b && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-semibold uppercase tracking-wide">
                                    <Award className="w-2.5 h-2.5" />
                                    H-1B
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate leading-tight">
                            {application.role_title}
                        </p>
                    </div>

                    {/* External Link */}
                    {application.job_url && (
                        <a
                            href={application.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open job posting"
                            className="text-gray-300 hover:text-blue-500 dark:text-gray-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>

                {/* Location Tag */}
                {application.location && (
                    <div className="mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3 h-3" />
                            {application.location}
                        </span>
                    </div>
                )}

                {/* Footer: Dates */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    {/* Applied Date */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {application.applied_at
                                ? `Applied ${getRelativeDate(application.applied_at)}`
                                : "Not applied yet"
                            }
                        </span>
                    </div>

                    {/* Follow-up Date */}
                    {application.next_follow_up_at && (
                        <div className={cn(
                            "flex items-center gap-1 text-[11px] font-medium",
                            followupBadge?.variant === "overdue" && "text-red-500 dark:text-red-400",
                            followupBadge?.variant === "today" && "text-amber-600 dark:text-amber-400",
                            followupBadge?.variant === "soon" && "text-yellow-600 dark:text-yellow-400",
                            followupBadge?.variant === "none" && "text-gray-400"
                        )}>
                            <Bell className="w-3 h-3" />
                            <span>{getRelativeDate(application.next_follow_up_at)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
