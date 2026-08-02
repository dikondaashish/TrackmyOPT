export type JobDescriptionSource = 'frame' | 'specific' | 'outer' | 'listing';

export interface JobDescriptionCandidate {
  source: JobDescriptionSource;
  text: string;
}

const SOURCE_PRIORITY: Record<JobDescriptionSource, number> = {
  listing: 4,
  frame: 3,
  specific: 2,
  outer: 1,
};

/** Select the real posting text deterministically. Listing fetches and
 * job-content frames outrank outer branding/footer pages; within the same
 * source, the fuller text wins. */
export function chooseJobDescriptionCandidate(
  candidates: JobDescriptionCandidate[],
  maxLength = 15_000,
): string {
  const valid = candidates
    .map((candidate) => ({
      ...candidate,
      text: candidate.text.replace(/\r\n/g, '\n').trim(),
    }))
    .filter((candidate) => candidate.text.length > 200)
    .sort(
      (a, b) =>
        SOURCE_PRIORITY[b.source] - SOURCE_PRIORITY[a.source] ||
        b.text.length - a.text.length,
    );
  return (valid[0]?.text || '').slice(0, maxLength);
}

/** Strip tags for CXS / embedded HTML job descriptions (no DOM required). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const APPLY_PATH_SEGMENT_RE =
  /\/(apply|application|autofillwithresume|startapply|jobapplication)(\/|$)/i;
const APPLY_QUERY_KEYS = [
  'mode',
  'apply',
  'application',
  'gh_src',
] as const;

/**
 * When the user is on an ATS apply/application route, return the sibling
 * listing URL that usually still hosts the real job description.
 * Covers Workday, Jobvite, Greenhouse, Lever, Ashby, iCIMS, SmartRecruiters, etc.
 */
export function deriveJobListingUrl(href: string): string | null {
  try {
    const url = new URL(href);
    let pathname = url.pathname;
    let changed = false;

    // Workday: .../job/{loc}/{slug}/apply/autofillWithResume → cut at /apply
    const workdayApply = pathname.match(
      /^(\/.*?\/job\/.+?)\/(?:apply|application)(?:\/.*)?$/i,
    );
    if (workdayApply?.[1]) {
      pathname = workdayApply[1];
      changed = true;
    } else if (APPLY_PATH_SEGMENT_RE.test(pathname)) {
      pathname =
        pathname.replace(
          /\/(apply|application|autofillwithresume|startapply|jobapplication)(\/.*)?$/i,
          '',
        ) || '/';
      changed = true;
    }

    // Lever / Greenhouse style: trailing /apply with no extra segments already handled.
    // Ashby: /jobs/{id}/application → /jobs/{id}
    if (/\/application\/?$/i.test(pathname)) {
      pathname = pathname.replace(/\/application\/?$/i, '') || '/';
      changed = true;
    }

    for (const key of APPLY_QUERY_KEYS) {
      const value = url.searchParams.get(key);
      if (!value) continue;
      if (key === 'mode') {
        if (
          !/^apply/i.test(value) &&
          value !== '1' &&
          value.toLowerCase() !== 'yes'
        ) {
          continue;
        }
      }
      // Keep Greenhouse source tracking on listing; only strip apply-mode flags.
      if (key === 'gh_src') continue;
      url.searchParams.delete(key);
      changed = true;
    }

    if (!changed) return null;

    url.pathname = pathname.replace(/\/+$/, '') || '/';
    url.hash = '';
    const next = url.toString();
    return next === href ? null : next;
  } catch {
    return null;
  }
}

/**
 * Workday career sites are SPAs — HTML fetches of the listing often have no JD.
 * Build the public CXS job detail URL used by the careers frontend instead.
 *
 * Example:
 *   https://interpublic.wd5.myworkdayjobs.com/en-US/OMC/job/.../Slug/apply/...
 * → https://interpublic.wd5.myworkdayjobs.com/wday/cxs/interpublic/OMC/job/.../Slug
 */
export function buildWorkdayCxsJobUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (!/(?:^|\.)(?:myworkdayjobs|myworkday)\.com$/i.test(url.hostname)) {
      return null;
    }

    const hostMatch = url.hostname.match(
      /^([a-z0-9-]+)\.wd\d+\.myworkdayjobs\.com$/i,
    );
    const tenant = hostMatch?.[1];
    if (!tenant) return null;

    const segments = url.pathname.split('/').filter(Boolean);
    const jobIndex = segments.findIndex(
      (segment) => segment.toLowerCase() === 'job',
    );
    if (jobIndex < 1) return null;

    const localeRe = /^[a-z]{2}(?:-[a-z]{2})?$/i;
    // /{locale}/{site}/job/... or /{site}/job/...
    const site =
      jobIndex >= 2 && localeRe.test(segments[jobIndex - 2] || '')
        ? segments[jobIndex - 1]
        : segments[jobIndex - 1];
    if (!site || localeRe.test(site)) return null;

    const applyIndex = segments.findIndex(
      (segment, index) =>
        index > jobIndex && segment.toLowerCase() === 'apply',
    );
    const jobSegments = segments.slice(
      jobIndex,
      applyIndex >= 0 ? applyIndex : undefined,
    );
    if (jobSegments.length < 2) return null;

    const jobPath = jobSegments
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return `${url.origin}/wday/cxs/${encodeURIComponent(tenant)}/${encodeURIComponent(site)}/${jobPath}`;
  } catch {
    return null;
  }
}

