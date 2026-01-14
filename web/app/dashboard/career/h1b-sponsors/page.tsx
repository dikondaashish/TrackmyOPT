"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { filterSponsors, FilterOptions } from "@/lib/career/h1b/filterSponsors";
import { H1BSponsorStatsRow } from "@/components/career/h1b/H1BSponsorStatsRow";
import { H1BSponsorSearchFilters } from "@/components/career/h1b/H1BSponsorSearchFilters";
import { H1BSponsorList } from "@/components/career/h1b/H1BSponsorList";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/supabase";

// LocalStorage key for saved sponsors
const SAVED_SPONSORS_KEY = "trackmyopt_saved_sponsors";

// Type alias for DB row
type H1BSponsorRow = Database['public']['Tables']['h1b_sponsors']['Row'];

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
    const [sponsors, setSponsors] = useState<H1BSponsor[]>([]);

    // Fetch sponsors from Supabase
    useEffect(() => {
        async function fetchSponsors() {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('h1b_sponsors')
                    .select('*')
                    .order('total_approvals', { ascending: false }); // Default sorting

                if (error) {
                    console.error("Error fetching sponsors:", error);
                    // Fallback to empty or show error
                } else if (data) {
                    // Map DB rows to Frontend model
                    const mappedSponsors: H1BSponsor[] = data.map((row: H1BSponsorRow) => ({
                        id: row.id,
                        name: row.name,
                        industry: row.industry,
                        // Cast string to union type - assuming DB has valid values
                        size: row.size as H1BSponsor['size'],
                        location: row.location,
                        website: row.website,
                        approvals_2021: row.approvals_2021,
                        approvals_2022: row.approvals_2022,
                        approvals_2023: row.approvals_2023,
                        approvals_2024: row.approvals_2024 ?? 0, // Handle missing column if needed, or update interface
                        // Calculate total or use fetched total (if available/computed)
                        // Note: Mock interface doesn't have total_approvals, but helper uses it?
                        // Actually mock interface has approvals_2021-2023
                        sponsorship_strength: row.sponsorship_strength as H1BSponsor['sponsorship_strength'],
                        common_roles: Array.isArray(row.common_roles)
                            ? (row.common_roles as string[])
                            : typeof row.common_roles === 'string'
                                ? JSON.parse(row.common_roles) // Handle double-encoded JSON if applicable
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

        fetchSponsors();
    }, []);

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
        return filterSponsors(sponsors, { ...filters, search: debouncedSearch });
    }, [sponsors, filters, debouncedSearch]);

    // Calculate stats
    const highSponsors = sponsors.filter(s => s.sponsorship_strength === "High").length;

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
                    totalSponsors={sponsors.length}
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
