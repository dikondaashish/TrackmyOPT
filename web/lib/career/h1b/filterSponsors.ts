import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { calculateSponsorScore } from "./sponsorScore";

export type StatusFilter = "All" | "Hiring Now" | "Inactive";
export type TrendFilter = "All" | "Trending Up" | "Stable" | "Trending Down";
export type IndustryFilter = "All" | "Technology" | "Finance" | "Consulting" | "Education" | "Manufacturing" | "Retail" | "Healthcare" | "Other";

export interface FilterOptions {
    search: string;
    status: StatusFilter;
    trend: TrendFilter;
    industry: IndustryFilter;
}

export const STATUS_OPTIONS: StatusFilter[] = ["All", "Hiring Now", "Inactive"];
export const TREND_OPTIONS: TrendFilter[] = ["All", "Trending Up", "Stable", "Trending Down"];
export const INDUSTRY_OPTIONS: IndustryFilter[] = ["All", "Technology", "Finance", "Consulting", "Education", "Manufacturing", "Retail", "Healthcare", "Other"];

export function filterSponsors(sponsors: H1BSponsor[], filters: FilterOptions): H1BSponsor[] {
    return sponsors.filter((sponsor) => {
        const scoreData = calculateSponsorScore(sponsor);

        // Search
        if (filters.search) {
            const query = filters.search.toLowerCase();
            const matchesName = sponsor.name.toLowerCase().includes(query);
            const matchesState = sponsor.location.toLowerCase().includes(query);
            if (!matchesName && !matchesState) return false;
        }

        // Status
        if (filters.status !== "All") {
            const isHiring = (sponsor.approvals_2025 || 0) > 0;
            if (filters.status === "Hiring Now" && !isHiring) return false;
            if (filters.status === "Inactive" && isHiring) return false;
        }

        // Trend
        if (filters.trend !== "All") {
            if (filters.trend === "Trending Up" && scoreData.trend !== "Up") return false;
            if (filters.trend === "Trending Down" && scoreData.trend !== "Down") return false;
            if (filters.trend === "Stable" && scoreData.trend !== "Flat") return false;
        }

        // Industry
        if (filters.industry !== "All") {
            // Simple mapping or exact match if your data supports it
            // Assuming sponsor.industry matches the options or we do loose matching
            if (sponsor.industry !== filters.industry && filters.industry !== "Other") {
                // If it's a specific industry, it must match
                // You might want to robustify this if industries are freer text
                if (!sponsor.industry?.includes(filters.industry)) return false;
            }
        }

        return true;
    });
}
