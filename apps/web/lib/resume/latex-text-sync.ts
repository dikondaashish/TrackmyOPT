/** Normalize user-selected text for fuzzy matching. */
export function normalizeSearchText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

/**
 * Find the best character index in LaTeX source for plain text selected in the PDF.
 * Tries full phrase first, then longest significant words.
 */
export function findTextInLatex(latex: string, query: string): { index: number; length: number } | null {
    const normalized = normalizeSearchText(query);
    if (normalized.length < 2 || !latex) return null;

    const lowerLatex = latex.toLowerCase();
    const lowerQuery = normalized.toLowerCase();

    const direct = lowerLatex.indexOf(lowerQuery);
    if (direct >= 0) {
        return { index: direct, length: normalized.length };
    }

    const words = normalized
        .split(/\s+/)
        .map((w) => w.replace(/[^\w+#.-]/g, ""))
        .filter((w) => w.length >= 3)
        .sort((a, b) => b.length - a.length);

    for (const word of words) {
        const idx = lowerLatex.indexOf(word.toLowerCase());
        if (idx >= 0) {
            return { index: idx, length: word.length };
        }
    }

    return null;
}

/** Scroll a textarea so the character at `index` is visible and briefly select it. */
export function scrollTextareaToMatch(
    textarea: HTMLTextAreaElement,
    index: number,
    length: number
): void {
    if (index < 0) return;

    const text = textarea.value;
    const safeLength = Math.min(length, text.length - index);

    textarea.focus();
    textarea.setSelectionRange(index, index + safeLength);

    const before = text.slice(0, index);
    const lineNumber = before.split("\n").length - 1;
    const style = window.getComputedStyle(textarea);
    const lineHeight =
        parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.6 || 22;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const targetTop = lineNumber * lineHeight + paddingTop - textarea.clientHeight / 3;

    textarea.scrollTop = Math.max(0, targetTop);
}

/** Read the current selection from a textarea (min 2 chars). */
export function getTextareaSelection(textarea: HTMLTextAreaElement): string | null {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return null;
    const selected = textarea.value.slice(start, end);
    const normalized = normalizeSearchText(selected);
    return normalized.length >= 2 ? normalized : null;
}
