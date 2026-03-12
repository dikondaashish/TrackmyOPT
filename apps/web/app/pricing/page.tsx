"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X, ArrowRight, Shield, HelpCircle } from "lucide-react";
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
        q: "Is TrackMyOPT really free?",
        a: "Yes! Our Free plan includes all core OPT tracking features — timeline calculator, unemployment clock, STEM extension tools, manual USCIS case checks, and basic career tools. These are free forever, no credit card required.",
    },
    {
        q: "Can I try Pro before paying?",
        a: "Absolutely! Pro comes with a 7-day free trial. You get full access to all premium features and can cancel anytime before the trial ends without being charged.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment processor. All transactions are encrypted and PCI DSS compliant.",
    },
    {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel your Pro or Dedicated subscription at any time from your Settings page. You'll continue to have access until the end of your current billing period.",
    },
    {
        q: "Is there a student discount?",
        a: "Our Free plan is designed specifically for students and includes everything you need to track OPT compliance. Pro is priced at just $4.99/month — less than a coffee — to make premium features accessible to every international student.",
    },
    {
        q: "What happens to my data if I downgrade?",
        a: "Your data is always safe. If you downgrade from Pro to Free, you'll retain access to all your OPT dates, employment history, and case status data. Premium features like document vault and auto-checks will pause until you re-upgrade.",
    },
    {
        q: "Do you offer annual billing?",
        a: "Yes! Annual billing saves you up to 40% compared to monthly. Pro annual is $49.99/year (vs $59.88 monthly) and Dedicated annual is $149.99/year (vs $179.88 monthly).",
    },
    {
        q: "Is my payment information secure?",
        a: "All payments are processed by Stripe, a PCI Level 1 certified payment processor (the highest security standard). We never store your credit card information on our servers.",
    },
];

export default function PricingPage() {
    return (
        <>
            <CanonicalURL url="https://www.trackmyopt.com/pricing" />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Hero */}
            <section className="pt-32 pb-8 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                            <Shield className="w-4 h-4" />
                            Free Forever Plan Available
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Start tracking your OPT for free. Upgrade when you need premium features like auto USCIS checks, document vault, and unlimited H-1B data.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards - reuse the existing component */}
            <LandingPricing />

            {/* Detailed Comparison Table */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Compare Plans in Detail
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            See exactly what&apos;s included in each plan
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 gap-0 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700 p-4">
                            <div className="font-semibold text-gray-900 dark:text-white">Feature</div>
                            <div className="text-center">
                                <div className="font-semibold text-gray-900 dark:text-white">Free</div>
                                <div className="text-sm text-gray-500">$0/forever</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-blue-600">Pro</div>
                                <div className="text-sm text-gray-500">$4.99/mo</div>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold text-purple-600">Dedicated</div>
                                <div className="text-sm text-gray-500">$14.99/mo</div>
                            </div>
                        </div>

                        {/* Table Body */}
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
                                        {[feature.free, feature.pro, feature.dedicated].map((value, i) => (
                                            <div key={i} className="text-center">
                                                {typeof value === "boolean" ? (
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
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Pricing Questions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Everything you need to know about our plans
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
                        <h2 className="text-3xl font-bold mb-4">Ready to Protect Your OPT Status?</h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                            Join 2,500+ F-1 students who trust TrackMyOPT to stay compliant and land H-1B
                            sponsorship.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Start Tracking Free <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/features/compliance"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                            >
                                See All Features
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: pricingFaqs.map((faq) => ({
                            "@type": "Question",
                            name: faq.q,
                            acceptedAnswer: { "@type": "Answer", text: faq.a },
                        })),
                    }),
                }}
            />
        </main>
        </>
    );
}
