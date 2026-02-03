"use client";

import { motion } from "framer-motion";
import { Building2, MoreHorizontal, Clock, CheckCircle2, DollarSign, Calendar } from "lucide-react";

export function KanbanBoardVisual() {
    return (
        <div className="relative w-full max-w-[600px] mx-auto aspect-[16/9] perspective-1000">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-3xl rounded-full" />

            <div className="relative h-full flex gap-4 p-4 overflow-hidden"
                style={{ transform: "rotateX(10deg) scale(0.95)", transformStyle: "preserve-3d" }}>

                {/* Column 1: Applied */}
                <div className="flex-1 flex flex-col gap-3 min-w-[30%]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Applied</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500">12</span>
                    </div>

                    {/* Static Cards */}
                    <Card company="Netflix" role="Senior SWE" days="2d" color="blue" />
                    <Card company="Stripe" role="Backend  Eng" days="5d" color="indigo" />

                    {/* Empty slot placeholder */}
                    <div className="h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800" />
                </div>

                {/* Column 2: Interviewing */}
                <div className="flex-1 flex flex-col gap-3 min-w-[30%]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Interviewing</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500">4</span>
                    </div>

                    <Card company="Amazon" role="SDE II" days="12d" color="amber" />

                    {/* The Moving Card */}
                    <motion.div
                        className="bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-xl border border-emerald-100 dark:border-emerald-900/30 z-20"
                        initial={{ x: -180, y: 150, rotate: -5 }} // Start in "Applied" roughly
                        animate={{
                            x: [-180, -180, 0, 0, 0, 0, 180, 180],
                            y: [150, 150, 0, 0, 0, 0, -80, -80],
                            rotate: [-5, 0, 0, 0, 0, 2, 2, 0],
                            scale: [1, 1.05, 1.05, 1, 1, 1.05, 1.05, 1]
                        }}
                        transition={{
                            duration: 6,
                            times: [0, 0.1, 0.3, 0.4, 0.6, 0.7, 0.9, 1],
                            repeat: Infinity,
                            repeatDelay: 2
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">Google</p>
                                <p className="text-[10px] text-gray-500">L4 Engineer</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-medium">Updated just now</span>
                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                        </div>
                    </motion.div>
                </div>

                {/* Column 3: Offer */}
                <div className="flex-1 flex flex-col gap-3 min-w-[30%]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Offer</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500">1</span>
                    </div>

                    {/* Success Card */}
                    <motion.div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-sm border border-emerald-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 bg-emerald-500 rounded-bl-lg">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Microsoft</p>
                                    <p className="text-[10px] text-emerald-600 font-medium">$165k Offer!</p>
                                </div>
                            </div>
                        </div>
                        {/* Confetti / Celebration Particles */}
                        {[1, 2, 3, 4, 5].map(i => (
                            <motion.div
                                key={i}
                                className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-emerald-500"
                                animate={{
                                    y: [-10, -50],
                                    x: [0, (Math.random() - 0.5) * 50],
                                    opacity: [1, 0],
                                    scale: [0, 1]
                                }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </motion.div>

                </div>

            </div>
        </div>
    );
}

function Card({ company, role, days, color }: any) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                    <Building2 className={`w-4 h-4 text-${color}-600`} />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{company}</p>
                    <p className="text-[10px] text-gray-500">{role}</p>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {days} ago
                </div>
                <MoreHorizontal className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    )
}
