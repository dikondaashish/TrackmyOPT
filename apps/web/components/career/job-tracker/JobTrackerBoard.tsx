"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, ArrowLeft, Plus } from "lucide-react";
import { PricingModal } from "@/components/pricing/PricingModal";
import { AddColumnModal } from "./AddColumnModal";
import { DeleteStageModal } from "./DeleteStageModal";
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
    CollisionDetection,
    UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CustomStage, JobApplication, JobStage } from "@/lib/career/job-tracker/types";
import { JOB_STAGES, KANBAN_COLUMNS } from "@/lib/career/job-tracker/constants";
import { JobStageColumn } from "./JobStageColumn";
import { JobApplicationCard } from "./JobApplicationCard";
import { JobTrackerStatsRow } from "./JobTrackerStatsRow";
import { AddApplicationModal } from "./AddApplicationModal";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { JobTrackerToolbar } from "./JobTrackerToolbar";
import { FollowupsNotification } from "./FollowupsNotification";
import { ViewSwitcher, JobTrackerView } from "./ViewSwitcher";
import { JobTrackerTableView } from "./JobTrackerTableView";
import { JobTrackerCalendarView } from "./JobTrackerCalendarView";
import { InsightsPanel } from "./InsightsPanel";
import { JobTrackerUsageBar } from "./JobTrackerUsageBar";
import {
    updateApplicationStatus,
    clearApplicationFollowup,
    clearAllFollowups,
    deleteJobStage,
    deleteApplication,
} from "@/app/dashboard/career/job-tracker/actions";
import {
    searchApplications,
    filterApplications,
    sortApplications,
    SortOption,
    FollowupFilterOption
} from "@/lib/career/job-tracker/filtering";

interface JobTrackerBoardProps {
    initialApplications: any[]; // Includes joined interviews/followups
    planTier: string | null;
    customStages: any[]; // CustomStage[]
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

export function JobTrackerBoard({ initialApplications, planTier, customStages }: JobTrackerBoardProps) {
    const router = useRouter();
    const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);

    // View State with localStorage persistence
    const [currentView, setCurrentView] = useState<JobTrackerView>("board");

    useEffect(() => {
        const saved = localStorage.getItem("trackmyopt_job_tracker_view");
        if (saved && ["board", "table", "calendar"].includes(saved)) {
            setCurrentView(saved as JobTrackerView);
        }
    }, []);

