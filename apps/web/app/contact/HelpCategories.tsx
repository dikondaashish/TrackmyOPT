"use client";

import { motion } from "framer-motion";
import { Calendar, FileText, Briefcase, CreditCard, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";

const categories = [
    {
        icon: Calendar,
        title: "OPT Timeline",
        description: "Dates, deadlines, and unemployment tracking",
        href: "/dashboard/help",
    },
    {
        icon: FileText,
        title: "Documents",
        description: "Storage, uploads, and organization",
        href: "/dashboard/help",
    },
    {
        icon: Briefcase,
        title: "Job Tracker",
        description: "Applications and H-1B sponsors",
        href: "/dashboard/help",
    },
    {
        icon: CreditCard,
        title: "Billing",
        description: "Subscriptions and payments",
        href: "/dashboard/help",
    },
    {
        icon: Settings,
        title: "Account",
        description: "Settings and preferences",
        href: "/dashboard/settings",
    },
    {
        icon: HelpCircle,
        title: "Getting Started",
        description: "New user guides and tutorials",
        href: "/dashboard/help",
    },
];

export function HelpCategories() {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Help Center
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Find answers by topic
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={category.href}
                                className="block p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-border hover:border-primary/30 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <category.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {category.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
