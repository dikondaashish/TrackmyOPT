import { beforeEach, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  collect: vi.fn(),
  loadSourceText: vi.fn(),
  generate: vi.fn(),
  record: vi.fn(),
  claim: vi.fn(),
  finish: vi.fn(),
  recent: vi.fn(),
  slugExists: vi.fn(),
  insert: vi.fn(),
  revalidate: vi.fn(),
  indexNow: vi.fn(),
  report: vi.fn(),
  cover: vi.fn(),
}));

vi.mock('./cover', () => ({
  generateCover: m.cover,
  coverPath: (slug: string) => `/blog-covers/${slug}.webp`,
}));

vi.mock('next/cache', () => ({ revalidatePath: m.revalidate }));
vi.mock('@/lib/ai/google-ai', () => ({ generateAiContent: m.generate }));
vi.mock('@/lib/seo/indexnow', () => ({ submitIndexNow: m.indexNow }));
vi.mock('./monitoring', () => ({ reportPolicyNews: m.report }));
vi.mock('./sources', async (original) => ({
  ...(await original<typeof import('./sources')>()),
  collectCandidates: m.collect,
  loadSourceText: m.loadSourceText,
}));
vi.mock('./store', async () => {
  class PolicyNewsStoreError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  }
  return {
    MAX_ATTEMPTS: 3,
    PolicyNewsStoreError,
    recordCandidates: m.record,
    claimItems: m.claim,
    finishItem: m.finish,
    loadRecentAutoPosts: m.recent,
    autoSlugExists: m.slugExists,
    insertAutoPost: m.insert,
  };
});

import { runPolicyNewsBlog } from './pipeline';

const NOW = new Date('2026-10-18T16:40:00Z');
const ITEM = {
  id: 7,
  source: 'federal_register',
  externalId: '2026-20660',
  title: 'Optional Practical Training Fees',
  url: 'https://www.federalregister.gov/d/2026-20660',
  documentType: 'Proposed Rule',
  publishedAt: '2026-10-08T00:00:00.000Z',
  summary: 'Proposes OPT fees.',
  fullTextUrl: null,
  attempts: 1,
};
const ARTICLE = {
  title: 'DHS Proposes New OPT Fees',
  seoTitle: 'DHS Proposes New OPT Fees',
  description: 'A proposed rule would add OPT fees.',
  category: 'OPT Basics',
  tags: ['OPT fees'],
  readTimeMinutes: 5,
  statusNote: 'Proposed; not in effect.',
  directAnswer: 'DHS proposed OPT fees.',
  keyTakeaways: ['Proposal only.'],
  sections: [{ heading: 'What changed?', paragraphs: ['Fees proposed.'], bullets: [] }],
  checklist: ['Read it.'],
  mistakes: ['Assuming it is final.'],
  faq: [{ question: 'Final?', answer: 'No.' }],
  relatedSlugs: [],
  cta: 'opt-timeline',
  imagePrompt: 'A fictional graduate reads a letter at a kitchen table.',
  imageAlt: 'Fictional graduate reading an OPT fee notice',
};
const COVER = Buffer.from('webp-bytes');
const modelReturns = (body: unknown) => m.generate.mockResolvedValue({ text: JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  m.collect.mockResolvedValue({ candidates: [ITEM], failures: [] });
  m.loadSourceText.mockResolvedValue('Full rule text.');
  m.claim.mockResolvedValue([ITEM]);
  m.recent.mockResolvedValue([]);
  m.slugExists.mockResolvedValue(false);
  m.indexNow.mockResolvedValue(200);
  m.cover.mockResolvedValue(COVER);
  modelReturns({ relevant: true, skipReason: null, article: ARTICLE });
});

