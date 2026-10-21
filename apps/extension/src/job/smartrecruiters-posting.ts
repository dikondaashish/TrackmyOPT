import { smartRecruitersPostingRef } from '../job-portal/ats-job-identity';
import { htmlToPlainText } from './job-description';

/**
 * SmartRecruiters' public Posting API links the two pages of one job: the job
 * page (/{Company}/{postingId}-{slug}) and the one-click apply page that
 * "I'm interested" opens (/oneclick-ui/company/{Company}/publication/{uuid}).
 * The apply page shows no description, and its URL shares no id with the job
 * page, so both the description and the publication id come from here.
 *
 * The API is public, read-only and sends `Access-Control-Allow-Origin: *`, so
 * it needs no extension host permission. Only posting ids leave the browser.
 */

export interface SmartRecruitersPosting {
  /** Publication UUID, the id in the one-click apply URL. */
  publicationId: string;
  /** Plain-text job ad: company, description, qualifications, more info. */
  description: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SECTION_ORDER = ['companyDescription', 'jobDescription', 'qualifications', 'additionalInformation'];

export function smartRecruitersPostingApiUrl(pageUrl: string): string | null {
  const ref = smartRecruitersPostingRef(pageUrl);
  if (!ref) return null;
  return `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(ref.company)}/postings/${encodeURIComponent(ref.postingId)}`;
}

export function parseSmartRecruitersPosting(payload: unknown): SmartRecruitersPosting | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as { uuid?: unknown; name?: unknown; jobAd?: { sections?: Record<string, { title?: unknown; text?: unknown }> } };
  if (typeof root.uuid !== 'string' || !UUID_RE.test(root.uuid)) return null;
  const sections = root.jobAd?.sections ?? {};
  const body = SECTION_ORDER
    .map((key) => sections[key])
    .filter((section) => section && typeof section.text === 'string' && section.text.trim())
    .map((section) => [typeof section!.title === 'string' ? section!.title : '', htmlToPlainText(String(section!.text))]
      .filter(Boolean)
      .join('\n'))
    .join('\n\n');
  const title = typeof root.name === 'string' ? root.name : '';
  return {
    publicationId: root.uuid.toLowerCase(),
    description: [title, body].filter(Boolean).join('\n\n').trim(),
  };
}

/** The posting behind a SmartRecruiters job or one-click apply URL, or null. */
export async function fetchSmartRecruitersPosting(pageUrl: string, timeoutMs = 8_000): Promise<SmartRecruitersPosting | null> {
  const apiUrl = smartRecruitersPostingApiUrl(pageUrl);
  if (!apiUrl) return null;
  try {
    const response = await fetch(apiUrl, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return null;
    return parseSmartRecruitersPosting(await response.json());
  } catch {
    return null;
  }
}
