// Official sources the policy-news blog watches: the Federal Register API,
// the USCIS alerts RSS feed and the Study in the States (SEVP) RSS feed.
// Parsers are pure so they can be tested against saved responses.

export type PolicyNewsSource = 'federal_register' | 'uscis_alerts' | 'study_in_the_states';

export type PolicyNewsCandidate = {
  source: PolicyNewsSource;
  externalId: string;
  title: string;
  url: string;
  documentType: string | null;
  publishedAt: string | null;
  summary: string;
  /** Plain-text full document, when the source offers one. */
  fullTextUrl: string | null;
};

export const SOURCE_PUBLISHERS: Record<PolicyNewsSource, string> = {
  federal_register: 'Federal Register',
  uscis_alerts: 'USCIS',
  study_in_the_states: 'Study in the States (DHS SEVP)',
};

export const LOOKBACK_DAYS = 7;
const FETCH_TIMEOUT_MS = 20_000;
const USER_AGENT = 'TrackMyOPT policy-news monitor (+https://www.trackmyopt.com)';

const FEDERAL_REGISTER_TERM =
  '"practical training" | "F-1 students" | "Student and Exchange Visitor"';
const FEDERAL_REGISTER_AGENCIES = [
  'homeland-security-department',
  'u-s-citizenship-and-immigration-services',
  'u-s-immigration-and-customs-enforcement',
  'labor-department',
  'state-department',
];
const USCIS_ALERTS_RSS = 'https://www.uscis.gov/news/rss-feed/22984';
const STUDY_IN_THE_STATES_RSS = 'https://studyinthestates.dhs.gov/rss.xml';

/** RSS items are kept only when they mention an OPT-related term. */
const OPT_ACRONYMS = /\b(OPT|STEM|F-1|SEVP|SEVIS|I-765|I-983|I-20|EAD)\b/;
const OPT_PHRASES =
  /\b(practical training|international students?|employment authorization|cap-gap|duration of status|admission period)\b/i;

export function isOptRelated(text: string): boolean {
  return OPT_ACRONYMS.test(text) || OPT_PHRASES.test(text);
}

export function federalRegisterQueryUrl(now: Date): string {
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000).toISOString().slice(0, 10);
  const params = new URLSearchParams({ per_page: '50', order: 'newest' });
  params.append('conditions[term]', FEDERAL_REGISTER_TERM);
  params.append('conditions[publication_date][gte]', since);
  for (const agency of FEDERAL_REGISTER_AGENCIES) params.append('conditions[agencies][]', agency);
  for (const field of ['title', 'type', 'document_number', 'publication_date', 'html_url', 'raw_text_url', 'abstract', 'effective_on', 'comments_close_on']) {
    params.append('fields[]', field);
  }
  return `https://www.federalregister.gov/api/v1/documents.json?${params}`;
}

type FederalRegisterDocument = {
  title?: unknown;
  type?: unknown;
  document_number?: unknown;
  publication_date?: unknown;
  html_url?: unknown;
  raw_text_url?: unknown;
  abstract?: unknown;
  effective_on?: unknown;
  comments_close_on?: unknown;
};

