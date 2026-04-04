"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface Stat {
    value: number;
    suffix: string;
    label: string;
}

interface StatsCounterProps {
    title: string;
    subtitle?: string;
    stats: Stat[];
}

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const duration = 1500;
            const steps = 30;
            const increment = value / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setDisplayValue(value);
                    clearInterval(timer);
                } else {
                    setDisplayValue(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [isInView, value]);

    return (
        <span ref={ref}>
            {displayValue.toLocaleString()}{suffix}
        </span>
    );
}

export function StatsCounter({ title, subtitle, stats }: StatsCounterProps) {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                {/* Stats Grid - Clean card style */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-border text-center"
                        >
                            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
