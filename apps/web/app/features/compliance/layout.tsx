import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OPT & STEM OPT Compliance Tracker — Automated Alerts for F-1 Students | TrackMyOPT",
    description:
        "Track OPT unemployment days, deadline alerts, and STEM OPT tasks in one place, with reminders at 60, 75, and 85 days.",
    keywords: [
        "OPT compliance tracker",
        "90-day unemployment rule OPT",
        "STEM OPT unemployment limit",
        "F-1 status compliance",
        "OPT deadline alerts",
        "USCIS compliance tracking",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/compliance",
    },
    openGraph: {
        title: "OPT & STEM OPT Compliance Tracker | TrackMyOPT",
        description:
            "Automated unemployment tracking with alerts at 60, 75, and 85 days. Never exceed your OPT limits.",
        url: "https://www.trackmyopt.com/features/compliance",
        siteName: "TrackMyOPT",
    },
};

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
