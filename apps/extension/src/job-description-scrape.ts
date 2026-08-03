/**
 * Getting the job description text: scrape it from the current document, fall
 * back to fetching the listing page, and cache the result per URL for the
 * session.
 */

import {
  buildWorkdayCxsJobUrl,
  chooseJobDescriptionCandidate,
  deriveJobListingUrl,
  extractWorkdayJobDescriptionFromCxs,
  jobDescriptionCacheKey,
  looksLikeRealJobPostingText,
  shouldFetchListingJobDescription,
  type JobDescriptionCandidate,
} from './job-description';
import {
  WIDGET_ROOT_ID,
} from './widget-dom-ids';

function scrapeJobDescriptionFromDocument(
  doc: Document,
  source: JobDescriptionCandidate['source'] = 'specific',
): JobDescriptionCandidate[] {
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
  const root = doc.documentElement;
  if (!root) return candidates;

  if (source !== 'listing') {
    for (const frame of Array.from(doc.querySelectorAll<HTMLIFrameElement>('iframe'))) {
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
  }

  for (const selector of selectors) {
    for (const element of Array.from(doc.querySelectorAll<HTMLElement>(selector))) {
      if (element.closest(`#${WIDGET_ROOT_ID}, #tmo-resume-chooser, #tmo-application-status-dialog`)) continue;
      if (element.innerText) candidates.push({ source, text: element.innerText });
    }
  }

  const body = doc.body;
  if (body) {
    const outerText = Array.from(body.children || [])
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
    if (outerText) {
      candidates.push({
        source: source === 'listing' ? 'listing' : 'outer',
        text: outerText,
      });
    }
  }

  return candidates;
}

export function scrapeJobDescription(): string {
  return chooseJobDescriptionCandidate(scrapeJobDescriptionFromDocument(document));
}

const listingJobDescriptionCache = new Map<string, string>();

const JD_SESSION_CACHE_KEY = 'tmo_jd_listing_cache_v1';

function readSessionJdCache(key: string): string {
  try {
    const raw = sessionStorage.getItem(JD_SESSION_CACHE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as Record<string, string>;
    const value = parsed[key];
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
}

function writeSessionJdCache(key: string, text: string): void {
  if (!text || text.length < 200) return;
  try {
    const raw = sessionStorage.getItem(JD_SESSION_CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    parsed[key] = text.slice(0, 15_000);
    // Cap entries so sessionStorage stays small across a long apply binge.
    const keys = Object.keys(parsed);
    if (keys.length > 20) {
      for (const stale of keys.slice(0, keys.length - 20)) delete parsed[stale];
    }
    sessionStorage.setItem(JD_SESSION_CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // Best-effort only.
  }
}

function rememberJobDescription(pageUrl: string, text: string): void {
  if (!looksLikeRealJobPostingText(text)) return;
  const key = jobDescriptionCacheKey(pageUrl);
  listingJobDescriptionCache.set(key, text);
  writeSessionJdCache(key, text);
}

async function fetchWorkdayCxsJobDescription(pageUrl: string): Promise<string> {
  const cxsUrl = buildWorkdayCxsJobUrl(pageUrl);
  if (!cxsUrl) return '';
  try {
    const response = await fetch(cxsUrl, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return '';
    const payload = (await response.json().catch(() => null)) as unknown;
    return extractWorkdayJobDescriptionFromCxs(payload);
  } catch {
    return '';
  }
}

async function fetchListingJobDescription(listingUrl: string): Promise<string> {
  const cached = listingJobDescriptionCache.get(listingUrl);
  if (cached) return cached;
  const sessionCached = readSessionJdCache(listingUrl);
  if (sessionCached) {
    listingJobDescriptionCache.set(listingUrl, sessionCached);
    return sessionCached;
  }
  try {
    const response = await fetch(listingUrl, {
      credentials: 'include',
      headers: { Accept: 'text/html' },
    });
    if (!response.ok) return '';
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = chooseJobDescriptionCandidate(
      scrapeJobDescriptionFromDocument(doc, 'listing'),
    );
    if (text) {
      listingJobDescriptionCache.set(listingUrl, text);
      writeSessionJdCache(listingUrl, text);
    }
    return text;
  } catch {
    return '';
  }
}

export async function resolveJobDescription(pageUrl: string = window.location.href): Promise<string> {
  const scraped = scrapeJobDescription();
  const cacheKey = jobDescriptionCacheKey(pageUrl);
  rememberJobDescription(pageUrl, scraped);

  const cached =
    listingJobDescriptionCache.get(cacheKey) || readSessionJdCache(cacheKey);
  if (cached && looksLikeRealJobPostingText(cached)) {
    if (!looksLikeRealJobPostingText(scraped) || cached.length > scraped.length) {
      return cached;
    }
  }

  if (!shouldFetchListingJobDescription(pageUrl, scraped)) {
    return scraped;
  }

  const workdayText = await fetchWorkdayCxsJobDescription(pageUrl);
  if (workdayText && looksLikeRealJobPostingText(workdayText)) {
    rememberJobDescription(pageUrl, workdayText);
    return workdayText.slice(0, 15_000);
  }

  const listingUrl = deriveJobListingUrl(pageUrl) || cacheKey;
  const listingText = listingUrl
    ? await fetchListingJobDescription(listingUrl)
    : '';
  if (listingText) {
    rememberJobDescription(pageUrl, listingText);
  }

  return (
    chooseJobDescriptionCandidate([
      ...(workdayText ? [{ source: 'listing' as const, text: workdayText }] : []),
      ...(listingText ? [{ source: 'listing' as const, text: listingText }] : []),
      { source: 'outer', text: scraped },
    ]) || scraped
  );
}
