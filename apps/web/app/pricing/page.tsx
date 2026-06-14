"use client";

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CanonicalURL } from "@/components/CanonicalURL";
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

    const reviewSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "TrackMyOPT Premium",
        description:
            "Automated OPT compliance tracking, USCIS deadline alerts, and career tools for F-1 students.",
        brand: { "@type": "Organization", name: "TrackMyOPT" },
        url: "https://www.trackmyopt.com/pricing",
        review: testimonials.map((t) => ({
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
        })),
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "127",
            bestRating: "5",
        },
    };

    return (
        <>
            <CanonicalURL url="https://www.trackmyopt.com/pricing" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
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

                {/* Final CTA */}
                <section className="py-24">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
                            <h2 className="text-3xl font-bold mb-4">
                                Your OPT Status Is Too Important to Leave to Chance
                            </h2>
                            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                                Join 2,500+ F-1 students who trust TrackMyOPT
                                Premium to stay compliant, hit every deadline,
                                and land H-1B sponsorship.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Dpro%26interval%3Dyear"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
                                >
                                    Start Pro Free Trial{" "}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Ddedicated%26interval%3Dyear"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                                >
                                    Get Dedicated Support
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <p className="text-sm text-blue-100/80 mt-4">
                                Pro from $4.17/mo billed yearly · Dedicated includes monthly attorney access
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
