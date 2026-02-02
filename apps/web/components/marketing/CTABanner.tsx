"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react";

interface CTABannerProps {
    headline: string;
    subheadline?: string;
    primaryCTA: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
    variant?: "gradient" | "dark" | "light";
    badge?: string;
}

const variants = {
    gradient: {
        bg: "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700",
        text: "text-white",
        subtext: "text-blue-100",
        primary: "bg-white text-blue-600 hover:bg-blue-50",
        secondary: "border-white/30 text-white hover:bg-white/10",
    },
    dark: {
        bg: "bg-zinc-900 dark:bg-zinc-950",
        text: "text-white",
        subtext: "text-gray-300",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "border-gray-600 text-gray-300 hover:bg-gray-800",
    },
    light: {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800",
        text: "text-gray-900 dark:text-white",
        subtext: "text-gray-600 dark:text-gray-300",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    },
};

export function CTABanner({
    headline,
    subheadline,
    primaryCTA,
    secondaryCTA,
    variant = "gradient",
    badge,
}: CTABannerProps) {
    const style = variants[variant];

    return (
        <section className={`py-24 relative overflow-hidden ${style.bg}`}>
            {/* Decorative elements for gradient variant */}
            {variant === "gradient" && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                </div>
            )}

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    {badge && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            {badge}
                        </div>
                    )}

                    {/* Headline */}
                    <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${style.text} mb-6 leading-tight`}>
                        {headline}
                    </h2>

                    {/* Subheadline */}
                    {subheadline && (
                        <p className={`text-lg sm:text-xl ${style.subtext} mb-10 max-w-2xl mx-auto leading-relaxed`}>
                            {subheadline}
                        </p>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={primaryCTA.href}
                            className={`inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${style.primary}`}
                        >
                            {primaryCTA.text}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {secondaryCTA && (
                            <Link
                                href={secondaryCTA.href}
                                className={`inline-flex items-center justify-center px-8 py-4 text-base font-semibold border-2 rounded-full transition-all duration-300 ${style.secondary}`}
                            >
                                {secondaryCTA.text}
                            </Link>
                        )}
                    </div>

                    {/* Trust indicators */}
                    {variant === "gradient" && (
                        <div className="mt-10 flex items-center justify-center gap-6 text-white/70 text-sm">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Setup in 2 minutes</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
