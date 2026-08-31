/** Normalize user-selected text for fuzzy matching. */
export function normalizeSearchText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

/**
 * PDF.js text items are often one glyph per absolutely positioned span.
 * Native selection then looks like "P y t h o n" instead of "Python".
 */
export function collapseSpacedGlyphs(text: string): string {
    const normalized = normalizeSearchText(text);
    const parts = normalized.split(" ").filter(Boolean);
    if (parts.length >= 2 && parts.every((part) => part.length === 1)) {
        return parts.join("");
    }
    return normalized;
}

/**
 * Flatten LaTeX commands/braces/escapes to the characters a PDF shows,
 * keeping a map back to source indices.
 */
function stripLatexKeepMap(latex: string): { plain: string; map: number[] } {
    const chars: string[] = [];
    const map: number[] = [];
    let i = 0;

    while (i < latex.length) {
        const ch = latex[i];

        if (ch === "\\") {
            const next = latex[i + 1];
            if (next && /[a-zA-Z]/.test(next)) {
                i += 1;
                while (i < latex.length && /[a-zA-Z]/.test(latex[i])) i += 1;
                if (latex[i] === "*") i += 1;
                while (latex[i] === "[") {
                    const close = latex.indexOf("]", i);
                    if (close < 0) break;
                    i = close + 1;
                }
                continue;
            }
            if (next) {
                chars.push(next);
                map.push(i + 1);
                i += 2;
                continue;
            }
        }

        if (ch === "%" && latex[i - 1] !== "\\") {
            const newline = latex.indexOf("\n", i);
            i = newline < 0 ? latex.length : newline;
            continue;
        }

        if (ch === "{" || ch === "}") {
            i += 1;
            continue;
        }

        chars.push(ch);
        map.push(i);
        i += 1;
    }

    return { plain: chars.join(""), map };
}

function matchFromMap(
    map: number[],
    start: number,
    length: number
): { index: number; length: number } | null {
    const from = map[start];
    const to = map[start + length - 1];
    if (from == null || to == null) return null;
    return { index: from, length: to - from + 1 };
}

/**
 * Find the best character index in LaTeX source for plain text selected in the PDF.
 * Tries full phrase first, then longest significant words.
 */
export function findTextInLatex(latex: string, query: string): { index: number; length: number } | null {
    const normalized = collapseSpacedGlyphs(query);
    if (normalized.length < 2 || !latex) return null;

    const lowerLatex = latex.toLowerCase();
    const lowerQuery = normalized.toLowerCase();

    const direct = lowerLatex.indexOf(lowerQuery);
    if (direct >= 0) {
        return { index: direct, length: normalized.length };
    }

    const stripped = stripLatexKeepMap(latex);
    const lowerPlain = stripped.plain.toLowerCase();
    const strippedAt = lowerPlain.indexOf(lowerQuery);
    if (strippedAt >= 0) {
        const mapped = matchFromMap(stripped.map, strippedAt, lowerQuery.length);
        if (mapped) return mapped;
    }

    const words = normalized
        .split(/\s+/)
        .map((w) => w.replace(/[^\w+#.-]/g, ""))
        .filter((w) => w.length >= 3)
        .sort((a, b) => b.length - a.length);

    for (const word of words) {
        const needle = word.toLowerCase();
        const idx = lowerLatex.indexOf(needle);
        if (idx >= 0) {
            return { index: idx, length: word.length };
        }
        const plainIdx = lowerPlain.indexOf(needle);
        if (plainIdx >= 0) {
            const mapped = matchFromMap(stripped.map, plainIdx, word.length);
            if (mapped) return mapped;
        }
    }

    return null;
}

function usedLineHeight(textarea: HTMLTextAreaElement): number {
    const style = window.getComputedStyle(textarea);
    const fontSize = parseFloat(style.fontSize) || 14;
    const lineHeight = style.lineHeight;
    if (lineHeight.endsWith("px")) {
        const px = parseFloat(lineHeight);
        if (Number.isFinite(px) && px > 0) return px;
    }
    const numeric = parseFloat(lineHeight);
    if (Number.isFinite(numeric) && numeric > 0) {
        // Unitless `1.6` must be multiplied; a raw `22` is already px-like.
        return numeric < 8 ? numeric * fontSize : numeric;
    }
    return fontSize * 1.6;
}

/** Scroll a textarea so the character at `index` is visible and briefly select it. */
export function scrollTextareaToMatch(
    textarea: HTMLTextAreaElement,
    index: number,
    length: number
): void {
    if (index < 0) return;

    const text = textarea.value;
    const safeLength = Math.max(0, Math.min(length, text.length - index));

    textarea.focus();
    textarea.setSelectionRange(index, index + safeLength);

    const before = text.slice(0, index);
    const lineNumber = before.split("\n").length - 1;
    const paddingTop = parseFloat(window.getComputedStyle(textarea).paddingTop) || 0;
    const targetTop = lineNumber * usedLineHeight(textarea) + paddingTop - textarea.clientHeight / 3;

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
