export const JOB_DESCRIPTION_MAX_LENGTH = 15_000;
export const SALARY_TEXT_MAX_LENGTH = 300;

const BLOCK_TAG_RE = /<\/?(?:address|article|aside|blockquote|div|dl|dt|dd|fieldset|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi;
const HTML_TAG_RE = /<\/?[a-z][^>]*>/gi;
const SCRIPT_OR_STYLE_RE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#')) {
      const hex = code[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (Number.isFinite(point) && point > 0 && point <= 0x10ffff) {
        try { return String.fromCodePoint(point); } catch { return entity; }
      }
      return entity;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });
}

/** Convert untrusted posting markup into bounded plain text for persistence. */
function normalizeJobSnapshotText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const plainText = decodeHtmlEntities(
    value
      .replace(SCRIPT_OR_STYLE_RE, '')
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(BLOCK_TAG_RE, '\n')
      .replace(HTML_TAG_RE, ' '),
  )
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
  return plainText ? plainText.slice(0, maxLength) : null;
}

export function normalizeJobSnapshot(input: {
  salaryText?: unknown;
  jobDescription?: unknown;
}): { salaryText: string | null; jobDescription: string | null } {
  return {
    salaryText: normalizeJobSnapshotText(input.salaryText, SALARY_TEXT_MAX_LENGTH),
    jobDescription: normalizeJobSnapshotText(input.jobDescription, JOB_DESCRIPTION_MAX_LENGTH),
  };
}
