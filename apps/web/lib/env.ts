/**
 * Environment-variable schemas and validators.
 *
 * Why this file:
 *  - Catch missing/invalid env vars early with friendly errors.
 *  - Keep secrets off the client (only `NEXT_PUBLIC_*` is exposed).
 *  - Provide a single source of truth for "what env vars does the server expect".
 *
 * Usage:
 *  - Client code: `import { clientEnv } from '@/lib/env'`
 *  - Server code: `import { serverEnv } from '@/lib/env'` (validated lazily)
 *  - One-off legacy call sites: `getServerSideEnv()` still works.
 *
 * Design notes:
 *  - All non-NEXT_PUBLIC entries are server-only. Importing `serverEnv` from a
 *    client component is a build error in Next because `process.env.X` is
 *    inlined only at build time on the server.
 *  - Most vars are .optional() so the app still boots in partial environments
 *    (preview deploys, local dev without full integration secrets). The
 *    individual feature paths still throw a clear error if their secret is
 *    actually missing when invoked.
 */

import { z } from 'zod';

// ---------- Client (browser-safe) ----------

const clientEnvSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    NEXT_PUBLIC_VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
    NEXT_PUBLIC_USCIS_MOCK: z.enum(['true', 'false']).optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

function readClientEnv(): ClientEnv {
    const parsed = clientEnvSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
        NEXT_PUBLIC_USCIS_MOCK: process.env.NEXT_PUBLIC_USCIS_MOCK,
    });

    if (!parsed.success) {
        const issues = parsed.error.flatten().fieldErrors;
        console.error('❌ Invalid client environment variables:', issues);
        throw new Error(
            'Invalid client environment variables: ' + JSON.stringify(issues, null, 2),
        );
    }
    return parsed.data;
}

/**
 * Browser-safe env values. Reading on the server is also safe.
 */
export const clientEnv: ClientEnv = readClientEnv();

// ---------- Server (private) ----------

const serverEnvSchema = clientEnvSchema.extend({
    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_DB_PASSWORD: z.string().optional(),

    // JWT / extension auth
    JWT_SIGNING_SECRET: z
        .string()
        .min(32, 'JWT_SIGNING_SECRET must be at least 32 chars'),

    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // External services
    GEMINI_API_KEY: z.string().optional(),

    // AWS S3 / Textract
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),

    // SMTP / email
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().regex(/^\d+$/).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_PASS: z.string().optional(), // legacy alias

    // Cron / internal secrets
    CRON_SECRET: z.string().min(8).optional(),
    API_SECRET_KEY: z.string().min(8).optional(),
    SEO_PING_SECRET: z.string().min(8).optional(),
    INDEXNOW_KEY: z.string().optional(),
    EMAIL_LINK_SIGNING_SECRET: z.string().min(16).optional(),

    // USCIS API
    USCIS_CLIENT_ID: z.string().optional(),
    USCIS_CLIENT_SECRET: z.string().optional(),
    USCIS_TOKEN_URL: z.string().url().optional(),
    USCIS_API_BASE_URL: z.string().url().optional(),
    USCIS_MOCK: z.enum(['true', 'false']).optional(),

    // Upstash Redis (rate limiting)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // PostHog server
    POSTHOG_KEY: z.string().optional(),
    POSTHOG_HOST: z.string().optional(),

    // Misc Vercel-provided
    VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;

function readServerEnv(): ServerEnv {
    if (typeof window !== 'undefined') {
        throw new Error('serverEnv can only be accessed from server-side code.');
    }
    if (cachedServerEnv) return cachedServerEnv;

    const raw: Record<string, string | undefined> = {};
    // Pluck only the keys the schema knows about; ignore the rest.
    for (const key of Object.keys(serverEnvSchema.shape)) {
        raw[key] = process.env[key];
    }

    const parsed = serverEnvSchema.safeParse(raw);
    if (!parsed.success) {
        const issues = parsed.error.flatten().fieldErrors;
        console.error('❌ Invalid server environment variables:', issues);
        throw new Error(
            'Invalid server environment variables: ' + JSON.stringify(issues, null, 2),
        );
    }
    cachedServerEnv = parsed.data;
    return cachedServerEnv;
}

/**
 * Lazy proxy for server env. Throws on first read if invalid.
 * Use as: `serverEnv.STRIPE_SECRET_KEY`.
 */
export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
    get(_t, prop) {
        const env = readServerEnv();
        // @ts-expect-error indexed access intentional
        return env[prop];
    },
});

/**
 * Legacy accessor — preserved so existing imports of `getServerSideEnv()`
 * keep working without modification.
 */
export function getServerSideEnv(): ServerEnv {
    return readServerEnv();
}

/**
 * Assert that the given env var(s) are present. Throws a clear error referencing
 * the feature that needs them. Use inside route handlers / service factories.
 *
 * Example:
 *   requireEnv('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET')
 */
export function requireEnv<K extends keyof ServerEnv>(...keys: K[]): void {
    const env = readServerEnv();
    const missing = keys.filter((k) => !env[k]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`,
        );
    }
}
