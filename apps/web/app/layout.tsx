import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { CookieConsent } from '@/components/CookieConsent';

const GA_ID = 'G-LD9XN0RHXH';

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
  openGraph: {
    title: 'OPT Timeline Tracker & H-1B Finder for F-1 Students',
    description: 'Track OPT deadlines, monitor unemployment days, find H-1B sponsors, and build AI resumes. Free forever — trusted by 2,500+ F-1 students.',
    url: 'https://www.trackmyopt.com',
    siteName: 'TrackMyOPT',
    images: [
      {
        url: '/og-image.png', // We should ensure this exists later
        width: 1200,
        height: 630,
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://deknauqkqqzwuvopqott.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Google Analytics (GA4) — loaded after interactive so it doesn't block LCP */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
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
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "TrackMyOPT",
                "alternateName": "Track My OPT",
                "url": "https://www.trackmyopt.com",
                "logo": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png",
                "description": "The #1 OPT timeline tracker and H-1B sponsor finder for F-1 international students in the United States.",
                "foundingDate": "2025",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "support@trackmyopt.com",
                  "contactType": "customer service",
                  "availableLanguage": "English"
                },
                "sameAs": [
                  "https://twitter.com/trackmyopt",
                  "https://linkedin.com/company/trackmyopt",
                  "https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "TrackMyOPT",
                "alternateName": "Track My OPT",
                "url": "https://www.trackmyopt.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://www.trackmyopt.com/answers?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "TrackMyOPT",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Web, Chrome Extension",
                "url": "https://www.trackmyopt.com",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "127",
                  "bestRating": "5"
                }
              }
            ])
          }}
        />
      </body>
    </html>
  );
}

