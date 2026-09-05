import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "OPT vs CPT vs H-1B — Immigration Status Comparison Tables | TrackMyOPT",
    description:
        "Side-by-side comparison tables for OPT vs CPT, OPT vs H-1B, Regular OPT vs STEM OPT, and Resident vs Non-Resident tax status for F-1 students.",
    keywords: [
        "OPT vs CPT",
        "OPT vs H-1B",
        "STEM OPT comparison",
        "F-1 tax comparison",
    ],
    alternates: { canonical: "https://www.trackmyopt.com/compare" },
    openGraph: {
        title: "Immigration Status Comparison Tables | TrackMyOPT",
        description:
            "Side-by-side comparisons: OPT vs CPT, OPT vs H-1B, Regular vs STEM OPT, Resident vs Non-Resident taxes.",
        url: "https://www.trackmyopt.com/compare",
        siteName: "TrackMyOPT",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Immigration Status Comparison Tables | TrackMyOPT",
        description:
            "Side-by-side comparisons: OPT vs CPT, OPT vs H-1B, Regular vs STEM OPT, Resident vs Non-Resident taxes.",
        images: ["/og-image.jpg"],
    },
};

export default function CompareLayout({
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
