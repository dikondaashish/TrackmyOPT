"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle } from "lucide-react";
import { useState, useMemo } from "react";

const faqItems = [
    {
        question: "How do I reset my password?",
        answer: "Click on 'Forgot Password' on the login page and enter your email address. We'll send you a link to reset your password. The link expires in 24 hours.",
        category: "Account",
    },
    {
        question: "How do I cancel my subscription?",
        answer: "Go to Settings > Subscription > Manage Plan and click 'Cancel Subscription'. You'll retain access to premium features until the end of your billing period.",
        category: "Billing",
    },
    {
        question: "Is there a mobile app?",
        answer: "We don't have a native mobile app yet, but our website is fully responsive and works great on mobile browsers. You can add it to your home screen for an app-like experience. A native app is on our roadmap for 2026.",
        category: "General",
    },
    {
        question: "How do I report a bug?",
        answer: "Use the contact form above with 'Report a Bug' category, or email bugs@trackmyopt.com with screenshots and steps to reproduce. We typically acknowledge bugs within 24 hours.",
        category: "Technical",
    },
    {
        question: "Can I request a new feature?",
        answer: "Absolutely! We love hearing from users. Use the contact form with 'Feature Request' category or join our Discord community to vote on and suggest new features.",
        category: "General",
    },
    {
        question: "How accurate is the OPT tracking?",
        answer: "Our tracking is based on official USCIS guidelines and is updated whenever regulations change. However, always verify important dates with your DSO as individual circumstances may vary.",
        category: "OPT",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) through our secure payment processor, Stripe. We do not store your card information.",
        category: "Billing",
    },
    {
        question: "How do I delete my account?",
        answer: "Go to Settings > Account > Delete Account. This action is permanent and will remove all your data. We retain anonymized analytics data per our privacy policy.",
        category: "Account",
    },
];

export function ContactFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", ...Array.from(new Set(faqItems.map(item => item.category)))];

    const filteredFaqs = useMemo(() => {
        return faqItems.filter(item => {
            const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <section className="py-24 relative bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-6">
                        <HelpCircle className="w-4 h-4" />
                        Quick Answers
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Find instant answers to common questions.
                    </p>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8 space-y-4"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                        ? "bg-cyan-500 text-white"
                                        : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                No FAQs found. Try a different search term or contact us directly.
                            </p>
                        </div>
                    ) : (
                        filteredFaqs.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full text-left p-6 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-200 group"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300">
                                                {item.category}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {item.question}
                                            </h3>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex-shrink-0 text-cyan-600 dark:text-cyan-400"
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
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
