"use client";

import { motion } from "framer-motion";
import { Check, X, FileSpreadsheet, CalendarOff, AlertTriangle, Bell, ShieldCheck, Zap } from "lucide-react";

const comparisonData = [
    {
        feature: "Deadline Tracking",
        oldWay: "Manually checking dates, missing windows",
        newWay: "Automatic countdowns to every deadline",
    },
    {
        feature: "Job search",
        oldWay: "Messy spreadsheets, forgotten follow-ups",
        newWay: "Visual Kanban CRM with status tracking",
    },
    {
        feature: "Unemployment Days",
        oldWay: "Guessing or manual counting",
        newWay: "Real-time clock with 90/150 day alerts",
    },
    {
        feature: "Document Safety",
        oldWay: "Files scattered in email/drive",
        newWay: "Encrypted vault with expiry reminders",
    },
];

export function LandingComparison() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                        Stop Managing Your Future in{" "}
                        <span className="text-red-500 decoration-4 underline decoration-red-200 dark:decoration-red-900/50 underline-offset-4">
                            Spreadsheets
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        The difference between stress and peace of mind is the right system.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto">
                    {/* The Old Way */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-red-50/50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900/30"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileSpreadsheet className="w-32 h-32 text-red-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-red-900 dark:text-red-200">The Old Way</h3>
                            </div>

                            <ul className="space-y-6">
                                {comparisonData.map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start opacity-75">
                                        <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-900 dark:text-red-300">{item.oldWay}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10 p-4 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-900/30">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Risk Level: High</span>
                                </div>
                                <p className="text-xs text-red-800 dark:text-red-300">
                                    One missed deadline can lead to immediate status termination.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* The New Way */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl p-8 border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-500/5"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-32 h-32 text-blue-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200">The TrackMyOPT Way</h3>
                            </div>

                            <ul className="space-y-6">
                                {comparisonData.map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                            <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{item.newWay}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10 p-4 bg-green-100/50 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-900/30">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-1">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Risk Level: Zero</span>
                                </div>
                                <p className="text-xs text-green-800 dark:text-green-300">
                                    Automated alerts ensure you never miss a filing window.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
