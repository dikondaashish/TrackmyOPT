import { Metadata } from "next";

export const metadata: Metadata = {
    title: "USCIS Case Status Tracker | TrackMyOPT - Real-Time I-765 Monitoring",
    description: "Track your USCIS case status in real-time. Get instant email alerts when your OPT, EAD, or I-765 application status changes. Daily automated checks with plain-English explanations.",
    keywords: ["USCIS case status tracker", "I-765 case status", "EAD tracking", "OPT application status", "USCIS case checker", "receipt number tracker"],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/case-status",
    },
    openGraph: {
        title: "USCIS Case Status Tracker - Never Miss a Status Update",
        description: "Real-time USCIS case monitoring with instant email alerts. Track your I-765, EAD, and OPT applications automatically.",
        url: "https://www.trackmyopt.com/features/case-status",
    },
};

export default function CaseStatusLayout({ children }: { children: React.ReactNode }) {
    return children;
}
