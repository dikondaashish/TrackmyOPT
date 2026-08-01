import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RESUME_TEMPLATES } from '@/lib/documents/templates';

/**
 * The Chrome extension renders its own template dropdown from a hardcoded
 * SIDE_PANEL_TEMPLATES list, because it cannot import from the web app's
 * bundle. The ids in that list are sent to /api/resume-generator/generate and
 * resolved to a .tex file, so an id that drifts out of sync silently falls back
 * to the default template — and a stale *name* misdescribes the template to the
 * user. This test fails when the two lists diverge.
 */
const EXTENSION_SOURCE = path.resolve(
    process.cwd(),
    '../extension/src/agent/panel-templates.ts'
);

function parseSidePanelTemplates(): Array<{ id: string; name: string; hint: string }> {
    const source = fs.readFileSync(EXTENSION_SOURCE, 'utf-8');
    const block = source.match(/RESUME_TEMPLATES_FOR_PANEL = \[([\s\S]*?)\] as const;/);
    if (!block) throw new Error('RESUME_TEMPLATES_FOR_PANEL not found in the extension source');

    return [...block[1].matchAll(
        /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*hint:\s*'([^']+)'\s*\}/g
    )].map((m) => ({ id: m[1], name: m[2], hint: m[3] }));
}

describe('extension template list stays in sync with the web app', () => {
    const sidePanel = parseSidePanelTemplates();

    it('parses the extension list', () => {
        expect(sidePanel.length).toBeGreaterThan(0);
    });

    it('offers exactly the same template ids', () => {
        expect([...sidePanel.map((t) => t.id)].sort()).toEqual(
            [...RESUME_TEMPLATES.map((t) => t.id)].sort()
        );
    });

    it('uses the same display name for each template', () => {
        for (const entry of sidePanel) {
            const canonical = RESUME_TEMPLATES.find((t) => t.id === entry.id);
            expect(canonical, `unknown template id "${entry.id}"`).toBeDefined();
            expect(entry.name, `name for "${entry.id}"`).toBe(canonical!.name);
        }
    });

    it('does not claim only some templates are ATS-safe', () => {
        // Every shipped template is single-column and ATS-safe; the old list
        // labelled only two of them that way, implying the rest were not.
        for (const entry of sidePanel) {
            expect(entry.hint, `hint for "${entry.id}"`).toContain('ATS-safe');
        }
    });

    it('defaults to a template the web app also ships', () => {
        // The first option is preselected in the extension dropdown.
        expect(RESUME_TEMPLATES.some((t) => t.id === sidePanel[0].id)).toBe(true);
    });
});
