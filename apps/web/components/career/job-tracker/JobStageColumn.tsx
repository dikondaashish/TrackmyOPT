"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { JobApplication, JobStage, KanbanColumn } from "@/lib/career/job-tracker/types";
import { JobApplicationCard } from "./JobApplicationCard";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface JobStageColumnProps {
    column: KanbanColumn;
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
    onDelete?: () => void;
}

export function JobStageColumn({ column, applications, onCardClick, onDelete }: JobStageColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete();
        }
    };

    return (
        <div className="flex flex-col h-full min-w-[85vw] w-[85vw] md:min-w-[320px] md:w-[320px] snap-start">
            {/* Clean Header */}
            <div className="flex items-center justify-between p-4 rounded-t-xl bg-slate-50 dark:bg-slate-900 border border-b-0 border-slate-200 dark:border-slate-800 group">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-[15px]">
                        {column.title}
                    </h3>
                    {onDelete && (
                        <button
                            onClick={handleDeleteClick}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete Column"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {applications.length} Job{applications.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-3 rounded-b-xl transition-all duration-200 overflow-y-auto scrollbar-thin",
                    "bg-dot-pattern bg-slate-50/50 dark:bg-slate-900/50", // Light dot background
                    "border border-slate-200 dark:border-slate-800",
                    "min-h-[75vh] max-h-[calc(100vh-190px)]",
                    // Drop target highlight
                    isOver && "ring-2 ring-blue-400/50 bg-blue-50/50 dark:bg-blue-900/20"
                )}
            >
                <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <JobApplicationCard
                                key={app.id}
                                application={app as any}
                                onClick={() => onCardClick(app)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
