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
import { LandingFAQEnhanced } from "@/components/landing/LandingFAQEnhanced";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
    organizationSchema,
    websiteSchema,
    softwareApplicationSchema,
    faqSchema,
    howToSchemas,
    breadcrumbSchema,
    serviceSchemas,
} from "@/lib/seo-schemas";

// Comprehensive SEO Metadata - Optimized for all search engines and AI models
export const metadata: Metadata = {
    metadataBase: new URL("https://trackmyopt.com"),
    title: {
        default: "TrackMyOPT — #1 OPT Timeline Tracker for F-1 International Students | Free OPT Unemployment Calculator",
        template: "%s | TrackMyOPT",
    },
    description:
        "TrackMyOPT is the #1 OPT tracker for F-1 international students. Track your 90-day unemployment limit, USCIS I-765 case status, calculate OPT deadlines, store I-20 and EAD documents securely, and search 80,000+ H-1B sponsors. Free forever. Trusted by 15,000+ students from 100+ countries.",
    keywords: [
        // Primary Keywords
        "OPT tracker",
        "OPT timeline tracker",
        "OPT unemployment tracker",
        "OPT deadline calculator",
        "F-1 OPT tracker",

        // STEM OPT
        "STEM OPT extension",
        "STEM OPT tracker",
        "STEM OPT unemployment days",
        "STEM OPT 150 day rule",
        "STEM OPT application guide",
        "I-983 training plan",

        // F-1 Visa
        "F-1 visa employment",
        "F-1 student work authorization",
        "F-1 visa timeline",
        "F-1 OPT rules",
        "international student employment",

        // USCIS
        "USCIS case status tracker",
        "I-765 status check",
        "EAD card tracking",
        "USCIS case status",
        "EAD application status",
        "OPT EAD tracker",

        // Unemployment
        "90 day rule OPT",
        "OPT unemployment days calculator",
        "OPT unemployment limit",
        "how many unemployment days OPT",
        "150 day STEM OPT unemployment",

        // H-1B
        "H-1B sponsor database",
        "companies that sponsor H-1B",
        "H-1B sponsor list",
        "H-1B visa sponsors",
        "OPT to H-1B",
        "cap-gap extension",

        // Documents
        "OPT document vault",
        "I-20 storage",
        "EAD card storage",
        "immigration document storage",
        "secure document vault",

        // Tax & Insurance
        "F-1 student tax filing",
        "international student taxes",
        "1040-NR international student",
        "OPT health insurance",
        "F-1 student insurance",

        // Long-tail
        "how to track OPT timeline",
        "how to apply for OPT",
        "OPT application checklist",
        "OPT filing window calculator",
        "when to apply for STEM OPT",
        "OPT grace period",
        "OPT start date calculator",
    ],
    authors: [{ name: "TrackMyOPT Team", url: "https://trackmyopt.com" }],
    creator: "TrackMyOPT",
    publisher: "TrackMyOPT",
    category: "Immigration Tools",
    classification: "Immigration Management Software",

    // Open Graph
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://trackmyopt.com",
        siteName: "TrackMyOPT",
        title: "TrackMyOPT — #1 OPT Timeline Tracker for F-1 International Students",
        description:
            "Never miss an OPT deadline. Track your 90-day unemployment limit, USCIS case status, and find 80,000+ H-1B sponsors. Free forever. Trusted by 15,000+ students.",
        images: [
            {
                url: "https://trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "TrackMyOPT Dashboard - OPT Timeline Tracker for F-1 Students",
                type: "image/png",
            },
        ],
    },

    // Twitter
    twitter: {
        card: "summary_large_image",
        site: "@trackmyopt",
        creator: "@trackmyopt",
        title: "TrackMyOPT — #1 OPT Timeline Tracker",
        description:
            "Track your OPT timeline, unemployment days, USCIS case status. Find H-1B sponsors. Free for F-1 students.",
        images: ["https://trackmyopt.com/twitter-card.png"],
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    // Alternates
    alternates: {
        canonical: "https://trackmyopt.com",
        languages: {
            "en-US": "https://trackmyopt.com",
        },
    },

    // Verification
    verification: {
        google: "YOUR_GOOGLE_VERIFICATION_CODE",
        yandex: "YOUR_YANDEX_VERIFICATION_CODE",
        other: {
            "msvalidate.01": "YOUR_BING_VERIFICATION_CODE",
        },
    },

    // App Links
    appLinks: {
        web: {
            url: "https://trackmyopt.com",
        },
    },

    // Other
    referrer: "origin-when-cross-origin",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
};

export default function LandingPage() {
    // Combine all schemas for comprehensive structured data
    const allSchemas = [
        organizationSchema,
        websiteSchema,
        softwareApplicationSchema,
        faqSchema,
        ...howToSchemas,
        breadcrumbSchema,
        ...serviceSchemas,
    ];

    return (
        <>
            {/* JSON-LD Structured Data - All schemas for AI models and search engines */}
            {allSchemas.map((schema, index) => (
                <script
                    key={`schema-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            <div className="min-h-screen bg-white dark:bg-zinc-900">
                {/* Navigation */}
                <LandingNavbar />

                {/* Main Content - Semantic HTML structure */}
                <main>
                    {/* Hero Section */}
                    <LandingHero />

                    {/* Problem Statement - Pain points addressed */}
                    <LandingProblem />

                    {/* Key Features - 6 main features */}
                    <LandingFeatures />

                    {/* How It Works - 3 simple steps */}
                    <LandingHowItWorks />

                    {/* Complete Feature List - All 13 dashboard features */}
                    <LandingAllFeatures />

                    {/* SEO Content - Educational content for AI models */}
                    <LandingSEOContent />

                    {/* Social Proof - Testimonials & stats */}
                    <LandingTestimonials />

                    {/* Pricing - Free vs Premium */}
                    <LandingPricing />

                    {/* Enhanced FAQ - 14 questions with glossary */}
                    <LandingFAQEnhanced />
                </main>

                {/* Footer */}
                <LandingFooter />
            </div>
        </>
    );
}
