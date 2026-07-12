/**
 * Content script for job / career pages (any company career site, LinkedIn, Indeed, etc.)
 * Parses job listing using JSON-LD, meta tags, and DOM. Shows a sticky, collapsible
 * side widget when a listing is detected, offering: Prefill application, Save to
 * tracker, and (soon) AI analysis. Close menu can hide it for this visit / this
 * site / all sites. Auto-adds job to TrackMyOPT on application-success pages.
 */

import {
  isCareerPage,
  isKnownJobBoardOrAts,
  CAREER_PATH_RE,
} from './career-sites';
import {
  runPrefill,
  findApplicationForm,
  type GeneratedResumeAttachment,
} from './easy-apply-engine';
import { openFeedbackModal } from './feedback';
import { icon } from './icons';
import { WEBSITE_URL } from './config';
import {
  chooseJobDescriptionCandidate,
  type JobDescriptionCandidate,
} from './job-description';

const SESSION_KEYS = {
  LAST_JOB_CONTEXT: 'tmo_last_job_context',
  LAST_AUTO_ADDED: 'tmo_last_auto_added',
} as const;

const WIDGET_ROOT_ID = 'tmo-job-tracker-widget';
const WIDGET_DISMISSED_URL_KEY = 'tmo_job_widget_dismissed_url';
const WIDGET_POS_KEY = 'tmo_job_widget_pos';
const WIDGET_COLLAPSED_KEY = 'tmo_job_widget_collapsed';
// chrome.storage.local: { all?: boolean; domains?: string[] } — persists across visits.
const WIDGET_HIDE_KEY = 'tmo_widget_hidden';
const WIDGET_HIDE_SESSION_KEY = 'tmo_job_widget_hide_session';

type WidgetHideConfig = { all?: boolean; domains?: string[] };

type JobScopedGeneratedResume = GeneratedResumeAttachment & {
  jobFingerprint: string;
};

// Intentionally memory-only: a generated resume is available to Prefill on
// this job page, but is never silently reused after a reload or for another job.
let generatedResumeForCurrentJob: JobScopedGeneratedResume | null = null;

function jobFingerprint(job: JobInfo): string {
  const url = new URL(window.location.href);
  url.hash = '';
  return [
    url.toString(),
    (job.company_name || '').trim().toLowerCase(),
    (job.role_title || '').trim().toLowerCase(),
  ].join('|');
}

function generatedResumeFor(job: JobInfo): GeneratedResumeAttachment | undefined {
  if (!generatedResumeForCurrentJob) return undefined;
  if (generatedResumeForCurrentJob.jobFingerprint !== jobFingerprint(job)) return undefined;
  return {
    pdfBase64: generatedResumeForCurrentJob.pdfBase64,
    filename: generatedResumeForCurrentJob.filename,
  };
}

type WidgetJobSnapshot = Pick<JobInfo,
  'company_name' | 'role_title' | 'job_url' | 'location' | 'salary_text' | 'company_logo_url'>;

function widgetJobSnapshot(job: JobInfo): WidgetJobSnapshot {
  return {
    company_name: job.company_name,
    role_title: job.role_title,
    job_url: job.job_url,
    location: job.location,
    salary_text: job.salary_text,
    company_logo_url: job.company_logo_url,
  };
}

function shouldRefreshWidget(existing: HTMLElement, nextJob: JobInfo): boolean {
  let current: Partial<WidgetJobSnapshot> = {};
  try {
    current = JSON.parse(existing.dataset.tmoJobSnapshot || '{}') as Partial<WidgetJobSnapshot>;
  } catch {
    return true;
  }
  const next = widgetJobSnapshot(nextJob);
  if (
    current.job_url !== next.job_url ||
    current.company_name !== next.company_name ||
    current.role_title !== next.role_title
  ) return true;

  // Replace an already-rendered card only when the new parse enriches missing
  // information. Never downgrade a complete card during transient SPA states.
  return Boolean(
    (!current.location && next.location) ||
    (!current.salary_text && next.salary_text) ||
    (!current.company_logo_url && next.company_logo_url)
  );
}

async function getHideConfig(): Promise<WidgetHideConfig> {
  try {
    const s = await chrome.storage.local.get(WIDGET_HIDE_KEY);
    return (s[WIDGET_HIDE_KEY] as WidgetHideConfig) || {};
  } catch {
    return {};
  }
}

/** True when the widget should stay hidden here (this-visit / this-site / all-sites). */
async function isWidgetSuppressed(): Promise<boolean> {
  try {
    if (sessionStorage.getItem(WIDGET_HIDE_SESSION_KEY) === '1') return true;
  } catch {
    /* ignore */
  }
  const cfg = await getHideConfig();
  if (cfg.all) return true;
  if (Array.isArray(cfg.domains) && cfg.domains.includes(location.hostname)) return true;
  return false;
}

