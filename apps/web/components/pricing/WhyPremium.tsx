"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { whyPremiumReasons } from "./PricingData";

export function WhyPremium() {
    return (
        <section className="border-y border-border bg-surface py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Why Students Choose Pro
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Every feature exists because an F-1 student
                        needed it to avoid a real compliance risk.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {whyPremiumReasons.map((reason) => {
                        const Icon = reason.icon;
                        return (
                            <motion.div
                                key={reason.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="surface-card flex flex-col p-6"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {reason.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 flex-1">
                                    {reason.description}
                                </p>
                                <div className="flex items-start gap-2 rounded-lg border-l-4 border-l-red-500 bg-red-50 p-3 dark:bg-red-950">
                                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                                        {reason.risk}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
