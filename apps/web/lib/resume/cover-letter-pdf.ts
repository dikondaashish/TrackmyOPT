import { compileLatex } from './latex-compiler';

const MAX_COVER_LETTER_CHARS = 12_000;

export function escapeCoverLetterLatex(value: string): string {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#$%&_{}])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\r?\n/g, '\\\\\n');
}

export function buildCoverLetterLatex(text: string): string {
  const safeText = escapeCoverLetterLatex(
    text.trim().slice(0, MAX_COVER_LETTER_CHARS)
  );
  return `\\documentclass[11pt]{letter}
\\usepackage[margin=1in]{geometry}
\\usepackage[T1]{fontenc}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.8em}
\\begin{document}
${safeText}
\\end{document}`;
}

/** Compile through the configured production compiler and validate real PDF bytes. */
export async function compileCoverLetterPdf(
  text: string
): Promise<ArrayBuffer> {
  const result = await compileLatex(buildCoverLetterLatex(text));
  if (!result.ok) {
    throw new Error(`Cover-letter compilation failed: ${result.error}`);
  }
  return result.pdf;
}
