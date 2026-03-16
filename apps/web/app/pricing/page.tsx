"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Check,
    X,
    ArrowRight,
    Shield,
    HelpCircle,
    AlertTriangle,
    Star,
    Clock,
    Bell,
    FileCheck,
    Briefcase,
    Zap,
} from "lucide-react";
import { CanonicalURL } from "@/components/CanonicalURL";
import { LandingPricing } from "@/components/landing/LandingPricing";

const comparisonFeatures = [
    {
        category: "Immigration Tools",
        features: [
            { name: "OPT Filing Window Calculator", free: true, pro: true, dedicated: true },
            { name: "90-Day Unemployment Tracker", free: true, pro: true, dedicated: true },
            { name: "STEM Extension Calculator", free: true, pro: true, dedicated: true },
            { name: "STEM 60-Day Unemployment Tracker", free: true, pro: true, dedicated: true },
        ],
    },
    {
        category: "USCIS Case Tracking",
        features: [
            { name: "Manual Case Status Check", free: true, pro: true, dedicated: true },
            { name: "Daily Auto-Checks", free: false, pro: true, dedicated: true },
            { name: "Instant Status Change Alerts", free: false, pro: true, dedicated: true },
        ],
    },
    {
        category: "H-1B Sponsor Data",
        features: [
            { name: "Search 100 Companies", free: true, pro: true, dedicated: true },
            { name: "Unlimited Company Access", free: false, pro: true, dedicated: true },
            { name: "Approval Rate Data", free: false, pro: true, dedicated: true },
        ],
    },
    {
        category: "Career Tools",
        features: [
            { name: "Job Application Tracker", free: "5 jobs", pro: "Unlimited", dedicated: "Unlimited" },
            { name: "AI Resume Generator", free: "5/mo", pro: "500/mo", dedicated: "1000/mo" },
            { name: "ATS Resume Scanner", free: "5/mo", pro: "Unlimited", dedicated: "Unlimited" },
        ],
    },
    {
        category: "Documents & Reminders",
        features: [
            { name: "Basic Notifications", free: true, pro: true, dedicated: true },
            { name: "Daily 9AM Email Reminders", free: false, pro: true, dedicated: true },
            { name: "Secure Document Vault", free: false, pro: true, dedicated: true },
            { name: "Document Expiry Reminders", free: false, pro: true, dedicated: true },
        ],
    },
    {
        category: "Premium Benefits",
        features: [
            { name: "Sprintax Tax Coupon ($20 Value)", free: false, pro: true, dedicated: true },
            { name: "Chrome Extension Priority Alerts", free: false, pro: true, dedicated: true },
            { name: "1-on-1 Lawyer Session (1 hr/mo)", free: false, pro: false, dedicated: true },
            { name: "Complete Application Audit", free: false, pro: false, dedicated: true },
            { name: "24/7 Dedicated Support", free: false, pro: false, dedicated: true },
        ],
    },
];

const pricingFaqs = [
    {
        q: "Is TrackMyOPT premium worth it?",
        a: "Yes — for F-1 students on OPT or STEM OPT, premium is worth it because it automates unemployment day tracking, sends deadline alerts before USCIS cutoffs, and consolidates job tracking, resume tools, and I-983 planning in one place. Missing an OPT deadline can result in status termination, making the cost of premium negligible compared to the risk.",
    },
    {
        q: "What does TrackMyOPT premium include that the free plan doesn't?",
        a: "Premium adds automated deadline reminders, unemployment day alerts, daily USCIS case auto-checks, employer tracking, unlimited AI resume generation, secure document vault, STEM OPT extension planning, and priority support — all designed to eliminate manual USCIS monitoring and reduce compliance risk.",
    },
    {
        q: "Can I track OPT without TrackMyOPT premium?",
        a: "You can track basic dates manually with the free plan, but premium removes the risk of human error for unemployment day counts, which directly affect your F-1 status. A single miscalculation could push you over the 90-day limit and trigger status termination.",
    },
    {
        q: "Is TrackMyOPT free enough for OPT students?",
        a: "The free plan is a solid starting point for basic OPT date tracking. However, OPT students managing unemployment limits, job transitions, or STEM OPT extensions benefit significantly from premium automation to stay compliant and avoid costly errors.",
    },
    {
        q: "Is TrackMyOPT really free?",
        a: "Yes. The Free plan includes core OPT tracking features — timeline calculator, unemployment clock, STEM extension tools, manual USCIS case checks, and basic career tools. These are free forever, no credit card required.",
    },
    {
        q: "Can I try Pro before paying?",
        a: "Absolutely. Pro comes with a 7-day free trial with full access to all premium features. Cancel anytime before the trial ends without being charged.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe, a PCI DSS Level 1 certified payment processor. All transactions are encrypted end-to-end.",
    },
    {
        q: "Can I cancel my subscription anytime?",
        a: "Yes. Cancel your Pro or Dedicated subscription at any time from your Settings page. You keep access until the end of your current billing period.",
    },
    {
        q: "Do you offer annual billing?",
        a: "Yes. Annual billing saves you up to 40% compared to monthly. Pro annual is $49.99/year (vs $59.88 monthly) and Dedicated annual is $149.99/year (vs $179.88 monthly).",
    },
    {
        q: "Is my payment information secure?",
        a: "All payments are processed by Stripe, a PCI Level 1 certified payment processor. We never store your credit card information on our servers.",
    },
];

