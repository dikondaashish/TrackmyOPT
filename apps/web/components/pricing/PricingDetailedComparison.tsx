"use client";

import { Check, X } from "lucide-react";
import { comparisonFeatures } from "./PricingData";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import { PLAN_PRICES } from "@/lib/pricing/plan-config";

export function PricingDetailedComparison() {
    const showDedicated = shouldShowDedicatedPlanForSale();
    const colClass = showDedicated ? "grid-cols-4" : "grid-cols-3";

    return (
        <section className="py-24 bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Complete Plan Comparison
                    </h2>
                    <p className="text-muted-foreground">
                        {showDedicated
                            ? "Every feature across Free, Pro, and Dedicated"
                            : "Every feature across Free and Pro"}
                    </p>
                </div>

                <div className="surface-card overflow-hidden">
                    <div className={`grid ${colClass} gap-0 bg-surface-strong border-b border-border p-4`}>
                        <div className="font-semibold text-foreground">
                            Feature
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-foreground">
                                Free
                            </div>
                            <div className="text-sm text-muted-foreground">
                                $0/forever
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-primary">
                                Pro
                            </div>
                            <div className="text-sm text-muted-foreground">
                                ${PLAN_PRICES.pro.month.toFixed(2)}/mo
                            </div>
                        </div>
                        {showDedicated ? (
                            <div className="text-center">
                                <div className="font-semibold text-amber-700 dark:text-amber-300">
                                    Dedicated
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    ${PLAN_PRICES.dedicated.month.toFixed(2)}/mo
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {comparisonFeatures.map((category) => (
                        <div key={category.category}>
                            <div className="bg-surface px-4 py-3 border-b border-border">
                                <span className="font-semibold text-sm text-foreground">
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
                                    className={`grid ${colClass} gap-0 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors`}
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
                                                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-gray-300 dark:text-zinc-600 mx-auto" />
                                                    )
                                                ) : (
                                                    <span className="text-sm font-medium text-foreground">
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
