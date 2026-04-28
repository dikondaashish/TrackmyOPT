/**
 * Content script for job / career pages (any company career site, LinkedIn, Indeed, etc.)
 * Parses job listing using JSON-LD, meta tags, and DOM. Shows "Add to TrackMyOPT" when job detected.
 * Auto-adds job to TrackMyOPT when user sees "application submitted" / "congratulations" success messages.
 */

import {
  isCareerPage,
  isKnownJobBoardOrAts,
  hasJobApplicationForm,
  CAREER_PATH_RE,
} from './career-sites';

const SESSION_KEYS = {
  LAST_JOB_CONTEXT: 'tmo_last_job_context',
  LAST_AUTO_ADDED: 'tmo_last_auto_added',
} as const;

const AUTO_ADD_DEBOUNCE_MS = 15000; // don't auto-add same job twice within 15 min
const JOB_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000; // use stored context up to 30 min old

interface JobInfo {
  company_name: string;
  role_title: string;
  job_url: string;
  location?: string;
}

function isHttpDocument(): boolean {
  return location.protocol === 'http:' || location.protocol === 'https:';
}

function hasJobPostingJsonLdSnippet(): boolean {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    const t = scripts[i].textContent || '';
    if (/JobPosting/i.test(t) && /hiringOrganization|title/i.test(t)) return true;
  }
  return false;
}

/**
 * Known job boards and ATS portals render jobs via SPAs, so they get the full
 * MutationObserver + retry loop. Generic career pages (company /careers paths,
 * career subdomains) use a lighter timed-retry approach.
 */
function shouldUseFullJobAssistMode(): boolean {
  if (isKnownJobBoardOrAts()) return true;
  if (hasJobPostingJsonLdSnippet()) return true;
  const pathAndSearch = location.pathname + (location.search || '');
  if (CAREER_PATH_RE.test(pathAndSearch)) return true;
  return false;
}

// Phrases that indicate "application submitted" success (case-insensitive)
const APPLICATION_SUCCESS_PATTERNS = [
  /congratulat/i,
  /application\s+(submitted|received|sent|successful)/i,
  /thank\s+you\s+for\s+applying/i,
  /your\s+application\s+has\s+been\s+(sent|submitted|received)/i,
  /we've\s+received\s+your\s+application/i,
  /we\s+have\s+received\s+your\s+application/i,
  /successfully\s+applied/i,
  /you've\s+applied\s+to/i,
  /you\s+have\s+applied\s+to/i,
  /application\s+complete/i,
  /application\s+successful/i,
  /your\s+application\s+was\s+submitted/i,
  /submitted\s+successfully/i,
];

function isApplicationSuccessPage(): boolean {
  const text = (document.body?.innerText || document.body?.textContent || '').slice(0, 10000);
  if (!text || text.length < 20) return false;
  for (let i = 0; i < APPLICATION_SUCCESS_PATTERNS.length; i++) {
    if (APPLICATION_SUCCESS_PATTERNS[i].test(text)) return true;
  }
  return false;
}

function saveJobContext(job: JobInfo) {
  try {
    chrome.storage.session.set({
      [SESSION_KEYS.LAST_JOB_CONTEXT]: {
        job: { company_name: job.company_name, role_title: job.role_title, job_url: job.job_url, location: job.location },
        storedAt: Date.now(),
      },
    });
  } catch (_) {
    // ignore
  }
}

function tryAutoAddOnSuccess() {
  if (!document.body || !isApplicationSuccessPage()) return;
  let jobToAdd: JobInfo | null = null;

  const fromPage = getJobInfo();
  if (fromPage && fromPage.role_title && fromPage.company_name) {
    jobToAdd = fromPage;
  }

  if (!jobToAdd) {
    chrome.storage.session.get(SESSION_KEYS.LAST_JOB_CONTEXT, (result) => {
      const ctx = result[SESSION_KEYS.LAST_JOB_CONTEXT] as { job: JobInfo; storedAt: number } | undefined;
      if (!ctx?.job) return;
      const age = Date.now() - (ctx.storedAt || 0);
      if (age > JOB_CONTEXT_MAX_AGE_MS) return;
      jobToAdd = ctx.job;
      tryAutoAddWithJob(jobToAdd);
    });
    return;
  }

  tryAutoAddWithJob(jobToAdd);
}

