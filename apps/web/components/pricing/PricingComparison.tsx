"use client";

import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";

export function PricingComparison() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Free vs Premium — Side by Side
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        See exactly what premium adds to your OPT
                        compliance toolkit
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-x-auto shadow-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-800/50">
                                <th
                                    scope="col"
                                    className="text-left px-6 py-4 font-semibold text-gray-900 dark:text-white"
                                >
                                    Feature
                                </th>
                                <th
                                    scope="col"
                                    className="text-center px-6 py-4 font-semibold text-gray-500 dark:text-gray-400"
                                >
                                    Free
                                </th>
                                <th
                                    scope="col"
                                    className="text-center px-6 py-4"
                                >
                                    <div className="inline-flex flex-col items-center">
                                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                                            RECOMMENDED
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                            Premium
                                        </span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { feature: "OPT Unemployment Day Tracking", free: "Manual", premium: "Automated with alerts at 60, 75, 85 days" },
                                { feature: "USCIS Case Status Monitoring", free: "Manual check", premium: "Daily auto-check + status change email alerts" },
                                { feature: "Deadline Reminders", free: "Basic in-app", premium: "Daily 9AM email + push notifications" },
                                { feature: "H-1B Sponsor Database", free: "100 companies", premium: "Unlimited + approval rate data" },
                                { feature: "AI Resume Generator", free: "5/month", premium: "500/month + unlimited ATS scans" },
                                { feature: "Job Application Tracker", free: "5 jobs", premium: "Unlimited jobs" },
                                { feature: "Document Vault", free: false, premium: "Encrypted storage + expiry reminders" },
                                { feature: "STEM OPT Extension Planner", free: "Basic calculator", premium: "Full I-983 tracking + E-Verify check" },
                                { feature: "Sprintax partner coupon ($20)", free: true, premium: true },
                                { feature: "Chrome Extension Priority Alerts", free: false, premium: true },
                                { feature: "Priority Support", free: false, premium: true },
                            ].map((row, i) => (
                                <tr
                                    key={i}
                                    className="border-t border-gray-100 dark:border-zinc-800"
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {row.feature}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {row.free === false ? (
                                            <X className="w-5 h-5 text-gray-300 dark:text-zinc-600 mx-auto" />
                                        ) : row.free === true ? (
                                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {row.free}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center bg-blue-50/50 dark:bg-blue-900/10">
                                        {row.premium === true ? (
                                            <Check className="w-5 h-5 text-blue-600 mx-auto" />
                                        ) : (
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                {row.premium}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-center mt-8">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        Start 7-Day Free Trial
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        No credit card required to start. Cancel anytime.
                    </p>
                </div>
            </div>
        </section>
    );
}
