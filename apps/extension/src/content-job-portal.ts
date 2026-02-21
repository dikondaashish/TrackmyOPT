/**
 * Content script for job / career pages (any company career site, LinkedIn, Indeed, etc.)
 * Parses job listing using JSON-LD, meta tags, and DOM. Shows "Add to TrackMyOPT" when job detected.
 * Auto-adds job to TrackMyOPT when user sees "application submitted" / "congratulations" success messages.
 */

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
      const items: unknown[] = Array.isArray(data) ? data : [data];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        const obj = item as Record<string, unknown>;
        const type = (obj['@type'] as string) || (Array.isArray(obj['@type']) ? (obj['@type'] as string[])[0] : '');
        if (type !== 'JobPosting') continue;
        const title = (obj.title as string)?.trim();
        const hiringOrg = obj.hiringOrganization as Record<string, unknown> | undefined;
        const company = (hiringOrg?.name as string)?.trim();
        const jobLoc = obj.jobLocation as Record<string, unknown> | Record<string, unknown>[] | undefined;
        let location = '';
        if (Array.isArray(jobLoc) && jobLoc.length > 0) {
          const first = jobLoc[0] as Record<string, unknown>;
          location = (first.address as Record<string, unknown>)?.addressLocality as string || (first.name as string) || '';
        } else if (jobLoc && typeof jobLoc === 'object' && !Array.isArray(jobLoc)) {
          const addr = (jobLoc as Record<string, unknown>).address as Record<string, unknown> | undefined;
          location = (addr?.addressLocality as string) || ((jobLoc as Record<string, unknown>).name as string) || '';
        }
        if (title && company) {
          return {
            company_name: company,
            role_title: title,
            job_url: window.location.href,
            location: location?.trim() || undefined,
          };
        }
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
  const h1 = document.querySelector('h1');
  const role_title = h1?.textContent?.trim();
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

function getLinkedInJobInfo(): JobInfo | null {
  const url = window.location.href;
  if (!url.includes('linkedin.com/jobs')) return null;
  const titleEl =
    document.querySelector('.job-details-jobs-unified-top-card__job-title') ||
    document.querySelector('h1.t-24') ||
    document.querySelector('h1[class*="job-title"]') ||
    document.querySelector('.jobs-unified-top-card__job-title');
  const companyEl =
    document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
    document.querySelector('a[data-tracking-control-name="public_jobs_topcard-org-name"]') ||
    document.querySelector('.jobs-unified-top-card__company-name') ||
    document.querySelector('a[href*="/company/"]');
  const locationEl =
    document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
    document.querySelector('.jobs-unified-top-card__bullet') ||
    document.querySelector('[class*="bullet"]');
  const role_title = titleEl?.textContent?.trim();
  const company_name = companyEl?.textContent?.trim();
  const location = locationEl?.textContent?.trim();
  if (!role_title || !company_name) return null;
  return { company_name, role_title, job_url: url, location: location || undefined };
}

function getIndeedJobInfo(): JobInfo | null {
  const url = window.location.href;
  if (!url.includes('indeed.com') || (!url.includes('viewjob') && !url.includes('jk='))) return null;
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

function injectButton() {
  const job = getJobInfo();
  if (job) saveJobContext(job);
  if (document.getElementById('tmo-add-to-tracker-btn')) return;
  if (!job) return;
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

function tryInject() {
  if (document.body) {
    injectButton();
  } else {
    setTimeout(tryInject, 500);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInject);
} else {
  tryInject();
}

let lastUrl = location.href;
let successCheckTimeout: ReturnType<typeof setTimeout> | null = null;
const SUCCESS_CHECK_DEBOUNCE_MS = 800;

function runSuccessCheckDebounced() {
  if (successCheckTimeout) clearTimeout(successCheckTimeout);
  successCheckTimeout = setTimeout(() => {
    successCheckTimeout = null;
    tryAutoAddOnSuccess();
  }, SUCCESS_CHECK_DEBOUNCE_MS);
}

function setupUrlObserver() {
  if (!document.body) return;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      const existing = document.getElementById('tmo-add-to-tracker-btn');
      if (existing) existing.remove();
      setTimeout(tryInject, 1000);
      runSuccessCheckDebounced();
    } else {
      runSuccessCheckDebounced();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function startSuccessDetection() {
  tryAutoAddOnSuccess();
  setTimeout(tryAutoAddOnSuccess, 2000);
  setTimeout(tryAutoAddOnSuccess, 5000);
  setTimeout(tryAutoAddOnSuccess, 8000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupUrlObserver();
    startSuccessDetection();
  });
} else {
  setupUrlObserver();
  startSuccessDetection();
}
