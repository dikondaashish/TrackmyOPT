"use client";

import { motion } from "framer-motion";
import { Chrome, Laptop, RefreshCw, Check } from "lucide-react";

export function SyncConnectionVisual() {
    return (
        <div className="relative w-full max-w-lg mx-auto h-48 flex items-center justify-between px-8 bg-gray-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
            {/* Left Node: Browser Extension */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-lg flex items-center justify-center">
                    <Chrome className="w-8 h-8 text-blue-500" />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Extension</span>

                {/* Sending Badge */}
                <motion.div
                    className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 relative h-2 mx-4 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                {/* Moving Packet 1 */}
                <motion.div
                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"
                    animate={{ x: ["-100%", "500%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Moving Packet 2 (Delayed) */}
                <motion.div
                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"
                    animate={{ x: ["-100%", "500%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                />
            </div>

            {/* Center Sync Icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center shadow-lg z-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                    <RefreshCw className="w-5 h-5 text-gray-400" />
                </motion.div>
            </div>

            {/* Right Node: Dashboard */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-lg flex items-center justify-center">
                    <Laptop className="w-8 h-8 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Dashboard</span>

                {/* Received Badge */}
                <motion.div
                    className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </motion.div>
            </div>
        </div>
    );
}
