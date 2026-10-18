import 'server-only';
import sharp from 'sharp';
import { generateAiImage } from '@/lib/ai/google-ai';

// Cover illustrations in the style of the hand-made October 2026 news covers.

const HOUSE_STYLE =
  'Warm, painterly editorial illustration, textured digital painting with soft natural window light, ' +
  'muted palette of deep green, navy, cream and warm wood tones, calm and professional mood, wide composition. ';
const NO_TEXT = ' Absolutely no text, letters, numbers, logos, watermarks, flags or official seals anywhere in the image.';

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

export function coverPrompt(scene: string): string {
  return `${HOUSE_STYLE}${scene.trim()}${NO_TEXT}`;
}

/** A 1200x630 WebP cover for the model's scene description. */
export async function generateCover(scene: string): Promise<Buffer> {
  const { bytes } = await generateAiImage({ task: 'policy_news_cover', prompt: coverPrompt(scene) });
  return sharp(bytes)
    .resize(COVER_WIDTH, COVER_HEIGHT, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toBuffer();
}

export const coverPath = (slug: string) => `/blog-covers/${slug}.webp`;
