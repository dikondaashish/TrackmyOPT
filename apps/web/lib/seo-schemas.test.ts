import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
    SITE_URL,
    siteIdentityGraph,
    landingPageSchemas,
    organizationSchema,
    websiteSchema,
    softwareApplicationSchema,
} from './seo-schemas';

/**
 * These schemas form one graph: page-level nodes point at the site-identity
 * nodes by `@id`. A reference that names a node nobody emits is invisible to a
 * crawler, and so is an image URL that 404s — both fail silently in production,
 * which is exactly why they are asserted here.
 */

type Json = Record<string, unknown>;

/** Every `@id` value that appears anywhere in `value`. */
function collectIds(value: unknown, out: Set<string> = new Set()): Set<string> {
    if (Array.isArray(value)) {
        for (const item of value) collectIds(item, out);
    } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value as Json)) {
            if (key === '@id' && typeof child === 'string') out.add(child);
            else collectIds(child, out);
        }
    }
    return out;
}

/** `@id` values that are node *definitions* — i.e. sit next to an `@type`. */
function collectDefinedIds(value: unknown, out: Set<string> = new Set()): Set<string> {
    if (Array.isArray(value)) {
        for (const item of value) collectDefinedIds(item, out);
    } else if (value && typeof value === 'object') {
        const node = value as Json;
        if (typeof node['@id'] === 'string' && typeof node['@type'] === 'string') {
            out.add(node['@id'] as string);
        }
        for (const child of Object.values(node)) collectDefinedIds(child, out);
    }
    return out;
}

function collectUrls(value: unknown, out: string[] = []): string[] {
    if (Array.isArray(value)) {
        for (const item of value) collectUrls(item, out);
    } else if (value && typeof value === 'object') {
        for (const child of Object.values(value as Json)) collectUrls(child, out);
    } else if (typeof value === 'string' && value.startsWith(SITE_URL)) {
        out.push(value);
    }
    return out;
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

describe('site identity graph', () => {
    it('defines the three nodes the rest of the graph points at', () => {
        const defined = collectDefinedIds(siteIdentityGraph);
        expect(defined).toContain(`${SITE_URL}/#organization`);
        expect(defined).toContain(`${SITE_URL}/#website`);
        expect(defined).toContain(`${SITE_URL}/#application`);
    });

    it('drops the per-node @context so the graph has exactly one', () => {
        expect(siteIdentityGraph['@context']).toBe('https://schema.org');
        for (const node of siteIdentityGraph['@graph']) {
            expect(node).not.toHaveProperty('@context');
        }
    });
});

describe('@id references resolve', () => {
    // What a crawler actually receives on the landing page: the identity graph
    // from the root layout plus the page-level schemas from app/page.tsx.
    const rendered = [siteIdentityGraph, ...landingPageSchemas];

    it('leaves no dangling reference in what the page renders', () => {
        const referenced = collectIds(rendered);
        const defined = collectDefinedIds(rendered);

        const dangling = [...referenced].filter((id) => !defined.has(id));
        expect(dangling).toEqual([]);
    });

    it('would catch the identity graph going missing', () => {
        // Guards the actual regression: page-level schemas alone leave the
        // Organization / SoftwareApplication references unresolved.
        const referenced = collectIds(landingPageSchemas);
        const defined = collectDefinedIds(landingPageSchemas);
        const dangling = [...referenced].filter((id) => !defined.has(id));

        expect(dangling).toContain(`${SITE_URL}/#organization`);
    });
});

describe('asset URLs', () => {
    const identityUrls = collectUrls([
        organizationSchema,
        websiteSchema,
        softwareApplicationSchema,
    ]);

    it('never emits a raw space in a URL', () => {
        for (const url of identityUrls) {
            expect(url, `${url} must percent-encode spaces`).not.toMatch(/ /);
        }
    });

    it('is parseable as a URL', () => {
        for (const url of identityUrls) {
            expect(() => new URL(url)).not.toThrow();
        }
    });

    it('points every image at a file that exists in public/', () => {
        const imageUrls = [
            organizationSchema.logo.url,
            organizationSchema.image,
            softwareApplicationSchema.screenshot,
        ];

        for (const url of imageUrls) {
            const rel = decodeURIComponent(new URL(url).pathname).replace(/^\//, '');
            expect(
                existsSync(path.join(PUBLIC_DIR, rel)),
                `${url} has no matching file at public/${rel}`
            ).toBe(true);
        }
    });

    it('declares the logo dimensions Google requires for Organization', () => {
        expect(organizationSchema.logo.width).toBeGreaterThanOrEqual(112);
        expect(organizationSchema.logo.height).toBeGreaterThanOrEqual(112);
    });
});

describe('facts stay consistent across nodes', () => {
    it('uses one origin everywhere', () => {
        expect(organizationSchema.url).toBe(SITE_URL);
        expect(websiteSchema.url).toBe(SITE_URL);
        expect(softwareApplicationSchema.url).toBe(SITE_URL);
    });

    it('names the same publisher from WebSite and SoftwareApplication', () => {
        expect(websiteSchema.publisher['@id']).toBe(organizationSchema['@id']);
        expect(softwareApplicationSchema.author['@id']).toBe(organizationSchema['@id']);
        expect(softwareApplicationSchema.publisher['@id']).toBe(organizationSchema['@id']);
    });
});
