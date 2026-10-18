import { createHash } from 'node:crypto';

// Builds the daily LinkedIn jobs post: picks fresh US jobs per domain and
// writes commentary that fits LinkedIn's limit. Pure, so it is unit tested.

export type PostDomain = 'software' | 'data' | 'cybersecurity' | 'networking';

export const POST_DOMAINS: ReadonlyArray<{ key: PostDomain; label: string; emoji: string }> = [
  { key: 'software', label: 'Software Engineering', emoji: '💻' },
  { key: 'data', label: 'Data & AI', emoji: '📊' },
  { key: 'cybersecurity', label: 'Cybersecurity', emoji: '🔐' },
  { key: 'networking', label: 'Networking & Cloud', emoji: '🌐' },
];

export const JOBS_PER_DOMAIN = 10;
/** LinkedIn rejects commentary over 3,000 characters; keep a margin. */
export const COMMENTARY_LIMIT = 2_950;

export type CandidateJob = {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  description: string | null;
  jobUrl: string | null;
  postedAt: string | null;
  firstSeenAt: string;
  signalTypes: readonly string[];
};

export type PostItem = {
  code: string;
  jobId: string;
  domain: PostDomain;
  title: string;
  companyName: string;
  location: string | null;
  jobUrl: string;
  postedAt: string | null;
};

// Order matters: a "Cloud Security Engineer" is a security job first and a
// "Data Infrastructure Engineer" a data job.
const DOMAIN_TITLE_PATTERNS: ReadonlyArray<[PostDomain, RegExp]> = [
  [
    'cybersecurity',
    /\b(?:security|cyber\s?security|cyber|infosec|soc analyst|penetration|pen\s?test(?:er|ing)?|appsec|threat|vulnerability|incident response|identity (?:and|&) access|iam engineer|detection engineer|grc)\b/i,
  ],
  [
    'data',
    /\b(?:data|analytics|scientist|machine learning|ml|ai|artificial intelligence|deep learning|nlp|computer vision|llm|business intelligence|bi (?:engineer|developer|analyst)|quantitative)\b/i,
  ],
  [
    'networking',
    /\b(?:network(?:ing)?|noc|wireless|telecom(?:munications)? (?:engineer|technician|analyst)|sd-?wan|data cent(?:er|re)|infrastructure engineer|cloud (?:engineer|architect|infrastructure|operations|platform)|(?<!business )systems? administrator|sysadmin|devops|dev ops|site reliability|sre)\b/i,
  ],
  [
    'software',
    /\b(?:software|developer|programmer|front[- ]?end|back[- ]?end|full[- ]?stack|mobile|ios|android|web|sdet|test automation|qa engineer|firmware|embedded|platform engineer|product engineer|applications? engineer|member of technical staff|forward deployed engineer|compiler|graphics engineer)\b/i,
  ],
];

// Not tech roles even when a domain keyword appears in the title.
const NON_TECH_TITLE =
  /\b(?:sales|account executive|account manager|marketing|recruit(?:er|ing)?|mechanical|electrical|civil|manufacturing|technician|clinical|nurse|therapist|attorney|counsel|paralegal|security officer|security guard|physical security|customer success|support specialist)\b/i;

// Leadership roles rarely fit OPT and STEM OPT job seekers.
const LEADERSHIP_TITLE =
  /\b(?:director|vp|vice president|head of|chief|principal|staff|distinguished|fellow|manager|architect)\b/i;

const SENIOR_TITLE = /\b(?:senior|sr\.?|lead)\b/i;
const EARLY_CAREER_TITLE =
  /\b(?:new grad(?:uate)?|graduate|entry[- ]level|junior|jr\.?|associate|early[- ]career|university|campus|intern(?:ship)?)\b/i;
// "Software Engineer I" / "II"; case-sensitive so a stray "i" never counts.
const EARLY_LEVEL_TITLE = /\b(?:I|II)\b/;

