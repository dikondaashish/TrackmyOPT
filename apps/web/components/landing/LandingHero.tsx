"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
    Clock,
    Calendar,
    Bell,
    CheckCircle,
    ArrowRight,
    ChevronDown,
    Shield,
    Sparkles,
    Building2,
    FileText,
} from "lucide-react";

// Animation variants
const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const floatAnimation: Variants = {
    initial: { y: 0 },
    animate: {
        y: [-8, 8, -8],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

export function LandingHero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900" />

            {/* Animated Gradient Orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 rounded-full blur-3xl"
                animate={{
                    scale: [1.1, 1, 1.1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <motion.div
                    className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        {/* Trust Badge */}
                        <motion.div
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full mb-6 border border-blue-200/50 dark:border-blue-500/20"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Trusted by 15,000+ international students
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
                        >
                            Your Complete{" "}
                            <span className="relative">
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    OPT Timeline
                                </span>
                                <motion.svg
                                    className="absolute -bottom-2 left-0 w-full"
                                    viewBox="0 0 300 12"
                                    fill="none"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    <motion.path
                                        d="M2 10C50 4 100 4 150 6C200 8 250 4 298 8"
                                        stroke="url(#gradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#8B5CF6" />
                                        </linearGradient>
                                    </defs>
                                </motion.svg>
                            </span>
                            <br />
                            Dashboard
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={fadeInUp}
                            className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Track deadlines, monitor unemployment days, check USCIS case status,
                            and search 80,000+ H-1B sponsors — all in one powerful platform.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            variants={fadeInUp}
                            className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                        >
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-semibold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#features"
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-base font-semibold rounded-full border border-gray-200/80 dark:border-zinc-700/80 hover:bg-white dark:hover:bg-zinc-700 transition-all duration-300 hover:border-gray-300 dark:hover:border-zinc-600"
                            >
                                Explore Features
                                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                            </a>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                            variants={fadeInUp}
                            className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Free forever</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                <span>Bank-grade security</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-green-500" />
                                <span>AI-powered</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content - Premium Dashboard Preview */}
                    <motion.div
                        className="relative hidden lg:block"
                        variants={fadeInUp}
                    >
                        <motion.div
                            className="relative"
                            variants={floatAnimation}
                            initial="initial"
                            animate="animate"
                        >
                            {/* Main Dashboard Card */}
                            <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-gray-200/60 dark:border-zinc-700/60 p-6 overflow-hidden">
                                {/* Gradient Border Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10" />

                                {/* Dashboard Header */}
                                <div className="relative flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                OPT Timeline
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Your journey at a glance
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                    </div>
                                </div>

                                {/* Stats Cards Grid */}
                                <div className="relative grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4 border border-blue-100/50 dark:border-blue-800/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                Days Remaining
                                            </p>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            247
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            on STEM OPT
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border border-green-100/50 dark:border-green-800/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                                Unemployment
                                            </p>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            12/150
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            days used
                                        </p>
                                    </div>
                                </div>

                                {/* Timeline Progress */}
                                <div className="relative space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shrink-0 shadow-sm shadow-green-500/50" />
                                        <div className="flex-1 h-2.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: "75%" }}
                                                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            75%
                                        </span>
                                    </div>
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                        Next: STEM Extension Filing in{" "}
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                                            45 days
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Floating Notification Card - Top Right */}
                            <motion.div
                                className="absolute -top-4 -right-4 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/10 p-3 border border-gray-200/60 dark:border-zinc-700/60"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/25">
                                        <Bell className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                            Case Updated!
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Card is being produced
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Status Card - Bottom Left */}
                            <motion.div
                                className="absolute -bottom-4 -left-4 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/10 p-3 border border-gray-200/60 dark:border-zinc-700/60"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.4, duration: 0.5 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-green-500/25">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                            Status: Safe
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            138 days remaining
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating H-1B Card - Bottom Right */}
                            <motion.div
                                className="absolute bottom-16 -right-8 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/10 p-3 border border-gray-200/60 dark:border-zinc-700/60"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.6, duration: 0.5 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/25">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                            H-1B Sponsors
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            80,000+ companies
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <ChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </motion.div>
        </section>
    );
}
