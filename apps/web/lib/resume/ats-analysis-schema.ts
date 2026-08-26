import { z } from 'zod';

const score = z.number().finite().min(0).max(100);
const keywordList = z.array(z.string().trim().min(1).max(160)).max(250);

/**
 * The AI response is untrusted input. Keep this schema aligned with the ATS
 * prompt so we never display a fabricated zero-score result after a provider
 * failure or malformed model response.
 */
export const AtsScanAiResponseSchema = z
  .object({
    overallScore: score,
    keywordMatch: z.object({
      found: keywordList,
      missing: keywordList,
      partial: keywordList,
      score,
      totalJdKeywords: z.number().int().nonnegative().max(250),
      matchedCount: z.number().int().nonnegative().max(250),
      placementScore: score,
    }),
    sectionScores: z.object({
      summary: score,
      experience: score,
      skills: score,
      education: score,
      overall: score,
    }),
    bulletAnalysis: z.object({
      total: z.number().int().nonnegative().max(500),
      strong: z.number().int().nonnegative().max(500),
      moderate: z.number().int().nonnegative().max(500),
      weak: z.number().int().nonnegative().max(500),
      score,
    }),
    improvements: z.array(z.string().trim().min(1).max(1_000)).min(1).max(20),
    missingKeywordsByCategory: z.object({
      required: keywordList,
      preferred: keywordList,
      methodologies: keywordList,
    }),
  })
  .superRefine((analysis, context) => {
    if (analysis.keywordMatch.matchedCount > analysis.keywordMatch.totalJdKeywords) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'matchedCount cannot exceed totalJdKeywords',
        path: ['keywordMatch', 'matchedCount'],
      });
    }

    const classifiedBullets =
      analysis.bulletAnalysis.strong +
      analysis.bulletAnalysis.moderate +
      analysis.bulletAnalysis.weak;
    if (classifiedBullets !== analysis.bulletAnalysis.total) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Each bullet must have exactly one quality classification',
        path: ['bulletAnalysis'],
      });
    }
  });

export type AtsScanAiResponse = z.infer<typeof AtsScanAiResponseSchema>;

function removeJsonFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

/** Returns null rather than a fallback score when the provider result is unusable. */
export function parseAtsScanAiResponse(value: string): AtsScanAiResponse | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(removeJsonFence(value));
  } catch {
    return null;
  }

  const result = AtsScanAiResponseSchema.safeParse(parsed);
  return result.success ? result.data : null;
}
