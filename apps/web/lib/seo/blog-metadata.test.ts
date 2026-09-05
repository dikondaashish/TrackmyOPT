import { describe, expect, it } from 'vitest';
import { createBlogMetadata } from './blog-metadata';

describe('blog metadata', () => {
  it('builds canonical, Open Graph, and Twitter metadata', () => {
    const meta = createBlogMetadata({
      title: 'STEM OPT Guide',
      description: 'How STEM OPT works',
      slugOrPath: 'stem-opt-extension-guide',
    });
    const canonical =
      'https://www.trackmyopt.com/blog/stem-opt-extension-guide';

    expect(meta.alternates?.canonical).toBe(canonical);
    expect(meta.openGraph?.url).toBe(canonical);
    expect((meta.twitter as { card?: string } | undefined)?.card).toBe(
      'summary_large_image'
    );
    expect((meta.twitter as { title?: string } | undefined)?.title).toBe(
      'STEM OPT Guide'
    );
  });
});
