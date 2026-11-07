"use client";

import { motion } from "framer-motion";
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
        statBg: "bg-blue-50 dark:bg-blue-950",
        statBorder: "border-t-blue-600 dark:border-t-blue-500",
        iconColor: "text-blue-600 dark:text-blue-400",
        valueColor: "text-blue-700 dark:text-blue-300",
    },
    emerald: {
        statBg: "bg-emerald-50 dark:bg-emerald-950",
        statBorder: "border-t-emerald-600 dark:border-t-emerald-500",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-700 dark:text-emerald-300",
    },
    purple: {
        statBg: "bg-violet-50 dark:bg-violet-950",
        statBorder: "border-t-violet-600 dark:border-t-violet-500",
        iconColor: "text-violet-600 dark:text-violet-400",
        valueColor: "text-violet-700 dark:text-violet-300",
    },
    amber: {
        statBg: "bg-amber-50 dark:bg-amber-950",
        statBorder: "border-t-amber-600 dark:border-t-amber-500",
        iconColor: "text-amber-600 dark:text-amber-400",
        valueColor: "text-amber-700 dark:text-amber-300",
    },
    cyan: {
        statBg: "bg-cyan-50 dark:bg-cyan-950",
        statBorder: "border-t-cyan-600 dark:border-t-cyan-500",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        valueColor: "text-cyan-700 dark:text-cyan-300",
    },
    red: {
        statBg: "bg-red-50 dark:bg-red-950",
        statBorder: "border-t-red-600 dark:border-t-red-500",
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
        <section className="relative overflow-hidden border-y border-border bg-surface py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                            {headline}
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
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
                                className={`surface-card p-6 border-t-[3px] ${styles.statBorder}`}
                            >
                                {stat.icon && (
                                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${styles.statBg} ${styles.iconColor}`}>
                                        {stat.icon}
                                    </div>
                                )}
                                <p className={`text-3xl sm:text-4xl font-bold ${styles.valueColor} mb-2`}>
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground">
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
