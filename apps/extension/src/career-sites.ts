/**
 * Career site detection — single source of truth for all job board / career page
 * identification logic. Add or remove entries here to expand/shrink coverage.
 */

// ── Major job board hostnames (bare domain; www prefix stripped before comparison) ──
export const JOB_BOARD_HOSTS: readonly string[] = [
  // Global
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'monster.com',
  'ziprecruiter.com',
  'simplyhired.com',
  'careerbuilder.com',
  'dice.com',
  'wellfound.com',         // ex-AngelList Talent
  'weworkremotely.com',
  'remote.co',
  'flexjobs.com',
  'hired.com',
  'joinhandshake.com',
  'otta.com',
  'builtin.com',
  'getwork.org',
  // India / South Asia
  'naukri.com',
  'shine.com',
  'foundit.in',
  'instahyre.com',
  'apna.co',
  'internshala.com',
  'freshersworld.com',
  'timesjobs.com',
  'iimjobs.com',
  'cutshort.io',
  // Gulf / MENA
  'naukrigulf.com',
  'bayt.com',
  'gulftalent.com',
];

// ── ATS / employer-portal host suffixes (matched at end of hostname) ───────────
// Each entry must start with a dot, e.g. '.greenhouse.io'
export const ATS_HOST_SUFFIXES: readonly string[] = [
  '.myworkdayjobs.com',    // Workday
  '.greenhouse.io',        // Greenhouse (boards.greenhouse.io, company.greenhouse.io)
  '.lever.co',             // Lever (jobs.lever.co)
  '.icims.com',            // iCIMS
  '.taleo.net',            // Taleo / Oracle
  '.brassring.com',        // Brassring / Kenexa
  '.successfactors.com',   // SAP SuccessFactors
  '.smartrecruiters.com',  // SmartRecruiters
  '.jazzhr.com',           // JazzHR
  '.bamboohr.com',         // BambooHR
  '.recruitee.com',        // Recruitee
  '.ashbyhq.com',          // Ashby
  '.jobvite.com',          // Jobvite
  '.comeet.com',           // Comeet
  '.dover.com',            // Dover
  '.workable.com',         // Workable
  '.teamtailor.com',       // Teamtailor
  '.rippling.com',         // Rippling
  '.pinpointhq.com',       // Pinpoint
  '.applytojob.com',       // ApplyToJob
  '.eightfold.ai',         // Eightfold
  '.beamery.com',          // Beamery
  '.avature.net',          // Avature
  '.snagajob.com',         // Snagajob
  '.breezyhr.com',         // Breezy HR
  '.freshteam.com',        // Freshteam
  '.recruitcrm.io',        // RecruitCRM
  '.jobadder.com',         // JobAdder
  '.personio.de',          // Personio
  '.oraclecloud.com',      // Oracle HCM Cloud
];

// ── Subdomain prefixes that indicate a company career site ────────────────────
// e.g. careers.stripe.com, jobs.shopify.com
export const CAREER_SUBDOMAIN_PREFIXES: readonly string[] = [
  'careers',
  'jobs',
  'job',
  'talent',
  'recruiting',
  'recruit',
  'hire',
  'hiring',
  'apply',
  'join',
  'work',
  'opportunities',
];

// ── URL path segments that indicate a job/career page ─────────────────────────
export const CAREER_PATH_RE =
  /\/(job|jobs|career|careers|position|positions|opening|openings|apply|application|requisition|vacancy|vacancies|posting|listings?|req\b|talent|recruit|hiring|candidate|opportunit|join(-us)?|work-with-us)/i;

