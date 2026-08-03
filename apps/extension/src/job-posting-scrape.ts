/**
 * Reading a job posting off the page: JSON-LD, meta tags, DOM fallbacks, and
 * the per-board adapters (LinkedIn, Indeed, iCIMS). Pure page reads — no widget
 * state and no messaging.
 */

import {
  isKnownJobBoardOrAts,
  hasJobPostingEvidence,
  CAREER_PATH_RE,
} from './career-sites';

export interface JobInfo {
  company_name: string;
  role_title: string;
  job_url: string;
  location?: string;
  /** Normalized display-only compensation from JobPosting JSON-LD or visible
   * job-page text. Omitted when the source page does not publish compensation. */
  salary_text?: string;
  /** Plain-text posting snapshot captured before the user leaves the job page. */
  job_description?: string;
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

export function isHttpDocument(): boolean {
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

export function shouldUseFullJobAssistMode(): boolean {
  if (isKnownJobBoardOrAts()) return true;
  if (hasJobPostingJsonLdSnippet()) return true;
  const pathAndSearch = location.pathname + (location.search || '');
  if (CAREER_PATH_RE.test(pathAndSearch)) return true;
  return false;
}

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

export function isLinkedInJobSurface(): boolean {
  const path = window.location.pathname;
  const q = window.location.search || '';
  if (/^\/jobs(\/|$)/i.test(path)) return true;
  if (/[?&]currentJobId=\d+/i.test(q)) return true;
  if (/^\/job\//i.test(path)) return true;
  return false;
}

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

export function getJobInfo(): JobInfo | null {
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
  const structuredJob = getJsonLdJobPosting();
  // The title/meta and <h1> parsers accept almost anything, and CAREER_PATH_RE
  // matched us here from a path alone — /apply, /application, /join-us. On an
  // unknown host with no JobPosting data that combination also describes
  // university admissions and credit-card or loan applications, where offering
  // to prefill the applicant's personal details would be plainly wrong. Require
  // the page's own copy to corroborate that it is a job posting first.
  const weakParsersAllowed =
    isKnownJobBoardOrAts() ||
    hasJobPostingEvidence(document.body?.innerText || '');
  const job =
    structuredJob ||
    (weakParsersAllowed ? getMetaAndTitleJob() || getDomFallbackJob() : null);
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
