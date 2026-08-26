function normalizeScore(value: unknown): number | null {
    const score = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(score)) return null;
    return Math.max(0, Math.min(100, score));
}

export function calculateFormatPenalty(issues: string[]): number {
    return Math.min(
        issues.reduce((penalty, issue) => {
            if (issue.startsWith("CRITICAL")) return penalty + 15;
            if (issue.startsWith("MISSING SECTION")) return penalty + 10;
            if (issue.startsWith("WARNING")) return penalty + 5;
            return penalty;
        }, 0),
        25
    );
}

export function calculateAtsFinalScore(input: {
    overallScore: unknown;
    keywordScore: unknown;
    issues: string[];
}) {
    const contentScore =
        normalizeScore(input.overallScore) ?? normalizeScore(input.keywordScore) ?? 0;
    const formatPenalty = calculateFormatPenalty(input.issues);
    const finalScore = Math.round(Math.max(0, contentScore - formatPenalty));
    return {
        contentScore: Math.round(contentScore),
        formatPenalty,
        finalScore,
    };
}
