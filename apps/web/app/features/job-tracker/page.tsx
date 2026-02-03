"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Clock,
    Calendar,
    Bell,
    BarChart3,
    Plus,
    MoreHorizontal,
    Building2,
    TrendingUp,
    AlertTriangle,
    XCircle
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";


import { TrackerKanbanDemo } from "@/components/features/TrackerKanbanDemo";
import { SyncConnectionVisual } from "@/components/features/SyncConnectionVisual";
import { AutoFillAction } from "@/components/features/AutoFillAction";
import { H2, Lead, P } from "@/components/ui/typography";





// Sync Visualization


// Analytics Preview
function AnalyticsPreview() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Your Stats</h4>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Applied", value: "47", change: "+12" },
                    { label: "Interviews", value: "8", change: "+3" },
                    { label: "Response Rate", value: "17%", change: "+5%" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center"
                    >
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
                    </motion.div>
                ))}
            </div>

            {/* Mini Bar Chart */}
            <div className="flex items-end gap-1 h-20">
                {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                        className="flex-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t"
                    />
                ))}
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">Mon</span>
                <span className="text-xs text-gray-400">Sun</span>
            </div>
        </div>
    );
}

export default function JobTrackerPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Hero */}
            <FeatureHero
                badge="New"
                headline="Track Applications. Beat the 90-Day Clock."
                subheadline="The only job tracker that syncs with your OPT unemployment counter. Never lose track of your applications or visa timeline."
                ctaText="Start Tracking"
                ctaHref="/dashboard/jobs"
                secondaryCta={{
                    text: "See How It Works",
                    href: "#sync"
                }}
                gradient="from-amber-500 to-orange-600"
                visual={<TrackerKanbanDemo />}
            />

            {/* Kanban Feature */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                                <Briefcase className="w-4 h-4" />
                                Visual Tracking
                            </div>
                            <H2>See All Your Applications at a Glance</H2>
                            <P>
                                Drag-and-drop Kanban board to track every application
                                from submission to offer. Never forget to follow up.
                            </P>
                            <ul className="space-y-4">
                                {[
                                    "Customizable pipeline stages",
                                    "Drag-and-drop organization",
                                    "Notes and attachments",
                                    "Interview date tracking"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
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
                            <TrackerKanbanDemo />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* OPT Sync Feature */}
            <section id="sync" className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <H2>Syncs More Than Just Dates</H2>
                        <Lead>Our intelligent system parses your job emails to update your tracker automatically.</Lead>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <SyncConnectionVisual />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                                <Clock className="w-4 h-4" />
                                OPT Integration
                            </div>
                            <H2>Jobs + OPT Clock = Peace of Mind</H2>
                            <P>
                                Your job applications automatically update your unemployment
                                counter. Stay compliant while you job search.
                            </P>
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm mt-6">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg h-fit text-blue-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Smart Unemployment Updates</h4>
                                        <p className="text-sm text-gray-500 mt-1">If you get rejected, the clock resumes. If you start working, it pauses. We handle the math.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Analytics Feature */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                                <BarChart3 className="w-4 h-4" />
                                Analytics
                            </div>
                            <H2>Understand Your Job Search</H2>
                            <P>
                                Track response rates, interview conversions, and application
                                trends. Optimize your strategy with data.
                            </P>
                            <Link
                                href="/dashboard/jobs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                Start Tracking
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <AnalyticsPreview />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why This Matters Section */}
            <FeatureWhyMatters
                headline="Disorganized Job Search = Compliance Risk"
                description="For OPT students, missing application deadlines or losing track of employment gaps directly impacts your visa status. Our tracker syncs with your OPT clock to keep you safe."
                accentColor="amber"
                stats={[
                    { value: "90 Days", label: "Max unemployment on Initial OPT", icon: <Clock className="w-5 h-5" /> },
                    { value: "150 Days", label: "Max unemployment on STEM OPT", icon: <Clock className="w-5 h-5" /> },
                    { value: "50+", label: "Average applications per job seeker", icon: <Briefcase className="w-5 h-5" /> },
                    { value: "Real-time", label: "Sync with OPT countdown", icon: <TrendingUp className="w-5 h-5" /> },
                ]}
            />

            {/* Testimonial */}
            <FeatureTestimonial
                quote="Having my job applications and OPT clock in the same place saved me. I could see exactly how my unemployment days would be affected if I didn't land a job soon."
                author={{
                    name: "Jessica Wu",
                    role: "UX Designer, STEM OPT",
                    university: "RISD",
                }}
                accentColor="amber"
            />

            {/* FAQ Section */}
            <FeatureFAQ
                title="Job Tracker FAQ"
                subtitle="Common questions about tracking your applications"
                accentColor="amber"
                items={[
                    {
                        question: "How does the tracker sync with my OPT clock?",
                        answer: "When you mark applications as 'Offer Accepted' with a start date, or 'Rejected', the tracker automatically updates your unemployment day count. You always know your compliance status."
                    },
                    {
                        question: "Can I import applications from LinkedIn?",
                        answer: "Not yet, but with our Chrome extension you can save jobs directly from LinkedIn to your tracker with one click. Full import is on our roadmap."
                    },
                    {
                        question: "What application stages can I track?",
                        answer: "Applied, Phone Screen, Technical Interview, Onsite, Offer, Rejected, and Withdrawn. You can customize the stages to match your workflow."
                    },
                    {
                        question: "Do I get reminders for follow-ups?",
                        answer: "Yes! Set custom reminders for each application. We'll notify you via email and in-app when it's time to follow up with a recruiter."
                    },
                    {
                        question: "Is there a limit to how many applications I can track?",
                        answer: "Free users can track up to 50 active applications. Premium users get unlimited tracking plus analytics and company insights."
                    },
                    {
                        question: "Can I export my application data?",
                        answer: "Yes, you can export all your application data to CSV at any time. Your data belongs to you."
                    },
                ]}
            />

            {/* Final CTA */}
            <FeatureCTA
                headline="Never Lose Track of an Application"
                subheadline="Keep your job search organized and your OPT status protected. Track applications, get reminders, and stay compliant."
                primaryCTA={{
                    text: "Start Tracking Free",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "See Features",
                    href: "/#features",
                }}
                gradient="amber"
                icon={<Briefcase className="w-12 h-12 text-white" />}
                badge="Syncs with OPT Clock"
            />
        </main>
    );
}
