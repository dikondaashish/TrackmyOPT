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
            <div className="relative rounded-xl border border-border bg-card p-8 shadow-elevated">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-muted-foreground">Success Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-lg border border-violet-100 bg-violet-50 p-4 text-center dark:border-violet-900 dark:bg-violet-950"
                    >
                        <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                            <CountUp value={500} suffix="+" />
                        </div>
                        <p className="text-xs text-violet-700 dark:text-violet-300">Jobs Landed</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950"
                    >
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            <CountUp value={85} suffix="%" />
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">Found H-1B</p>
                    </motion.div>
                </div>

                <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }}>
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                        </motion.div>
                    ))}
                </div>
                <p className="text-center text-muted-foreground text-sm"><span className="font-bold text-foreground">4.9/5</span> from 500+ reviews</p>
            </div>
        </div>
    );
}

// Stats Section
function StatsSection() {
    const stats = [
        { value: "3,500+", label: "Users Signed Up", color: "text-blue-600 dark:text-blue-400", accent: "border-t-blue-600" },
        { value: "500+", label: "Jobs Landed", color: "text-violet-600 dark:text-violet-400", accent: "border-t-violet-600" },
        { value: "85%", label: "Found H-1B", color: "text-emerald-600 dark:text-emerald-400", accent: "border-t-emerald-600" },
        { value: "4.9/5", label: "Rating", color: "text-amber-600 dark:text-amber-400", accent: "border-t-amber-500" },
    ];
    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
                        Proven Track Record
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((stat, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className={`surface-card border-t-[3px] p-6 text-center ${stat.accent}`}>
                                <p className={`text-3xl md:text-5xl font-bold mb-2 ${stat.color}`}>{stat.value}</p>
                                <p className="text-muted-foreground text-sm">{stat.label}</p>
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
        <section className="py-24 bg-surface border-t border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="surface-card p-8 md:p-12 text-center"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                        Share Your Success Story
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Did TrackMyOPT help you land your dream job or stay compliant? We'd love to hear your story!
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex min-h-12 items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-button hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        <main className="min-h-screen bg-background">
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
