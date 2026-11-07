"use client";

import {
    Briefcase,
    FileSearch,
    ArrowRight,
    LayoutDashboard,
    FileText
} from "lucide-react";
import Link from "next/link";

export function LandingFeatures() {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="prose-longform text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Deadlines, Case Status, Resumes &amp; Sponsors
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        One OPT companion: compliance clocks, USCIS alerts, AI resumes, Document Vault, and H-1B research.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Large Featured Card 1 - Job CRM */}
                    <div className="md:col-span-2 row-span-1 md:row-span-2 group relative overflow-hidden rounded-xl border border-violet-200 bg-violet-50 p-8 shadow-card dark:border-violet-800 dark:bg-zinc-900">
                        <div className="relative z-10 h-full flex flex-col justify-between prose-longform">
                            <div>
                                <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center text-white shadow-button mb-6">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Job Search CRM
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 max-w-md text-lg">
                                    A Kanban-style tracker to manage your applications, interviews, and offers in one pipeline. Tag <Link href="/features/sponsors" className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700">H-1B sponsors</Link> and track referrals.
                                </p>
                            </div>
                            <div className="flex items-center text-violet-700 dark:text-violet-300 font-semibold">
                                Try CRM Demo <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2 - Timeline (Updated for Polling) */}
                    <div className="md:col-span-1 row-span-1 group relative overflow-hidden surface-card-interactive p-8">
                        <div className="relative z-10 prose-longform">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 mb-4">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Know where you stand</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                See your decision window from similar cases. Free refresh anytime — Pro checks USCIS daily and emails you when status changes.
                            </p>
                            <Link
                                href="/tools/opt-decision-window"
                                className="mt-3 inline-flex text-sm font-semibold text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
                            >
                                Open decision window →
                            </Link>
                        </div>
                    </div>

                    {/* Card 3 - AI Resume Doctor (High Value Gem) */}
                    <div className="md:col-span-1 row-span-1 group relative overflow-hidden surface-card-interactive p-8">
                        <div className="relative z-10 prose-longform">
                            <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-300 mb-4">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Resume Doctor</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Uses latest top AI model to rewrite entire resume to match job description and match keywords for every specific job.
                            </p>
                        </div>
                    </div>

                    {/* Large Featured Card 4 - H-1B & Tools */}
                    <div className="md:col-span-3 row-span-1 group relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 p-8 shadow-card dark:border-emerald-800 dark:bg-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 relative z-10 prose-longform">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-button">
                                    <FileSearch className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    H-1B Sponsor Database
                                </h3>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 max-w-2xl">
                                Stop applying to companies that don't sponsor. Search 25,000+ verified H-1B employers and filter by approval rating.
                            </p>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300">
                                Microsoft, Amazon, Google, Tesla, Meta + 25,000 more
                            </p>
                        </div>
                        <div className="shrink-0 relative z-10">
                            <Link
                                href="/login"
                                className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white shadow-button transition-colors hover:bg-emerald-800"
                            >
                                Search H-1B sponsors →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
