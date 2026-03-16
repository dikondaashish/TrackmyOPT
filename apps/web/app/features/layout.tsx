import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "OPT & STEM OPT Compliance Tools for F-1 Students | TrackMyOPT Features",
    description:
        "Automated OPT tracking, USCIS case alerts, unemployment day monitoring, H-1B sponsor database, AI resume tools, and STEM OPT compliance — everything F-1 students need to protect their status.",
    keywords: [
        "OPT tracking tools",
        "STEM OPT compliance",
        "F-1 compliance tools",
        "H-1B sponsor search",
        "USCIS case tracker",
        "OPT unemployment tracker",
        "international student job search",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/features",
    },
    openGraph: {
        title: "OPT & STEM OPT Compliance Tools | TrackMyOPT",
        description:
            "Automated OPT compliance tracking, USCIS alerts, H-1B sponsor data, and AI career tools. Built for F-1 students who can't afford to miss a deadline.",
        type: "website",
        url: "https://www.trackmyopt.com/features",
        siteName: "TrackMyOPT",
    },
    twitter: {
        card: "summary_large_image",
        title: "OPT & STEM OPT Compliance Tools | TrackMyOPT",
        description:
            "Automated tracking, USCIS alerts, and career tools. Built for F-1 students who can't afford to miss a deadline.",
    },
};

export default function FeaturesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <LandingNavbar />
            {children}
            <LandingFooter />
        </>
    );
}
