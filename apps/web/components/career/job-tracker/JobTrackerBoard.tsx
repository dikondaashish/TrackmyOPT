"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { JobTrackerToolbar } from "./JobTrackerToolbar";
import { FollowupsDueWidget } from "./FollowupsDueWidget";
import { ViewSwitcher, JobTrackerView } from "./ViewSwitcher";
import { JobTrackerTableView } from "./JobTrackerTableView";
import { JobTrackerCalendarView } from "./JobTrackerCalendarView";
import { TodaysTasksWidget } from "./TodaysTasksWidget";
import { InsightsPanel } from "./InsightsPanel";
import { updateApplicationStatus } from "@/app/dashboard/career/job-tracker/actions";
import {
    searchApplications,
    filterApplications,
    sortApplications,
    SortOption,
    FollowupFilterOption
} from "@/lib/career/job-tracker/filtering";

interface JobTrackerBoardProps {
    initialApplications: any[]; // Includes joined interviews/followups
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

const STORAGE_KEY = "trackmyopt_job_tracker_view";

export function JobTrackerBoard({ initialApplications }: JobTrackerBoardProps) {
    const router = useRouter();
    const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

    // View State with localStorage persistence
    const [currentView, setCurrentView] = useState<JobTrackerView>("board");

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && ["board", "table", "calendar"].includes(saved)) {
            setCurrentView(saved as JobTrackerView);
        }
    }, []);

    const handleViewChange = (view: JobTrackerView) => {
        setCurrentView(view);
        localStorage.setItem(STORAGE_KEY, view);
    };

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<JobStage | "all">("all");
    const [followupFilter, setFollowupFilter] = useState<FollowupFilterOption>("all");
    const [sortBy, setSortBy] = useState<SortOption>("recently-added");
    const [showArchived, setShowArchived] = useState(false);

    // Sync state when server data changes
    useEffect(() => {
        setApplications(initialApplications);
    }, [initialApplications]);

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (statusFilter !== "all") count++;
        if (followupFilter !== "all") count++;
        if (sortBy !== "recently-added") count++;
        if (showArchived) count++;
        return count;
    }, [searchTerm, statusFilter, followupFilter, sortBy, showArchived]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        setStatusFilter("all");
        setFollowupFilter("all");
        setSortBy("recently-added");
        setShowArchived(false);
    }, []);

    // Filtered & Sorted Applications
    const filteredApplications = useMemo(() => {
        let results = applications;

        // Search
        if (searchTerm) {
            results = searchApplications(results, searchTerm);
        }

        // Filters
        results = filterApplications(results, {
            status: statusFilter,
            followupFilter,
            showArchived
        });

        // Sort
        results = sortApplications(results, sortBy);

        return results;
    }, [applications, searchTerm, statusFilter, followupFilter, sortBy, showArchived]);

    // Handlers for Instant UI Updates
    const handleAdd = (newApp: JobApplication) => {
        setApplications(prev => [newApp, ...prev]);
        router.refresh();
    };

    const handleDelete = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id));
        setSelectedApp(null);
        router.refresh();
    };

    const handleUpdate = (updatedApp: JobApplication) => {
        setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
        router.refresh();
    };

    const handleArchive = (id: string) => {
        setApplications(prev => prev.map(a =>
            a.id === id ? { ...a, is_archived: true } as any : a
        ));
        setSelectedApp(null);
        router.refresh();
    };

    const handleStageChange = async (appId: string, newStage: JobStage) => {
        const app = applications.find(a => a.id === appId);
        if (!app || app.status === newStage) return;

        // Optimistic update
        setApplications(prev => prev.map(a =>
            a.id === appId ? { ...a, status: newStage } : a
        ));

        try {
            await updateApplicationStatus(appId, newStage);
        } catch (err) {
            // Revert on failure
            setApplications(prev => prev.map(a =>
                a.id === appId ? { ...a, status: app.status } : a
            ));
        }
    };

    const handleMarkFollowupDone = (appId: string) => {
        // Clear the follow-up (in real implementation, update via server action)
        setApplications(prev => prev.map(a =>
            a.id === appId ? { ...a, next_follow_up_at: null } as any : a
        ));
        router.refresh();
    };

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Derived columns from filtered applications
    const columns = useMemo(() => {
        const cols = new Map<JobStage, JobApplication[]>();
        JOB_STAGES.forEach(stage => cols.set(stage, []));

        filteredApplications.forEach(app => {
            cols.get(app.status)?.push(app);
        });

        return cols;
    }, [filteredApplications]);

    // Drag Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Visual feedback handled by DndContext
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
            await handleStageChange(activeAppId, newStatus);
        }
    };

    const activeApplication = activeId ? applications.find(a => a.id === activeId) : null;

    // Get joined data for drawer
    const getSelectedAppDetails = () => {
        if (!selectedApp) return { interviews: [], followups: [] };
        const fullApp = applications.find(a => a.id === selectedApp.id) as any;
        return {
            interviews: fullApp?.job_interviews || [],
            followups: fullApp?.job_followups || []
        };
    };

    return (
        <div className="space-y-6">
            {/* Header Row: Stats + View Switcher + Add Button */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <JobTrackerStatsRow applications={applications} />
                <div className="flex items-center gap-3">
                    <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />
                    <AddApplicationModal onAdd={handleAdd} />
                </div>
            </div>

            {/* Today's Tasks + Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TodaysTasksWidget
                    applications={applications as any}
                    onCardClick={setSelectedApp}
                    onMarkFollowupDone={handleMarkFollowupDone}
                />
                <InsightsPanel applications={applications} />
            </div>

            {/* Toolbar - Only show for Board/Table */}
            {currentView !== "calendar" && (
                <JobTrackerToolbar
                    onSearchChange={setSearchTerm}
                    onStatusFilterChange={setStatusFilter}
                    onFollowupFilterChange={setFollowupFilter}
                    onSortChange={setSortBy}
                    onShowArchivedChange={setShowArchived}
                    activeFilterCount={activeFilterCount}
                    onClearFilters={handleClearFilters}
                />
            )}

            {/* View Content */}
            {currentView === "board" && (
                <>
                    {/* Follow-ups Widget */}
                    <FollowupsDueWidget
                        applications={applications as any}
                        onCardClick={setSelectedApp}
                    />

                    {/* Kanban Board */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory md:snap-none">
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
                                    <JobApplicationCard application={activeApplication as any} onClick={() => { }} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </>
            )}

            {currentView === "table" && (
                <JobTrackerTableView
                    applications={filteredApplications}
                    onCardClick={setSelectedApp}
                    onStageChange={handleStageChange}
                    onDelete={handleDelete}
                />
            )}

            {currentView === "calendar" && (
                <JobTrackerCalendarView
                    applications={applications}
                    onCardClick={setSelectedApp}
                />
            )}

            {/* Drawer */}
            {selectedApp && (
                <ApplicationDrawer
                    application={selectedApp as any}
                    onClose={() => setSelectedApp(null)}
                    interviews={getSelectedAppDetails().interviews}
                    followups={getSelectedAppDetails().followups}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onArchive={handleArchive}
                />
            )}
        </div>
    );
}
