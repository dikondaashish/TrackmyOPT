"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface StatProps {
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
    duration?: number;
}

function AnimatedStat({ value, suffix = "", prefix = "", label, duration = 2 }: StatProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / (duration * 1000), 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * value));

            if (now < endTime) {
                requestAnimationFrame(animate);
            } else {
                setCount(value);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, duration]);

    return (
        <div ref={ref} className="text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
                {prefix}{count.toLocaleString()}{suffix}
            </motion.div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                {label}
            </p>
        </div>
    );
}

interface StatsCounterProps {
    stats: {
        value: number;
        suffix?: string;
        prefix?: string;
        label: string;
    }[];
    title?: string;
    subtitle?: string;
}

export function StatsCounter({ stats, title, subtitle }: StatsCounterProps) {
    return (
        <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {(title || subtitle) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        {title && (
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AnimatedStat {...stat} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
