"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqItems = [
    {
        question: "Are these real student success stories?",
        answer: "Yes! Every success story featured on our platform comes from real TrackMyOPT users. We verify each story and only publish with the student's explicit permission. Names may be shortened for privacy, but the companies, universities, and outcomes are 100% authentic.",
    },
    {
        question: "Can I submit my own success story?",
        answer: "Absolutely! We love hearing from our users. If you've landed a job, secured H-1B sponsorship, or successfully navigated your OPT using TrackMyOPT, we'd be honored to feature your story. Use the submission form below or email us at stories@trackmyopt.com.",
    },
    {
        question: "What industries do TrackMyOPT users work in?",
        answer: "Our users have landed jobs across 50+ industries including Technology, Finance, Healthcare, Consulting, Manufacturing, Education, and more. While tech roles are common, we have success stories from every major industry that hires international talent.",
    },
    {
        question: "How long does it typically take to find a job using TrackMyOPT?",
        answer: "Based on our data, users who actively use TrackMyOPT's tools find jobs 40% faster than the average international student job seeker. Most active users land roles within 2-4 months, compared to the national average of 6-8 months for international students.",
    },
    {
        question: "Do I need premium to have success like these students?",
        answer: "Many of our success stories come from users on our free tier! The core OPT tracking, unemployment monitoring, and basic sponsor search are free forever. Premium features like AI Resume Doctor and unlimited sponsor searches can accelerate your search, but success is absolutely possible with our free tools.",
    },
];

export function SuccessFAQ() {
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium mb-6">
                        <HelpCircle className="w-4 h-4" />
                        Questions Answered
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Everything you want to know about our success stories.
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
                                className="w-full text-left p-6 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {item.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-shrink-0 text-emerald-600 dark:text-emerald-400"
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
