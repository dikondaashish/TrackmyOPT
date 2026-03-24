"use client";

import { Check, X } from "lucide-react";
import { comparisonFeatures } from "./PricingData";

export function PricingDetailedComparison() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Complete Plan Comparison
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Every feature across Free, Pro, and Dedicated
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg">
                    <div className="grid grid-cols-4 gap-0 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700 p-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                            Feature
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-900 dark:text-white">
                                Free
                            </div>
                            <div className="text-sm text-gray-500">
                                $0/forever
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-blue-600">
                                Pro
                            </div>
                            <div className="text-sm text-gray-500">
                                $4.99/mo
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-purple-600">
                                Dedicated
                            </div>
                            <div className="text-sm text-gray-500">
                                $14.99/mo
                            </div>
                        </div>
                    </div>

                    {comparisonFeatures.map((category) => (
                        <div key={category.category}>
                            <div className="bg-gray-50/50 dark:bg-zinc-800/30 px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    {category.category}
                                </span>
                            </div>
                            {category.features.map((feature) => (
                                <div
                                    key={feature.name}
                                    className="grid grid-cols-4 gap-0 px-4 py-3 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                                >
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {feature.name}
                                    </div>
                                    {[feature.free, feature.pro, feature.dedicated].map(
                                        (value, i) => (
                                            <div
                                                key={i}
                                                className="text-center"
                                            >
                                                {typeof value ===
                                                "boolean" ? (
                                                    value ? (
                                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-gray-300 dark:text-zinc-600 mx-auto" />
                                                    )
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {value}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
