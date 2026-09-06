"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ResumeEditorMockup } from "./ResumeEditorMockup";
import { GuestPreviewModal } from "./GuestPreviewModal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
    Calendar,
    Bell,
    CheckCircle,
    ArrowRight,
    Shield,
    Sparkles,
    LayoutDashboard,
    Briefcase,
    FileCheck,
    Search,
    Filter,
    ChevronLeft,
    Download,
    Eye,
    Lock,
    Send,
    GripVertical,
    type LucideIcon,
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

const tabContentVariants: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};


import { HeroTimelineMockup } from "./hero/HeroTimelineMockup";
import { HeroCrmMockup } from "./hero/HeroCrmMockup";
import { HeroDocumentsMockup } from "./hero/HeroDocumentsMockup";

type TabType = "timeline" | "crm" | "docs" | "resume";

// Tab configuration with badges
const tabsConfig = [
    { id: "timeline" as TabType, label: "Timeline", icon: LayoutDashboard, badge: "Live", badgeColor: "green" },
    { id: "crm" as TabType, label: "Job CRM", icon: Briefcase, badge: "4", badgeColor: "purple" },
    { id: "docs" as TabType, label: "Documents", icon: FileCheck, badge: "New", badgeColor: "blue" },
    { id: "resume" as TabType, label: "AI Resume", icon: Sparkles, badge: "Beta", badgeColor: "orange" },
];

// Toast messages per tab
const toastMessages: Record<TabType, { icon: LucideIcon; message: string }> = {
    timeline: { icon: CheckCircle, message: "OPT start date optimized!" },
    crm: { icon: Send, message: "Application saved to tracker" },
    docs: { icon: Bell, message: "Passport expires in 6 months" },
    resume: { icon: Sparkles, message: "AI suggestions ready!" },
};

// Tooltip content
const tooltipContent: Record<string, string> = {
    "days-remaining": "Days remaining until your OPT expires",
    "unemployment": "Days of unemployment used out of 90 allowed",
    "program-end": "Your graduation date from the university",
    "opt-start": "When your OPT authorization begins",
};

