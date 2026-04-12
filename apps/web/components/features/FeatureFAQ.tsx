"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

interface FeatureFAQProps {
    title?: string;
    subtitle?: string;
    items: FAQItem[];
    accentColor?: "blue" | "emerald" | "purple" | "amber" | "cyan";
}

const accentColors = {
    blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        hover: "hover:border-blue-300 dark:hover:border-blue-700",
    },
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: "text-emerald-600 dark:text-emerald-400",
        hover: "hover:border-emerald-300 dark:hover:border-emerald-700",
    },
    purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        icon: "text-purple-600 dark:text-purple-400",
        hover: "hover:border-purple-300 dark:hover:border-purple-700",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
        hover: "hover:border-amber-300 dark:hover:border-amber-700",
    },
    cyan: {
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        border: "border-cyan-200 dark:border-cyan-800",
        icon: "text-cyan-600 dark:text-cyan-400",
        hover: "hover:border-cyan-300 dark:hover:border-cyan-700",
    },
};

export function FeatureFAQ({
    title = "Frequently Asked Questions",
    subtitle = "Everything you need to know",
    items,
    accentColor = "blue",
}: FeatureFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const colors = accentColors[accentColor];

    return (
        <section className="py-24 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${colors.bg} ${colors.icon} text-sm font-medium mb-4`}>
                        <HelpCircle className="w-4 h-4" />
                        Have Questions?
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {title}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className={`w-full text-left p-6 rounded-2xl border ${colors.border} ${colors.hover} bg-white dark:bg-gray-800/50 transition-all duration-200 group`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                                        {item.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex-shrink-0 ${colors.icon}`}
                                    >
                                        <ChevronDown className="w-5 h-5" />
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {item.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Help CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-600 dark:text-gray-400">
                        Still have questions?{" "}
                        <a href="mailto:support@trackmyopt.com" className={`font-semibold ${colors.icon} hover:underline`}>
                            Contact our support team
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
