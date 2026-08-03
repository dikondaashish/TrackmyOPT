import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * An analytics helper that nothing calls is invisible: it type-checks, it
 * lints clean, and the funnel it was written for silently has no data. That is
 * how `onboarding_completed` went missing — every other step of the onboarding
 * funnel was wired, so the gap only showed as a flat line in PostHog.
 *
 * This asserts every capture helper is actually reachable from app code.
 * Helpers marked `@deprecated` are exempt: `captureCheckoutStarted` is an
 * intentional no-op because `checkout_started` is emitted server-side.
 */

const WEB_ROOT = path.join(__dirname, '..');
const CLIENT_MODULE = path.join('lib', 'posthog-client.ts');
const SEARCH_ROOTS = ['app', 'components', 'hooks', 'lib', 'store'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.turbo', 'coverage', 'dist']);

type Helper = { name: string; deprecated: boolean };

function exportedCaptureHelpers(source: string): Helper[] {
    const helpers: Helper[] = [];
    const pattern = /export\s+(?:async\s+)?function\s+(capture[A-Za-z0-9_]*)\s*\(/g;

    for (const match of source.matchAll(pattern)) {
        // The doc comment attached to this declaration is the one that ends
        // closest above it, with no other declaration in between.
        const preceding = source.slice(0, match.index);
        const commentStart = preceding.lastIndexOf('/**');
        const commentEnd = preceding.lastIndexOf('*/');
        const attached =
            commentStart !== -1 &&
            commentEnd > commentStart &&
            !preceding.slice(commentEnd).includes('}');

        helpers.push({
            name: match[1],
            deprecated: attached && preceding.slice(commentStart, commentEnd).includes('@deprecated'),
        });
    }
    return helpers;
}

/**
 * Every app source file, read once. Spawning a grep per helper made this test
 * flaky under parallel load, so the corpus is built a single time up front.
 */
function loadCorpus(): { file: string; text: string }[] {
    const files: { file: string; text: string }[] = [];

    const walk = (dir: string) => {
        for (const entry of readdirSync(path.join(WEB_ROOT, dir), { withFileTypes: true })) {
            if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
            const rel = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(rel);
            } else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) {
                if (rel === CLIENT_MODULE) continue;
                files.push({ file: rel, text: readFileSync(path.join(WEB_ROOT, rel), 'utf8') });
            }
        }
    };

    for (const root of SEARCH_ROOTS) walk(root);
    return files;
}

const source = readFileSync(path.join(WEB_ROOT, CLIENT_MODULE), 'utf8');
const helpers = exportedCaptureHelpers(source);
const corpus = loadCorpus();

const called = new Set(
    helpers
        .filter((h) => corpus.some(({ text }) => new RegExp(`\\b${h.name}\\b`).test(text)))
        .map((h) => h.name)
);

describe('posthog capture helpers are wired up', () => {
    it('finds the helpers and the app sources to check them against', () => {
        expect(helpers.length).toBeGreaterThan(20);
        expect(helpers.map((h) => h.name)).toContain('captureOnboardingCompleted');
        expect(corpus.length).toBeGreaterThan(100);
    });

    it('has a call site for every non-deprecated helper', () => {
        const orphaned = helpers
            .filter((h) => !h.deprecated && !called.has(h.name))
            .map((h) => h.name);

        expect(
            orphaned,
            `these capture helpers are never called, so their events never fire: ${orphaned.join(', ')}`
        ).toEqual([]);
    });

    it('keeps the onboarding funnel complete end to end', () => {
        // Every step of the wizard funnel must be reachable, or the drop-off
        // report has a hole in it.
        for (const name of [
            'captureOnboardingStepViewed',
            'captureOnboardingStepCompleted',
            'captureOnboardingSkipped',
            'captureOnboardingCompleted',
        ]) {
            expect(called.has(name), `${name} has no call site`).toBe(true);
        }
    });
});
