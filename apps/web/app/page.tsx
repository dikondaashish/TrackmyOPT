import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingAllFeatures } from "@/components/landing/LandingAllFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingSEOContent } from "@/components/landing/LandingSEOContent";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "TrackMyOPT — #1 OPT Timeline Tracker for F-1 International Students",
    description:
        "Never miss an OPT deadline. Track your 90-day unemployment limit, USCIS I-765 case status, secure immigration documents, and find 80,000+ H-1B sponsors. Trusted by 15,000+ international students from 100+ countries.",
    keywords: [
        "OPT tracker",
        "STEM OPT extension",
        "F-1 visa employment",
        "international students",
        "USCIS case status tracker",
        "H-1B sponsor database",
        "OPT timeline calculator",
        "unemployment days tracker",
        "OPT deadline reminder",
        "EAD card tracking",
        "I-765 status check",
        "90-day unemployment rule",
        "150-day STEM OPT unemployment",
        "OPT document vault",
        "international student jobs",
        "cap-gap extension",
        "F-1 student tax filing",
        "OPT health insurance",
        "I-20 storage",
        "immigration document storage",
    ],
    openGraph: {
        title: "TrackMyOPT — #1 OPT Timeline Tracker for F-1 International Students",
        description:
            "Never miss an OPT deadline. Track your 90-day unemployment limit, USCIS case status, and find H-1B sponsors. Trusted by 15,000+ students.",
        url: "https://trackmyopt.com",
        siteName: "TrackMyOPT",
        type: "website",
        locale: "en_US",
        images: [
            {
                url: "https://trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "TrackMyOPT - OPT Timeline Tracker Dashboard",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "TrackMyOPT — #1 OPT Timeline Tracker",
        description:
            "Never miss an OPT deadline. Track your timeline, unemployment days, USCIS case status, and find H-1B sponsors.",
        images: ["https://trackmyopt.com/twitter-card.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "https://trackmyopt.com",
    },
    authors: [{ name: "TrackMyOPT Team" }],
    category: "Immigration Tools",
};

// JSON-LD Structured Data for SEO
const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TrackMyOPT",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1500",
    },
    description:
        "The #1 OPT timeline tracker for F-1 international students. Track employment authorization deadlines, unemployment days, USCIS case status, and find H-1B sponsors.",
};

export default function LandingPage() {
    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-white dark:bg-zinc-900">
                {/* Navigation */}
                <LandingNavbar />

                {/* Hero Section */}
                <LandingHero />

                {/* Problem Statement - Pain points */}
                <LandingProblem />

                {/* Quick Features - 6 key features */}
                <LandingFeatures />

                {/* How It Works - 3 steps */}
                <LandingHowItWorks />

                {/* All Dashboard Features - Complete list */}
                <LandingAllFeatures />

                {/* SEO Content - OPT explanation & benefits */}
                <LandingSEOContent />

                {/* Testimonials & Social Proof */}
                <LandingTestimonials />

                {/* Pricing - Free vs Premium */}
                <LandingPricing />

                {/* FAQ - Common questions */}
                <LandingFAQ />

                {/* Footer */}
                <LandingFooter />
            </div>
        </>
    );
}
