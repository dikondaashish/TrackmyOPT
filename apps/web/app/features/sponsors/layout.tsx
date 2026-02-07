import { Metadata } from "next";

export const metadata: Metadata = {
    title: "H-1B Sponsor Database | TrackMyOPT - 25,000+ Verified Sponsors",
    description: "Search 25,000+ H-1B sponsors with approval rates, salary data, E-Verify status, and fraud alerts. Find companies that actually sponsor visas.",
    keywords: ["H-1B sponsors", "H-1B visa sponsors", "companies that sponsor H-1B", "H-1B sponsor database", "E-Verify employers"],
    alternates: {
        canonical: "https://trackmyopt.com/features/sponsors",
    },
    openGraph: {
        title: "H-1B Sponsor Database - 25,000+ Companies",
        description: "Stop guessing which companies sponsor. Search our verified database with approval rates, salaries, and fraud alerts.",
        url: "https://trackmyopt.com/features/sponsors",
    },
};

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