export function LandingHero() {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [activeTab, setActiveTab] = useState<TabType>("timeline");
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState(toastMessages.timeline);
    const [showConfetti, setShowConfetti] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const mockupRef = useRef<HTMLDivElement>(null);

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

    // Show toast on tab change
    useEffect(() => {
        setToastContent(toastMessages[activeTab]);
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }, [activeTab]);

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

    // 3D tilt effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mockupRef.current) return;
        const rect = mockupRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        setTiltStyle({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setTiltStyle({ rotateX: 0, rotateY: 0 });
        setIsHovered(false);
    };

    // Confetti trigger (called from CrmMockup on successful drag)
    const triggerConfetti = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
    };


    return (
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-8 lg:pt-12 pb-24">
            {/* Animated Aurora Background (YC/Linear Style) */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] opacity-50"></div>

                {prefersReducedMotion ? (
                    <>
                        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-200/35 mix-blend-multiply blur-[100px] dark:bg-blue-900/15 dark:mix-blend-screen" />
                        <div className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-purple-200/35 mix-blend-multiply blur-[100px] dark:bg-purple-900/15 dark:mix-blend-screen" />
                        <div className="absolute right-[-10%] top-[10%] h-[700px] w-[700px] rounded-full bg-indigo-200/30 mix-blend-multiply blur-[100px] dark:bg-indigo-900/15 dark:mix-blend-screen" />
                    </>
                ) : (
                    <>
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 10, 0],
                                opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-200/40 mix-blend-multiply blur-[100px] dark:bg-blue-900/20 dark:mix-blend-screen"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, -15, 0],
                                opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -top-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-purple-200/40 mix-blend-multiply blur-[100px] dark:bg-purple-900/20 dark:mix-blend-screen"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                x: [0, 50, 0],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute right-[-10%] top-[10%] h-[700px] w-[700px] rounded-full bg-indigo-200/40 mix-blend-multiply blur-[100px] dark:bg-indigo-900/20 dark:mix-blend-screen"
                        />
                    </>
                )}
            </div>

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
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                                <span className="relative flex h-2 w-2">
                                    {!prefersReducedMotion && (
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                    )}
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                                </span>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    #1 Platform for International Students
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance leading-tight">
                            Never miss an{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                OPT deadline
                            </span>
                        </motion.h1>

                        <motion.div
                            variants={fadeInUp}
                            className="prose-longform mx-auto mb-10 max-w-xl lg:mx-0"
                        >
                            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                                Stop using spreadsheets. Track your <strong>OPT timeline</strong>, unemployment days, and filing windows in one place — then find <strong>H-1B sponsors</strong> when you&apos;re ready.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-3 sm:items-start lg:items-start">
                            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:items-center">
                                <MagneticButton>
                                    <Link
                                        href="/login"
                                        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-700/25 transition-all hover:bg-blue-800 hover:shadow-blue-800/30 sm:w-auto lg:hover:-translate-y-0.5"
                                    >
                                        Start free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </MagneticButton>
                                <GuestPreviewModal />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Free account → enter your dates → see your OPT window
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:justify-start">
                                <span className="text-foreground/70">Where are you?</span>
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
                            <div className="rounded-2xl border border-border/80 bg-white/90 p-5 shadow-xl backdrop-blur-sm dark:bg-zinc-900/90">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
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
                                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
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
                        {/* Toast Notification */}
                        <AnimatePresence>
                            {showToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                                    className="absolute -top-4 left-1/2 z-50 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2"
                                >
                                    {(() => {
                                        const ToastIcon = toastContent.icon;
                                        return <ToastIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />;
                                    })()}
                                    <span className="text-sm font-medium text-foreground">{toastContent.message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Confetti Effect */}
                        <AnimatePresence>
                            {showConfetti && (
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 pointer-events-none overflow-hidden"
                                >
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 rounded-full"
                                            style={{
                                                background: ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"][i % 5],
                                                left: `${50 + (Math.random() - 0.5) * 40}%`,
                                                top: "50%",
                                            }}
                                            initial={{ y: 0, x: 0, scale: 1, opacity: 1 }}
                                            animate={{
                                                y: [0, -150 - Math.random() * 100, 200],
                                                x: [(Math.random() - 0.5) * 200],
                                                scale: [1, 1.2, 0.5],
                                                opacity: [1, 1, 0],
                                                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                                            }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3D Tilt Container */}
                        <motion.div
                            ref={mockupRef}
                            className="relative w-full aspect-[4/3] max-w-[600px] mx-auto"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                perspective: 1000,
                            }}
                        >
                            <motion.div
                                className="relative w-full h-full"
                                animate={{
                                    rotateX: tiltStyle.rotateX,
                                    rotateY: tiltStyle.rotateY,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Dynamic Glow Based on Active Tab */}
                                <AnimatePresence mode="wait">
                                    {activeTab === "timeline" && (
                                        <motion.div
                                            key="glow-timeline"
                                            className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 via-cyan-500/30 to-blue-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}
                                    {activeTab === "crm" && (
                                        <motion.div
                                            key="glow-crm"
                                            className="absolute inset-0 bg-gradient-to-tr from-purple-500/40 via-pink-500/30 to-purple-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}
                                    {activeTab === "docs" && (
                                        <motion.div
                                            key="glow-docs"
                                            className="absolute inset-0 bg-gradient-to-tr from-green-500/40 via-emerald-500/30 to-teal-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}
                                    {activeTab === "resume" && (
                                        <motion.div
                                            key="glow-resume"
                                            className="absolute inset-0 bg-gradient-to-tr from-orange-500/40 via-amber-500/30 to-yellow-400/20 blur-[80px] rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    )}

                                </AnimatePresence>

                                {/* Tab Content */}
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
                                                <HeroCrmMockup onDragSuccess={triggerConfetti} />
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

                                {/* Floating Status Badge (appears on Timeline tab) */}
                                <AnimatePresence>
                                    {activeTab === "timeline" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 z-20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center border-2 border-green-200 dark:border-green-800">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Status: Active</p>
                                                    <p className="text-xs text-muted-foreground">e-Verified Employer</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating H-1B Match Badge (appears on CRM tab) */}
                                <AnimatePresence>
                                    {activeTab === "crm" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-purple-200 dark:border-purple-800 z-20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                                                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">H-1B Match</p>
                                                    <p className="text-[10px] text-purple-600 dark:text-purple-400">85% Sponsorship Prob.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating Expiry Alert Badge (appears on Documents tab) */}
                                <AnimatePresence>
                                    {activeTab === "docs" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-orange-200 dark:border-orange-800 z-20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                                                    <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">Expiry Alert</p>
                                                    <p className="text-[10px] text-orange-600 dark:text-orange-400">Passport expires in 6mo</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating AI Score Badge (appears on Resume tab) */}
                                <AnimatePresence>
                                    {activeTab === "resume" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -right-4 bottom-4 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-amber-200 dark:border-amber-800 z-20"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                                                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">ATS Score</p>
                                                    <p className="text-[10px] text-amber-600 dark:text-amber-400">92% Match</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>


                            </motion.div>
                        </motion.div>

                        {/* Interactive Tab Triggers moved to Right Column */}
                        <motion.div variants={fadeInUp} className="mt-8 flex flex-col items-center z-20 relative">
                            <div className="inline-flex flex-nowrap gap-1.5 p-1.5 rounded-xl bg-gray-100/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-border/50 justify-center overflow-hidden shadow-lg">
                                {tabsConfig.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setProgress(0);
                                        }}
                                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                            ? "bg-white dark:bg-zinc-700 text-primary shadow-md"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50"
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        {/* Badge */}
                                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${tab.badgeColor === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                                            tab.badgeColor === "purple" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                                                tab.badgeColor === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                                                    tab.badgeColor === "pink" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" :
                                                        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                            }`}>
                                            {tab.badge}
                                        </span>
                                        {/* Active indicator pulse for "Live" badge */}
                                        {tab.badge === "Live" && (
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-3 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden w-full max-w-sm">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
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
