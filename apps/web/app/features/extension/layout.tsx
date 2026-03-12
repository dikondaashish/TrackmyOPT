import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chrome Extension | TrackMyOPT - See H-1B Data on LinkedIn Jobs",
    description: "Free Chrome extension that shows H-1B sponsorship history, E-Verify status, and fraud alerts directly on LinkedIn and Indeed job listings.",
    keywords: ["H-1B Chrome extension", "LinkedIn H-1B checker", "job sponsorship checker", "visa sponsor extension", "TrackMyOPT extension"],
    alternates: {
        canonical: "https://www.trackmyopt.com/features/extension",
    },
    openGraph: {
        title: "TrackMyOPT Chrome Extension - Free Forever",
        description: "See which companies sponsor H-1B visas right on LinkedIn. Save hours of research with instant sponsor intel.",
        url: "https://www.trackmyopt.com/features/extension",
    },
};

export default function ExtensionLayout({ children }: { children: React.ReactNode }) {
    return children;
}
