import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrackMyOPT',
  description: 'Track your OPT timeline with precision',
  icons: {
    icon: '/TrackMyOPT Logo/Favicon.png',
    shortcut: '/TrackMyOPT Logo/Favicon.png',
    apple: '/TrackMyOPT Logo/Favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

