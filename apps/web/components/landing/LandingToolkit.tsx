"use client";

import { motion } from "framer-motion";
import { HeartPulse, FileText, ArrowRight, Gift, Shield } from "lucide-react";
import Link from "next/link";

export function LandingToolkit() {
    return (
        <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 md:text-center max-w-3xl mx-auto">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase text-sm">
                        More Than Just Jobs
                    </span>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        The F-1 Student Survival Toolkit
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        We built the specific tools you need to survive the confusing parts of international student life. Included free.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Health Insurance Card */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 transition-all hover:border-blue-500/30 hover:shadow-lg">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
                                <HeartPulse className="w-8 h-8" />
                            </div>
                            <span className="px-3 py-1 bg-white dark:bg-zinc-800 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700">
                                Dashboard Tool
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Health Insurance Finder
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            University plans are expensive. Our finder tool compares ACA-compliant plans specifically for F-1/OPT students to save you thousands.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                            Find Plans <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Tax Filing Card */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 transition-all hover:border-green-500/30 hover:shadow-lg">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <span className="px-3 py-1 bg-white dark:bg-zinc-800 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700">
                                Dashboard Tool
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Tax Filing Assistant
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            "Am I a resident alien yet?" Stop guessing. Our built-in assistant helps you determine your status and file Form 8843 correctly.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                            Start Filing <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Partner Perks Card */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 transition-all hover:border-amber-500/30 hover:shadow-lg">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Gift className="w-8 h-8" />
                            </div>
                            <span className="px-3 py-1 bg-white dark:bg-zinc-800 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700">
                                Exclusive Deals
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Student Savers Club
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Unlock exclusive discounts on gas, food, and essentials. We partner with brands to help you save $100s/month while studying.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                            View Deals <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>

                    {/* Document Vault Card (New 4th Card) */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 transition-all hover:border-purple-500/30 hover:shadow-lg">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Shield className="w-8 h-8" />
                            </div>
                            <span className="px-3 py-1 bg-white dark:bg-zinc-800 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700">
                                Compliance Tool
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Smart Document Vault
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Never lose a critical document. Securely store I-20s, EADs, and offer letters with AI extraction to auto-fill your profile.
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                            Secure Docs <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