const testimonials = [
    {
        quote: "I was manually tracking my unemployment days in a spreadsheet and almost missed the 90-day limit. Premium alerts saved my OPT status — I got a warning at day 75 and found a job in time.",
        name: "Priya S.",
        role: "CS Graduate",
        university: "University of Illinois",
    },
    {
        quote: "The daily USCIS auto-check caught my case status change the same morning it happened. Without premium, I wouldn't have known for days. Worth every penny for the peace of mind alone.",
        name: "Wei L.",
        role: "ECE Graduate",
        university: "Georgia Tech",
    },
    {
        quote: "As a STEM OPT student, tracking the 150-day unemployment limit across two employers was a nightmare. TrackMyOPT Premium handles it automatically and sends me weekly reports. I recommend it to every international student I know.",
        name: "Ravi M.",
        role: "Data Science Graduate",
        university: "UC Berkeley",
    },
];

const whyPremiumReasons = [
    {
        icon: Bell,
        title: "Automated Deadline Alerts",
        description: "Daily 9AM email reminders before every USCIS cutoff. Never miss a filing window, reporting deadline, or unemployment limit.",
        risk: "Missing a deadline can terminate your F-1 status",
    },
    {
        icon: Clock,
        title: "Real-Time Unemployment Tracking",
        description: "Automatic counting of unemployment days with alerts at 60, 75, and 85 days. Tracks across job transitions and gaps.",
        risk: "Exceeding 90 days ends your OPT authorization",
    },
    {
        icon: Shield,
        title: "Daily USCIS Case Monitoring",
        description: "Your case status checked every morning. Instant email notification the moment anything changes — approvals, RFEs, or transfers.",
        risk: "Delayed RFE response can result in case denial",
    },
    {
        icon: FileCheck,
        title: "Secure Document Vault",
        description: "Store your I-20, EAD, passport, and tax documents in one encrypted vault with expiry reminders. Always ready for employer audits.",
        risk: "Lost documents cause delays and missed opportunities",
    },
    {
        icon: Briefcase,
        title: "Unlimited Career Tools",
        description: "Unlimited AI resume generation, ATS scanning, job tracking, and full H-1B sponsor database with approval rate data.",
        risk: "Poor resume formatting = automatic ATS rejection",
    },
    {
        icon: Zap,
        title: "STEM OPT Compliance",
        description: "I-983 training plan tracking, E-Verify employer verification, and 150-day unemployment monitoring across the full 36-month OPT period.",
        risk: "STEM OPT violations affect future H-1B eligibility",
    },
];

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
                {/* Hero — urgency-driven, compliance-focused */}
                <section className="pt-32 pb-8 text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-6">
                                <AlertTriangle className="w-4 h-4" />
                                One compliance mistake can end your F-1 status
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                One Missed Deadline Can End{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Your OPT Status
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
                                TrackMyOPT Premium automates unemployment
                                tracking, USCIS deadline alerts, and STEM OPT
                                compliance — so you never risk your F-1 status
                                over a missed date.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Free plan available. Premium from $4.99/mo —
                                less than a single missed deadline costs.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <LandingPricing />

                {/* Why Premium Section */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Why 2,500+ Students Choose Premium
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Every feature exists because an F-1 student
                                needed it to avoid a real compliance risk.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {whyPremiumReasons.map((reason) => {
                                const Icon = reason.icon;
                                return (
                                    <motion.div
                                        key={reason.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            {reason.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {reason.description}
                                        </p>
                                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                                                {reason.risk}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Semantic Comparison Table — Free vs Premium */}
                <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Free vs Premium — Side by Side
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                See exactly what premium adds to your OPT
                                compliance toolkit
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-x-auto shadow-lg">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-zinc-800/50">
                                        <th
                                            scope="col"
                                            className="text-left px-6 py-4 font-semibold text-gray-900 dark:text-white"
                                        >
                                            Feature
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-center px-6 py-4 font-semibold text-gray-500 dark:text-gray-400"
                                        >
                                            Free
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-center px-6 py-4"
                                        >
                                            <div className="inline-flex flex-col items-center">
                                                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                                                    RECOMMENDED
                                                </span>
                                                <span className="font-semibold text-blue-600">
                                                    Premium
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { feature: "OPT Unemployment Day Tracking", free: "Manual", premium: "Automated with alerts at 60, 75, 85 days" },
                                        { feature: "USCIS Case Status Monitoring", free: "Manual check", premium: "Daily auto-check + instant email alerts" },
                                        { feature: "Deadline Reminders", free: "Basic in-app", premium: "Daily 9AM email + push notifications" },
                                        { feature: "H-1B Sponsor Database", free: "100 companies", premium: "Unlimited + approval rate data" },
                                        { feature: "AI Resume Generator", free: "5/month", premium: "500/month + unlimited ATS scans" },
                                        { feature: "Job Application Tracker", free: "5 jobs", premium: "Unlimited jobs" },
                                        { feature: "Document Vault", free: false, premium: "Encrypted storage + expiry reminders" },
                                        { feature: "STEM OPT Extension Planner", free: "Basic calculator", premium: "Full I-983 tracking + E-Verify check" },
                                        { feature: "Sprintax Tax Coupon ($20)", free: false, premium: true },
                                        { feature: "Chrome Extension Priority Alerts", free: false, premium: true },
                                        { feature: "Priority Support", free: false, premium: true },
                                    ].map((row, i) => (
                                        <tr
                                            key={i}
                                            className="border-t border-gray-100 dark:border-zinc-800"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {row.feature}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {row.free === false ? (
                                                    <X className="w-5 h-5 text-gray-300 dark:text-zinc-600 mx-auto" />
                                                ) : row.free === true ? (
                                                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {row.free}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center bg-blue-50/50 dark:bg-blue-900/10">
                                                {row.premium === true ? (
                                                    <Check className="w-5 h-5 text-blue-600 mx-auto" />
                                                ) : (
                                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                        {row.premium}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="text-center mt-8">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                            >
                                Start 7-Day Free Trial
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                No credit card required to start. Cancel anytime.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Testimonials with structured data */}
                <section className="py-24">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Students Who Protected Their Status with Premium
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6"
                                >
                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: 5 }).map(
                                            (_, j) => (
                                                <Star
                                                    key={j}
                                                    className="w-4 h-4 text-amber-400 fill-amber-400"
                                                />
                                            )
                                        )}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                    <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {t.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t.role}, {t.university}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Full Comparison Table */}
                <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Complete Plan Comparison
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Every feature across Free, Pro, and Dedicated
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg">
                            <div className="grid grid-cols-4 gap-0 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700 p-4">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    Feature
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        Free
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        $0/forever
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-600">
                                        Pro
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        $4.99/mo
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-purple-600">
                                        Dedicated
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        $14.99/mo
                                    </div>
                                </div>
                            </div>

                            {comparisonFeatures.map((category) => (
                                <div key={category.category}>
                                    <div className="bg-gray-50/50 dark:bg-zinc-800/30 px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            {category.category}
                                        </span>
                                    </div>
                                    {category.features.map((feature) => (
                                        <div
                                            key={feature.name}
                                            className="grid grid-cols-4 gap-0 px-4 py-3 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                                        >
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                {feature.name}
                                            </div>
                                            {[feature.free, feature.pro, feature.dedicated].map(
                                                (value, i) => (
                                                    <div
                                                        key={i}
                                                        className="text-center"
                                                    >
                                                        {typeof value ===
                                                        "boolean" ? (
                                                            value ? (
                                                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                                                            ) : (
                                                                <X className="w-5 h-5 text-gray-300 dark:text-zinc-600 mx-auto" />
                                                            )
                                                        ) : (
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {value}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Pricing &amp; Premium Questions
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Everything you need to know about our plans and
                                what premium delivers
                            </p>
                        </div>

                        <div className="space-y-4">
                            {pricingFaqs.map((faq, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6"
                                >
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        {faq.q}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
                            <h2 className="text-3xl font-bold mb-4">
                                Your OPT Status Is Too Important to Leave to
                                Chance
                            </h2>
                            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                                Join 2,500+ F-1 students who trust TrackMyOPT
                                Premium to stay compliant, hit every deadline,
                                and land H-1B sponsorship.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    Start 7-Day Free Trial{" "}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/premium-worth-it"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                                >
                                    Is Premium Worth It?
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
