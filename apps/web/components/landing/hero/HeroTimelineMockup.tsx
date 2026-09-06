"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    Bell,
    CheckCircle,
    Shield,
    Sparkles,
} from "lucide-react";

export function HeroTimelineMockup() {
    return (
    <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 p-6 overflow-hidden h-full flex flex-col">
        {/* Transparency Label */}
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded text-[10px] text-muted-foreground z-20 opacity-70">
            Sample Data
        </div>
        {/* Window Controls - Left aligned */}
        <div className="flex gap-1.5 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        {/* Header */}
        <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-3">
                <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Calendar className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                    <h3 className="font-semibold text-foreground text-sm">OPT Timeline</h3>
                    <p className="text-xs text-muted-foreground">Graduation to STEM Extension</p>
                </div>
            </div>
        </motion.div>

        {/* USCIS Case Tracker Badge */}
        <motion.div
            className="mb-4 bg-white dark:bg-zinc-800 rounded-xl p-3 border border-border/50 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">USCIS Case Status</span>
                <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900/30">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    Active
                </span>
            </div>
            <div className="relative px-2">
                {/* Connecting Line */}
                <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-gray-100 dark:bg-zinc-700 -z-10" />

                {/* Steps */}
                <div className="flex justify-between items-start">
                    {[
                        { label: "Received", status: "completed" },
                        { label: "Biometric", status: "completed" },
                        { label: "Approved", status: "active" },
                        { label: "Card", status: "pending" }
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <motion.div
                                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 z-10
                                    ${step.status === 'completed' || step.status === 'active'
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-300'}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                            >
                                {step.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                {step.status === 'active' && (
                                    <motion.div
                                        className="w-2 h-2 bg-white rounded-full"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[9px] font-medium ${step.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>

        {/* Stats with animated counters */}
        <div className="grid grid-cols-2 gap-4 mb-4">
            <motion.div
                className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100/50 dark:border-blue-800/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(59, 130, 246, 0.15)" }}
            >
                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mb-0.5">Days Remaining</p>
                <motion.p
                    className="text-xl font-bold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    247
                </motion.p>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 h-1 mt-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-blue-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
            <motion.div
                className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100/50 dark:border-green-800/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(34, 197, 94, 0.15)" }}
            >
                <p className="text-[10px] font-medium text-green-600 dark:text-green-400 mb-0.5">Unemployment</p>
                <div className="flex items-end gap-1">
                    <motion.p
                        className="text-xl font-bold text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        12
                    </motion.p>
                    <p className="text-[10px] text-muted-foreground mb-0.5">/ 90 days</p>
                </div>
                <div className="w-full bg-green-100 dark:bg-green-900/30 h-1 mt-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-green-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "15%" }}
                        transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
        </div>

        {/* Vertical Timeline with staggered animations */}
        <div className="space-y-4 relative pl-4 border-l-2 border-dashed border-gray-200 dark:border-zinc-700 flex-1 overflow-visible">
            <motion.div
                className="relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
            >
                <motion.div
                    className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                />
                <p className="text-[10px] text-muted-foreground mb-0.5">May 15, 2025</p>
                <p className="text-xs font-medium text-foreground">Program End Date</p>
            </motion.div>
            <motion.div
                className="relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <motion.div
                    className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-800 ring-4 ring-blue-500/20"
                    animate={{
                        boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 8px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-0.5">Aug 12, 2025</p>
                <p className="text-xs font-medium text-foreground">OPT Start Date</p>
                <motion.div
                    className="mt-1 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 1.3 }}
                >
                    Target start date for max unemployment buffer
                </motion.div>
            </motion.div>
            <motion.div
                className="relative opacity-50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.5, x: 0 }}
                transition={{ delay: 1.2 }}
            >
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded-full border-2 border-white dark:border-zinc-800" />
                <p className="text-[10px] text-muted-foreground mb-0.5">Nov 10, 2025</p>
                <p className="text-xs font-medium text-foreground">Next Reporting Deadline</p>
            </motion.div>
        </div>
    </div>
);
}
