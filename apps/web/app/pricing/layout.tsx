import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "TrackMyOPT Pricing — OPT Deadline Tracking Plans for F-1 Students",
    description:
        "TrackMyOPT Pro adds daily 9:00 AM ET reminders, unemployment alerts, USCIS case monitoring, and career tools for OPT and STEM OPT students. Free plan available. Pro from $4.99/mo.",
    keywords: [
        "TrackMyOPT pricing",
        "TrackMyOPT Pro worth it",
        "OPT tracker free",
        "OPT compliance tool",
        "STEM OPT tracking",
        "F-1 student tools pricing",
        "is TrackMyOPT Pro worth it",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/pricing",
    },
    openGraph: {
        title: "TrackMyOPT Pro — OPT Deadline Tracking for F-1 Students",
        description:
            "Daily reminders, unemployment alerts, USCIS monitoring, and career tools in one place.",
        url: "https://www.trackmyopt.com/pricing",
        siteName: "TrackMyOPT",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "TrackMyOPT Pro — Built for OPT & STEM OPT Students",
        description:
            "Track filing windows, unemployment days, and STEM deadlines with daily reminders. Free plan available. Pro from $4.99/mo.",
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