export function extractWorkdayJobDescriptionFromCxs(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const root = payload as Record<string, unknown>;
  const info =
    (root.jobPostingInfo as Record<string, unknown> | undefined) || root;
  const html =
    (typeof info.jobDescription === 'string' && info.jobDescription) ||
    (typeof info.description === 'string' && info.description) ||
    (typeof root.jobDescription === 'string' && root.jobDescription) ||
    '';
  if (!html) return '';
  const title =
    (typeof info.title === 'string' && info.title) ||
    (typeof root.title === 'string' && root.title) ||
    '';
  const location =
    (typeof info.location === 'string' && info.location) ||
    (typeof info.additionalLocations === 'string' &&
      info.additionalLocations) ||
    '';
  const body = htmlToPlainText(html);
  return [title, location, body].filter(Boolean).join('\n\n').trim();
}

const APPLICATION_FORM_MARKERS = [
  /\badd resume\b/i,
  /\bautofill with resume\b/i,
  /\bupload (?:a )?resume\b/i,
  /\bfirst name\b/i,
  /\blast name\b/i,
  /\bselect an option\b/i,
  /\bsend application\b/i,
  /\bsubmit application\b/i,
  /\bpersonal information\b/i,
  /\bmy information\b/i,
  /\bmy experience\b/i,
  /\bview full application form\b/i,
  /\bplease fill the required fields\b/i,
  /\bcell phone\b/i,
  /\bsms consent\b/i,
  /\bhow did you hear\b/i,
  /\bhave you previously worked\b/i,
  /\bare you legally authorized\b/i,
  /\bvoluntary self[- ]identification\b/i,
  /\bequal employment opportunity\b/i,
  /\bcover letter\b/i,
];

const REAL_POSTING_MARKERS = [
  /\bresponsibilities\b/i,
  /\bqualifications\b/i,
  /\brequirements\b/i,
  /\bwhat you(?:'|’)ll (?:do|need|bring)\b/i,
  /\bwhat we(?:'|’)re looking for\b/i,
  /\babout the (?:role|job|position)\b/i,
  /\bjob description\b/i,
  /\byears of experience\b/i,
  /\bpreferred qualifications\b/i,
  /\bminimum qualifications\b/i,
  /\babout (?:us|the company|the team)\b/i,
];

/**
 * True when scraped “JD” text is mostly the application form chrome — common
 * on apply routes where the real posting lives on the listing URL / CXS API.
 */
export function looksLikeApplicationFormText(text: string): boolean {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return true;
  const formHits = APPLICATION_FORM_MARKERS.reduce(
    (count, re) => count + (re.test(normalized) ? 1 : 0),
    0,
  );
  const postingHits = REAL_POSTING_MARKERS.reduce(
    (count, re) => count + (re.test(normalized) ? 1 : 0),
    0,
  );
  if (formHits >= 2 && postingHits === 0) return true;
  if (formHits >= 3 && postingHits <= 1) return true;
  // Long Workday/Greenhouse wizards can include a short blurb plus many fields.
  if (formHits >= 4 && postingHits <= 2 && normalized.length > 1200) return true;
  return false;
}

export function looksLikeRealJobPostingText(text: string): boolean {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length < 400) return false;
  if (looksLikeApplicationFormText(normalized)) return false;
  const postingHits = REAL_POSTING_MARKERS.reduce(
    (count, re) => count + (re.test(normalized) ? 1 : 0),
    0,
  );
  return postingHits >= 1 || normalized.length >= 1200;
}

/**
 * Fetch listing/CXS whenever we are on an apply route. Do not require the
 * apply-page scrape to already look like a form — Workday/Greenhouse often
 * mix a short blurb with form fields.
 */
export function shouldFetchListingJobDescription(
  pageUrl: string,
  scrapedText: string,
): boolean {
  const listingUrl = deriveJobListingUrl(pageUrl);
  if (listingUrl) return true;
  // Some portals keep the same URL for apply steps; still recover when the
  // on-page scrape is clearly form chrome.
  return looksLikeApplicationFormText(scrapedText);
}

/** Stable cache key for a posting (listing URL when on apply). */
export function jobDescriptionCacheKey(pageUrl: string): string {
  return deriveJobListingUrl(pageUrl) || pageUrl.split('#')[0] || pageUrl;
}
