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
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://api.indexnow.org",
      "frame-src 'self' blob: data: https://*.s3.amazonaws.com https://all-in-one-career-ashish.s3.us-east-1.amazonaws.com https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://pagead2.googlesyndication.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
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
      }
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
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

module.exports = nextConfig;
