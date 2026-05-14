/**
 * Server-side instrumentation (Next.js boot hook).
 *
 * Runs once per server-process startup. Use for:
 *  - Lazy server-only setup (PostHog Node client, OpenTelemetry, etc.).
 *  - Boot-time validation (env-var sanity check).
 *
 * Note: instrumentation-client.ts handles the browser-side counterpart.
 */

export async function register() {
    // Only run on Node runtime, not Edge.
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

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
