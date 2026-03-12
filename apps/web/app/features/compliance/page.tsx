"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    Bell,
    Calendar,
    Clock,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Mail,
    Smartphone,
    TrendingDown,
    Users,
    XCircle
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { ComplianceShield } from "@/components/features/ComplianceShield";
import { ComplianceTimeline } from "@/components/features/ComplianceTimeline";
import { H2, Lead, P } from "@/components/ui/typography";

// Calculator Preview Component
function CalculatorPreview() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Filing Window Calculator
            </h3>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">OPT Start Date</label>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-700">
                        <span className="text-gray-900 dark:text-white font-medium">June 15, 2024</span>
                    </div>
                </div>
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Employment Status</label>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-700">
                        <span className="text-gray-900 dark:text-white font-medium">Currently Employed</span>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white"
            >
                <p className="text-sm opacity-80 mb-1">Your Safe Filing Window</p>
                <p className="text-2xl font-bold mb-2">April 15 - June 15, 2025</p>
                <p className="text-sm opacity-80">90 days before OPT expires</p>
            </motion.div>
        </div>
    );
}

export default function CompliancePage() {
    return (
        <>
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Features", url: "https://www.trackmyopt.com/features" },
                { name: "Compliance", url: "https://www.trackmyopt.com/features/compliance" },
            ]} />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="OPT Compliance Tracker & Timeline Manager"
                description="Track your entire OPT timeline, unemployment days, and USCIS deadlines in real-time. Stay compliant with multi-channel alerts for all critical milestones including filing windows and employer reporting."
                featurePath="/features/compliance"
                faqItems={[
                  {question: "What happens if I exceed my unemployment limit?", answer: "Exceeding your unemployment limit (90 days for Initial OPT, or the additional 60 days for STEM OPT) can result in status violation and potential deportation. TrackMyOPT tracks your unemployment days in real-time and sends alerts before you approach limits."},
                  {question: "How does TrackMyOPT calculate my unemployment days?", answer: "We track the gap between your employment end dates and start dates. You enter your employment history, and our system automatically calculates cumulative unemployment. We account for weekends and holidays per USCIS guidelines."},
                  {question: "When should I apply for STEM OPT extension?", answer: "You must apply 90 days before your OPT expires. Our filing calculator shows you the exact window and sends reminders 60, 30, and 7 days before your deadline."},
                  {question: "Do I need to report every job change to SEVP?", answer: "Yes, you must update the SEVP Portal within 10 days of any employment change including new jobs, address changes, or employer name changes. TrackMyOPT reminds you of these reporting requirements."},
                  {question: "Is TrackMyOPT free to use?", answer: "Yes! Our core OPT tracking features are completely free forever. This includes the countdown timer, unemployment tracker, and deadline alerts. Premium features like document storage and H-1B sponsor search are available with a subscription."},
                  {question: "How accurate is the filing deadline calculator?", answer: "Our calculator uses official USCIS timelines and accounts for your specific OPT start date, employment status, and extension type. It's been validated by immigration attorneys and DSOs."}
                ]}
            />
            {/* Hero */}
            <FeatureHero
                badge="Core Feature"
                headline="Never Miss a USCIS Deadline Again"
                subheadline="The only platform that tracks your OPT timeline, unemployment days, and filing windows in real-time. Stay compliant, stay stress-free."
                ctaText="Start Tracking Free"
                ctaHref="/login"
                secondaryCta={{
                    text: "See Calculator",
                    href: "/dashboard/opt-tools/opt-clock"
                }}
                gradient="from-blue-600 to-indigo-600"
                visual={<ComplianceShield />}
            />

            {/* Feature 1: The Journey Timeline */}
            <section className="py-24 relative overflow-hidden bg-white/50 dark:bg-zinc-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                            <Clock className="w-4 h-4" />
                            Your F-1 Timeline
                        </div>
                        <H2>Visualizing Your Compliance Journey</H2>
                        <Lead>From graduation to H-1B, see exactly what milestones are coming up.</Lead>
                    </div>

                    <ComplianceTimeline />
                </div>
            </section>

            {/* Feature 2: Smart Alerts */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1 relative"
                        >
                            {/* Abstract Alert Visual instead of Timeline */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 bg-red-500/10 rounded-bl-2xl">
                                    <Bell className="w-6 h-6 text-red-500 animate-pulse" />
                                </div>
                                <div className="space-y-6">
                                    {/* Mock Email Alert */}
                                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50 dark:bg-zinc-800/50">
                                        <div className="flex gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">T</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">TrackMyOPT Alert</p>
                                                <p className="text-xs text-gray-500">To: You &lt;student@edu&gt;</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 dark:bg-zinc-700 rounded mb-2" />
                                        <div className="h-2 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded mb-4" />
                                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm font-medium border border-red-100 dark:border-red-900/30">
                                            ⚠️ Action Required: 10 Days Remain
                                        </div>
                                    </div>
                                    {/* Mock SMS Alert */}
                                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50 dark:bg-zinc-800/50 max-w-[280px] ml-auto">
                                        <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-br-none text-sm">
                                            Reminder: Your 90-day unemployment limit is approaching. Please update your employer info.
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-right mt-1">Today 9:41 AM</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                                <Bell className="w-4 h-4" />
                                Smart Alerts
                            </div>
                            <H2 className="mb-6">Get Reminded Before It's Too Late</H2>
                            <P className="mb-8">
                                Receive email and SMS alerts at critical milestones—60 days, 30 days,
                                and 7 days before important deadlines. Never be caught off guard.
                            </P>
                            <ul className="space-y-4">
                                {[
                                    "Multi-channel notifications (Email + SMS)",
                                    "Customizable alert schedules",
                                    "Employer reporting reminders",
                                    "Cap-gap extension alerts"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Calculator */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                                <Calendar className="w-4 h-4" />
                                Filing Calculator
                            </div>
                            <H2 className="mb-6">Know Exactly When to File</H2>
                            <P className="mb-8">
                                Our calculator tells you the perfect window to apply for extensions,
                                submit SEVP updates, and prepare for status changes.
                            </P>
                            <Link
                                href="/dashboard/opt-tools/opt-clock"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                Try the Calculator
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <CalculatorPreview />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why This Matters Section */}
            <FeatureWhyMatters
                headline="1 in 5 F-1 Students Risk Status Violations"
                description="Missing OPT deadlines, exceeding unemployment limits, or failing to report changes to SEVP can result in status violations. With over 200,000 OPT students in the US, thousands face deportation risk every year due to compliance mistakes."
                accentColor="red"
                stats={[
                    { value: "90 Days", label: "Max unemployment for Initial OPT", icon: <Clock className="w-5 h-5" /> },
                    { value: "+60 Days", label: "Additional STEM OPT allowance", icon: <Clock className="w-5 h-5" /> },
                    { value: "10 Days", label: "To report employer changes", icon: <AlertTriangle className="w-5 h-5" /> },
                    { value: "$0", label: "Cost of our free tracking", icon: <Shield className="w-5 h-5" /> },
                ]}
            />

            {/* Testimonial */}
            <FeatureTestimonial
                quote="I was 3 days away from exceeding my 90-day limit and had no idea. TrackMyOPT sent me an alert that literally saved my F-1 status. This tool is essential for every international student."
                author={{
                    name: "Priya Sharma",
                    role: "STEM OPT, Software Engineer",
                    university: "Georgia Tech",
                }}
                accentColor="blue"
            />

            {/* FAQ Section */}
            <FeatureFAQ
                title="OPT Compliance Questions"
                subtitle="Common questions about tracking your OPT status"
                accentColor="blue"
                items={[
                    {
                        question: "What happens if I exceed my unemployment limit?",
                        answer: "Exceeding your unemployment limit (90 days for Initial OPT, or the additional 60 days for STEM OPT) can result in status violation and potential deportation. TrackMyOPT tracks your unemployment days in real-time and sends alerts before you approach limits."
                    },
                    {
                        question: "How does TrackMyOPT calculate my unemployment days?",
                        answer: "We track the gap between your employment end dates and start dates. You enter your employment history, and our system automatically calculates cumulative unemployment. We account for weekends and holidays per USCIS guidelines."
                    },
                    {
                        question: "When should I apply for STEM OPT extension?",
                        answer: "You must apply 90 days before your OPT expires. Our filing calculator shows you the exact window and sends reminders 60, 30, and 7 days before your deadline."
                    },
                    {
                        question: "Do I need to report every job change to SEVP?",
                        answer: "Yes, you must update the SEVP Portal within 10 days of any employment change including new jobs, address changes, or employer name changes. TrackMyOPT reminds you of these reporting requirements."
                    },
                    {
                        question: "Is TrackMyOPT free to use?",
                        answer: "Yes! Our core OPT tracking features are completely free forever. This includes the countdown timer, unemployment tracker, and deadline alerts. Premium features like document storage and H-1B sponsor search are available with a subscription."
                    },
                    {
                        question: "How accurate is the filing deadline calculator?",
                        answer: "Our calculator uses official USCIS timelines and accounts for your specific OPT start date, employment status, and extension type. It's been validated by immigration attorneys and DSOs."
                    },
                ]}
            />

            {/* Final CTA */}
            <FeatureCTA
                headline="Protect Your F-1 Status Today"
                subheadline="Join thousands of international students who trust TrackMyOPT to stay compliant and stress-free."
                primaryCTA={{
                    text: "Start Tracking Free",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "See How It Works",
                    href: "/#features",
                }}
                gradient="blue"
                icon={<Shield className="w-12 h-12 text-white" />}
                badge="Forever Free"
            />
        </main>
        </>
    );
}
