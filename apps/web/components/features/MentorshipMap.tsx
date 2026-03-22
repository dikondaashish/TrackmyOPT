"use client";

import { motion } from "framer-motion";
import { User, Briefcase, GraduationCap } from "lucide-react";
import Image from "next/image";

export function MentorshipMap() {
    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* Radar / Grid Background */}
            <div className="absolute inset-0 border rounded-full border-gray-200 dark:border-zinc-800 opacity-20 scale-50" />
            <div className="absolute inset-0 border rounded-full border-gray-200 dark:border-zinc-800 opacity-20 scale-100" />
            <div className="absolute inset-0 border rounded-full border-gray-200 dark:border-zinc-800 opacity-20 scale-150" />

            {/* Central User (You) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 p-1 shadow-lg shadow-violet-500/30">
                        <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                        You
                    </span>
                </div>
                {/* Ripple Effect */}
                <motion.div
                    className="absolute inset-0 rounded-full border border-violet-500"
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                <motion.line
                    x1="50%" y1="50%" x2="20%" y2="20%"
                    stroke="url(#grad1)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                />
                <motion.line
                    x1="50%" y1="50%" x2="80%" y2="30%"
                    stroke="url(#grad1)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                />
                <motion.line
                    x1="50%" y1="50%" x2="50%" y2="80%"
                    stroke="url(#grad1)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1.5 }}
                />
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Mentor 1: Google */}
            <MentorNode
                x="20%" y="20%"
                role="SWE @ Google"
                img="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                delay={0.5}
                color="blue"
            />

            {/* Mentor 2: Netflix */}
            <MentorNode
                x="80%" y="30%"
                role="Product @ Netflix"
                img="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
                delay={1}
                color="red"
            />

            {/* Mentor 3: Stripe */}
            <MentorNode
                x="50%" y="80%"
                role="Design @ Stripe"
                img="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                delay={1.5}
                color="indigo"
            />

        </div>
    );
}

function MentorNode({ x, y, role, img, delay, color }: any) {
    return (
        <motion.div
            className="absolute z-20"
            style={{ top: y, left: x }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay }}
        >
            <div className="relative -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
                <div className={`w-12 h-12 rounded-full border-2 border-${color}-500 bg-white dark:bg-zinc-800 p-0.5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Image src={img} alt="" width={48} height={48} className="w-full h-full rounded-full bg-gray-100 object-cover" />
                </div>

                {/* Badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center border border-gray-100 dark:border-zinc-700 shadow-sm">
                    <Briefcase className={`w-3 h-3 text-${color}-500`} />
                </div>

                {/* Tooltip Card */}
                <motion.div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg shadow-xl border border-gray-100 dark:border-zinc-800 whitespace-nowrap min-w-[120px]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.5 }}
                >
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{role}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <GraduationCap className="w-3 h-3 text-gray-400" />
                        <p className="text-[10px] text-gray-500">Alumni '21</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
