"use client";

import { motion } from "framer-motion";
import {
    Clock,
    Briefcase,
    TrendingUp,
    Search,
    CheckCircle2,
    Calendar,
    BarChart3,
    ShieldCheck
} from "lucide-react";

export function HeroDashboardPreview() {
    return (
        <div className="relative w-full aspect-[4/3] max-w-[800px] mx-auto perspective-1000">
            {/* Glow Behind */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-purple-500/30 to-amber-500/30 blur-[100px] rounded-full opacity-50" />

            {/* Main Dashboard Container */}
            <motion.div
                className="relative w-full h-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6"
                initial={{ rotateX: 20, rotateY: -10, y: 50, opacity: 0 }}
                animate={{ rotateX: 10, rotateY: -5, y: 0, opacity: 1 }}
                transition={{ duration: 1.5, type: "spring" }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Dashboard Header Mock */}
                <div className="flex items-center justify-between mb-8 opacity-50">
                    <div className="flex gap-4">
                        <div className="w-32 h-6 bg-gray-200 dark:bg-zinc-800 rounded" />
                        <div className="hidden sm:flex gap-4">
                            <div className="w-20 h-6 bg-gray-100 dark:bg-zinc-800 rounded" />
                            <div className="w-20 h-6 bg-gray-100 dark:bg-zinc-800 rounded" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800" />
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-12 gap-4 h-full relative z-10">

                    {/* 1. Main Stats: OPT Clock (Left Col) */}
                    <motion.div
                        className="col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white flex flex-col justify-between shadow-lg shadow-blue-500/20"
                        whileHover={{ y: -5 }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium bg-green-400 text-green-900 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <div>
                            <p className="text-sm text-blue-100 mb-1">Unemployment Days</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold">12</span>
                                <span className="text-sm text-blue-200 mb-1">/ 90 left</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                                <motion.div
                                    className="h-full bg-green-400 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "86%" }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Activity Feed (Middle Col) */}
                    <div className="col-span-5 space-y-3">
                        {/* Card 1: Job Applied */}
                        <motion.div
                            className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm flex gap-3 items-center"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Applied to Tesla</p>
                                <p className="text-xs text-gray-500">Senior Data Scientist</p>
                            </div>
                        </motion.div>

                        {/* Card 2: Interview Scheduled */}
                        <motion.div
                            className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm flex gap-3 items-center"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Interview: Amazon</p>
                                <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
                            </div>
                        </motion.div>

                        {/* Card 3: New Alert */}
                        <motion.div
                            className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm flex gap-3 items-center"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">STEM Extension</p>
                                <p className="text-xs text-gray-500">Window opens in 15 days</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* 3. Analytics (Right Col - hidden on mobile, partial view) */}
                    <div className="col-span-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500">Response Rate</span>
                        </div>
                        <div className="flex items-end justify-between gap-1 h-32">
                            {[50, 70, 40, 90, 60].map((h, i) => (
                                <motion.div
                                    key={i}
                                    className="w-full bg-blue-500 rounded-t"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: 1.5 + (i * 0.1) }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floating Elements (Extension Overlay) */}
                <motion.div
                    className="absolute -right-12 top-20 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 w-64 z-20"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2, type: "spring" }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold">U</div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Uber</p>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> E-Verified
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-gray-50 dark:bg-zinc-800 p-2 rounded text-center">
                            <p className="text-xs text-gray-400">H-1Bs</p>
                            <p className="font-bold text-gray-900 dark:text-white">1.2k</p>
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-zinc-800 p-2 rounded text-center">
                            <p className="text-xs text-gray-400">Approval</p>
                            <p className="font-bold text-green-600">98%</p>
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    )
}
