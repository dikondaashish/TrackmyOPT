import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "Features - TrackMyOPT | OPT Compliance & Job Search Tools",
    description: "Explore all TrackMyOPT features: OPT compliance tracking, H-1B sponsor intelligence, AI resume optimization, Chrome extension, and job application tracker for international students.",
    keywords: ["OPT features", "H-1B sponsor search", "OPT compliance tools", "international student job search", "visa tracking", "STEM OPT"],
    openGraph: {
        title: "Features - TrackMyOPT",
        description: "All the tools international students need to protect their OPT status and find H-1B sponsors.",
        type: "website",
        url: "https://trackmyopt.com/features",
    },
    twitter: {
        card: "summary_large_image",
        title: "Features - TrackMyOPT",
        description: "All the tools international students need to protect their OPT status and find H-1B sponsors.",
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
