import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: {
        template: "%s | TrackMyOPT Answers",
        default: "OPT & F-1 Visa Answers — Educational Q&A | TrackMyOPT",
    },
    description:
        "Clear, educational answers to the most common questions about OPT, STEM OPT, F-1 visa, H-1B, taxes, and US immigration for international students.",
    keywords: [
        "OPT questions",
        "F-1 visa FAQ",
        "STEM OPT answers",
        "international student immigration",
        "OPT help",
        "H-1B questions",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/answers",
    },
    openGraph: {
        title: "OPT & F-1 Visa Answers — Educational Q&A | TrackMyOPT",
        description:
            "Clear, educational answers to 50+ common questions about OPT, STEM OPT, F-1 visa, H-1B, and US immigration.",
        url: "https://www.trackmyopt.com/answers",
        siteName: "TrackMyOPT",
        type: "website",
    },
};

export default function AnswersLayout({
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
