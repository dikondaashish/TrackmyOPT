"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle2, AlertCircle, Scan, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function ResumeScanner() {
    const [scanComplete, setScanComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setScanComplete(true);
        }, 3500); // Scan duration
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-border overflow-hidden group">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 h-14 bg-gray-50 dark:bg-zinc-800 border-b border-border flex items-center px-4 justify-between z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="h-2 w-24 bg-gray-200 dark:bg-zinc-700 rounded mb-1" />
                        <div className="h-1.5 w-16 bg-gray-100 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
            </div>

            {/* Document Content */}
            <div className="absolute inset-0 pt-20 px-8 pb-8 flex flex-col gap-4 bg-white dark:bg-zinc-900 z-10">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-900 dark:bg-zinc-600 rounded" />
                        <div className="h-2 w-32 bg-gray-400 dark:bg-zinc-700 rounded" />
                    </div>
                </div>

                {/* Body Lines */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-2.5 w-full bg-gray-200 dark:bg-zinc-800 rounded" />
                        <div className="h-2.5 w-[90%] bg-gray-200 dark:bg-zinc-800 rounded" />
                        <div className="h-2.5 w-[95%] bg-gray-200 dark:bg-zinc-800 rounded" />
                    </div>
                ))}

                {/* Highlights (Appear after scan) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: scanComplete ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-20"
                >
                    {/* Bad Keyword Highlight */}
                    <div className="absolute top-[35%] left-8 right-8 h-6 bg-red-500/20 border border-red-500/50 rounded flex items-center px-2">
                        <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                        <span className="text-[10px] text-red-600 font-medium">Vague action verb</span>
                    </div>

                    {/* Good Keyword Highlight */}
                    <div className="absolute top-[55%] left-8 right-8 h-6 bg-green-500/20 border border-green-500/50 rounded flex items-center px-2">
                        <CheckCircle2 className="w-3 h-3 text-green-600 mr-1" />
                        <span className="text-[10px] text-green-600 font-medium">Strong metric: "Increased by 20%"</span>
                    </div>
                </motion.div>
            </div>

            {/* Scanning Beam */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-blue-500 z-30 shadow-[0_0_20px_2px_rgba(59,130,246,0.5)]"
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 1
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/20 to-transparent" />
            </motion.div>

            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0 user-select-none pointer-events-none" />

            {/* AI HUD Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-3 z-40 border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center animate-pulse">
                    <Scan className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <p className="text-xs text-blue-400 font-medium font-mono mb-0.5">
                        {scanComplete ? "ANALYSIS COMPLETE" : "SCANNING DOCUMENT..."}
                    </p>
                    <div className="h-1 w-32 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3.5, repeat: Infinity }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