// Roles an F-1 student cannot hold: citizenship, green card or clearance only.
const RESTRICTED_TEXT: readonly RegExp[] = [
  /\bcitizenship\s+(?:is\s+)?required/i,
  /\bmust\s+be\s+(?:a\s+)?U\.?\s?S\.?\s+citizens?/i,
  /\bU\.?\s?S\.?\s+citizens?\s+only/i,
  /\b(?:active|require[sd]?)\s+U\.?\s?S\.?\s+citizen/i,
  // A bare "US Citizen" requirement bullet.
  /\bU\.?\s?S\.?\s+citizen(?:ship)?\s*(?:\||-|–|\(|\.|;|:|$)/i,
  /\bU\.?\s?S\.?\s+citizen(?:ship)?\b[^|]{0,40}\b(?:mandatory|required)\b/i,
  // Export-control roles: an F-1 student is not a "U.S. person".
  /\bU\.?\s?S\.?\s+persons?\b/i,
  /\b(?:active|current|secret|top\s+secret)\s+(?:security\s+)?clearance/i,
  /\b(?:obtain|maintain)\s+(?:and\s+maintain\s+)?(?:an?\s+)?(?:\w+\s+)?(?:security\s+)?clearance/i,
  /\bclearance\s*(?:requirements?\s*)?:/i,
  /\bsecurity\s+clearance\s+requirements?/i,
  // Not the "Employee Polygraph Protection Act" notice in US benefit footers.
  /\bTS\/SCI\b|\bpolygraph\b(?!\s+protection)|\bpublic\s+trust\b|\bITAR\b/i,
  /\bgreen\s+card\s+holders?|\bpermanent\s+residents?\s+only/i,
];

// Federal and defense contractors hire almost only US citizens.
const RESTRICTED_EMPLOYER = /\b(?:federal|government|defen[cs]e|national security)\b/i;

// Talent pools and general applications are not openings.
const NOT_AN_OPENING = /\b(?:talent|general application|future opportunit(?:y|ies)|expression of interest)\b/i;

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&');
}

/** Description as text, with list items and paragraphs separated by " | ". */
export function descriptionText(value: string): string {
  // ATS feeds often escape their HTML, sometimes twice.
  return decodeEntities(decodeEntities(value))
    .replace(/<\/(?:li|p|div|h\d)>|<br\s*\/?>/gi, ' | ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function classifyPostDomain(title: string): PostDomain | null {
  if (NON_TECH_TITLE.test(title) || LEADERSHIP_TITLE.test(title) || NOT_AN_OPENING.test(title)) return null;
  for (const [domain, pattern] of DOMAIN_TITLE_PATTERNS) {
    if (pattern.test(title)) return domain;
  }
  return null;
}

/** False when the posting rules out OPT/STEM OPT candidates. */
export function isOptFriendlyCandidate(job: CandidateJob): boolean {
  if (!job.jobUrl || !/^https?:\/\//i.test(job.jobUrl)) return false;
  if (job.signalTypes.includes('no_sponsorship_stated')) return false;
  if (/\bclearance\b|\bcleared\b|\bTS\/SCI\b/i.test(job.title)) return false;
  if (RESTRICTED_EMPLOYER.test(job.companyName)) return false;
  const text = descriptionText(job.description ?? '');
  return !RESTRICTED_TEXT.some((pattern) => pattern.test(text));
}

function postedTime(job: CandidateJob): number {
  const time = Date.parse(job.postedAt ?? job.firstSeenAt);
  return Number.isFinite(time) ? time : 0;
}

export function rankCandidate(job: CandidateJob, now: Date): number {
  let score = 0;
  if (job.signalTypes.includes('future_sponsorship_stated')) score += 3;
  if (job.signalTypes.includes('opt_accepted_stated')) score += 2;
  if (EARLY_CAREER_TITLE.test(job.title) || EARLY_LEVEL_TITLE.test(job.title)) score += 2;
  if (SENIOR_TITLE.test(job.title)) score -= 3;
  if (now.getTime() - postedTime(job) <= 24 * 3_600_000) score += 1;
  return score;
}

/** Stable seven-character base62 code for a job's short link. */
export function jobLinkCode(jobId: string): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let value = BigInt(`0x${createHash('sha256').update(`linkedin-job:${jobId}`).digest('hex').slice(0, 16)}`);
  let code = '';
  for (let index = 0; index < 7; index += 1) {
    code += alphabet[Number(value % BigInt(62))];
    value /= BigInt(62);
  }
  return code;
}

/**
 * Picks up to JOBS_PER_DOMAIN jobs per domain: OPT-friendly postings only,
 * early-career and sponsorship-positive roles first, at most two per company
 * in a domain and three per company overall.
 */
export function selectDailyJobs(
  candidates: readonly CandidateJob[],
  options: { now: Date; excludeJobIds?: ReadonlySet<string> },
): PostItem[] {
  const seen = new Set<string>();
  const byDomain = new Map<PostDomain, Array<{ job: CandidateJob; score: number }>>();
  for (const job of candidates) {
    // A role posted for several locations appears once.
    const role = `${job.companyName}|${job.title}`.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(job.id) || seen.has(role) || options.excludeJobIds?.has(job.id)) continue;
    seen.add(job.id);
    seen.add(role);
    const domain = classifyPostDomain(job.title);
    if (!domain || !isOptFriendlyCandidate(job)) continue;
    const list = byDomain.get(domain) ?? [];
    list.push({ job, score: rankCandidate(job, options.now) });
    byDomain.set(domain, list);
  }

  const companyTotals = new Map<string, number>();
  const items: PostItem[] = [];
  for (const { key } of POST_DOMAINS) {
    const ranked = (byDomain.get(key) ?? []).sort(
      (a, b) => b.score - a.score || postedTime(b.job) - postedTime(a.job) || a.job.id.localeCompare(b.job.id),
    );
    const companyInDomain = new Map<string, number>();
    let picked = 0;
    for (const { job } of ranked) {
      if (picked >= JOBS_PER_DOMAIN) break;
      const company = job.companyName.trim().toLowerCase();
      if ((companyInDomain.get(company) ?? 0) >= 2 || (companyTotals.get(company) ?? 0) >= 3) continue;
      companyInDomain.set(company, (companyInDomain.get(company) ?? 0) + 1);
      companyTotals.set(company, (companyTotals.get(company) ?? 0) + 1);
      picked += 1;
      items.push({
        code: jobLinkCode(job.id),
        jobId: job.id,
        domain: key,
        title: job.title.trim(),
        companyName: job.companyName.trim(),
        location: job.location,
        jobUrl: job.jobUrl as string,
        postedAt: job.postedAt,
      });
    }
  }
  return items;
}

