"use client";

import { motion } from "framer-motion";
import { BrainCircuit, BellRing, Terminal, Activity, Cpu } from "lucide-react";

export function LandingEngine() {
    return (
        <section className="py-32 bg-zinc-50 dark:bg-[#0A0A0A] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="prose-longform text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                        USCIS Case Tracking & OPT Intelligence
                    </h2>
                    <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        We replaced manual spreadsheets with active, government-connected intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">

                    {/* 1. LEFT COLUMN - TALL (USCIS Terminal) - Spans 5 cols */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-4 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col relative"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-900">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">USCIS Direct Sync</h3>
                                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        Live connection
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content: The Terminal View */}
                        <div className="flex-1 p-6 font-mono text-xs relative bg-[#0D1117]">
                            <div className="space-y-3 text-gray-400 relative z-10">
                                <div className="flex gap-2">
                                    <span className="text-green-500">➜</span>
                                    <span>Initiating OAuth2 handshake...</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-green-500">➜</span>
                                    <span>Authenticating client credentials...</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-blue-500">✓</span>
                                    <span className="text-white">Token acquired: [REDACTED]</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-green-500">➜</span>
                                    <span>Fetching case status: <span className="text-yellow-400">YSC23901...</span></span>
                                </div>
                                <div className="pl-4 border-l border-gray-700 space-y-1 my-2">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="text-blue-400">Card Is Being Produced</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Last Update:</span>
                                        <span>2026-01-27T16:20:00Z</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-green-500">➜</span>
                                    <span>Sync complete. Database updated.</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. MIDDLE/RIGHT COLUMN - STACKED - Spans 7 cols */}
                    <div className="lg:col-span-8 grid grid-rows-2 gap-6 h-full">

                        {/* TOP RIGHT - WIDE (Smart Coach) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden relative p-8 flex flex-col md:flex-row items-center gap-8"
                        >

                            {/* Graphic: The Notification */}
                            <div className="flex-1 w-full">
                                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                                            <BellRing className="w-5 h-5 fill-current" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Start Filing Now</h4>
                                                <span className="text-[10px] bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md font-medium">
                                                    Critical
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                You have <strong>14 days</strong> before your recommended filing date passes. Mail your I-765 package via FedEx today to avoid delays.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="md:w-1/2 prose-longform">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Smart Coach</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                    It's not just a reminder. Our <strong>Logic Engine</strong> analyzes your specific dates to provide legal-grade strategy (e.g. "Too early," "Perfect time," "Late").
                                </p>
                            </div>
                        </motion.div>

                        {/* BOTTOM ROW - SPLIT (Core & STEM) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

                            {/* Gemini Core */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-purple-900 rounded-xl p-8 relative overflow-hidden flex flex-col justify-between text-white"
                            >
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-purple-800 rounded-lg flex items-center justify-center mb-4">
                                        <BrainCircuit className="w-6 h-6 text-purple-200" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Top Pro AI Model</h3>
                                    <p className="text-purple-200 text-sm">
                                        Powering our "Resume Doctor" and document extraction with 1M context window.
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-xs text-purple-300">
                                    <Cpu className="w-4 h-4" aria-hidden />
                                    <span>AI models online</span>
                                </div>
                            </motion.div>

                            {/* Native STEM */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-zinc-800 p-8 relative overflow-hidden"
                            >

                                <div className="relative z-10 h-full flex flex-col justify-between prose-longform">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Native STEM Support</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            The 24-month extension logic is built-in. Transition seamlessly from Initial OPT.
                                        </p>
                                    </div>

                                    <div className="pt-6">
                                        <div className="flex items-center justify-between mb-2 text-xs font-semibold text-gray-500">
                                            <span>Timeline</span>
                                            <span>36 Months</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                                            <div className="w-1/3 bg-blue-500" />
                                            <div className="w-2/3 bg-emerald-500" />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                            <span>Initial</span>
                                            <span>STEM Extension</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
