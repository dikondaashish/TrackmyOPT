import { H1BSponsor } from "@/lib/mock/h1b-sponsors";

interface SponsorScore {
    score: number;
    label: "Strong" | "Medium" | "Low";
    trend: "Up" | "Down" | "Flat";
    trendValue: number; // Percentage change
}

export function calculateSponsorScore(sponsor: H1BSponsor): SponsorScore {
    const app2025 = sponsor.approvals_2025 || 0;
    const app2024 = sponsor.approvals_2024 || 0;
    const app2023 = sponsor.approvals_2023 || 0;
    const totalHistory = app2025 + app2024 + app2023;

    // 1. Trend Calculation
    let trend: "Up" | "Down" | "Flat" = "Flat";
    let trendValue = 0;
    if (app2024 > 0) {
        trendValue = ((app2025 - app2024) / app2024) * 100;
        if (trendValue > 10) trend = "Up";
        else if (trendValue < -10) trend = "Down";
    } else if (app2025 > 0) {
        trend = "Up"; // New activity
        trendValue = 100;
    }

    // 2. Volume Score (Normalize 0-100 based on log scale to handle giants like Amazon vs small startups)
    // Assumption: 1000+ approvals is max score for volume
    const volumeScore = Math.min(100, (Math.log10(app2025 + 1) / 3) * 100);

    // 3. History Score (Consistency)
    // Use average over last 3 years
    const avg = totalHistory / 3;
    const historyScore = Math.min(100, (Math.log10(avg + 1) / 3) * 100);

    // 4. Trend Score Component
    let trendScoreComp = 50; // Default base
    if (trend === "Up") trendScoreComp = 100;
    if (trend === "Down") trendScoreComp = 20;

    // Weighted Total
    // 50% Volume, 30% History, 20% Trend
    const rawScore = (0.5 * volumeScore) + (0.3 * historyScore) + (0.2 * trendScoreComp);
    const score = Math.round(Math.min(100, Math.max(0, rawScore)));

    let label: "Strong" | "Medium" | "Low" = "Low";
    if (score >= 80) label = "Strong";
    else if (score >= 60) label = "Medium";

    return {
        score,
        label,
        trend,
        trendValue
    };
}
