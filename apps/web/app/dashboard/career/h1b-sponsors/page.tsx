"use client";

import { useState, useMemo, useEffect } from "react";
import { H1BSponsor } from "@/lib/mock/h1b-sponsors";
import { H1BSponsorCard } from "@/components/career/h1b/H1BSponsorCard";
import { H1BSponsorTabs } from "@/components/career/h1b/H1BSponsorTabs";
import { H1BSponsorSearchFilters } from "@/components/career/h1b/H1BSponsorSearchFilters";
import { H1BSponsorStatsRow } from "@/components/career/h1b/H1BSponsorStatsRow";
import { H1BSponsorLimitBanner } from "@/components/career/h1b/H1BSponsorLimitBanner";
import { OfficialEVerifyEmployerSearch } from "@/components/career/h1b/OfficialEVerifyEmployerSearch";
import { AddToTrackerModal, JobTrackerItem } from "@/components/career/h1b/AddToTrackerModal";
import { FilterOptions, filterSponsors } from "@/lib/career/h1b/filter-sponsors";
import { Search } from "lucide-react";
import { readBrowserStorage, writeBrowserStorage } from "@/lib/browser-storage";

const SAVED_SPONSORS_KEY = "trackmyopt_saved_sponsors";
const JOB_TRACKER_KEY = "trackmyopt_job_tracker_items";

