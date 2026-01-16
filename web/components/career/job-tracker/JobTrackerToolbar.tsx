"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X, Filter, ChevronDown, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JOB_STAGES } from "@/lib/career/job-tracker/constants";
import { JobStage } from "@/lib/career/job-tracker/types";
import { SortOption, FollowupFilterOption } from "@/lib/career/job-tracker/filtering";

interface JobTrackerToolbarProps {
    onSearchChange: (term: string) => void;
    onStatusFilterChange: (status: JobStage | "all") => void;
    onFollowupFilterChange: (filter: FollowupFilterOption) => void;
    onSortChange: (sort: SortOption) => void;
    onShowArchivedChange: (show: boolean) => void;
    activeFilterCount: number;
    onClearFilters: () => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function JobTrackerToolbar({
    onSearchChange,
    onStatusFilterChange,
    onFollowupFilterChange,
    onSortChange,
    onShowArchivedChange,
    activeFilterCount,
    onClearFilters
}: JobTrackerToolbarProps) {
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState<JobStage | "all">("all");
    const [followupFilter, setFollowupFilter] = useState<FollowupFilterOption>("all");
    const [sortBy, setSortBy] = useState<SortOption>("recently-added");
    const [showArchived, setShowArchived] = useState(false);

    // Debounce search
    const debouncedSearch = useDebounce(searchInput, 250);

    useEffect(() => {
        onSearchChange(debouncedSearch);
    }, [debouncedSearch, onSearchChange]);

    const handleClearSearch = () => {
        setSearchInput("");
        onSearchChange("");
    };

    const handleStatusChange = (value: string) => {
        const status = value as JobStage | "all";
        setStatusFilter(status);
        onStatusFilterChange(status);
    };

    const handleFollowupChange = (value: string) => {
        const filter = value as FollowupFilterOption;
        setFollowupFilter(filter);
        onFollowupFilterChange(filter);
    };

    const handleSortChange = (value: string) => {
        const sort = value as SortOption;
        setSortBy(sort);
        onSortChange(sort);
    };

    const handleShowArchivedChange = () => {
        const newValue = !showArchived;
        setShowArchived(newValue);
        onShowArchivedChange(newValue);
    };

    const handleClearAll = () => {
        setSearchInput("");
        setStatusFilter("all");
        setFollowupFilter("all");
        setSortBy("recently-added");
        setShowArchived(false);
        onClearFilters();
    };

    const selectClass = "h-9 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer";

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search company, role, location…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 pr-10 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                    {searchInput && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters & Sort */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 hidden sm:block">Status</Label>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={selectClass}
                        >
                            <option value="all">All Stages</option>
                            {JOB_STAGES.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>

                    {/* Follow-up Filter */}
                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 hidden sm:block">Follow-ups</Label>
                        <select
                            value={followupFilter}
                            onChange={(e) => handleFollowupChange(e.target.value)}
                            className={selectClass}
                        >
                            <option value="all">All</option>
                            <option value="today">Due Today</option>
                            <option value="week">Due This Week</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 hidden sm:block">Sort</Label>
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className={selectClass}
                        >
                            <option value="recently-added">Recently Added</option>
                            <option value="recently-updated">Recently Updated</option>
                            <option value="applied-newest">Applied (Newest)</option>
                            <option value="applied-oldest">Applied (Oldest)</option>
                        </select>
                    </div>

                    {/* Show Archived Toggle */}
                    <button
                        onClick={handleShowArchivedChange}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${showArchived
                                ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        <Archive className="w-4 h-4" />
                        <span className="hidden sm:inline">Archived</span>
                    </button>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Clear ({activeFilterCount})
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
