import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { calculateSponsorScore } from "./sponsorScore";

export type StatusFilter = "All" | "Hiring Now" | "Inactive";
export type TrendFilter = "All" | "Trending Up" | "Stable" | "Trending Down";
export type IndustryFilter = string; // Dynamic from data
export type StateFilter = string; // Dynamic from data
export type CompanySizeFilter = "All" | "Startup" | "Mid-Size" | "Enterprise (MNC)";

export interface FilterOptions {
    search: string;
    status: StatusFilter;
    trend: TrendFilter;
    industry: IndustryFilter;
    state: StateFilter;
    companySize: CompanySizeFilter;
}

export const STATUS_OPTIONS: StatusFilter[] = ["All", "Hiring Now", "Inactive"];
export const TREND_OPTIONS: TrendFilter[] = ["All", "Trending Up", "Stable", "Trending Down"];
export const COMPANY_SIZE_OPTIONS: CompanySizeFilter[] = ["All", "Startup", "Mid-Size", "Enterprise (MNC)"];

// US States for the dropdown
export const US_STATES = [
    "All", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

// Helper to extract state abbreviation from location
function extractState(location: string): string {
    if (!location) return "";
    // Handle formats like "Seattle, WA" or just "WA"
    const parts = location.split(",");
    const lastPart = parts[parts.length - 1].trim().toUpperCase();
    // Check if it's a valid 2-letter state code
    if (lastPart.length === 2 && US_STATES.includes(lastPart)) {
        return lastPart;
    }
    return lastPart;
}

// Map internal size values to display values
function mapSizeToFilter(size: string | undefined): CompanySizeFilter {
    if (!size) return "All";
    switch (size) {
        case "Startup": return "Startup";
        case "Mid": return "Mid-Size";
        case "Enterprise": return "Enterprise (MNC)";
        default: return "All";
    }
}

export function filterSponsors(sponsors: H1BSponsor[], filters: FilterOptions): H1BSponsor[] {
    return sponsors.filter((sponsor) => {
        const scoreData = calculateSponsorScore(sponsor);

        // Search (by name or location)
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
            if (sponsor.industry !== filters.industry) {
                if (!sponsor.industry?.toLowerCase().includes(filters.industry.toLowerCase())) {
                    return false;
                }
            }
        }

        // State
        if (filters.state !== "All") {
            const sponsorState = extractState(sponsor.location);
            if (sponsorState !== filters.state) return false;
        }

        // Company Size
        if (filters.companySize !== "All") {
            const sponsorSize = mapSizeToFilter(sponsor.size);
            if (sponsorSize !== filters.companySize) return false;
        }

        return true;
    });
}
