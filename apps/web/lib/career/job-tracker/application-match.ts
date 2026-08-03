interface ApplicationMatchCandidate {
  id?: string;
  company_name: string;
  role_title: string;
  job_url?: string | null;
  status?: string | null;
  applied_at?: string | null;
  created_at?: string | null;
}

interface SimilarApplication {
  roleTitle: string;
  companyName: string;
  appliedAt: string | null;
  similarity: number;
}

const COMPANY_SUFFIX_RE = /\b(?:incorporated|inc|corporation|corp|company|co|limited|ltd|llc|plc)\b/g;
const LEVEL_TOKENS = new Set(['senior', 'sr', 'junior', 'jr', 'staff', 'principal', 'lead', 'entry', 'associate', 'i', 'ii', 'iii', 'iv', '1', '2', '3', '4']);
const GENERIC_ROLE_TOKENS = new Set(['engineer', 'manager', 'analyst', 'specialist', 'consultant', 'developer']);

function normalizeCompany(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(COMPANY_SUFFIX_RE, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function roleTokens(value: string): Set<string> {
  const normalized = value
    .toLowerCase()
    .replace(/front[\s-]*end/g, 'frontend')
    .replace(/back[\s-]*end/g, 'backend')
    .replace(/full[\s-]*stack/g, 'fullstack')
    .replace(/developers?/g, 'engineer')
    .replace(/[^a-z0-9]+/g, ' ');
  return new Set(normalized.split(/\s+/).filter((token) => token && !LEVEL_TOKENS.has(token)));
}

function roleSimilarity(left: string, right: string): number {
  const a = roleTokens(left);
  const b = roleTokens(right);
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = [...a].filter((token) => b.has(token));
  const distinctiveIntersection = intersection.filter((token) => !GENERIC_ROLE_TOKENS.has(token));
  if (intersection.length < 2 && distinctiveIntersection.length === 0) return 0;
  return intersection.length / Math.min(a.size, b.size);
}

function comparableUrl(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString();
  } catch {
    return value.split('#')[0];
  }
}

/** Find the closest prior non-Wishlist application at the same company. */
export function findSimilarApplication(
  candidates: ApplicationMatchCandidate[],
  current: { companyName: string; roleTitle: string; currentJobUrl?: string },
): SimilarApplication | null {
  const company = normalizeCompany(current.companyName);
  const currentUrl = comparableUrl(current.currentJobUrl);
  if (!company || !current.roleTitle.trim()) return null;

  const matches = candidates
    .filter((candidate) => normalizeCompany(candidate.company_name) === company)
    .filter((candidate) => String(candidate.status || '').toLowerCase() !== 'wishlist')
    .filter((candidate) => !currentUrl || comparableUrl(candidate.job_url) !== currentUrl)
    .map((candidate) => ({ candidate, similarity: roleSimilarity(current.roleTitle, candidate.role_title) }))
    .filter(({ similarity }) => similarity >= 0.7)
    .sort((a, b) => {
      if (b.similarity !== a.similarity) return b.similarity - a.similarity;
      const bDate = Date.parse(b.candidate.applied_at || b.candidate.created_at || '') || 0;
      const aDate = Date.parse(a.candidate.applied_at || a.candidate.created_at || '') || 0;
      return bDate - aDate;
    });

  const best = matches[0];
  if (!best) return null;
  return {
    roleTitle: best.candidate.role_title,
    companyName: best.candidate.company_name,
    appliedAt: best.candidate.applied_at || best.candidate.created_at?.slice(0, 10) || null,
    similarity: Number(best.similarity.toFixed(2)),
  };
}
