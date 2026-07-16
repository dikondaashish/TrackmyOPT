/**
 * Visa-sponsorship signal for the job widget.
 *
 * Pure, side-effect-free classifier over the extracted job-description text.
 * Runs entirely client-side (no API, no AI cost) — its only job is to give an
 * OPT student an at-a-glance read on whether a posting rules out sponsorship
 * BEFORE they spend 40 minutes applying.
 *
 * Design rules:
 *  - Never guess. Anything not explicitly stated is `unclear`.
 *  - "Must be authorized to work in the US" is NOT a no-sponsorship signal —
 *    OPT/CPT holders ARE authorized. Only explicit exclusions count.
 *  - No-sponsorship statements are checked first and are crafted to catch
 *    negated-sponsor phrasing ("no H-1B sponsorship", "we do not offer visa
 *    sponsorship"), so a bare "H-1B" elsewhere cannot flip a red posting green.
 */

export type SponsorshipSignal = 'sponsors' | 'no_sponsorship' | 'unclear';

export interface SponsorshipResult {
  signal: SponsorshipSignal;
  /** The phrase we matched (real casing), for the tooltip. */
  matchedPhrase?: string;
  /** The sentence the phrase appeared in, trimmed, for the tooltip. */
  matchedSentence?: string;
}

/** Below this length the JD is almost certainly not fully loaded/extracted. */
const MIN_LENGTH = 200;

// Gap helper: allow up to `n` short tokens between two anchors so phrasings
// like "does not offer H-1B visa sponsorship" still match "not ... sponsorship".
// Deliberately excludes '.' from the token/separator so a gap can never jump a
// sentence boundary (which would wrongly join "not offering relocation."
// with a later "Sponsorship is available.").
const GAP = (n = 3) => `(?:[a-z0-9'-]+[\\s,]+){0,${n}}`;

/**
 * Explicit no-sponsorship statements. Checked first; a match here binds the
 * result to `no_sponsorship` regardless of any positive keyword elsewhere.
 */
const NO_SPONSORSHIP: RegExp[] = [
  // negated verbs: will/does not, cannot, unable/not able to (provide|offer) sponsor(ship)
  new RegExp(
    `\\b(?:will\\s+not|won't|do(?:es)?\\s+not|don't|doesn't|cannot|can't|could\\s+not|couldn't|unable\\s+to|not\\s+able\\s+to|are\\s+not\\s+able\\s+to|is\\s+not\\s+able\\s+to)\\s+${GAP()}(?:sponsor|sponsorship)`,
  ),
  // "not (currently) offering/providing/considering ... sponsorship"
  // (e.g. "not considering candidates who require sponsorship")
  new RegExp(`\\bnot\\s+(?:currently\\s+)?${GAP()}(?:offer|offering|provide|providing|consider|considering|accept|accepting|entertain|entertaining)\\s+${GAP(4)}sponsorship`),
  // "no (h-1b/visa/work/employment) sponsorship"
  new RegExp(`\\bno\\s+${GAP()}sponsorship`),
  // "without (the need for) (visa/employer) sponsorship"
  new RegExp(`\\bwithout\\s+${GAP()}sponsorship`),
  // "sponsorship is unavailable / is not available"
  new RegExp(`\\bsponsorship\\s+(?:is\\s+)?(?:not\\s+available|unavailable)`),
  // "does not offer/provide sponsorship"
  new RegExp(`\\b(?:does\\s+not|do\\s+not|doesn't|don't)\\s+${GAP()}(?:offer|provide)s?\\s+${GAP(2)}sponsorship`),
  // Citizenship / residency exclusions (imply no sponsorship for OPT holders).
  // These require an affirmative requirement/"only" cue; a bare mention of
  // citizenship must not turn "citizenship is not required" into a false red.
  new RegExp(`\\b(?:u\\.?s\\.?|united\\s+states)\\s+citizens?\\s+only`),
  new RegExp(`\\b(?:u\\.?s\\.?|united\\s+states)\\s+citizenship\\s+(?:is\\s+)?required`),
  new RegExp(`\\bcit(?:izen|izenship)\\s+(?:is\\s+)?required`),
  new RegExp(`\\bmust\\s+(?:be|hold|have)\\s+(?:a\\s+)?(?:u\\.?s\\.?|united\\s+states)\\s+cit(?:izen|izenship)`),
  new RegExp(`\\b(?:green\\s+card\\s+holders?|permanent\\s+residents?)\\s+only`),
  // Security-clearance exclusions likewise require an affirmative cue. The
  // negative lookbehind prevents "no active security clearance is required".
  new RegExp(`(?<!no\\s)(?<!not\\s)\\b(?:active\\s+)?(?:security\\s+)?clearance\\s+(?:is\\s+)?required`),
  new RegExp(`\\bmust\\s+(?:have|hold|possess|obtain|maintain)\\s+${GAP(2)}(?:security\\s+)?clearance`),
];

