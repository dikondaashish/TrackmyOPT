"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Users, Clock } from "lucide-react";
import { ReactNode } from "react";

interface Stat {
    value: string;
    label: string;
    icon?: ReactNode;
}

interface FeatureWhyMattersProps {
    headline: string;
    description: string;
    stats: Stat[];
    accentColor?: "blue" | "emerald" | "purple" | "amber" | "cyan" | "red";
}

const accentStyles = {
    blue: {
        statBg: "bg-blue-50 dark:bg-blue-900/20",
        statBorder: "border-blue-100 dark:border-blue-800/50",
        iconColor: "text-blue-600 dark:text-blue-400",
        valueColor: "text-blue-700 dark:text-blue-300",
    },
    emerald: {
        statBg: "bg-emerald-50 dark:bg-emerald-900/20",
        statBorder: "border-emerald-100 dark:border-emerald-800/50",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-700 dark:text-emerald-300",
    },
    purple: {
        statBg: "bg-purple-50 dark:bg-purple-900/20",
        statBorder: "border-purple-100 dark:border-purple-800/50",
        iconColor: "text-purple-600 dark:text-purple-400",
        valueColor: "text-purple-700 dark:text-purple-300",
    },
    amber: {
        statBg: "bg-amber-50 dark:bg-amber-900/20",
        statBorder: "border-amber-100 dark:border-amber-800/50",
        iconColor: "text-amber-600 dark:text-amber-400",
        valueColor: "text-amber-700 dark:text-amber-300",
    },
    cyan: {
        statBg: "bg-cyan-50 dark:bg-cyan-900/20",
        statBorder: "border-cyan-100 dark:border-cyan-800/50",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        valueColor: "text-cyan-700 dark:text-cyan-300",
    },
    red: {
        statBg: "bg-red-50 dark:bg-red-900/20",
        statBorder: "border-red-100 dark:border-red-800/50",
        iconColor: "text-red-600 dark:text-red-400",
        valueColor: "text-red-700 dark:text-red-300",
    },
};

export function FeatureWhyMatters({
    headline,
    description,
    stats,
    accentColor = "red",
}: FeatureWhyMattersProps) {
    const styles = accentStyles[accentColor];

    return (
        <section className="py-24 relative bg-gray-50/50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${styles.statBg} ${styles.iconColor} text-sm font-medium mb-4`}>
                            <AlertTriangle className="w-4 h-4" />
                            Why This Matters
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            {headline}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            {description}
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-2xl ${styles.statBg} border ${styles.statBorder}`}
                            >
                                {stat.icon && (
                                    <div className={`mb-3 ${styles.iconColor}`}>
                                        {stat.icon}
                                    </div>
                                )}
                                <p className={`text-3xl sm:text-4xl font-bold ${styles.valueColor} mb-2`}>
                                    {stat.value}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
