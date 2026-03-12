import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "OPT Health Insurance Guide 2026: Everything You Need to Know | TrackMyOPT",
    description: "The complete health insurance guide for F-1 students on OPT. ACA marketplace enrollment, employer plans, COBRA, state-by-state options, coverage gaps, costs, and how to find plans starting at $0/month.",
    keywords: ["OPT health insurance", "F-1 student health insurance", "international student health plans", "ACA marketplace OPT", "health insurance after graduation", "COBRA for F-1 students", "cheap health insurance OPT"],
    alternates: {
        canonical: "https://www.trackmyopt.com/guides/opt-health-insurance",
    },
    openGraph: {
        title: "OPT Health Insurance: Everything You Need to Know — TrackMyOPT",
        description: "Find the right health insurance on OPT. Compare marketplace, employer, short-term, and catastrophic plans. State-by-state guide included.",
        url: "https://www.trackmyopt.com/guides/opt-health-insurance",
        type: "article",
    },
};

export default function HealthInsuranceGuidePillarLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingNavbar />
            {children}
            <LandingFooter />
        </>
    );
}
