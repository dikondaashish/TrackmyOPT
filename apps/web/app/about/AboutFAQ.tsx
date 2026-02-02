"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqItems = [
    {
        question: "Who is behind TrackMyOPT?",
        answer: "TrackMyOPT was founded by former F-1 international students who experienced the challenges of OPT management firsthand. Our entire team consists of people who have navigated the visa process, giving us unique insight into what students actually need.",
    },
    {
        question: "Is TrackMyOPT affiliated with USCIS or any government agency?",
        answer: "No, TrackMyOPT is an independent technology company and is not affiliated with USCIS, DHS, or any government agency. We provide tools to help you stay organized and informed, but always consult official USCIS resources and your DSO for authoritative guidance.",
    },
    {
        question: "How is TrackMyOPT different from other tools?",
        answer: "Unlike generic job trackers, TrackMyOPT is purpose-built for international students. We combine OPT compliance tracking, unemployment day monitoring, H-1B sponsor search, and career tools all in one platform. No other tool understands the F-1 journey like we do.",
    },
    {
        question: "Is my personal data safe with TrackMyOPT?",
        answer: "Absolutely. We use bank-level encryption, never sell your data, and are fully GDPR and CCPA compliant. Your visa status and personal information are sensitive, and we treat them with the utmost care. You can delete your account and all data at any time.",
    },
    {
        question: "Is TrackMyOPT really free?",
        answer: "Yes! Our core features including OPT tracking, unemployment monitoring, and basic job tracking are free forever. We offer a Premium tier with advanced features like AI Resume Doctor and unlimited H-1B sponsor searches for students who want extra tools.",
    },
];

export function AboutFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                        <HelpCircle className="w-4 h-4" />
                        Common Questions
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Everything you need to know about who we are and what we do.
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full text-left p-6 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {item.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-shrink-0 text-blue-600 dark:text-blue-400"
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
            </div>
        </section>
    );
}
