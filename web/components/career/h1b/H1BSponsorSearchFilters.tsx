"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import {
    FilterOptions,
    LocationFilter,
    IndustryFilter,
    SizeFilter,
    StrengthFilter,
    SortOption,
    LOCATION_OPTIONS,
    INDUSTRY_OPTIONS,
    SIZE_OPTIONS,
    STRENGTH_OPTIONS,
    SORT_OPTIONS,
} from "@/lib/career/h1b/filterSponsors";

interface H1BSponsorSearchFiltersProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
}

export function H1BSponsorSearchFilters({ filters, onFilterChange }: H1BSponsorSearchFiltersProps) {
    const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
            {/* Search Input */}
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by company name (e.g., Amazon, Deloitte, Apple)"
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="font-medium">Filters:</span>
                </div>

                {/* Location */}
                <select
                    value={filters.location}
                    onChange={(e) => updateFilter("location", e.target.value as LocationFilter)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {LOCATION_OPTIONS.map((loc) => (
                        <option key={loc} value={loc}>
                            {loc === "All" ? "All Locations" : loc}
                        </option>
                    ))}
                </select>

                {/* Industry */}
                <select
                    value={filters.industry}
                    onChange={(e) => updateFilter("industry", e.target.value as IndustryFilter)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {INDUSTRY_OPTIONS.map((ind) => (
                        <option key={ind} value={ind}>
                            {ind === "All" ? "All Industries" : ind}
                        </option>
                    ))}
                </select>

                {/* Size */}
                <select
                    value={filters.size}
                    onChange={(e) => updateFilter("size", e.target.value as SizeFilter)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                            {size === "All" ? "All Sizes" : size}
                        </option>
                    ))}
                </select>

                {/* Strength */}
                <select
                    value={filters.strength}
                    onChange={(e) => updateFilter("strength", e.target.value as StrengthFilter)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {STRENGTH_OPTIONS.map((str) => (
                        <option key={str} value={str}>
                            {str === "All" ? "All Strength" : str}
                        </option>
                    ))}
                </select>

                {/* Divider */}
                <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-gray-700" />

                {/* Sort */}
                <select
                    value={filters.sort}
                    onChange={(e) => updateFilter("sort", e.target.value as SortOption)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
