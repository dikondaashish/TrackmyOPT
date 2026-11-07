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
        <div className="surface-card p-8">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Filing Window Calculator
            </h3>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">OPT Start Date</label>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-700">
                        <span className="text-foreground font-medium">June 15, 2024</span>
                    </div>
                </div>
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Employment Status</label>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-700">
                        <span className="text-foreground font-medium">Currently Employed</span>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-blue-500 rounded-xl p-6 text-white"
            >
                <p className="text-sm opacity-80 mb-1">Your Safe Filing Window</p>
                <p className="text-2xl font-bold mb-2">April 15 - June 15, 2025</p>
                <p className="text-sm opacity-80">Up to 90 days before current OPT expires</p>
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
            <main className="min-h-screen bg-background">
            <FeatureServiceSchema
                name="OPT Compliance Tracker & Timeline Manager"
                description="Track your entire OPT timeline, unemployment days, and USCIS deadlines in real-time. Stay compliant with multi-channel alerts for all critical milestones including filing windows and employer reporting."
                featurePath="/features/compliance"
                faqItems={[
                  {question: "What happens if I exceed my unemployment limit?", answer: "The aggregate limit is 90 days during initial OPT and 150 days across initial OPT plus STEM OPT. Exceeding the applicable limit can violate F-1 status. TrackMyOPT tracks saved employment periods and alerts you as you approach the limit; verify your situation with your DSO."},
                  {question: "How does TrackMyOPT calculate my unemployment days?", answer: "We track the gap between your employment end dates and start dates. You enter your employment history, and our system automatically calculates cumulative unemployment. We account for weekends and holidays per USCIS guidelines."},
                  {question: "When should I apply for STEM OPT extension?", answer: "You may file Form I-765 up to 90 days before your current OPT expires. Other timing requirements apply, including the timing of your DSO recommendation, so confirm the current Form I-765 instructions and your individual deadline with your DSO."},
                  {question: "Do I need to report every job change to SEVP?", answer: "Yes, you must update the SEVP Portal within 10 days of any employment change including new jobs, address changes, or employer name changes. TrackMyOPT reminds you of these reporting requirements."},
                  {question: "Is TrackMyOPT free to use?", answer: "Yes! Core OPT tracking is free forever — countdown timer, unemployment tracker, and deadline tools. Free also includes 1 USCIS case with manual refresh and limited H-1B sponsor search. Pro adds daily case auto-checks, status-change emails, Document Vault, and higher limits."},
                  {question: "How accurate is the filing deadline calculator?", answer: "Our calculator uses publicly available USCIS timelines and accounts for your specific OPT start date, employment status, and extension type. Always verify deadlines with your DSO or a licensed immigration attorney."}
                ]}
            />
            {/* Hero */}
            <FeatureHero
                headline="Never Miss a USCIS Deadline Again"
                subheadline="The only platform that tracks your OPT timeline, unemployment days, and filing windows in real-time. Stay compliant, stay stress-free."
                ctaText="Start Tracking Free"
                ctaHref="/login"
                secondaryCta={{
                    text: "See Calculator",
                    href: "/tools/opt-clock"
                }}
                gradient="bg-blue-600"
                visual={<ComplianceShield />}
            />

            {/* Feature 1: The Journey Timeline */}
            <section className="py-24 relative overflow-hidden bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <H2>Visualizing Your Compliance Journey</H2>
                        <Lead>From graduation to H-1B, see exactly what milestones are coming up.</Lead>
                    </div>

                    <ComplianceTimeline />
                </div>
            </section>

            {/* Feature 2: Smart Alerts */}
            <section className="py-24 border-y border-border bg-surface relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1 relative"
                        >
                            {/* Abstract Alert Visual instead of Timeline */}
                            <div className="surface-card p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 bg-red-50 rounded-bl-xl">
                                    <Bell className="w-6 h-6 text-red-500 " />
                                </div>
                                <div className="space-y-6">
                                    {/* Mock Email Alert */}
                                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50 dark:bg-zinc-800">
                                        <div className="flex gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">T</div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">TrackMyOPT Alert</p>
                                                <p className="text-xs text-gray-500">To: You &lt;student@edu&gt;</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 dark:bg-zinc-700 rounded mb-2" />
                                        <div className="h-2 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded mb-4" />
                                        <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm font-medium border border-red-100 dark:border-red-950 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            Action Required: 10 Days Remain
                                        </div>
                                    </div>
                                    {/* Mock SMS Alert */}
                                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50 dark:bg-zinc-800 max-w-[280px] ml-auto">
                                        <div className="bg-blue-500 text-white p-3 rounded-xl rounded-br-none text-sm">
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
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
                            <H2 className="mb-6">Know Exactly When to File</H2>
                            <P className="mb-8">
                                Our calculator tells you the perfect window to apply for extensions,
                                submit SEVP updates, and prepare for status changes.
                            </P>
                            <Link
                                href="/tools/opt-clock"
                                className="inline-flex h-11 items-center gap-2 px-6 bg-primary text-primary-foreground font-semibold rounded-lg shadow-button hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    name: "Aditi Varma",
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
                        answer: "The aggregate limit is 90 days during initial OPT and 150 days across initial OPT plus STEM OPT. Exceeding the applicable limit can violate F-1 status. TrackMyOPT tracks saved employment periods and alerts you as you approach the limit; verify your situation with your DSO."
                    },
                    {
                        question: "How does TrackMyOPT calculate my unemployment days?",
                        answer: "We track the gap between your employment end dates and start dates. You enter your employment history, and our system automatically calculates cumulative unemployment. We account for weekends and holidays per USCIS guidelines."
                    },
                    {
                        question: "When should I apply for STEM OPT extension?",
                        answer: "You may file Form I-765 up to 90 days before your current OPT expires. Other timing requirements apply, including the timing of your DSO recommendation, so confirm the current Form I-765 instructions and your individual deadline with your DSO."
                    },
                    {
                        question: "Do I need to report every job change to SEVP?",
                        answer: "Yes, you must update the SEVP Portal within 10 days of any employment change including new jobs, address changes, or employer name changes. TrackMyOPT reminds you of these reporting requirements."
                    },
                    {
                        question: "Is TrackMyOPT free to use?",
                        answer: "Yes! Core OPT tracking is free forever — countdown timer, unemployment tracker, and deadline tools. Free also includes 1 USCIS case with manual refresh and limited H-1B sponsor search. Pro adds daily case auto-checks, status-change emails, Document Vault, and higher limits."
                    },
                    {
                        question: "How accurate is the filing deadline calculator?",
                        answer: "Our calculator uses publicly available USCIS timelines and accounts for your specific OPT start date, employment status, and extension type. Always verify deadlines with your DSO or a licensed immigration attorney."
                    },
                ]}
            />

            {/* Final CTA */}
            <FeatureCTA
                headline="Protect Your F-1 Status Today"
                subheadline="Use TrackMyOPT to organize deadlines and stay on top of your OPT journey."
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
