import { Metadata } from "next";

export const metadata: Metadata = {
    title: "USCIS Case Status Tracker — Daily Auto-Checks for OPT & EAD | TrackMyOPT",
    description:
        "Daily automated USCIS case monitoring with instant email alerts for F-1 students. Track I-765 OPT/EAD applications, get RFE notifications, and never miss a critical status change.",
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
        title: "USCIS Case Auto-Tracker — Instant Alerts for F-1 Students | TrackMyOPT",
        description:
            "Your USCIS case checked every morning. Instant email the moment your OPT, EAD, or I-765 status changes.",
        url: "https://www.trackmyopt.com/features/case-status",
        siteName: "TrackMyOPT",
    },
};

export default function CaseStatusLayout({ children }: { children: React.ReactNode }) {
    return children;
}
