"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    Search,
    Building2,
    Shield,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Scale,
    MapPin,
    Users,
    BadgeCheck,
    ExternalLink,
    XCircle,
    Clock,
    Briefcase
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";


import { SponsorSearchPreview } from "@/components/features/SponsorSearchPreview";
import { HiddenDataLayers } from "@/components/features/HiddenDataLayers";
import { H2, Lead, P } from "@/components/ui/typography";

// Mock Sponsor Card Component (Keeping this as Hero Visual)
function SponsorCardDemo() {
    return (
        <div className="relative">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur-2xl opacity-20" />

            <motion.div
                className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl"
                initial={{ rotateY: -5 }}
                whileHover={{ rotateY: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">Google LLC</span>
                            <BadgeCheck className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Mountain View, CA
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">928</div>
                        <p className="text-xs text-gray-500">H-1Bs in 2025</p>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <motion.span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        E-Verified
                    </motion.span>
                    <motion.span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <TrendingUp className="w-3 h-3" />
                        +12% YoY
                    </motion.span>
                    <motion.span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Scale className="w-3 h-3" />
                        Fragomen LLP
                    </motion.span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">98%</p>
                        <p className="text-xs text-gray-500">Approval Rate</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">$165K</p>
                        <p className="text-xs text-gray-500">Avg Salary</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">15+</p>
                        <p className="text-xs text-gray-500">Years Sponsoring</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Signal Grid Component
function SignalGrid() {
    const signals = [
        { icon: CheckCircle2, title: "E-Verify Status", description: "Instantly see if employer is enrolled", color: "emerald" },
        { icon: AlertTriangle, title: "Virtual Office Detection", description: "AI-flagged suspicious addresses", color: "amber" },
        { icon: Scale, title: "Top Law Firm", description: "See who handles their cases", color: "purple" },
        { icon: TrendingUp, title: "Approval Trend", description: "Year-over-year sponsorship data", color: "blue" },
    ];

    return (
        <div className="grid sm:grid-cols-2 gap-6">
            {signals.map((signal, i) => (
                <motion.div
                    key={signal.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow"
                >
                    <div className={`w-12 h-12 rounded-xl bg-${signal.color}-100 dark:bg-${signal.color}-900/30 flex items-center justify-center mb-4`}>
                        <signal.icon className={`w-6 h-6 text-${signal.color}-600 dark:text-${signal.color}-400`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{signal.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{signal.description}</p>
                </motion.div>
            ))}
        </div>
    );
}

// Data Stats Component
function DataStats() {
    const stats = [
        { value: "25,000+", label: "H-1B Sponsors" },
        { value: "250K+", label: "LCA Filings Analyzed" },
        { value: "Q4 2025", label: "Latest Data" },
        { value: "Daily", label: "Updates" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                >
                    <motion.div
                        className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        {stat.value}
                    </motion.div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
            ))}
        </div>
    );
}

export default function SponsorsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="H-1B Sponsor Database & Research Tool"
                description="Search 25,000+ verified H-1B sponsors with real LCA filing data. See sponsorship history, approval rates, salary ranges, and fraud alerts before applying. Make strategic job search decisions."
                featurePath="/features/sponsors"
                faqItems={[
                  {q: "Where does your H-1B sponsor data come from?", a: "Our data comes from official sources including the Department of Labor LCA filings, USCIS H-1B employer data, and E-Verify enrollment records. We update our database quarterly with the latest filing information."},
                  {q: "What does the Sponsor Score mean?", a: "The Sponsor Score is a 0-100 rating based on approval rates, sponsorship volume, trend direction, and company stability. Higher scores indicate more reliable sponsors with consistent H-1B activity."},
                  {q: "How do I know if a company still sponsors H-1B?", a: "Look for recent FY2025 filings on the company profile. Companies with active filings in the current fiscal year are actively sponsoring. We also show year-over-year trends to help you identify growing vs declining sponsors."},
                  {q: "What are the fraud alerts for?", a: "We flag companies with DOL investigations, unusually high denial rates, virtual office addresses (common in visa fraud), and other red flags. This helps you avoid problematic sponsors."},
                  {q: "Can I see what roles companies sponsor for?", a: "Yes! Each sponsor profile shows LCA filings including job titles, salary ranges, and work locations. You can see exactly what positions companies have sponsored historically."},
                  {q: "Is this database free?", a: "Yes, the H-1B sponsor database is free for all users. Premium subscribers get additional features like saved sponsors, advanced filters, and direct career page links."}
                ]}
            />
            {/* Hero */}
            <FeatureHero
                badge="Most Popular"
                headline="25,000+ H-1B Sponsors. Zero Guesswork."
                subheadline="Research employers with real LCA data, fraud alerts, and hiring trends before you apply. Make informed decisions about your career."
                ctaText="Search Sponsors Free"
                ctaHref="/dashboard/sponsors"
                secondaryCta={{
                    text: "See Sample Data",
                    href: "#demo"
                }}
                visual={<SponsorSearchPreview />}
            />

            {/* Data Stats */}
            <section className="py-16 border-b border-gray-100 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <DataStats />
                </div>
            </section>

            {/* Feature 1: Search Demo */}
            <section id="demo" className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                                <Search className="w-4 h-4" />
                                Instant Search
                            </div>
                            <H2>Find Any Sponsor in Seconds</H2>
                            <P>
                                Search by company name, location, or industry. Get instant results with
                                sponsorship history, approval rates, and salary data.
                            </P>
                            <ul className="space-y-4">
                                {[
                                    "Autocomplete with real company data",
                                    "Filter by location, industry, and size",
                                    "Sort by approvals, salary, or trend",
                                    "Save favorites for quick access"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <SponsorSearchPreview />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Intelligence Signals */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                            <Shield className="w-4 h-4" />
                            Intelligence Signals
                        </div>
                        <H2>More Than Just Numbers</H2>
                        <Lead>
                            Our AI analyzes patterns to surface red flags and opportunities
                            you won't find anywhere else.
                        </Lead>
                    </motion.div>

                    <SignalGrid />
                </div>
            </section>

            {/* Feature 3: Fraud Protection */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <HiddenDataLayers />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                                <AlertTriangle className="w-4 h-4" />
                                Fraud Protection
                            </div>
                            <H2>Avoid Visa Fraud Before It's Too Late</H2>
                            <P>
                                Our system flags potential red flags like virtual offices, unusual
                                filing patterns, and companies with DOL investigations.
                            </P>
                            <Link
                                href="/resources/report-fraud"
                                className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold hover:gap-3 transition-all"
                            >
                                Learn about visa fraud
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why This Matters Section */}
            <FeatureWhyMatters
                headline="H-1B Sponsorship is Competitive. Be Strategic."
                description="With limited H-1B visa slots and increasing denial rates, applying to the right sponsors matters more than ever. Our data helps you target companies with proven sponsorship track records."
                accentColor="emerald"
                stats={[
                    { value: "25,000+", label: "Verified H-1B sponsors in our database", icon: <Building2 className="w-5 h-5" /> },
                    { value: "72%", label: "Applications are to non-sponsors", icon: <XCircle className="w-5 h-5" /> },
                    { value: "$15K+", label: "Average cost to sponsor an H-1B", icon: <Briefcase className="w-5 h-5" /> },
                    { value: "85 Days", label: "Average H-1B processing time", icon: <Clock className="w-5 h-5" /> },
                ]}
            />

            {/* Testimonial */}
            <FeatureTestimonial
                quote="I was applying to hundreds of companies randomly. TrackMyOPT showed me which ones actually sponsor H-1B visas. I got 3 offers in 2 months from verified sponsors."
                author={{
                    name: "Rahul Krishnan",
                    role: "Data Scientist, STEM OPT",
                    university: "USC",
                }}
                accentColor="emerald"
            />

            {/* FAQ Section */}
            <FeatureFAQ
                title="H-1B Sponsor Database FAQ"
                subtitle="Everything you need to know about finding H-1B sponsors"
                accentColor="emerald"
                items={[
                    {
                        question: "Where does your H-1B sponsor data come from?",
                        answer: "Our data comes from official sources including the Department of Labor LCA filings, USCIS H-1B employer data, and E-Verify enrollment records. We update our database quarterly with the latest filing information."
                    },
                    {
                        question: "What does the Sponsor Score mean?",
                        answer: "The Sponsor Score is a 0-100 rating based on approval rates, sponsorship volume, trend direction, and company stability. Higher scores indicate more reliable sponsors with consistent H-1B activity."
                    },
                    {
                        question: "How do I know if a company still sponsors H-1B?",
                        answer: "Look for recent FY2025 filings on the company profile. Companies with active filings in the current fiscal year are actively sponsoring. We also show year-over-year trends to help you identify growing vs declining sponsors."
                    },
                    {
                        question: "What are the fraud alerts for?",
                        answer: "We flag companies with DOL investigations, unusually high denial rates, virtual office addresses (common in visa fraud), and other red flags. This helps you avoid problematic sponsors."
                    },
                    {
                        question: "Can I see what roles companies sponsor for?",
                        answer: "Yes! Each sponsor profile shows LCA filings including job titles, salary ranges, and work locations. You can see exactly what positions companies have sponsored historically."
                    },
                    {
                        question: "Is this database free?",
                        answer: "Yes, the H-1B sponsor database is free for all users. Premium subscribers get additional features like saved sponsors, advanced filters, and direct career page links."
                    },
                ]}
            />

            {/* Final CTA */}
            <FeatureCTA
                headline="Find Your H-1B Sponsor Today"
                subheadline="Stop wasting time on companies that don't sponsor. Search 25,000+ verified sponsors and find your path to the H-1B visa."
                primaryCTA={{
                    text: "Search Sponsors Free",
                    href: "/dashboard/career/h1b-sponsors",
                }}
                secondaryCTA={{
                    text: "Learn About H-1B",
                    href: "/resources/h1b-guide",
                }}
                gradient="emerald"
                icon={<Building2 className="w-12 h-12 text-white" />}
                badge="25,000+ Sponsors"
            />
        </main>
    );
}
