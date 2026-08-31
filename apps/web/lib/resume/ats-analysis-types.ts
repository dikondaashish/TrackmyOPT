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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringList(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
}

/**
 * ATS data can come from an API response or persisted browser storage. Treat it
 * as untrusted at the UI boundary so a stale partial result cannot crash the
 * resume editor when the ATS tab opens.
 */
export function normalizeAtsAnalysis(value: unknown): AtsAnalysis | null {
    if (!isRecord(value)) return null;

    const keywordMatch = isRecord(value.keywordMatch)
        ? {
              found: stringList(value.keywordMatch.found),
              missing: stringList(value.keywordMatch.missing),
              partial: stringList(value.keywordMatch.partial),
              score: finiteNumber(value.keywordMatch.score) ?? 0,
          }
        : undefined;

    const sectionScores = isRecord(value.sectionScores)
        ? {
              ...(finiteNumber(value.sectionScores.impact) !== undefined
                  ? { impact: finiteNumber(value.sectionScores.impact) }
                  : {}),
              ...(finiteNumber(value.sectionScores.brevity) !== undefined
                  ? { brevity: finiteNumber(value.sectionScores.brevity) }
                  : {}),
              ...(finiteNumber(value.sectionScores.relevance) !== undefined
                  ? { relevance: finiteNumber(value.sectionScores.relevance) }
                  : {}),
              ...(finiteNumber(value.sectionScores.summary) !== undefined
                  ? { summary: finiteNumber(value.sectionScores.summary) }
                  : {}),
              ...(finiteNumber(value.sectionScores.experience) !== undefined
                  ? { experience: finiteNumber(value.sectionScores.experience) }
                  : {}),
              ...(finiteNumber(value.sectionScores.skills) !== undefined
                  ? { skills: finiteNumber(value.sectionScores.skills) }
                  : {}),
              ...(finiteNumber(value.sectionScores.education) !== undefined
                  ? { education: finiteNumber(value.sectionScores.education) }
                  : {}),
              ...(finiteNumber(value.sectionScores.overall) !== undefined
                  ? { overall: finiteNumber(value.sectionScores.overall) }
                  : {}),
          }
        : undefined;

    const bulletAnalysis = isRecord(value.bulletAnalysis)
        ? {
              total: finiteNumber(value.bulletAnalysis.total) ?? 0,
              strong: finiteNumber(value.bulletAnalysis.strong) ?? 0,
              moderate: finiteNumber(value.bulletAnalysis.moderate) ?? 0,
              weak: finiteNumber(value.bulletAnalysis.weak) ?? 0,
              score: finiteNumber(value.bulletAnalysis.score) ?? 0,
          }
        : undefined;

    const metricsBullets = isRecord(value.metricsBullets)
        ? {
              total: finiteNumber(value.metricsBullets.total) ?? 0,
              quantified: finiteNumber(value.metricsBullets.quantified) ?? 0,
          }
        : undefined;

    const scoreBreakdown = isRecord(value.scoreBreakdown)
        ? {
              contentScore: finiteNumber(value.scoreBreakdown.contentScore) ?? 0,
              formatPenalty: finiteNumber(value.scoreBreakdown.formatPenalty) ?? 0,
              finalScore: finiteNumber(value.scoreBreakdown.finalScore) ?? 0,
          }
        : undefined;

    const missingKeywordsByCategory = isRecord(value.missingKeywordsByCategory)
        ? {
              required: stringList(value.missingKeywordsByCategory.required),
              preferred: stringList(value.missingKeywordsByCategory.preferred),
              methodologies: stringList(value.missingKeywordsByCategory.methodologies),
          }
        : undefined;

    const keywordPlacement = Array.isArray(value.keywordPlacement)
        ? value.keywordPlacement.flatMap((item): KeywordPlacement[] => {
              if (!isRecord(item) || typeof item.keyword !== "string") return [];
              return [{
                  keyword: item.keyword,
                  inSummary: item.inSummary === true,
                  inSkills: item.inSkills === true,
                  inExperience: item.inExperience === true,
                  needsBetterPlacement: item.needsBetterPlacement === true,
              }];
          })
        : undefined;

    return {
        passed: value.passed === true,
        ...(finiteNumber(value.score) !== undefined ? { score: finiteNumber(value.score) } : {}),
        issues: stringList(value.issues),
        ...(keywordMatch ? { keywordMatch } : {}),
        ...(sectionScores ? { sectionScores } : {}),
        ...(bulletAnalysis ? { bulletAnalysis } : {}),
        ...(finiteNumber(value.metricsRatio) !== undefined
            ? { metricsRatio: finiteNumber(value.metricsRatio) }
            : {}),
        ...(metricsBullets ? { metricsBullets } : {}),
        ...(scoreBreakdown ? { scoreBreakdown } : {}),
        ...(stringList(value.improvements).length > 0
            ? { improvements: stringList(value.improvements) }
            : {}),
        ...(missingKeywordsByCategory ? { missingKeywordsByCategory } : {}),
        ...(keywordPlacement ? { keywordPlacement } : {}),
    };
}

export const ATS_PASS_SCORE = 75;
export const REGENERATION_FEEDBACK_MAX_CHARS = 1_000;

/** Keep generated ATS guidance within the regenerate API's feedback limit. */
export function limitRegenerationFeedback(feedback: string): string {
    const normalized = feedback.trim();
    if (normalized.length <= REGENERATION_FEEDBACK_MAX_CHARS) return normalized;

    const cut = normalized.slice(0, REGENERATION_FEEDBACK_MAX_CHARS);
    const lastSentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("\n"));
    return (lastSentence > REGENERATION_FEEDBACK_MAX_CHARS * 0.7
        ? cut.slice(0, lastSentence + 1)
        : cut
    ).trim();
}

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

    return limitRegenerationFeedback(parts.join("\n\n"));
}
