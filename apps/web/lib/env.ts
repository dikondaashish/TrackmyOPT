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
  NEXT_PUBLIC_EMAIL_LOGO_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_CHROME_EXTENSION_ID: z
    .string()
    .regex(/^[a-p]{32}$/)
    .optional(),
  NEXT_PUBLIC_CHROME_STORE_URL: z.string().url().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_VERCEL_ENV: z
    .enum(['production', 'preview', 'development'])
    .optional(),
  NEXT_PUBLIC_USCIS_MOCK: z.enum(['true', 'false']).optional(),
});

type ClientEnv = z.infer<typeof clientEnvSchema>;

function readClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_EMAIL_LOGO_URL: process.env.NEXT_PUBLIC_EMAIL_LOGO_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    NEXT_PUBLIC_CHROME_EXTENSION_ID:
      process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID,
    NEXT_PUBLIC_CHROME_STORE_URL: process.env.NEXT_PUBLIC_CHROME_STORE_URL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_USCIS_MOCK: process.env.NEXT_PUBLIC_USCIS_MOCK,
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    console.error('❌ Invalid client environment variables:', issues);
    throw new Error(
      'Invalid client environment variables: ' + JSON.stringify(issues, null, 2)
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
  PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY: z
    .string()
    .regex(
      /^[A-Za-z0-9+/]{43}=$/,
      'PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY must be a base64-encoded 32-byte key'
    )
    .optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().startsWith('price_').optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().startsWith('price_').optional(),
  STRIPE_PRICE_PRO_INTRO: z.string().startsWith('price_').optional(),
  STRIPE_PRICE_RESUME_CREDITS_10: z.string().startsWith('price_').optional(),
  STRIPE_PRICE_DEDICATED_MONTHLY: z.string().startsWith('price_').optional(),
  STRIPE_PRICE_DEDICATED_YEARLY: z.string().startsWith('price_').optional(),
  STRIPE_PROMO_CODE_PRO: z.string().optional(),
  STRIPE_PROMO_CODE_DEDICATED: z.string().optional(),

  // Google AI. Vertex AI is the default so Google Cloud startup credits are
  // used. GEMINI_API_KEY is only for an explicit local legacy fallback.
  GOOGLE_GENAI_USE_VERTEXAI: z.enum(['true', 'false']).optional(),
  GOOGLE_CLOUD_PROJECT: z.string().min(1).optional(),
  GOOGLE_CLOUD_LOCATION: z.string().min(1).optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // AWS S3 / Textract
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // SMTP / email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_SECURE: z.enum(['true', 'false']).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  EMAIL_LOGO_URL: z.string().url().optional(),

  // Cron / internal secrets
  CRON_SECRET: z.string().min(8).optional(),
  API_SECRET_KEY: z.string().min(8).optional(),
  SEO_PING_SECRET: z.string().min(8).optional(),
  INDEXNOW_KEY: z.string().optional(),
  /** POST /api/admin/bulk-notification — Bearer secret (server only). */
  ADMIN_SECRET: z.string().min(8).optional(),
  EMAIL_LINK_SIGNING_SECRET: z.string().min(16).optional(),
  CHROME_EXTENSION_IDS: z.string().optional(),
  /** Optional override for partner community OPT timelines API (default opt-tracker.com). */
  COMMUNITY_OPT_API_BASE: z.string().url().optional(),
  /** Optional override for opt-pulse Supabase REST base URL. */
  COMMUNITY_OPT_PULSE_URL: z.string().url().optional(),
  /** Optional override for opt-pulse publishable key. */
  COMMUNITY_OPT_PULSE_KEY: z.string().optional(),

  // USCIS API
  USCIS_CLIENT_ID: z.string().optional(),
  USCIS_CLIENT_SECRET: z.string().optional(),
  USCIS_TOKEN_URL: z.string().url().optional(),
  USCIS_API_BASE_URL: z.string().url().optional(),
  USCIS_MOCK: z.enum(['true', 'false']).optional(),

  // Upstash Redis (rate limiting). Vercel Marketplace injects the KV names.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),

  // PostHog server
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),
  POSTHOG_PROJECT_ID: z.string().optional(),
  POSTHOG_PERSONAL_API_KEY: z.string().optional(),
  POSTHOG_PROJECT_API_KEY: z.string().optional(),
  POSTHOG_SOURCEMAPS_ENABLED: z.enum(['true', 'false']).optional(),
  POSTHOG_SOURCEMAPS_BATCH_SIZE: z.string().regex(/^\d+$/).optional(),

  // Optional upload/OCR/compile providers
  ENABLE_VIRUS_SCAN: z.enum(['true', 'false']).optional(),
  VIRUS_SCANNER: z.enum(['clamav', 'virustotal']).optional(),
  CLAMAV_HOST: z.string().optional(),
  CLAMAV_PORT: z.string().regex(/^\d+$/).optional(),
  VIRUSTOTAL_API_KEY: z.string().optional(),
  OCR_TEXTRACT_ENABLED: z.enum(['true', 'false']).optional(),
  LATEX_COMPILER_URL: z.string().url().optional(),

  // Web Push
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  // Feature/cron controls
  DAILY_UPLOAD_LIMIT: z.string().regex(/^\d+$/).optional(),
  AT_RISK_REENGAGEMENT_ENABLED: z.enum(['true', 'false']).optional(),
  FREE_RECEIPT_REENGAGEMENT_ENABLED: z.enum(['true', 'false']).optional(),
  WELCOME_FREE_RESEND_ENABLED: z.enum(['true', 'false']).optional(),
  POSTHOG_LTV_SYNC_ENABLED: z.enum(['true', 'false']).optional(),
  POSTHOG_PARTNER_GROUPS_SYNC_ENABLED: z.enum(['true', 'false']).optional(),

  // Misc Vercel-provided
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

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
      'Invalid server environment variables: ' + JSON.stringify(issues, null, 2)
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
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
