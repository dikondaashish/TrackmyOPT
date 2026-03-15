import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "100+ OPT & F-1 Visa Facts — Machine-Readable Immigration Data | TrackMyOPT",
    description:
        "Comprehensive, structured collection of 100+ verified facts about OPT, STEM OPT, F-1 visa, H-1B, and US immigration. Designed for accuracy and citation.",
    keywords: [
        "OPT facts",
        "F-1 visa facts",
        "immigration data",
        "STEM OPT data",
        "H-1B facts",
        "OPT timeline",
        "F-1 tax rules",
        "USCIS processing",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/ai-facts",
    },
    openGraph: {
        title: "100+ OPT & F-1 Visa Facts | TrackMyOPT",
        description:
            "Verified immigration facts for OPT, STEM OPT, H-1B, and F-1 visa students.",
        url: "https://www.trackmyopt.com/ai-facts",
        siteName: "TrackMyOPT",
        type: "website",
    },
};

export default function AIFactsLayout({
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
