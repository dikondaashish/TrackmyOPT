"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Briefcase, Search } from "lucide-react";
import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { Database } from "@/types/supabase";

type H1BSponsorRow = Database['public']['Tables']['h1b_sponsors']['Row'];
import { H1BSponsorCard } from "@/components/career/h1b/H1BSponsorCard";
import { H1BSponsorTabs } from "@/components/career/h1b/H1BSponsorTabs";
import { H1BSponsorSearchFilters } from "@/components/career/h1b/H1BSponsorSearchFilters";
import { H1BSponsorStatsRow } from "@/components/career/h1b/H1BSponsorStatsRow";
import { AddToTrackerModal, JobTrackerItem } from "@/components/career/h1b/AddToTrackerModal";
import { FilterOptions, filterSponsors } from "@/lib/career/h1b/filterSponsors";
import { calculateSponsorScore } from "@/lib/career/h1b/sponsorScore";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // Modal State
    const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
    const [selectedSponsorForTracker, setSelectedSponsorForTracker] = useState<H1BSponsor | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        async function fetchSponsors() {
            setIsLoading(true);
            try {
                // Get total count first
                const { count: totalCount } = await supabase
                    .from('h1b_sponsors')
                    .select('*', { count: 'exact', head: true });

                setTotalSponsorCount(totalCount || 0);

                // Fetch sponsors with increased range (Supabase default is 1000)
                const { data, error } = await supabase
                    .from('h1b_sponsors')
                    .select('*')
                    .order('total_approvals', { ascending: false })
                    .range(0, 9999); // Load up to 10,000 sponsors

                if (error) {
                    console.error("Error fetching sponsors:", error);
                } else if (data) {
                    const mappedSponsors: H1BSponsor[] = data.map((row: H1BSponsorRow) => ({
                        id: row.id,
                        name: row.name,
                        industry: row.industry,
                        size: row.size as H1BSponsor['size'],
                        location: row.location,
                        website: row.website,

                        approvals_2021: row.approvals_2021,
                        approvals_2022: row.approvals_2022,
                        approvals_2023: row.approvals_2023,
                        approvals_2024: row.approvals_2024 ?? 0,
                        approvals_2025: row.approvals_2025 ?? 0,
                        sponsorship_strength: row.sponsorship_strength as H1BSponsor['sponsorship_strength'],
                        common_roles: Array.isArray(row.common_roles)
                            ? (row.common_roles as string[])
                            : typeof row.common_roles === 'string'
                                ? JSON.parse(row.common_roles)
                                : [],
                    }));
                    setSponsors(mappedSponsors);

                    // Calculate high sponsors count (Strong rating)
                    const highCount = mappedSponsors.filter(s => calculateSponsorScore(s).label === "Strong").length;
                    setHighSponsorCount(highCount);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setIsLoading(false);
            }
        }

        // Load saved state from LocalStorage
        const saved = localStorage.getItem("trackmyopt_saved_sponsors");
        if (saved) {
            setSavedSponsors(new Set(JSON.parse(saved)));
        }

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
        localStorage.setItem("trackmyopt_saved_sponsors", JSON.stringify(Array.from(newSaved)));
    };

    const handleAddToTrackerClick = (sponsor: H1BSponsor) => {
        setSelectedSponsorForTracker(sponsor);
        setIsTrackerModalOpen(true);
    };

    const handleSaveJob = (job: JobTrackerItem) => {
        // Save to localStorage for now
        const existingDefault = localStorage.getItem("trackmyopt_job_tracker_items");
        const items: JobTrackerItem[] = existingDefault ? JSON.parse(existingDefault) : [];
        items.push(job);
        localStorage.setItem("trackmyopt_job_tracker_items", JSON.stringify(items));

        // Show simplified Toast
        const toast = document.createElement("div");
        toast.className = "fixed bottom-5 right-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 animate-fade-in-up";
        toast.innerText = "Added to Job Tracker ✅";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
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

    // Infinite Scroll State
    const [visibleCount, setVisibleCount] = useState(9);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(9);
    }, [filters, activeTab, sponsors]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + 9);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const currentTarget = loadMoreRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [filteredSponsors]);

    const visibleSponsors = filteredSponsors.slice(0, visibleCount);

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
            </div>

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

                    {/* Infinite Scroll Sentinel */}
                    {visibleCount < filteredSponsors.length && (
                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                onSave={handleSaveJob}
            />
        </div>
    );
}
