"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeroBannerProps {
    badge?: string;
    headline: string;
    subheadline: string;
    children?: ReactNode;
}

export function PageHeroBanner({
    badge,
    headline,
    subheadline,
    children,
}: PageHeroBannerProps) {
    return (
        <section className="relative pt-24 sm:pt-28 mt-16 pb-16 overflow-hidden">
            {/* Clean Background - matches dashboard style */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900" />

            {/* Subtle gradient blur */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-blue-100/20 to-indigo-100/10 dark:from-blue-900/10 dark:to-indigo-900/5 blur-3xl rounded-full opacity-50" />

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Badge - Apple Blue style */}
                    {badge && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
                        >
                            {badge}
                        </motion.div>
                    )}

                    {/* Headline - Clean, no gradients */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                        {headline}
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
        </section>
    );
}
