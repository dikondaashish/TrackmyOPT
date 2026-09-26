/** Only repository demo templates are compiled; never pass applicant content here. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { RESUME_TEMPLATES } from '../lib/documents/templates';

async function main() {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'public/template-previews');
  const manifestPath = path.join(
    root,
    'lib/documents/template-preview-assets.json'
  );
  const check = process.argv.includes('--check');
  type Asset = {
    sourceHash: string;
    pdf: string;
    image: string;
    width: number;
    height: number;
  };
  const manifest: Record<string, Asset> = check
    ? JSON.parse(readFileSync(manifestPath, 'utf8'))
    : {};
  const hash = (bytes: string | Buffer) =>
    createHash('sha256').update(bytes).digest('hex');
  mkdirSync(output, { recursive: true });
  for (const { id } of RESUME_TEMPLATES) {
    const source = readFileSync(
      path.join(root, 'templates/latex', `${id}.tex`)
    );
    const sourceHash = hash(source);
    if (check) {
      const asset = manifest[id];
      if (!asset || asset.sourceHash !== sourceHash)
        throw new Error(
          `${id}: run pnpm previews:generate and commit the assets`
        );
      for (const url of [asset.pdf, asset.image]) {
        const bytes = readFileSync(path.join(root, 'public', url));
        if (!url.includes(hash(bytes).slice(0, 16)))
          throw new Error(`${id}: corrupt preview asset ${url}`);
      }
      continue;
    }
    const temp = mkdtempSync(path.join(tmpdir(), 'resume-preview-'));
    try {
      writeFileSync(path.join(temp, 'sample.tex'), source);
      execFileSync(
        'pdflatex',
        [
          '-no-shell-escape',
          '-interaction=nonstopmode',
          '-halt-on-error',
          'sample.tex',
        ],
        { cwd: temp, stdio: 'pipe' }
      );
      execFileSync(
        'pdftoppm',
        [
          '-f',
          '1',
          '-singlefile',
          '-scale-to-x',
          '960',
          '-scale-to-y',
          '-1',
          '-png',
          'sample.pdf',
          'page',
        ],
        { cwd: temp, stdio: 'pipe' }
      );
      const pdf = readFileSync(path.join(temp, 'sample.pdf'));
      const { data: image, info } = await sharp(path.join(temp, 'page.png'))
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true });
      const pdfName = `${id}-${hash(pdf).slice(0, 16)}.pdf`;
      const imageName = `${id}-${hash(image).slice(0, 16)}.webp`;
      writeFileSync(path.join(output, pdfName), pdf);
      writeFileSync(path.join(output, imageName), image);
      manifest[id] = {
        sourceHash,
        pdf: `/template-previews/${pdfName}`,
        image: `/template-previews/${imageName}`,
        width: info.width,
        height: info.height,
      };
      console.log(`${id}: ${Math.round(image.length / 1024)} KB thumbnail`);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  }
  if (!check)
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    check
      ? 'Template preview assets verified.'
      : 'Template preview assets generated.'
  );
}
main().catch((error) => {
  console.error(error.stdout?.toString() ?? error);
  process.exitCode = 1;
});
