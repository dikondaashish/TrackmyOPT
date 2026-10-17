import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { blogPosts } from '@/app/blog/blog-index-data';
import { getPublicBlogRoutes } from '@/lib/blog-routes';
import { createResearchArticleMetadata } from '@/lib/seo/research-article-metadata';
import { researchArticleBySlug } from './index';
import { topicGapGuidesOctober2026 } from './topic-gap-guides-2026-10';

describe('October 2026 topic-gap guides', () => {
  it('publishes ten unique guides with working routes, cards, and internal links', () => {
    expect(topicGapGuidesOctober2026).toHaveLength(10);
    const routes = new Set(getPublicBlogRoutes());
    const cards = blogPosts.map((post) => post.slug);

    for (const article of topicGapGuidesOctober2026) {
      expect(routes.has(`/blog/${article.slug}`)).toBe(true);
      expect(cards.filter((slug) => slug === article.slug)).toHaveLength(1);
      expect(researchArticleBySlug.get(article.slug)?.slug).toBe(article.slug);
      expect(article.publishedDate).toBe('2026-10-16');
      expect(article.directAnswer.length).toBeGreaterThan(80);
      expect(article.faq.length).toBeGreaterThanOrEqual(3);
      expect(article.sources.length).toBeGreaterThan(0);

      const metadata = createResearchArticleMetadata(article);
      expect(metadata.alternates?.canonical).toBe(
        `https://www.trackmyopt.com/blog/${article.slug}`
      );
      expect(
        fs.existsSync(path.join(process.cwd(), 'public', article.image!))
      ).toBe(true);

      for (const link of [
        ...article.related,
        ...article.sections.flatMap((section) => section.links ?? []),
      ]) {
        if (link.href.startsWith('/blog/')) {
          expect(routes.has(link.href)).toBe(true);
        }
      }
    }
  });
});
