#!/usr/bin/env node
/**
 * Generate a no-text editorial illustration for a blog post with a Google
 * image model, and save it as public/blog/illustrations/<slug>.webp (1200x675).
 *
 *   node --env-file=.env.local scripts/blog-illustrations/generate.mjs specs/<slug>.json
 *
 * Spec: { "slug": "...", "scene": "One sentence describing the scene." }
 *
 * Needs GOOGLE_IMAGE_API_KEY in the environment (local only; never commit it).
 * BLOG_ILLUSTRATION_MODEL overrides the model. Look at every image before you
 * commit it: reject any that shows text, flags, seals or a real person.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '../..');
const outDir = path.join(root, 'public/blog/illustrations');
const MODEL = process.env.BLOG_ILLUSTRATION_MODEL?.trim() || 'gemini-3.1-flash-image';
const WIDTH = 1200;
const HEIGHT = 675;

// Same house style as lib/policy-news/cover.ts.
const HOUSE_STYLE =
  'Warm, painterly editorial illustration, textured digital painting with soft natural window light, ' +
  'muted palette of deep green, navy, cream and warm wood tones, calm and professional mood, wide 16:9 composition. ';
const NO_TEXT =
  ' Absolutely no text, letters, numbers, logos, watermarks, flags or official seals anywhere in the image.';

const key = process.env.GOOGLE_IMAGE_API_KEY?.trim();
if (!key) {
  console.error('GOOGLE_IMAGE_API_KEY is not set. Run with: node --env-file=.env.local ...');
  process.exit(1);
}

async function generate(spec) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${HOUSE_STYLE}${spec.scene.trim()}${NO_TEXT}` }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
      }),
      signal: AbortSignal.timeout(120_000),
    }
  );
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${spec.slug}: HTTP ${response.status} ${body?.error?.status ?? ''} ${body?.error?.message ?? ''}`);
  }
  const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new Error(`${spec.slug}: the model returned no image`);
  const out = path.join(outDir, `${spec.slug}.webp`);
  fs.mkdirSync(outDir, { recursive: true });
  await sharp(Buffer.from(part.inlineData.data, 'base64'))
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`${spec.slug}: ${path.relative(root, out)} (${Math.round(fs.statSync(out).size / 1024)} KB, ${MODEL})`);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node --env-file=.env.local scripts/blog-illustrations/generate.mjs spec.json [...]');
  process.exit(1);
}
let failed = false;
for (const file of files) {
  try {
    await generate(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (error) {
    failed = true;
    console.error(error instanceof Error ? error.message : String(error));
  }
}
process.exit(failed ? 1 : 0);
