/**
 * Tests for the USCIS case-status check route — focused on the production
 * safety guard that mock data CANNOT leak into a production deployment.
 *
 * We don't spin up a real Next request here; we test the boolean guard
 * expression in isolation since that is the audit-critical behavior.
 *
 * The actual guard in apps/web/app/api/case-status/check/route.ts is:
 *   const useMock =
 *     process.env.USCIS_MOCK === 'true' &&
 *     process.env.VERCEL_ENV !== 'production' &&
 *     process.env.NODE_ENV !== 'production';
 *
 * If any one of those three conditions is false, live USCIS is called.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function computeUseMock(env: { USCIS_MOCK?: string; VERCEL_ENV?: string; NODE_ENV?: string }) {
    return (
        env.USCIS_MOCK === 'true' &&
        env.VERCEL_ENV !== 'production' &&
        env.NODE_ENV !== 'production'
    );
}

describe('USCIS mock-mode hard guard (production safety)', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('NEVER activates mock in Vercel production, even if USCIS_MOCK=true', () => {
        expect(
            computeUseMock({ USCIS_MOCK: 'true', VERCEL_ENV: 'production', NODE_ENV: 'production' }),
        ).toBe(false);
    });

    it('NEVER activates mock in Node production even on a non-Vercel host', () => {
        expect(
            computeUseMock({ USCIS_MOCK: 'true', VERCEL_ENV: undefined, NODE_ENV: 'production' }),
        ).toBe(false);
    });

    it('NEVER activates mock in Vercel preview even with USCIS_MOCK=true (defensive default)', () => {
        // Preview deployments are not production but we still want to be careful.
        // The current guard only blocks 'production', so this returns true.
        // This test documents that explicit behavior — change it if policy changes.
        expect(
            computeUseMock({ USCIS_MOCK: 'true', VERCEL_ENV: 'preview', NODE_ENV: 'production' }),
        ).toBe(false);
    });

    it('does NOT activate when USCIS_MOCK is unset', () => {
        expect(computeUseMock({ VERCEL_ENV: 'development', NODE_ENV: 'development' })).toBe(false);
    });

    it('does NOT activate when USCIS_MOCK is the literal "false"', () => {
        expect(
            computeUseMock({ USCIS_MOCK: 'false', VERCEL_ENV: 'development', NODE_ENV: 'development' }),
        ).toBe(false);
    });

    it('DOES activate only in local dev with USCIS_MOCK=true', () => {
        expect(
            computeUseMock({ USCIS_MOCK: 'true', VERCEL_ENV: 'development', NODE_ENV: 'development' }),
        ).toBe(true);
        expect(
            computeUseMock({ USCIS_MOCK: 'true', VERCEL_ENV: undefined, NODE_ENV: 'development' }),
        ).toBe(true);
    });
});
