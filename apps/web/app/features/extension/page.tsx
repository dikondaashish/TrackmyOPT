"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    Chrome,
    CheckCircle2,
    Zap,
    Shield,
    Eye,
    Linkedin,
    Globe,
    Lock,
    Download,
    Monitor,
    Smartphone
} from "lucide-react";
import Image from "next/image";
import { FeatureHero } from "@/components/features/FeatureHero";


// Browser Mockup Component
function BrowserMockup() {
    return (
        <div className="relative">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20" />

            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 mx-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-md text-sm text-gray-500">
                            <Lock className="w-3 h-3" />
                            linkedin.com/jobs/software-engineer
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-6">
                    {/* Job Card */}
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                G
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Software Engineer</h4>
                                <p className="text-sm text-gray-500">Google • Mountain View, CA</p>
                            </div>
                        </div>
                    </div>

                    {/* Extension Popup */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-blue-500 shadow-xl p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">TrackMyOPT</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium"
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                E-Verified
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium"
                            >
                                928 H-1Bs
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.9 }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                            >
                                98% Approval
                            </motion.span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-xs text-gray-500"
                        >
                            Last updated: Today
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Platform Grid
function PlatformGrid() {
    const platforms = [
        { name: "LinkedIn", icon: Linkedin, status: "live" },
        { name: "Indeed", icon: Globe, status: "live" },
        { name: "Glassdoor", icon: Globe, status: "coming" },
        { name: "Handshake", icon: Globe, status: "coming" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {platforms.map((platform, i) => (
                <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 text-center hover:shadow-lg transition-shadow"
                >
                    {platform.status === 'coming' && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
                            Soon
                        </span>
                    )}
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${platform.status === 'live'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        : 'bg-gray-200 dark:bg-zinc-700'
                        }`}>
                        <platform.icon className={`w-6 h-6 ${platform.status === 'live' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{platform.name}</p>
                </motion.div>
            ))}
        </div>
    );
}

// Privacy Checklist
function PrivacyChecklist() {
    const items = [
        "No data collection or tracking",
        "Works entirely in your browser",
        "No account required to use",
        "Open source & auditable",
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Privacy First</h4>
                    <p className="text-sm text-gray-500">Your data stays yours</p>
                </div>
            </div>
            <div className="space-y-3">
                {items.map((item, i) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function ExtensionPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Hero */}
            <FeatureHero
                badge="Free"
                headline="Sponsor Intel. Right on LinkedIn."
                subheadline="See H-1B history, E-Verify status, and fraud alerts directly on job listings—without leaving your job search."
                ctaText="Add to Chrome - Free"
                ctaHref="https://chrome.google.com/webstore"
                secondaryCta={{
                    text: "See Demo",
                    href: "#demo"
                }}
                gradient="from-blue-500 to-cyan-500"
                visual={<BrowserMockup />}
            />

            {/* Features */}
            <section id="demo" className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                                <Zap className="w-4 h-4" />
                                Instant Intel
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Make Smarter Applications
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                See sponsor data right where you need it—on job listings.
                                No more switching tabs or manual research.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "E-Verify enrollment status",
                                    "Historical H-1B sponsorship count",
                                    "Approval rate trends",
                                    "Virtual office warnings"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <Link
                                    href="https://chrome.google.com/webstore"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Install Extension
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <BrowserMockup />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Platforms */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                            <Globe className="w-4 h-4" />
                            Works Everywhere
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Supported Platforms
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Get sponsor intel on the job boards you already use.
                        </p>
                    </motion.div>

                    <PlatformGrid />
                </div>
            </section>

            {/* Privacy */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <PrivacyChecklist />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                                <Shield className="w-4 h-4" />
                                Privacy First
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Your Data Stays Private
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                We don't track your browsing, store your data, or sell your information.
                                The extension works entirely in your browser.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "No analytics or tracking",
                                    "Data fetched on-demand only",
                                    "Minimal permissions required",
                                    "Regular security audits"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Chrome className="w-16 h-16 text-white/80 mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Start Making Smarter Applications
                        </h2>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of job seekers who use TrackMyOPT extension
                            to find sponsors faster.
                        </p>
                        <Link
                            href="https://chrome.google.com/webstore"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-600 bg-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                        >
                            Add to Chrome - It's Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
