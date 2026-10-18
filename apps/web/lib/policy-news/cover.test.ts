import { beforeEach, expect, it, vi } from 'vitest';
import sharp from 'sharp';

const m = vi.hoisted(() => ({ image: vi.fn() }));
vi.mock('@/lib/ai/google-ai', () => ({ generateAiImage: m.image }));

import { coverPrompt, generateCover } from './cover';

beforeEach(async () => {
  // A 16:9 PNG like the image model returns.
  const png = await sharp({ create: { width: 1408, height: 768, channels: 3, background: '#335544' } }).png().toBuffer();
  m.image.mockResolvedValue({ bytes: png, mimeType: 'image/png' });
});

it('wraps the scene in the house style and forbids text', () => {
  const prompt = coverPrompt('A graduate reads a letter.');
  expect(prompt).toMatch(/^Warm, painterly editorial illustration/);
  expect(prompt).toContain('A graduate reads a letter.');
  expect(prompt).toMatch(/no text, letters, numbers, logos/);
});

it('returns a 1200x630 WebP like the existing covers', async () => {
  const cover = await generateCover('A graduate reads a letter.');
  const meta = await sharp(cover).metadata();
  expect(meta).toMatchObject({ format: 'webp', width: 1200, height: 630 });
  expect(m.image).toHaveBeenCalledWith({ task: 'policy_news_cover', prompt: coverPrompt('A graduate reads a letter.') });
});
