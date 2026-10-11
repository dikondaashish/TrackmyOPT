import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { blogPosts } from '@/app/blog/blog-index-data';
import { getPublicBlogRoutes } from '@/lib/blog-routes';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';
import { trackingGuides } from './tracking-guides';
import { editorialRefreshes } from './editorial-refreshes';
import { researchArticleBySlug } from './index';

describe('search-intent publishing contracts', () => {
  it('publishes each guide once, with a canonical route, assets and contextual links', () => {
    const routes = new Set(getPublicBlogRoutes());
    const cards = blogPosts.map((post) => post.slug);
    expect(new Set(cards).size).toBe(cards.length);
    for (const article of [...trackingGuides, ...editorialRefreshes]) {
      expect(routes.has(`/blog/${article.slug}`)).toBe(true);
      expect(cards.filter((slug) => slug === article.slug)).toHaveLength(1);
      const metadata = createResearchArticleMetadata(article);
      expect(metadata.alternates?.canonical).toBe(
        `https://www.trackmyopt.com/blog/${article.slug}`
      );
      expect(metadata.openGraph).toMatchObject({
        publishedTime: article.publishedDate,
        modifiedTime: article.modifiedDate,
      });
      expect(
        fs.existsSync(path.join(process.cwd(), 'public', article.image!))
      ).toBe(true);
      for (const section of article.sections) {
        if (section.visual) {
          for (const asset of [section.visual.src, section.visual.poster]) {
            expect(
              fs.existsSync(path.join(process.cwd(), 'public', asset))
            ).toBe(true);
          }
        }
      }
      for (const link of [
        ...article.related,
        ...article.sections.flatMap((section) => section.links ?? []),
      ]) {
        if (link.href.startsWith('/blog/'))
          expect(routes.has(link.href)).toBe(true);
      }
    }
  });

  it('keeps non-OPT tracking guides away from the OPT-only estimate CTA', () => {
    for (const slug of [
      'i-140-case-status-tracking',
      'h4-ead-case-status-tracking',
      'opt-receipt-number-not-working',
    ]) {
      expect(researchArticleBySlug.get(slug)?.cta).toBe('uscis-tracking');
    }
  });

  it('preserves original publication dates and dates the court-aware refresh', () => {
    expect(editorialRefreshes.map((article) => article.publishedDate)).toEqual([
      '2026-07-14',
      '2026-03-17',
      '2026-05-29',
    ]);
    expect(
      editorialRefreshes.find((article) =>
        article.slug.includes('spring-graduates')
      )?.statusNote
    ).toContain('postponed');
    expect(
      researchArticleBySlug.get('september-2026-f1-fixed-admission-rule-opt')
        ?.directAnswer
    ).toContain('did not take effect');
  });
});
