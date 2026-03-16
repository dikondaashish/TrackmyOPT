import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "OPT Job Tracker — Sync Applications with Your Unemployment Clock | TrackMyOPT",
    description:
        "The only job tracker that syncs with your OPT 90-day unemployment limit. Track applications, manage employer transitions, and stay F-1 compliant automatically.",
    alternates: {
        canonical: "https://www.trackmyopt.com/features/job-tracker",
    },
    openGraph: {
        title: "OPT Job Tracker — Stay Compliant While Job Hunting | TrackMyOPT",
        description:
            "Track job applications and OPT unemployment days simultaneously. Built for F-1 students managing the 90-day limit.",
        url: "https://www.trackmyopt.com/features/job-tracker",
        siteName: "TrackMyOPT",
    },
    keywords: [
        "OPT job tracker",
        "OPT unemployment clock",
        "F-1 job application tracker",
        "STEM OPT job tracking",
        "OPT compliance job search",
    ],
};

export default function JobTrackerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
