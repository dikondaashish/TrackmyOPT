// @vitest-environment node
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { researchArticleBySlug } from '@/data/blog-series';

describe('blog figures', () => {
  it('serves every in-article figure from public/ with a real alt text', () => {
    for (const article of researchArticleBySlug.values()) {
      for (const section of article.sections) {
        if (!section.figure) continue;
        const { src, alt, width, height } = section.figure;
        expect(existsSync(join(process.cwd(), 'public', src)), src).toBe(true);
        expect(alt.length, src).toBeGreaterThan(30);
        expect(width > 0 && height > 0, src).toBe(true);
      }
    }
  });
});