function hideForThisVisit() {
  try {
    sessionStorage.setItem(WIDGET_HIDE_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

async function hideForThisSite() {
  const cfg = await getHideConfig();
  const domains = new Set(cfg.domains || []);
  domains.add(location.hostname);
  try {
    await chrome.storage.local.set({ [WIDGET_HIDE_KEY]: { ...cfg, domains: [...domains] } });
  } catch {
    /* ignore */
  }
}

async function hideForAllSites() {
  const cfg = await getHideConfig();
  try {
    await chrome.storage.local.set({ [WIDGET_HIDE_KEY]: { ...cfg, all: true } });
  } catch {
    /* ignore */
  }
}

/**
 * Explicit per-session collapse override (set only once the user manually
 * toggles collapse/expand on THIS origin, this tab). null = no override yet,
 * so the widget should fall back to the persisted default-view setting.
 */
function readSessionCollapsedOverride(): boolean | null {
  try {
    const v = sessionStorage.getItem(WIDGET_COLLAPSED_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
    return null;
  } catch {
    return null;
  }
}

function setCollapsedPref(collapsed: boolean) {
  try {
    sessionStorage.setItem(WIDGET_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function clearSessionCollapsedOverride() {
  try {
    sessionStorage.removeItem(WIDGET_COLLAPSED_KEY);
  } catch {
    /* ignore */
  }
}

type DefaultView = 'expanded' | 'minimized';
// chrome.storage.local: 'expanded' | 'minimized' — persists across sites/visits,
// set from the widget's Settings panel.
const WIDGET_DEFAULT_VIEW_KEY = 'tmo_widget_default_view';

async function getDefaultViewPref(): Promise<DefaultView> {
  try {
    const s = await chrome.storage.local.get(WIDGET_DEFAULT_VIEW_KEY);
    return s[WIDGET_DEFAULT_VIEW_KEY] === 'minimized' ? 'minimized' : 'expanded';
  } catch {
    return 'expanded';
  }
}

async function setDefaultViewPref(view: DefaultView): Promise<void> {
  try {
    await chrome.storage.local.set({ [WIDGET_DEFAULT_VIEW_KEY]: view });
  } catch {
    /* ignore */
  }
}

const AUTO_ADD_DEBOUNCE_MS = 15000; // don't auto-add same job twice within 15 min
const JOB_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000; // use stored context up to 30 min old

interface JobInfo {
  company_name: string;
  role_title: string;
  job_url: string;
  location?: string;
  /** Normalized display-only compensation from JobPosting JSON-LD or visible
   * job-page text. Omitted when the source page does not publish compensation. */
  salary_text?: string;
  /** Employer logo — from JSON-LD hiringOrganization.logo when present, else the
   * current site's own favicon (we're already on the employer's domain, so its
   * favicon reliably IS the employer's mark). Display-only; never sent to our API. */
  company_logo_url?: string;
}

function formatSalaryAmount(value: unknown): string | null {
  const number = typeof value === 'number'
    ? value
    : Number(String(value ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number).toLocaleString('en-US');
}

function normalizeSalaryUnit(value: unknown): string {
  const unit = String(value ?? '').trim().toLowerCase();
  if (/hour|hr/.test(unit)) return 'hour';
  if (/month|mo/.test(unit)) return 'month';
  if (/week|wk/.test(unit)) return 'week';
  if (/day/.test(unit)) return 'day';
  return 'year';
}

function salaryTextFromJobPosting(obj: Record<string, unknown>): string | undefined {
  const base = obj.baseSalary as Record<string, unknown> | string | number | undefined;
  if (typeof base === 'string') return salaryTextFromVisibleText(base);
  if (typeof base === 'number') {
    const amount = formatSalaryAmount(base);
    return amount ? `$${amount} USD / year` : undefined;
  }
  if (!base || typeof base !== 'object') return undefined;

  const currency = String(base.currency || 'USD').toUpperCase();
  const rawValue = base.value as Record<string, unknown> | string | number | undefined;
  if (rawValue && typeof rawValue === 'object') {
    const min = formatSalaryAmount(rawValue.minValue);
    const max = formatSalaryAmount(rawValue.maxValue);
    const exact = formatSalaryAmount(rawValue.value);
    const unit = normalizeSalaryUnit(rawValue.unitText || base.unitText);
    if (min && max) return `$${min} - $${max} ${currency} / ${unit}`;
    if (exact) return `$${exact} ${currency} / ${unit}`;
  }
  const amount = formatSalaryAmount(rawValue);
  return amount ? `$${amount} ${currency} / ${normalizeSalaryUnit(base.unitText)}` : undefined;
}

function salaryTextFromVisibleText(text: string): string | undefined {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  const range = compact.match(
    /(?:USD\s*)?\$\s*([\d,]+(?:\.\d{1,2})?)\s*(?:-|–|—|to)\s*(?:USD\s*)?\$\s*([\d,]+(?:\.\d{1,2})?)/i,
  );
  if (!range) return undefined;
  const min = formatSalaryAmount(range[1]);
  const max = formatSalaryAmount(range[2]);
  if (!min || !max) return undefined;
  const unitMatch = compact.match(/(?:\/|per\s+)(yr|year|hour|hr|month|mo|week|wk|day)s?\b/i);
  return `$${min} - $${max} USD / ${normalizeSalaryUnit(unitMatch?.[1])}`;
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
  let companyLogo = '';
  if (typeof hiringOrg === 'string') company = hiringOrg.trim();
  else if (hiringOrg && typeof hiringOrg === 'object') {
    company = ((hiringOrg.name as string) || (hiringOrg.legalName as string) || '').trim();
    // schema.org Organization.logo is either a plain URL string or an ImageObject { url }.
    const logo = hiringOrg.logo as string | Record<string, unknown> | undefined;
    if (typeof logo === 'string') companyLogo = logo.trim();
    else if (logo && typeof logo === 'object') companyLogo = ((logo.url as string) || '').trim();
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
      salary_text: salaryTextFromJobPosting(obj),
      company_logo_url: companyLogo || undefined,
    };
  }
  return null;
}

function getJsonLdJobPosting(sourceDocument: Document = document): JobInfo | null {
  try {
    const scripts = sourceDocument.querySelectorAll('script[type="application/ld+json"]');
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

const GENERIC_CAREER_HEADING_RE = /^(career(s)?|career opportunities|job(s)?|job opportunities|job openings|current openings|open positions|employment opportunities|join (our|the) team|work with us|search jobs)$/i;

function cleanRoleCandidate(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function isSpecificRoleTitle(value: string, companyName: string): boolean {
  if (value.length < 3 || value.length > 160) return false;
  if (GENERIC_CAREER_HEADING_RE.test(value)) return false;
  if (value.toLowerCase() === companyName.trim().toLowerCase()) return false;
  if (/^(apply|apply now|job details|position details|description|overview)$/i.test(value)) return false;
  return true;
}

/**
 * Recover the selected role when a generic careers-page title was parsed.
 * Ordered selectors favor explicit ATS job-title signals before headings so a
 * page-wide "Career Opportunities" heading cannot mask the actual role.
 */
function findSpecificRoleFromDom(companyName: string): string | null {
  const selectors = [
    '[data-automation-id="jobPostingHeader"]',
    '[data-testid*="job-title" i]',
    '[data-testid*="jobTitle" i]',
    '[itemprop="title"]',
    '[id*="job-title" i]',
    '[class*="job-title" i]',
    '[class*="jobTitle" i]',
    '[class*="job_title" i]',
    '.iCIMS_JobHeader',
    '.iCIMS_JobTitle',
    '[class*="iCIMS" i] [class*="jobTitle" i]',
    '.posting-headline h1',
    '.posting-headline h2',
    '[aria-current="true"] [class*="title" i]',
    '[aria-selected="true"] [class*="title" i]',
    'main h1',
  ];

  const seen = new Set<Element>();
  for (const selector of selectors) {
    let elements: Element[] = [];
    try {
      elements = Array.from(document.querySelectorAll(selector));
    } catch {
      continue;
    }
    for (const element of elements) {
      if (seen.has(element)) continue;
      seen.add(element);
      const candidate = cleanRoleCandidate(element.textContent);
      if (isSpecificRoleTitle(candidate, companyName)) return candidate;
    }
  }
  return null;
}

// --- Site-specific parsers (higher accuracy when available) ---

function isLinkedInJobSurface(): boolean {
  const path = window.location.pathname;
  const q = window.location.search || '';
  if (/^\/jobs(\/|$)/i.test(path)) return true;
  if (/[?&]currentJobId=\d+/i.test(q)) return true;
  if (/^\/job\//i.test(path)) return true;
  return false;
}

/** Right-hand job pane on LinkedIn search / collections (SPA loads content after idle). */
function linkedInJobDetailsRoots(): Element[] {
  const selectors = [
    '.jobs-search__job-details--wrapper',
    '.jobs-search__job-details',
    '.jobs-search__job-details--container',
    '[class*="jobs-search-job-details"]',
    '[class*="job-details-reader"]',
    '.jobs-details',
    'div.scaffold-layout__list-detail-inner',
    '.scaffold-layout__list-detail',
    '[data-testid="job-search-details"]',
    'aside[class*="job-details"]',
    'div[class*="jobs-details"]',
  ];
  const seen = new Set<Element>();
  const out: Element[] = [];
  for (let i = 0; i < selectors.length; i++) {
    const el = document.querySelector(selectors[i]);
    if (el && !seen.has(el)) {
      seen.add(el);
      out.push(el);
    }
  }
  return out;
}

function pickLinkedInTitleCompanyLocation(
  root: Document | Element
): { role_title: string; company_name: string; location?: string } | null {
  const titleSelectors = [
    '[data-testid="jobsearch-JobInfoHeader-title"]',
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
    'span[class*="jobs-unified-top-card__company-name"] a',
  ];

  const locationSelectors = [
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.jobs-details-top-card__primary-description-container',
    'span[class*="bullet"]',
  ];

  let titleEl: Element | null = null;
  for (let i = 0; i < titleSelectors.length; i++) {
    const el = root.querySelector(titleSelectors[i]);
    const t = el?.textContent?.trim();
    if (t && t.length > 1 && t.length < 500 && !/^jobs$/i.test(t) && !/^linkedin$/i.test(t)) {
      titleEl = el;
      break;
    }
  }

  let companyEl: Element | null = null;
  for (let i = 0; i < companySelectors.length; i++) {
    const el = root.querySelector(companySelectors[i]);
    const t = el?.textContent?.trim();
    if (t && t.length > 1 && t.length < 200) {
      companyEl = el;
      break;
    }
  }

  let locationEl: Element | null = null;
  for (let i = 0; i < locationSelectors.length; i++) {
    const el = root.querySelector(locationSelectors[i]);
    if (el?.textContent?.trim()) {
      locationEl = el;
      break;
    }
  }

  const role_title = titleEl?.textContent?.trim();
  const company_name = companyEl?.textContent?.trim();
  if (!role_title || !company_name) return null;
  const location = locationEl?.textContent?.trim();
  return { role_title, company_name, location: location || undefined };
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

  // 1) Prefer the job-details pane (search-results + currentJobId loads here, not in main).
  const roots = linkedInJobDetailsRoots();
  for (let r = 0; r < roots.length; r++) {
    const picked = pickLinkedInTitleCompanyLocation(roots[r]);
    if (picked) {
      return {
        company_name: picked.company_name,
        role_title: picked.role_title,
        job_url: url,
        location: picked.location,
      };
    }
  }

  // 2) Whole document (older / simpler layouts).
  const docPick = pickLinkedInTitleCompanyLocation(document);
  if (docPick) {
    return {
      company_name: docPick.company_name,
      role_title: docPick.role_title,
      job_url: url,
      location: docPick.location,
    };
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

/**
 * Fallback employer logo: the CURRENT SITE's own favicon. Only meaningful on
 * the employer's/ATS's own domain (Workday, Greenhouse, a company careers
 * page, etc.) — NOT on third-party job boards like LinkedIn/Indeed, where the
 * favicon is the board's icon, not the employer's.
 */
function getPageFaviconUrl(): string | undefined {
  try {
    const link =
      document.querySelector<HTMLLinkElement>('link[rel~="icon" i]') ||
      document.querySelector<HTMLLinkElement>('link[rel="shortcut icon" i]') ||
      document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon" i]');
    if (link?.href) return link.href;
    return `${location.origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

/**
 * iCIMS branded portals keep the real job DOM inside #icims_content_iframe.
 * The top frame still exposes a stable /jobs/<id>/<slug>/job URL and a real
 * document title, while og:title remains a generic careers-page title.
 */
function getICimsJobInfo(): JobInfo | null {
  if (!window.location.hostname.endsWith('.icims.com')) return null;
  if (!/^\/jobs\/\d+\/[^/]+\/job\/?$/i.test(window.location.pathname)) return null;

  const pageTitle = cleanRoleCandidate(document.title);
  let titleAndLocation = pageTitle.split(/\s+\|\s+Careers at\s+/i)[0]?.trim() || '';
  let locationText: string | undefined;

  const lastIn = titleAndLocation.toLowerCase().lastIndexOf(' in ');
  if (lastIn > 2) {
    const possibleLocation = titleAndLocation.slice(lastIn + 4).trim();
    if (/^(remote|hybrid|on-site)\b/i.test(possibleLocation) || possibleLocation.includes(',')) {
      locationText = possibleLocation;
      titleAndLocation = titleAndLocation.slice(0, lastIn).trim();
    }
  }

  if (!isSpecificRoleTitle(titleAndLocation, '')) {
    const slug = window.location.pathname.match(/^\/jobs\/\d+\/([^/]+)\/job/i)?.[1] || '';
    titleAndLocation = slug
      .split('-')
      .filter(Boolean)
      .map((word) => word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  if (!titleAndLocation) return null;

  const logo = document.querySelector<HTMLImageElement>(
    'header img[alt*="Logo" i], [role="banner"] img[alt*="Logo" i], img[alt*="Insurance Logo" i]'
  );
  const companyFromLogo = cleanRoleCandidate(logo?.alt).replace(/\s+logo(?:\s*\([^)]*\))?$/i, '');
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
  const companyFromOg = ogTitle.split('|').map((part) => part.trim()).filter(Boolean).pop() || '';
  const companyName = companyFromLogo || companyFromOg || getCompanyFromDomain(window.location.hostname);
  if (!companyName) return null;

  // iCIMS commonly renders the actual posting inside a same-origin iframe.
  // Read structured/visible data from that document when available, while
  // keeping the stable top-frame job URL.
  let iframeDocument: Document | null = null;
  for (const frame of Array.from(document.querySelectorAll('iframe'))) {
    try {
      if (frame.contentDocument?.body) {
        iframeDocument = frame.contentDocument;
        break;
      }
    } catch {
      /* cross-origin frame; ignore */
    }
  }
  const iframeText = iframeDocument?.body?.innerText || '';
  const structured = iframeDocument ? getJsonLdJobPosting(iframeDocument) : null;
  const salaryText = structured?.salary_text || salaryTextFromVisibleText(iframeText);

  return {
    company_name: structured?.company_name || companyName,
    role_title: titleAndLocation,
    job_url: window.location.href,
    location: structured?.location || locationText,
    salary_text: salaryText,
    company_logo_url: structured?.company_logo_url || logo?.src || undefined,
  };
}

function getJobInfo(): JobInfo | null {
  const host = window.location.hostname;
  const addVisibleSalary = (job: JobInfo | null): JobInfo | null => {
    if (job && !job.salary_text) {
      job.salary_text = salaryTextFromVisibleText(document.body?.innerText || '');
    }
    return job;
  };
  if (host.includes('linkedin.com')) {
    return addVisibleSalary(getLinkedInJobInfo() || getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob());
  }
  if (host.includes('indeed.com')) {
    return addVisibleSalary(getIndeedJobInfo() || getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob());
  }
  if (host.endsWith('.icims.com')) {
    const icimsJob = getICimsJobInfo();
    if (icimsJob) return addVisibleSalary(icimsJob);
  }

  // We're on the employer's/ATS's own site — its favicon reliably represents
  // the employer, so use it whenever the parser didn't already find an
  // explicit logo (e.g. JSON-LD hiringOrganization.logo).
  const job = getJsonLdJobPosting() || getMetaAndTitleJob() || getDomFallbackJob();
  if (job && !isSpecificRoleTitle(cleanRoleCandidate(job.role_title), job.company_name)) {
    const specificRole = findSpecificRoleFromDom(job.company_name);
    if (specificRole) job.role_title = specificRole;
    else return null; // Career landing/list page, not a specific job posting.
  }
  if (job && !job.company_logo_url) {
    job.company_logo_url = getPageFaviconUrl();
  }
  return addVisibleSalary(job);
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

function readWidgetPosition(): { top: number } | null {
  try {
    const raw = sessionStorage.getItem(WIDGET_POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { top?: number };
    if (typeof p.top !== 'number') return null;
    return { top: p.top };
  } catch {
    return null;
  }
}

function saveWidgetPosition(top: number) {
  try {
    sessionStorage.setItem(WIDGET_POS_KEY, JSON.stringify({ top }));
  } catch {
    /* ignore */
  }
}

/**
 * Vertical-only drag. The widget stays PINNED to the right edge (right:0) and
 * only moves up/down — it never moves horizontally.
 */
function attachDragBehavior(
  root: HTMLElement,
  dragHandle: HTMLElement,
  options: { allowButtonTarget?: boolean; onTap?: () => void } = {},
) {
  let activePointerId: number | null = null;
  let startClientY = 0;
  let startTop = 0;
  let movedBeyondTapThreshold = false;
  const idleCursor = options.onTap ? 'pointer' : 'grab';

  dragHandle.style.touchAction = 'none';

  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return;
    const deltaY = ev.clientY - startClientY;
    if (!movedBeyondTapThreshold && Math.abs(deltaY) < 4) return;
    movedBeyondTapThreshold = true;
    const pad = 8;
    const rect = root.getBoundingClientRect();
    const maxTop = Math.max(pad, window.innerHeight - rect.height - pad);
    const nextTop = Math.min(Math.max(pad, startTop + deltaY), maxTop);
    root.style.top = `${nextTop}px`; // only vertical; horizontal stays pinned right
  };

  const stopDragging = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return;
    activePointerId = null;
    dragHandle.style.cursor = idleCursor;
    const rect = root.getBoundingClientRect();
    saveWidgetPosition(rect.top);
    document.removeEventListener('pointermove', onMove, true);
    document.removeEventListener('pointerup', stopDragging, true);
    document.removeEventListener('pointercancel', stopDragging, true);
    if (!movedBeyondTapThreshold && ev.type === 'pointerup') options.onTap?.();
  };

  dragHandle.addEventListener('pointerdown', (ev) => {
    // Don't start a drag when the user clicks a button inside the drag zone.
    if (!options.allowButtonTarget && (ev.target as HTMLElement | null)?.closest('button')) return;
    ev.preventDefault();
    ev.stopPropagation();
    activePointerId = ev.pointerId;
    movedBeyondTapThreshold = false;
    dragHandle.style.cursor = 'grabbing';
    const r = root.getBoundingClientRect();
    startClientY = ev.clientY;
    startTop = r.top;
    // Keep it docked to the right; switch centering transform to an absolute top.
    root.style.top = `${startTop}px`;
    root.style.right = '0';
    root.style.left = 'auto';
    root.style.bottom = 'auto';
    root.style.transform = 'none';
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', stopDragging, true);
    document.addEventListener('pointercancel', stopDragging, true);
  });

  // Pointer activation is handled on pointerup so a completed drag never also
  // opens the panel. Preserve native keyboard/programmatic button activation.
  if (options.onTap) {
    dragHandle.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.detail === 0) options.onTap?.();
    });
  }
}

/**
 * Sticky, collapsible side widget: Prefill application, Save to tracker, and
 * (soon) AI analysis. Expanded × minimizes; minimized × opens the hide-scope
 * menu. Draggable via the expanded header or minimized six-dot grip.
 */
function createJobTrackerWidget(job: JobInfo, defaultView: DefaultView): HTMLElement {
  const root = document.createElement('div');
  root.id = WIDGET_ROOT_ID;
  root.dataset.tmoJobSnapshot = JSON.stringify(widgetJobSnapshot(job));
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'TrackMyOPT job assistant');

  // Always dock to the right edge. A dragged vertical position is restored for
  // this tab session and clamped to the current viewport so it cannot reappear
  // off-screen after collapse, expansion, or a viewport-size change.
  root.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    bottom: auto;
    left: auto;
    transform: translateY(-50%);
    z-index: 2147483647;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow: visible;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const extIcon = chrome.runtime.getURL('icons/logo.gif');
  if (!document.getElementById('tmo-minimized-motion-style')) {
    const motionStyle = document.createElement('style');
    motionStyle.id = 'tmo-minimized-motion-style';
    motionStyle.textContent = `
      @media (prefers-reduced-motion: reduce) {
        #${WIDGET_ROOT_ID} .tmo-minimized-tab,
        #${WIDGET_ROOT_ID} .tmo-minimized-tab * { transition:none !important; }
      }
    `;
    document.head.appendChild(motionStyle);
  }

  // ---- Minimized control: close button + logo/open area + six-dot drag grip ----
  // Keep this palette aligned with popup.css --tmo-gradient-brand and the web
  // app's primary blue. The gradient is intentionally weighted toward navy so
  // the small floating control stays polished without appearing too bright.
  const minimizedBrand = {
    navy: '#1e3a8a',
    deepBlue: '#1e40af',
    primary: '#2563eb',
    dot: '#dbeafe',
  } as const;

  const tab = document.createElement('div');
  tab.className = 'tmo-minimized-tab';
  tab.style.cssText = `
    display:none;position:relative;align-items:stretch;width:62px;height:58px;margin:0;
    border:1px solid ${minimizedBrand.primary};border-right:none;border-radius:13px 0 0 13px;
    background:${minimizedBrand.deepBlue};box-shadow:0 7px 20px rgba(30,64,175,0.22);overflow:visible;
    transition:width 220ms cubic-bezier(.2,.8,.2,1),box-shadow 220ms ease;
  `;

  const tabOpenBtn = document.createElement('button');
  tabOpenBtn.type = 'button';
  tabOpenBtn.title = 'Click to open · drag vertically to move';
  tabOpenBtn.setAttribute('aria-label', 'Open or vertically move TrackMyOPT job assistant');
  tabOpenBtn.style.cssText = `
    width:62px;height:56px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;
    padding:0;border:0;border-radius:12px 0 0 12px;
    background:linear-gradient(135deg,${minimizedBrand.navy} 0%,${minimizedBrand.deepBlue} 58%,${minimizedBrand.primary} 100%);cursor:pointer;
    transition:width 220ms cubic-bezier(.2,.8,.2,1),filter 180ms ease;
  `;
  const tabImg = document.createElement('img');
  tabImg.src = extIcon; tabImg.alt = ''; tabImg.width = 34; tabImg.height = 34;
  tabImg.draggable = false;
  tabImg.style.cssText = 'object-fit:contain;border-radius:5px;pointer-events:none;user-select:none;-webkit-user-drag:none;';
  tabImg.addEventListener('error', () => tabImg.replaceWith(logoSvgFallback()));
  tabOpenBtn.appendChild(tabImg);

  const tabDragHandle = document.createElement('div');
  tabDragHandle.setAttribute('role', 'button');
  tabDragHandle.setAttribute('aria-label', 'Drag TrackMyOPT panel');
  tabDragHandle.tabIndex = -1;
  tabDragHandle.style.cssText = `
    width:0;height:56px;display:grid;grid-template-columns:repeat(2,4px);
    grid-template-rows:repeat(3,4px);align-content:center;justify-content:center;
    gap:4px;border-radius:0;background:${minimizedBrand.deepBlue};cursor:grab;outline:none;opacity:0;
    overflow:hidden;pointer-events:none;transform:translateX(10px);
    transition:width 220ms cubic-bezier(.2,.8,.2,1),opacity 180ms ease,transform 220ms cubic-bezier(.2,.8,.2,1);
  `;
  for (let i = 0; i < 6; i += 1) {
    const dot = document.createElement('span');
    dot.style.cssText = `width:4px;height:4px;border-radius:50%;background:${minimizedBrand.dot};display:block;`;
    tabDragHandle.appendChild(dot);
  }

  const tabCloseBtn = document.createElement('button');
  tabCloseBtn.type = 'button';
  tabCloseBtn.title = 'Hide TrackMyOPT';
  tabCloseBtn.setAttribute('aria-label', 'Hide TrackMyOPT options');
  tabCloseBtn.tabIndex = -1;
  tabCloseBtn.style.cssText = `
    position:absolute;top:-14px;left:-14px;z-index:2;width:40px;height:40px;padding:0;
    display:flex;align-items:center;justify-content:center;border:0;background:transparent;
    color:#fff;font:inherit;cursor:pointer;outline:none;
    opacity:0;pointer-events:none;transform:scale(0.72);
    transition:opacity 140ms ease,transform 170ms ease;
  `;
  const tabCloseVisual = document.createElement('span');
  tabCloseVisual.textContent = '×';
  tabCloseVisual.style.cssText = `
    width:24px;height:24px;display:flex;align-items:center;justify-content:center;
    border:0;border-radius:50%;background:${minimizedBrand.navy};color:#fff;
    font-size:17px;font-weight:400;line-height:1;box-shadow:none;
    transition:background 180ms ease,box-shadow 180ms ease;
  `;
  tabCloseBtn.appendChild(tabCloseVisual);
  tabCloseBtn.addEventListener('mouseenter', () => (tabCloseVisual.style.background = minimizedBrand.primary));
  tabCloseBtn.addEventListener('mouseleave', () => (tabCloseVisual.style.background = minimizedBrand.navy));
  tabOpenBtn.addEventListener('focus', () => (tabOpenBtn.style.boxShadow = 'inset 0 0 0 3px rgba(255,255,255,0.85)'));
  tabOpenBtn.addEventListener('blur', () => (tabOpenBtn.style.boxShadow = 'none'));
  tabDragHandle.addEventListener('focus', () => (tabDragHandle.style.boxShadow = 'inset 0 0 0 3px rgba(255,255,255,0.85)'));
  tabDragHandle.addEventListener('blur', () => (tabDragHandle.style.boxShadow = 'none'));
  tabCloseBtn.addEventListener('focus', () => (tabCloseVisual.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.3)'));
  tabCloseBtn.addEventListener('blur', () => (tabCloseVisual.style.boxShadow = 'none'));

  tab.appendChild(tabOpenBtn);
  tab.appendChild(tabDragHandle);
  tab.appendChild(tabCloseBtn);

  // ---- Expanded card ----
  const card = document.createElement('div');
  card.style.cssText = `
    width: min(320px, calc(100vw - 20px)); background: #fff;
    border: 1px solid #e2e8f0; border-right: none; border-radius: 14px 0 0 14px;
    box-shadow: 0 8px 30px rgba(15,23,42,0.18); overflow: hidden;
  `;

  // Header (drag zone)
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex; align-items: center; gap: 8px;
    padding: 10px 10px 10px 12px;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    cursor: grab; user-select: none;
  `;
  const logoRing = document.createElement('div');
  logoRing.style.cssText = `
    width: 28px; height: 28px; border-radius: 50%; background: #fff;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    box-shadow: 0 1px 3px rgba(30,64,175,0.2);
  `;
  const logoImg = document.createElement('img');
  logoImg.src = extIcon; logoImg.alt = ''; logoImg.width = 20; logoImg.height = 20;
  logoImg.style.cssText = 'object-fit:contain;border-radius:3px;';
  logoImg.addEventListener('error', () => logoImg.replaceWith(logoSvgFallback()));
  logoRing.appendChild(logoImg);

  const title = document.createElement('span');
  title.textContent = 'TrackMyOPT';
  title.style.cssText =
    'font-size:13px;font-weight:800;color:#1e40af;letter-spacing:-0.02em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

  const backBtn = iconBtn('‹', 'Back');
  const settingsBtn = iconBtn('⚙', 'Settings');
  const closeBtn = iconBtn('×', 'Minimize panel');
  backBtn.style.display = 'none'; // only shown while the Settings panel is open

  header.appendChild(logoRing);
  header.appendChild(title);
  header.appendChild(backBtn);
  header.appendChild(settingsBtn);
  header.appendChild(closeBtn);

  // Structured job summary — role first, then only data actually extracted
  // from the posting. Missing location/salary rows are omitted, never guessed.
  const jobLine = document.createElement('section');
  jobLine.setAttribute('aria-label', 'Current job');
  jobLine.style.cssText = `
    margin:12px 14px 2px;padding:13px;border:1px solid #e2e8f0;border-radius:12px;
    background:#fff;box-shadow:0 2px 7px rgba(15,23,42,0.06);line-height:1.38;
  `;

  const jobTitleRow = document.createElement('div');
  jobTitleRow.style.cssText = 'display:flex;align-items:flex-start;gap:8px;';
  const roleEl = document.createElement('div');
  roleEl.textContent = job.role_title || 'Selected role';
  roleEl.title = job.role_title || 'Selected role';
  roleEl.style.cssText = 'min-width:0;flex:1;color:#172033;font-size:15px;font-weight:800;overflow-wrap:anywhere;';
  const savedBadge = document.createElement('span');
  savedBadge.textContent = 'Not saved';
  savedBadge.style.cssText = `
    flex:0 0 auto;padding:5px 9px;border-radius:999px;background:#f1f5f9;color:#475569;
    font-size:10.5px;font-weight:750;white-space:nowrap;
  `;
  jobTitleRow.appendChild(roleEl);
  jobTitleRow.appendChild(savedBadge);

  const companyRow = document.createElement('div');
  companyRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:7px;min-width:0;';
  const companyMark = document.createElement('span');
  companyMark.setAttribute('aria-hidden', 'true');
  companyMark.style.cssText = `
    width:30px;height:30px;flex:0 0 30px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;
    display:flex;align-items:center;justify-content:center;overflow:hidden;color:#1d4ed8;font-size:12px;font-weight:800;
  `;
  const companyInitial = (job.company_name || 'C').trim().charAt(0).toUpperCase() || 'C';
  companyMark.textContent = companyInitial;
  if (job.company_logo_url) {
    const companyLogo = document.createElement('img');
    companyLogo.src = job.company_logo_url;
    companyLogo.alt = '';
    companyLogo.draggable = false;
    companyLogo.style.cssText = 'width:25px;height:25px;object-fit:contain;display:block;';
    companyLogo.addEventListener('load', () => {
      companyMark.textContent = '';
      companyMark.appendChild(companyLogo);
    });
    companyLogo.addEventListener('error', () => (companyMark.textContent = companyInitial));
  }

  const companyEl = document.createElement('div');
  companyEl.textContent = job.company_name || 'Company';
  companyEl.title = job.company_name || 'Company';
  companyEl.style.cssText = 'min-width:0;color:#405462;font-size:13px;font-weight:650;overflow-wrap:anywhere;';
  companyRow.appendChild(companyMark);
  companyRow.appendChild(companyEl);

  jobLine.appendChild(jobTitleRow);
  jobLine.appendChild(companyRow);

  if (job.location) {
    const locationEl = document.createElement('div');
    locationEl.textContent = job.location;
    locationEl.style.cssText = 'margin-top:11px;color:#405462;font-size:12.5px;font-weight:600;overflow-wrap:anywhere;';
    jobLine.appendChild(locationEl);
  }
  if (job.salary_text) {
    const salaryEl = document.createElement('div');
    salaryEl.textContent = job.salary_text;
    salaryEl.style.cssText = 'margin-top:8px;color:#405462;font-size:12.5px;font-weight:650;overflow-wrap:anywhere;';
    jobLine.appendChild(salaryEl);
  }

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.innerHTML = `<span class="tmo-action-label">Save to job tracker</span>${icon('chevronRight', 15, '#0ea5e9')}`;
  saveBtn.style.cssText = `
    min-height:44px;margin:8px 0 -7px -8px;padding:8px;border:0;background:transparent;color:#0ea5e9;
    display:inline-flex;align-items:center;gap:5px;font:inherit;font-size:13px;font-weight:750;cursor:pointer;
    border-radius:8px;transition:background 180ms ease,color 180ms ease;
  `;
  saveBtn.addEventListener('mouseenter', () => (saveBtn.style.background = '#f0f9ff'));
  saveBtn.addEventListener('mouseleave', () => (saveBtn.style.background = 'transparent'));
  saveBtn.addEventListener('focus', () => (saveBtn.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.18)'));
  saveBtn.addEventListener('blur', () => (saveBtn.style.boxShadow = 'none'));
  jobLine.appendChild(saveBtn);

  // Actions
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:10px 14px 14px;';

  const prefillBtn = actionBtn(icon('zap', 15), 'Prefill application');
  prefillBtn.classList.add('tmo-prefill-button');
  if (generatedResumeFor(job)) {
    const label = prefillBtn.querySelector<HTMLElement>('.tmo-action-label');
    if (label) label.textContent = 'Prefill application + resume';
    prefillBtn.title = 'Prefill profile fields and attach the custom resume generated for this job';
  }
  const resumeBtn = actionBtn(icon('fileText', 15), 'Generate custom resume');
  const aiBtn = actionBtn(icon('sparkles', 15), 'Analyze with AI');
  const soon = document.createElement('span');
  soon.textContent = 'soon';
  soon.style.cssText =
    'margin-left:auto;font-size:10px;font-weight:700;color:#94a3b8;background:#f1f5f9;padding:1px 6px;border-radius:999px;';
  aiBtn.appendChild(soon);
  aiBtn.style.opacity = '0.75';

  actions.appendChild(prefillBtn);
  actions.appendChild(resumeBtn);
  actions.appendChild(aiBtn);

  // Feedback link (opens the on-page feedback modal)
  const feedbackRow = document.createElement('div');
  feedbackRow.style.cssText = 'padding:0 12px 12px;text-align:center;';
  const feedbackBtn = document.createElement('button');
  feedbackBtn.type = 'button';
  feedbackBtn.innerHTML = `${icon('messageCircle', 14)}<span>Send feedback</span>`;
  feedbackBtn.style.cssText =
    'display:inline-flex;align-items:center;gap:5px;border:none;background:transparent;color:#64748b;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;padding:2px 6px;';
  feedbackBtn.addEventListener('mouseenter', () => (feedbackBtn.style.color = "#2563eb"));
  feedbackBtn.addEventListener('mouseleave', () => (feedbackBtn.style.color = '#64748b'));
  feedbackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openFeedbackModal();
  });
  feedbackRow.appendChild(feedbackBtn);

  // Normal content (job info + actions + feedback link) — hidden while Settings is open.
  const normalBody = document.createElement('div');
  normalBody.appendChild(jobLine);
  normalBody.appendChild(actions);
  normalBody.appendChild(feedbackRow);

  // ---- Settings panel ("Default plugin view": Expanded / Minimized) ----
  const settingsPanel = document.createElement('div');
  settingsPanel.style.cssText = 'display:none;padding:14px 12px 16px;';

  const settingsLabelRow = document.createElement('div');
  settingsLabelRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;';
  const settingsLabel = document.createElement('span');
  settingsLabel.textContent = 'Default plugin view';
  settingsLabel.style.cssText = 'font-size:12.5px;font-weight:700;color:#0f172a;';
  const helpBtn = document.createElement('button');
  helpBtn.type = 'button';
  helpBtn.textContent = '?';
  helpBtn.setAttribute('aria-label', 'What does this setting do?');
  helpBtn.title =
    'Choose how TrackMyOPT appears when a new job page loads: fully expanded, or minimized to a small tab you click to open.';
  helpBtn.style.cssText = `
    width:16px;height:16px;flex-shrink:0;border-radius:50%;border:1px solid #cbd5e1;
    background:#f8fafc;color:#64748b;font-size:10px;font-weight:700;line-height:1;
    cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;
  `;
  settingsLabelRow.appendChild(settingsLabel);
  settingsLabelRow.appendChild(helpBtn);
  settingsPanel.appendChild(settingsLabelRow);

  const helpText = document.createElement('p');
  helpText.textContent = 'This only changes how the widget first appears on a new job page — it does not affect the current one.';
  helpText.style.cssText = 'display:none;font-size:11px;color:#64748b;margin:0 0 10px;line-height:1.4;';
  settingsPanel.appendChild(helpText);
  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    helpText.style.display = helpText.style.display === 'none' ? 'block' : 'none';
  });

  const segmented = document.createElement('div');
  segmented.style.cssText = 'display:flex;gap:6px;margin-top:8px;';
  const expandedOptBtn = viewOptionBtn('Expanded');
  const minimizedOptBtn = viewOptionBtn('Minimized');
  segmented.appendChild(expandedOptBtn);
  segmented.appendChild(minimizedOptBtn);
  settingsPanel.appendChild(segmented);

  const savedNote = document.createElement('p');
  savedNote.style.cssText = 'margin:10px 0 0;font-size:11px;color:#2563eb;font-weight:700;min-height:14px;';
  settingsPanel.appendChild(savedNote);

  function paintViewOptions(selected: DefaultView) {
    expandedOptBtn.style.cssText = viewOptionStyle(selected === 'expanded');
    minimizedOptBtn.style.cssText = viewOptionStyle(selected === 'minimized');
  }
  paintViewOptions(defaultView);

  card.appendChild(header);
  card.appendChild(normalBody);
  card.appendChild(settingsPanel);

  // Minimized close menu (3 hide scopes)
  const menu = document.createElement('div');
  menu.style.cssText = `
    display:none;position:absolute;top:44px;right:64px;z-index:5;
    width:min(260px,calc(100vw - 32px));background:#fff;border:1px solid #dbe3ee;border-radius:12px;
    box-shadow:0 12px 36px rgba(15,23,42,0.22);overflow:hidden;padding:8px 0;
  `;
  const menuItem = (label: string, onClick: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText =
      'display:block;width:100%;min-height:46px;text-align:left;padding:11px 18px;border:none;background:#fff;color:#26364d;font:inherit;font-size:14px;font-weight:600;cursor:pointer;';
    b.addEventListener('mouseenter', () => (b.style.background = '#f1f5f9'));
    b.addEventListener('mouseleave', () => (b.style.background = '#fff'));
    b.addEventListener('focus', () => {
      b.style.background = '#eff6ff';
      b.style.outline = '2px solid #2563eb';
      b.style.outlineOffset = '-2px';
    });
    b.addEventListener('blur', () => {
      b.style.background = '#fff';
      b.style.outline = 'none';
    });
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return b;
  };
  menu.appendChild(menuItem('Hide until next visit', () => { hideForThisVisit(); root.remove(); }));
  menu.appendChild(menuItem('Disable on this domain', () => { void hideForThisSite(); root.remove(); }));
  menu.appendChild(menuItem('Disable on all pages', () => { void hideForAllSites(); root.remove(); }));

  root.appendChild(tab);
  root.appendChild(card);
  root.appendChild(menu);

  let tabControlsRevealed = false;
  const setTabControlsRevealed = (revealed: boolean) => {
    if (tabControlsRevealed === revealed) return;
    tabControlsRevealed = revealed;
    tab.style.width = revealed ? '106px' : '62px';
    tab.style.boxShadow = revealed
      ? '0 9px 26px rgba(30,64,175,0.32)'
      : '0 7px 20px rgba(30,64,175,0.22)';
    tabOpenBtn.style.width = revealed ? '70px' : '62px';
    tabDragHandle.style.width = revealed ? '36px' : '0';
    tabDragHandle.style.opacity = revealed ? '1' : '0';
    tabDragHandle.style.transform = revealed ? 'translateX(0)' : 'translateX(10px)';
    tabDragHandle.style.pointerEvents = revealed ? 'auto' : 'none';
    tabDragHandle.tabIndex = revealed ? 0 : -1;
    tabCloseBtn.style.opacity = revealed ? '1' : '0';
    tabCloseBtn.style.transform = revealed ? 'scale(1)' : 'scale(0.72)';
    tabCloseBtn.style.pointerEvents = revealed ? 'auto' : 'none';
    tabCloseBtn.tabIndex = revealed ? 0 : -1;
  };
  const retractTabControlsWhenIdle = () => {
    window.setTimeout(() => {
      if (menu.style.display !== 'none') return;
      const active = document.activeElement;
      if (tab.matches(':hover')) return;
      if (active && (tab.contains(active) || menu.contains(active))) return;
      setTabControlsRevealed(false);
    }, 60);
  };

  tab.addEventListener('mouseenter', () => setTabControlsRevealed(true));
  tab.addEventListener('mouseleave', retractTabControlsWhenIdle);
  tab.addEventListener('focusin', () => setTabControlsRevealed(true));
  tab.addEventListener('focusout', retractTabControlsWhenIdle);

  attachDragBehavior(root, header);
  attachDragBehavior(root, tabDragHandle);

  // ---- collapse / expand ----
  const setCollapsed = (collapsed: boolean) => {
    setCollapsedPref(collapsed);
    card.style.display = collapsed ? 'none' : 'block';
    tab.style.display = collapsed ? 'flex' : 'none';
    menu.style.display = 'none';
    setTabControlsRevealed(false);
    document.removeEventListener('click', onDocClick, true);
    requestAnimationFrame(() => {
      const rect = root.getBoundingClientRect();
      const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
      if (rect.top < 8 || rect.top > maxTop) {
        root.style.top = `${Math.min(Math.max(8, rect.top), maxTop)}px`;
        root.style.transform = 'none';
      }
    });
  };
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); setCollapsed(true); });
  attachDragBehavior(root, tabOpenBtn, {
    allowButtonTarget: true,
    onTap: () => setCollapsed(false),
  });

  // ---- Settings panel open/close (swaps content in place; same widget card) ----
  function showSettings(show: boolean) {
    normalBody.style.display = show ? 'none' : 'block';
    settingsPanel.style.display = show ? 'block' : 'none';
    title.textContent = show ? 'Settings' : 'TrackMyOPT';
    settingsBtn.style.display = show ? 'none' : 'flex';
    closeBtn.style.display = show ? 'none' : 'flex';
    backBtn.style.display = show ? 'flex' : 'none';
    menu.style.display = 'none';
  }
  settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); showSettings(true); });
  backBtn.addEventListener('click', (e) => { e.stopPropagation(); showSettings(false); });

  /**
   * Persist the chosen default view, clear any per-session override so the new
   * default isn't immediately shadowed, and apply it to THIS widget right away
   * so the choice is visibly confirmed.
   */
  async function chooseDefaultView(view: DefaultView) {
    paintViewOptions(view);
    await setDefaultViewPref(view);
    clearSessionCollapsedOverride();
    setCollapsed(view === 'minimized');
    savedNote.textContent = 'Saved ✓';
    setTimeout(() => { savedNote.textContent = ''; }, 1500);
  }
  expandedOptBtn.addEventListener('click', (e) => { e.stopPropagation(); void chooseDefaultView('expanded'); });
  minimizedOptBtn.addEventListener('click', (e) => { e.stopPropagation(); void chooseDefaultView('minimized'); });

  // ---- close menu (open only while needed; no leaked global listener) ----
  const onDocClick = (e: MouseEvent) => {
    if (!root.contains(e.target as Node)) {
      menu.style.display = 'none';
      document.removeEventListener('click', onDocClick, true);
      setTabControlsRevealed(false);
    }
  };
  tabCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = menu.style.display === 'none';
    menu.style.display = opening ? 'block' : 'none';
    if (opening) {
      setTabControlsRevealed(true);
      menu.style.top = '44px';
      menu.style.bottom = 'auto';
      requestAnimationFrame(() => {
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.bottom > window.innerHeight - 8) {
          menu.style.top = 'auto';
          menu.style.bottom = '44px';
        }
      });
      setTimeout(() => document.addEventListener('click', onDocClick, true), 0);
      requestAnimationFrame(() => menu.querySelector<HTMLButtonElement>('button')?.focus());
    } else {
      document.removeEventListener('click', onDocClick, true);
      retractTabControlsWhenIdle();
    }
  });

  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    menu.style.display = 'none';
    document.removeEventListener('click', onDocClick, true);
    tabOpenBtn.focus();
  });

  tabDragHandle.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const rect = root.getBoundingClientRect();
    const delta = e.key === 'ArrowUp' ? -16 : 16;
    const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
    const nextTop = Math.min(Math.max(8, rect.top + delta), maxTop);
    root.style.top = `${nextTop}px`;
    root.style.right = '0';
    root.style.left = 'auto';
    root.style.transform = 'none';
    saveWidgetPosition(nextTop);
  });

  const savedPosition = readWidgetPosition();
  if (savedPosition) {
    requestAnimationFrame(() => {
      const rect = root.getBoundingClientRect();
      const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
      root.style.top = `${Math.min(Math.max(8, savedPosition.top), maxTop)}px`;
      root.style.right = '0';
      root.style.left = 'auto';
      root.style.transform = 'none';
    });
  }

  const clampWidgetToViewport = () => {
    if (!root.isConnected) {
      window.removeEventListener('resize', clampWidgetToViewport);
      return;
    }
    const rect = root.getBoundingClientRect();
    const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
    const nextTop = Math.min(Math.max(8, rect.top), maxTop);
    root.style.top = `${nextTop}px`;
    root.style.right = '0';
    root.style.left = 'auto';
    root.style.transform = 'none';
    saveWidgetPosition(nextTop);
  };
  window.addEventListener('resize', clampWidgetToViewport, { passive: true });

  // ---- actions ----
  prefillBtn.addEventListener('click', () => {
    const resume = generatedResumeFor(job);
    void runPrefill({ resume });
    // The top-frame engine handles the main document, open shadow roots, and
    // same-origin frames. Ask statically loaded child-frame scripts to cover
    // cross-origin ATS frames that the browser prevents the top frame reading.
    chrome.runtime.sendMessage({ type: 'PREFILL_CHILD_FRAMES', resume }).catch(() => {});
  });

  // Opens an explicit saved-resume/template chooser, then generates in the
  // widget with a live countdown and Download / Edit LaTeX actions.
  resumeBtn.addEventListener('click', () => {
    openResumeChooser(card, job);
  });

  aiBtn.addEventListener('click', () => {
    showMessage('AI job analysis is coming soon.', false);
  });

  const saveJobWithStatus = (status: ApplicationSaveStatus) => {
    const label = saveBtn.querySelector('.tmo-action-label') as HTMLElement | null;
    const prev = label?.textContent || 'Save to job tracker';
    saveBtn.style.pointerEvents = 'none';
    if (label) label.textContent = 'Saving…';
    savedBadge.textContent = 'Saving…';
    chrome.runtime.sendMessage(
      { type: 'ADD_JOB_TO_TRACKER', job, status },
      (response: { ok?: boolean; error?: string } | undefined) => {
        saveBtn.style.pointerEvents = '';
        if (chrome.runtime.lastError) {
          if (label) label.textContent = prev;
          savedBadge.textContent = 'Not saved';
          showMessage('TrackMyOPT: Sign in in the extension to save jobs.', true);
          return;
        }
        if (response?.ok) {
          if (label) label.textContent = 'Saved to job tracker';
          savedBadge.textContent = 'Saved';
          savedBadge.style.background = '#dcfce7';
          savedBadge.style.color = '#166534';
          saveBtn.disabled = true;
          saveBtn.style.cursor = 'default';
          showMessage(status === 'Applied' ? 'Application added to Job Tracker!' : 'Job saved to your Wishlist!', false);
        } else {
          if (label) label.textContent = prev;
          savedBadge.textContent = 'Not saved';
          showMessage(response?.error || 'Failed to save job', true);
        }
      }
    );
  };
  saveBtn.addEventListener('click', () => {
    openApplicationStatusDialog(job, saveJobWithStatus);
  });

  // Initial state: an explicit per-session override (user already toggled
  // collapse/expand on this origin this session) wins; otherwise fall back to
  // the persisted "Default plugin view" setting from the Settings panel.
  const sessionOverride = readSessionCollapsedOverride();
  setCollapsed(sessionOverride !== null ? sessionOverride : defaultView === 'minimized');

  return root;
}

