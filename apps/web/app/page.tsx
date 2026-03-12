import { Suspense } from "react";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingPricing } from "../components/landing/LandingPricing";
import { LandingFAQ } from "../components/landing/LandingFAQ";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingAEOContent } from "../components/landing/LandingAEOContent";
import { LandingChromeExtension } from "../components/landing/LandingChromeExtension";
import { LandingTrustedUniversities } from "../components/landing/LandingTrustedUniversities";
import { ReferralCapture } from "../components/ReferralCapture";
import dynamic from "next/dynamic";

// Lazy-load below-fold components to reduce initial JS bundle (SEO Fix #1 & #2: Mobile LCP/TBT)
const LandingComparison = dynamic(() => import("../components/landing/LandingComparison").then(mod => mod.LandingComparison));
const LandingValueGrid = dynamic(() => import("../components/landing/LandingValueGrid").then(mod => mod.LandingValueGrid));
const LandingSuccessStories = dynamic(() => import("../components/landing/LandingSuccessStories").then(mod => mod.LandingSuccessStories));
const LandingTestimonials = dynamic(() => import("../components/landing/LandingTestimonials").then(mod => mod.LandingTestimonials));
const LandingEngine = dynamic(() => import("../components/landing/LandingEngine").then(mod => mod.LandingEngine));
const LandingToolkit = dynamic(() => import("../components/landing/LandingToolkit").then(mod => mod.LandingToolkit));
import {
    softwareApplicationSchema,
    faqSchema,
    websiteSchema,
    organizationSchema,
    breadcrumbSchema,
    serviceSchemas,
    howToSchemas,
    speakableSchema,
    definedTermSetSchema,
    articleSchema,
    knowledgeGraphSchema,
} from "@/lib/seo-schemas";

const LandingGlobalReach = dynamic(() => import("../components/landing/LandingGlobalReach").then(mod => mod.LandingGlobalReach));
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "OPT Tracker & H-1B Finder for F-1 Students | TrackMyOPT",
    description: "Track OPT deadlines, monitor unemployment days, find H-1B sponsors, and build AI resumes. Free forever — trusted by 2,500+ F-1 students. Start now.",
};

// Combine relevant schemas for the landing page
const landingPageSchemas = [
    organizationSchema,
    websiteSchema,
    softwareApplicationSchema,
    faqSchema,
    breadcrumbSchema,
    ...serviceSchemas,
    ...howToSchemas,
    // AEO Schemas for AI models
    speakableSchema,
    definedTermSetSchema,
    articleSchema,
    knowledgeGraphSchema,
];

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
                <Suspense fallback={null}>
                    <ReferralCapture />
                </Suspense>
                <LandingNavbar />
                <LandingHero />
                <LandingTrustedUniversities />

                {/* Key Differentiator moved up */}
                <LandingChromeExtension />

                <LandingComparison />
                <LandingValueGrid />

                <LandingFeatures />
                <LandingGlobalReach />
                <LandingEngine />
                <LandingSuccessStories />
                <LandingToolkit />
                <LandingPricing />
                <LandingTestimonials />
                <LandingFAQ />
                <LandingAEOContent />
                <LandingFooter />
            </div>

            {/* Comprehensive JSON-LD Schemas for SEO and AEO */}
            {landingPageSchemas.map((schema, index) => (
                <script
                    key={`schema-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </main>
    );
}

