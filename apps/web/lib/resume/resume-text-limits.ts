/** Max resume text accepted by generate/regenerate APIs (after normalization). */
export const RESUME_TEXT_MAX_CHARS = 25_000;

/** Max job description text accepted by generate/regenerate APIs. */
export const JOB_DESCRIPTION_MAX_CHARS = 15_000;

type PreparedResumeText = {
  text: string;
  truncated: boolean;
  originalLength: number;
};

/** Collapse PDF/OCR noise: repeated spaces, excessive blank lines, null bytes. */
export function normalizeResumeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\0/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Normalize then cap length, preferring a paragraph boundary when truncating. */
export function prepareResumeText(
  text: string,
  maxChars: number = RESUME_TEXT_MAX_CHARS
): PreparedResumeText {
  const normalized = normalizeResumeText(text);
  if (normalized.length <= maxChars) {
    return { text: normalized, truncated: false, originalLength: normalized.length };
  }

  let cut = normalized.slice(0, maxChars);
  const lastPara = cut.lastIndexOf("\n\n");
  if (lastPara > maxChars * 0.7) {
    cut = cut.slice(0, lastPara);
  } else {
    const lastLine = cut.lastIndexOf("\n");
    if (lastLine > maxChars * 0.85) {
      cut = cut.slice(0, lastLine);
    }
  }

  return {
    text: cut.trim(),
    truncated: true,
    originalLength: normalized.length,
  };
}
