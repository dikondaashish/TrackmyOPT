"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Is TrackMyOPT really free?",
        answer:
            "Yes! The free plan includes OPT timeline tracking, unemployment clock, and 1 USCIS case tracking. You can use these features forever without paying anything. Premium adds advanced features like Document Vault and unlimited case tracking.",
    },
    {
        question: "Is my data secure?",
        answer:
            "Absolutely. We use bank-grade 256-bit AES encryption for all stored data. Your documents in the vault are encrypted at rest and in transit. We never share your personal information with third parties.",
    },
    {
        question: "What happens if I miss an OPT deadline?",
        answer:
            "Missing an OPT deadline can have serious consequences, including falling out of status. That's exactly why TrackMyOPT exists — we send you email alerts before every critical deadline so you never miss one.",
    },
    {
        question: "Can I track multiple USCIS cases?",
        answer:
            "Free users can track 1 case. Premium users get unlimited case tracking — perfect if you have pending OPT, STEM extension, and other applications simultaneously.",
    },
    {
        question: "How accurate is the unemployment clock?",
        answer:
            "Our unemployment clock calculates based on official USCIS rules: 90 days for initial OPT. STEM OPT holders receive an additional 60 days (these are separate allowances, not combined). You log your employment periods, and we automatically calculate remaining days.",
    },
];

export function LandingFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <section id="faq" className="py-24 relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[2px] -z-10" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-medium rounded-full mb-4">
                        FAQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                            Questions
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Everything you need to know about TrackMyOPT.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-6 pt-0">
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Still have questions?
                    </p>
                    <a
                        href="mailto:support@trackmyopt.com"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        Contact our support team
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
