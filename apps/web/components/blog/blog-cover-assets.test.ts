// @vitest-environment node
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { blogPosts, getPostImage } from '@/app/blog/blog-index-data';
import { researchArticleBySlug } from '@/data/blog-series';

const DEFAULT_COVER = '/blog/international-student-guidance-library-2026.png';
const missing = (paths: string[]) =>
  paths.filter(
    (path) =>
      !path.startsWith('/') || !existsSync(join(process.cwd(), 'public', path))
  );

// BlogPostImage only reports covers the server fails to serve; keep every
// cover a static file so a broken asset URL is caught before release.
describe('blog cover assets', () => {
  it('serves every blog index cover and the shared fallback from public/', () => {
    expect(
      missing([DEFAULT_COVER, ...blogPosts.map((post) => getPostImage(post))])
    ).toEqual([]);
  });

  it('serves every research article cover from public/', () => {
    expect(
      missing(
        [...researchArticleBySlug.values()].map(
          (article) => article.image ?? DEFAULT_COVER
        )
      )
    ).toEqual([]);
  });
});
