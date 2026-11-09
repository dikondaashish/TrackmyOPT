import { describe, expect, it } from 'vitest';
import { blogPosts, getHubPosts } from '@/app/blog/blog-index-data';
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
});
