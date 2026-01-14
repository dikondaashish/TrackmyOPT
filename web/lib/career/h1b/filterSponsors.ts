// lib/career/h1b/filterSponsors.ts
// Filtering and sorting utilities for H-1B sponsors
// TODO: Phase 2 - Move filtering to Supabase queries

import { H1BSponsor, getTotalApprovals } from "@/lib/mock/h1bSponsors";

export type LocationFilter = "All" | "Remote" | "CA" | "NY" | "TX" | "MA" | "WA" | "NJ" | "IL";
export type IndustryFilter = "All" | "Tech" | "Finance" | "Consulting" | "Healthcare" | "Education" | "Retail";
export type SizeFilter = "All" | "Startup" | "Mid" | "Enterprise";
export type StrengthFilter = "All" | "High" | "Medium" | "Low";
export type SortOption = "most-sponsorship" | "recently-updated" | "alphabetical";

export interface FilterOptions {
    search: string;
    location: LocationFilter;
    industry: IndustryFilter;
    size: SizeFilter;
    strength: StrengthFilter;
    sort: SortOption;
}

export function filterSponsors(sponsors: H1BSponsor[], options: FilterOptions): H1BSponsor[] {
    let filtered = [...sponsors];

    // Search filter
    if (options.search.trim()) {
        const searchLower = options.search.toLowerCase().trim();
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(searchLower) ||
            s.industry.toLowerCase().includes(searchLower)
        );
    }

    // Location filter
    if (options.location !== "All") {
        filtered = filtered.filter(s => s.location === options.location);
    }

    // Industry filter
    if (options.industry !== "All") {
        filtered = filtered.filter(s => s.industry === options.industry);
    }

    // Size filter
    if (options.size !== "All") {
        filtered = filtered.filter(s => s.size === options.size);
    }

    // Strength filter
    if (options.strength !== "All") {
        filtered = filtered.filter(s => s.sponsorship_strength === options.strength);
    }

    // Sorting
    switch (options.sort) {
        case "most-sponsorship":
            filtered.sort((a, b) => getTotalApprovals(b) - getTotalApprovals(a));
            break;
        case "alphabetical":
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "recently-updated":
            // For MVP, sort by 2023 approvals as proxy for "recent activity"
            filtered.sort((a, b) => b.approvals_2023 - a.approvals_2023);
            break;
    }

    return filtered;
}

export const LOCATION_OPTIONS: LocationFilter[] = ["All", "CA", "NY", "TX", "MA", "WA", "NJ", "IL"];
export const INDUSTRY_OPTIONS: IndustryFilter[] = ["All", "Tech", "Finance", "Consulting", "Healthcare", "Retail"];
export const SIZE_OPTIONS: SizeFilter[] = ["All", "Startup", "Mid", "Enterprise"];
export const STRENGTH_OPTIONS: StrengthFilter[] = ["All", "High", "Medium", "Low"];
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "most-sponsorship", label: "Most Sponsorship" },
    { value: "recently-updated", label: "Recently Updated" },
    { value: "alphabetical", label: "Alphabetical" },
];
