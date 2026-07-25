const MAX_COVER_LETTER_CHARS = 12_000;
const MAX_PDF_BYTES = 5 * 1024 * 1024;

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

function isPdf(bytes: ArrayBuffer): boolean {
  const header = new Uint8Array(bytes.slice(0, 5));
  return String.fromCharCode(...header) === '%PDF-';
}

/** Compile through the configured production compiler and validate real PDF bytes. */
export async function compileCoverLetterPdf(
  text: string
): Promise<ArrayBuffer> {
  const latex = buildCoverLetterLatex(text);
  const attempts: Array<() => Promise<Response>> = [
    () =>
      fetch(
        process.env.LATEX_COMPILER_URL ||
          'https://latex.ytotech.com/builds/sync',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            compiler: 'pdflatex',
            resources: [{ main: true, content: latex }],
          }),
        }
      ),
    () =>
      fetch(
        `https://latex.online/compile?text=${encodeURIComponent(latex)}`,
        { method: 'GET' }
      ),
  ];

  let lastError = 'unknown compiler error';
  for (const attempt of attempts) {
    try {
      const response = await attempt();
      if (!response.ok) {
        lastError = `compiler returned ${response.status}`;
        continue;
      }
      const pdf = await response.arrayBuffer();
      if (
        pdf.byteLength > 0 &&
        pdf.byteLength <= MAX_PDF_BYTES &&
        isPdf(pdf)
      ) {
        return pdf;
      }
      lastError = 'compiler returned invalid PDF bytes';
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : 'compiler network error';
    }
  }
  throw new Error(`Cover-letter compilation failed: ${lastError}`);
}
