"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { JobApplication, KanbanColumn } from "@/lib/career/job-tracker/types";
import { JobApplicationCard } from "./JobApplicationCard";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface JobStageColumnProps {
    column: KanbanColumn;
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
    onDelete?: () => void;
    onArchiveApplication?: (id: string) => void;
    onDeleteApplication?: (id: string) => void | Promise<void>;
}

export function JobStageColumn({
    column,
    applications,
    onCardClick,
    onDelete,
    onArchiveApplication,
    onDeleteApplication,
}: JobStageColumnProps) {
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
            <div className="flex items-center justify-between px-4 py-3 rounded-t-xl bg-surface-strong border border-b-0 border-border group">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">
                        {column.title}
                    </h3>
                    {onDelete && (
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="min-h-11 min-w-11 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                            aria-label={`Delete ${column.title} column`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <span className="bg-card border border-border text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-md">
                    {applications.length} Job{applications.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-3 rounded-b-xl transition-all duration-200 overflow-y-auto scrollbar-thin",
                    "bg-surface-strong", // Lane background: white cards read as raised
                    "border border-t-0 border-border",
                    "min-h-[75vh] max-h-[calc(100vh-190px)]",
                    // Drop target highlight
                    isOver && "ring-2 ring-primary bg-primary-soft"
                )}
            >
                <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <JobApplicationCard
                                key={app.id}
                                application={app as any}
                                onClick={() => onCardClick(app)}
                                onArchive={onArchiveApplication}
                                onDelete={onDeleteApplication}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
