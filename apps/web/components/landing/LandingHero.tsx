"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
    LayoutDashboard,
    Briefcase,
    FileCheck,
    Search,
    Filter,
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

// Mockup Components
const TimelineMockup = () => (
    <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground text-sm">OPT Timeline</h3>
                    <p className="text-xs text-muted-foreground">Graduation to STEM Extension</p>
                </div>
            </div>
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100/50 dark:border-blue-800/30">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Days Remaining</p>
                <p className="text-2xl font-bold text-foreground">247</p>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[65%]" />
                </div>
            </div>
            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100/50 dark:border-green-800/30">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Unemployment</p>
                <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-sm text-muted-foreground mb-1">/ 90 days</p>
                </div>
                <div className="w-full bg-green-100 dark:bg-green-900/30 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-green-600 h-full w-[15%]" />
                </div>
            </div>
        </div>

        {/* Vertical Timeline */}
        <div className="space-y-4 relative pl-4 border-l-2 border-dashed border-gray-200 dark:border-zinc-700">
            <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800" />
                <p className="text-xs text-muted-foreground mb-0.5">May 15, 2025</p>
                <p className="text-sm font-medium text-foreground">Program End Date</p>
            </div>
            <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-800 ring-4 ring-blue-500/20" />
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">Aug 12, 2025</p>
                <p className="text-sm font-medium text-foreground">OPT Start Date</p>
                <div className="mt-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2 rounded-lg">
                    Target start date for max unemployment buffer
                </div>
            </div>
            <div className="relative opacity-50">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded-full border-2 border-white dark:border-zinc-800" />
                <p className="text-xs text-muted-foreground mb-0.5">Nov 10, 2025</p>
                <p className="text-sm font-medium text-foreground">Next Reporting Deadline</p>
            </div>
        </div>
    </div>
);

const CrmMockup = () => (
    <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground text-sm">Job Tracker</h3>
                    <p className="text-xs text-muted-foreground">Application Pipeline</p>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-muted-foreground">
                    <Search className="w-4 h-4" />
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-muted-foreground">
                    <Filter className="w-4 h-4" />
                </div>
            </div>
        </div>

        {/* Kanban Columns */}
        <div className="flex gap-3 h-full overflow-hidden">
            {/* Wishlist Column */}
            <div className="flex-1 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl p-2 flex flex-col gap-2">
                <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Wishlist</span>
                    <span className="text-[10px] bg-gray-200 dark:bg-zinc-700 px-1.5 rounded-full text-foreground">12</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-border/50 shadow-sm">
                    <p className="text-xs font-semibold text-foreground mb-1">Google</p>
                    <p className="text-[10px] text-muted-foreground">Software Engineer, L3</p>
                    <div className="mt-2 flex gap-1">
                        <span className="text-[8px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">H-1B Sponsor</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-border/50 shadow-sm">
                    <p className="text-xs font-semibold text-foreground mb-1">Netflix</p>
                    <p className="text-[10px] text-muted-foreground">Frontend Developer</p>
                </div>
            </div>

            {/* Applied Column */}
            <div className="flex-1 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-2 flex flex-col gap-2 border border-blue-100/50 dark:border-blue-900/20">
                <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Applied</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 px-1.5 rounded-full text-blue-700 dark:text-blue-300">5</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-border/50 shadow-sm ring-1 ring-blue-500/20">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-semibold text-foreground">Microsoft</p>
                        <span className="text-[10px] text-muted-foreground">2d ago</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Product Manager</p>
                    <div className="mt-2 flex gap-1">
                        <span className="text-[8px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">Referral</span>
                    </div>
                </div>
            </div>

            {/* Interview Column */}
            <div className="flex-1 bg-gray-50/50 dark:bg-zinc-900/30 rounded-xl p-2 flex flex-col gap-2 opacity-60">
                <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Interview</span>
                    <span className="text-[10px] bg-gray-200 dark:bg-zinc-700 px-1.5 rounded-full text-foreground">1</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-border/50 shadow-sm">
                    <p className="text-xs font-semibold text-foreground mb-1">Airbnb</p>
                    <p className="text-[10px] text-muted-foreground">Full Stack Eng</p>
                </div>
            </div>
        </div>
    </div>
);

