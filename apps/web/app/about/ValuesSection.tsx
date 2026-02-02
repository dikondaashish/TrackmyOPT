"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Heart, Eye, Users, Lightbulb } from "lucide-react";

const values = [
    {
        icon: Shield,
        title: "Trust & Transparency",
        description: "We're always honest about what we can and can't do. Your data is yours, and we'll never sell it.",
        color: "from-blue-500 to-indigo-600",
        size: "col-span-2 row-span-1",
    },
    {
        icon: Zap,
        title: "Speed Matters",
        description: "Time is precious when you're on OPT. We build fast, ship fast, and help you move fast.",
        color: "from-amber-500 to-orange-600",
        size: "col-span-1 row-span-2",
    },
    {
        icon: Heart,
        title: "Empathy First",
        description: "We've been in your shoes. Every decision we make considers the real stress students face.",
        color: "from-rose-500 to-pink-600",
        size: "col-span-1 row-span-1",
    },
    {
        icon: Eye,
        title: "Attention to Detail",
        description: "USCIS rules are complex. We obsess over accuracy so you don't have to.",
        color: "from-emerald-500 to-teal-600",
        size: "col-span-1 row-span-1",
    },
    {
        icon: Users,
        title: "Community Over Competition",
        description: "We believe in helping each other succeed. International students are stronger together.",
        color: "from-purple-500 to-violet-600",
        size: "col-span-1 row-span-1",
    },
    {
        icon: Lightbulb,
        title: "Continuous Innovation",
        description: "We're always building new tools and features based on what students actually need.",
        color: "from-cyan-500 to-blue-600",
        size: "col-span-1 row-span-1",
    },
];

export function ValuesSection() {
    return (
        <section className="py-24 relative bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
                        What We Stand For
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Our Core Values
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        These principles guide everything we build and every decision we make.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className={`${value.size} p-6 lg:p-8 rounded-3xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300 group`}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                <value.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {value.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