/** Small icon button for the widget header (collapse / close). */
function iconBtn(glyph: string, label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.title = label;
  b.textContent = glyph;
  b.style.cssText = `
    width:34px;height:34px;flex-shrink:0;padding:0;margin:0;border:none;border-radius:8px;
    background:transparent;color:#1e40af;font-size:18px;line-height:1;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
  `;
  b.addEventListener('mouseenter', () => (b.style.background = "rgba(37,99,235,0.1)"));
  b.addEventListener('mouseleave', () => (b.style.background = 'transparent'));
  return b;
}

/** Full-width action row button: real lucide-style SVG icon (matches the web app sidebar) + label. */
function actionBtn(iconSvg: string, label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.style.cssText = `
    display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:10px 12px;
    border:1px solid #dbe3ee;border-radius:10px;background:#fff;color:#0f172a;
    font:inherit;font-size:13px;font-weight:650;cursor:pointer;text-align:left;
    box-shadow:0 1px 1px rgba(15,23,42,0.03);transition:background 160ms ease,border-color 160ms ease,transform 160ms ease;
  `;
  b.addEventListener('mouseenter', () => {
    b.style.background = '#f8fafc';
    b.style.borderColor = '#bfdbfe';
  });
  b.addEventListener('mouseleave', () => {
    b.style.background = '#fff';
    b.style.borderColor = '#dbe3ee';
  });
  b.addEventListener('focus', () => (b.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.2)'));
  b.addEventListener('blur', () => (b.style.boxShadow = '0 1px 1px rgba(15,23,42,0.03)'));
  const g = document.createElement('span');
  g.innerHTML = iconSvg;
  g.style.cssText = 'display:flex;flex-shrink:0;';
  const l = document.createElement('span');
  l.className = 'tmo-action-label';
  l.textContent = label;
  b.appendChild(g);
  b.appendChild(l);
  return b;
}

// ── Generate custom resume (in-widget) ──────────────────────────────────────

const RESUME_PANEL_CLASS = 'tmo-resume-panel';

function ensureSpinKeyframes(): void {
  if (document.getElementById('tmo-spin-style')) return;
  const style = document.createElement('style');
  style.id = 'tmo-spin-style';
  style.textContent = '@keyframes tmo-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
}

/** Best-effort job-description text from the current page. */
function scrapeJobDescription(): string {
  const candidates: JobDescriptionCandidate[] = [];
  const selectors = [
    '[data-testid*="jobDescription" i]',
    '[class*="job-description" i]',
    '[class*="jobDescription" i]',
    '[id*="job-description" i]',
    '[class*="description" i]',
    'main',
    'article',
  ];
  // iCIMS and several ATS products render the real posting in an iframe while
  // the top document contains only branding/footer chrome. Same-origin job
  // documents must therefore be considered before the outer page.
  for (const frame of Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'))) {
    try {
      const frameDocument = frame.contentDocument;
      const frameText = frameDocument?.body?.innerText || '';
      if (frameText) candidates.push({ source: 'frame', text: frameText });
      if (frameDocument) {
        for (const selector of selectors) {
          for (const element of Array.from(frameDocument.querySelectorAll<HTMLElement>(selector))) {
            if (element.innerText) candidates.push({ source: 'frame', text: element.innerText });
          }
        }
      }
    } catch {
      /* cross-origin frame; child-frame prefill remains isolated */
    }
  }

  for (const selector of selectors) {
    for (const element of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
      if (element.closest(`#${WIDGET_ROOT_ID}, #tmo-resume-chooser, #tmo-application-status-dialog`)) continue;
      if (element.innerText) candidates.push({ source: 'specific', text: element.innerText });
    }
  }

  // Last resort: collect top-level page children while explicitly excluding
  // every TrackMyOPT-owned surface so our card/modal is never sent as the JD.
  const outerText = Array.from(document.body?.children || [])
    .filter((element) => ![
      WIDGET_ROOT_ID,
      'tmo-resume-chooser',
      'tmo-application-status-dialog',
      'tmo-easy-apply-toast',
    ].includes(element.id))
    .filter((element) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName))
    .map((element) => (element as HTMLElement).innerText || '')
    .filter(Boolean)
    .join('\n\n');
  if (outerText) candidates.push({ source: 'outer', text: outerText });

  return chooseJobDescriptionCandidate(candidates);
}

