import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');
const sourcePath = path.join(here, 'source', 'store-assets.html');
const outputDir = path.join(here, 'output');

const assets = [
  ['screenshot-01-overview', '01-overview.png'],
  ['screenshot-02-smart-prefill', '02-smart-prefill.png'],
  ['screenshot-03-ai-review', '03-ai-review.png'],
  ['screenshot-04-private-review', '04-private-review.png'],
  ['screenshot-05-guided-autopilot', '05-guided-autopilot.png'],
  ['promo-small', 'promo-small-440x280.png'],
  ['promo-marquee', 'promo-marquee-1400x560.png'],
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1500, height: 1000 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(sourcePath).href);
await page.evaluate(() => document.fonts.ready);

for (const [id, filename] of assets) {
  const locator = page.locator(`#${id}`);
  await locator.scrollIntoViewIfNeeded();
  const screenshot = await locator.screenshot({ type: 'png' });
  const outputPath = path.join(outputDir, filename);

  await sharp(screenshot)
    .flatten({ background: '#071a49' })
    .removeAlpha()
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

await browser.close();

for (const [, filename] of assets) {
  const outputPath = path.join(outputDir, filename);
  const metadata = await sharp(outputPath).metadata();
  console.log(
    `${filename}: ${metadata.width}x${metadata.height}, ${metadata.channels} channels`,
  );
}
