import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "Is TrackMyOPT Pro Worth It? Honest Answer for F-1 Students",
    description:
        "TrackMyOPT Pro adds daily reminders, unemployment alerts, USCIS monitoring, and career tools for OPT and STEM OPT students — from $7.99/mo. Free plan available.",
    keywords: [
        "is TrackMyOPT Pro worth it",
        "TrackMyOPT Pro review",
        "OPT tracker premium",
        "TrackMyOPT pricing",
        "OPT compliance tool cost",
        "STEM OPT tracking tool",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/premium-worth-it",
    },
    openGraph: {
        title: "Is TrackMyOPT Pro Worth It? — Honest Answer for F-1 Students",
        description:
            "Daily reminders, unemployment tracking, USCIS alerts, and career tools in one place.",
        url: "https://www.trackmyopt.com/premium-worth-it",
        siteName: "TrackMyOPT",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Is TrackMyOPT Pro Worth It?",
        description:
            "Daily OPT reminders and trackers for $7.99/mo. Helps you stay organized before deadlines sneak up.",
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
