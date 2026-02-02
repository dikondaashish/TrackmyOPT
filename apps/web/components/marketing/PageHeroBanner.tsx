"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeroBannerProps {
    badge?: string;
    headline: string;
    subheadline: string;
    gradient?: "blue" | "emerald" | "purple" | "amber" | "cyan";
    children?: ReactNode;
}

const gradients = {
    blue: "from-blue-600 via-indigo-600 to-purple-600",
    emerald: "from-emerald-600 via-teal-600 to-cyan-600",
    purple: "from-purple-600 via-pink-600 to-rose-600",
    amber: "from-amber-500 via-orange-500 to-red-500",
    cyan: "from-cyan-600 via-blue-600 to-indigo-600",
};

export function PageHeroBanner({
    badge,
    headline,
    subheadline,
    gradient = "blue",
    children,
}: PageHeroBannerProps) {
    return (
        <section className="relative pt-24 sm:pt-28 mt-16 pb-20 overflow-hidden">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradient]} opacity-5 dark:opacity-10`} />

            {/* Decorative blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br ${gradients[gradient]} opacity-10 rounded-full blur-[128px]`} />
                <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br ${gradients[gradient]} opacity-5 rounded-full blur-[100px]`} />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Badge */}
                    {badge && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${gradients[gradient]} text-white text-sm font-medium mb-6`}
                        >
                            {badge}
                        </motion.div>
                    )}

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        {headline}
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        {subheadline}
                    </p>

                    {/* Optional children (buttons, etc.) */}
                    {children && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-10"
                        >
                            {children}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent" />
        </section>
    );
}
