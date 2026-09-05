"use client";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";

import dynamic from "next/dynamic";
import { PricingFinalCta } from "@/components/pricing/PricingFinalCta";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { PricingHero } from "@/components/pricing/PricingHero";
import { WhyPremium } from "@/components/pricing/WhyPremium";
import { pricingFaqs, testimonials } from "@/components/pricing/PricingData";

const PricingComparison = dynamic(() => import("@/components/pricing/PricingComparison").then(m => m.PricingComparison));
const PricingDetailedComparison = dynamic(() => import("@/components/pricing/PricingDetailedComparison").then(m => m.PricingDetailedComparison));
const PricingTestimonials = dynamic(() => import("@/components/pricing/PricingTestimonials").then(m => m.PricingTestimonials));
const PricingFAQ = dynamic(() => import("@/components/pricing/PricingFAQ").then(m => m.PricingFAQ));

export default function PricingPage() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: pricingFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
    };

    const reviews = testimonials.map((t) => ({
        "@type": "Review",
        reviewBody: t.quote,
        author: {
            "@type": "Person",
            name: t.name,
            jobTitle: t.role,
            affiliation: {
                "@type": "EducationalOrganization",
                name: t.university,
            },
        },
        reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
        },
    }));

    const reviewSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "TrackMyOPT Pro",
        description:
            "Automated OPT compliance tracking, USCIS deadline alerts, and career tools for F-1 students.",
        brand: { "@type": "Organization", name: "TrackMyOPT" },
        url: "https://www.trackmyopt.com/pricing",
        review: reviews,
        // Required by Google when a Product carries more than one Review,
        // otherwise the review snippets are invalid ("Multiple reviews without
        // aggregateRating object"). All testimonials are rated 5.
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            reviewCount: reviews.length,
            bestRating: "5",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(reviewSchema) }}
            />

            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <PricingHero />
                
                {/* Pricing Cards */}
                <LandingPricing />

                <WhyPremium />

                <PricingComparison />

                <PricingTestimonials />

                <PricingDetailedComparison />

                <PricingFAQ />

                <PricingFinalCta />
            </main>
        </>
    );
}
