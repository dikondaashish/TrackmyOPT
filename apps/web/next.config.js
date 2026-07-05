/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://va.vercel-scripts.com https://api.indexnow.org",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://api.indexnow.org https://us.i.posthog.com https://us-assets.i.posthog.com",
      "frame-src 'self' blob: data: https://*.s3.amazonaws.com https://all-in-one-career-ashish.s3.us-east-1.amazonaws.com https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://pagead2.googlesyndication.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  productionBrowserSourceMaps: process.env.POSTHOG_SOURCEMAPS_ENABLED === "true",
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

      // ── Old search URL → answers ─────────────────────────────────────────────
      // /search was indexed by Google from schema.org SearchAction (including
      // literal ?q={search_term_string}). The site uses /answers.
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

if (
  process.env.POSTHOG_SOURCEMAPS_ENABLED === "true" &&
  process.env.POSTHOG_PERSONAL_API_KEY &&
  process.env.POSTHOG_PROJECT_ID
) {
  try {
    const { withPostHogConfig } = require("@posthog/nextjs-config");
    wrappedConfig = withPostHogConfig(nextConfig, {
      personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
      envId: process.env.POSTHOG_PROJECT_ID,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
      sourcemaps: {
        enabled: true,
        deleteAfterUpload: true,
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