const DocumentsMockup = () => (
    <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground text-sm">Document Vault</h3>
                    <p className="text-xs text-muted-foreground">Encrypted Storage</p>
                </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-[10px] text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-900/50">
                <Shield className="w-3 h-3" />
                AES-256 Encrypted
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
            {[
                { name: "OPT I-20", type: "PDF", size: "2.4 MB", date: "Expires in 8mo", color: "blue" },
                { name: "EAD Card", type: "IMG", size: "1.1 MB", date: "Expires in 8mo", color: "purple" },
                { name: "Passport", type: "PDF", size: "4.2 MB", date: "Expires in 2yr", color: "orange" },
                { name: "Offer Letter", type: "PDF", size: "1.8 MB", date: "Uploaded 2d ago", color: "gray" },
            ].map((doc, i) => (
                <div key={i} className="group p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/40 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                            ${doc.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                            ${doc.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                            ${doc.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                            ${doc.color === 'gray' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ''}
                        `}>
                            {doc.type}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                                <ArrowRight className="w-3 h-3 text-primary" />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.date}</p>
                </div>
            ))}
        </div>
    </div>
);

type TabType = "timeline" | "crm" | "docs";

export function LandingHero() {
    const [activeTab, setActiveTab] = useState<TabType>("timeline");

    return (
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-20 lg:pt-32 pb-20">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900" />

            {/* Mesh Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-blue-100/20 to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10 blur-3xl rounded-full opacity-50" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/30 to-blue-50/30 dark:from-indigo-900/10 dark:to-blue-900/10 blur-3xl rounded-full opacity-50" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="text-center lg:text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-8 border border-blue-100 dark:border-blue-800">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                            </span>
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Trusted by 15,000+ F-1 Students
                            </span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-8 text-balance">
                            Your Entire{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                OPT Journey
                            </span>
                            <br />
                            in One System
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Stop using spreadsheets. TrackMyOPT connects your timeline, job search, and compliance documents in a single, professional dashboard.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 text-white bg-primary rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                                Start Free Tracking
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                            <Link href="#features" className="inline-flex items-center justify-center px-8 py-4 text-foreground bg-white dark:bg-zinc-800 border border-border rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all">
                                View Demo
                            </Link>
                        </motion.div>

                        {/* Interactive Tab Triggers for Mobile/Desktop */}
                        <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap gap-2 justify-center lg:justify-start">
                            {[
                                { id: "timeline", label: "Timeline", icon: LayoutDashboard },
                                { id: "crm", label: "Job CRM", icon: Briefcase },
                                { id: "docs", label: "Documents", icon: FileCheck },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                            ? "bg-white dark:bg-zinc-800 text-primary shadow-md ring-1 ring-border"
                                            : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Interactive Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative hidden lg:block h-[600px] w-full"
                    >
                        {/* Blob Background for Cards */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr opacity-20 blur-3xl rounded-full transition-colors duration-1000
                            ${activeTab === 'timeline' ? 'from-blue-500 to-cyan-500' : ''}
                            ${activeTab === 'crm' ? 'from-purple-500 to-pink-500' : ''}
                            ${activeTab === 'docs' ? 'from-green-500 to-emerald-500' : ''}
                        `} />

                        <div className="relative h-full w-full">
                            <AnimatePresence mode="wait">
                                {activeTab === "timeline" && (
                                    <motion.div
                                        key="timeline"
                                        variants={tabContentVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="h-full"
                                    >
                                        <TimelineMockup />
                                        {/* Floating Badge */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl border border-border/50 flex gap-3 items-center"
                                        >
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">Status: Active</p>
                                                <p className="text-xs text-muted-foreground">e-Verified Employer</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {activeTab === "crm" && (
                                    <motion.div
                                        key="crm"
                                        variants={tabContentVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="h-full"
                                    >
                                        <CrmMockup />
                                        {/* Floating Badge */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="absolute -top-4 -right-4 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl border border-border/50 flex gap-3 items-center"
                                        >
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">H-1B Match</p>
                                                <p className="text-xs text-muted-foreground">85% Sponsorship Prob.</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {activeTab === "docs" && (
                                    <motion.div
                                        key="docs"
                                        variants={tabContentVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="h-full"
                                    >
                                        <DocumentsMockup />
                                        {/* Floating Badge */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="absolute bottom-10 -right-8 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl border border-border/50 flex gap-3 items-center"
                                        >
                                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600">
                                                <Bell className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">Expiry Alert</p>
                                                <p className="text-xs text-muted-foreground">Passport expires in 6mo</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