function downloadGeneratedPdf(base64: string, filename: string): void {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function resumeMiniBtn(labelSvgAndText: string, primary: boolean): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = labelSvgAndText;
  b.style.cssText = `
    flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
    min-height:44px;padding:10px 9px;border-radius:9px;font:inherit;font-size:12.5px;font-weight:750;cursor:pointer;
    ${primary
      ? 'background:#2563eb;color:#fff;border:1px solid #2563eb;'
      : 'background:#fff;color:#0f172a;border:1px solid #e2e8f0;'}
  `;
  b.addEventListener('focus', () => (b.style.outline = '3px solid rgba(37,99,235,0.22)'));
  b.addEventListener('blur', () => (b.style.outline = 'none'));
  return b;
}

type SavedResumeOption = {
  id: string;
  filename: string;
  updatedAt?: string | null;
};

const SIDE_PANEL_TEMPLATES = [
  { id: 'professional', name: 'Professional Executive', hint: 'ATS-safe · traditional' },
  { id: 'tech', name: 'Tech Focused', hint: 'ATS-safe · engineering' },
  { id: 'modern', name: 'Modern Minimalist', hint: 'Clean · versatile' },
  { id: 'academic', name: 'Academic CV', hint: 'Research · education' },
  { id: 'executive', name: 'Executive Brief', hint: 'Leadership · concise' },
  { id: 'creative', name: 'Creative Portfolio', hint: 'Design · marketing' },
] as const;

