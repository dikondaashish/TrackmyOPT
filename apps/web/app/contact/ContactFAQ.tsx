"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

const faqs = [
    {
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page and enter your email. You'll receive a reset link within a few minutes.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes. All documents are encrypted with AES-256 encryption. We never sell or share your data with third parties.",
    },
    {
        question: "How do I cancel my subscription?",
        answer: "Go to Settings > Billing > Cancel Subscription. You'll keep access until the end of your billing period.",
    },
    {
        question: "Can I export my data?",
        answer: "Yes. Go to Settings > Data Export to download all your data including documents, timeline, and job applications.",
    },
    {
        question: "How accurate is the unemployment calculator?",
        answer: "Our calculator follows USCIS guidelines and is updated regularly. Always verify important dates with your DSO.",
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes, we offer a 7-day refund policy for annual subscriptions. Contact support for assistance.",
    },
];

export function ContactFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </motion.div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {filteredFaqs.map((faq, index) => (
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

                {filteredFaqs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No FAQs match your search. Try different keywords.
                    </div>
                )}
            </div>
        </section>
    );
}
