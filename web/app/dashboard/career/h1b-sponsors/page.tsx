"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { H1B_SPONSORS } from "@/lib/mock/h1bSponsors";
import { filterSponsors, FilterOptions } from "@/lib/career/h1b/filterSponsors";
import { H1BSponsorStatsRow } from "@/components/career/h1b/H1BSponsorStatsRow";
import { H1BSponsorSearchFilters } from "@/components/career/h1b/H1BSponsorSearchFilters";
import { H1BSponsorList } from "@/components/career/h1b/H1BSponsorList";

// LocalStorage key for saved sponsors
const SAVED_SPONSORS_KEY = "trackmyopt_saved_sponsors";

export default function H1BSponsorsPage() {
    const [filters, setFilters] = useState<FilterOptions>({
        search: "",
        location: "All",
        industry: "All",
        size: "All",
        strength: "All",
        sort: "most-sponsorship",
    });
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Load saved sponsors from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SAVED_SPONSORS_KEY);
            if (saved) {
                setSavedIds(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load saved sponsors:", e);
        }
        // Simulate loading
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 250);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Filter sponsors
    const filteredSponsors = useMemo(() => {
        return filterSponsors(H1B_SPONSORS, { ...filters, search: debouncedSearch });
    }, [filters, debouncedSearch]);

    // Calculate stats
    const highSponsors = H1B_SPONSORS.filter(s => s.sponsorship_strength === "High").length;

    // Toggle save sponsor
    const handleToggleSave = (id: string) => {
        setSavedIds(prev => {
            const newSaved = prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id];

            // Persist to localStorage
            try {
                localStorage.setItem(SAVED_SPONSORS_KEY, JSON.stringify(newSaved));
            } catch (e) {
                console.error("Failed to save sponsors:", e);
            }

            return newSaved;
        });
    };

    return (
        <div className="space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back Link */}
                <Link
                    href="/dashboard/career"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Career Hub
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">H-1B Sponsor Database</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Explore companies that sponsor H-1B and hire international students
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <H1BSponsorStatsRow
                    totalSponsors={12000}
                    highSponsors={highSponsors}
                    savedCount={savedIds.length}
                />

                {/* Search & Filters */}
                <H1BSponsorSearchFilters
                    filters={filters}
                    onFilterChange={setFilters}
                />

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredSponsors.length}</span> sponsors
                    </p>
                </div>

                {/* Sponsor List */}
                <H1BSponsorList
                    sponsors={filteredSponsors}
                    savedIds={savedIds}
                    onToggleSave={handleToggleSave}
                    isLoading={isLoading}
                />

                {/* Footer Info */}
                <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    Data based on DOL LCA disclosure records. Updated monthly.
                </div>
            </div>
        </div>
    );
}