function modalFieldLabel(text: string, htmlFor: string): HTMLLabelElement {
  const label = document.createElement('label');
  label.htmlFor = htmlFor;
  label.textContent = text;
  label.style.cssText = 'display:block;margin:0 0 6px;color:#0f172a;font-size:12.5px;font-weight:750;';
  return label;
}

function modalSelect(id: string): HTMLSelectElement {
  const select = document.createElement('select');
  select.id = id;
  select.style.cssText = `
    display:block;width:100%;height:44px;padding:0 34px 0 11px;border:1px solid #cbd5e1;
    border-radius:9px;background:#fff;color:#0f172a;font:inherit;font-size:13px;cursor:pointer;
    outline:none;
  `;
  select.addEventListener('focus', () => {
    select.style.borderColor = '#2563eb';
    select.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.16)';
  });
  select.addEventListener('blur', () => {
    select.style.borderColor = '#cbd5e1';
    select.style.boxShadow = 'none';
  });
  return select;
}

type ApplicationSaveStatus = 'Wishlist' | 'Applied';

function openApplicationStatusDialog(
  job: JobInfo,
  onSelect: (status: ApplicationSaveStatus) => void,
): void {
  document.getElementById('tmo-application-status-dialog')?.remove();
  const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-application-status-dialog';
  overlay.setAttribute('popover', 'manual');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;width:auto;height:auto;margin:0;padding:16px;border:0;
    background:rgba(15,23,42,0.5);display:flex;align-items:center;justify-content:center;overflow:auto;
    color:#0f172a;color-scheme:light;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  `;

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'tmo-application-status-title');
  dialog.style.cssText = `
    width:min(360px,calc(100vw - 24px));border:1px solid #dbe3ee;border-radius:16px;background:#fff;
    box-shadow:0 24px 70px rgba(15,23,42,0.32);overflow:hidden;
  `;

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:17px 17px 13px;border-bottom:1px solid #eef2f7;';
  const headingCopy = document.createElement('div');
  headingCopy.style.cssText = 'flex:1;min-width:0;';
  const heading = document.createElement('h2');
  heading.id = 'tmo-application-status-title';
  heading.textContent = 'Application Status';
  heading.style.cssText = 'margin:0;color:#0f172a;font-size:17px;line-height:1.3;font-weight:800;';
  const description = document.createElement('p');
  description.textContent = `Have you applied for ${job.role_title || 'this job'}?`;
  description.style.cssText = 'margin:5px 0 0;color:#64748b;font-size:12.5px;line-height:1.45;';
  headingCopy.appendChild(heading);
  headingCopy.appendChild(description);

  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close application status');
  close.textContent = '×';
  close.style.cssText = 'width:44px;height:44px;flex:0 0 44px;border:0;border-radius:10px;background:#f1f5f9;color:#334155;font:inherit;font-size:22px;cursor:pointer;';
  header.appendChild(headingCopy);
  header.appendChild(close);

  const body = document.createElement('div');
  body.style.cssText = 'display:grid;gap:9px;padding:15px 17px 17px;';

  const option = (status: ApplicationSaveStatus, label: string, hint: string): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.cssText = `
      width:100%;min-height:58px;padding:11px 12px;border:1px solid #dbe3ee;border-radius:11px;
      background:#fff;color:#0f172a;display:flex;align-items:center;gap:11px;text-align:left;font:inherit;cursor:pointer;
      transition:border-color 180ms ease,background 180ms ease,box-shadow 180ms ease;
    `;
    const marker = document.createElement('span');
    marker.style.cssText = 'width:18px;height:18px;flex:0 0 18px;border:2px solid #94a3b8;border-radius:50%;box-shadow:inset 0 0 0 4px #fff;';
    const copy = document.createElement('span');
    copy.style.cssText = 'min-width:0;display:block;';
    const labelEl = document.createElement('strong');
    labelEl.textContent = label;
    labelEl.style.cssText = 'display:block;color:#0f172a;font-size:13.5px;line-height:1.3;';
    const hintEl = document.createElement('span');
    hintEl.textContent = hint;
    hintEl.style.cssText = 'display:block;margin-top:3px;color:#64748b;font-size:11.5px;line-height:1.35;';
    copy.appendChild(labelEl);
    copy.appendChild(hintEl);
    button.appendChild(marker);
    button.appendChild(copy);
    button.addEventListener('mouseenter', () => {
      button.style.borderColor = '#2563eb';
      button.style.background = '#eff6ff';
      marker.style.borderColor = '#2563eb';
    });
    button.addEventListener('mouseleave', () => {
      button.style.borderColor = '#dbe3ee';
      button.style.background = '#fff';
      marker.style.borderColor = '#94a3b8';
    });
    button.addEventListener('focus', () => (button.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.18)'));
    button.addEventListener('blur', () => (button.style.boxShadow = 'none'));
    button.addEventListener('click', () => {
      cleanup();
      onSelect(status);
    });
    return button;
  };

  const notApplied = option('Wishlist', 'I have not applied yet', 'Save this job to your Wishlist.');
  const applied = option('Applied', 'I applied', 'Save it as an active application.');
  body.appendChild(notApplied);
  body.appendChild(applied);
  dialog.appendChild(header);
  dialog.appendChild(body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown, true);
    try { overlay.hidePopover?.(); } catch { /* already closed */ }
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cleanup();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [close, notApplied, applied];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });
  try {
    overlay.showPopover?.();
  } catch {
    overlay.removeAttribute('popover');
  }
  notApplied.focus();
}

