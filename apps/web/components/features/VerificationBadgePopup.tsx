"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Building2, TrendingUp, DollarSign } from "lucide-react";

export function VerificationBadgePopup() {
    return (
        <div className="relative inline-block group perspective-1000">
            {/* The Badge (Trigger) */}
            <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Goldman Sachs</span>
                <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    {/* Pulse Ring */}
                    <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                </div>
            </div>

            {/* The Popup Card */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-72 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 origin-top"
                initial={{ opacity: 0, rotateX: -15, y: -10 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
            >
                {/* Header Gradient */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />

                <div className="p-5">
                    {/* Top Row: Trust Score */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Trust Score</p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">98/100</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-400">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">H-1Bs</p>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">1,240</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-gray-100 dark:border-zinc-800 transition-colors hover:border-blue-200 dark:hover:border-blue-800">
                            <div className="flex items-center gap-1.5 mb-1 text-gray-500 dark:text-gray-400">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-[10px]">Trend</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">+12% YoY</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-gray-100 dark:border-zinc-800 transition-colors hover:border-blue-200 dark:hover:border-blue-800">
                            <div className="flex items-center gap-1.5 mb-1 text-gray-500 dark:text-gray-400">
                                <DollarSign className="w-3 h-3" />
                                <span className="text-[10px]">Avg Salary</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">$145k</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
                        <span className="text-[10px] text-gray-400">Updated today</span>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">View Report →</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
