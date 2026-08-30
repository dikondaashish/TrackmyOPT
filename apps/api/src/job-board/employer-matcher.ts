export type MatchMethod = 'exact' | 'alias' | 'reviewed';
export type ReviewStatus = 'auto' | 'pending_review' | 'confirmed' | 'rejected';

export interface SponsorCandidate {
  id: string;
  name: string;
  aliases?: string[];
}

export interface EmployerMatchDecision {
  canonicalH1bSponsorId: string | null;
  matchMethod: MatchMethod;
  confidence: number;
  reviewStatus: ReviewStatus;
}

// Deliberately retain entity suffixes. Removing LLC/Inc/LP would merge legally
// distinct employers and is precisely the failure mode this layer prevents.
export function normalizeEmployerName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function collisionKey(name: string): string {
  return normalizeEmployerName(name)
    .replace(
      /\b(incorporated|inc|llc|ltd|limited|corp|corporation|company|co|lp|llp|pllc)\b/g,
      ' ',
    )
    .trim()
    .replace(/\s+/g, ' ');
}

export function decideEmployerMatch(
  jobSourceCompanyName: string,
  candidates: SponsorCandidate[],
): EmployerMatchDecision {
  const normalized = normalizeEmployerName(jobSourceCompanyName);
  const ambiguousEntities = candidates.filter(
    (candidate) =>
      collisionKey(candidate.name) === collisionKey(jobSourceCompanyName),
  );
  if (ambiguousEntities.length > 1) {
    return {
      canonicalH1bSponsorId: null,
      matchMethod: 'exact',
      confidence: 0,
      reviewStatus: 'pending_review',
    };
  }
  const exact = candidates.filter(
    (candidate) => normalizeEmployerName(candidate.name) === normalized,
  );
  if (exact.length === 1) {
    return {
      canonicalH1bSponsorId: exact[0].id,
      matchMethod: 'exact',
      confidence: 0.99,
      reviewStatus: 'auto',
    };
  }

  const alias = candidates.filter((candidate) =>
    candidate.aliases?.some(
      (value) => normalizeEmployerName(value) === normalized,
    ),
  );
  if (alias.length === 1) {
    return {
      canonicalH1bSponsorId: alias[0].id,
      matchMethod: 'alias',
      confidence: 0.9,
      reviewStatus: 'auto',
    };
  }

  return {
    canonicalH1bSponsorId: null,
    matchMethod: 'exact',
    confidence: 0,
    reviewStatus: 'pending_review',
  };
}
