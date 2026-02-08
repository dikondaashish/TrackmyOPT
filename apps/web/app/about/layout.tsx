import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | TrackMyOPT - Built by F-1 Students, for F-1 Students",
    description: "Learn about TrackMyOPT's mission to help international students navigate OPT. Built by former F-1 students who understand your journey.",
    keywords: ["TrackMyOPT team", "F-1 student tools", "OPT tracking company", "international student support"],
    alternates: {
        canonical: "https://www.trackmyopt.com/about",
    },
    openGraph: {
        title: "About TrackMyOPT - Our Story",
        description: "Built by F-1 students who walked your path. We're on a mission to make OPT less stressful.",
        url: "https://www.trackmyopt.com/about",
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
