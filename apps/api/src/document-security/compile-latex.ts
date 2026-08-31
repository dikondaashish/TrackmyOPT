import { execFile } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const MAX_LATEX_CHARS = 200_000;
const COMPILE_TIMEOUT_MS = 40_000;

export type LatexResource = { main?: boolean; content?: unknown };

export function extractMainLatex(resources: unknown): string | null {
  if (!Array.isArray(resources) || resources.length === 0) return null;
  const main =
    (resources as LatexResource[]).find((item) => item?.main === true) ??
    (resources as LatexResource[])[0];
  if (typeof main?.content !== 'string' || !main.content.trim()) return null;
  if (main.content.length > MAX_LATEX_CHARS) return null;
  return main.content;
}

export async function compileLatexPdf(latex: string): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'tmo-latex-'));
  try {
    const texPath = join(dir, 'main.tex');
    await writeFile(texPath, latex, 'utf8');
    await execFileAsync(
      'pdflatex',
      [
        '-interaction=nonstopmode',
        '-halt-on-error',
        '-no-shell-escape',
        `-output-directory=${dir}`,
        texPath,
      ],
      { timeout: COMPILE_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 },
    );
    const pdf = await readFile(join(dir, 'main.pdf'));
    if (pdf.length < 5 || pdf.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error('compiler-did-not-emit-pdf');
    }
    return pdf;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
