"use client";
import { safeSerializeJsonLd } from "@/lib/safe-json-ld";

import { motion } from "framer-motion";
import { CanonicalURL } from "@/components/CanonicalURL";
import Link from "next/link";
import {
    ArrowRight,
    AlertTriangle,
    BadgeDollarSign,
    Ban,
    CalendarCheck,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    FileText,
    HelpCircle,
    Receipt,
    Scale,
    Shield,
    XCircle,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { H2, Lead, P } from "@/components/ui/typography";

function TaxChecklistVisual() {
    const items = [
        { form: "Form 8843", desc: "Statement for Exempt Individuals", required: true, done: true },
        { form: "Form 1040-NR", desc: "Nonresident Alien Income Tax Return", required: true, done: true },
        { form: "W-2", desc: "Wage and Tax Statement", required: true, done: false },
        { form: "Form 1098-T", desc: "Tuition Statement", required: false, done: false },
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-violet-600" />
                Your Tax Checklist
            </h3>
            <div className="space-y-3 mb-6">
                {items.map((item, i) => (
                    <motion.div
                        key={item.form}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50"
                    >
                        {item.done ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-zinc-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.form}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.desc}</p>
                        </div>
                        {item.required && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-medium">Required</span>
                        )}
                    </motion.div>
                ))}
            </div>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 text-white"
            >
                <p className="text-sm opacity-80 mb-1">Filing Deadline</p>
                <p className="text-xl font-bold">April 15, 2026</p>
                <p className="text-sm opacity-80 mt-1">34 days remaining</p>
            </motion.div>
        </div>
    );
}

const taxForms = [
    {
        form: "Form 8843",
        subtitle: "Required for ALL F-1 students",
        description: "Must file even with zero income. Declares your exempt individual status. Failure to file can affect your tax residency status for future filings.",
        icon: <FileText className="w-6 h-6" />,
        color: "violet",
    },
    {
        form: "Form 1040-NR",
        subtitle: "If you earned U.S. income",
        description: "The nonresident alien tax return. Report wages, scholarships, and other U.S.-source income. Use this instead of the standard 1040.",
        icon: <Receipt className="w-6 h-6" />,
        color: "purple",
    },
    {
        form: "W-2",
        subtitle: "From your employer",
        description: "Your employer sends this by January 31. Shows your wages and taxes withheld. You need one W-2 from each employer you worked for.",
        icon: <BadgeDollarSign className="w-6 h-6" />,
        color: "indigo",
    },
];

const ficaTimeline = [
    { year: "Year 1-5", status: "Exempt", description: "No Social Security or Medicare tax", icon: <Shield className="w-5 h-5 text-green-500" /> },
    { year: "Year 6+", status: "Not Exempt", description: "Standard FICA taxes apply", icon: <CircleDollarSign className="w-5 h-5 text-amber-500" /> },
];

const faqItems = [
    {
        question: "Do F-1 students have to file U.S. taxes?",
        answer: "Yes. All F-1 students must file Form 8843, even if they had zero income. If you earned any U.S. income (wages, stipends, scholarships above tuition), you must also file Form 1040-NR. Failing to file can create problems for future visa applications.",
    },
    {
        question: "What tax forms do I need as an F-1 student?",
        answer: "At minimum, you need Form 8843 (Statement for Exempt Individuals). If you earned income, you also need Form 1040-NR (Nonresident Alien Income Tax Return), your W-2(s) from employers, and potentially Form 1098-T from your university for tuition credits.",
    },
    {
        question: "Am I exempt from Social Security and Medicare (FICA) taxes?",
        answer: "F-1 students are generally exempt from FICA taxes (Social Security and Medicare) for the first 5 calendar years in the U.S. If your employer withheld FICA taxes, you may be able to request a refund by filing Form 843 and Form 8316.",
    },
    {
        question: "Can I use TurboTax or H&R Block?",
        answer: "Most mainstream tax software doesn't support nonresident alien returns (Form 1040-NR). Specialized tools like Sprintax or Glacier Tax Prep are designed for international students. TrackMyOPT's tax guide helps you understand which tool fits your situation.",
    },
    {
        question: "What happens if I don't file taxes?",
        answer: "Failure to file can result in IRS penalties, interest on unpaid taxes, and problems with future immigration applications. USCIS may review your tax history when processing green card or visa applications. Always file at least Form 8843.",
    },
    {
        question: "Do I need to file state taxes too?",
        answer: "It depends on your state. Most states with income tax require a separate state return. Some states (like Texas, Florida, Washington) have no state income tax. Check your state's requirements — our tax filing tool helps you determine what's needed.",
    },
];

