import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "F-1 Career Guide 2026: From OPT to H-1B | TrackMyOPT",
    description: "The complete career guide for F-1 international students. Job search strategies, ATS resume optimization, H-1B sponsor research, interview preparation, salary negotiation, and the path from OPT to permanent residency.",
    keywords: ["F-1 career guide", "international student job search", "OPT to H-1B", "H-1B sponsor companies", "ATS resume F-1", "international student interview tips", "F-1 salary negotiation"],
    alternates: {
        canonical: "https://www.trackmyopt.com/guides/opt-career",
    },
    openGraph: {
        title: "F-1 Career Guide: From OPT to H-1B — TrackMyOPT",
        description: "Everything F-1 students need for career success: job search, resume building, H-1B sponsors, interviews, and the path to permanent residency.",
        url: "https://www.trackmyopt.com/guides/opt-career",
        type: "article",
    },
};

export default function CareerGuidePillarLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LandingNavbar />
            {children}
            <LandingFooter />
        </>
    );
}
