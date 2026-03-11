import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: {
        template: "%s | TrackMyOPT Blog",
        default: "OPT & F-1 Visa Blog — Guides for International Students | TrackMyOPT",
    },
    description: "Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, USCIS case tracking, and more. Written by former F-1 students for international students.",
    openGraph: {
        title: "OPT & F-1 Visa Blog | TrackMyOPT",
        description: "Expert guides on OPT, STEM OPT, H-1B sponsorship, and USCIS case tracking for international students.",
        url: "https://www.trackmyopt.com/blog",
        siteName: "TrackMyOPT",
        type: "website",
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog",
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
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
