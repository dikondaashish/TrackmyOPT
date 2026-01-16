"use client";

import { useState, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { JobApplication, JobStage } from "@/lib/career/job-tracker/types";
import { JOB_STAGES, KANBAN_COLUMNS } from "@/lib/career/job-tracker/constants";
import { JobStageColumn } from "./JobStageColumn";
import { JobApplicationCard } from "./JobApplicationCard";
import { JobTrackerStatsRow } from "./JobTrackerStatsRow";
import { AddApplicationModal } from "./AddApplicationModal";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { updateApplicationStatus } from "@/app/dashboard/career/job-tracker/actions";

interface JobTrackerBoardProps {
    initialApplications: any[]; // Using any to include joined interviews/followups
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function JobTrackerBoard({ initialApplications }: JobTrackerBoardProps) {
    const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require slight movement to prevent accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Derived columns
    const columns = useMemo(() => {
        const cols = new Map<JobStage, JobApplication[]>();
        JOB_STAGES.forEach(stage => cols.set(stage, []));

        applications.forEach(app => {
            cols.get(app.status)?.push(app);
        });

        return cols;
    }, [applications]);

    // Drag Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Find containers
        const activeId = active.id;
        const overId = over.id;

        // Find the application object
        const activeApp = applications.find(a => a.id === activeId);
        if (!activeApp) return;

        // If over a container (column) directly
        if (JOB_STAGES.includes(overId as JobStage)) {
            // We allow `DragEnd` to handle the final status change to avoid flickering
            // But for visual sorting, we might want to update local state here if sorting standard is strict
            // For simple Kanban, moving directly to container is enough in DragEnd usually.
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeAppId = active.id as string;
        const activeApp = applications.find(a => a.id === activeAppId);

        if (!activeApp) return;

        let newStatus: JobStage | null = null;

        // Case 1: Dropped on a Column
        if (JOB_STAGES.includes(over.id as JobStage)) {
            newStatus = over.id as JobStage;
        }
        // Case 2: Dropped on another Card
        else {
            const overApp = applications.find(a => a.id === over.id);
            if (overApp) {
                newStatus = overApp.status;
            }
        }

        if (newStatus && newStatus !== activeApp.status) {
            // Optimistic Update
            setApplications(prev => prev.map(a =>
                a.id === activeAppId ? { ...a, status: newStatus as JobStage } : a
            ));

            try {
                await updateApplicationStatus(activeAppId, newStatus);
            } catch (err) {
                // Revert on failure
                console.error("Failed to update status", err);
                setApplications(prev => prev.map(a =>
                    a.id === activeAppId ? { ...a, status: activeApp.status } : a
                ));
            }
        }
    };

    const activeApplication = activeId ? applications.find(a => a.id === activeId) : null;

    // Get joined data for drawer
    const getSelectedAppDetails = () => {
        if (!selectedApp) return { interviews: [], followups: [] };
        const fullApp = initialApplications.find(a => a.id === selectedApp.id);
        return {
            interviews: fullApp?.job_interviews || [],
            followups: fullApp?.job_followups || []
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <JobTrackerStatsRow applications={applications} />
                <div className="flex justify-end">
                    <AddApplicationModal />
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {/* Horizontal Scroll Container for Columns */}
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[200px]">
                        {KANBAN_COLUMNS.map(col => (
                            <JobStageColumn
                                key={col.id}
                                column={col}
                                applications={columns.get(col.id) || []}
                                onCardClick={setSelectedApp}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeApplication ? (
                        <div className="transform rotate-3 cursor-grabbing w-[300px]">
                            <JobApplicationCard application={activeApplication} onClick={() => { }} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Drawer */}
            {selectedApp && (
                <ApplicationDrawer
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    interviews={getSelectedAppDetails().interviews}
                    followups={getSelectedAppDetails().followups}
                />
            )}
        </div>
    );
}
