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
    careers_url?: string | null;
    is_virtual_office?: boolean | null;
    top_law_firm?: string | null;
    entry_level_percent?: number | null;
}
