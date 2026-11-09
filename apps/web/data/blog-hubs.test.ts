import { describe, expect, it } from 'vitest';
import {
  ESSENTIAL_GUIDE_SLUGS,
  LATER_HUB_MEMBERS,
  blogPosts,
  getHubPosts,
  sortNewestFirst,
} from '@/app/blog/blog-index-data';
import { blogPostsPartOne } from '@/app/blog/blog-index-posts-a';
import { blogPostsPartTwo } from '@/app/blog/blog-index-posts-b';
import { researchBlogCards } from '@/data/blog-series';
import { getPublicBlogRoutes } from '@/lib/blog-routes';
import { BLOG_HUBS, BLOG_HUB_SLUGS, blogHubPath } from './blog-hubs';

describe('blog hubs', () => {
  it('lists 8 to 15 live posts per hub, each only once, newest first', () => {
    const routes = new Set(getPublicBlogRoutes());
    for (const slug of BLOG_HUB_SLUGS) {
      const posts = getHubPosts(slug);
      expect(posts.length, slug).toBeGreaterThanOrEqual(8);
      expect(posts.length, slug).toBeLessThanOrEqual(15);
      expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
      for (const post of posts) {
        expect(routes.has(`/blog/${post.slug}`), post.slug).toBe(true);
        expect(post.description.length, post.slug).toBeGreaterThan(40);
      }
      const times = posts.map((p) => new Date(`${p.date} UTC`).getTime());
      expect(times.every((t) => !Number.isNaN(t))).toBe(true);
      expect([...times].sort((a, b) => b - a)).toEqual(times);
    }
  });

  it('defines all ten hubs', () => {
    expect([...BLOG_HUB_SLUGS].sort()).toEqual(
      [
        'after-opt',
        'careers',
        'case-status',
        'f1-status',
        'money-and-life',
        'opt-rules',
        'policy-news',
        'processing-times',
        'stem-opt',
        'visa-bulletin',
      ].sort()
    );
    for (const slug of BLOG_HUB_SLUGS) {
      const hub = BLOG_HUBS[slug];
      expect(hub.slug).toBe(slug);
      expect(hub.name.length, slug).toBeGreaterThan(0);
      expect(hub.title.length, slug).toBeGreaterThan(0);
      expect(hub.description.length, slug).toBeGreaterThan(40);
      expect(hub.intro.length, slug).toBeGreaterThan(40);
    }
  });

  it('puts each post in at most one hub', () => {
    const seen = new Set<string>();
    for (const slug of BLOG_HUB_SLUGS) {
      for (const post of getHubPosts(slug)) {
        expect(seen.has(post.slug), post.slug).toBe(false);
        seen.add(post.slug);
      }
    }
  });

  it('only uses hub slugs that exist', () => {
    for (const post of blogPosts) {
      if (post.hub) expect(BLOG_HUB_SLUGS).toContain(post.hub);
    }
  });

  it('publishes each hub route and keeps the bare /blog/hub directory out of the sitemap', () => {
    const routes = getPublicBlogRoutes();
    for (const slug of BLOG_HUB_SLUGS) {
      expect(routes).toContain(blogHubPath(slug));
      expect(BLOG_HUBS[slug].seoTitle.length).toBeLessThanOrEqual(60);
      expect(BLOG_HUBS[slug].cta).toBe('case-status');
    }
    expect(routes).not.toContain('/blog/hub');
  });

  it('puts the week-2 posts in their hubs', () => {
    expect(getHubPosts('processing-times').map((p) => p.slug)).toContain(
      'i-765-processing-time-after-biometrics'
    );
    expect(getHubPosts('case-status').map((p) => p.slug)).toContain(
      'ioe-receipt-number-elis-case-status'
    );
  });

  it('places later hub members that exist and had no hub of their own', () => {
    const original = new Map(
      [...researchBlogCards, ...blogPostsPartOne, ...blogPostsPartTwo].map((post) => [post.slug, post.hub])
    );
    for (const [hub, slugs] of Object.entries(LATER_HUB_MEMBERS)) {
      for (const slug of slugs ?? []) {
        expect(original.has(slug), slug).toBe(true);
        expect(original.get(slug), slug).toBeUndefined();
        expect(blogPosts.find((post) => post.slug === slug)?.hub).toBe(hub);
      }
    }
  });
});

describe('blog index helpers', () => {
  it('names six essential guides that exist', () => {
    expect(ESSENTIAL_GUIDE_SLUGS).toHaveLength(6);
    for (const slug of ESSENTIAL_GUIDE_SLUGS) {
      expect(blogPosts.some((post) => post.slug === slug), slug).toBe(true);
    }
  });

  it('sorts newest first and keeps the order of same-day posts', () => {
    const cards = [
      { slug: 'a', date: 'October 1, 2026' },
      { slug: 'b', date: 'November 9, 2026' },
      { slug: 'c', date: 'October 1, 2026' },
      { slug: 'd', date: 'not a date' },
    ];
    expect(sortNewestFirst(cards).map((c) => c.slug)).toEqual(['b', 'a', 'c', 'd']);
  });
});
