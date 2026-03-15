import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Job Experience Tracker for F-1 OPT Students | TrackMyOPT',
    description: 'Sync your job applications with your OPT Unemployment Clock. The only job tracker designed for international students to stay compliant.',
    alternates: {
        canonical: 'https://www.trackmyopt.com/features/job-tracker',
    },
    openGraph: {
        title: 'Track Jobs & OPT Clock Simultaneously | TrackMyOPT',
        description: 'Never miss a deadline. Sync your applications with your 90-day unemployment limit automatically.',
        url: 'https://www.trackmyopt.com/features/job-tracker',
    },
    keywords: ['OPT Job Tracker', 'Unemployment Clock', 'Job Application Tracker', 'Student CRM']
};

export default function JobTrackerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
