const LABEL_PATTERNS = [
    /(?:^|\n)\s*(?:job\s*)?title\s*[:\-–—]\s*(.+)/i,
    /(?:^|\n)\s*role\s*[:\-–—]\s*(.+)/i,
    /(?:^|\n)\s*position\s*[:\-–—]\s*(.+)/i,
    /(?:^|\n)\s*job\s+position\s*[:\-–—]\s*(.+)/i,
    /(?:^|\n)\s*opening\s*[:\-–—]\s*(.+)/i,
    /(?:^|\n)\s*vacancy\s*[:\-–—]\s*(.+)/i,
    /(?:^|\n)\s*requisition\s*[:\-–—]\s*(.+)/i,
];

const FILENAME_PATTERN = /\.(pdf|docx?|txt|rtf)$/i;

/** True when the value looks like an uploaded file name, not a job title. */
export function isLikelyFilename(value: string): boolean {
    const trimmed = value.trim();
    return FILENAME_PATTERN.test(trimmed) || /^[\w.-]+\.(pdf|docx?|txt)$/i.test(trimmed);
}

/** Strip company suffix from titles like "Senior Data Analyst at Acme Corp". */
export function normalizeRoleTitle(title: string): string {
    const trimmed = title.trim();
    if (!trimmed) return "";

    const atMatch = trimmed.match(/^(.+?)\s+at\s+.+/i);
    if (atMatch?.[1]) {
        return atMatch[1].trim();
    }

    return trimmed.split("\n")[0]?.trim() ?? trimmed;
}

function cleanExtractedLine(line: string): string {
    return line
        .replace(/\s*[|\-–—]\s*.+$/, "") // "Title | Company" or "Title - Location"
        .replace(/\s*\(.+\)\s*$/, "") // trailing parenthetical
        .trim();
}

function looksLikeJobTitle(line: string): boolean {
    if (!line || line.length > 120) return false;
    if (/^(about|company|description|requirements|qualifications|responsibilities)\b/i.test(line)) {
        return false;
    }
    // Avoid full sentences / paragraphs.
    if ((line.match(/[.!?]/g) ?? []).length > 1) return false;
    return true;
}

/**
 * Extract a human-readable job title from pasted job description text.
 */
export function extractJobTitle(jobDescription: string): string | null {
    const text = jobDescription.trim();
    if (!text) return null;

    for (const pattern of LABEL_PATTERNS) {
        const match = text.match(pattern);
        const raw = match?.[1]?.split("\n")[0]?.trim();
        if (raw) {
            const cleaned = cleanExtractedLine(raw);
            if (looksLikeJobTitle(cleaned)) {
                return normalizeRoleTitle(cleaned);
            }
        }
    }

    // First non-empty line is often the title on LinkedIn / Indeed postings.
    const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean);
    if (firstLine && looksLikeJobTitle(firstLine)) {
        return normalizeRoleTitle(cleanExtractedLine(firstLine));
    }

    return null;
}

/**
 * Prefer JD extraction, then stored title (unless it is a filename).
 */
export function resolveJobTitle(
    storedTitle: string | null | undefined,
    jobDescription: string
): string {
    const fromDescription = extractJobTitle(jobDescription);
    if (fromDescription) return fromDescription;

    if (storedTitle && !isLikelyFilename(storedTitle)) {
        return normalizeRoleTitle(storedTitle);
    }

    return "";
}
