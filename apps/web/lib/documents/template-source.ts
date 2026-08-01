import fs from 'fs';
import path from 'path';
import { RESUME_TEMPLATES } from './templates';

/**
 * Resolves a template id to its LaTeX source on disk.
 *
 * The templates live under apps/web/templates/latex. Depending on where the
 * Next.js server is started from, process.cwd() is either the app directory or
 * the repo root, so both roots are probed.
 */
const TEMPLATE_ROOTS = ['templates/latex', 'apps/web/templates/latex'];

export const FALLBACK_TEMPLATE_ID = 'modern';

export function isKnownTemplateId(templateId: string): boolean {
    return RESUME_TEMPLATES.some((t) => t.id === templateId);
}

function readTemplateFile(templateId: string): string | null {
    // Guard against path traversal — only ever resolve ids we ship.
    if (!isKnownTemplateId(templateId)) return null;

    for (const root of TEMPLATE_ROOTS) {
        const candidate = path.join(process.cwd(), root, `${templateId}.tex`);
        if (fs.existsSync(candidate)) {
            return fs.readFileSync(candidate, 'utf-8');
        }
    }
    return null;
}

export type LoadedTemplate = {
    /** The id whose source was actually loaded (may be the fallback). */
    id: string;
    tex: string;
    usedFallback: boolean;
};

const ACCENT_RULE = /\\definecolor\{accent\}\{HTML\}\{[0-9A-Fa-f]{6}\}/;

/** Validates a 6-digit hex accent, without the leading '#'. */
export function normalizeAccentHex(hex: string | null | undefined): string | null {
    if (!hex) return null;
    const cleaned = hex.replace(/^#/, '').toUpperCase();
    return /^[0-9A-F]{6}$/.test(cleaned) ? cleaned : null;
}

/**
 * Swaps the template's accent colour. Every template declares exactly one
 * `\definecolor{accent}{HTML}{...}` rule that drives its headings and rules,
 * so this is the only substitution needed to recolour a template.
 */
export function applyAccentHex(tex: string, hex: string | null): string {
    const accent = normalizeAccentHex(hex);
    if (!accent) return tex;
    return tex.replace(ACCENT_RULE, `\\definecolor{accent}{HTML}{${accent}}`);
}

/**
 * Loads a template's LaTeX source, falling back to the default template when
 * the requested id is unknown or its file is missing.
 */
export function loadTemplateSource(
    templateId: string,
    accentHex?: string | null
): LoadedTemplate | null {
    const direct = readTemplateFile(templateId);
    if (direct) {
        return { id: templateId, tex: applyAccentHex(direct, accentHex ?? null), usedFallback: false };
    }

    const fallback = readTemplateFile(FALLBACK_TEMPLATE_ID);
    if (fallback) {
        return {
            id: FALLBACK_TEMPLATE_ID,
            tex: applyAccentHex(fallback, accentHex ?? null),
            usedFallback: true,
        };
    }
    return null;
}
