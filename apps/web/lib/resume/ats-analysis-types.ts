import type { KeywordPlacement } from "./keyword-placement";

export interface AtsAnalysis {
    passed: boolean;
    score?: number;
    issues: string[];
    keywordMatch?: {
        found: string[];
        missing: string[];
        partial?: string[];
        score: number;
    };
    sectionScores?: {
        impact?: number;
        brevity?: number;
        relevance?: number;
        summary?: number;
        experience?: number;
        skills?: number;
        education?: number;
        overall?: number;
    };
    bulletAnalysis?: {
        total: number;
        strong: number;
        moderate: number;
        weak: number;
        score: number;
    };
    metricsRatio?: number;
    metricsBullets?: {
        total: number;
        quantified: number;
    };
    scoreBreakdown?: {
        contentScore: number;
        formatPenalty: number;
        finalScore: number;
    };
    improvements?: string[];
    missingKeywordsByCategory?: {
        required?: string[];
        preferred?: string[];
        methodologies?: string[];
    };
    keywordPlacement?: KeywordPlacement[];
}

export const ATS_PASS_SCORE = 75;

export function buildAutoRegenFeedback(analysis: AtsAnalysis | null): string {
    if (!analysis) {
        return "Improve keyword match and ATS formatting for this job description.";
    }

    const missing = analysis.keywordMatch?.missing ?? [];
    const improvements = analysis.improvements ?? [];
    const parts: string[] = [];

    if (missing.length > 0) {
        parts.push(
            `Add these missing JD keywords naturally in Skills AND Experience: ${missing.slice(0, 12).join(", ")}.`
        );
    }
    if (improvements.length > 0) {
        parts.push(improvements.slice(0, 3).join(" "));
    }
    parts.push("Keep all company names, dates, and degrees exactly as in the source resume.");

    return parts.join("\n\n");
}
