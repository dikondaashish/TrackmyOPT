"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Quote, Building2, MapPin, ArrowRight, Trophy, Sparkles, MessageCircle, Send } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";

// Success Stats Card Visual
function SuccessStatsVisual() {
    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center"
                    >
                        <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">500+</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Jobs Landed</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center"
                    >
                        <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">85%</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Found H-1B</p>
                    </motion.div>
                </div>

                <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                        >
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </motion.div>
                    ))}
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">4.9/5</span> from 500+ reviews
                </p>
            </div>
        </div>
    );
}

// Case Studies Section
function CaseStudies() {
    const cases = [
        {
            name: "Priya Sharma",
            role: "Software Engineer at Google",
            image: "PS",
            university: "Georgia Tech",
            story: "Used TrackMyOPT to stay compliant during my job search. The H-1B sponsor database helped me target the right companies.",
            highlight: "From OPT to H-1B in 8 months",
            color: "blue",
        },
        {
            name: "Wei Chen",
            role: "Product Manager at Meta",
            image: "WC",
            university: "Stanford",
            story: "The AI Resume Doctor helped me tailor my resume for each application. Landed 5 interviews in my first week!",
            highlight: "5 interviews in 1 week",
            color: "purple",
        },
        {
            name: "Raj Patel",
            role: "Data Scientist at Amazon",
            image: "RP",
            university: "MIT",
            story: "Almost exceeded my 90-day limit without realizing it. TrackMyOPT's alerts saved my F-1 status.",
            highlight: "Status violation prevented",
            color: "green",
        },
    ];

    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4">
                        <Trophy className="w-4 h-4" />
                        Featured Success Stories
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        From OPT to Dream Jobs
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Real stories from students who used TrackMyOPT to navigate their journey
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {cases.map((cs, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cs.color === 'blue' ? 'from-blue-500 to-indigo-600' :
                                    cs.color === 'purple' ? 'from-purple-500 to-pink-600' :
                                        'from-green-500 to-teal-600'
                                    } flex items-center justify-center text-white font-bold text-lg`}>
                                    {cs.image}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{cs.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{cs.role}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">{cs.university}</p>
                                </div>
                            </div>

                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4 ${cs.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                cs.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                }`}>
                                <Sparkles className="w-3 h-3" />
                                {cs.highlight}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                &ldquo;{cs.story}&rdquo;
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Quote Wall
function QuoteWall() {
    const quotes = [
        { text: "The unemployment tracker literally saved my status!", author: "MS student, UCLA" },
        { text: "Found my H-1B sponsor through the database", author: "Engineer, Ohio State" },
        { text: "Best tool for international students, period.", author: "DS at NYU" },
        { text: "My DSO recommended this to all students", author: "Advisor at USC" },
        { text: "Resume AI got me 3x more callbacks", author: "PM at Berkeley" },
        { text: "Should be required for every F-1 student", author: "MBA at Columbia" },
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                        <MessageCircle className="w-4 h-4" />
                        What Students Say
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                        Words from Our Community
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quotes.map((quote, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5"
                        >
                            <Quote className="w-6 h-6 text-blue-500/20 mb-2" />
                            <p className="text-gray-900 dark:text-white font-medium mb-2">&ldquo;{quote.text}&rdquo;</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">— {quote.author}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Stats Section
function StatsSection() {
    const stats = [
        { value: "10K+", label: "Students Helped" },
        { value: "500+", label: "Jobs Landed" },
        { value: "85%", label: "Found H-1B" },
        { value: "4.9/5", label: "Rating" },
    ];

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
                        Proven Track Record
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
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
                    className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 md:p-12 text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6">
                        <Send className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Share Your Success Story
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                        Did TrackMyOPT help you land your dream job or stay compliant? We'd love to hear your story!
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                badge="Success Stories"
                headline="Real Results from Real Students"
                subheadline="See how TrackMyOPT has helped thousands of international students navigate OPT, find H-1B sponsors, and land their dream jobs at top companies."
                ctaText="Start Your Journey"
                ctaHref="/login"
                secondaryCta={{
                    text: "See Features",
                    href: "/features"
                }}
                gradient="from-green-600 to-emerald-600"
                visual={<SuccessStatsVisual />}
            />

            {/* Stats */}
            <StatsSection />

            {/* Case Studies */}
            <CaseStudies />

            {/* Quote Wall */}
            <QuoteWall />

            {/* Submit Story */}
            <SubmitStory />

            {/* CTA */}
            <FeatureCTA
                headline="Ready to Write Your Story?"
                subheadline="Join thousands of students who are taking control of their career journey."
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
