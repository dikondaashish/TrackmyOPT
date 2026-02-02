"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "How does institutional licensing work?",
        answer: "Institutional licensing provides TrackMyOPT Premium access to all F-1 students at your university. We offer annual licensing based on student count, with bulk discounts available for larger institutions.",
    },
    {
        question: "What training do you provide for DSOs?",
        answer: "We provide comprehensive onboarding including live training sessions, documentation, and ongoing support. Your DSO team will have access to a dedicated account manager.",
    },
    {
        question: "Can we get analytics on our students' OPT status?",
        answer: "Yes! The DSO dashboard provides aggregate analytics on employment status, compliance metrics, and common issues across your student population (all data is anonymized for privacy).",
    },
    {
        question: "How do students sign up with institutional access?",
        answer: "Students can sign up using their .edu email address, and they'll automatically receive Premium access as part of your institutional license. We also support SSO integration.",
    },
    {
        question: "What are the requirements to become a campus ambassador?",
        answer: "Ambassadors should be current F-1 students with good academic standing, strong communication skills, and a passion for helping fellow international students. Leadership experience is a plus.",
    },
    {
        question: "Is there a cost for the campus ambassador program?",
        answer: "No! The campus ambassador program is completely free. Ambassadors receive free Premium access, earn commissions on referrals, and gain valuable leadership experience.",
    },
];

export function PartnershipFAQ() {
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
                        Partnership FAQs
                    </h2>
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
