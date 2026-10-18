import { z } from 'zod';
import { POLICY_NEWS_CATEGORIES, POLICY_NEWS_CTAS } from '@/lib/ai/prompts/policy-news-article';
import { source as standardSources } from '@/data/blog-series/shared';
import type { ResearchArticle } from '@/data/blog-series/types';
import { SOURCE_PUBLISHERS, type PolicyNewsCandidate } from './sources';

// Turns the model's JSON into a ResearchArticle. Source links, dates, byline
// and slug come from code, never from the model.

const text = (max: number) => z.string().trim().min(1).max(max);

const GeneratedArticleSchema = z.object({
  title: text(140),
  seoTitle: text(90),
  description: text(260),
  category: z.enum(POLICY_NEWS_CATEGORIES),
  tags: z.array(text(80)).min(1).max(10),
  readTimeMinutes: z.number().int().min(1).max(30),
  statusNote: text(1200),
  directAnswer: text(1500),
  keyTakeaways: z.array(text(400)).min(1).max(8),
  sections: z.array(z.object({
    heading: text(200),
    paragraphs: z.array(text(2500)).min(1).max(8),
    bullets: z.array(text(500)).max(10).default([]),
  })).min(1).max(10),
  checklist: z.array(text(400)).min(1).max(10),
  mistakes: z.array(text(400)).min(1).max(8),
  faq: z.array(z.object({ question: text(300), answer: text(1500) })).min(1).max(8),
  relatedSlugs: z.array(z.string()).max(6).default([]),
  cta: z.enum(POLICY_NEWS_CTAS),
  imagePrompt: text(1200),
  imageAlt: text(300),
});

export const PolicyNewsResponseSchema = z.object({
  relevant: z.boolean(),
  skipReason: z.string().max(500).nullable().optional(),
  article: GeneratedArticleSchema.nullable(),
});

export type GeneratedArticle = z.infer<typeof GeneratedArticleSchema>;

const MAX_SLUG_LENGTH = 90;

export function slugify(title: string): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= MAX_SLUG_LENGTH) return slug || 'opt-policy-update';
  const cut = slug.slice(0, MAX_SLUG_LENGTH);
  const boundary = cut.lastIndexOf('-');
  return boundary > 40 ? cut.slice(0, boundary) : cut;
}

/** YYYY-MM-DD in New York, the site's editorial calendar day. */
export function easternDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export function toResearchArticle(input: {
  generated: GeneratedArticle;
  candidate: PolicyNewsCandidate;
  slug: string;
  now: Date;
  relatedTitles: ReadonlyMap<string, string>;
}): ResearchArticle {
  const { generated, candidate, slug, now } = input;
  const publisher = SOURCE_PUBLISHERS[candidate.source];
  const date = easternDate(now);
  const officialSource = { label: candidate.title, publisher, url: candidate.url };
  const related = [...new Set(generated.relatedSlugs)]
    .filter((relatedSlug) => input.relatedTitles.has(relatedSlug) && relatedSlug !== slug)
    .slice(0, 4)
    .map((relatedSlug) => ({ label: input.relatedTitles.get(relatedSlug)!, href: `/blog/${relatedSlug}` }));

  return {
    slug,
    title: generated.title,
    seoTitle: generated.seoTitle,
    description: generated.description,
    category: generated.category,
    tags: generated.tags,
    readTime: `${generated.readTimeMinutes} min read`,
    publishedDate: date,
    modifiedDate: date,
    directAnswer: generated.directAnswer,
    keyTakeaways: generated.keyTakeaways,
    sections: generated.sections.map((section, index) => ({
      heading: section.heading,
      paragraphs: section.paragraphs,
      ...(section.bullets.length ? { bullets: section.bullets } : {}),
      ...(index === 0 ? { sources: [officialSource] } : {}),
    })),
    checklist: generated.checklist,
    mistakes: generated.mistakes,
    faq: generated.faq,
    sources: [officialSource, standardSources.opt, standardSources.stem],
    related: related.length ? related : [{ label: 'All OPT and F-1 guides', href: '/blog' }],
    cta: generated.cta,
    statusNote: generated.statusNote,
    badgeLabel: 'Developing news',
    showContents: true,
    imageAlt: generated.imageAlt,
    imageCaption: AI_IMAGE_CAPTION,
  };
}

/** Same caption as the hand-made October 2026 news covers. */
export const AI_IMAGE_CAPTION =
  'AI-generated conceptual illustration of fictional people; not a photograph of an actual applicant, company meeting, or government action.';

/**
 * Byline and review label at read time: the News Desk byline until an admin
 * reviews the post, then the standard Vinay Kumar byline and review label.
 */
export function presentAutoPost(article: ResearchArticle, reviewed: boolean): ResearchArticle {
  const { byline: _byline, reviewLabel: _reviewLabel, ...rest } = article;
  if (reviewed) return rest;
  const publisher = article.sources[0]?.publisher ?? 'government';
  return { ...rest, byline: 'automated', reviewLabel: `Based on the official ${publisher} document` };
}
