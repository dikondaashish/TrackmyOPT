"use client";

import { Search, Filter, ChevronDown, MapPin, Building2, ArrowUpDown } from "lucide-react";
import {
    FilterOptions,
    StatusFilter,
    TrendFilter,
    CompanySizeFilter,
    StrengthFilter,
    SortOption,
    STATUS_OPTIONS,
    TREND_OPTIONS,
    COMPANY_SIZE_OPTIONS,
    STRENGTH_OPTIONS,
    SORT_OPTIONS,
    US_STATES,
} from "@/lib/career/h1b/filterSponsors";

interface H1BSponsorSearchFiltersProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    allIndustries?: string[];
}

export function H1BSponsorSearchFilters({ filters, onFilterChange, allIndustries }: H1BSponsorSearchFiltersProps) {
    const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const displayIndustries = allIndustries && allIndustries.length > 0
        ? ["All", ...allIndustries.filter(i => i !== "All" && i).sort()]
        : ["All", "Technology", "Finance", "Consulting", "Education", "Manufacturing", "Retail", "Healthcare", "Other"];

    const hasActiveFilters = filters.status !== "All" ||
        filters.trend !== "All" ||
        filters.industry !== "All" ||
        filters.state !== "All" ||
        filters.companySize !== "All" ||
        filters.strength !== "All";

    const clearAllFilters = () => {
        onFilterChange({
            ...filters,
            status: "All",
            trend: "All",
            industry: "All",
            state: "All",
            companySize: "All",
            strength: "All"
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
            {/* Top Row: Search + Sort */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search company (Amazon, Infosys, Deloitte...)"
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all font-medium"
                    />
                </div>

                {/* Sort Option */}
                <div className="relative group min-w-[180px]">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={filters.sort}
                        onChange={(e) => updateFilter("sort", e.target.value as SortOption)}
                        className="w-full appearance-none pl-9 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 pointer-events-none" />
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filters:</span>

                {/* State Filter */}
                <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={filters.state}
                        onChange={(e) => updateFilter("state", e.target.value)}
                        className="appearance-none pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                        {US_STATES.map((state) => (
                            <option key={state} value={state}>
                                {state === "All" ? "All Locations" : state}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 pointer-events-none" />
                </div>

                {/* Industry Filter */}
                <div className="relative group">
                    <select
                        value={filters.industry}
                        onChange={(e) => updateFilter("industry", e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                        {displayIndustries.map((ind) => (
                            <option key={ind} value={ind}>
                                {ind === "All" ? "All Industries" : ind}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 pointer-events-none" />
                </div>

                {/* Company Size Filter */}
                <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={filters.companySize}
                        onChange={(e) => updateFilter("companySize", e.target.value as CompanySizeFilter)}
                        className="appearance-none pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                        {COMPANY_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size === "All" ? "All Sizes" : size}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 pointer-events-none" />
                </div>

                {/* Strength Filter */}
                <div className="relative group">
                    <select
                        value={filters.strength}
                        onChange={(e) => updateFilter("strength", e.target.value as StrengthFilter)}
                        className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                        {STRENGTH_OPTIONS.map((strength) => (
                            <option key={strength} value={strength}>
                                {strength === "All" ? "All Strength" : strength}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative group">
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter("status", e.target.value as StatusFilter)}
                        className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {status === "All" ? "All Status" : status}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 pointer-events-none" />
                </div>

                {/* Trend Filter */}
                <div className="relative group">
                    <select
                        value={filters.trend}
                        onChange={(e) => updateFilter("trend", e.target.value as TrendFilter)}
                        className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                        {TREND_OPTIONS.map((trend) => (
                            <option key={trend} value={trend}>
                                {trend === "All" ? "All Trends" : trend}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-600 pointer-events-none" />
                </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-500 animate-in fade-in slide-in-from-top-2">
                    <Filter className="w-3 h-3" />
                    <span>Active:</span>
                    {filters.state !== "All" && (
                        <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">{filters.state}</span>
                    )}
                    {filters.industry !== "All" && (
                        <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{filters.industry}</span>
                    )}
                    {filters.companySize !== "All" && (
                        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{filters.companySize}</span>
                    )}
                    {filters.strength !== "All" && (
                        <span className="px-2 py-1 rounded-md bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">{filters.strength}</span>
                    )}
                    {filters.status !== "All" && (
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{filters.status}</span>
                    )}
                    {filters.trend !== "All" && (
                        <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{filters.trend}</span>
                    )}
                    <button
                        onClick={clearAllFilters}
                        className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-semibold"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}
