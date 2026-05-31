"use client";

import { motion } from "framer-motion";
import { CanonicalURL } from "@/components/CanonicalURL";
import Link from "next/link";
import {
    ArrowRight,
    Bell,
    CheckCircle2,
    Clock,
    Eye,
    FileSearch,
    Globe,
    Languages,
    Mail,
    RefreshCw,
    Search,
    Shield,
    Zap,
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { H2, Lead, P } from "@/components/ui/typography";
import { UscisApiDisclosureBlock } from "@/components/legal/UscisApiDisclosureBlock";
import { UscisCaseStatusDisclaimer } from "@/components/legal/UscisCaseStatusDisclaimer";
import { CASE_STATUS_ALERT_DISCLAIMER } from "@/lib/legal/legal-config";

function CaseStatusCard() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-emerald-600" />
                    Case Status
                </h3>
                <span className="text-xs text-gray-400">Updated 2 min ago</span>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-700 mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receipt Number</p>
                <p className="text-gray-900 dark:text-white font-mono font-semibold tracking-wide">IOE-0912-3456-7890</p>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white mb-4"
            >
                <p className="text-sm opacity-80 mb-1">Current Status</p>
                <p className="text-xl font-bold">Card Was Produced</p>
                <p className="text-sm opacity-80 mt-1">Your EAD card is on its way!</p>
            </motion.div>
            <div className="flex items-center gap-3">
                {["Received", "Review", "Approved", "Card Produced"].map((step, i) => (
                    <div key={step} className="flex-1 text-center">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                            i <= 3 ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-zinc-700 text-gray-400"
                        }`}>
                            {i <= 3 ? "✓" : i + 1}
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{step}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const howItWorks = [
    {
        step: "01",
        icon: <Search className="w-6 h-6" />,
        title: "Enter Your Receipt Number",
        description: "Add your I-765 receipt number (starts with IOE, EAC, WAC, etc.) — it takes 10 seconds.",
        color: "emerald",
    },
    {
        step: "02",
        icon: <RefreshCw className="w-6 h-6" />,
        title: "We Check Case Status Daily",
        description: "TrackMyOPT uses authorized USCIS case-status API access where available and compares results to your previous check.",
        color: "teal",
    },
    {
        step: "03",
        icon: <Bell className="w-6 h-6" />,
        title: "Get Email Alerts",
        description: "When we detect a status change, you can receive an email with a plain-English explanation (timing may vary).",
        color: "cyan",
    },
];

const jargonTranslations = [
    {
        uscis: "Case Was Received and A Receipt Notice Was Sent",
        plain: "USCIS got your application. You'll receive a receipt in the mail with your case number.",
    },
    {
        uscis: "Request for Initial Evidence Was Sent",
        plain: "USCIS needs more documents from you. Check your mail ASAP — there's a deadline to respond.",
    },
    {
        uscis: "Case Was Approved",
        plain: "Your OPT/EAD was approved! Your card will be mailed within 1-2 weeks.",
    },
    {
        uscis: "Card Was Delivered To Me By The Post Office",
        plain: "Your EAD card has been delivered. Check your mailbox today!",
    },
];

const faqItems = [
    {
        question: "How often does TrackMyOPT check my case status?",
        answer: "Pro users receive automated daily checks where our USCIS case-status API access is available. When we detect a change, we send an email notification with a plain-English explanation. Timing may vary and is not guaranteed.",
    },
    {
        question: "Which receipt numbers can I track?",
        answer: "You can track any USCIS receipt number including IOE, EAC, WAC, LIN, SRC, and MSC prefixes. This covers I-765 (EAD), I-140, I-485, and most other USCIS applications.",
    },
    {
        question: "How long does OPT EAD processing take?",
        answer: "As of 2026, I-765 OPT processing typically takes 3-5 months. STEM OPT extensions may take 3-6 months. Processing times vary by service center. TrackMyOPT keeps you updated throughout the entire wait.",
    },
    {
        question: "Will I get an alert for every status change?",
        answer: `${CASE_STATUS_ALERT_DISCLAIMER} We aim to notify you when we detect changes, but alerts may be delayed or missed.`,
    },
    {
        question: "Is my receipt number stored securely?",
        answer: "Your receipt number is stored in our database and transmitted over HTTPS (TLS). We use it only to retrieve case-status information through authorized USCIS case-status API access where available. See our Privacy Policy and Security page for details.",
    },
    {
        question: "Can I track multiple cases at once?",
        answer: "Yes. You can add multiple receipt numbers to your dashboard and track them all simultaneously. This is useful if you have pending I-765, I-140, or other applications at the same time.",
    },
];

export default function CaseStatusPage() {
    return (
        <>
            <CanonicalURL url="https://www.trackmyopt.com/features/case-status" />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="USCIS Case Status Tracker"
                description="Automated daily USCIS case status checks with instant email alerts when your status changes. Tracks I-765 (EAD), I-140, I-485, and other USCIS applications."
                featurePath="/features/case-status"
                faqItems={faqItems}
            />
            <FeatureHero
                badge="Real-Time Tracking"
                headline="Know Your USCIS Case Status Instantly"
                subheadline="Automated daily checks and email alerts when we detect status changes—using authorized USCIS case-status API access where available. Always verify important updates with official USCIS notices."
                ctaText="Start Tracking Free"
                ctaHref="/login"
                secondaryCta={{
                    text: "Check Case Status",
                    href: "/dashboard/case-status",
                }}
                gradient="from-emerald-600 to-teal-600"
                visual={<CaseStatusCard />}
            />

            {/* How It Works */}
            <section className="py-24 relative overflow-hidden bg-white/50 dark:bg-zinc-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                            <Zap className="w-4 h-4" />
                            How It Works
                        </div>
                        <H2>Three Steps to Peace of Mind</H2>
                        <Lead>Set it up once, stay informed forever.</Lead>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {howItWorks.map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className="text-5xl font-black text-emerald-100 dark:text-emerald-900/40 absolute top-4 right-6">{item.step}</div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <P>{item.description}</P>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plain English Explanations */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
                                <Languages className="w-4 h-4" />
                                Plain English
                            </div>
                            <H2 className="mb-6">USCIS Jargon, Translated</H2>
                            <P className="mb-8">
                                USCIS status messages read like they were written by robots. We translate
                                every update into clear, actionable language so you know exactly what&apos;s
                                happening and what to do next.
                            </P>
                            <Link
                                href="/blog/opt-ead-card-guide"
                                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                            >
                                Read our EAD card guide
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            {jargonTranslations.map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono leading-snug">{item.uscis}</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Eye className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-900 dark:text-white font-medium leading-snug">{item.plain}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            <FeatureWhyMatters
                headline="Waiting Is Stressful — We Make It Easier"
                description="Over 400,000 OPT applications are filed every year. Average processing takes 3-5 months, and students check USCIS dozens of times. Let us handle the checking so you can focus on your career."
                accentColor="emerald"
                stats={[
                    { value: "3-5 Mo", label: "Average I-765 processing time", icon: <Clock className="w-5 h-5" /> },
                    { value: "Daily", label: "Automated status checks", icon: <RefreshCw className="w-5 h-5" /> },
                    { value: "<1 Min", label: "Alert after status change", icon: <Mail className="w-5 h-5" /> },
                    { value: "$0", label: "Free forever for tracking", icon: <Shield className="w-5 h-5" /> },
                ]}
            />

            <FeatureTestimonial
                quote="I checked USCIS every single day for 4 months straight. Then I found TrackMyOPT and got an email the moment my case was approved. I wish I'd started using it from day one."
                author={{
                    name: "Ravi Patel",
                    role: "OPT, Data Analyst",
                    university: "University of Texas at Dallas",
                }}
                accentColor="emerald"
            />

            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <UscisApiDisclosureBlock />
                <UscisCaseStatusDisclaimer className="mt-4" />
            </section>

            <FeatureFAQ
                title="Case Status Tracking Questions"
                subtitle="Everything you need to know about tracking your USCIS case"
                accentColor="emerald"
                items={faqItems}
            />

            <FeatureCTA
                headline="Stop Refreshing USCIS Manually"
                subheadline="Add your receipt number once and get instant alerts whenever your case status changes."
                primaryCTA={{
                    text: "Start Tracking Free",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "Learn About Case Status",
                    href: "/blog/opt-processing-time-2026",
                }}
                gradient="emerald"
                icon={<FileSearch className="w-12 h-12 text-white" />}
                badge="Free Forever"
            />


        </main>
        </>
    );
}
