import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.trackmyopt.com'),
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
  alternates: {
    canonical: 'https://www.trackmyopt.com',
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
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TrackMyOPT",
              "url": "https://www.trackmyopt.com",
              "logo": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@trackmyopt.com",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://twitter.com/trackmyopt",
                "https://linkedin.com/company/trackmyopt"
              ]
            })
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4262248775973692"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

