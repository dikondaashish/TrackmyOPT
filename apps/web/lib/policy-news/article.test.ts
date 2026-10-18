import { describe, expect, it } from 'vitest';
import {
  easternDate,
  PolicyNewsResponseSchema,
  slugify,
  presentAutoPost,
  toResearchArticle,
  type GeneratedArticle,
} from './article';
import type { PolicyNewsCandidate } from './sources';

const GENERATED: GeneratedArticle = {
  title: 'DHS Proposes New OPT Fees: What F-1 Students Should Know',
  seoTitle: 'DHS Proposes New OPT Fees',
  description: 'A proposed rule would add OPT fees.',
  category: 'OPT Basics',
  tags: ['OPT fees'],
  readTimeMinutes: 6,
  statusNote: 'Proposed rule; not in effect.',
  directAnswer: 'DHS proposed new OPT fees.',
  keyTakeaways: ['It is a proposal.'],
  sections: [
    { heading: 'What changed?', paragraphs: ['DHS proposed fees.'], bullets: [] },
    { heading: 'Who is affected?', paragraphs: ['F-1 students.'], bullets: ['Initial OPT'] },
  ],
  checklist: ['Read the rule.'],
  mistakes: ['Treating it as final.'],
  faq: [{ question: 'Is it in effect?', answer: 'No.' }],
  relatedSlugs: ['real-post', 'invented-post', 'real-post'],
  cta: 'opt-timeline',
  imagePrompt: 'A fictional graduate and advisor review folders at a desk.',
  imageAlt: 'Fictional graduate and advisor reviewing OPT fee documents',
};

const CANDIDATE: PolicyNewsCandidate = {
  source: 'federal_register',
  externalId: '2026-20660',
  title: 'Optional Practical Training Fees',
  url: 'https://www.federalregister.gov/d/2026-20660',
  documentType: 'Proposed Rule',
  publishedAt: '2026-10-08T00:00:00.000Z',
  summary: '',
  fullTextUrl: null,
};

describe('slugify', () => {
  it('makes a URL-safe slug and trims long titles at a word', () => {
    expect(slugify('DHS Proposes New OPT Fees: What F-1 Students’ Should Know')).toBe(
      'dhs-proposes-new-opt-fees-what-f-1-students-should-know'
    );
    const long = slugify('word '.repeat(40));
    expect(long.length).toBeLessThanOrEqual(90);
    expect(long.endsWith('-')).toBe(false);
  });
});

describe('easternDate', () => {
  it('uses the New York calendar day', () => {
    expect(easternDate(new Date('2026-10-19T02:00:00Z'))).toBe('2026-10-18');
  });
});

describe('toResearchArticle', () => {
  const article = toResearchArticle({
    generated: GENERATED,
    candidate: CANDIDATE,
    slug: 'dhs-proposes-new-opt-fees',
    now: new Date('2026-10-18T15:00:00Z'),
    relatedTitles: new Map([['real-post', 'A real post']]),
  });

  it('cites the official document from code, not the model', () => {
    expect(article.sources[0]).toEqual({
      label: 'Optional Practical Training Fees',
      publisher: 'Federal Register',
      url: 'https://www.federalregister.gov/d/2026-20660',
    });
    expect(article.sections[0].sources).toEqual([article.sources[0]]);
  });

  it('keeps only known related posts, once each', () => {
    expect(article.related).toEqual([{ label: 'A real post', href: '/blog/real-post' }]);
  });

  it('matches the existing news posts: badge, contents, image alt and caption', () => {
    expect(article.badgeLabel).toBe('Developing news');
    expect(article.showContents).toBe(true);
    expect(article.imageAlt).toBe('Fictional graduate and advisor reviewing OPT fee documents');
    expect(article.imageCaption).toMatch(/^AI-generated conceptual illustration of fictional people/);
    expect(article.publishedDate).toBe('2026-10-18');
    expect(article.sections[0]).not.toHaveProperty('bullets');
    expect(article.sections[1].bullets).toEqual(['Initial OPT']);
  });

  it('stores no byline; it is applied at read time', () => {
    expect(article).not.toHaveProperty('byline');
    expect(article).not.toHaveProperty('reviewLabel');
  });
});

describe('presentAutoPost', () => {
  const article = toResearchArticle({
    generated: GENERATED,
    candidate: CANDIDATE,
    slug: 'dhs-proposes-new-opt-fees',
    now: new Date('2026-10-18T15:00:00Z'),
    relatedTitles: new Map(),
  });

  it('uses the News Desk byline until reviewed', () => {
    const shown = presentAutoPost(article, false);
    expect(shown.byline).toBe('automated');
    expect(shown.reviewLabel).toBe('Based on the official Federal Register document');
  });

  it('uses the standard byline and review label once reviewed', () => {
    const shown = presentAutoPost({ ...article, byline: 'automated', reviewLabel: 'x' }, true);
    expect(shown).not.toHaveProperty('byline');
    expect(shown).not.toHaveProperty('reviewLabel');
  });
});

describe('PolicyNewsResponseSchema', () => {
  it('accepts a skip and rejects an unknown category', () => {
    expect(PolicyNewsResponseSchema.parse({ relevant: false, skipReason: 'H-2B only', article: null }).relevant).toBe(false);
    expect(() =>
      PolicyNewsResponseSchema.parse({ relevant: true, skipReason: null, article: { ...GENERATED, category: 'Gossip' } })
    ).toThrow();
  });
});
