"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ResumeEditorMockup } from "./ResumeEditorMockup";
import { GuestPreviewModal } from "./GuestPreviewModal";
import {
    Calendar,
    ArrowRight,
    Sparkles,
    LayoutDashboard,
    Briefcase,
    FileCheck,
} from "lucide-react";

import { HeroTimelineMockup } from "./hero/HeroTimelineMockup";
import { HeroCrmMockup } from "./hero/HeroCrmMockup";
import { HeroDocumentsMockup } from "./hero/HeroDocumentsMockup";

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

const tabContentVariants: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

type TabType = "timeline" | "crm" | "docs" | "resume";

const tabsConfig = [
    { id: "timeline" as TabType, label: "Timeline", icon: LayoutDashboard },
    { id: "crm" as TabType, label: "Job CRM", icon: Briefcase },
    { id: "docs" as TabType, label: "Documents", icon: FileCheck },
    { id: "resume" as TabType, label: "AI Resume", icon: Sparkles },
];

export function LandingHero() {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [activeTab, setActiveTab] = useState<TabType>("timeline");
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);

    const AUTO_ROTATE_INTERVAL = 6000; // 6 seconds

    // Auto-rotate tabs (disabled when user prefers reduced motion)
    useEffect(() => {
        if (prefersReducedMotion) return;
        if (isHovered) {
            setProgress(0);
            return;
        }

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    // Switch to next tab
                    const currentIndex = tabsConfig.findIndex(t => t.id === activeTab);
                    const nextIndex = (currentIndex + 1) % tabsConfig.length;
                    setActiveTab(tabsConfig[nextIndex].id);
                    return 0;
                }
                return prev + (100 / (AUTO_ROTATE_INTERVAL / 100));
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, [activeTab, isHovered, prefersReducedMotion]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const currentIndex = tabsConfig.findIndex(t => t.id === activeTab);
                let nextIndex: number;
                if (e.key === "ArrowRight") {
                    nextIndex = (currentIndex + 1) % tabsConfig.length;
                } else {
                    nextIndex = (currentIndex - 1 + tabsConfig.length) % tabsConfig.length;
                }
                setActiveTab(tabsConfig[nextIndex].id);
                setProgress(0);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeTab]);

    return (
        <section className="relative bg-background min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-8 lg:pt-12 pb-24">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="text-center lg:text-left"
                    >
                        {/* Who This Is For - Trust Signals */}
                        <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start mb-6">
                            <p className="text-sm font-medium text-muted-foreground">
                                3,500+ users have signed up
                            </p>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
                            Never miss an{" "}
                            <span className="text-blue-600">
                                OPT deadline
                            </span>
                            {" "}— or a career move
                        </motion.h1>

                        <motion.div
                            variants={fadeInUp}
                            className="prose-longform mx-auto mb-10 max-w-xl lg:mx-0"
                        >
                            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                                Track filing windows and unemployment days, see your <strong>USCIS decision window</strong>, build <strong>AI resumes</strong>, keep a <strong>Document Vault</strong>, and find <strong>H-1B sponsors</strong> — one companion for OPT.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-3 sm:items-start lg:items-start">
                            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:items-center">
                                <Link
                                    href="/login"
                                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-800 sm:w-auto"
                                >
                                    Start free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    href="/tools/opt-decision-window"
                                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-6 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
                                >
                                    See decision window
                                </Link>
                                <GuestPreviewModal />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Free account for the full toolkit · decision window needs no signup
                            </p>
                            <p className="text-sm text-muted-foreground">
                                10,000+ people regularly use our free tools.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:justify-start">
                                <span className="text-foreground">Where are you?</span>
                                <Link href="/login" className="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400">
                                    Filing OPT
                                </Link>
                                <span aria-hidden className="text-border">·</span>
                                <Link href="/login" className="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400">
                                    On OPT
                                </Link>
                                <span aria-hidden className="text-border">·</span>
                                <Link href="/login" className="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400">
                                    STEM extension
                                </Link>
                                <span aria-hidden className="text-border">·</span>
                                <Link href="/features/sponsors" className="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400">
                                    H-1B search
                                </Link>
                            </div>
                        </motion.div>

                        {/* Mobile-only: one clear preview card (readable type; full mockup stays on lg+) */}
                        <motion.div variants={fadeInUp} className="mx-auto mt-10 w-full max-w-sm lg:hidden">
                            <div className="rounded-xl border border-border bg-white p-5 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                                        <Calendar className="h-6 w-6 text-white" aria-hidden />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-base font-semibold text-foreground">OPT Timeline</p>
                                        <p className="text-sm text-muted-foreground">Deadlines & reminders</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Filing window</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">Open</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full w-[72%] rounded-full bg-blue-500" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        One place to track OPT, STEM, and case status — same tools on desktop.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Interactive Mockup with Tab Switching */}
                    <div className="relative hidden lg:block w-full">
                        <div
                            className="relative w-full aspect-[4/3] max-w-[600px] mx-auto"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                                <div className="relative z-10 h-full">
                                    <AnimatePresence mode="wait">
                                        {activeTab === "timeline" && (
                                            <motion.div
                                                key="timeline"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <HeroTimelineMockup />
                                            </motion.div>
                                        )}
                                        {activeTab === "crm" && (
                                            <motion.div
                                                key="crm"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <HeroCrmMockup />
                                            </motion.div>
                                        )}
                                        {activeTab === "docs" && (
                                            <motion.div
                                                key="docs"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <HeroDocumentsMockup />
                                            </motion.div>
                                        )}
                                        {activeTab === "resume" && (
                                            <motion.div
                                                key="resume"
                                                variants={tabContentVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                <ResumeEditorMockup />
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>

                        </div>

                        {/* Interactive Tab Triggers moved to Right Column */}
                        <motion.div variants={fadeInUp} className="mt-8 flex flex-col items-center z-20 relative">
                            <div className="inline-flex flex-nowrap gap-1.5 p-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 justify-center overflow-hidden">
                                {tabsConfig.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        aria-pressed={activeTab === tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setProgress(0);
                                        }}
                                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? "bg-white dark:bg-zinc-700 text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-700"
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden w-full max-w-sm">
                                <motion.div
                                    className="h-full bg-blue-500 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1, ease: "linear" }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