/** Explicit resume/template chooser displayed before any generation starts. */
function openResumeChooser(card: HTMLElement, job: JobInfo): void {
  document.getElementById('tmo-resume-chooser')?.remove();
  // Capture before mounting TrackMyOPT's modal so extension UI can never enter
  // the job-description payload or preview.
  const jobDescription = scrapeJobDescription();
  const returnFocusTo = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;

  const overlay = document.createElement('div');
  overlay.id = 'tmo-resume-chooser';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.48);
    display:flex;align-items:center;justify-content:center;padding:16px;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  `;
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'tmo-resume-dialog-title');
  dialog.style.cssText = `
    width:min(380px,calc(100vw - 24px));max-height:calc(100vh - 32px);overflow:auto;
    border:1px solid #dbe3ee;border-radius:16px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,0.32);
  `;

  const dialogHeader = document.createElement('div');
  dialogHeader.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:18px 18px 14px;border-bottom:1px solid #eef2f7;';
  const headerCopy = document.createElement('div');
  headerCopy.style.cssText = 'flex:1;min-width:0;';
  const heading = document.createElement('h2');
  heading.id = 'tmo-resume-dialog-title';
  heading.textContent = 'Generate custom resume';
  heading.style.cssText = 'margin:0;color:#0f172a;font-size:17px;line-height:1.3;font-weight:800;letter-spacing:-0.02em;';
  const description = document.createElement('p');
  description.textContent = 'Choose the resume and template to tailor for this job.';
  description.style.cssText = 'margin:5px 0 0;color:#64748b;font-size:12.5px;line-height:1.45;';
  headerCopy.appendChild(heading);
  headerCopy.appendChild(description);
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close resume generator');
  close.textContent = '×';
  close.style.cssText = 'width:44px;height:44px;flex-shrink:0;border:0;border-radius:10px;background:#f1f5f9;color:#334155;font-size:22px;line-height:1;cursor:pointer;';
  dialogHeader.appendChild(headerCopy);
  dialogHeader.appendChild(close);

  const body = document.createElement('div');
  body.style.cssText = 'padding:16px 18px 18px;';
  body.setAttribute('aria-live', 'polite');
  const loading = document.createElement('div');
  loading.style.cssText = 'display:flex;align-items:center;gap:9px;min-height:88px;color:#475569;font-size:13px;';
  const spinner = document.createElement('span');
  spinner.style.cssText = 'width:17px;height:17px;border:2px solid #cbd5e1;border-top-color:#2563eb;border-radius:50%;animation:tmo-spin .8s linear infinite;';
  loading.appendChild(spinner);
  loading.append('Loading your saved resumes…');
  body.appendChild(loading);

  dialog.appendChild(dialogHeader);
  dialog.appendChild(body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  ensureSpinKeyframes();

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown, true);
    overlay.remove();
    returnFocusTo?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      cleanup();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('button:not([disabled]),select:not([disabled])')
    )
      .filter((element) => element.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown, true);
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });
  close.focus();

  chrome.runtime.sendMessage(
    { type: 'LIST_SAVED_RESUMES' },
    (response: {
      ok?: boolean;
      error?: string;
      resumes?: SavedResumeOption[];
      accountEmail?: string;
    } | undefined) => {
      if (!document.body.contains(overlay)) return;
      body.textContent = '';
      if (chrome.runtime.lastError || !response?.ok) {
        const message = document.createElement('p');
        message.style.cssText = 'margin:0 0 12px;color:#b91c1c;font-size:13px;line-height:1.5;';
        message.textContent = response?.error === 'not_signed_in'
          ? 'Sign in to TrackMyOPT in the extension before generating a resume.'
          : 'We could not load your saved resumes. Please try again.';
        const retry = resumeMiniBtn('<span>Close and try again</span>', true);
        retry.addEventListener('click', cleanup);
        body.appendChild(message);
        body.appendChild(retry);
        return;
      }

      const resumes = response.resumes ?? [];
      if (resumes.length === 0) {
        const message = document.createElement('p');
        message.style.cssText = 'margin:0 0 12px;color:#475569;font-size:13px;line-height:1.5;';
        message.textContent = response.accountEmail
          ? `No saved resumes were found for ${response.accountEmail}. Make sure the extension and TrackMyOPT website use the same account.`
          : 'No saved resumes were found for this extension account. Make sure the extension and TrackMyOPT website use the same account.';
        const refresh = resumeMiniBtn('<span>Check again</span>', false);
        refresh.addEventListener('click', () => {
          cleanup();
          openResumeChooser(card, job);
        });
        const open = resumeMiniBtn('<span>Open resume generator</span>', true);
        open.addEventListener('click', () => {
          window.open(`${WEBSITE_URL}/dashboard/career/resume-generator`, '_blank', 'noopener');
          cleanup();
        });
        body.appendChild(message);
        body.appendChild(refresh);
        refresh.style.marginBottom = '8px';
        body.appendChild(open);
        return;
      }

      const resumeLabel = modalFieldLabel('Saved resume', 'tmo-saved-resume-select');
      const resumeSelect = modalSelect('tmo-saved-resume-select');
      for (const resume of resumes) {
        const option = document.createElement('option');
        option.value = resume.id;
        option.textContent = resume.filename;
        resumeSelect.appendChild(option);
      }

      const templateGroup = document.createElement('div');
      templateGroup.style.cssText = 'margin-top:15px;';
      const templateLabel = modalFieldLabel('Template', 'tmo-template-select');
      const templateSelect = modalSelect('tmo-template-select');
      for (const template of SIDE_PANEL_TEMPLATES) {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} — ${template.hint}`;
        templateSelect.appendChild(option);
      }
      templateGroup.appendChild(templateLabel);
      templateGroup.appendChild(templateSelect);

      const jobContext = document.createElement('div');
      jobContext.style.cssText = 'margin-top:15px;padding:10px 11px;border:1px solid #dbeafe;border-radius:9px;background:#eff6ff;color:#1e3a8a;font-size:12px;line-height:1.45;';
      jobContext.textContent = [job.role_title, job.company_name].filter(Boolean).join(' at ') || 'Current job posting';

      const jdSection = document.createElement('div');
      jdSection.style.cssText = 'margin-top:15px;';
      const jdHeader = document.createElement('div');
      jdHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;';
      const jdLabel = document.createElement('span');
      jdLabel.textContent = 'Job description sent for tailoring';
      jdLabel.style.cssText = 'color:#0f172a;font-size:12.5px;font-weight:750;';
      const jdCount = document.createElement('span');
      jdCount.textContent = `${jobDescription.length.toLocaleString()} characters`;
      jdCount.style.cssText = 'flex-shrink:0;color:#94a3b8;font-size:10.5px;font-weight:600;';
      jdHeader.appendChild(jdLabel);
      jdHeader.appendChild(jdCount);
      const jdPreview = document.createElement('div');
      jdPreview.setAttribute('role', 'textbox');
      jdPreview.setAttribute('aria-readonly', 'true');
      jdPreview.tabIndex = 0;
      jdPreview.textContent = jobDescription || 'No job description was detected on this page.';
      jdPreview.style.cssText = `
        max-height:132px;overflow:auto;padding:10px 11px;border:1px solid #dbe3ee;border-radius:9px;
        background:#f8fafc;color:#475569;font-size:11.5px;line-height:1.48;white-space:pre-wrap;
        overflow-wrap:anywhere;scrollbar-width:thin;
      `;
      jdPreview.addEventListener('focus', () => {
        jdPreview.style.borderColor = '#2563eb';
        jdPreview.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.14)';
      });
      jdPreview.addEventListener('blur', () => {
        jdPreview.style.borderColor = '#dbe3ee';
        jdPreview.style.boxShadow = 'none';
      });
      jdSection.appendChild(jdHeader);
      jdSection.appendChild(jdPreview);

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:9px;margin-top:17px;';
      const cancel = resumeMiniBtn('<span>Cancel</span>', false);
      const generate = resumeMiniBtn(`${icon('sparkles', 15, '#fff')}<span>Generate</span>`, true);
      cancel.addEventListener('click', cleanup);
      generate.addEventListener('click', () => {
        const resumeId = resumeSelect.value;
        const templateId = templateSelect.value;
        if (!resumeId || !templateId) return;
        cleanup();
        openResumePanel(card, job, resumeId, templateId, jobDescription);
      });
      actions.appendChild(cancel);
      actions.appendChild(generate);

      body.appendChild(resumeLabel);
      body.appendChild(resumeSelect);
      body.appendChild(templateGroup);
      body.appendChild(jobContext);
      body.appendChild(jdSection);
      body.appendChild(actions);
      resumeSelect.focus();
    }
  );
}

