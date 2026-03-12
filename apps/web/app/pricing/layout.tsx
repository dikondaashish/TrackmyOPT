import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "Pricing - TrackMyOPT | Free OPT Tracker & Premium Plans",
    description: "TrackMyOPT pricing: Free forever plan with OPT tracking, unemployment clock, and USCIS case status. Pro plan from $4.99/mo adds daily auto-checks, document vault, unlimited H-1B data, and AI resume tools.",
    keywords: ["TrackMyOPT pricing", "OPT tracker free", "OPT tracker cost", "F-1 student tools pricing", "immigration tracker pricing"],
    alternates: {
        canonical: "https://www.trackmyopt.com/pricing",
    },
    openGraph: {
        title: "TrackMyOPT Pricing - Free & Premium Plans for F-1 Students",
        description: "Start tracking your OPT for free. Upgrade to Pro for daily USCIS checks, document vault, and unlimited H-1B sponsor data.",
        url: "https://www.trackmyopt.com/pricing",
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingNavbar />
            {children}
            <LandingFooter />
        </>
    );
}
