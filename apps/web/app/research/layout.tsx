import { Metadata } from 'next';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { RESEARCH_HUB_HERO_IMAGE } from '@/data/research-hub';

export const metadata: Metadata = {
  title: 'TrackMyOPT Research — What We Have Actually Seen on OPT Job Search',
  description:
    'Honest hiring research for international students on OPT. ATS myths debunked, resume advice that works, and where TrackMyOPT helps vs where you still have to show up.',
  keywords: [
    'OPT research',
    'international student job search',
    'September hiring surge',
    'OPT unemployment days',
    'USCIS processing data',
    'F-1 career intelligence',
  ],
  alternates: {
    canonical: 'https://www.trackmyopt.com/research',
  },
  openGraph: {
    title: 'TrackMyOPT Research — Intelligence for OPT Students',
    description:
      'Editorial briefs and community data on hiring cycles, compliance, and USCIS timelines.',
    url: 'https://www.trackmyopt.com/research',
    siteName: 'TrackMyOPT',
    type: 'website',
    images: [
      {
        url: `https://www.trackmyopt.com${RESEARCH_HUB_HERO_IMAGE}`,
        width: 1200,
        height: 750,
        alt: 'TrackMyOPT Research — hiring intelligence for OPT students',
      },
    ],
  },
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-20">{children}</main>
      <LandingFooter />
    </>
  );
}
