"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Shield, Sparkles } from "lucide-react";

export function LandingPricing() {
    return (
        <section id="pricing" className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Start for free. Upgrade for peace of mind. No hidden subscriptions.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800"
                    >
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Free Forever</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                                <span className="text-gray-500 dark:text-gray-400">/forever</span>
                            </div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                                Everything you need to get started with your OPT journey.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "OPT Timeline Dashboard",
                                "Unemployment Clock (90 Days)",
                                "1 USCIS Case Tracker",
                                "Basic Email Alerts",
                                "Tax Filing Guide",
                                "Health Insurance Finder"
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/login"
                            className="block w-full py-3 px-6 text-center rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Get Started Free
                        </Link>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 border-blue-600 shadow-2xl shadow-blue-500/10"
                    >
                        {/* Popular Badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-3 h-3 fill-white" />
                            Most Popular
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                Premium
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    Lifetime Access
                                </span>
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">$19.99</span>
                                <span className="text-gray-500 dark:text-gray-400">/one-time</span>
                            </div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                                Advanced tools for peace of mind. Pay once, use forever. No subscriptions.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Everything in Free",
                                "Unlimited USCIS Case Tracking",
                                "Job Application Job CRM",
                                "Document Vault (AI Extraction)",
                                "Resume Builder & ATS Scanner",
                                "H-1B Sponsor Database (80k+)",
                                "Priority Email Support"
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/30">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-medium text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/login?plan=premium"
                            className="block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
                        >
                            Get Premium Access
                        </Link>

                        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Shield className="w-3 h-3" />
                            30-day money-back guarantee
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