function tryAutoAddWithJob(job: JobInfo) {
  chrome.storage.session.get(SESSION_KEYS.LAST_AUTO_ADDED, (result) => {
    const last = result[SESSION_KEYS.LAST_AUTO_ADDED] as { job_url: string; at: number } | undefined;
    if (last && last.job_url === job.job_url && Date.now() - last.at < AUTO_ADD_DEBOUNCE_MS) return;

    chrome.runtime.sendMessage(
      { type: 'ADD_JOB_TO_TRACKER', job, autoAdd: true },
      (response: { ok?: boolean; error?: string } | undefined) => {
        if (chrome.runtime.lastError) return;
        if (response?.ok) {
          chrome.storage.session.set({
            [SESSION_KEYS.LAST_AUTO_ADDED]: { job_url: job.job_url, at: Date.now() },
          });
          chrome.storage.session.remove(SESSION_KEYS.LAST_JOB_CONTEXT);
          showMessage('Application auto-added to TrackMyOPT Job Tracker!', false);
        }
      }
    );
  });
}

// --- Generic parser: works on any career page ---

function collectJsonLdObjects(data: unknown, out: Record<string, unknown>[]): void {
  if (!data || typeof data !== 'object') return;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) collectJsonLdObjects(data[i], out);
    return;
  }
  out.push(obj);
  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    for (let i = 0; i < obj['@graph'].length; i++) collectJsonLdObjects(obj['@graph'][i], out);
  }
}

function typesIncludeJobPosting(types: unknown): boolean {
  if (types === 'JobPosting') return true;
  if (Array.isArray(types)) {
    return types.some((t) => t === 'JobPosting' || (typeof t === 'string' && /JobPosting/i.test(t)));
  }
  return typeof types === 'string' && /JobPosting/i.test(types);
}

function jobPostingFromLdObject(obj: Record<string, unknown>): JobInfo | null {
  const types = obj['@type'];
  if (!typesIncludeJobPosting(types)) return null;
  const title = (obj.title as string)?.trim();
  const hiringOrg = obj.hiringOrganization as Record<string, unknown> | string | undefined;
  let company = '';
  if (typeof hiringOrg === 'string') company = hiringOrg.trim();
  else if (hiringOrg && typeof hiringOrg === 'object') {
    company = ((hiringOrg.name as string) || (hiringOrg.legalName as string) || '').trim();
  }
  const jobLoc = obj.jobLocation as Record<string, unknown> | Record<string, unknown>[] | undefined;
  let location = '';
  if (Array.isArray(jobLoc) && jobLoc.length > 0) {
    const first = jobLoc[0] as Record<string, unknown>;
    location =
      ((first.address as Record<string, unknown>)?.addressLocality as string) ||
      (first.name as string) ||
      '';
  } else if (jobLoc && typeof jobLoc === 'object' && !Array.isArray(jobLoc)) {
    const addr = (jobLoc as Record<string, unknown>).address as Record<string, unknown> | undefined;
    location =
      (addr?.addressLocality as string) || ((jobLoc as Record<string, unknown>).name as string) || '';
  }
  if (title && company) {
    return {
      company_name: company,
      role_title: title,
      job_url: window.location.href,
      location: location?.trim() || undefined,
    };
  }
  return null;
}