// ── Keywords in page <title> or meta description that confirm career intent ────
export const CAREER_TITLE_RE =
  /\b(job opening|job description|we're hiring|we are hiring|apply now|open positions?|current openings?|job vacancies?|career opportunities|join our team|join us|work with us)\b|\bjobs?\s+at\b|\bcareers?\s+at\b|\bjobs?\s+@\b/i;

// Broader keyword set used as a secondary check
export const CAREER_KEYWORD_RE =
  /\b(jobs?|careers?|hiring|apply|vacancy|vacancies|openings?|positions?|internship|fellowship|recruitment|employment opportunity)\b/i;

// ── Sites that are NEVER job-related ─────────────────────────────────────────
export const BLOCKED_HOSTS: readonly string[] = [
  // Social media
  'youtube.com',
  'youtu.be',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'twitch.tv',
  'pinterest.com',
  'snapchat.com',
  // Streaming / entertainment
  'netflix.com',
  'spotify.com',
  'hulu.com',
  'disneyplus.com',
  // E-commerce
  'amazon.com',
  'flipkart.com',
  'ebay.com',
  'walmart.com',
  'etsy.com',
  'shopify.com',
  // Productivity / mail
  'mail.google.com',
  'docs.google.com',
  'drive.google.com',
  'calendar.google.com',
  'meet.google.com',
  'outlook.live.com',
  'outlook.office.com',
  'mail.yahoo.com',
  // News / publishing
  'wikipedia.org',
  'medium.com',
  'substack.com',
  'news.ycombinator.com',
  'techcrunch.com',
  'theverge.com',
];

// ─────────────────────────────────────────────────────────────────────────────
// Main detection function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when the current page is likely a career / job listing page.
 *
 * Checks in priority order:
 *  1. Hard blocklist (social media, e-commerce, etc.)
 *  2. Known job-board hostname
 *  3. ATS / employer-portal host suffix
 *  4. Career subdomain prefix  (careers.company.com, jobs.company.com)
 *  5. Career URL path segment  (/jobs, /careers, /openings, …)
 *  6. Page <title> strong phrases ("Apply Now", "Job Opening", …)
 *  7. Meta description / keywords containing career terms
 *  8. JSON-LD JobPosting schema on the page
 *  9. Application form with resume/CV upload field
 */
export function isCareerPage(): boolean {
  if (typeof window === 'undefined') return false;
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return false;

  const rawHost = location.hostname.toLowerCase();
  const host = rawHost.replace(/^www\./, '');

  // ── 1. Hard blocklist ──────────────────────────────────────────────────────
  for (let i = 0; i < BLOCKED_HOSTS.length; i++) {
    const b = BLOCKED_HOSTS[i];
    if (host === b || host.endsWith('.' + b)) return false;
  }
  // Google: only career-query search pages could theoretically pass, but skip all google.com
  if (host === 'google.com') return false;

  // ── 2. Known job-board hostname ───────────────────────────────────────────
  for (let i = 0; i < JOB_BOARD_HOSTS.length; i++) {
    const j = JOB_BOARD_HOSTS[i];
    if (host === j || host.endsWith('.' + j)) return true;
  }

  // ── 3. ATS / employer portal ──────────────────────────────────────────────
  for (let i = 0; i < ATS_HOST_SUFFIXES.length; i++) {
    const s = ATS_HOST_SUFFIXES[i]; // e.g. '.greenhouse.io'
    if (rawHost.endsWith(s) || rawHost === s.slice(1)) return true;
  }

  // ── 4. Career subdomain prefix ────────────────────────────────────────────
  const firstLabel = rawHost.split('.')[0];
  for (let i = 0; i < CAREER_SUBDOMAIN_PREFIXES.length; i++) {
    if (firstLabel === CAREER_SUBDOMAIN_PREFIXES[i]) return true;
  }

  // ── 5. Career URL path ────────────────────────────────────────────────────
  const pathAndQuery = location.pathname + (location.search || '');
  if (CAREER_PATH_RE.test(pathAndQuery)) return true;

  // ── 6. Page <title> strong phrases ────────────────────────────────────────
  if (CAREER_TITLE_RE.test(document.title || '')) return true;

  // ── 7. Meta description / keywords ────────────────────────────────────────
  const metaDesc =
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    '';
  if (CAREER_TITLE_RE.test(metaDesc)) return true;

  const metaKw = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  if (CAREER_KEYWORD_RE.test(metaKw)) return true;

  // ── 8. JSON-LD JobPosting schema ──────────────────────────────────────────
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    if (/JobPosting/i.test(scripts[i].textContent || '')) return true;
  }

  // ── 9. Application form with file upload ──────────────────────────────────
  if (hasJobApplicationForm()) return true;

  return false;
}

/**
 * Returns true when the page contains a form with a file-upload field that
 * looks like a resume / cover-letter submission form.
 */
export function hasJobApplicationForm(): boolean {
  const forms = document.querySelectorAll('form');
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    const text = (form.textContent || '').toLowerCase();
    const hasResumeKeyword =
      text.includes('resume') ||
      text.includes(' cv ') ||
      text.includes('curriculum vitae') ||
      text.includes('cover letter');
    if (hasResumeKeyword && form.querySelector('input[type="file"]')) return true;
    // ATS "Apply" submit button with no file upload (Easy Apply, etc.)
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      const btnText = (submitBtn.textContent || '').toLowerCase();
      if (btnText.includes('apply') || btnText.includes('submit application')) return true;
    }
  }
  return false;
}

/**
 * Returns true when this site is a well-known job board or ATS that renders
 * job details dynamically (SPA) — these need the full MutationObserver mode.
 * Generic company career pages only need the lighter retry approach.
 */
export function isKnownJobBoardOrAts(): boolean {
  const rawHost = location.hostname.toLowerCase();
  const host = rawHost.replace(/^www\./, '');
  for (let i = 0; i < JOB_BOARD_HOSTS.length; i++) {
    const j = JOB_BOARD_HOSTS[i];
    if (host === j || host.endsWith('.' + j)) return true;
  }
  for (let i = 0; i < ATS_HOST_SUFFIXES.length; i++) {
    const s = ATS_HOST_SUFFIXES[i];
    if (rawHost.endsWith(s) || rawHost === s.slice(1)) return true;
  }
  return false;
}
