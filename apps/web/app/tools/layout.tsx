import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "Free OPT Tools for F-1 Students | TrackMyOPT",
    description: "Free immigration tools for F-1 students: OPT timeline calculator, unemployment day tracker, STEM OPT clock, USCIS case status checker, H-1B sponsor database, AI resume builder, and more.",
    keywords: ["OPT calculator", "OPT unemployment tracker", "USCIS case tracker", "H-1B sponsor search", "F-1 student tools", "STEM OPT calculator"],
    alternates: {
        canonical: "https://www.trackmyopt.com/tools",
    },
    openGraph: {
        title: "Free OPT & Immigration Tools for F-1 Students | TrackMyOPT",
        description: "All the free tools international students need: OPT calculators, unemployment trackers, case status checkers, H-1B sponsor database, and AI resume builder.",
        url: "https://www.trackmyopt.com/tools",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "TrackMyOPT free tools" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Free OPT & Immigration Tools for F-1 Students | TrackMyOPT",
        description: "All the free tools international students need: OPT calculators, unemployment trackers, case status checkers, H-1B sponsor database, and AI resume builder.",
        images: ["/og-image.jpg"],
    },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingNavbar />
            {children}
            <LandingFooter />
        </>
    );
}