function parseStoredArray(value: string | null): unknown[] {
    if (!value) return [];
    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveJobToBrowser(job: JobTrackerItem): void {
    const items = parseStoredArray(readBrowserStorage(JOB_TRACKER_KEY)) as JobTrackerItem[];
    items.push(job);
    const wasSaved = writeBrowserStorage(JOB_TRACKER_KEY, JSON.stringify(items));

    const toast = document.createElement("div");
    toast.className = "fixed bottom-5 right-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-fade-in-up";
    toast.innerText = wasSaved
        ? "Added to Job Tracker"
        : "Browser storage is blocked — job was not saved";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function mapSponsorRow(row: Record<string, unknown>): H1BSponsor {
    return {
        id: String(row.id),
        name: String(row.name),
        industry: String(row.industry),
        size: row.size as H1BSponsor["size"],
        location: String(row.location),
        website: String(row.website ?? ""),
        approvals_2021: Number(row.approvals_2021 ?? 0),
        approvals_2022: Number(row.approvals_2022 ?? 0),
        approvals_2023: Number(row.approvals_2023 ?? 0),
        approvals_2024: Number(row.approvals_2024 ?? 0),
        approvals_2025: Number(row.approvals_2025 ?? 0),
        sponsorship_strength: row.sponsorship_strength as H1BSponsor["sponsorship_strength"],
        common_roles: [],
        careers_url: (row.careers_url as string | null) ?? null,
        is_virtual_office: Boolean(row.is_virtual_office),
        top_law_firm: (row.top_law_firm as string | null) ?? null,
        entry_level_percent: (row.entry_level_percent as number | null) ?? null,
    };
}

export default function H1BSponsorsPage() {
    // Consolidated Filter State
    const [filters, setFilters] = useState<FilterOptions>({
        search: "",
        status: "All",
        trend: "All",
        industry: "All",
        state: "All",
        companySize: "All",
        strength: "All",
        sort: "Most Sponsorship"
    });

    const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
    const [sponsors, setSponsors] = useState<H1BSponsor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savedSponsors, setSavedSponsors] = useState<Set<string>>(new Set());
    const [totalSponsorCount, setTotalSponsorCount] = useState(0);
    const [highSponsorCount, setHighSponsorCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);

    // Modal State
    const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
    const [selectedSponsorForTracker, setSelectedSponsorForTracker] = useState<H1BSponsor | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        async function fetchSponsors() {
            setIsLoading(true);
            try {
                const response = await fetch("/api/career/h1b-sponsors", {
                    credentials: "include",
                });
                if (!response.ok) {
                    console.error("Error fetching sponsors:", response.status);
                    return;
                }
                const payload = await response.json();
                setTotalSponsorCount(payload.totalCount || 0);
                setHighSponsorCount(payload.highSponsorCount || 0);
                setIsPremium(payload.isPremium === true);

                const mappedSponsors: H1BSponsor[] = (payload.sponsors || []).map(
                    (row: Record<string, unknown>) => mapSponsorRow(row)
                );
                setSponsors(mappedSponsors);
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setIsLoading(false);
            }
        }

        // Load saved state from LocalStorage
        const savedIds = parseStoredArray(readBrowserStorage(SAVED_SPONSORS_KEY))
            .filter((value): value is string => typeof value === "string");
        setSavedSponsors(new Set(savedIds));

        fetchSponsors();
    }, []);

    const toggleSaveSponsor = (id: string) => {
        const newSaved = new Set(savedSponsors);
        if (newSaved.has(id)) {
            newSaved.delete(id);
        } else {
            newSaved.add(id);
        }
        setSavedSponsors(newSaved);
        writeBrowserStorage(SAVED_SPONSORS_KEY, JSON.stringify(Array.from(newSaved)));
    };

    const handleAddToTrackerClick = (sponsor: H1BSponsor) => {
        setSelectedSponsorForTracker(sponsor);
        setIsTrackerModalOpen(true);
    };

    // Filter Logic
    const filteredSponsors = useMemo(() => {
        // First filter by tab
        let result = sponsors;
        if (activeTab === "saved") {
            result = result.filter(s => savedSponsors.has(s.id));
        }

        // Then apply search/filter logic
        return filterSponsors(result, filters);
    }, [sponsors, filters, activeTab, savedSponsors]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, activeTab, sponsors]);

    // Calculate Pagination
    const totalPages = Math.ceil(filteredSponsors.length / ITEMS_PER_PAGE);
    const visibleSponsors = filteredSponsors.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Smooth scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Sponsor Intelligence Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mb-6">
                    Discover H-1B sponsors actively hiring with the latest Q4 2025 data. Analyze trends, sponsorship scores, and save target companies to your job tracker.
                </p>

                {/* Stats Row */}
                <H1BSponsorStatsRow
                    totalSponsors={totalSponsorCount}
                    highSponsors={highSponsorCount}
                    savedSponsors={savedSponsors.size}
                />

                <H1BSponsorLimitBanner
                    totalCount={totalSponsorCount}
                    isPremium={isPremium}
                />
            </div>

            <OfficialEVerifyEmployerSearch />

            {/* Controls Section */}
            <div className="flex flex-col gap-6">

                {/* Tabs */}
                <H1BSponsorTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    savedCount={savedSponsors.size}
                />

                {/* New Search & Filters Component */}
                <H1BSponsorSearchFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    allIndustries={Array.from(new Set(sponsors.map((s) => s.industry)))}
                />
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredSponsors.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {visibleSponsors.map((sponsor) => (
                            <H1BSponsorCard
                                key={sponsor.id}
                                sponsor={sponsor}
                                isSaved={savedSponsors.has(sponsor.id)}
                                onToggleSave={toggleSaveSponsor}
                                onAddToTracker={handleAddToTrackerClick}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                                <span className="font-medium">
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredSponsors.length)}
                                </span>{" "}
                                of <span className="font-medium">{filteredSponsors.length}</span> results
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                        // Simple windowing logic (always show first 5 or logic around current)
                                        // For simplicity, let's just show current page contextualized if logical, otherwise just simple Previous/Next is often enough for mobile.
                                        // But users asked for page numbers. Let's do a simple range centered on current.
                                        let pageNum = currentPage;
                                        if (totalPages <= 5) {
                                            pageNum = idx + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = idx + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + idx;
                                        } else {
                                            pageNum = currentPage - 2 + idx;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No sponsors found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {activeTab === "saved"
                            ? "You haven't saved any sponsors yet. Browse the full list and save companies to track them here."
                            : "Try adjusting your filters or search query to find more results."}
                    </p>
                    {activeTab === "saved" && (
                        <button
                            onClick={() => setActiveTab("all")}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Browse All Sponsors
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            <AddToTrackerModal
                isOpen={isTrackerModalOpen}
                onClose={() => setIsTrackerModalOpen(false)}
                companyName={selectedSponsorForTracker?.name || ""}
                onSave={saveJobToBrowser}
            />
        </div>
    );
}