const str = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export function parseFederalRegister(body: unknown): PolicyNewsCandidate[] {
  const results = (body as { results?: unknown })?.results;
  if (!Array.isArray(results)) return [];
  return results.flatMap((doc: FederalRegisterDocument) => {
    const id = str(doc.document_number);
    const title = str(doc.title);
    const url = str(doc.html_url);
    if (!id || !title || !url?.startsWith('https://')) return [];
    const dates = [
      str(doc.effective_on) && `Effective date: ${str(doc.effective_on)}.`,
      str(doc.comments_close_on) && `Comments close: ${str(doc.comments_close_on)}.`,
    ].filter(Boolean);
    const publication = str(doc.publication_date);
    const rawText = str(doc.raw_text_url);
    return [{
      source: 'federal_register' as const,
      externalId: id,
      title,
      url,
      documentType: str(doc.type),
      publishedAt: publication ? `${publication}T00:00:00.000Z` : null,
      summary: [str(doc.abstract) ?? '', ...dates].join(' ').trim(),
      fullTextUrl: rawText?.startsWith('https://') ? rawText : null,
    }];
  });
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—',
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const point = code[1]?.toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Readable text from an HTML fragment or page. */
export function htmlToText(html: string): string {
  const withoutBlocks = html
    .replace(/<(script|style|noscript|svg|head|nav|header|footer)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(withoutBlocks)
    .replace(/[ \t\f\v ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function rssTag(item: string, tag: string): string | null {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(item);
  if (!match) return null;
  const inner = match[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1');
  return decodeEntities(inner).trim() || null;
}

/** USCIS writes two-digit years ("Fri, 09 Oct 26 13:08:41 -0400"). */
function parseRssDate(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace(/^(\w{3}, \d{1,2} \w{3} )(\d{2})( )/, '$120$2$3');
  const time = Date.parse(normalized);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export function parseRss(xml: string, source: Exclude<PolicyNewsSource, 'federal_register'>): PolicyNewsCandidate[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return items.flatMap((item) => {
    const title = rssTag(item, 'title');
    const url = rssTag(item, 'link');
    if (!title || !url?.startsWith('https://')) return [];
    const description = htmlToText(rssTag(item, 'description') ?? '');
    return [{
      source,
      externalId: url,
      title,
      url,
      documentType: null,
      publishedAt: parseRssDate(rssTag(item, 'pubDate')),
      summary: description,
      fullTextUrl: null,
    }];
  });
}

export class SourceFetchError extends Error {
  constructor(readonly source: PolicyNewsSource, readonly status: number | null) {
    super(`Policy news source ${source} failed (${status ?? 'network'})`);
    this.name = 'SourceFetchError';
  }
}

export async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: 'no-store',
  });
  return { ok: response.ok, status: response.status, text: response.ok ? await response.text() : '' };
}

async function fetchSource(source: PolicyNewsSource, now: Date): Promise<PolicyNewsCandidate[]> {
  const url =
    source === 'federal_register' ? federalRegisterQueryUrl(now)
    : source === 'uscis_alerts' ? USCIS_ALERTS_RSS
    : STUDY_IN_THE_STATES_RSS;
  let response: Awaited<ReturnType<typeof fetchText>>;
  try {
    response = await fetchText(url);
  } catch {
    throw new SourceFetchError(source, null);
  }
  if (!response.ok) throw new SourceFetchError(source, response.status);

  if (source === 'federal_register') {
    try {
      // The API query already filters by agency and term.
      return parseFederalRegister(JSON.parse(response.text));
    } catch {
      throw new SourceFetchError(source, response.status);
    }
  }
  const cutoff = now.getTime() - LOOKBACK_DAYS * 86_400_000;
  return parseRss(response.text, source).filter(
    (item) =>
      item.publishedAt !== null &&
      Date.parse(item.publishedAt) >= cutoff &&
      isOptRelated(`${item.title} ${item.summary}`)
  );
}

/** Recent OPT-related notices from every source; one failing source does not stop the others. */
export async function collectCandidates(now: Date): Promise<{
  candidates: PolicyNewsCandidate[];
  failures: SourceFetchError[];
}> {
  const sources: PolicyNewsSource[] = ['federal_register', 'uscis_alerts', 'study_in_the_states'];
  const settled = await Promise.allSettled(sources.map((source) => fetchSource(source, now)));
  const candidates: PolicyNewsCandidate[] = [];
  const failures: SourceFetchError[] = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') candidates.push(...result.value);
    else failures.push(result.reason instanceof SourceFetchError ? result.reason : new SourceFetchError(sources[index], null));
  });
  return { candidates, failures };
}

const MAX_SOURCE_TEXT_CHARS = 60_000;

/** The document text the article is written from; falls back to the feed summary. */
export async function loadSourceText(candidate: PolicyNewsCandidate): Promise<string> {
  const target = candidate.fullTextUrl ?? candidate.url;
  try {
    const response = await fetchText(target);
    if (response.ok) {
      // Federal Register "raw text" is also served as HTML (a <pre> block).
      const text = htmlToText(response.text);
      if (text.length > candidate.summary.length) return text.slice(0, MAX_SOURCE_TEXT_CHARS);
    }
  } catch {
    // The summary below is still a usable, official description.
  }
  return candidate.summary;
}
