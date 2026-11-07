"use client";

import { pricingFaqs } from "./PricingData";

export function PricingFAQ() {
    return (
        <section className="border-y border-border bg-surface py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Pricing &amp; Pro Questions
                    </h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about Free and Pro
                    </p>
                </div>

                <div className="space-y-4">
                    {pricingFaqs.map((faq, i) => (
                        <div
                            key={i}
                            className="surface-card p-6"
                        >
                            <h3 className="font-semibold text-foreground mb-2">
                                {faq.q}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
