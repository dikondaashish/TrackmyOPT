"use client";

import { HelpCircle } from "lucide-react";
import { pricingFaqs } from "./PricingData";

export function PricingFAQ() {
    return (
        <section className="py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Pricing &amp; Pro Questions
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Everything you need to know about Free and Pro
                    </p>
                </div>

                <div className="space-y-4">
                    {pricingFaqs.map((faq, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6"
                        >
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                {faq.q}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
