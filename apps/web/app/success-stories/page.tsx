"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";
import { MasonryWallOfLove } from "@/components/features/MasonryWallOfLove";
import { FilterableCaseStudies } from "@/components/features/FilterableCaseStudies";
import { CountUp } from "@/components/ui/count-up";

// Success Stats Card Visual
function SuccessStatsVisual() {
    return (
        <div className="relative">
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-8">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-green-50 dark:bg-green-950 rounded-xl p-4 text-center"
                    >
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                            <CountUp value={500} suffix="+" />
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">Jobs Landed</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 text-center"
                    >
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            <CountUp value={85} suffix="%" />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Found H-1B</p>
                    </motion.div>
                </div>

                <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }}>
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </motion.div>
                    ))}
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm"><span className="font-bold text-gray-900 dark:text-white">4.9/5</span> from 500+ reviews</p>
            </div>
        </div>
    );
}

// Stats Section
function StatsSection() {
    const stats = [
        { value: "3,500+", label: "Users Signed Up" },
        { value: "500+", label: "Jobs Landed" },
        { value: "85%", label: "Found H-1B" },
        { value: "4.9/5", label: "Rating" },
    ];
    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-green-600 rounded-xl p-8 md:p-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
                        Proven Track Record
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                                <p className="text-green-100 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Submit Story Section
function SubmitStory() {
    return (
        <section className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-8 md:p-12 text-center"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Share Your Success Story
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                        Did TrackMyOPT help you land your dream job or stay compliant? We'd love to hear your story!
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Submit Your Story
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

export default function SuccessStoriesPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                headline="Real Results from Real Students"
                subheadline="Explore stories and tools for planning OPT timelines and researching H-1B sponsors."
                ctaText="Start Your Journey"
                ctaHref="/login"
                secondaryCta={{
                    text: "See Features",
                    href: "/features"
                }}
                gradient="bg-green-600"
                visual={<SuccessStatsVisual />}
            />

            {/* Stats */}
            <StatsSection />

            {/* Case Studies */}
            <FilterableCaseStudies />

            {/* Quote Wall */}
            <MasonryWallOfLove />

            {/* Submit Story */}
            <SubmitStory />

            {/* CTA */}
            <FeatureCTA
                headline="Ready to Write Your Story?"
                subheadline="Start planning your OPT and career journey with TrackMyOPT."
                primaryCTA={{
                    text: "Start Free Today",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "Explore Features",
                    href: "/features",
                }}
                gradient="emerald"
                icon={<Star className="w-12 h-12 text-white" />}
            />

            <LandingFooter />
        </main>
    );
}
