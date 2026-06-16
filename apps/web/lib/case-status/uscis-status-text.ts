/** Strip HTML / UI artifacts from USCIS status description text. */
export function sanitizeUscisDescription(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/^\s*"?\^?\s*more"?\s*$/gim, "")
    .replace(/^\s*"?\^?\s*less"?\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function normalizeStatusCompareText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
