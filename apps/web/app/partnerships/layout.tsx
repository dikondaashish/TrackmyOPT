import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Partnerships | TrackMyOPT - Work With Us",
    description: "Partner with TrackMyOPT to help international students succeed. University partnerships, employer collaborations, and affiliate programs.",
    keywords: ["TrackMyOPT partnerships", "university partnerships", "employer partnerships", "international student programs"],
    alternates: {
        canonical: "https://www.trackmyopt.com/partnerships",
    },
    openGraph: {
        title: "Partner with TrackMyOPT",
        description: "Join us in helping international students navigate their career journey in the US.",
        url: "https://www.trackmyopt.com/partnerships",
    },
};

export default function PartnershipsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
