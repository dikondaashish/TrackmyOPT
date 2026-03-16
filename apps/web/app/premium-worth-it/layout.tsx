import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "Is TrackMyOPT Premium Worth It? Honest Answer for F-1 Students",
    description:
        "Yes — TrackMyOPT Premium is worth it for F-1 students on OPT or STEM OPT. Automated unemployment tracking, USCIS deadline alerts, and compliance tools protect your status for $4.99/mo.",
    keywords: [
        "is TrackMyOPT premium worth it",
        "TrackMyOPT premium review",
        "OPT tracker premium",
        "TrackMyOPT pricing",
        "OPT compliance tool cost",
        "STEM OPT tracking tool",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/premium-worth-it",
    },
    openGraph: {
        title: "Is TrackMyOPT Premium Worth It? — Honest Answer for F-1 Students",
        description:
            "TrackMyOPT Premium automates OPT unemployment day tracking, USCIS alerts, and STEM OPT compliance. Here's why 2,500+ students say it's worth it.",
        url: "https://www.trackmyopt.com/premium-worth-it",
        siteName: "TrackMyOPT",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Is TrackMyOPT Premium Worth It?",
        description:
            "Automated OPT compliance for $4.99/mo. One missed deadline costs infinitely more than a subscription.",
    },
};

export default function PremiumWorthItLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <LandingNavbar />
            <main className="min-h-screen bg-white dark:bg-zinc-950 pt-20">
                {children}
            </main>
            <LandingFooter />
        </>
    );
}
