import { describe, expect, it } from 'vitest';
import { platformGapGuidesOctober2026 } from '@/data/blog-series/platform-gaps';
import { getPublicBlogRoutes } from '@/lib/blog-routes';
import { GET } from './route';

describe('GET /llms.txt', () => {
  it('serves plain text with the llms.txt structure and live blog guides', async () => {
    const response = GET();
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    const body = await response.text();

    expect(body.startsWith('# TrackMyOPT\n\n> ')).toBe(true);
    expect(body).toContain('## Free tools');
    expect(body).toContain('## Guides');

    for (const article of platformGapGuidesOctober2026) {
      expect(body).toContain(
        `https://www.trackmyopt.com/blog/${article.slug})`
      );
    }

    const liveRoutes = new Set(getPublicBlogRoutes());
    const blogLinks = [
      ...body.matchAll(/https:\/\/www\.trackmyopt\.com(\/blog\/[a-z0-9-]+)\)/g),
    ].map((match) => match[1]);
    expect(blogLinks.length).toBeGreaterThan(50);
    expect(new Set(blogLinks).size).toBe(blogLinks.length);
    for (const link of blogLinks) {
      expect(liveRoutes.has(link)).toBe(true);
    }
  });
});
