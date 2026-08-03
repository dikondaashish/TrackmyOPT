import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { CookieConsent } from '@/components/CookieConsent';
import { Toaster } from '@/components/ui/toaster';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';
import { siteIdentityGraph } from '@/lib/seo-schemas';
import { PORTAL_ROOT_ID } from '@/lib/portal-root';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com'),
  title: {
    default: 'OPT Tracker & H-1B Finder for F-1 Students | TrackMyOPT',
    template: '%s | TrackMyOPT',
  },
  description: 'Track OPT deadlines, monitor unemployment days, find H-1B sponsors, and build AI resumes. Free forever — trusted by 2,500+ F-1 students. Start now.',
  keywords: ['F1 Visa', 'OPT Tracker', 'STEM OPT Calculator', 'H1B Sponsors', 'International Student Jobs', 'USCIS Case Status', 'AI Resume Builder', 'OPT processing time 2026', '90 day rule OPT'],
  authors: [{ name: 'Zyene Inc' }],
  creator: 'Zyene Inc',
  publisher: 'Zyene Inc',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/TrackMyOPT Logo/Favicon.png',
    shortcut: '/TrackMyOPT Logo/Favicon.png',
    apple: '/TrackMyOPT Logo/Favicon.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'TrackMyOPT',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'OPT Timeline Tracker & H-1B Finder for F-1 Students',
    description: 'Track OPT deadlines, monitor unemployment days, find H-1B sponsors, and build AI resumes. Free forever — trusted by 2,500+ F-1 students.',
    url: 'https://www.trackmyopt.com',
    siteName: 'TrackMyOPT',
    images: [
      {
        url: '/og-image.png',
        width: 1376,
        height: 768,
        alt: 'TrackMyOPT Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackMyOPT - The #1 App for F-1 Students',
    description: 'Track OPT deadlines, find H-1B jobs, and secure your future. Join thousands of students tackling their American Dream.',
    creator: '@trackmyopt',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-4262248775973692',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://deknauqkqqzwuvopqott.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://randomuser.me" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="https://randomuser.me" />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
          <SpeedInsights />
          <CookieConsent />
          <Toaster />
        </ThemeProvider>
        <div id={PORTAL_ROOT_ID} />
        {/*
          Site-wide identity graph (Organization / WebSite / SoftwareApplication).
          Rendered on every page from the single definition in lib/seo-schemas.ts,
          so the `@id` references used by the page-level schemas — Service
          `provider`, Article `publisher`, WebPage `about` — all resolve.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeSerializeJsonLd(siteIdentityGraph) ?? '',
          }}
        />
      </body>
    </html>
  );
}
