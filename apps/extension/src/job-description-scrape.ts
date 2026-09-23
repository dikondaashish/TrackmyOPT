/** Verified, job-scoped descriptions shared by tailoring, scoring and drafts. */
import {
  buildWorkdayCxsJobUrl, chooseJobDescriptionCandidate, deriveJobListingUrl,
  extractWorkdayJobDescriptionFromCxs, htmlToPlainText, jobDescriptionCacheKey,
  looksLikeRealJobPostingText, type JobDescriptionCandidate,
} from './job-description';
import { WIDGET_ROOT_ID } from './widget-dom-ids';

export interface JobDescriptionResolution {
  text: string;
  source: 'current_page' | 'saved' | 'original_listing' | 'unavailable';
  sourceUrl: string;
}
const EXCLUDE = `script,style,noscript,template,nav,footer,form,input,textarea,select,[role="dialog"],[role="navigation"],[hidden],[aria-hidden="true"],#form,#${WIDGET_ROOT_ID},#tmo-resume-chooser,#tmo-application-status-dialog,#tmo-easy-apply-toast,#jobright-helper-root,[id*="simplify" i],[id*="tsenta" i]`;

/** Clean a clone; never touch the application or read entered values.
 * textContent on a cleaned inert tree works when DOMParser has no innerText. */
function cleanText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll(EXCLUDE).forEach(node => node.remove());
  return htmlToPlainText(clone.innerHTML);
}

function structuredCandidates(doc: Document, pageUrl: string): JobDescriptionCandidate[] {
  const postings: Record<string, unknown>[] = [];
  const visit = (value: unknown, depth = 0): void => {
    if (!value || typeof value !== 'object' || depth > 8) return;
    if (Array.isArray(value)) { value.forEach(item => visit(item, depth + 1)); return; }
    const item = value as Record<string, unknown>;
    if ([item['@type']].flat().includes('JobPosting')) postings.push(item);
    if (item['@graph']) visit(item['@graph'], depth + 1);
    if (item.mainEntity) visit(item.mainEntity, depth + 1);
  };
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try { visit(JSON.parse(script.textContent || '')); } catch { /* invalid metadata */ }
  });
  return postings.flatMap(item => {
    try {
      const url = new URL(pageUrl);
      const identifier = item.identifier;
      const id = typeof identifier === 'string' ? identifier : identifier && typeof identifier === 'object' ? String((identifier as Record<string, unknown>).value || '') : '';
      const ashbyId = url.hostname === 'jobs.ashbyhq.com' ? url.pathname.split('/').filter(Boolean)[1] : '';
      const declaredUrl = typeof item.url === 'string' ? new URL(item.url, pageUrl).href : '';
      if (declaredUrl && jobDescriptionCacheKey(declaredUrl) !== jobDescriptionCacheKey(pageUrl)) return [];
      if (ashbyId && id && id !== ashbyId) return [];
      // Multiple search-result jobs must never become one guessed posting.
      if (postings.length > 1 && !declaredUrl && !(ashbyId && id === ashbyId)) return [];
      if (typeof item.description !== 'string') return [];
      return [{source:'structured' as const, text:htmlToPlainText(item.description)}];
    } catch { return []; }
  });
}

function scrapeDocument(doc: Document, pageUrl: string, listing = false): string {
  const candidates: JobDescriptionCandidate[] = structuredCandidates(doc, pageUrl);
  const selectors = '[data-testid*="jobDescription" i],[class*="job-description" i],[class*="jobDescription" i],[id*="job-description" i],[class*="description" i],main,article';
  doc.querySelectorAll(selectors).forEach(element => {
    if (!element.closest(EXCLUDE)) candidates.push({source:listing ? 'listing' : 'specific',text:cleanText(element)});
  });
  if (doc.body) candidates.push({source:'outer',text:cleanText(doc.body)});
  if (!listing) doc.querySelectorAll('iframe').forEach(frame => {
    try {
      if (frame.contentDocument?.body && frame.contentWindow?.location.origin === new URL(pageUrl).origin) {
        candidates.push({source:'frame',text:scrapeDocument(frame.contentDocument, pageUrl, true)});
      }
    } catch { /* cross-origin frames stay isolated */ }
  });
  return chooseJobDescriptionCandidate(candidates);
}

export function scrapeJobDescription(): string {
  return scrapeDocument(document, window.location.href);
}

