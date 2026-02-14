"use client";

import { motion } from "framer-motion";
import {
    Clock,
    Briefcase,
    ShieldCheck,
    BellRing,
    FileSearch,
    GraduationCap,
    ArrowRight,
    LayoutDashboard,
    FileText
} from "lucide-react";
import Link from "next/link";
import { ParallaxImage } from "@/components/animations/parallax-image";

export function LandingFeatures() {
    return (
        <section id="features" className="py-24 relative">
            <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[2px] -z-10" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase text-sm">
                        Power Features
                    </span>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Everything You Need to Stay Legal & Get Hired
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Professional tools built specifically for the unique challenges of F-1 students.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Large Featured Card 1 - Job CRM */}
                    <div className="md:col-span-2 row-span-1 md:row-span-2 group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Job Search CRM
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 max-w-md text-lg">
                                    A Kanban-style tracker to manage your applications, interviews, and offers in one pipeline. Tag H-1B sponsors and track referrals.
                                </p>
                            </div>
                            <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform cursor-pointer">
                                Try CRM Demo <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                        {/* Decorative Background Element */}
                        <div className="absolute top-1/2 -right-20 w-[300px] h-[300px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all duration-500" />
                        {/* CSS Mockup Preview */}
                        <div className="absolute right-0 bottom-8 translate-x-12 w-[300px] p-4 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-l-xl border-l border-t border-b border-gray-200 dark:border-zinc-700 shadow-lg opacity-80 group-hover:translate-x-8 group-hover:opacity-100 transition-all">
                            <div className="flex gap-2 mb-2">
                                <div className="w-2 h-8 bg-purple-500 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-2 w-20 bg-gray-200/50 dark:bg-zinc-700/50 rounded mb-1" />
                                    <div className="h-2 w-12 bg-gray-100/50 dark:bg-zinc-800/50 rounded" />
                                </div>
                            </div>
                            <div className="h-20 bg-white/30 dark:bg-zinc-900/30 rounded border border-dashed border-gray-200 dark:border-zinc-700" />
                        </div>
                    </div>

                    {/* Card 2 - Timeline (Updated for Polling) */}
                    <div className="md:col-span-1 row-span-1 group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 shadow-sm hover:shadow-lg transition-all">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">24/7 Case Patrol</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                We check your USCIS status daily so you don't have to. Get instant alerts on approvals or RFEs.
                            </p>
                        </div>
                        {/* Decorative Gradient - Blue/Cyan */}
                        <div className="absolute top-0 right-0 h-full w-full pointer-events-none overflow-hidden rounded-3xl">
                            <ParallaxImage offset={30} className="w-full h-full">
                                <div className="absolute top-1/2 -right-20 w-[200px] h-[200px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-500" />
                            </ParallaxImage>
                        </div>
                    </div>

                    {/* Card 3 - AI Resume Doctor (High Value Gem) */}
                    <div className="md:col-span-1 row-span-1 group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 shadow-sm hover:shadow-lg transition-all">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Resume Doctor</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Uses latest top AI model to rewrite entire resume to match job description and match keywords for every specific job.
                            </p>
                        </div>
                        {/* Decorative Gradient - Purple/Pink */}
                        <div className="absolute top-1/2 -right-20 w-[200px] h-[200px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all duration-500" />
                    </div>

                    {/* Large Featured Card 4 - H-1B & Tools */}
                    <div className="md:col-span-3 row-span-1 group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                    <FileSearch className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    H-1B Sponsor Database
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-2xl">
                                Stop applying to companies that don't sponsor. Search 25,000+ verified H-1B employers and filter by approval rating.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {["Microsoft", "Amazon", "Google", "Tesla", "Meta"].map(company => (
                                    <span key={company} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-zinc-700">
                                        {company}
                                    </span>
                                ))}
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                                    + 25,000 more
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0 relative z-10">
                            <Link href="/login" className="px-6 py-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                                Search Database
                            </Link>
                        </div>
                        {/* Decorative Gradient - Green/Teal */}
                        <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-gradient-to-t from-green-500/10 via-teal-500/5 to-transparent blur-3xl rounded-full group-hover:bg-green-500/20 transition-all duration-700" />
                    </div>
                </div>
            </div>
        </section>
    );
}
