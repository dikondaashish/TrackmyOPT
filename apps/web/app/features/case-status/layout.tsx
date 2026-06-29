import { Metadata } from "next";

export const metadata: Metadata = {
    title: "USCIS Case Status Tracker — Free Auto-Check & Email Alerts (2026)",
    description:
        "Free USCIS case status tracker for F-1 students. Daily auto-checks for I-765 OPT/EAD, plain-English status updates, RFE alerts, and email notifications when your case changes.",
    keywords: [
        "USCIS case status tracker",
        "I-765 case tracking",
        "EAD tracking alerts",
        "OPT application status",
        "USCIS case auto-check",
        "F-1 visa case tracker",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/case-status",
    },
    openGraph: {
        title: "USCIS Case Status Tracker — Free Auto-Check for OPT & EAD | TrackMyOPT",
        description:
            "Track your USCIS case by receipt number. Daily auto-checks and instant email when your OPT or I-765 status changes.",
        url: "https://www.trackmyopt.com/features/case-status",
        siteName: "TrackMyOPT",
    },
};

export default function CaseStatusLayout({ children }: { children: React.ReactNode }) {
    return children;
}
