import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OPT Health Insurance Finder | TrackMyOPT - Plans from $0/month",
    description: "Find affordable health insurance as an F-1 student on OPT. Compare Marketplace, short-term, and catastrophic plans. Coverage starting at $0/month with subsidies.",
    keywords: ["OPT health insurance", "F-1 student health insurance", "international student health coverage", "ACA for OPT students", "affordable health insurance OPT", "health insurance after graduation"],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/health-insurance",
    },
    openGraph: {
        title: "OPT Health Insurance Finder - Plans from $0/month",
        description: "Compare health insurance plans for F-1 students on OPT. Find affordable coverage after your university plan ends.",
        url: "https://www.trackmyopt.com/features/health-insurance",
    },
};

export default function HealthInsuranceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
