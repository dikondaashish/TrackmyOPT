import { Metadata } from "next";
import { howToSchemas } from "@/lib/seo-schemas";

export const metadata: Metadata = {
    title: "How TrackMyOPT Works - Step-by-Step Guide for F-1 Students",
    description:
        "Learn how to use TrackMyOPT in 5 simple steps. Track your OPT timeline, monitor unemployment days, check USCIS case status, and find H-1B sponsors.",
    keywords: [
        "how to track OPT",
        "OPT tracking guide",
        "TrackMyOPT tutorial",
        "OPT timeline setup",
        "USCIS case tracking",
        "unemployment days tracker",
        "F-1 student guide",
    ],
    openGraph: {
        title: "How TrackMyOPT Works | Step-by-Step Guide",
        description:
            "Get started with TrackMyOPT in 5 minutes. Track your OPT timeline and stay compliant.",
        url: "https://www.trackmyopt.com/how-it-works",
        siteName: "TrackMyOPT",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "How TrackMyOPT Works",
        description: "Step-by-step guide to tracking your OPT status.",
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/how-it-works",
    },
};

export default function HowItWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Use the first HowTo schema (OPT Timeline tracking)
    const howToSchema = howToSchemas[0];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            {children}
        </>
    );
}
