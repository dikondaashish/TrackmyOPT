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
    Smartphone
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";


// Animated Countdown Card Component
function CountdownCard() {
    return (
        <div className="relative">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-30" />

            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">OPT Status: Active</span>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                        STEM Extension
                    </span>
                </div>

                {/* Countdown Ring */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background ring */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-gray-200 dark:text-zinc-800"
                        />
                        {/* Progress ring */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 283" }}
                            animate={{ strokeDasharray: "198 283" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className="text-4xl font-bold text-gray-900 dark:text-white"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            847
                        </motion.span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">days remaining</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Unemployment Days</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">12 / 150</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Next Deadline</p>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">45 days</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Timeline Component
function AlertTimeline() {
    const alerts = [
        { days: 60, title: "60-Day Alert", description: "Start employer verification", status: "completed" },
        { days: 30, title: "30-Day Alert", description: "Prepare SEVP update", status: "upcoming" },
        { days: 7, title: "7-Day Alert", description: "Final compliance check", status: "future" },
    ];

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500" />

            <div className="space-y-8">
                {alerts.map((alert, index) => (
                    <motion.div
                        key={alert.days}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        className="relative flex gap-6"
                    >
                        {/* Dot */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${alert.status === 'completed'
                            ? 'bg-green-500'
                            : alert.status === 'upcoming'
                                ? 'bg-blue-500 animate-pulse'
                                : 'bg-gray-300 dark:bg-gray-700'
                            }`}>
                            {alert.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                                <Bell className="w-5 h-5 text-white" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                    {alert.days} days before
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                            <div className="mt-3 flex gap-2">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    <Mail className="w-3 h-3" /> Email
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    <Smartphone className="w-3 h-3" /> SMS
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

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
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
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
                visual={<CountdownCard />}
            />

            {/* Feature 1: Real-Time Dashboard */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                                <Clock className="w-4 h-4" />
                                Real-Time Tracking
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Your OPT Status at a Glance
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                See exactly how many days you have left on your OPT, track unemployment days,
                                and know your filing deadlines—all updated in real-time.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Visual countdown for OPT and STEM OPT",
                                    "Unemployment day tracker with limits",
                                    "Employment verification status",
                                    "SEVP Portal update reminders"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
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
                            <CountdownCard />
                        </motion.div>
                    </div>
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
                            className="order-2 lg:order-1"
                        >
                            <AlertTimeline />
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
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Get Reminded Before It's Too Late
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                Receive email and SMS alerts at critical milestones—60 days, 30 days,
                                and 7 days before important deadlines. Never be caught off guard.
                            </p>
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
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Know Exactly When to File
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                Our calculator tells you the perfect window to apply for extensions,
                                submit SEVP updates, and prepare for status changes.
                            </p>
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

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Shield className="w-16 h-16 text-white/80 mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Stay Compliant. Stay in the US.
                        </h2>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of international students who trust TrackMyOPT
                            to keep their F-1 status protected.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-600 bg-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                        >
                            Start Tracking Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