function renderResumeError(panel: HTMLElement, message: string): void {
  panel.textContent = '';
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:6px;align-items:flex-start;color:#b91c1c;font-size:12px;';
  const ic = document.createElement('span');
  ic.style.cssText = 'display:flex;flex-shrink:0;margin-top:1px;';
  ic.innerHTML = icon('alertTriangle', 14, '#b91c1c');
  const t = document.createElement('span');
  t.textContent = message;
  row.appendChild(ic);
  row.appendChild(t);
  panel.appendChild(row);
}

function renderResumeNeedBase(panel: HTMLElement): void {
  panel.textContent = '';
  const t = document.createElement('div');
  t.style.cssText = 'font-size:12px;color:#334155;margin-bottom:8px;';
  t.textContent = 'Save a base resume on TrackMyOPT first, then generate a tailored one here.';
  const btn = resumeMiniBtn('Open resume generator', true);
  btn.addEventListener('click', () => {
    window.open(`${WEBSITE_URL}/dashboard/career/resume-generator`, '_blank', 'noopener');
  });
  panel.appendChild(t);
  panel.appendChild(btn);
}

function renderResumeResult(
  panel: HTMLElement,
  pdfBase64: string,
  job: JobInfo,
  editorUrl?: string
): void {
  panel.textContent = '';
  const head = document.createElement('div');
  head.style.cssText =
    'display:flex;align-items:center;gap:6px;font-weight:800;color:#065f46;margin-bottom:8px;font-size:12.5px;';
  const hi = document.createElement('span');
  hi.style.cssText = 'display:flex;';
  hi.innerHTML = icon('checkCircle', 15, '#059669');
  const ht = document.createElement('span');
  ht.textContent = 'Resume ready';
  head.appendChild(hi);
  head.appendChild(ht);
  panel.appendChild(head);

  const row = document.createElement('div');
  row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';
  const safeCo = (job.company_name || 'company').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const filename = `TrackMyOPT-resume-${safeCo}.pdf`;
  generatedResumeForCurrentJob = {
    jobFingerprint: jobFingerprint(job),
    pdfBase64,
    filename,
  };

  const card = panel.parentElement;
  const prefillLabel = card?.querySelector<HTMLElement>('.tmo-prefill-button .tmo-action-label');
  if (prefillLabel) prefillLabel.textContent = 'Prefill application + resume';
  const prefillButton = card?.querySelector<HTMLButtonElement>('.tmo-prefill-button');
  if (prefillButton) {
    prefillButton.title = 'Prefill profile fields and attach the custom resume generated for this job';
  }

  const dl = resumeMiniBtn(`${icon('fileText', 14, '#fff')}<span>Download</span>`, true);
  dl.title = 'Download the tailored resume as a PDF';
  dl.addEventListener('click', () => {
    downloadGeneratedPdf(pdfBase64, filename);
  });
  const ed = resumeMiniBtn(`${icon('fileText', 14)}<span>Edit</span>`, false);
  ed.disabled = !editorUrl;
  if (editorUrl) {
    ed.title = 'Open the generated resume in the TrackMyOPT LaTeX editor';
    ed.addEventListener('click', () => window.open(editorUrl, '_blank', 'noopener'));
  } else {
    ed.title = 'The editor handoff could not be prepared. Your PDF is still ready.';
    ed.style.opacity = '0.55';
    ed.style.cursor = 'not-allowed';
  }
  row.appendChild(dl);
  row.appendChild(ed);
  panel.appendChild(row);
}