    const handleViewChange = (view: JobTrackerView) => {
        setCurrentView(view);
        localStorage.setItem("trackmyopt_job_tracker_view", view);
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

    const handleDelete = async (id: string) => {
        try {
            await deleteApplication(id);
            setApplications((prev) => prev.filter((a) => a.id !== id));
            setSelectedApp(null);
            router.refresh();
        } catch (err) {
            console.error(err);
            router.refresh();
        }
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

    const handleStageChange = async (appId: string, newStage: string) => {
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

    const [stageToDelete, setStageToDelete] = useState<CustomStage | null>(null);

    const handleDeleteStage = (customStage: any) => {
        setStageToDelete(customStage);
    };

    const handleConfirmDelete = () => {
        router.refresh();
        setStageToDelete(null);
    };

    const handleMarkFollowupDone = async (appId: string) => {
        // Optimistic update
        setApplications(prev => prev.map(a =>
            a.id === appId ? { ...a, next_follow_up_at: null } as any : a
        ));

        try {
            await clearApplicationFollowup(appId);
        } catch (err) {
            router.refresh(); // Revert on error by re-fetching
        }
    };

    const handleClearAllFollowups = async () => {
        // Optimistic update
        setApplications(prev => prev.map(a =>
            a.next_follow_up_at ? { ...a, next_follow_up_at: null } as any : a
        ));

        try {
            await clearAllFollowups();
        } catch (err) {
            router.refresh();
        }
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
        // Merge Default + Custom Columns
        const allColumns = [
            ...KANBAN_COLUMNS,
            ...customStages.map((s: CustomStage) => ({
                id: s.title, // Use title as ID for now to match JobStage type (string)
                title: s.title,
                color: s.color
            }))
        ];

        const cols = new Map<string, JobApplication[]>();
        allColumns.forEach(col => cols.set(col.id, []));

        filteredApplications.forEach(app => {
            // If app status doesn't match any column (legacy), put it in 'Wishlist' or handle gracefully
            if (cols.has(app.status)) {
                cols.get(app.status)?.push(app);
            } else {
                // Fallback: Add to first column if status invalid? Or maybe the status IS valid but just no column?
                // For now, assume status matches one of the column IDs (titles)
                // If custom stage was deleted, this might break. 
                // Let's safe guard:
                if (!cols.has(app.status)) {
                    // Maybe put in 'Applied' as fallback?
                    cols.get(KANBAN_COLUMNS[1].id)?.push(app);
                }
            }
        });

        return { cols, allColumns };
    }, [filteredApplications, customStages]);

    // Update drag logic to use allColumns
    const { cols: applicationColumns, allColumns } = columns;

    // Drag Handlers
    const handleDragStart = (event: DragStartEvent) => {
        const id = event.active.id as string;
        setActiveId(id);
        // Save original status for revert on failed drop
        const app = applications.find(a => a.id === id);
        if (app) {
            setPreDragStatus(prev => ({ ...prev, [id]: app.status }));
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeAppId = active.id as string;
        const activeApp = applications.find(a => a.id === activeAppId);
        if (!activeApp) return;

        // Determine the target column
        let targetColumn: string | null = null;
        const isColumn = allColumns.some(col => col.id === over.id);

        if (isColumn) {
            targetColumn = over.id as string;
        } else {
            const overApp = applications.find(a => a.id === over.id);
            if (overApp) {
                targetColumn = overApp.status;
            }
        }

        // Optimistically move card to new column during drag for visual feedback
        if (targetColumn && targetColumn !== activeApp.status) {
            setApplications(prev => prev.map(a =>
                a.id === activeAppId ? { ...a, status: targetColumn! } : a
            ));
        }
    };

    // Track the original status before drag started for revert on failure
    const [preDragStatus, setPreDragStatus] = useState<Record<string, string>>({});

    // Custom collision detection: prioritize droppable columns over sortable cards
    const customCollisionDetection: CollisionDetection = useCallback((args) => {
        // First try pointerWithin (most precise)
        const pointerCollisions = pointerWithin(args);

        if (pointerCollisions.length > 0) {
            // Prioritize column droppables over card sortables
            const columnCollision = pointerCollisions.find(c =>
                allColumns.some(col => col.id === c.id)
            );
            if (columnCollision) return [columnCollision];
            return pointerCollisions;
        }

        // Fallback to rect intersection
        return rectIntersection(args);
    }, [allColumns]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active } = event;
        setActiveId(null);

        const activeAppId = active.id as string;
        const activeApp = applications.find(a => a.id === activeAppId);
        if (!activeApp) return;

        const originalStatus = preDragStatus[activeAppId];

        // If status changed during drag (via handleDragOver), persist to DB
        if (originalStatus && activeApp.status !== originalStatus) {
            try {
                await updateApplicationStatus(activeAppId, activeApp.status as JobStage);
            } catch (err) {
                // Revert on failure
                setApplications(prev => prev.map(a =>
                    a.id === activeAppId ? { ...a, status: originalStatus } : a
                ));
            }
        }

        // Clean up
        setPreDragStatus(prev => {
            const next = { ...prev };
            delete next[activeAppId];
            return next;
        });
    };

    // ... rest of component


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
        <div className="space-y-4 max-w-full">
            {/* Top Bar: Back Link + Notification Bell */}
            <div className="flex items-center justify-between mb-2">
                <Link
                    href="/dashboard/career"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Career Hub
                </Link>
                <FollowupsNotification
                    applications={applications}
                    onMarkDone={handleMarkFollowupDone}
                    onClearAll={handleClearAllFollowups}
                />
            </div>

            {/* Title + Stats Row */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-2">
                {/* Title Section */}
                <div className="flex items-center gap-4 min-w-0 max-md:w-full">
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                        <ClipboardList className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Job Application Tracker</h1>
                        <p className="text-muted-foreground">
                            Track applications, interviews, and offers in one place
                        </p>
                    </div>
                </div>

                {/* Stats Row (Right Side) */}
                <div className="flex-1 w-full xl:max-w-3xl">
                    <JobTrackerStatsRow applications={applications} />
                </div>
            </div>

            {/* Controls Row: Usage Bar + Actions */}
            <div className="flex flex-col max-md:items-stretch md:flex-row md:items-center justify-between gap-4 w-full">
                <div className="w-full md:w-auto">
                    <JobTrackerUsageBar applications={applications} planTier={planTier} />
                </div>
                <div className="flex items-center gap-2 max-md:w-full max-md:justify-between md:self-auto self-end">
                    <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />
                    <AddApplicationModal 
                        onAdd={handleAdd} 
                        isPrimaryEmptyState={applications.length === 0}
                    />
                </div>
            </div>

            {/* Insights Row */}
            <div className="mb-2">
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={customCollisionDetection}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory md:snap-none">
                        <div className="flex gap-4 min-w-[200px] px-1">
                            {allColumns.map(col => {
                                const customStage = customStages.find((s: any) => s.title === col.id);
                                return (
                                    <JobStageColumn
                                        key={col.id}
                                        column={col}
                                        applications={applicationColumns.get(col.id) || []}
                                        onCardClick={setSelectedApp}
                                        onDelete={customStage ? () => handleDeleteStage(customStage) : undefined}
                                    />
                                );
                            })}

                            {/* Add Column Button (Premium Gate) */}
                            <div className="flex flex-col h-full min-w-[85vw] w-[85vw] md:min-w-[320px] md:w-[320px] snap-start">
                                <button
                                    onClick={() => {
                                        // Robust Premium Check
                                        const isPremium = planTier && planTier.toLowerCase() !== 'free';

                                        if (!isPremium) {
                                            setShowPricingModal(true);
                                        } else {
                                            setShowAddColumnModal(true);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium h-[60px]"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Column
                                </button>
                            </div>
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


            {/* Premium Modals */}
            <PricingModal
                open={showPricingModal}
                onClose={() => setShowPricingModal(false)}
                isPremium={!!planTier && planTier.toLowerCase() !== 'free'}
            />
            <AddColumnModal
                isOpen={showAddColumnModal}
                onClose={() => setShowAddColumnModal(false)}
            />

            <DeleteStageModal
                isOpen={!!stageToDelete}
                onClose={() => setStageToDelete(null)}
                stageToDelete={stageToDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
