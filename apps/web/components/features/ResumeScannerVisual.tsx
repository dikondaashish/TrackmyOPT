"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles, ScanLine } from "lucide-react";

export function ResumeScannerVisual() {
    return (
        <div className="relative w-full max-w-[400px] mx-auto aspect-[3/4]">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur-3xl transform rotate-3" />

            {/* The Document */}
            <motion.div
                className="relative h-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Document Content (Abstract) */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex gap-4 items-center mb-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-3/4 rounded" />
                            <div className="h-3 bg-gray-100 dark:bg-zinc-800 w-1/2 rounded" />
                        </div>
                    </div>

                    {/* Body Lines */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-gray-100 dark:bg-zinc-800 w-full rounded" />
                            <div className="h-3 bg-gray-100 dark:bg-zinc-800 w-5/6 rounded" />
                            <div className="h-3 bg-gray-100 dark:bg-zinc-800 w-4/6 rounded" />
                        </div>
                    ))}
                </div>

                {/* 1. X-Ray Scanner Bar (Moving Up/Down) */}
                <motion.div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent z-20 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* 2. Scanning Overlay (The "Light" Beam) */}
                <motion.div
                    className="absolute inset-x-0 h-24 bg-gradient-to-b from-purple-500/10 to-transparent z-10 pointer-events-none"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* 3. Detected Issues (Popups) */}
                <motion.div
                    className="absolute top-1/3 right-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded shadow-lg border border-red-200 dark:border-red-800"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.1, 1], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                    Weak Verb
                </motion.div>

                <motion.div
                    className="absolute bottom-1/3 left-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded shadow-lg border border-emerald-200 dark:border-emerald-800"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.1, 1], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                    Great Impact!
                </motion.div>

            </motion.div>

            {/* Floating Score Badge */}
            <motion.div
                className="absolute -right-4 top-10 z-30 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold">
                    <span className="text-2xl">94</span>
                    <span className="text-[10px] uppercase opacity-80">Score</span>
                </div>
            </motion.div>

            {/* Decoration Icons */}
            <motion.div
                className="absolute -left-6 bottom-20 z-0 text-purple-300 dark:text-purple-900"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <Sparkles className="w-12 h-12" />
            </motion.div>
        </div>
    );
}