/** Explicit positive sponsorship statements. */
const SPONSORS: RegExp[] = [
  new RegExp(`\\bvisa\\s+sponsorship\\s+(?:is\\s+)?(?:available|offered|provided|possible)`),
  new RegExp(`\\bsponsorship\\s+(?:is\\s+)?(?:available|offered|provided|possible)`),
  new RegExp(`\\b(?:will|can|do|happy\\s+to|able\\s+to|open\\s+to|willing\\s+to)\\s+sponsor(?:ing|ship)?`),
  new RegExp(`\\bwe\\s+sponsor\\b`),
  new RegExp(`\\bwe\\s+(?:provide|offer)\\s+${GAP(2)}sponsorship`),
  new RegExp(`\\b(?:h-?1b|h1-?b)\\s+${GAP(2)}(?:sponsor|transfer|candidates?\\s+welcome)`),
  new RegExp(`\\bimmigration\\s+(?:support|assistance|sponsorship)`),
  new RegExp(`\\bvisa\\s+candidates?\\s+(?:welcome|encouraged)`),
  new RegExp(`\\b(?:opt|cpt|stem\\s+opt)\\b\\s+${GAP(3)}(?:welcome|eligible|accepted|considered|encouraged)`),
];

function findSentence(original: string, lowerIndex: number, matchLength: number): string {
  // Lowercasing preserves indices, so the match maps 1:1 onto the original.
  // Mask periods in common abbreviations without changing string length; the
  // period in "U.S." is not a sentence boundary and must not hide a leading
  // negation such as "No U.S. citizenship is required".
  const boundaries = original.replace(/\b(?:u\.s\.|e\.g\.|i\.e\.)/gi, (value) => value.replace(/\./g, ' '));
  const start = Math.max(
    boundaries.lastIndexOf('.', lowerIndex),
    boundaries.lastIndexOf('\n', lowerIndex),
    boundaries.lastIndexOf('!', lowerIndex),
    boundaries.lastIndexOf('?', lowerIndex),
  );
  let end = lowerIndex + matchLength;
  const stops = ['.', '\n', '!', '?']
    .map((c) => boundaries.indexOf(c, end))
    .filter((i) => i !== -1);
  if (stops.length) end = Math.min(...stops);
  return original
    .slice(start + 1, end + 1)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function firstMatch(
  patterns: RegExp[],
  lower: string,
  original: string,
  accept?: (match: { phrase: string; sentence: string }) => boolean,
): { phrase: string; sentence: string } | null {
  for (const re of patterns) {
    const matcher = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const m of lower.matchAll(matcher)) {
      const phrase = original.slice(m.index, m.index + m[0].length).replace(/\s+/g, ' ').trim();
      const result = { phrase, sentence: findSentence(original, m.index, m[0].length) };
      if (!accept || accept(result)) return result;
    }
  }
  return null;
}

/** A requirement keyword inside an explicit "not required" sentence is not an exclusion. */
function isNegatedWorkAuthRequirement(match: { phrase: string; sentence: string }): boolean {
  if (!/citizen|clearance/i.test(match.phrase)) return false;
  const sentence = match.sentence.toLowerCase();
  const subject = String.raw`(?:u\.?s\.?\s+)?cit(?:izen|izenship)s?|(?:active\s+)?(?:security\s+)?clearance`;
  return (
    new RegExp(`\\b(?:${subject})\\b[^.!?]{0,25}\\bnot\\s+required\\b`).test(sentence) ||
    new RegExp(`\\bno\\b[^.!?]{0,60}\\b(?:${subject})\\b[^.!?]{0,25}\\brequired\\b`).test(sentence) ||
    new RegExp(`\\bdo(?:es)?\\s+not\\s+require\\b[^.!?]{0,60}\\b(?:${subject})\\b`).test(sentence)
  );
}

/**
 * Classify a job description's sponsorship stance. Reads only the text passed
 * in; the caller supplies the extracted posting (see `scrapeJobDescription`).
 */
export function classifySponsorship(jobDescription: string): SponsorshipResult {
  const original = (jobDescription || '').replace(/\r\n/g, '\n');
  if (original.trim().length < MIN_LENGTH) return { signal: 'unclear' };

  const lower = original.toLowerCase();

  const no = firstMatch(
    NO_SPONSORSHIP,
    lower,
    original,
    (match) => !isNegatedWorkAuthRequirement(match),
  );
  if (no) return { signal: 'no_sponsorship', matchedPhrase: no.phrase, matchedSentence: no.sentence };

  const yes = firstMatch(SPONSORS, lower, original);
  if (yes) return { signal: 'sponsors', matchedPhrase: yes.phrase, matchedSentence: yes.sentence };

  return { signal: 'unclear' };
}
