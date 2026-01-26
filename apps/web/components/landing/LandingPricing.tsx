"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started with OPT tracking",
        features: [
            { text: "OPT Timeline Calculator", included: true },
            { text: "Unemployment Clock", included: true },
            { text: "1 USCIS Case Tracking", included: true },
            { text: "Basic Email Alerts", included: true },
            { text: "Document Vault", included: false },
            { text: "Unlimited Case Tracking", included: false },
            { text: "Expiry Reminders", included: false },
            { text: "Priority Support", included: false },
        ],
        cta: "Get Started Free",
        ctaLink: "/login",
        highlighted: false,
    },
    {
        name: "Premium",
        price: "$19.99",
        period: "lifetime",
        description: "Everything you need to stay compliant and organized",
        badge: "Best Value",
        features: [
            { text: "Everything in Free", included: true },
            { text: "Unlimited Case Tracking", included: true },
            { text: "Secure Document Vault", included: true },
            { text: "AI Document Analysis", included: true },
            { text: "Expiry Reminders", included: true },
            { text: "Data Export", included: true },
            { text: "Priority Support", included: true },
            { text: "Lifetime Updates", included: true },
        ],
        cta: "Get Premium",
        ctaLink: "/premium/checkout",
        highlighted: true,
    },
];

export function LandingPricing() {
    return (
        <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full mb-4">
                        Pricing
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Simple,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                            Transparent Pricing
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        No subscriptions. No hidden fees. Pay once, use forever.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl p-8 ${plan.highlighted
                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/25 scale-[1.02]"
                                    : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                                }`}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                                    {plan.badge}
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-6">
                                <h3
                                    className={`text-xl font-semibold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"
                                        }`}
                                >
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span
                                        className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900 dark:text-white"
                                            }`}
                                    >
                                        {plan.price}
                                    </span>
                                    <span
                                        className={`text-sm ${plan.highlighted ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                        /{plan.period}
                                    </span>
                                </div>
                                <p
                                    className={`mt-2 text-sm ${plan.highlighted ? "text-blue-100" : "text-gray-600 dark:text-gray-300"
                                        }`}
                                >
                                    {plan.description}
                                </p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center gap-3">
                                        {feature.included ? (
                                            <Check
                                                className={`w-5 h-5 shrink-0 ${plan.highlighted ? "text-green-300" : "text-green-500"
                                                    }`}
                                            />
                                        ) : (
                                            <X
                                                className={`w-5 h-5 shrink-0 ${plan.highlighted ? "text-blue-200/50" : "text-gray-300 dark:text-zinc-600"
                                                    }`}
                                            />
                                        )}
                                        <span
                                            className={`text-sm ${feature.included
                                                    ? plan.highlighted
                                                        ? "text-white"
                                                        : "text-gray-700 dark:text-gray-200"
                                                    : plan.highlighted
                                                        ? "text-blue-200/50"
                                                        : "text-gray-400 dark:text-zinc-500"
                                                }`}
                                        >
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link
                                href={plan.ctaLink}
                                className={`block w-full text-center py-3 px-6 rounded-full font-semibold transition-all hover:scale-[1.02] ${plan.highlighted
                                        ? "bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Trust Note */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                    🔒 Secure checkout powered by Stripe. 30-day money-back guarantee.
                </p>
            </div>
        </section>
    );
}
