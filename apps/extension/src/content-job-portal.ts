/**
 * Content script for job / career pages (any company career site, LinkedIn, Indeed, etc.)
 * Parses job listing using JSON-LD, meta tags, and DOM. Shows a floating pill widget
 * (close, logo, drag handle) to add the job to TrackMyOPT when a listing is detected.
 * Auto-adds job to TrackMyOPT when user sees "application submitted" / "congratulations" success messages.
 */

import {
  isCareerPage,
  isKnownJobBoardOrAts,
  CAREER_PATH_RE,
} from './career-sites';

const SESSION_KEYS = {
  LAST_JOB_CONTEXT: 'tmo_last_job_context',
  LAST_AUTO_ADDED: 'tmo_last_auto_added',
} as const;

const WIDGET_ROOT_ID = 'tmo-job-tracker-widget';
const WIDGET_DISMISSED_URL_KEY = 'tmo_job_widget_dismissed_url';
const WIDGET_POS_KEY = 'tmo_job_widget_pos';

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

function readWidgetDismissedUrl(): string | null {
  try {
    return sessionStorage.getItem(WIDGET_DISMISSED_URL_KEY);
  } catch {
    return null;
  }
}

function setWidgetDismissedUrl(url: string) {
  try {
    sessionStorage.setItem(WIDGET_DISMISSED_URL_KEY, url);
  } catch {
    /* ignore */
  }
}

function clearWidgetDismissedUrl() {
  try {
    sessionStorage.removeItem(WIDGET_DISMISSED_URL_KEY);
  } catch {
    /* ignore */
  }
}

function readWidgetPosition(): { top: number; left: number } | null {
  try {
    const raw = sessionStorage.getItem(WIDGET_POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { top?: number; left?: number };
    if (typeof p.top !== 'number' || typeof p.left !== 'number') return null;
    return { top: p.top, left: p.left };
  } catch {
    return null;
  }
}

function saveWidgetPosition(top: number, left: number) {
  try {
    sessionStorage.setItem(WIDGET_POS_KEY, JSON.stringify({ top, left }));
  } catch {
    /* ignore */
  }
}

function attachDragBehavior(root: HTMLElement, dragHandle: HTMLElement) {
  let dragging = false;
  let startClientX = 0;
  let startClientY = 0;
  let startLeft = 0;
  let startTop = 0;

  const onMove = (ev: MouseEvent) => {
    if (!dragging) return;
    const dx = ev.clientX - startClientX;
    const dy = ev.clientY - startClientY;
    let nextLeft = startLeft + dx;
    let nextTop = startTop + dy;
    const pad = 8;
    const rect = root.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - pad;
    const maxTop = window.innerHeight - rect.height - pad;
    nextLeft = Math.min(Math.max(pad, nextLeft), maxLeft);
    nextTop = Math.min(Math.max(pad, nextTop), maxTop);
    root.style.left = `${nextLeft}px`;
    root.style.top = `${nextTop}px`;
    root.style.right = 'auto';
    root.style.bottom = 'auto';
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('mouseup', onUp, true);
    const left = parseFloat(root.style.left) || 0;
    const top = parseFloat(root.style.top) || 0;
    saveWidgetPosition(top, left);
  };

  dragHandle.addEventListener('mousedown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    dragging = true;
    const r = root.getBoundingClientRect();
    startClientX = ev.clientX;
    startClientY = ev.clientY;
    startLeft = r.left;
    startTop = r.top;
    root.style.left = `${startLeft}px`;
    root.style.top = `${startTop}px`;
    root.style.right = 'auto';
    root.style.bottom = 'auto';
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);
  });
}

/**
 * Floating pill widget (close, logo, drag strip) — matches in-product job assistant style.
 */
