/**
 * Degree equivalence for application dropdowns. A resume says "Master of
 * Science"; portals offer "Master's Degree", "MS", or "Masters". Matching is by
 * degree level, then by field (science/arts/engineering) when several options
 * share a level. Anything still ambiguous selects nothing.
 */

export type DegreeLevel =
  | 'high_school'
  | 'associate'
  | 'bachelor'
  | 'master'
  | 'mba'
  | 'doctorate'
  | 'jd'
  | 'md';

type DegreeKind = 'science' | 'arts' | 'engineering' | 'technology' | 'commerce' | 'applications';

interface DegreeIdentity {
  level: DegreeLevel;
  kind?: DegreeKind;
}

function compact(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[’']/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const LEVEL_RULES: ReadonlyArray<[DegreeLevel, RegExp]> = [
  // Specific professional degrees first so "Doctor of Medicine" is not a PhD.
  ['md', /\b(?:md|doctor of medicine)\b/],
  ['jd', /\b(?:jd|juris doctor(?:ate)?)\b/],
  ['mba', /\b(?:mba|master of business administration|masters? in business administration)\b/],
  ['doctorate', /\b(?:phd|dphil|edd|doctorate|doctoral|doctor of philosophy|doctor of)\b/],
  ['master', /\b(?:masters?|master of|ms|msc|ma|meng|mtech|mca|mfa|mph|mpa|mse|msee|mscs|mcs)\b/],
  ['bachelor', /\b(?:bachelors?|bachelor of|undergraduate degree|bs|bsc|ba|be|beng|btech|bca|bcom|bba|bfa|bse)\b/],
  ['associate', /\b(?:associates?|associate of|aa|as|aas)\b/],
  ['high_school', /\b(?:high school|secondary school|ged)\b/],
];

const KIND_RULES: ReadonlyArray<[DegreeKind, RegExp]> = [
  ['engineering', /\b(?:engineering|meng|beng|be|bse|mse|msee)\b/],
  ['technology', /\b(?:technology|mtech|btech)\b/],
  ['commerce', /\b(?:commerce|bcom)\b/],
  ['applications', /\b(?:computer applications|mca|bca)\b/],
  ['arts', /\b(?:arts|ma|ba|mfa|bfa)\b/],
  ['science', /\b(?:science|sciences|ms|msc|bs|bsc|mscs|mcs)\b/],
];

export function degreeIdentity(value: string): DegreeIdentity | undefined {
  const text = compact(value);
  if (!text) return undefined;
  const level = LEVEL_RULES.find(([, pattern]) => pattern.test(text))?.[0];
  if (!level) return undefined;
  const kind = KIND_RULES.find(([, pattern]) => pattern.test(text))?.[0];
  return kind ? { level, kind } : { level };
}

/**
 * Index of the single option that represents `desired`, or -1.
 * Exact text wins; then the one option of the same level; then, among several
 * same-level options, the one of the same kind, or the one generic option
 * ("Master's Degree") that names no kind.
 */
export function matchDegreeOption(options: readonly string[], desired: string): number {
  const wanted = compact(desired);
  const exact = options.map(compact).flatMap((text, index) => (text === wanted ? [index] : []));
  if (exact.length === 1) return exact[0];
  const identity = degreeIdentity(desired);
  if (!identity) return -1;
  const sameLevel = options
    .map((text, index) => ({ index, identity: degreeIdentity(text) }))
    .filter(entry => entry.identity?.level === identity.level);
  if (sameLevel.length === 1) return sameLevel[0].index;
  if (sameLevel.length === 0) {
    // An MBA is a master's degree; a list with only a generic master's option
    // still describes it correctly.
    if (identity.level === 'mba') {
      const masters = options
        .map((text, index) => ({ index, identity: degreeIdentity(text) }))
        .filter(entry => entry.identity?.level === 'master' && !entry.identity.kind);
      return masters.length === 1 ? masters[0].index : -1;
    }
    return -1;
  }
  if (identity.kind) {
    const sameKind = sameLevel.filter(entry => entry.identity?.kind === identity.kind);
    if (sameKind.length === 1) return sameKind[0].index;
    if (sameKind.length > 1) return -1;
  }
  const generic = sameLevel.filter(entry => !entry.identity?.kind);
  return generic.length === 1 ? generic[0].index : -1;
}