function getJsonLdJobPosting(): JobInfo | null {
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const text = script.textContent?.trim();
      if (!text) continue;
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        continue;
      }
      const flat: Record<string, unknown>[] = [];
      collectJsonLdObjects(data, flat);
      for (let j = 0; j < flat.length; j++) {
        const parsed = jobPostingFromLdObject(flat[j]);
        if (parsed) return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function getCompanyFromDomain(hostname: string): string {
  // careers.company.com, jobs.company.com, company.com/careers
  const parts = hostname.replace(/^www\./, '').split('.');
  if (parts.length >= 2) {
    const base = parts[parts.length - 2]; // "company" from careers.company.com
    if (base && !['careers', 'jobs', 'job', 'recruiting', 'talent', 'hire', 'apply'].includes(base.toLowerCase())) {
      return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
    }
  }
  if (parts.length >= 1 && parts[0]) {
    const first = parts[0].toLowerCase();
    if (!['www', 'careers', 'jobs', 'job', 'recruiting', 'talent', 'hire', 'apply', 'career'].includes(first)) {
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
  }
  return '';
}

function parseTitleAndCompany(title: string): { role_title: string; company_name: string } | null {
  const t = title.trim();
  if (!t || t.length < 3) return null;
  // "Job Title | Company", "Job Title at Company", "Company - Job Title", "Company: Job Title"
  const at = t.split(/\s+at\s+/i);
  if (at.length === 2) return { role_title: at[0].trim(), company_name: at[1].trim() };
  const pipe = t.split(/\s*\|\s*/);
  if (pipe.length === 2) return { role_title: pipe[0].trim(), company_name: pipe[1].trim() };
  const dash = t.split(/\s*-\s*/);
  if (dash.length === 2) {
    const a = dash[0].trim();
    const b = dash[1].trim();
    if (a.length > 0 && b.length > 0) return { role_title: b, company_name: a };
  }
  const colon = t.split(/\s*:\s*/);
  if (colon.length === 2) return { role_title: colon[1].trim(), company_name: colon[0].trim() };
  return null;
}

function getMetaAndTitleJob(): JobInfo | null {
  const url = window.location.href;
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')?.trim();
  const title = document.title?.trim();
  const desc = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
    document.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim();
  const candidate = ogTitle || twitterTitle || title;
  if (!candidate) return null;
  const parsed = parseTitleAndCompany(candidate);
  if (parsed && parsed.role_title.length >= 2 && parsed.company_name.length >= 1) {
    return {
      company_name: parsed.company_name,
      role_title: parsed.role_title,
      job_url: url,
      location: undefined,
    };
  }
  // Use full title as role_title and company from domain
  const companyFromDomain = getCompanyFromDomain(window.location.hostname);
  if (companyFromDomain && candidate.length >= 3) {
    return {
      company_name: companyFromDomain,
      role_title: candidate,
      job_url: url,
      location: undefined,
    };
  }
  return null;
}

function getDomFallbackJob(): JobInfo | null {
  const url = window.location.href;
  const heading =
    document.querySelector('h1') ||
    document.querySelector('[class*="job-title"]') ||
    document.querySelector('h2[class*="title"]');
  const role_title = heading?.textContent?.trim();
  if (!role_title || role_title.length < 2) return null;
  const companyFromDomain = getCompanyFromDomain(window.location.hostname);
  if (!companyFromDomain) return null;
  return {
    company_name: companyFromDomain,
    role_title,
    job_url: url,
    location: undefined,
  };
}

// --- Site-specific parsers (higher accuracy when available) ---

function isLinkedInJobSurface(): boolean {
  const path = window.location.pathname;
  const q = window.location.search || '';
  if (/^\/jobs(\/|$)/i.test(path)) return true;
  if (/currentJobId=/i.test(q)) return true;
  if (/^\/job\//i.test(path)) return true;
  return false;
}

function getLinkedInJobInfo(): JobInfo | null {
  const url = window.location.href;
  if (!url.includes('linkedin.com') || !isLinkedInJobSurface()) return null;

  const tryOgMeta = (): JobInfo | null => {
    const og = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
    if (!og) return null;
    const parsed = parseTitleAndCompany(og);
    if (parsed && parsed.role_title.length >= 2 && parsed.company_name.length >= 1) {
      return {
        company_name: parsed.company_name,
        role_title: parsed.role_title,
        job_url: url,
        location: undefined,
      };
    }
    return null;
  };

  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-details-top-card__job-title',
    '.jobs-details-top-card__title',
    '.jobs-unified-top-card__job-title',
    'h1[class*="job-details-jobs-unified-top-card"]',
    'h1[class*="jobs-unified-top-card"]',
    'h1[class*="job-title"]',
    'div[class*="job-details-jobs-unified-top-card"] h1',
    'div[class*="jobs-unified-top-card"] h1',
    '.jobs-search__job-details--container h1',
    'article[data-job-id] h1',
    'main h1',
    'h1.t-24',
    'h1[class*="t-24"]',
    'h1',
  ];

  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.jobs-details-top-card__company-name',
    'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
    'a[href*="linkedin.com/company/"]',
    'div[class*="top-card"] a[href*="/company/"]',
  ];

  const locationSelectors = [
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.jobs-details-top-card__primary-description-container',
    'span[class*="bullet"]',
  ];

  let titleEl: Element | null = null;
  for (let i = 0; i < titleSelectors.length; i++) {
    const el = document.querySelector(titleSelectors[i]);
    const t = el?.textContent?.trim();
    if (t && t.length > 1 && t.length < 500) {
      titleEl = el;
      break;
    }
  }

  let companyEl: Element | null = null;
  for (let i = 0; i < companySelectors.length; i++) {
    const el = document.querySelector(companySelectors[i]);
    const t = el?.textContent?.trim();
    if (t && t.length > 1 && t.length < 200) {
      companyEl = el;
      break;
    }
  }

  let locationEl: Element | null = null;
  for (let i = 0; i < locationSelectors.length; i++) {
    const el = document.querySelector(locationSelectors[i]);
    if (el?.textContent?.trim()) {
      locationEl = el;
      break;
    }
  }

  const role_title = titleEl?.textContent?.trim();
  const company_name = companyEl?.textContent?.trim();
  const location = locationEl?.textContent?.trim();
  if (role_title && company_name) {
    return { company_name, role_title, job_url: url, location: location || undefined };
  }

  return tryOgMeta() || getJsonLdJobPosting() || null;
}

function getIndeedJobInfo(): JobInfo | null {
  const url = window.location.href;
  const looksLikeJob =
    url.includes('viewjob') ||
    url.includes('jk=') ||
    url.includes('vjk=') ||
    /\/jobs\/view\//i.test(url) ||
    /\/rc\/clk/i.test(url);
  if (!url.includes('indeed.com') || !looksLikeJob) return null;
  const titleEl =
    document.querySelector('h1.jobsearch-JobInfoHeader-title') ||
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
    document.querySelector('h1');
  const companyEl =
    document.querySelector('[data-testid="inlineHeader-companyName"]') ||
    document.querySelector('.jobsearch-InlineCompanyRating-companyHeader') ||
    document.querySelector('div[data-tn-component="jobHeader"] a');
  const locationEl =
    document.querySelector('[data-testid="jobsearch-Location"]') ||
    document.querySelector('.jobsearch-JobInfoHeader-subtitle') ||
    document.querySelector('[class*="location"]');
  const role_title = titleEl?.textContent?.trim();
  const company_name = companyEl?.textContent?.trim();
  const location = locationEl?.textContent?.trim();
  if (!role_title || !company_name) return null;
  return { company_name, role_title, job_url: url, location: location || undefined };
}

function getJobInfo(): JobInfo | null {
  const host = window.location.hostname;
  if (host.includes('linkedin.com')) return getLinkedInJobInfo() || getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob();
  if (host.includes('indeed.com')) return getIndeedJobInfo() || getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob();
  return getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob();
}

function createAddButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Add to TrackMyOPT';
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483646;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: transform 0.15s, box-shadow 0.15s;
  `;
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.4)';
  });
  return btn;
}

function showMessage(message: string, isError: boolean) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    padding: 12px 20px;
    font-size: 14px;
    color: #fff;
    background: ${isError ? '#dc2626' : '#059669'};
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

let lastUrl = location.href;
let injectDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const INJECT_DEBOUNCE_MS = 400;

function injectOrRefreshButton() {
  if (!document.body) return;

  const host = window.location.hostname;
  if (host.includes('linkedin.com') && !isLinkedInJobSurface()) {
    const existing = document.getElementById('tmo-add-to-tracker-btn');
    if (existing) existing.remove();
    return;
  }

  const job = getJobInfo();
  if (job) saveJobContext(job);

  const existing = document.getElementById('tmo-add-to-tracker-btn');
  if (!job) {
    if (existing) existing.remove();
    return;
  }
  if (existing) return;

  const btn = createAddButton();
  btn.id = 'tmo-add-to-tracker-btn';
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'Adding…';
    chrome.runtime.sendMessage(
      { type: 'ADD_JOB_TO_TRACKER', job },
      (response: { ok?: boolean; error?: string } | undefined) => {
        btn.disabled = false;
        btn.textContent = 'Add to TrackMyOPT';
        if (chrome.runtime.lastError) {
          showMessage('TrackMyOPT: Sign in in the extension to add jobs.', true);
          return;
        }
        if (response?.ok) {
          showMessage('Added to Job Tracker!', false);
          btn.textContent = 'Added ✓';
          setTimeout(() => (btn.textContent = 'Add to TrackMyOPT'), 2000);
        } else {
          showMessage(response?.error || 'Failed to add job', true);
        }
      }
    );
  });
  document.body.appendChild(btn);
}

function scheduleInject() {
  if (injectDebounceTimer) clearTimeout(injectDebounceTimer);
  injectDebounceTimer = setTimeout(() => {
    injectDebounceTimer = null;
    injectOrRefreshButton();
  }, INJECT_DEBOUNCE_MS);
}

function tryInject() {
  if (document.body) {
    injectOrRefreshButton();
  } else {
    setTimeout(tryInject, 500);
  }
}

let successCheckTimeout: ReturnType<typeof setTimeout> | null = null;
const SUCCESS_CHECK_DEBOUNCE_MS = 800;

function runSuccessCheckDebounced() {
  if (successCheckTimeout) clearTimeout(successCheckTimeout);
  successCheckTimeout = setTimeout(() => {
    successCheckTimeout = null;
    tryAutoAddOnSuccess();
  }, SUCCESS_CHECK_DEBOUNCE_MS);
}

function setupSpaObservers() {
  if (!document.body) return;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      const existing = document.getElementById('tmo-add-to-tracker-btn');
      if (existing) existing.remove();
      scheduleInject();
      runSuccessCheckDebounced();
    } else {
      scheduleInject();
      runSuccessCheckDebounced();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function startEarlyRetryLoop() {
  let n = 0;
  const max = 45;
  const id = window.setInterval(() => {
    n += 1;
    if (n > max) {
      window.clearInterval(id);
      return;
    }
    if (document.getElementById('tmo-add-to-tracker-btn')) {
      window.clearInterval(id);
      return;
    }
    injectOrRefreshButton();
  }, 600);
}

function startSuccessDetection() {
  tryAutoAddOnSuccess();
  setTimeout(tryAutoAddOnSuccess, 2000);
  setTimeout(tryAutoAddOnSuccess, 5000);
  setTimeout(tryAutoAddOnSuccess, 8000);
}

/** Sparse retries on unknown sites (JSON-LD / title-only) without a full DOM observer. */
function initLightScanMode() {
  const delays = [0, 900, 2200, 4500, 8000, 14000];
  for (let i = 0; i < delays.length; i++) {
    window.setTimeout(() => tryInject(), delays[i]);
  }
  startSuccessDetection();
}

function initFullJobAssistMode() {
  const boot = () => {
    tryInject();
    setupSpaObservers();
    startEarlyRetryLoop();
    startSuccessDetection();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

// Guard: only run on actual career / job pages.
// isCareerPage() covers blocklist → known boards → ATS → career subdomains →
// path patterns → page title / meta → JSON-LD → application forms.
if (!isHttpDocument()) {
  // Non-HTTP document — do nothing.
} else {
  const careerReason = isCareerPage();
  if (!careerReason) {
    // Not a career page — fully inert, zero DOM work.
  } else {
    // Log why we activated (shows in DevTools → Console on career pages).
    console.log(`[TrackMyOPT] Career page detected: ${careerReason}`);
    if (shouldUseFullJobAssistMode()) {
      // Well-known job board or ATS: full SPA observer + retry loop.
      initFullJobAssistMode();
    } else {
      // Generic company career page: lightweight timed retries.
      initLightScanMode();
    }
  }
}