// Extension-owned storage survives refreshes/new tabs. Ignore the old page-owned
// session cache, which may contain CSS/form text.
const PREFIX = 'tmo_verified_jd_v2:';
const MAX_AGE = 24 * 60 * 60 * 1000;
type CacheEntry = { text: string; sourceUrl: string; savedAt: number };
const memory = new Map<string, CacheEntry>();
function validEntry(value: unknown, key: string): value is CacheEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as CacheEntry;
  return typeof e.savedAt === 'number' && e.savedAt <= Date.now() && Date.now() - e.savedAt < MAX_AGE
    && typeof e.sourceUrl === 'string' && jobDescriptionCacheKey(e.sourceUrl) === key
    && typeof e.text === 'string' && looksLikeRealJobPostingText(e.text);
}
async function cachedDescription(key: string): Promise<CacheEntry | undefined> {
  const entry = memory.get(key);
  if (validEntry(entry, key)) return entry;
  memory.delete(key);
  try {
    const storageKey = PREFIX + key;
    const stored = (await chrome.storage.local.get(storageKey))[storageKey];
    if (validEntry(stored, key)) { memory.set(key, stored); return stored; }
    if (stored) await chrome.storage.local.remove(storageKey);
  } catch { /* storage unavailable */ }
  return undefined;
}
async function remember(pageUrl: string, text: string, sourceUrl: string): Promise<void> {
  const key = jobDescriptionCacheKey(pageUrl);
  if (!key || !looksLikeRealJobPostingText(text) || jobDescriptionCacheKey(sourceUrl) !== key) return;
  const previous = memory.get(key);
  if (validEntry(previous, key) && previous.text === text.slice(0,15_000)) return;
  const entry = {text:text.slice(0,15_000),sourceUrl,savedAt:Date.now()};
  memory.set(key,entry);
  while (memory.size > 50) memory.delete(memory.keys().next().value!);
  try {
    await chrome.storage.local.set({[PREFIX + key]:entry});
    const all = await chrome.storage.local.get(null);
    const entries = Object.entries(all).filter(([k])=>k.startsWith(PREFIX));
    const expired = entries.filter(([k,v])=>!validEntry(v,k.slice(PREFIX.length))).map(([k])=>k);
    const excess = entries.filter(([k])=>!expired.includes(k)).sort((a,b)=>(b[1] as CacheEntry).savedAt-(a[1] as CacheEntry).savedAt).slice(50).map(([k])=>k);
    if (expired.length || excess.length) await chrome.storage.local.remove([...expired,...excess]);
  } catch { /* memory cache still works */ }
}

/** Capture overview content before Apply, without requests or form values. */
export function captureJobDescription(): void {
  const pageUrl = window.location.href;
  const text = scrapeJobDescription();
  if (text) void remember(pageUrl,text,jobDescriptionCacheKey(pageUrl));
}

async function retrieve(pageUrl: string): Promise<JobDescriptionResolution> {
  const sourceUrl = jobDescriptionCacheKey(pageUrl);
  const missing: JobDescriptionResolution = {text:'',source:'unavailable',sourceUrl};
  if (!sourceUrl) return missing;
  const current = scrapeJobDescription();
  if (current) {
    await remember(pageUrl,current,sourceUrl);
    return {text:current,source:'current_page',sourceUrl};
  }
  const cached = await cachedDescription(sourceUrl);
  if (cached) return {text:cached.text,source:'saved',sourceUrl:cached.sourceUrl};

  const cxsUrl = buildWorkdayCxsJobUrl(pageUrl);
  if (cxsUrl) try {
    const res = await fetch(cxsUrl,{credentials:'omit',headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});
    if (res.ok) {
      const data = await res.json();
      const text = extractWorkdayJobDescriptionFromCxs(data);
      if (looksLikeRealJobPostingText(text)) {
        await remember(pageUrl,text,sourceUrl);
        return {text:text.slice(0,15_000),source:'original_listing',sourceUrl};
      }
    }
  } catch { /* try public listing */ }

  const listingUrl = deriveJobListingUrl(pageUrl) || sourceUrl;
  try {
    const res = await fetch(listingUrl,{credentials:'omit',headers:{Accept:'text/html'},signal:AbortSignal.timeout(8000)});
    // Reject login redirects, other postings and generic careers indexes.
    if (!res.ok || (res.url && jobDescriptionCacheKey(res.url) !== sourceUrl)) return missing;
    const html = await res.text();
    if (html.length > 2_000_000) return missing;
    const doc = new DOMParser().parseFromString(html,'text/html');
    const text = scrapeDocument(doc,listingUrl,true);
    if (text) {
      await remember(pageUrl,text,sourceUrl);
      return {text,source:'original_listing',sourceUrl};
    }
  } catch { /* never return application form text as a fallback */ }
  return missing;
}
const pending = new Map<string,Promise<JobDescriptionResolution>>();
export async function resolveJobDescriptionDetails(pageUrl = window.location.href): Promise<JobDescriptionResolution> {
  const existing = pending.get(pageUrl);
  if (existing) return existing;
  const task = retrieve(pageUrl).then(result => window.location.href === pageUrl ? result : {text:'',source:'unavailable' as const,sourceUrl:''}).finally(()=>pending.delete(pageUrl));
  pending.set(pageUrl,task);
  return task;
}
export async function resolveJobDescription(pageUrl = window.location.href): Promise<string> {
  return (await resolveJobDescriptionDetails(pageUrl)).text;
}