it('publishes a relevant notice, refreshes the blog and pings IndexNow', async () => {
  const summary = await runPolicyNewsBlog(NOW);

  expect(summary.published).toEqual(['dhs-proposes-new-opt-fees']);
  expect(m.cover).toHaveBeenCalledWith(ARTICLE.imagePrompt);
  expect(m.insert).toHaveBeenCalledWith(
    expect.objectContaining({
      slug: 'dhs-proposes-new-opt-fees',
      publishedDate: '2026-10-18',
      image: '/blog-covers/dhs-proposes-new-opt-fees.webp',
    }),
    7,
    NOW,
    COVER
  );
  expect(m.finish).toHaveBeenCalledWith(7, { status: 'published', slug: 'dhs-proposes-new-opt-fees' });
  expect(m.revalidate).toHaveBeenCalledWith('/blog');
  expect(m.revalidate).toHaveBeenCalledWith('/blog/dhs-proposes-new-opt-fees');
  expect(m.indexNow).toHaveBeenCalledWith([
    'https://www.trackmyopt.com/blog',
    'https://www.trackmyopt.com/blog/dhs-proposes-new-opt-fees',
  ]);
  expect(m.report).not.toHaveBeenCalled();
});

it('still publishes with the default image when the cover fails', async () => {
  m.cover.mockRejectedValue(new Error('quota'));
  const summary = await runPolicyNewsBlog(NOW);
  expect(summary.published).toEqual(['dhs-proposes-new-opt-fees']);
  const [article, , , cover] = m.insert.mock.calls[0];
  expect(article).not.toHaveProperty('image');
  expect(cover).toBeNull();
  expect(m.report).toHaveBeenCalledWith('cron', 'cover_generation_failed', 'warning', expect.objectContaining({ source: 'federal_register' }));
});

it('suffixes a slug that is already used', async () => {
  m.slugExists.mockImplementation(async (slug: string) => slug === 'dhs-proposes-new-opt-fees');
  const summary = await runPolicyNewsBlog(NOW);
  expect(summary.published).toEqual(['dhs-proposes-new-opt-fees-2']);
});

it('skips notices the model marks irrelevant without publishing', async () => {
  modelReturns({ relevant: false, skipReason: 'Paperwork only', article: null });
  const summary = await runPolicyNewsBlog(NOW);
  expect(summary.skipped).toBe(1);
  expect(m.finish).toHaveBeenCalledWith(7, { status: 'skipped' });
  expect(m.insert).not.toHaveBeenCalled();
  expect(m.revalidate).not.toHaveBeenCalled();
});

it('returns an item to the queue on a malformed response and reports it', async () => {
  m.generate.mockResolvedValue({ text: '{"relevant": true' });
  const summary = await runPolicyNewsBlog(NOW);
  expect(summary.failed).toEqual(['invalid_model_output']);
  expect(m.finish).toHaveBeenCalledWith(7, { status: 'pending', errorCode: 'invalid_model_output' });
  expect(m.report).toHaveBeenCalledWith('cron', 'invalid_model_output', 'warning', expect.objectContaining({ source: 'federal_register' }));
});

it('gives up after the last attempt with an error-level report', async () => {
  m.claim.mockResolvedValue([{ ...ITEM, attempts: 3 }]);
  m.generate.mockRejectedValue(new Error('provider down'));
  await runPolicyNewsBlog(NOW);
  expect(m.finish).toHaveBeenCalledWith(7, { status: 'failed', errorCode: 'generation_failed' });
  expect(m.report).toHaveBeenCalledWith('cron', 'generation_failed', 'error', expect.anything());
});

it('reports a failing source and still processes the others', async () => {
  const { SourceFetchError } = await import('./sources');
  m.collect.mockResolvedValue({ candidates: [ITEM], failures: [new SourceFetchError('uscis_alerts', 503)] });
  const summary = await runPolicyNewsBlog(NOW);
  expect(summary.sourceFailures).toEqual(['uscis_alerts']);
  expect(m.report).toHaveBeenCalledWith('cron', 'source_fetch_failed', 'warning', { source: 'uscis_alerts', status: 503 });
  expect(summary.published).toHaveLength(1);
});
