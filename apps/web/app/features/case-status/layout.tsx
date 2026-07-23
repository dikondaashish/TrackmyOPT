import { Metadata } from "next";

export const metadata: Metadata = {
    title: "USCIS Case Status Tracker — Manual Check Free, Auto-Check on Pro (2026)",
    description:
        "USCIS case status tracker for F-1 students. Free manual refresh for I-765 OPT/EAD. Pro adds daily auto-checks and email alerts when your case changes.",
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
        title: "USCIS Case Status Tracker for OPT & EAD | TrackMyOPT",
        description:
            "Track your USCIS case by receipt number. Free manual checks; Pro daily auto-checks and email when status changes.",
        url: "https://www.trackmyopt.com/features/case-status",
        siteName: "TrackMyOPT",
    },
};

export default function CaseStatusLayout({ children }: { children: React.ReactNode }) {
    return children;
}
