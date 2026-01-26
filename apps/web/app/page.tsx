import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
    title: "TrackMyOPT — #1 OPT Timeline Tracker for International Students",
    description:
        "Never miss an OPT deadline. Track your 90-day unemployment limit, USCIS case status, and find H-1B sponsors. Trusted by 15,000+ international students.",
    keywords: [
        "OPT tracker",
        "STEM OPT",
        "F-1 visa",
        "international students",
        "USCIS case status",
        "H-1B sponsors",
        "OPT timeline",
        "unemployment days tracker",
        "OPT deadline",
        "EAD tracker",
    ],
    openGraph: {
        title: "TrackMyOPT — #1 OPT Timeline Tracker for International Students",
        description:
            "Never miss an OPT deadline. Track your 90-day unemployment limit, USCIS case status, and find H-1B sponsors.",
        url: "https://trackmyopt.com",
        siteName: "TrackMyOPT",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "TrackMyOPT — #1 OPT Timeline Tracker",
        description:
            "Never miss an OPT deadline. Track your timeline with precision.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-900">
            {/* Navigation */}
            <LandingNavbar />

            {/* Hero Section */}
            <LandingHero />

            {/* Features Section */}
            <LandingFeatures />

            {/* How It Works */}
            <LandingHowItWorks />

            {/* Testimonials */}
            <LandingTestimonials />

            {/* Pricing */}
            <LandingPricing />

            {/* FAQ */}
            <LandingFAQ />

            {/* Footer */}
            <LandingFooter />
        </div>
    );
}
