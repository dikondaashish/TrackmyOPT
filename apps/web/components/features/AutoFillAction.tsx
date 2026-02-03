"use client";

import { motion } from "framer-motion";
import { Mail, ArrowRight, Check, Sparkles, Building2, Briefcase } from "lucide-react";

export function AutoFillAction() {
    return (
        <div className="relative w-full max-w-[500px] mx-auto h-[300px] flex items-center justify-center">

            {/* 1. Source: Email/Text Snippet */}
            <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-lg p-4 z-10"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs uppercase font-bold tracking-wider">
                    <Mail className="w-3 h-3" /> Source
                </div>
                <div className="space-y-2 text-[10px] text-gray-500 font-mono leading-relaxed">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300">
                        Subject: Interview with <span className="font-bold">Airbnb</span>
                    </div>
                    <p>Hi,</p>
                    <p>Thanks for applying to the <span className="text-gray-900 dark:text-white font-semibold bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">Product Designer</span> role.</p>
                    <p>We'd like to schedule a <span className="text-gray-900 dark:text-white font-semibold bg-green-100 dark:bg-green-900/30 px-1 rounded">Screening</span> next week.</p>
                </div>
            </motion.div>

            {/* Parsing Particles */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 overflow-hidden z-0">
                <motion.div
                    className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <motion.div
                className="absolute left-[45%] top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-zinc-800 rounded-full p-2 shadow-lg"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <Sparkles className="w-4 h-4 text-amber-500" />
            </motion.div>


            {/* 2. Destination: Job Card */}
            <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-800 shadow-xl p-4 z-10"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center gap-2 mb-3 text-amber-500 text-xs uppercase font-bold tracking-wider justify-between">
                    <span>Job Tracker</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>

                <div className="space-y-3">
                    <Field label="Company" value="Airbnb" icon={Building2} delay={1} />
                    <Field label="Role" value="Product Designer" icon={Briefcase} delay={1.5} />

                    <motion.div
                        className="p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 flex items-center justify-between"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2, type: "spring" }}
                    >
                        <span className="text-[10px] font-semibold text-green-700 dark:text-green-300">Status: Interviewing</span>
                        <Check className="w-3 h-3 text-green-600" />
                    </motion.div>
                </div>
            </motion.div>

        </div>
    );
}

function Field({ label, value, icon: Icon, delay }: any) {
    return (
        <motion.div
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <div className="w-6 h-6 rounded bg-white dark:bg-zinc-700 flex items-center justify-center">
                <Icon className="w-3 h-3 text-gray-400" />
            </div>
            <div>
                <p className="text-[9px] text-gray-400 uppercase">{label}</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </motion.div>
    );
}
