import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  collectCandidates,
  federalRegisterQueryUrl,
  htmlToText,
  isOptRelated,
  parseFederalRegister,
  parseRss,
} from './sources';

describe('parseFederalRegister', () => {
  it('maps documents and appends stated dates to the summary', () => {
    const [item] = parseFederalRegister({
      results: [{
        title: 'Optional Practical Training Fees',
        type: 'Proposed Rule',
        document_number: '2026-20660',
        publication_date: '2026-10-08',
        html_url: 'https://www.federalregister.gov/documents/2026/10/08/2026-20660/optional-practical-training-fees',
        raw_text_url: 'https://www.federalregister.gov/documents/full_text/text/2026/10/08/2026-20660.txt',
        abstract: 'This rule proposes new fees for OPT.',
        effective_on: null,
        comments_close_on: '2026-11-09',
      }],
    });
    expect(item).toMatchObject({
      source: 'federal_register',
      externalId: '2026-20660',
      documentType: 'Proposed Rule',
      publishedAt: '2026-10-08T00:00:00.000Z',
      summary: 'This rule proposes new fees for OPT. Comments close: 2026-11-09.',
      fullTextUrl: 'https://www.federalregister.gov/documents/full_text/text/2026/10/08/2026-20660.txt',
    });
  });

  it('drops documents without an id, title or https link', () => {
    expect(parseFederalRegister({ results: [{ title: 'x', html_url: 'http://insecure' }] })).toEqual([]);
    expect(parseFederalRegister({})).toEqual([]);
  });

  it('queries the last seven days for the watched agencies', () => {
    const url = new URL(federalRegisterQueryUrl(new Date('2026-10-18T12:00:00Z')));
    expect(url.searchParams.get('conditions[publication_date][gte]')).toBe('2026-10-11');
    expect(url.searchParams.getAll('conditions[agencies][]')).toContain('homeland-security-department');
  });
});

describe('parseRss', () => {
  const xml = `<rss><channel>
    <item>
      <title>USCIS Updates OPT Guidance</title>
      <link>https://www.uscis.gov/newsroom/alerts/opt-guidance</link>
      <description>U.S. Citizenship&amp;nbsp;and Immigration Services&amp;nbsp;updated F-1 guidance.</description>
      <pubDate>Fri, 09 Oct 26 13:08:41 -0400</pubDate>
    </item>
    <item><title>No link</title></item>
  </channel></rss>`;

  it('reads items, decodes entities and expands two-digit USCIS years', () => {
    const items = parseRss(xml, 'uscis_alerts');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      externalId: 'https://www.uscis.gov/newsroom/alerts/opt-guidance',
      publishedAt: '2026-10-09T17:08:41.000Z',
      summary: 'U.S. Citizenship and Immigration Services updated F-1 guidance.',
    });
  });
});

describe('isOptRelated', () => {
  it('matches OPT terms but not lowercase look-alikes', () => {
    expect(isOptRelated('STEM OPT extension update')).toBe(true);
    expect(isOptRelated('Changes to practical training fees')).toBe(true);
    expect(isOptRelated('Employers can opt out; delays stem from volume')).toBe(false);
    expect(isOptRelated('USCIS Reaches H-2B Cap')).toBe(false);
  });
});

describe('htmlToText', () => {
  it('drops scripts and tags and keeps paragraph breaks', () => {
    expect(htmlToText('<script>x()</script><p>One &amp; two</p><p>Three</p>')).toBe('One & two\nThree');
  });
});

describe('source fetch retry (TRACKMYOPT-2M)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const reply = (status: number, body = '') =>
    ({ ok: status < 400, status, text: async () => body }) as Response;
  const rss = '<?xml version="1.0"?><rss><channel></channel></rss>';
  const json = JSON.stringify({ results: [] });

  async function run(fetchImpl: (url: string) => Promise<Response>) {
    const fetchMock = vi.fn(fetchImpl);
    vi.stubGlobal('fetch', fetchMock);
    vi.useFakeTimers();
    const pending = collectCandidates(new Date('2026-11-16T00:00:00Z'));
    await vi.runAllTimersAsync();
    return { result: await pending, fetchMock };
  }

  it('retries a 5xx or dropped request once and recovers', async () => {
    let uscisCalls = 0;
    const { result } = await run(async (url) => {
      if (url.includes('uscis.gov')) {
        uscisCalls++;
        if (uscisCalls === 1) throw new TypeError('fetch failed');
        return reply(200, rss);
      }
      return reply(200, url.includes('federalregister') ? json : rss);
    });
    expect(uscisCalls).toBe(2);
    expect(result.failures).toEqual([]);
  });

  it('reports after the retry fails and does not retry client errors', async () => {
    const calls: Record<string, number> = {};
    const { result } = await run(async (url) => {
      const key = url.includes('uscis.gov') ? 'uscis' : url.includes('federalregister') ? 'fr' : 'sits';
      calls[key] = (calls[key] ?? 0) + 1;
      if (key === 'uscis') return reply(503);
      if (key === 'sits') return reply(404);
      return reply(200, json);
    });
    expect(calls).toMatchObject({ uscis: 2, sits: 1, fr: 1 });
    expect(result.failures.map((f) => [f.source, f.status])).toEqual([
      ['uscis_alerts', 503],
      ['study_in_the_states', 404],
    ]);
  });
});
