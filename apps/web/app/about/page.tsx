"use client";

import { motion } from "framer-motion";
import { Users, Heart, Target, Zap, Clock, GraduationCap } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";
import { FoundersNote } from "../../components/features/FoundersNote";


// Animated Team Visual Component
function TeamVisual() {
    const teamMembers = [
        { initial: "A", role: "Founder", color: "from-blue-500 to-indigo-600" },
        { initial: "S", role: "Tech Lead", color: "from-purple-500 to-pink-600" },
        { initial: "R", role: "Designer", color: "from-green-500 to-teal-600" },
    ];

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Our Team</span>
                </div>

                <div className="flex justify-center -space-x-4 mb-6">
                    {teamMembers.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xl border-4 border-white dark:border-zinc-900 shadow-lg`}
                        >
                            {member.initial}
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mb-6">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        Built by F-1 Students
                    </motion.p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Who walked your path</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">3+</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Years Building</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">2,500+</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Students Helped</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mission Section
function MissionSection() {
    const values = [
        { icon: Heart, title: "Student-First", description: "Every feature is built with international students in mind" },
        { icon: Target, title: "Accuracy", description: "Built using publicly available USCIS guidelines and regulations" },
        { icon: Zap, title: "Simplicity", description: "Complex immigration made simple and stress-free" },
        { icon: Users, title: "Community", description: "A network of students helping each other succeed" },
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                        <Target className="w-4 h-4" />
                        Our Mission
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Making Immigration Less Stressful
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        We believe every international student deserves the tools and information to build a successful career in the US.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:border-blue-500/50 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <value.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Founder Story Timeline
function FounderStory() {
    const milestones = [
        { year: "2019", title: "The Struggle Begins", description: "Navigating OPT as an F-1 student, missing deadlines, and the stress of uncertainty", icon: GraduationCap },
        { year: "2020", title: "The Idea", description: "Built a simple spreadsheet to track OPT deadlines, friends started asking for copies", icon: Target },
        { year: "2022", title: "TrackMyOPT Launches", description: "Turned the spreadsheet into a full platform, helping hundreds of students", icon: Zap },
        { year: "2024", title: "2,500+ Students", description: "Growing community of international students taking control of their careers", icon: Users },
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                        <Clock className="w-4 h-4" />
                        Our Journey
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        From Personal Struggle to Student Solution
                    </h2>
                </motion.div>

                <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 hidden md:block" />

                    <div className="space-y-12">
                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex gap-8"
                            >
                                <div className="hidden md:flex relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center flex-shrink-0">
                                    <milestone.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{milestone.year}</span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2">{milestone.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Stats Section
function StatsSection() {
    const stats = [
        { value: "2,500+", label: "Students Helped", color: "blue" },
        { value: "500+", label: "Jobs Landed", color: "green" },
        { value: "25K+", label: "H-1B Sponsors", color: "purple" },
        { value: "98%", label: "Satisfaction", color: "amber" },
    ];

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
                        Our Impact in Numbers
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
                                <p className="text-blue-100 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// FAQ Section
function AboutFAQ() {
    const faqs = [
        {
            question: "Who built TrackMyOPT?",
            answer: "TrackMyOPT was built by former F-1 students who personally experienced the challenges of navigating OPT. We understand your journey because we lived it."
        },
        {
            question: "Is TrackMyOPT affiliated with USCIS?",
            answer: "No, we are an independent platform. While we provide tools based on USCIS guidelines, we are not affiliated with or endorsed by USCIS. Always verify critical information with your DSO or immigration attorney."
        },
        {
            question: "How is my data protected?",
            answer: "Your privacy is paramount. We use bank-level encryption, never sell your data, and give you full control to delete your account and data at any time."
        },
        {
            question: "Can I trust the H-1B sponsor data?",
            answer: "Our sponsor database is compiled from official Department of Labor LCA data, updated quarterly. We cross-reference with E-Verify and USCIS data for accuracy."
        },
    ];

    return (
        <section className="py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                badge="Our Story"
                headline="Built by F-1 Students, for F-1 Students"
                subheadline="We've walked the same path — navigating OPT deadlines, hunting for H-1B sponsors, and building careers in the US. TrackMyOPT is the tool we wish existed when we were in your shoes."
                ctaText="Join Our Community"
                ctaHref="/login"
                secondaryCta={{
                    text: "See Our Features",
                    href: "/features"
                }}
                gradient="from-blue-600 to-indigo-600"
                visual={<TeamVisual />}
            />

            {/* Mission */}
            <MissionSection />

            {/* Stats */}
            <StatsSection />

            {/* Founders Note */}
            <FoundersNote />

            {/* Founder Story */}
            <FounderStory />

            {/* FAQ */}
            <AboutFAQ />

            {/* CTA */}
            <FeatureCTA
                headline="Join 2,500+ Students"
                subheadline="Start your journey with the tools built by people who understand your path."
                primaryCTA={{
                    text: "Start Free Today",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "Explore Features",
                    href: "/features",
                }}
                gradient="blue"
                icon={<Users className="w-12 h-12 text-white" />}
            />

            <LandingFooter />
        </main>
    );
}
