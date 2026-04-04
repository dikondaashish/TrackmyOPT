"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CTABannerProps {
    badge?: string;
    headline: string;
    subheadline: string;
    primaryCTA: { text: string; href: string };
    secondaryCTA?: { text: string; href: string };
    variant?: "default" | "gradient";
}

export function CTABanner({
    badge,
    headline,
    subheadline,
    primaryCTA,
    secondaryCTA,
    variant = "default",
}: CTABannerProps) {
    const isGradient = variant === "gradient";

    return (
        <section className="py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative overflow-hidden rounded-2xl p-8 lg:p-12 text-center ${isGradient
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                            : "bg-gray-50 dark:bg-zinc-900 border border-border"
                        }`}
                >
                    {/* Badge */}
                    {badge && (
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 ${isGradient
                                ? "bg-white/20 text-white"
                                : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                            }`}>
                            {badge}
                        </div>
                    )}

                    {/* Headline */}
                    <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${isGradient ? "text-white" : "text-gray-900 dark:text-white"
                        }`}>
                        {headline}
                    </h2>

                    {/* Subheadline */}
                    <p className={`text-lg max-w-2xl mx-auto mb-8 ${isGradient ? "text-blue-100" : "text-muted-foreground"
                        }`}>
                        {subheadline}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={primaryCTA.href}
                            className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${isGradient
                                    ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                                    : "bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25"
                                }`}
                        >
                            {primaryCTA.text}
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        {secondaryCTA && (
                            <Link
                                href={secondaryCTA.href}
                                className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold transition-all ${isGradient
                                        ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                                        : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-border hover:bg-gray-50 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                {secondaryCTA.text}
                            </Link>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
