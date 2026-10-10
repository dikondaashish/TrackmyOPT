export interface NormalizedJobFitAnalysis {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  gapSummary: string;
}

function keywordList(value: unknown, limit = 12): string[] {
  if (!Array.isArray(value)) return [];
  const unique = new Set<string>();
  for (const item of value) {
    const keyword = String(item ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (keyword) unique.add(keyword);
    if (unique.size >= limit) break;
  }
  return [...unique];
}

/** Normalize the AI route's permissive JSON into the extension's safe contract. */
export function normalizeJobFitAnalysis(value: unknown): NormalizedJobFitAnalysis {
  const data = value && typeof value === 'object'
    ? value as Record<string, unknown>
    : {};
  const rawScore = typeof data.matchScore === 'number' && Number.isFinite(data.matchScore)
    ? data.matchScore
    : 0;
  return {
    matchScore: Math.max(0, Math.min(100, Math.round(rawScore))),
    matchedKeywords: keywordList(data.foundKeywords),
    missingKeywords: keywordList(data.missingKeywords),
    gapSummary: typeof data.gapAnalysis === 'string'
      ? data.gapAnalysis.trim().slice(0, 600)
      : '',
  };
}

/** The shared ATS quota historically used both 402 and 429 response codes. */
export function isJobFitLimitResponse(status: number, code?: unknown): boolean {
  return status === 402 || status === 429 || code === 'ats_scan_limit_reached';
}
