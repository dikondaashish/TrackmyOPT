"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Eye, FileSearch, ShieldAlert } from "lucide-react";

export function HiddenDataLayers() {
    return (
        <div className="relative w-full max-w-[400px] mx-auto aspect-square flex items-center justify-center perspective-1000">
            {/* Layer 3: The Deep Data (Hidden) */}
            <motion.div
                className="absolute w-64 h-80 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 shadow-xl flex flex-col items-center justify-end p-6"
                initial={{ z: -100, scale: 0.9, y: 0 }}
                animate={{
                    y: -40,
                    rotateX: 10,
                    scale: 0.95
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
                <div className="w-full space-y-3 mb-8 opacity-60">
                    <div className="h-2 bg-red-200 dark:bg-red-800 rounded w-full" />
                    <div className="h-2 bg-red-200 dark:bg-red-800 rounded w-3/4" />
                </div>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Real Denial Rate: 12%</span>
                </div>
            </motion.div>


            {/* Layer 2: The Red Flags (Hidden) */}
            <motion.div
                className="absolute w-64 h-80 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-lg flex flex-col items-center justify-center p-6"
                initial={{ z: -50, scale: 0.95, y: 0 }}
                animate={{
                    y: -20,
                    rotateX: 5,
                    scale: 0.98
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.1 }}
            >
                <div className="absolute top-4 right-4 text-amber-500">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-center mt-8">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">DOL Investigations</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">2 Flagged Filings</p>
                </div>
            </motion.div>


            {/* Layer 1: The Surface (Public Data) */}
            <motion.div
                className="absolute w-64 h-80 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-2xl p-6 flex flex-col items-center"
                initial={{ z: 0, y: 0 }}
                animate={{ y: 20 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 }}
            >
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full mb-4 flex items-center justify-center">
                    <BuildingIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">TechCorp Inc.</h3>
                <p className="text-xs text-green-600 mb-6 font-medium">Verified Sponsor</p>

                <div className="w-full space-y-3">
                    <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded w-full flex items-center px-2">
                        <div className="w-8 h-2 bg-gray-300 dark:bg-zinc-600 rounded" />
                    </div>
                    <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded w-full flex items-center px-2">
                        <div className="w-12 h-2 bg-gray-300 dark:bg-zinc-600 rounded" />
                    </div>
                    <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded w-full flex items-center px-2">
                        <div className="w-10 h-2 bg-gray-300 dark:bg-zinc-600 rounded" />
                    </div>
                </div>

                <div className="mt-auto flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-full">
                    <Eye className="w-3 h-3" />
                    <span className="w-full">What they show you</span>
                </div>
            </motion.div>

            {/* Mag Glass / Revealer */}
            <motion.div
                className="absolute z-20 top-1/2 -right-12 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 flex flex-col items-center gap-2"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <FileSearch className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 writing-vertical-rl">DEEP SCAN</span>
            </motion.div>

        </div>
    );
}

function BuildingIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="9" y1="22" x2="9" y2="22.01"></line>
            <line x1="15" y1="22" x2="15" y2="22.01"></line>
            <line x1="12" y1="22" x2="12" y2="22.01"></line>
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <line x1="9" y1="6" x2="9" y2="6.01"></line>
            <line x1="15" y1="6" x2="15" y2="6.01"></line>
            <line x1="9" y1="10" x2="9" y2="10.01"></line>
            <line x1="15" y1="10" x2="15" y2="10.01"></line>
            <line x1="9" y1="14" x2="9" y2="14.01"></line>
            <line x1="15" y1="14" x2="15" y2="14.01"></line>
        </svg>
    )
}
