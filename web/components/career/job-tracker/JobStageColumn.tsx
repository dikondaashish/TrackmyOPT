"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { JobApplication, KanbanColumn } from "@/lib/career/job-tracker/types";
import { JobApplicationCard } from "./JobApplicationCard";
import { cn } from "@/lib/utils";

interface JobStageColumnProps {
    column: KanbanColumn;
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
}

export function JobStageColumn({ column, applications, onCardClick }: JobStageColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <div className="flex flex-col h-full min-w-[280px] sm:w-[300px]">
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
                    "flex-1 p-2 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors",
                    "min-h-[150px]"
                )}
            >
                <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <JobApplicationCard
                                key={app.id}
                                application={app}
                                onClick={() => onCardClick(app)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
