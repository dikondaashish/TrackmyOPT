import { Metadata } from "next";

export const metadata: Metadata = {
    title: "H-1B Sponsor Database | TrackMyOPT - 25,000+ Verified Sponsors",
    description: "Search 25,000+ H-1B sponsors with approval rates, salary data, E-Verify status, and fraud alerts. Find companies that actually sponsor visas.",
    keywords: ["H-1B sponsors", "H-1B visa sponsors", "companies that sponsor H-1B", "H-1B sponsor database", "E-Verify employers"],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/sponsors",
    },
    openGraph: {
        title: "H-1B Sponsor Database for F-1 OPT Students — 25,000+ Companies",
        description:
            "Search verified H-1B sponsors with approval rates, salary data, and fraud alerts. Find companies that actually sponsor F-1 students.",
        url: "https://www.trackmyopt.com/features/sponsors",
        siteName: "TrackMyOPT",
    },
};

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
