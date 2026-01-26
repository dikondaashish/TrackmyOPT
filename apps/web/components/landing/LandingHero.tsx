"use client";

import Link from "next/link";

export function LandingHero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900" />

            {/* Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Trusted by 15,000+ students
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                            Never Miss an{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                OPT Deadline
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Track your OPT timeline, monitor unemployment days, check USCIS case status, and find H-1B sponsors — all in one place.
                        </p>

                        {/* CTAs */}
                        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-xl shadow-gray-900/20"
                            >
                                Get Started Free
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </Link>
                            <a
                                href="#features"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 text-base font-semibold rounded-full border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                            >
                                See Features
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </a>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Free forever
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                No credit card
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                256-bit encryption
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Dashboard Preview */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            {/* Floating Dashboard Mockup */}
                            <div className="relative bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-black/30 border border-gray-200 dark:border-zinc-700 p-6 animate-float">
                                {/* Dashboard Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <span className="text-white text-lg">📊</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">OPT Dashboard</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Your timeline at a glance</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Days Remaining</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">on STEM OPT</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Unemployment</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">12/150</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">days used</p>
                                    </div>
                                </div>

                                {/* Timeline Preview */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                                        <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">75%</span>
                                    </div>
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                        Next deadline: STEM Extension Filing in 45 days
                                    </p>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-6 -right-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-zinc-700 animate-float-delayed">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <span className="text-lg">🔔</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">Case Updated!</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Card is being produced</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-zinc-700 animate-float-slow">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <span className="text-lg">✅</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">Status: Safe</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">138 days remaining</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
