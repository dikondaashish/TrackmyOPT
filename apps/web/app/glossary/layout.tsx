import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "OPT & Immigration Glossary | TrackMyOPT - 50+ Terms Explained",
    description:
        "Comprehensive glossary of OPT, STEM OPT, F-1 visa, H-1B, and USCIS immigration terms. Clear definitions for international students navigating the US immigration system.",
    keywords: [
        "OPT glossary",
        "immigration terms",
        "F-1 visa terminology",
        "USCIS glossary",
        "what is OPT",
        "what is EAD",
        "what is SEVIS",
        "what is DSO",
    ],
    alternates: {
        canonical: "https://www.trackmyopt.com/glossary",
    },
    openGraph: {
        title: "OPT & Immigration Glossary - 50+ Terms Explained | TrackMyOPT",
        description:
            "Every immigration term an F-1 student needs to know. From OPT to H-1B, EAD to SEVIS, all explained in plain English.",
        url: "https://www.trackmyopt.com/glossary",
        siteName: "TrackMyOPT",
        type: "website",
    },
};

export default function GlossaryLayout({
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
