"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { JobApplication, JobStage, KanbanColumn } from "@/lib/career/job-tracker/types";
import { JobApplicationCard } from "./JobApplicationCard";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface JobStageColumnProps {
    column: KanbanColumn;
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
}

// Column gradient colors for premium look
const COLUMN_GRADIENTS: Record<JobStage, { gradient: string; iconBg: string; textColor: string }> = {
    "Wishlist": {
        gradient: "from-violet-500 to-purple-600",
        iconBg: "bg-violet-400/20",
        textColor: "text-white"
    },
    "Applied": {
        gradient: "from-blue-500 to-indigo-600",
        iconBg: "bg-blue-400/20",
        textColor: "text-white"
    },
    "Recruiter Screen": {
        gradient: "from-cyan-500 to-teal-600",
        iconBg: "bg-cyan-400/20",
        textColor: "text-white"
    },
    "Interviewing": {
        gradient: "from-amber-500 to-orange-600",
        iconBg: "bg-amber-400/20",
        textColor: "text-white"
    },
    "Final Round": {
        gradient: "from-rose-500 to-pink-600",
        iconBg: "bg-rose-400/20",
        textColor: "text-white"
    },
    "Offer": {
        gradient: "from-emerald-500 to-green-600",
        iconBg: "bg-emerald-400/20",
        textColor: "text-white"
    },
    "Rejected": {
        gradient: "from-slate-500 to-gray-600",
        iconBg: "bg-slate-400/20",
        textColor: "text-white"
    }
};

// Empty state messages per column
const EMPTY_STATE_MESSAGES: Record<JobStage, { icon: string; title: string; subtitle: string }> = {
    "Wishlist": {
        icon: "✨",
        title: "Start your dream list",
        subtitle: "Add companies you'd love to work at"
    },
    "Applied": {
        icon: "🚀",
        title: "Ready to apply?",
        subtitle: "Drag jobs here when you submit applications"
    },
    "Recruiter Screen": {
        icon: "📞",
        title: "Waiting for callbacks",
        subtitle: "Recruiter calls will appear here"
    },
    "Interviewing": {
        icon: "💼",
        title: "Interview pipeline",
        subtitle: "Track your active interviews"
    },
    "Final Round": {
        icon: "🎯",
        title: "Almost there!",
        subtitle: "Final stage interviews go here"
    },
    "Offer": {
        icon: "🎉",
        title: "Celebrate wins",
        subtitle: "Your offers will appear here"
    },
    "Rejected": {
        icon: "📊",
        title: "Track for insights",
        subtitle: "Learn from every application"
    }
};

export function JobStageColumn({ column, applications, onCardClick }: JobStageColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const emptyState = EMPTY_STATE_MESSAGES[column.id];
    const columnStyle = COLUMN_GRADIENTS[column.id];

    return (
        <div className="flex flex-col h-full min-w-[300px] w-[300px] snap-start">
            {/* Premium Header with Gradient */}
            <div className={cn(
                "flex items-center justify-between p-3.5 rounded-t-xl bg-gradient-to-r shadow-sm",
                columnStyle.gradient
            )}>
                <div className="flex items-center gap-2.5">
                    <h3 className={cn("font-semibold text-sm tracking-wide", columnStyle.textColor)}>
                        {column.title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full",
                        "bg-white/20 backdrop-blur-sm",
                        columnStyle.textColor
                    )}>
                        {applications.length}
                    </span>
                </div>
            </div>

            {/* Droppable Area with Glass Effect */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-3 rounded-b-xl transition-all duration-200 overflow-y-auto",
                    "bg-gradient-to-b from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-950/30",
                    "border border-t-0 border-gray-200/60 dark:border-gray-800/60",
                    "min-h-[200px] max-h-[calc(100vh-320px)]",
                    // Drop target highlight
                    isOver && "ring-2 ring-emerald-400 dark:ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                )}
            >
                <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {applications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                {/* Empty State Icon with Background */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-4 shadow-inner">
                                    <span className="text-2xl">{emptyState.icon}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                    {emptyState.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-[200px]">
                                    {emptyState.subtitle}
                                </p>
                            </div>
                        ) : (
                            applications.map((app) => (
                                <JobApplicationCard
                                    key={app.id}
                                    application={app as any}
                                    onClick={() => onCardClick(app)}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