function createJobTrackerWidget(job: JobInfo): HTMLElement {
  const root = document.createElement('div');
  root.id = WIDGET_ROOT_ID;
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'TrackMyOPT — add job to tracker');

  const pos = readWidgetPosition();
  root.style.cssText = `
    position: fixed;
    z-index: 2147483646;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    filter: drop-shadow(0 6px 18px rgba(15, 23, 42, 0.18));
  `;
  if (pos) {
    root.style.top = `${pos.top}px`;
    root.style.left = `${pos.left}px`;
  } else {
    root.style.bottom = '24px';
    root.style.right = '24px';
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: -8px;
    left: -8px;
    z-index: 3;
    width: 28px;
    height: 28px;
    padding: 0;
    margin: 0;
    border: 1px solid #e2e8f0;
    border-radius: 50%;
    background: #fff;
    color: #0f172a;
    font-size: 20px;
    line-height: 24px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const shell = document.createElement('div');
  shell.style.cssText = `
    display: flex;
    align-items: stretch;
    border-radius: 9999px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: #fff;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.1);
    transition: transform 0.15s ease;
  `;
  shell.addEventListener('mouseenter', () => {
    shell.style.transform = 'scale(1.02)';
  });
  shell.addEventListener('mouseleave', () => {
    shell.style.transform = 'scale(1)';
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.title = `Add “${job.role_title}” at ${job.company_name} to your TrackMyOPT job board`;
  addBtn.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    padding: 10px 14px 10px 16px;
    border: none;
    cursor: pointer;
    background: #fff;
    outline: none;
    font: inherit;
  `;

  const logoRing = document.createElement('div');
  logoRing.style.cssText = `
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(145deg, #bbf7d0 0%, #86efac 55%, #4ade80 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(22, 101, 52, 0.25);
  `;

  const extIcon = chrome.runtime.getURL('icons/icon48.png');
  const logoImg = document.createElement('img');
  logoImg.src = extIcon;
  logoImg.alt = '';
  logoImg.width = 28;
  logoImg.height = 28;
  logoImg.style.objectFit = 'contain';
  logoImg.style.borderRadius = '4px';
  logoImg.addEventListener('error', () => {
    logoImg.replaceWith(logoSvgFallback());
  });
  logoRing.appendChild(logoImg);

  const hint = document.createElement('span');
  hint.textContent = 'Add to board';
  hint.style.cssText = `
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    letter-spacing: -0.01em;
  `;

  addBtn.appendChild(logoRing);
  addBtn.appendChild(hint);

  const dragStrip = document.createElement('div');
  dragStrip.setAttribute('aria-hidden', 'true');
  dragStrip.title = 'Drag to move';
  dragStrip.style.cssText = `
    width: 34px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #99f6e4 0%, #5eead4 45%, #2dd4bf 100%);
    border: none;
    border-left: 1px solid rgba(20, 184, 166, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
  `;

  const dots = document.createElement('div');
  dots.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, 4px);
    grid-template-rows: repeat(3, 4px);
    gap: 3px;
    opacity: 0.55;
  `;
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('span');
    d.style.cssText = 'width:4px;height:4px;border-radius:50%;background:#0f766e;';
    dots.appendChild(d);
  }
  dragStrip.appendChild(dots);

  shell.appendChild(addBtn);
  shell.appendChild(dragStrip);

  root.appendChild(closeBtn);
  root.appendChild(shell);

  attachDragBehavior(root, dragStrip);

  closeBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    setWidgetDismissedUrl(job.job_url);
    root.remove();
  });

  addBtn.addEventListener('click', () => {
    if (addBtn.disabled) return;
    addBtn.disabled = true;
    const prevHint = hint.textContent;
    hint.textContent = 'Adding…';
    chrome.runtime.sendMessage(
      { type: 'ADD_JOB_TO_TRACKER', job },
      (response: { ok?: boolean; error?: string } | undefined) => {
        addBtn.disabled = false;
        hint.textContent = prevHint || 'Add to board';
        if (chrome.runtime.lastError) {
          showMessage('TrackMyOPT: Sign in in the extension to add jobs.', true);
          return;
        }
        if (response?.ok) {
          showMessage('Added to Job Tracker!', false);
          hint.textContent = 'Added ✓';
          setTimeout(() => {
            hint.textContent = 'Add to board';
          }, 2000);
        } else {
          showMessage(response?.error || 'Failed to add job', true);
        }
      }
    );
  });

  return root;
}

function logoSvgFallback(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '28');
  svg.setAttribute('height', '28');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute(
    'd',
    'M4 14c2.5-1 5-4 6-7 1 3 3.5 6 6 7-2 1.5-4 2.5-6 2.5S6 15.5 4 14z'
  );
  path.setAttribute('fill', '#14532d');
  path.setAttribute('opacity', '0.9');
  svg.appendChild(path);
  return svg;
}

function showMessage(message: string, isError: boolean) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    bottom: 110px;
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
    const existing = document.getElementById(WIDGET_ROOT_ID);
    if (existing) existing.remove();
    return;
  }

  const job = getJobInfo();
  if (job) saveJobContext(job);

  const existing = document.getElementById(WIDGET_ROOT_ID);
  if (!job) {
    if (existing) existing.remove();
    return;
  }

  const dismissed = readWidgetDismissedUrl();
  if (dismissed && dismissed === job.job_url) {
    return;
  }

  if (existing) return;

  const widget = createJobTrackerWidget(job);
  document.body.appendChild(widget);
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

// Module-level references so both observer and interval can be cleaned up on unload.
let _spaObserver: MutationObserver | null = null;
let _earlyRetryId: number | null = null;

function setupSpaObservers() {
  if (!document.body) return;
  // Disconnect any previous observer before creating a new one.
  if (_spaObserver) {
    _spaObserver.disconnect();
    _spaObserver = null;
  }
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      clearWidgetDismissedUrl();
      const existing = document.getElementById(WIDGET_ROOT_ID);
      if (existing) existing.remove();
      scheduleInject();
      runSuccessCheckDebounced();
    } else {
      scheduleInject();
      runSuccessCheckDebounced();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  _spaObserver = observer;
}

function startEarlyRetryLoop() {
  // Clear any previously running retry loop before starting a new one.
  if (_earlyRetryId !== null) {
    window.clearInterval(_earlyRetryId);
    _earlyRetryId = null;
  }
  let n = 0;
  const max = 45;
  const id: number = window.setInterval(() => {
    n += 1;
    if (n > max) {
      window.clearInterval(id);
      if (_earlyRetryId === id) _earlyRetryId = null;
      return;
    }
    if (document.getElementById(WIDGET_ROOT_ID)) {
      window.clearInterval(id);
      if (_earlyRetryId === id) _earlyRetryId = null;
      return;
    }
    injectOrRefreshButton();
  }, 600);
  _earlyRetryId = id;
}

// Cleanup on page unload (navigation away in non-SPA contexts).
window.addEventListener('pagehide', () => {
  if (_spaObserver) { _spaObserver.disconnect(); _spaObserver = null; }
  if (_earlyRetryId !== null) { window.clearInterval(_earlyRetryId); _earlyRetryId = null; }
  if (injectDebounceTimer) { clearTimeout(injectDebounceTimer); injectDebounceTimer = null; }
  if (successCheckTimeout) { clearTimeout(successCheckTimeout); successCheckTimeout = null; }
}, { once: true });

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

