import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RESUME_TEMPLATES, RESUME_TEMPLATE_SECTION_ORDER } from '@/lib/documents/templates';
import { applyAccentHex, normalizeAccentHex } from '@/lib/documents/template-source';
import { checkAtsCompliance } from '@/lib/validators/ats-checker';

const TEMPLATE_DIR = path.join(process.cwd(), 'templates/latex');

function readTemplate(file: string): string {
    return fs.readFileSync(path.join(TEMPLATE_DIR, file), 'utf-8');
}

/** Shared macro vocabulary every template must expose to the AI. */
const REQUIRED_MACROS = ['\\rRole', '\\rProject', '\\rEdu', '\\rSkill', '{rBullets}'];

describe.each(RESUME_TEMPLATES.map((t) => [t.id, t] as const))(
    'resume template: %s',
    (_id, template) => {
        const tex = readTemplate(template.latexFile);

        it('exists on disk', () => {
            expect(tex.length).toBeGreaterThan(500);
        });

        it('is self-contained — the remote compiler receives one file', () => {
            // Only glyphtounicode (shipped with TeX Live) may be \input.
            const inputs = [...tex.matchAll(/\\input\{([^}]+)\}/g)].map((m) => m[1]);
            expect(inputs).toEqual(inputs.filter((i) => i === 'glyphtounicode'));

            // No project-local style packages (the regression that broke modern.tex).
            expect(tex).not.toMatch(/\\usepackage\{TLCresume\}/);
            for (const pkg of [...tex.matchAll(/\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g)]) {
                for (const name of pkg[1].split(',').map((s) => s.trim())) {
                    // Project-local .sty files would be capitalised/bespoke names.
                    expect(fs.existsSync(path.join(TEMPLATE_DIR, `${name}.sty`))).toBe(false);
                }
            }
        });

        it('is single-column and ATS-parseable', () => {
            expect(tex).not.toMatch(/\\begin\{tabular\}/);
            expect(tex).not.toMatch(/\\begin\{tabularx\}/);
            expect(tex).not.toMatch(/\\begin\{multicols\}/);
            expect(tex).not.toMatch(/\\twocolumn/);
            expect(tex).not.toMatch(/\\begin\{minipage\}/);
            expect(tex).not.toMatch(/\\includegraphics/);
            // Unicode-mapped text layer so parsers extract clean text.
            expect(tex).toContain('\\pdfgentounicode=1');
        });

        it('uses the shared macro vocabulary', () => {
            for (const macro of REQUIRED_MACROS) {
                expect(tex).toContain(macro);
            }
        });

        it('declares sections in recruiter-scan order', () => {
            const sections = [...tex.matchAll(/^\\section\{([^}]+)\}/gm)].map((m) => m[1]);
            // Every declared section must be one the template metadata promises,
            // and they must appear in the canonical order.
            const canonical = RESUME_TEMPLATE_SECTION_ORDER as readonly string[];
            const positions = sections
                .filter((s) => canonical.includes(s))
                .map((s) => canonical.indexOf(s));
            expect(positions).toEqual([...positions].sort((a, b) => a - b));
            // Skills must precede Experience — the 6-second scan requirement.
            expect(sections.indexOf('Skills')).toBeLessThan(sections.indexOf('Experience'));
        });

        it('keeps margins between 0.5in and 1in', () => {
            const geometry = tex.match(/\\usepackage\[([^\]]*)\]\{geometry\}/);
            expect(geometry).not.toBeNull();
            const values = [...geometry![1].matchAll(/(left|right|top|bottom)=([\d.]+)in/g)];
            expect(values.length).toBe(4);
            for (const [, side, raw] of values) {
                const inches = Number(raw);
                expect(inches, `${side} margin`).toBeGreaterThanOrEqual(0.5);
                expect(inches, `${side} margin`).toBeLessThanOrEqual(1);
            }
        });

        it('sets body type between 10pt and 12pt', () => {
            const size = tex.match(/\\documentclass\[[^\]]*?(\d+)pt/);
            expect(size).not.toBeNull();
            expect(Number(size![1])).toBeGreaterThanOrEqual(10);
            expect(Number(size![1])).toBeLessThanOrEqual(12);
        });

        it('passes the app ATS compliance check', () => {
            const result = checkAtsCompliance(tex);
            const blocking = result.issues.filter((i) => i.startsWith('CRITICAL') || i.startsWith('MISSING'));
            expect(blocking).toEqual([]);
        });

        it('exposes a single recolourable accent matching its default swatch', () => {
            const accent = tex.match(/\\definecolor\{accent\}\{HTML\}\{([0-9A-Fa-f]{6})\}/);
            expect(accent).not.toBeNull();
            // The first swatch shown in the picker is what the file already uses,
            // so an unmodified preview matches the default card.
            expect(accent![1].toUpperCase()).toBe(template.colors[0].hex.toUpperCase());

            const recoloured = applyAccentHex(tex, template.colors[template.colors.length - 1].hex);
            expect(recoloured).toContain(
                `\\definecolor{accent}{HTML}{${template.colors[template.colors.length - 1].hex.toUpperCase()}}`
            );
        });

        it('ships demo contact details that are not real people', () => {
            expect(tex).toMatch(/@example\.com/);
            // Reserved fictional US range.
            expect(tex).toMatch(/\(\d{3}\) 555-01\d{2}/);
        });
    }
);

describe('accent hex handling', () => {
    it('accepts valid hex with or without a leading hash', () => {
        expect(normalizeAccentHex('#1f4e79')).toBe('1F4E79');
        expect(normalizeAccentHex('1F4E79')).toBe('1F4E79');
    });

    it('rejects anything that is not a 6-digit hex', () => {
        expect(normalizeAccentHex('red')).toBeNull();
        expect(normalizeAccentHex('12345')).toBeNull();
        expect(normalizeAccentHex('}{\\input{/etc/passwd')).toBeNull();
        expect(normalizeAccentHex(null)).toBeNull();
    });

    it('leaves the template untouched for an invalid accent', () => {
        const tex = readTemplate('modern.tex');
        expect(applyAccentHex(tex, 'nonsense')).toBe(tex);
    });
});
