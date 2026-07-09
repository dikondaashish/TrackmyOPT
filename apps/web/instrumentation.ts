/**
 * Server-side instrumentation (Next.js boot hook).
 *
 * Runs once per server-process startup. Use for:
 *  - Lazy server-only setup (PostHog Node client, OpenTelemetry, etc.).
 *  - Boot-time validation (env-var sanity check).
 *
 * Note: instrumentation-client.ts handles the browser-side counterpart.
 */

import { sanitize } from './lib/secure-logger';

let consoleRedactionInstalled = false;

/**
 * Wrap console.log/info/warn/error so every server-side log is sanitized
 * through secure-logger's redact() before emission. This closes the gap where
 * routes call raw console.* and bypass the redaction layer. The original
 * console is preserved; only the arguments are sanitized. Idempotent.
 */
function installRedactingConsole() {
    if (consoleRedactionInstalled) return;
    consoleRedactionInstalled = true;

    const orig = console;
    const methods = ['log', 'info', 'warn', 'error'] as const;

    for (const method of methods) {
        const original = orig[method].bind(orig);
        (orig as unknown as Record<string, unknown>)[method] = (
            ...args: unknown[]
        ) => {
            original(...args.map((arg) => sanitize(arg)));
        };
    }
}

export async function register() {
    // Only run on Node runtime, not Edge.
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    // Make PII/secret redaction load-bearing for the ENTIRE server process, not
    // just the routes that remember to call secureLog. Most API routes still use
    // raw console.*, which bypasses secure-logger entirely. Wrapping the global
    // console at boot sanitizes every call (the secure path's own sanitize() is
    // reused, so redaction logic stays in one place). Idempotent + safe: the
    // original console is preserved and only the args are sanitized first.
    installRedactingConsole();

    // Validate critical env vars at boot so misconfig fails loudly here
    // instead of inside a request handler.
    try {
        // Importing serverEnv triggers the zod parse (lazy proxy).
        const { serverEnv } = await import('./lib/env');
        void serverEnv.NEXT_PUBLIC_SUPABASE_URL; // touch one field to force resolution
        if (process.env.NODE_ENV !== 'test') {
            console.info('[instrumentation] env validated');
        }
    } catch (err) {
        // We deliberately do not crash the server here — partial-env preview
        // deploys still need to render the marketing pages.
        console.error('[instrumentation] env validation failed:', err);
    }
}
