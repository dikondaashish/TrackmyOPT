"use client";

import { Check, X } from "lucide-react";
import { comparisonFeatures } from "./PricingData";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import { PLAN_PRICES } from "@/lib/pricing/plan-config";

export function PricingDetailedComparison() {
    const showDedicated = shouldShowDedicatedPlanForSale();
    const colClass = showDedicated ? "grid-cols-4" : "grid-cols-3";

    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Complete Plan Comparison
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {showDedicated
                            ? "Every feature across Free, Pro, and Dedicated"
                            : "Every feature across Free and Pro"}
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg">
                    <div className={`grid ${colClass} gap-0 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-700 p-4`}>
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
                                ${PLAN_PRICES.pro.month.toFixed(2)}/mo
                            </div>
                        </div>
                        {showDedicated ? (
                            <div className="text-center">
                                <div className="font-semibold text-purple-600">
                                    Dedicated
                                </div>
                                <div className="text-sm text-gray-500">
                                    ${PLAN_PRICES.dedicated.month.toFixed(2)}/mo
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {comparisonFeatures.map((category) => (
                        <div key={category.category}>
                            <div className="bg-gray-50/50 dark:bg-zinc-800/30 px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    {category.category}
                                </span>
                            </div>
                            {category.features.map((feature) => {
                                const values = showDedicated
                                    ? [feature.free, feature.pro, feature.dedicated]
                                    : [feature.free, feature.pro];
                                return (
                                <div
                                    key={feature.name}
                                    className={`grid ${colClass} gap-0 px-4 py-3 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors`}
                                >
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {feature.name}
                                    </div>
                                    {values.map((value, i) => (
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
                                        ))}
                                </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
