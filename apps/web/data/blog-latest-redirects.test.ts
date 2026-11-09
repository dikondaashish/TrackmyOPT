import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { getPublicBlogRoutes } from '@/lib/blog-routes';

const require = createRequire(import.meta.url);
const { BLOG_LATEST_REDIRECTS } = require('../blog-latest-redirects') as {
  BLOG_LATEST_REDIRECTS: Array<{ source: string; destination: string }>;
};

describe('blog "latest" redirects', () => {
  it('points every stable URL at a live blog post', () => {
    const routes = new Set(getPublicBlogRoutes());
    for (const { source, destination } of BLOG_LATEST_REDIRECTS) {
      expect(routes.has(destination), `${source} -> ${destination}`).toBe(true);
    }
  });

  it('never shadows a real page', () => {
    const routes = new Set(getPublicBlogRoutes());
    for (const { source } of BLOG_LATEST_REDIRECTS) {
      expect(routes.has(source), source).toBe(false);
    }
  });
});
