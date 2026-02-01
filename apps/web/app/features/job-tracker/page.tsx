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
    Building2
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

// Kanban Board Demo
function KanbanDemo() {
    const columns = [
        {
            title: "Applied",
            count: 12,
            color: "blue",
            cards: [
                { company: "Google", role: "SWE", days: 3 },
                { company: "Meta", role: "ML Engineer", days: 5 },
            ]
        },
        {
            title: "Interviewing",
            count: 4,
            color: "amber",
            cards: [
                { company: "Amazon", role: "SDE II", days: 7 },
            ]
        },
        {
            title: "Offer",
            count: 1,
            color: "emerald",
            cards: [
                { company: "Microsoft", role: "SWE", days: 14 },
            ]
        },
    ];

    return (
        <div className="relative">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl blur-2xl opacity-20" />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">My Applications</h4>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Kanban Columns */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {columns.map((column, colIndex) => (
                        <motion.div
                            key={column.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: colIndex * 0.15 }}
                            className="flex-shrink-0 w-44"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-${column.color}-500`} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{column.title}</span>
                                </div>
                                <span className="text-xs text-gray-400">{column.count}</span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-2">
                                {column.cards.map((card, cardIndex) => (
                                    <motion.div
                                        key={card.company}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + colIndex * 0.1 + cardIndex * 0.1 }}
                                        whileHover={{ y: -2 }}
                                        className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-8 h-8 rounded-lg bg-${column.color}-100 dark:bg-${column.color}-900/30 flex items-center justify-center`}>
                                                <Building2 className={`w-4 h-4 text-${column.color}-600`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white">{card.company}</p>
                                                <p className="text-[10px] text-gray-500">{card.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400">{card.days}d ago</span>
                                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Sync Visualization
function SyncVisualization() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Synced with Your OPT Clock
            </h4>

            <div className="flex items-center justify-center gap-8">
                {/* Job Tracker */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 mx-auto shadow-lg">
                        <Briefcase className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Job Tracker</p>
                </motion.div>

                {/* Sync Arrow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-8 h-0.5 bg-gradient-to-r from-amber-500 to-blue-500"
                        />
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">Auto-sync</p>
                    <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-gray-400 rotate-180" />
                        <motion.div
                            animate={{ x: [0, -5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-amber-500"
                        />
                    </div>
                </motion.div>

                {/* OPT Clock */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 mx-auto shadow-lg">
                        <Clock className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">OPT Clock</p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center"
            >
                <p className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-semibold">Smart:</span> When you log a job application,
                    your unemployment counter automatically adjusts.
                </p>
            </motion.div>
        </div>
    );
}

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
        <>
            <LandingNavbar />
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
                    visual={<KanbanDemo />}
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
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                    See All Your Applications at a Glance
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                    Drag-and-drop Kanban board to track every application
                                    from submission to offer. Never forget to follow up.
                                </p>
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
                                <KanbanDemo />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* OPT Sync Feature */}
                <section id="sync" className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-2 lg:order-1"
                            >
                                <SyncVisualization />
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
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                    Jobs + OPT Clock = Peace of Mind
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                    Your job applications automatically update your unemployment
                                    counter. Stay compliant while you job search.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Auto-update unemployment days",
                                        "Employment gap detection",
                                        "Filing window reminders",
                                        "Compliance status at a glance"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
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
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                    Understand Your Job Search
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                    Track response rates, interview conversions, and application
                                    trends. Optimize your strategy with data.
                                </p>
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

                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600" />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Briefcase className="w-16 h-16 text-white/80 mx-auto mb-6" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                                Ready to Organize Your Job Search?
                            </h2>
                            <p className="text-lg text-amber-100 mb-8 max-w-2xl mx-auto">
                                Stop losing track of applications. Start your organized
                                job search today.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-amber-600 bg-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                            >
                                Start Tracking Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </main>
            <LandingFooter />
        </>
    );
}
