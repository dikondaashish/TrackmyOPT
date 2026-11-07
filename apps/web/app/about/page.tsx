"use client";

import { motion } from "framer-motion";
import { Users, Heart, Target, Zap, GraduationCap } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";
import { FoundersNote } from "../../components/features/FoundersNote";


// Animated Team Visual Component
function TeamVisual() {
    const teamMembers = [
        { initial: "A", role: "Founder", color: "bg-blue-600" },
        { initial: "S", role: "Tech Lead", color: "bg-violet-600" },
        { initial: "R", role: "Designer", color: "bg-emerald-600" },
    ];

    return (
        <div className="relative">
            <div className="relative rounded-xl border border-border bg-card p-8 shadow-elevated">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-muted-foreground">Our Team</span>
                </div>

                <div className="flex justify-center -space-x-4 mb-6">
                    {teamMembers.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className={`w-16 h-16 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-xl border-4 border-card`}
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
                        className="text-lg font-semibold text-foreground"
                    >
                        Built by F-1 Students
                    </motion.p>
                    <p className="text-sm text-muted-foreground">Who walked your path</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-center dark:border-blue-900 dark:bg-blue-950">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">3+</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Years Building</p>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950">
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">3,500+</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">Users Signed Up</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mission Section
function MissionSection() {
    const values = [
        { icon: Heart, title: "Student-First", description: "Every feature is built with international students in mind", tile: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
        { icon: Target, title: "Accuracy", description: "Built using publicly available USCIS guidelines and regulations", tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" },
        { icon: Zap, title: "Simplicity", description: "Complex immigration made simple and stress-free", tile: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300" },
        { icon: Users, title: "Community", description: "A network of students helping each other succeed", tile: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300" },
    ];

    return (
        <section className="py-24 relative bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Making Immigration Less Stressful
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                            className="surface-card p-6"
                        >
                            <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-lg ${value.tile}`}>
                                <value.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                            <p className="text-sm leading-6 text-muted-foreground">{value.description}</p>
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
        { year: "2026", title: "3,500+ Users Signed Up", description: "More people signing up to plan their OPT and careers", icon: Users },
    ];

    return (
        <section className="py-24 bg-surface border-y border-border relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        From Personal Struggle to Student Solution
                    </h2>
                </motion.div>

                <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-muted hidden md:block" />

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
                                <div className="hidden md:flex relative z-10 w-16 h-16 rounded-full bg-blue-600 border-4 border-surface items-center justify-center flex-shrink-0 shadow-card">
                                    <milestone.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1 surface-card p-6">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{milestone.year}</span>
                                    <h3 className="text-xl font-bold text-foreground mt-1 mb-2">{milestone.title}</h3>
                                    <p className="text-muted-foreground">{milestone.description}</p>
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
        { value: "3,500+", label: "Users Signed Up", color: "text-blue-600 dark:text-blue-400", accent: "border-t-blue-600" },
        { value: "10,000+", label: "People Using Free Tools", color: "text-violet-600 dark:text-violet-400", accent: "border-t-violet-600" },
        { value: "25K+", label: "H-1B Sponsors", color: "text-emerald-600 dark:text-emerald-400", accent: "border-t-emerald-600" },
        { value: "98%", label: "Satisfaction", color: "text-emerald-600 dark:text-emerald-400", accent: "border-t-emerald-600" },
    ];

    return (
        <section className="py-24 bg-surface border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
                        Our Impact in Numbers
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`surface-card border-t-[3px] p-6 text-center ${stat.accent}`}
                            >
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
        <section className="py-24 bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                <div className="surface-card divide-y divide-border overflow-hidden">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6"
                        >
                            <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                            <p className="text-muted-foreground text-sm leading-6">{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                headline="Built by F-1 Students, for F-1 Students"
                subheadline="We've walked the same path — navigating OPT deadlines, hunting for H-1B sponsors, and building careers in the US. TrackMyOPT is the tool we wish existed when we were in your shoes."
                ctaText="Join Our Community"
                ctaHref="/login"
                secondaryCta={{
                    text: "See Our Features",
                    href: "/features"
                }}
                gradient="bg-blue-600"
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
                headline="Join 3,500+ People Who Signed Up"
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
