"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { JobApplication, JobStage, KanbanColumn } from "@/lib/career/job-tracker/types";
import { JobApplicationCard } from "./JobApplicationCard";
import { cn } from "@/lib/utils";

interface JobStageColumnProps {
    column: KanbanColumn;
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
}

// Empty state messages per column
const EMPTY_STATE_MESSAGES: Record<JobStage, { emoji: string; title: string; subtitle: string }> = {
    "Wishlist": {
        emoji: "💡",
        title: "No dream jobs yet",
        subtitle: "Add companies you're interested in"
    },
    "Applied": {
        emoji: "📝",
        title: "No applications submitted",
        subtitle: "Start applying to roles in your Wishlist"
    },
    "Recruiter Screen": {
        emoji: "📞",
        title: "No recruiter calls",
        subtitle: "Applications here move forward in the process"
    },
    "Interviewing": {
        emoji: "🎯",
        title: "No active interviews",
        subtitle: "You'll move applications here when interviews are scheduled"
    },
    "Final Round": {
        emoji: "🏆",
        title: "No final rounds yet",
        subtitle: "Almost there! Final interviews appear here"
    },
    "Offer": {
        emoji: "🎉",
        title: "No offers yet",
        subtitle: "Keep applying—your offer is coming!"
    },
    "Rejected": {
        emoji: "✅",
        title: "No rejections",
        subtitle: "That's good! Every application is still in progress"
    }
};

export function JobStageColumn({ column, applications, onCardClick }: JobStageColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const emptyState = EMPTY_STATE_MESSAGES[column.id];

    return (
        <div className="flex flex-col h-full min-w-[280px] sm:w-[300px] snap-start">
            {/* Header */}
            <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${column.color}`}>
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {applications.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-2 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 transition-all",
                    "min-h-[150px]",
                    isOver && "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20"
                )}
            >
                <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {applications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                <span className="text-2xl mb-2">{emptyState.emoji}</span>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {emptyState.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
