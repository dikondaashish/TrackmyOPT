"use client";

import { JobApplication } from "@/lib/career/job-tracker/types";
import { ExternalLink, Calendar, MapPin, MoreHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { getRelativeDate } from "@/lib/career/job-tracker/filtering";
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                "group relative bg-white dark:bg-gray-800 rounded-lg p-4 transition-all duration-200 cursor-grab active:cursor-grabbing",
                "border border-gray-200 dark:border-gray-700",
                "hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900", // Subtle hover
                // Dragging state
                isDragging && "opacity-50 shadow-xl rotate-2 scale-105 ring-2 ring-blue-500 z-50",
                // Archived state
                application.is_archived && "opacity-50 grayscale"
            )}
        >
            <div className="flex gap-4">
                {/* Left: Boxed Logo */}
                <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg border border-gray-100 dark:border-gray-700 p-1 bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                        <CompanyLogo
                            companyName={application.company_name}
                            jobUrl={application.job_url}
                            size="sm"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-[15px] leading-tight truncate">
                        {application.role_title}
                    </h4>

                    <div className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-gray-400">
                        <span className="text-xs truncate max-w-[120px]">{application.company_name}</span>
                        {application.location && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div className="flex items-center gap-0.5 text-[11px] truncate">
                                    <MapPin className="w-3 h-3" />
                                    {application.location}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Top Right Actions (Hidden by default, show on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Footer Meta */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    Added {getRelativeDate(application.applied_at || application.created_at)}
                </span>

                {application.sponsor_h1b && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        H-1B
                    </span>
                )}
            </div>
        </div>
    );
}