/** Opens the in-card resume-generation panel: countdown → result / error. */
function openResumePanel(
  card: HTMLElement,
  job: JobInfo,
  resumeId: string,
  templateId: string,
  jobDescription: string,
): void {
  card.querySelector('.' + RESUME_PANEL_CLASS)?.remove();
  ensureSpinKeyframes();

  const panel = document.createElement('div');
  panel.className = RESUME_PANEL_CLASS;
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');
  panel.style.cssText = 'padding:14px;border-top:1px solid #e2e8f0;background:#f8fafc;';
  card.appendChild(panel);

  const line = document.createElement('div');
  line.style.cssText =
    'display:flex;align-items:center;gap:8px;font-weight:700;color:#0f172a;font-size:12px;';
  const spinner = document.createElement('div');
  spinner.style.cssText =
    'width:14px;height:14px;flex-shrink:0;border:2px solid #cbd5e1;border-top-color:#2563eb;border-radius:50%;animation:tmo-spin 0.8s linear infinite;';
  const msg = document.createElement('span');
  msg.textContent = 'Tailoring your resume…';
  const timer = document.createElement('span');
  timer.style.cssText = 'margin-left:auto;color:#94a3b8;font-weight:600;';
  timer.textContent = '0s';
  line.appendChild(spinner);
  line.appendChild(msg);
  line.appendChild(timer);

  const sub = document.createElement('div');
  sub.style.cssText = 'color:#94a3b8;font-size:11px;margin-top:5px;';
  sub.textContent = 'Matching your saved resume to this job — usually 20–40s.';

  panel.appendChild(line);
  panel.appendChild(sub);

  let seconds = 0;
  const interval = window.setInterval(() => {
    seconds += 1;
    timer.textContent = `${seconds}s`;
  }, 1000);

  chrome.runtime.sendMessage(
    {
      type: 'GENERATE_RESUME',
      jobDescription,
      resumeId,
      templateId,
      companyName: job.company_name || '',
      roleTitle: job.role_title || '',
    },
    (
      res: {
        ok?: boolean;
        error?: string;
        detail?: string;
        pdfBase64?: string;
        editorUrl?: string;
      } | undefined
    ) => {
      window.clearInterval(interval);
      if (chrome.runtime.lastError) {
        renderResumeError(panel, 'Something went wrong. Please try again.');
        return;
      }
      if (res?.ok && res.pdfBase64) {
        renderResumeResult(panel, res.pdfBase64, job, res.editorUrl);
        return;
      }
      switch (res?.error) {
        case 'not_signed_in':
          renderResumeError(panel, 'Sign in to TrackMyOPT in the extension first.');
          break;
        case 'no_base_resume':
          renderResumeNeedBase(panel);
          break;
        case 'no_template':
          renderResumeError(panel, 'Select a template and try again.');
          break;
        case 'no_job_description':
          renderResumeError(panel, "Couldn't read this job's description. Open the full posting and try again.");
          break;
        case 'limit':
          renderResumeError(panel, res.detail || 'You have reached your monthly resume limit. Upgrade to generate more.');
          break;
        case 'compile_failed':
          renderResumeError(panel, 'Resume built, but the PDF export failed. Please try again.');
          break;
        default:
          renderResumeError(panel, "Couldn't generate the resume. Please try again.");
      }
    }
  );
}

/** Segmented-control option button for the Settings panel (Expanded / Minimized). */
function viewOptionBtn(label: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText = viewOptionStyle(false);
  return b;
}

function viewOptionStyle(selected: boolean): string {
  return [
    'flex:1',
    'padding:8px 0',
    'border-radius:8px',
    'font:inherit',
    'font-size:12px',
    'font-weight:700',
    'cursor:pointer',
    selected ? 'background:#2563eb' : 'background:#fff',
    selected ? 'color:#fff' : 'color:#0f172a',
    selected ? 'border:1px solid #2563eb' : 'border:1px solid #e2e8f0',
  ].join(';');
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

async function injectOrRefreshButton() {
  if (!document.body) return;
  if (!extAlive()) {
    teardownWidgetRuntime();
    return;
  }

  const host = window.location.hostname;
  if (host.includes('linkedin.com') && !isLinkedInJobSurface()) {
    document.getElementById(WIDGET_ROOT_ID)?.remove();
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

  // Hide scopes: this-visit (session) / this-site / all-sites (persisted).
  if (await isWidgetSuppressed()) {
    existing?.remove();
    return;
  }

  const defaultView = await getDefaultViewPref();

  const currentWidget = document.getElementById(WIDGET_ROOT_ID);
  if (currentWidget) {
    if (!shouldRefreshWidget(currentWidget, job)) return;
    currentWidget.remove();
  }

  const widget = createJobTrackerWidget(job, defaultView);

  // A maximum z-index alone cannot beat another extension using the same value
  // from a later stacking context. A manual popover enters Chrome's top layer,
  // keeping TrackMyOPT above ordinary page and extension overlays. Older
  // browsers retain the maximum-z-index fallback.
  widget.setAttribute('popover', 'manual');
  document.body.appendChild(widget);
  try {
    widget.showPopover?.();
  } catch {
    // If the top-layer API is unavailable or rejected, avoid the popover's
    // hidden default state and continue with the z-index fallback.
    widget.removeAttribute('popover');
  }
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

/**
 * False once the extension is reloaded/updated while THIS old content script is
 * still running on the page — `chrome.runtime.id` becomes undefined and any
 * chrome.* call throws "Extension context invalidated". We use this to bail and
 * tear down instead of spamming the console.
 */
function extAlive(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

/** Stop every timer/observer and remove the widget (used when the context dies). */
function teardownWidgetRuntime() {
  if (_spaObserver) {
    _spaObserver.disconnect();
    _spaObserver = null;
  }
  if (_earlyRetryId !== null) {
    window.clearInterval(_earlyRetryId);
    _earlyRetryId = null;
  }
  if (injectDebounceTimer) {
    clearTimeout(injectDebounceTimer);
    injectDebounceTimer = null;
  }
  if (successCheckTimeout) {
    clearTimeout(successCheckTimeout);
    successCheckTimeout = null;
  }
  document.getElementById(WIDGET_ROOT_ID)?.remove();
}

function setupSpaObservers() {
  if (!document.body) return;
  // Disconnect any previous observer before creating a new one.
  if (_spaObserver) {
    _spaObserver.disconnect();
    _spaObserver = null;
  }
  const observer = new MutationObserver(() => {
    if (!extAlive()) {
      teardownWidgetRuntime();
      return;
    }
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
    if (!extAlive()) {
      teardownWidgetRuntime();
      return;
    }
    n += 1;
    if (n > max) {
      window.clearInterval(id);
      if (_earlyRetryId === id) _earlyRetryId = null;
      return;
    }
    // Keep sampling briefly even after the initial widget appears: ATS pages
    // often publish location, compensation, and logos a few seconds later.
    // injectOrRefreshButton only replaces the widget when data is enriched.
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

// Cross-origin ATS frames receive prefill through the background relay. They
// never render their own side panel; only the top-level document owns the UI.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'RUN_PREFILL_IN_CHILD_FRAME' || window.top === window.self) return false;
  void runPrefill({
    resume: message.resume as GeneratedResumeAttachment | undefined,
    quietIfNoForm: true,
  })
    .then(() => sendResponse({ ok: true }))
    .catch(() => sendResponse({ ok: false }));
  return true;
});

// Guard: only run on actual career / job pages.
// isCareerPage() covers blocklist → known boards → ATS → career subdomains →
// path patterns → page title / meta → JSON-LD → application forms.
if (window.top !== window.self) {
  // Child frame: listener-only mode.
} else if (!isHttpDocument()) {
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
