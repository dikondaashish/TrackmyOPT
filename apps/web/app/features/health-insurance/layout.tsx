import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OPT Health Insurance Finder | TrackMyOPT - Plans from $0/month",
    description: "Find affordable health insurance as an F-1 student on OPT. Compare Marketplace, short-term, and catastrophic plans. Coverage starting at $0/month with subsidies.",
    keywords: ["OPT health insurance", "F-1 student health insurance", "international student health coverage", "ACA for OPT students", "affordable health insurance OPT", "health insurance after graduation"],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/health-insurance",
    },
    openGraph: {
        title: "OPT Health Insurance Finder for F-1 Students — Plans from $0/month",
        description:
            "Compare Marketplace, short-term, and catastrophic health insurance plans for F-1 students on OPT and STEM OPT. Coverage from $0/month with subsidies.",
        url: "https://www.trackmyopt.com/features/health-insurance",
        siteName: "TrackMyOPT",
    },
};

export default function HealthInsuranceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
