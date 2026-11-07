"use client";

import { motion } from "framer-motion";
import { Check, X, AlertTriangle, Shield } from "lucide-react";

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
        newWay: "Real-time clock with 90/60 day alerts",
    },
    {
        feature: "Document Safety",
        oldWay: "Files scattered in email/drive",
        newWay: "Encrypted vault with expiry reminders",
    },
];

export function LandingComparison() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="prose-longform text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                        OPT Tracking: Spreadsheets vs{" "}
                        TrackMyOPT
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
                        className="relative rounded-xl border border-border bg-surface p-8"
                    >
                        <div className="relative z-10 prose-longform">
                            <div className="flex items-center gap-3 mb-8">
                                <X className="w-6 h-6 text-red-500 dark:text-red-400" aria-hidden />
                                <h3 className="text-xl font-bold text-muted-foreground">The Old Way</h3>
                            </div>

                            <ul className="space-y-6">
                                {comparisonData.map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-muted-foreground">{item.oldWay}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10 rounded-lg border-l-4 border-l-red-500 bg-red-50 p-4 dark:bg-red-950">
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Risk Level: High</span>
                                </div>
                                <p className="text-xs text-red-800 dark:text-red-200">
                                    Keep important dates visible and plan ahead.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* The New Way */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-xl border border-primary-muted bg-card p-8 shadow-elevated ring-1 ring-primary-muted"
                    >
                        <div className="relative z-10 prose-longform">
                            <div className="flex items-center gap-3 mb-8">
                                <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden />
                                <h3 className="text-xl font-bold text-foreground">The TrackMyOPT Way</h3>
                            </div>

                            <ul className="space-y-6">
                                {comparisonData.map((item, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{item.newWay}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10 rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-950">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                                    <Shield className="w-4 h-4" />
                                    <span>Risk Minimized</span>
                                </div>
                                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                                    Designed around official USCIS compliance rules.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
