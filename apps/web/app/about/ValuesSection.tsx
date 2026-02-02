"use client";

import { motion } from "framer-motion";
import { Shield, Heart, Zap, Eye, Users, Award } from "lucide-react";

const values = [
    {
        icon: Shield,
        title: "Privacy First",
        description: "Your documents and data are encrypted with AES-256. We never sell or share your information.",
    },
    {
        icon: Heart,
        title: "Student-Focused",
        description: "Every feature is designed around what F-1 students actually need.",
    },
    {
        icon: Zap,
        title: "Fast & Reliable",
        description: "Built for speed. No waiting around for pages to load or features to work.",
    },
    {
        icon: Eye,
        title: "Transparent",
        description: "Clear pricing, no hidden fees. What you see is what you get.",
    },
    {
        icon: Users,
        title: "Community Driven",
        description: "We build what our users ask for. Your feedback shapes the product.",
    },
    {
        icon: Award,
        title: "Quality",
        description: "We obsess over the details to deliver a polished, professional experience.",
    },
];

export function ValuesSection() {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        What We Stand For
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        The principles that guide everything we build
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-border hover:border-primary/30 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                                <value.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {value.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