export default function TaxFilingPage() {
    return (
        <>
            <CanonicalURL url="https://www.trackmyopt.com/features/tax-filing" />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="F-1 Student Tax Filing Guide & Checklist"
                description="Step-by-step guide for F-1 student tax filing including Form 8843, 1040-NR, W-2s, and FICA exemptions. Understand your tax obligations, filing deadlines, and how to stay compliant."
                featurePath="/features/tax-filing"
                faqItems={[
                  {question: "Do F-1 students have to file U.S. taxes?", answer: "Yes. All F-1 students must file Form 8843, even if they had zero income. If you earned any U.S. income (wages, stipends, scholarships above tuition), you must also file Form 1040-NR. Failing to file can create problems for future visa applications."},
                  {question: "What tax forms do I need as an F-1 student?", answer: "At minimum, you need Form 8843 (Statement for Exempt Individuals). If you earned income, you also need Form 1040-NR (Nonresident Alien Income Tax Return), your W-2(s) from employers, and potentially Form 1098-T from your university for tuition credits."},
                  {question: "Am I exempt from Social Security and Medicare (FICA) taxes?", answer: "F-1 students are generally exempt from FICA taxes (Social Security and Medicare) for the first 5 calendar years in the U.S. If your employer withheld FICA taxes, you may be able to request a refund by filing Form 843 and Form 8316."},
                  {question: "Can I use TurboTax or H&R Block?", answer: "Most mainstream tax software doesn't support nonresident alien returns (Form 1040-NR). Specialized tools like Sprintax or Glacier Tax Prep are designed for international students. TrackMyOPT's tax guide helps you understand which tool fits your situation."},
                  {question: "What happens if I don't file taxes?", answer: "Failure to file can result in IRS penalties, interest on unpaid taxes, and problems with future immigration applications. USCIS may review your tax history when processing green card or visa applications. Always file at least Form 8843."},
                  {question: "Do I need to file state taxes too?", answer: "It depends on your state. Most states with income tax require a separate state return. Some states (like Texas, Florida, Washington) have no state income tax. Check your state's requirements — our tax filing tool helps you determine what's needed."}
                ]}
            />
            <FeatureHero
                badge="Tax Season Made Easy"
                headline="F-1 Student Tax Filing, Simplified"
                subheadline="Stop guessing which forms to file. Our step-by-step guide and tools walk you through Form 8843, 1040-NR, FICA exemptions, and everything international students need for tax season."
                ctaText="Get Your Tax Checklist"
                ctaHref="/login"
                secondaryCta={{
                    text: "Learn About F-1 Taxes",
                    href: "/dashboard/tax-filing",
                }}
                gradient="from-violet-600 to-purple-600"
                visual={<TaxChecklistVisual />}
            />

            {/* Tax Filing Checklist */}
            <section className="py-24 relative overflow-hidden bg-white/50 dark:bg-zinc-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
                            <ClipboardList className="w-4 h-4" />
                            Tax Filing Checklist
                        </div>
                        <H2>Know Exactly Which Forms You Need</H2>
                        <Lead>Every F-1 student&apos;s situation is different. Here are the key forms.</Lead>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {taxForms.map((item, i) => (
                            <motion.div
                                key={item.form}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.form}</h3>
                                <p className="text-sm text-violet-600 dark:text-violet-400 font-medium mb-3">{item.subtitle}</p>
                                <P>{item.description}</P>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FICA Tax Exemption */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                                <Scale className="w-4 h-4" />
                                FICA Exemption
                            </div>
                            <H2 className="mb-6">The 5-Year FICA Tax Exemption</H2>
                            <P className="mb-6">
                                F-1 students are exempt from Social Security and Medicare taxes
                                for their first 5 calendar years in the U.S. That&apos;s roughly 7.65% of
                                your wages you don&apos;t have to pay — and can get refunded if your employer
                                withheld them by mistake.
                            </P>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "Social Security tax: 6.2% exemption",
                                    "Medicare tax: 1.45% exemption",
                                    "File Form 843 to claim a refund if withheld",
                                    "Exemption resets if you change visa status",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/dashboard/tax-filing"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                Check Your FICA Status
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
                                    <CalendarCheck className="w-5 h-5 text-purple-600" />
                                    FICA Exemption Timeline
                                </h3>
                                <div className="space-y-4">
                                    {ficaTimeline.map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                                            <div className="mt-0.5">{item.icon}</div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900 dark:text-white">{item.year}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        item.status === "Exempt"
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                                    }`}>{item.status}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Employer Withheld FICA?</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">You can request a refund. First ask your employer, then file Form 843 with the IRS.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <FeatureWhyMatters
                headline="Filing Taxes Isn't Optional — Even With $0 Income"
                description="Every F-1 student in the U.S. must file at least Form 8843. The IRS processed over 4 million nonresident returns last year. Penalties for non-filing can affect your immigration status and future visa applications."
                accentColor="purple"
                stats={[
                    { value: "100%", label: "F-1 students must file Form 8843", icon: <FileText className="w-5 h-5" /> },
                    { value: "7.65%", label: "FICA savings for exempt students", icon: <CircleDollarSign className="w-5 h-5" /> },
                    { value: "Apr 15", label: "Federal filing deadline", icon: <CalendarCheck className="w-5 h-5" /> },
                    { value: "$0", label: "Our tax guide is free", icon: <Shield className="w-5 h-5" /> },
                ]}
            />

            <FeatureTestimonial
                quote="I had no idea I needed to file Form 8843 even though I didn't earn anything. TrackMyOPT's tax guide walked me through the entire process and probably saved me from a future immigration headache."
                author={{
                    name: "Ming Wei Chen",
                    role: "F-1 Student, MS Computer Science",
                    university: "University of Illinois",
                }}
                accentColor="purple"
            />

            <FeatureFAQ
                title="F-1 Tax Filing Questions"
                subtitle="Common questions about filing taxes as an international student"
                accentColor="purple"
                items={faqItems}
            />

            <FeatureCTA
                headline="File Your Taxes With Confidence"
                subheadline="Get a personalized tax checklist and step-by-step guidance tailored to your F-1 situation."
                primaryCTA={{
                    text: "Get Your Tax Checklist",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "Explore Tax Tools",
                    href: "/dashboard/tax-filing",
                }}
                gradient="purple"
                icon={<Receipt className="w-12 h-12 text-white" />}
                badge="Free Tool"
            />

            {/* JSON-LD FAQ Schema */}
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: safeSerializeJsonLd({
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
        </>
    );
}
