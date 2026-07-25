"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "Is TrackMyOPT really free?",
        answer:
            "Yes! The free plan includes OPT timeline tracking, unemployment clock, and manual USCIS case checks — forever free. Pro adds daily 9:00 AM ET reminders, Document Vault, and automatic case monitoring.",
    },
    {
        question: "Is my data secure?",
        answer:
            "We use HTTPS (TLS) for data in transit and industry-standard protections for stored data. The document vault uses an optional passcode (hashed on our servers)—your passcode is not stored in a way that only your device can decrypt. We do not sell your personal information. See our Privacy Policy and Security page for details.",
    },
    {
        question: "What happens if I miss an OPT deadline?",
        answer:
            "Missing an OPT deadline can have serious consequences for your F-1 status. TrackMyOPT sends email reminders before filing windows, unemployment limits, and STEM dates — so you can stay organized and check with your DSO in time.",
    },
    {
        question: "Can I track multiple USCIS cases?",
        answer:
            "Free users can track one case with manual refresh. Pro adds daily automatic checks and email alerts when your status changes.",
    },
    {
        question: "How accurate is the unemployment clock?",
        answer:
            "Our unemployment clock follows USCIS guidance: up to 90 aggregate unemployment days during initial post-completion OPT and up to 150 aggregate days across initial OPT plus the STEM OPT extension. You log employment periods, and we calculate remaining days from those records.",
    },
    {
        question: "How long does OPT processing take in 2026?",
        answer:
            "As of March 2026, USCIS OPT (Form I-765) processing times range from 3 to 5 months. Online-filed cases with IOE receipt numbers generally process faster than paper filings. Premium processing is not available for EAD applications. You can check current processing times at egov.uscis.gov/processing-times.",
    },
    {
        question: "Can I travel outside the US while on OPT?",
        answer:
            "Yes, you can travel during approved OPT, but you need: a valid passport, valid F-1 visa stamp, valid EAD card, and a current I-20 with a DSO travel signature (signed within the last 6 months). Travel while your OPT application is pending is strongly discouraged — re-entry is not guaranteed. Days abroad while unemployed still count toward your 90-day limit.",
    },
    {
        question: "What happens if my OPT application is denied?",
        answer:
            "If your OPT application is denied by USCIS, you cannot work in the US under OPT authorization. According to USCIS guidance, you typically have 60 days (grace period) after your program end date to either leave the US, transfer to a new school, or change to another valid immigration status. TrackMyOPT recommends consulting with your DSO and an immigration attorney immediately if your case is denied.",
    },
];

export function LandingFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 relative">
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

                {/* FAQ Accordion — answers always rendered in DOM for AI crawlers, visually toggled */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
                            itemScope
                            itemType="https://schema.org/Question"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                                aria-expanded={openIndex === index}
                            >
                                <span className="font-semibold text-gray-900 dark:text-white pr-4" itemProp="name">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 transition-transform ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            {/* Always render in DOM for AI crawlers — CSS controls visibility */}
                            <div
                                className={`prose-longform px-6 pb-6 pt-0 transition-all duration-200 ${openIndex === index ? "block" : "hidden"}`}
                                itemScope
                                itemType="https://schema.org/Answer"
                                itemProp="acceptedAnswer"
                            >
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed" itemProp="text">
                                    {faq.answer}
                                </p>
                            </div>
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
