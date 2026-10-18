import { describe, expect, it } from 'vitest';
import {
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
