"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BrainCircuit, BellRing, Terminal, Activity, CheckCircle2, Cpu } from "lucide-react";
import { useEffect, useState } from "react";

export function LandingEngine() {
    return (
        <section className="py-32 bg-zinc-50 dark:bg-[#0A0A0A] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent dark:from-blue-900/20" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-xs">
                        System Architecture
                    </span>
                    <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
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
                        className="lg:col-span-4 bg-white dark:bg-[#111] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col relative group"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">USCIS Direct Sync</h3>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-mono flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        LIVE CONNECTION
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content: The Terminal View */}
                        <div className="flex-1 p-6 font-mono text-xs relative bg-[#0D1117]">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
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
                                <motion.div
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-2 h-4 bg-green-500"
                                />
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
                            className="bg-white dark:bg-[#111] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden relative p-8 flex flex-col md:flex-row items-center gap-8 group"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-[80px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50" />

                            {/* Graphic: The Notification */}
                            <div className="flex-1 w-full">
                                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-200 dark:border-white/5 shadow-lg transform transition-transform group-hover:scale-105 duration-500">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                                            <BellRing className="w-5 h-5 fill-current" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Start Filing Now</h4>
                                                <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                                    Critical
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                You have <strong>14 days</strong> before your recommended filing date passes. Mail your I-765 package via FedEx today to avoid delays.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2 justify-center">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="md:w-1/2">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
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
                                className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between text-white shadow-xl"
                            >
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mix-blend-overlay" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                                        <BrainCircuit className="w-6 h-6 text-purple-200" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Top Pro AI Model</h3>
                                    <p className="text-purple-200 text-sm">
                                        Powering our "Resume Doctor" and document extraction with 1M context window.
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-xs font-mono text-purple-300">
                                    <Cpu className="w-4 h-4" />
                                    <span>AI MODELS: ONLINE</span>
                                </div>
                            </motion.div>

                            {/* Native STEM */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white dark:bg-[#111] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-xl p-8 relative overflow-hidden group"
                            >
                                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Native STEM Support</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            The 24-month extension logic is built-in. Transition seamlessly from Initial OPT.
                                        </p>
                                    </div>

                                    <div className="pt-6">
                                        <div className="flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            <span>Timeline</span>
                                            <span>36 Months</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden flex">
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
