"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    AlertTriangle,
    BadgeDollarSign,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    GraduationCap,
    Heart,
    HeartPulse,
    Hospital,
    Shield,
    ShieldCheck,
    Stethoscope,
    UserCheck,
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { H2, Lead, P } from "@/components/ui/typography";

function InsuranceComparisonCards() {
    const plans = [
        { name: "Marketplace (ACA)", price: "$0-120", period: "/mo", badge: "Most Popular", highlight: true, features: ["Comprehensive coverage", "Subsidies available", "Pre-existing conditions covered"] },
        { name: "Short-Term", price: "$50-150", period: "/mo", badge: "Quick Start", highlight: false, features: ["Fast enrollment", "Lower premiums", "Limited coverage"] },
        { name: "Catastrophic", price: "$100-200", period: "/mo", badge: "Under 30", highlight: false, features: ["Low monthly cost", "High deductible", "Emergency coverage"] },
    ];

    return (
        <div className="space-y-3">
            {plans.map((plan, i) => (
                <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl border p-5 shadow-sm ${
                        plan.highlight
                            ? "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-rose-200 dark:border-rose-800/40"
                            : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{plan.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            plan.highlight
                                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300"
                                : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
                        }`}>{plan.badge}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                        <span className="text-sm text-gray-500">{plan.period}</span>
                    </div>
                    <div className="space-y-1.5">
                        {plan.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                {f}
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

const coverageTypes = [
    {
        title: "Marketplace / ACA",
        description: "Comprehensive plans through Healthcare.gov. Many OPT students qualify for subsidies, bringing costs to $0/month. Open enrollment Nov–Jan, or qualify for a Special Enrollment Period.",
        icon: <ShieldCheck className="w-6 h-6" />,
        pros: ["Pre-existing conditions covered", "Preventive care included", "Subsidies may apply"],
        color: "rose",
    },
    {
        title: "Short-Term Plans",
        description: "Temporary coverage for gaps between plans. Fast enrollment, lower premiums, but limited benefits. Good for bridging the gap while waiting for employer coverage.",
        icon: <Clock className="w-6 h-6" />,
        pros: ["Enroll anytime", "Lower monthly cost", "Fast approval"],
        color: "pink",
    },
    {
        title: "Catastrophic Plans",
        description: "Low-premium, high-deductible plans for those under 30. Covers worst-case scenarios like hospitalizations. Requires a hardship exemption if over 30.",
        icon: <Hospital className="w-6 h-6" />,
        pros: ["Lowest premiums", "3 free primary care visits", "Emergency coverage"],
        color: "fuchsia",
    },
    {
        title: "University SHIP Extension",
        description: "Some universities allow you to extend your Student Health Insurance Plan after graduation. Coverage is often comprehensive but may be more expensive than marketplace plans.",
        icon: <GraduationCap className="w-6 h-6" />,
        pros: ["Familiar coverage", "No enrollment gaps", "Campus health access"],
        color: "purple",
    },
];

const timelineSteps = [
    { period: "Before Graduation", label: "University SHIP active", status: "covered", detail: "Your student plan covers you" },
    { period: "Grace Period", label: "SHIP may extend 30-60 days", status: "warning", detail: "Check your university policy" },
    { period: "OPT Starts", label: "You need new coverage", status: "action", detail: "Enroll in a plan ASAP" },
    { period: "Employer Coverage", label: "Employer plan kicks in", status: "covered", detail: "Usually after 60-90 day waiting period" },
];

const faqItems = [
    {
        question: "Do F-1 students on OPT need health insurance?",
        answer: "While there's no federal mandate requiring health insurance, being uninsured in the U.S. is extremely risky. A single ER visit can cost $5,000-$50,000+. Most F-1 students lose university coverage after graduation, making it essential to find a replacement plan during OPT.",
    },
    {
        question: "Can OPT students get Marketplace (ACA) insurance?",
        answer: "Yes! F-1 students on OPT can enroll in Marketplace plans through Healthcare.gov. Depending on your income, you may qualify for premium tax credits that significantly reduce your monthly cost — potentially to $0/month. Open enrollment runs November through January.",
    },
    {
        question: "What is a Special Enrollment Period?",
        answer: "A Special Enrollment Period (SEP) lets you enroll in Marketplace insurance outside of open enrollment. Losing your university health plan qualifies as a life event that triggers a 60-day SEP. You must enroll within 60 days of losing coverage.",
    },
    {
        question: "How much does health insurance cost on OPT?",
        answer: "Costs vary widely. Marketplace plans with subsidies can be $0-120/month. Short-term plans run $50-150/month. Catastrophic plans cost $100-200/month. Employer-sponsored plans (when available) are often the most affordable option with typical employee costs of $50-200/month.",
    },
    {
        question: "Does my employer have to provide health insurance?",
        answer: "Employers with 50+ full-time employees must offer coverage, but there's typically a 60-90 day waiting period. Smaller companies aren't required to offer insurance. During the waiting period, you'll need bridge coverage like a short-term plan or COBRA from your university.",
    },
    {
        question: "What if I can't afford health insurance?",
        answer: "Check if you qualify for Marketplace subsidies — many OPT students qualify for plans at $0/month. You can also look into community health centers that offer sliding-scale fees, short-term plans for basic coverage, or check if your state offers additional programs for low-income individuals.",
    },
];

export default function HealthInsurancePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="OPT Health Insurance Finder & Comparison Tool"
                description="Find affordable health insurance for OPT students. Compare Marketplace (ACA), short-term, catastrophic plans, and employer coverage. Many plans available from $0/month with subsidies."
                featurePath="/features/health-insurance"
                faqItems={[
                  {question: "Do F-1 students on OPT need health insurance?", answer: "While there's no federal mandate requiring health insurance, being uninsured in the U.S. is extremely risky. A single ER visit can cost $5,000-$50,000+. Most F-1 students lose university coverage after graduation, making it essential to find a replacement plan during OPT."},
                  {question: "Can OPT students get Marketplace (ACA) insurance?", answer: "Yes! F-1 students on OPT can enroll in Marketplace plans through Healthcare.gov. Depending on your income, you may qualify for premium tax credits that significantly reduce your monthly cost — potentially to $0/month. Open enrollment runs November through January."},
                  {question: "What is a Special Enrollment Period?", answer: "A Special Enrollment Period (SEP) lets you enroll in Marketplace insurance outside of open enrollment. Losing your university health plan qualifies as a life event that triggers a 60-day SEP. You must enroll within 60 days of losing coverage."},
                  {question: "How much does health insurance cost on OPT?", answer: "Costs vary widely. Marketplace plans with subsidies can be $0-120/month. Short-term plans run $50-150/month. Catastrophic plans cost $100-200/month. Employer-sponsored plans (when available) are often the most affordable option with typical employee costs of $50-200/month."},
                  {question: "Does my employer have to provide health insurance?", answer: "Employers with 50+ full-time employees must offer coverage, but there's typically a 60-90 day waiting period. Smaller companies aren't required to offer insurance. During the waiting period, you'll need bridge coverage like a short-term plan or COBRA from your university."},
                  {question: "What if I can't afford health insurance?", answer: "Check if you qualify for Marketplace subsidies — many OPT students qualify for plans at $0/month. You can also look into community health centers that offer sliding-scale fees, short-term plans for basic coverage, or check if your state offers additional programs for low-income individuals."}
                ]}
            />
            <FeatureHero
                badge="Stay Covered"
                headline="Find Health Insurance on OPT — Starting at $0/month"
                subheadline="Your university plan ends after graduation. Compare Marketplace, short-term, and catastrophic plans to find affordable coverage that fits your OPT situation."
                ctaText="Find Your Plan"
                ctaHref="/login"
                secondaryCta={{
                    text: "Compare Plans",
                    href: "/dashboard/opt-health-insurance-finder",
                }}
                gradient="from-rose-600 to-pink-600"
                visual={<InsuranceComparisonCards />}
            />

            {/* Types of Coverage */}
            <section className="py-24 relative overflow-hidden bg-white/50 dark:bg-zinc-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-medium mb-4">
                            <Stethoscope className="w-4 h-4" />
                            Types of Coverage
                        </div>
                        <H2>Health Insurance Options for OPT Students</H2>
                        <Lead>Compare coverage types to find the right fit for your budget and needs.</Lead>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {coverageTypes.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <P className="mb-4">{item.description}</P>
                                <ul className="space-y-2">
                                    {item.pros.map((pro) => (
                                        <li key={pro} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            {pro}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coverage Transition Timeline */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium mb-4">
                                <Calendar className="w-4 h-4" />
                                Coverage Timeline
                            </div>
                            <H2 className="mb-6">Don&apos;t Get Caught Without Coverage</H2>
                            <P className="mb-6">
                                The transition from university health insurance to OPT coverage
                                is one of the most common gaps international students face. A single
                                uninsured ER visit can cost you thousands. Plan your transition early.
                            </P>
                            <Link
                                href="/dashboard/opt-health-insurance-finder"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                Find Coverage Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <HeartPulse className="w-5 h-5 text-rose-600" />
                                    Your Coverage Journey
                                </h3>
                                <div className="space-y-4">
                                    {timelineSteps.map((step, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    step.status === "covered"
                                                        ? "bg-green-100 dark:bg-green-900/30"
                                                        : step.status === "warning"
                                                        ? "bg-amber-100 dark:bg-amber-900/30"
                                                        : "bg-rose-100 dark:bg-rose-900/30"
                                                }`}>
                                                    {step.status === "covered" ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : step.status === "warning" ? (
                                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                                    ) : (
                                                        <Heart className="w-4 h-4 text-rose-600" />
                                                    )}
                                                </div>
                                                {i < timelineSteps.length - 1 && (
                                                    <div className="w-px h-full bg-gray-200 dark:bg-zinc-700 my-1" />
                                                )}
                                            </div>
                                            <div className="pb-4">
                                                <p className="text-xs font-medium text-gray-400 mb-0.5">{step.period}</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{step.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <FeatureWhyMatters
                headline="1 in 4 Young Adults Are Uninsured After Graduation"
                description="Medical debt is the #1 cause of bankruptcy in the U.S. A single hospital stay averages $13,000. International students on OPT are especially vulnerable during the coverage gap between university insurance and employer plans."
                accentColor="amber"
                stats={[
                    { value: "$0/mo", label: "Marketplace plans with subsidies", icon: <DollarSign className="w-5 h-5" /> },
                    { value: "$13K", label: "Average hospital stay cost", icon: <Hospital className="w-5 h-5" /> },
                    { value: "60 Days", label: "Special enrollment period window", icon: <Calendar className="w-5 h-5" /> },
                    { value: "Free", label: "Our insurance finder tool", icon: <Shield className="w-5 h-5" /> },
                ]}
            />

            <FeatureTestimonial
                quote="I graduated and assumed I'd be covered by my employer right away. Turns out there's a 90-day waiting period. TrackMyOPT helped me find a Marketplace plan for $0/month with subsidies. Literally saved me from a coverage gap."
                author={{
                    name: "Ananya Krishnan",
                    role: "OPT, Business Analyst",
                    university: "Indiana University",
                }}
                accentColor="amber"
            />

            <FeatureFAQ
                title="Health Insurance Questions"
                subtitle="Common questions about health coverage on OPT"
                accentColor="amber"
                items={faqItems}
            />

            <FeatureCTA
                headline="Don't Risk Being Uninsured"
                subheadline="Find affordable health insurance plans tailored to your OPT situation. Compare options and enroll today."
                primaryCTA={{
                    text: "Find Your Plan",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "Compare Insurance Plans",
                    href: "/dashboard/opt-health-insurance-finder",
                }}
                gradient="amber"
                icon={<HeartPulse className="w-12 h-12 text-white" />}
                badge="Free Tool"
            />

            {/* JSON-LD FAQ Schema */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: faqItems.map((item) => ({
                            "@type": "Question",
                            name: item.question,
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: item.answer,
                            },
                        })),
                    }),
                }}
            />
        </main>
    );
}
