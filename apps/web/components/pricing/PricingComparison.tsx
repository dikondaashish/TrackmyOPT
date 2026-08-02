"use client";

import Link from "next/link";
import { Check, X, ArrowRight, Shield } from "lucide-react";
import { PlanPickerGuide } from "@/components/pricing/PlanPickerGuide";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import { PRO_TRIAL_DAYS } from "@/lib/legal/legal-config";
import { PRO_ATS_SCAN_LIMIT_DISPLAY } from "@/lib/pricing/plan-features";

// Pro's ATS scan cap is real (10,000/mo), so this copy must never say
// "Unlimited" — see plan-features.test.ts for the regression guard.
const proAtsScanLabel = `${PRO_ATS_SCAN_LIMIT_DISPLAY.toLocaleString("en-US")}/month`;

export function PricingComparison() {
    const showDedicated = shouldShowDedicatedPlanForSale();
    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Free vs Pro — Side by Side
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {showDedicated
                            ? "See what Pro adds. Need more resume capacity and faster email support? Dedicated includes everything below plus priority support."
                            : "See what Pro adds: daily USCIS auto-checks, status-change alerts, and higher career tool limits."}
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
                                        <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                                            MOST POPULAR
                                        </span>
                                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                                            Pro
                                        </span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { feature: "OPT Unemployment Day Tracking", free: "Manual", pro: "Automated with alerts at 60, 75, 85 days" },
                                { feature: "USCIS Case Status Monitoring", free: "Manual check", pro: "Daily auto-check + status change email alerts" },
                                { feature: "Deadline Reminders", free: "Basic in-app", pro: "Daily 9AM email + push notifications" },
                                { feature: "H-1B Sponsor Database", free: "25 companies", pro: "Unlimited + approval rate data" },
                                { feature: "AI Resume Generator", free: "5/month", pro: `500/month + ${proAtsScanLabel} ATS scans` },
                                { feature: "ATS Resume Scanner", free: "3/month", pro: proAtsScanLabel },
                                { feature: "Job Application Tracker", free: true, pro: true },
                                { feature: "Document Vault", free: false, pro: "Encrypted storage + expiry reminders" },
                                { feature: "STEM OPT Extension Planner", free: "Basic calculator", pro: "Full I-983 tracking + E-Verify check" },
                                { feature: "Sprintax partner coupon ($20)", free: true, pro: true },
                                { feature: "Priority email support", free: false, pro: showDedicated ? "Dedicated plan" : false },
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
                                    <td className="px-6 py-4 text-center bg-violet-50/50 dark:bg-violet-900/10">
                                        {row.pro === true ? (
                                            <Check className="w-5 h-5 text-violet-600 mx-auto" />
                                        ) : (
                                            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                                                {row.pro}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showDedicated ? (
                <div className="mt-8 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/80 dark:bg-amber-950/20 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                    Need more capacity and faster support?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Dedicated includes everything in Pro plus a higher resume quota and priority email support.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Ddedicated%26interval%3Dyear"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors shrink-0"
                        >
                            View Dedicated
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
                ) : null}

                <div className="mt-8">
                    <PlanPickerGuide />
                </div>

                <div className="text-center mt-8">
                    <Link
                        href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Dpro%26interval%3Dyear"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        Start Pro {PRO_TRIAL_DAYS}-Day Free Trial
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        Pro includes a {PRO_TRIAL_DAYS}-day free trial when eligible. Cancel anytime in Settings.
                    </p>
                </div>
            </div>
        </section>
    );
}
