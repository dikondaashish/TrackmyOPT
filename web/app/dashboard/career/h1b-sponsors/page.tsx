"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, Filter, Briefcase, Bookmark, Building2, TrendingUp, Users, AlertCircle } from "lucide-react";
import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { Database } from "@/types/supabase";

type H1BSponsorRow = Database['public']['Tables']['h1b_sponsors']['Row'];
import { H1BSponsorCard } from "@/components/career/h1b/H1BSponsorCard";
import { H1BSponsorTabs } from "@/components/career/h1b/H1BSponsorTabs";
import { AddToTrackerModal, JobTrackerItem } from "@/components/career/h1b/AddToTrackerModal";
import { calculateSponsorScore } from "@/lib/career/h1b/sponsorScore";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function H1BSponsorsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("All");
    const [selectedSize, setSelectedSize] = useState("All");

    // New Filters
    const [hiringFilter, setHiringFilter] = useState<"All" | "Hiring">("All");
    const [trendFilter, setTrendFilter] = useState<"All" | "Trending">("All");

    const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
    const [sponsors, setSponsors] = useState<H1BSponsor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savedSponsors, setSavedSponsors] = useState<Set<string>>(new Set());

    // Modal State
    const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
    const [selectedSponsorForTracker, setSelectedSponsorForTracker] = useState<H1BSponsor | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        async function fetchSponsors() {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('h1b_sponsors')
                    .select('*')
                    .order('total_approvals', { ascending: false });

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
                        logo: row.logo,
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
        return sponsors.filter((sponsor) => {
            // Tab Filter
            if (activeTab === "saved" && !savedSponsors.has(sponsor.id)) {
                return false;
            }

            // Search Filter
            const matchesSearch =
                sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sponsor.location.toLowerCase().includes(searchQuery.toLowerCase());

            // Dropdown Filters
            const matchesIndustry = selectedIndustry === "All" || sponsor.industry === selectedIndustry;
            const matchesSize = selectedSize === "All" || sponsor.size === selectedSize;

            // Hiring Filter
            const isHiring = (sponsor.approvals_2025 || 0) > 0;
            if (hiringFilter === "Hiring" && !isHiring) return false;

            // Trend Filter
            if (trendFilter === "Trending") {
                const score = calculateSponsorScore(sponsor);
                if (score.trend !== "Up") return false;
            }

            return matchesSearch && matchesIndustry && matchesSize;
        });
    }, [sponsors, searchQuery, selectedIndustry, selectedSize, hiringFilter, trendFilter, activeTab, savedSponsors]);

    const industries = ["All", ...Array.from(new Set(sponsors.map((s) => s.industry)))];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Sponsor Intelligence Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
                    Discover H-1B sponsors actively hiring in FY2025. Analyze trends, sponsorship scores, and save target companies to your job tracker.
                </p>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col gap-6">

                {/* Tabs */}
                <H1BSponsorTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    savedCount={savedSponsors.size}
                />

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search company (Amazon, Infosys, Deloitte...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                        <div className="relative min-w-[140px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                value={hiringFilter}
                                onChange={(e) => setHiringFilter(e.target.value as any)}
                                className="w-full pl-9 pr-8 py-3 appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:border-blue-500/50 transition-colors"
                            >
                                <option value="All">All Status</option>
                                <option value="Hiring">Hiring Now (FY25)</option>
                            </select>
                        </div>

                        <div className="relative min-w-[140px]">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <select
                                value={trendFilter}
                                onChange={(e) => setTrendFilter(e.target.value as any)}
                                className="w-full pl-9 pr-8 py-3 appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:border-blue-500/50 transition-colors"
                            >
                                <option value="All">All Trends</option>
                                <option value="Trending">Trending Up 📈</option>
                            </select>
                        </div>

                        <div className="relative min-w-[160px]">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="w-full pl-9 pr-8 py-3 appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:border-blue-500/50 transition-colors"
                            >
                                {industries.map(ind => (
                                    <option key={ind} value={ind}>{ind === "All" ? "All Industries" : ind}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredSponsors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSponsors.map((sponsor) => (
                        <H1BSponsorCard
                            key={sponsor.id}
                            sponsor={sponsor}
                            isSaved={savedSponsors.has(sponsor.id)}
                            onToggleSave={toggleSaveSponsor}
                            onAddToTracker={handleAddToTrackerClick}
                        />
                    ))}
                </div>
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
