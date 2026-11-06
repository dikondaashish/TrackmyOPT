"use client";

import { motion } from "framer-motion";
import {
    Calendar,
    CheckCircle,
} from "lucide-react";

export function HeroTimelineMockup() {
    return (
    <div className="relative bg-white dark:bg-zinc-800 rounded-xl border border-border p-6 overflow-hidden h-full flex flex-col">
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
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground text-sm">OPT Timeline</h3>
                    <p className="text-xs text-muted-foreground">Graduation to STEM Extension</p>
                </div>
            </div>
        </motion.div>

        {/* USCIS Case Tracker Badge */}
        <motion.div
            className="mb-4 rounded-lg p-3 bg-gray-50 dark:bg-zinc-900"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-muted-foreground">USCIS Case Status</span>
                <span className="rounded-md px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950">
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
                                    <div className="w-2 h-2 bg-white rounded-full" />
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
                className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
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
                <div className="w-full bg-blue-100 dark:bg-blue-950 h-1 mt-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-blue-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                    />
                </div>
            </motion.div>
            <motion.div
                className="bg-green-50 dark:bg-green-950 rounded-lg p-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
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
                <div className="w-full bg-green-100 dark:bg-green-950 h-1 mt-1.5 rounded-full overflow-hidden">
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
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800" />
                <p className="text-[10px] text-muted-foreground mb-0.5">May 15, 2025</p>
                <p className="text-xs font-medium text-foreground">Program End Date</p>
            </motion.div>
            <motion.div
                className="relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-800" />
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-0.5">Aug 12, 2025</p>
                <p className="text-xs font-medium text-foreground">OPT Start Date</p>
                <motion.div
                    className="mt-1 text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 p-1.5 rounded-lg"
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
