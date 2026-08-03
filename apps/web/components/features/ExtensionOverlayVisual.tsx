"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X, MousePointer2 } from "lucide-react";
import Image from "next/image";

export function ExtensionOverlayVisual() {
    return (
        <div className="relative w-full aspect-[4/3] max-w-[500px] mx-auto perspective-1000">
            {/* Browser Frame */}
            <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Browser Chrome */}
                <div className="h-8 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center px-3 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 ml-2 bg-gray-200 dark:bg-zinc-700 rounded h-5 w-full max-w-[200px]" />
                </div>

                {/* Mock LinkedIn/Simulated Page Content */}
                <div className="flex-1 bg-gray-50 dark:bg-zinc-950 p-4 overflow-hidden relative">
                    {/* Header */}
                    <div className="h-10 border-b border-gray-200 dark:border-zinc-800 mb-4 flex items-center justify-between opacity-50">
                        <div className="flex gap-4">
                            <div className="w-6 h-6 bg-blue-600 rounded" />
                            <div className="w-20 h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                            <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                        </div>
                    </div>

                    {/* Job Post Layout */}
                    <div className="flex gap-4">
                        {/* Left Sidebar (List) */}
                        <div className="w-1/3 space-y-3 opacity-40">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-white dark:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-800" />
                            ))}
                        </div>

                        {/* Main Content (Job Detail) */}
                        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 shadow-sm relative">
                            {/* Job Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Senior Frontend Engineer</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 group relative">
                                            Netflix
                                            {/* The "Badge" that appears */}
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 1.5, type: "spring" }}
                                                className="inline-flex"
                                            >
                                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ml-1 shadow-lg shadow-emerald-500/30 cursor-pointer">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                </div>
                                            </motion.div>
                                        </span>
                                        <span>• Los Gatos, CA</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white font-bold">N</div>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">Remote</div>
                                <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">Full-time</div>
                            </div>

                            <div className="space-y-2 opacity-60">
                                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded w-full" />
                                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded w-full" />
                                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded w-3/4" />
                                <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded w-5/6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animated Cursor */}
                <motion.div
                    className="absolute z-20 top-1/2 left-1/2 pointer-events-none"
                    initial={{ x: 100, y: 100, opacity: 0 }}
                    animate={{
                        x: [100, 100, 20, 20, 120],
                        y: [100, 100, -40, -40, 120],
                        opacity: [0, 1, 1, 1, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                >
                    <MousePointer2 className="w-6 h-6 text-black dark:text-white fill-black dark:fill-white stroke-white dark:stroke-black" />
                    <motion.div
                        className="w-8 h-8 bg-blue-500/20 rounded-full absolute -top-1 -left-1"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                </motion.div>

                {/* Slide-out Sidebar (Extension Panel) */}
                <motion.div
                    className="absolute top-[33px] right-0 bottom-0 w-64 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-10 flex flex-col"
                    initial={{ x: "100%" }}
                    animate={{ x: "0%" }}
                    transition={{ delay: 2, duration: 0.5, type: "spring", stiffness: 100 }}
                >
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Image src="/logo-temp.png" width={20} height={20} className="w-5 h-5 bg-white rounded-full" alt="" />
                            <span className="font-bold text-sm">TrackMyOPT</span>
                            <div className="ml-auto bg-white/20 p-1 rounded hover:bg-white/30 cursor-pointer">
                                <X className="w-3 h-3" />
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mt-2">Netflix</h4>
                        <p className="text-xs text-blue-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                            E-Verified • 99% Approval
                        </p>
                    </div>

                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg text-center">
                                <p className="text-xl font-bold text-gray-900 dark:text-white">450</p>
                                <p className="text-[10px] text-gray-500">H-1B Filings</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg text-center">
                                <p className="text-xl font-bold text-gray-900 dark:text-white">$185k</p>
                                <p className="text-[10px] text-gray-500">Avg Salary</p>
                            </div>
                        </div>

                        {/* Trend Chart Mock */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Hiring Trend</p>
                            <div className="h-16 flex items-end justify-between gap-1">
                                {[40, 60, 45, 70, 85, 90, 80].map((h, i) => (
                                    <div key={i} className="w-4 bg-blue-100 dark:bg-blue-900/30 rounded-t-sm" style={{ height: `${h}%` }}>
                                        <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '40%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500">Insights</p>
                            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                Strong history of sponsoring SWE roles.
                            </div>
                            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                Does not require green card for junior roles.
                            </div>
                        </div>
                    </div>

                    <div className="p-3 border-t border-gray-100 dark:border-zinc-800">
                        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                            View Full Report
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
