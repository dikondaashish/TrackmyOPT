"use client";

import { motion } from "framer-motion";
import {
    Clock,
    FileText,
    CreditCard,
    Shield,
    Settings,
    Smartphone,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

const categories = [
    {
        icon: Clock,
        title: "OPT Timeline",
        description: "Tracking deadlines, unemployment days, and STEM extension",
        href: "/dashboard/help?topic=opt",
        color: "from-blue-500 to-indigo-600",
    },
    {
        icon: FileText,
        title: "Resume & Career",
        description: "AI Resume Doctor, job tracking, and career tools",
        href: "/dashboard/help?topic=career",
        color: "from-emerald-500 to-teal-600",
    },
    {
        icon: CreditCard,
        title: "Billing & Plans",
        description: "Subscriptions, payments, and refunds",
        href: "/dashboard/help?topic=billing",
        color: "from-amber-500 to-orange-600",
    },
    {
        icon: Shield,
        title: "Account & Privacy",
        description: "Security, data, and account management",
        href: "/dashboard/help?topic=account",
        color: "from-rose-500 to-pink-600",
    },
    {
        icon: Settings,
        title: "Technical Issues",
        description: "Troubleshooting, bugs, and known issues",
        href: "/dashboard/help?topic=technical",
        color: "from-purple-500 to-violet-600",
    },
    {
        icon: Smartphone,
        title: "Chrome Extension",
        description: "Installation, usage, and browser support",
        href: "/dashboard/help?topic=extension",
        color: "from-cyan-500 to-blue-600",
    },
];

export function HelpCategories() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                        Browse by Topic
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Help Center Categories
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Find answers quickly by browsing our categorized help center.
                    </p>
                </motion.div>

                {/* Categories Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={category.href} className="block group">
                                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-transparent hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                            <category.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                                {category.title}
                                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/dashboard/help"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                    >
                        View Full Help Center
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
