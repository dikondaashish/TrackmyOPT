/** @type {import('next').NextConfig} */
// 'unsafe-eval' is only needed in dev (Next.js HMR / eval source maps). Drop it
// in production to shrink the XSS attack surface. 'unsafe-inline' stays for now
// because GTM/AdSense and Next's inline bootstrap need it; migrating to nonces
// is a larger follow-up. ponytail: known ceiling — nonce-based script-src.
const isProd = process.env.NODE_ENV === 'production';
const scriptSrc = [
  "script-src 'self' 'unsafe-inline'",
  isProd ? '' : "'unsafe-eval'",
  'https://pagead2.googlesyndication.com https://www.googletagmanager.com https://va.vercel-scripts.com https://api.indexnow.org',
]
  .filter(Boolean)
  .join(' ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://api.indexnow.org https://us.i.posthog.com https://us-assets.i.posthog.com https://us.posthog.com https://www.google-analytics.com https://*.google-analytics.com https://www.google.com https://pagead2.googlesyndication.com",
      "worker-src 'self' blob:",
      "frame-src 'self' blob: data: https://*.s3.amazonaws.com https://all-in-one-career-ashish.s3.us-east-1.amazonaws.com https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://bigdataanalyticspub-sb.uscis.dhs.gov",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  productionBrowserSourceMaps: process.env.POSTHOG_SOURCEMAPS_ENABLED === "true",
  // Sparticuz resolves its compressed Chromium payload at runtime, so static
  // tracing cannot discover these files automatically. Keep the include scoped
  // to the one route that launches Chromium.
  outputFileTracingIncludes: {
    '/api/everify-lookup': [
      './node_modules/@sparticuz/chromium/bin/**/*',
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // ── Canonical: non-www → www ────────────────────────────────────────────
      // Fixes "Redirect error" in Search Console for trackmyopt.com (no www).
      // Note: HTTP → HTTPS is handled by Vercel at the edge; this covers HTTPS
      // non-www only (Vercel routes this through the Next.js app).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'trackmyopt.com' }],
        destination: 'https://www.trackmyopt.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'zyene.com' }],
        destination: 'https://www.trackmyopt.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.zyene.com' }],
        destination: 'https://www.trackmyopt.com/:path*',
        permanent: true,
      },

      // ── Stale indexed URLs (404 / old slugs) ────────────────────────────────
      // These were indexed by Google before pages were renamed; 301 to correct slug.
      {
        source: '/blog/opt-processing-time',
        destination: '/blog/opt-processing-time-2026',
        permanent: true,
      },
      {
        source: '/blog/opt-application-checklist',
        destination: '/blog/opt-application-checklist-2026',
        permanent: true,
      },
      {
        source: '/blog/f1-student-tax-filing-guide',
        destination: '/blog/f1-student-tax-filing-guide-2026',
        permanent: true,
      },
      {
        source: '/blog/opt-health-insurance-guide',
        destination: '/blog/opt-health-insurance-guide-2026',
        permanent: true,
      },
      {
        source: '/blog/ats-resume-international-students',
        destination: '/blog/ats-resume-international-students-2026',
        permanent: true,
      },
      {
        source: '/blog/top-h1b-sponsor-companies',
        destination: '/blog/top-h1b-sponsor-companies-2026',
        permanent: true,
      },
      {
        source: '/blog/opt-unemployment-rules-90-day-limit',
        destination: '/blog/90-day-unemployment-rule-opt',
        permanent: true,
      },
      {
        source: '/blog/opt-job-relevance-letter-guide',
        destination: '/blog/opt-job-related-to-degree',
        permanent: true,
      },
      {
        source: '/blog/answering-sponsorship-questions-interviews',
        destination: '/blog/how-to-answer-sponsorship-question',
        permanent: true,
      },
      {
        source: '/blog/h1b-cap-gap-extension-guide',
        destination: '/blog/h1b-cap-gap-extension',
        permanent: true,
      },
      {
        source: '/blog/opt-taxes-international-students',
        destination: '/blog/f1-student-tax-filing-guide-2026',
        permanent: true,
      },
      {
        source: '/blog/h1b-visa-alternatives-opt-expires',
        destination: '/blog/h1b-alternatives-work-visas',
        permanent: true,
      },
      {
        source: '/blog/h1b-lottery-registration-opt',
        destination: '/answers/what-is-h1b-lottery',
        permanent: true,
      },
      {
        source: '/blog/fall-out-of-f1-status-reinstatement-options',
        destination: '/blog/fall-out-of-f1-status-options',
        permanent: true,
      },

      // ── Old search URL → answers ─────────────────────────────────────────────
      // /search was indexed from the site's former SearchAction markup
      // (including literal ?q={search_term_string}). The site uses /answers.
      {
        source: '/search',
        destination: '/answers',
        permanent: true,
      },

      // ── GSC 404 drilldown (2026-06-29): stale slugs & broken internal links ─
      {
        source: '/community',
        destination: '/features/community',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/auth/sign-up',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/help',
        destination: '/dashboard/help',
        permanent: true,
      },
      {
        source: '/blog/opt-application-denied-guide-2026',
        destination: '/blog/opt-application-denied',
        permanent: true,
      },
      {
        source: '/guides/travel',
        destination: '/blog/can-you-travel-on-opt-complete-guide',
        permanent: true,
      },
      {
        source: '/guides/career',
        destination: '/guides/opt-career',
        permanent: true,
      },
      {
        source: '/resources/h1b-guide',
        destination: '/blog/top-h1b-sponsor-companies-2026',
        permanent: true,
      },
      {
        source: '/blog/top-h1b-sponsor-companies-2026-rankings',
        destination: '/blog/top-h1b-sponsor-companies-2026',
        permanent: true,
      },
      // Malformed URLs from old SearchAction / crawler noise
      {
        source: '/&',
        destination: '/',
        permanent: true,
      },
      {
        source: '/\\$',
        destination: '/',
        permanent: true,
      },

      // ── Consolidate duplicate USCIS tracking guides ───────────────────────
      // Primary URL (35k+ GSC impressions): uscis-case-status-tracking-guide
      {
        source: '/blog/how-to-track-uscis-case-status-guide',
        destination: '/blog/uscis-case-status-tracking-guide',
        permanent: true,
      },
      {
        source: '/blog/can-you-travel-on-opt',
        destination: '/blog/can-you-travel-on-opt-complete-guide',
        permanent: true,
      },
      {
        source: '/blog/form-i983-stem-opt-training-plan-guide',
        destination: '/blog/i-983-training-plan-guide',
        permanent: true,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

// Wrap with @next/bundle-analyzer when ANALYZE=true so `pnpm build` can produce
// an interactive client.html / server.html report under .next/analyze/.
let wrappedConfig = nextConfig;

const { shouldUploadPostHogSourcemaps } = require('./lib/config/posthog-sourcemaps');

if (shouldUploadPostHogSourcemaps()) {
  try {
    const { withPostHogConfig } = require("@posthog/nextjs-config");
    wrappedConfig = withPostHogConfig(nextConfig, {
      personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
      envId: process.env.POSTHOG_PROJECT_ID,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
      sourcemaps: {
        enabled: true,
        deleteAfterUpload: true,
        // Default CLI batch is 50; smaller batches avoid S3 503 SlowDown on large builds.
        batchSize: Number(process.env.POSTHOG_SOURCEMAPS_BATCH_SIZE) || 15,
      },
    });
  } catch (error) {
    console.warn(
      "[next.config] POSTHOG_SOURCEMAPS_ENABLED but @posthog/nextjs-config failed:",
      error instanceof Error ? error.message : error
    );
  }
}

if (process.env.ANALYZE === "true") {
  try {
     
    const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
    wrappedConfig = withBundleAnalyzer(nextConfig);
  } catch {
    // @next/bundle-analyzer not installed — ignore so non-analyze builds aren't blocked.
    console.warn('[next.config] ANALYZE=true but @next/bundle-analyzer is not installed.');
  }
}

module.exports = wrappedConfig;
