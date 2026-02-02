"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Who created TrackMyOPT?",
        answer: "TrackMyOPT was created by a team of former F-1 students who experienced the complexity of OPT management firsthand. We built the tool we wished we had during our own OPT journey.",
    },
    {
        question: "Is TrackMyOPT affiliated with USCIS?",
        answer: "No, TrackMyOPT is an independent tool created to help students manage their OPT timeline and documents. We are not affiliated with USCIS, DHS, or any government agency. Always verify official information with USCIS directly.",
    },
    {
        question: "How does TrackMyOPT make money?",
        answer: "We offer a free tier with essential features and a premium subscription for advanced tools like AI resume assistance, unlimited document storage, and priority support.",
    },
    {
        question: "Is my data safe?",
        answer: "Yes. We use AES-256 encryption for all stored documents and follow industry best practices for data security. Your data is never sold or shared with third parties.",
    },
    {
        question: "Can I trust the calculations?",
        answer: "Our calculators are based on official USCIS guidelines and are regularly updated. However, always double-check important dates with your DSO or an immigration attorney.",
    },
];

export function AboutFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground">
                        Common questions about TrackMyOPT and our team
                    </p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-border overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-muted-foreground transition-transform ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-4 text-muted-foreground">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
