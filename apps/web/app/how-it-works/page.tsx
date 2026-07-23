"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    UserPlus,
    Calendar,
    Link2,
    Bell,
    BarChart3,
    Shield,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

const steps = [
    {
        number: 1,
        title: "Create Your Free Account",
        description:
            "Sign up in seconds using Google or email. No credit card required. Sessions are protected with HTTPS (TLS) and standard authentication practices.",
        icon: UserPlus,
        color: "blue",
    },
    {
        number: 2,
        title: "Enter Your OPT Information",
        description:
            "Input your program end date, OPT/STEM OPT start date, and EAD expiration. We automatically calculate all critical deadlines.",
        icon: Calendar,
        color: "purple",
    },
    {
        number: 3,
        title: "Connect Your USCIS Receipt",
        description:
            "Link your I-765 receipt number (e.g., IOE1234567890). Free includes manual refresh; Pro adds daily auto-checks and status-change notifications.",
        icon: Link2,
        color: "green",
    },
    {
        number: 4,
        title: "Enable Smart Alerts",
        description:
            "Turn on email notifications to receive reminders 30, 14, and 7 days before critical deadlines. Never miss a filing window.",
        icon: Bell,
        color: "amber",
    },
    {
        number: 5,
        title: "Track Your Journey",
        description:
            "Monitor your unemployment days, view your visual timeline dashboard, and use our job tracker to stay organized.",
        icon: BarChart3,
        color: "pink",
    },
];

const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600",
    pink: "from-pink-500 to-pink-600",
};

const bgColorMap: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    pink: "bg-pink-100 dark:bg-pink-900/30",
};

const textColorMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
    amber: "text-amber-600 dark:text-amber-400",
    pink: "text-pink-600 dark:text-pink-400",
};

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <LandingNavbar />

            {/* Hero */}
            <section className="pt-8 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                            <Shield className="w-4 h-4" />
                            Simple Setup
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Get Started in{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                5 Minutes
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            TrackMyOPT makes it easy to stay on top of your OPT timeline,
                            unemployment days, and USCIS case status. Here's how to get started.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Steps */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-zinc-700 dark:to-zinc-800" />
                                )}

                                <div className="flex gap-6 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Step Number */}
                                    <div
                                        className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${colorMap[step.color]} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                                    >
                                        {step.number}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div
                                                className={`p-2 rounded-lg ${bgColorMap[step.color]}`}
                                            >
                                                <step.icon
                                                    className={`w-5 h-5 ${textColorMap[step.color]}`}
                                                />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-xl">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-6 opacity-90" />
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Ready to Simplify Your OPT Journey?
                        </h2>
                        <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                            Join 15,000+ international students who trust TrackMyOPT to stay
                            compliant and organized.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Start Tracking Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            <LandingFooter />
        </main>
    );
}
