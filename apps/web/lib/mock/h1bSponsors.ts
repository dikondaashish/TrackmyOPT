// lib/mock/h1bSponsors.ts

export interface H1BSponsor {
    id: string;
    name: string;
    industry: string;
    size: "Startup" | "Mid" | "Enterprise";
    location: string;
    website: string;
    approvals_2021: number;
    approvals_2022: number;
    approvals_2023: number;
    approvals_2024?: number;
    approvals_2025?: number;
    total_approvals?: number;
    sponsorship_strength: "High" | "Medium" | "Low";
    common_roles: string[];
    logo?: string;
}

// Deprecated: Data is now fetched from Supabase.
// Keeping this file for the Interface definition shared across the app.
export const H1B_SPONSORS: H1BSponsor[] = [];
