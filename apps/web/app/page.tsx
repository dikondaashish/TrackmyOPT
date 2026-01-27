import { LandingHero } from "../components/landing/LandingHero";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingSuccessStories } from "../components/landing/LandingSuccessStories";
import { LandingTestimonials } from "../components/landing/LandingTestimonials";
import { LandingPricing } from "../components/landing/LandingPricing";
import { LandingFAQ } from "../components/landing/LandingFAQ";
import { LandingFooter } from "../components/landing/LandingFooter";
// import { LandingAEOContent } from "../components/landing/LandingAEOContent";
import { LandingComparison } from "../components/landing/LandingComparison";
import { LandingValueGrid } from "../components/landing/LandingValueGrid";
import { LandingChromeExtension } from "../components/landing/LandingChromeExtension";
import { LandingTrustedUniversities } from "../components/landing/LandingTrustedUniversities";
import { LandingToolkit } from "../components/landing/LandingToolkit";
import { LandingEngine } from "../components/landing/LandingEngine";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "TrackMyOPT - The #1 OPT Timeline & Job Tracker for F-1 Students",
    description: "Track your OPT deadlines, manage job applications with our CRM, find H-1B sponsors, and secure your documents. The operating system for international students.",
};

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-100 relative">

            {/* Careerflow-inspired Vignette Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* 1. Base Layer: Soft White/Zinc */}
                <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950" />

                {/* 2. Top-Center Highlights (Sunlight effect) */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />

                {/* 3. Vignette Edges (Depth) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            </div>

            <div className="relative z-10">
                <LandingNavbar />
                <LandingHero />
                <LandingTrustedUniversities />

                {/* Key Differentiator moved up */}
                <LandingChromeExtension />

                <LandingComparison />
                <LandingValueGrid />

                <LandingFeatures />
                <LandingEngine />
                <LandingSuccessStories />
                <LandingToolkit />
                <LandingPricing />
                <LandingTestimonials />
                <LandingFAQ />
                {/* <LandingAEOContent /> Removed for cleaner UX flow */}
                <LandingFooter />
            </div>
        </main>
    );
}
