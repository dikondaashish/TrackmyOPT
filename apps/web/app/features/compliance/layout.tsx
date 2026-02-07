import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OPT Compliance Tracker | TrackMyOPT - Stay in F-1 Status",
    description: "Track your 90-day unemployment limit, filing deadlines, and OPT compliance requirements. Automatic alerts before you approach critical dates.",
    keywords: ["OPT compliance", "90-day rule OPT", "unemployment tracker OPT", "F-1 status compliance", "STEM OPT unemployment limit"],
    alternates: {
        canonical: "https://trackmyopt.com/features/compliance",
    },
    openGraph: {
        title: "OPT Compliance Tracker - Never Exceed Your Limits",
        description: "Track unemployment days, filing deadlines, and stay compliant with F-1 regulations automatically.",
        url: "https://trackmyopt.com/features/compliance",
    },
};

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
