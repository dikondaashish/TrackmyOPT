"use client";

import Link from "next/link";
import { Check, X, ArrowRight, Shield } from "lucide-react";
import { PlanPickerGuide } from "@/components/pricing/PlanPickerGuide";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import { DEDICATED_CONSULTATION_MINUTES, PRO_PAID_INTRO_PRICE, PRO_TRIAL_DAYS } from "@/lib/legal/legal-config";
import {
    FREE_ATS_SCAN_LIMIT_DISPLAY,
    PRO_ATS_SCAN_LIMIT_DISPLAY,
} from "@/lib/pricing/plan-features";
import { PLAN_LIMITS } from "@/lib/pricing/plan-config";

// Pro's ATS scan cap is real, so this copy must never say
// "Unlimited" — see plan-features.test.ts for the regression guard.
const proAtsScanLabel = `${PRO_ATS_SCAN_LIMIT_DISPLAY.toLocaleString("en-US")}/month`;

export function PricingComparison() {
    const showDedicated = shouldShowDedicatedPlanForSale();
    return (
        <section className="py-24 bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Free vs Pro — Side by Side
                    </h2>
                    <p className="text-muted-foreground">
                        {showDedicated
                            ? `See what Pro adds. Dedicated includes everything below, higher career-tool capacity, priority support, and a complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation.`
                            : "See what Pro adds: daily USCIS auto-checks, status-change alerts, and higher career tool limits."}
                    </p>
                </div>

                <div className="surface-card overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th
                                    scope="col"
                                    className="text-left px-6 py-4 font-semibold text-foreground"
                                >
                                    Feature
                                </th>
                                <th
                                    scope="col"
                                    className="text-center px-6 py-4 font-semibold text-muted-foreground"
                                >
                                    Free
                                </th>
                                <th
                                    scope="col"
                                    className="text-center px-6 py-4 bg-primary-soft border-t-[3px] border-t-primary"
                                >
                                    <div className="inline-flex flex-col items-center">
                                        <span className="mb-1 text-xs font-medium text-primary">
                                            Most popular
                                        </span>
                                        <span className="font-semibold text-foreground">
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
                                { feature: "AI Resume Generator", free: `${PLAN_LIMITS.free.resumesPerMonth}/month`, pro: `${PLAN_LIMITS.pro.resumesPerMonth}/month + ${proAtsScanLabel} ATS scans` },
                                { feature: "ATS Resume Scanner", free: `${FREE_ATS_SCAN_LIMIT_DISPLAY}/month`, pro: proAtsScanLabel },
                                { feature: "Job Application Tracker", free: true, pro: true },
                                { feature: "Document Vault", free: false, pro: "Encrypted storage + expiry reminders" },
                                { feature: "STEM OPT Extension Planner", free: "Basic calculator", pro: "Full I-983 tracking + E-Verify check" },
                                { feature: "Sprintax partner coupon ($20)", free: true, pro: true },
                                { feature: "Priority email support", free: false, pro: showDedicated ? "Dedicated plan" : false },
                            ].map((row, i) => (
                                <tr
                                    key={i}
                                    className="border-t border-border"
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                                        {row.feature}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {row.free === false ? (
                                            <X className="w-5 h-5 text-gray-300 dark:text-zinc-600 mx-auto" />
                                        ) : row.free === true ? (
                                            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                {row.free}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center bg-primary-soft">
                                        {row.pro === true ? (
                                            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                        ) : (
                                            <span className="text-sm font-medium text-foreground">
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
                <div className="mt-8 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50 p-6 dark:border-amber-900 dark:border-l-amber-500 dark:bg-amber-950">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">
                                    Need attorney access and priority support?
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    Dedicated includes everything in Pro plus higher career-tool limits, priority email support, and one complimentary {DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation per account.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Ddedicated%26interval%3Dyear"
                            className="inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 shrink-0 border border-border bg-background text-foreground shadow-card hover:bg-muted rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                        className="inline-flex min-h-12 items-center gap-2 px-8 py-3 bg-primary text-primary-foreground shadow-button hover:bg-primary-hover rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        Get Pro
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-sm text-muted-foreground mt-3">
                        Eligible accounts pay ${PRO_PAID_INTRO_PRICE.toFixed(2)} for the first {PRO_TRIAL_DAYS} days, then regular billing. Cancel anytime in Settings.
                    </p>
                </div>
            </div>
        </section>
    );
}