const LITTLE_TEXT_RESERVED = /[\\|{}@[\]()<>#*_~]/g;

/** Escapes LinkedIn "little text" control characters so text posts verbatim. */
export function escapeLittleText(value: string): string {
  return value.replace(LITTLE_TEXT_RESERVED, (character) => `\\${character}`);
}

function truncate(value: string, max: number): string {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function displayPostDate(postDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${postDate}T12:00:00Z`));
}

export type ComposedPost = { commentary: string; shownCount: number };

/**
 * Writes the post. When every selected job does not fit, the largest
 * domain gives up a job until the text fits; the daily page lists them all.
 */
export function composeDailyPost(
  items: readonly PostItem[],
  options: { postDate: string; siteOrigin: string },
): ComposedPost {
  const groups = POST_DOMAINS.map((domain) => ({
    ...domain,
    items: items.filter((item) => item.domain === domain.key),
  })).filter((group) => group.items.length > 0);
  const shown = new Map(groups.map((group) => [group.key, group.items.length]));

  const render = () => {
    const lines: string[] = [
      escapeLittleText(`🎓 Today's jobs for OPT & STEM OPT job seekers — ${displayPostDate(options.postDate)}`),
      '',
      escapeLittleText(
        'Fresh US openings from verified company career pages, picked for international students and grads. Tap a link for the details and the apply link.',
      ),
    ];
    for (const group of groups) {
      const count = shown.get(group.key) ?? 0;
      if (count === 0) continue;
      lines.push('', escapeLittleText(`${group.emoji} ${group.label}`));
      for (const item of group.items.slice(0, count)) {
        lines.push(
          `${escapeLittleText(`• ${truncate(item.title, 55)} at ${truncate(item.companyName, 30)}`)} → ${options.siteOrigin}/j/${item.code}`,
        );
      }
    }
    const shownTotal = [...shown.values()].reduce((sum, count) => sum + count, 0);
    lines.push(
      '',
      escapeLittleText("✨ Tailor your resume to any of these jobs with TrackMyOPT's AI resume builder — start free."),
      `${escapeLittleText(
        shownTotal < items.length ? `🔎 See all ${items.length} of today's picks:` : "🔎 Today's picks on one page:",
      )} ${options.siteOrigin}/opt-jobs/${options.postDate}`,
      `${escapeLittleText('📌 Browse thousands more on our free job board:')} ${options.siteOrigin}/dashboard/career/jobs`,
      '',
      escapeLittleText('Always confirm visa sponsorship and E-Verify with the employer before you apply.'),
      '',
      '#OPT #STEMOPT #F1Visa #InternationalStudents #H1B #Hiring #Jobs',
    );
    return { commentary: lines.join('\n'), shownCount: shownTotal };
  };

  let post = render();
  while (post.commentary.length > COMMENTARY_LIMIT && post.shownCount > 0) {
    let largest = groups[0].key;
    for (const group of groups) {
      if ((shown.get(group.key) ?? 0) >= (shown.get(largest) ?? 0)) largest = group.key;
    }
    shown.set(largest, (shown.get(largest) ?? 0) - 1);
    post = render();
  }
  return post;
}
