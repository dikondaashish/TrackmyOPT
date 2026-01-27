import { LandingHero } from "../components/landing/LandingHero";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingAllFeatures } from "../components/landing/LandingAllFeatures";
import { LandingSuccessStories } from "../components/landing/LandingSuccessStories";
import { LandingTestimonials } from "../components/landing/LandingTestimonials";
import { LandingPricing } from "../components/landing/LandingPricing";
import { LandingFAQ } from "../components/landing/LandingFAQ";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingAEOContent } from "../components/landing/LandingAEOContent";
import { LandingComparison } from "../components/landing/LandingComparison";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "TrackMyOPT - The #1 OPT Timeline & Job Tracker for F-1 Students",
    description: "Track your OPT deadlines, manage job applications with our CRM, find H-1B sponsors, and secure your documents. The operating system for international students.",
};

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-100">
            <LandingNavbar />
            <LandingHero />
            <LandingComparison />
            <LandingFeatures />
            <LandingAllFeatures />
            <LandingSuccessStories />
            <LandingTestimonials />
            <LandingAEOContent />
            <LandingPricing />
            <LandingFAQ />
            <LandingFooter />
        </main>
    );
}
