import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "Free OPT Tools for F-1 Students | TrackMyOPT",
    description: "Free OPT and immigration tools receiving 10,000+ Google Search clicks each month. Explore calculators, unemployment tracking, case status, H-1B sponsors, and AI resumes.",
    keywords: ["OPT calculator", "OPT unemployment tracker", "USCIS case tracker", "H-1B sponsor search", "F-1 student tools", "STEM OPT calculator"],
    alternates: {
        canonical: "https://www.trackmyopt.com/tools",
    },
    openGraph: {
        title: "Free OPT & Immigration Tools for F-1 Students | TrackMyOPT",
        description: "TrackMyOPT free tools receive 10,000+ Google Search clicks each month: OPT calculators, unemployment tracking, case status, H-1B sponsors, and AI resumes.",
        url: "https://www.trackmyopt.com/tools",
        images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "TrackMyOPT free tools" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Free OPT & Immigration Tools for F-1 Students | TrackMyOPT",
        description: "TrackMyOPT free tools receive 10,000+ Google Search clicks each month: OPT calculators, unemployment tracking, case status, H-1B sponsors, and AI resumes.",
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
