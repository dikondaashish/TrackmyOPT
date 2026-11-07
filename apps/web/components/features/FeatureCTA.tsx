"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Clock } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCTAProps {
    headline: string;
    subheadline: string;
    primaryCTA: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
    gradient?: "blue" | "emerald" | "purple" | "amber" | "cyan";
    icon?: ReactNode;
    badge?: string;
}

// The closing band is always deep ink; the accent colour only marks the
// feature's meaning on the icon tile and trust icons.
const accents = {
    blue: { tile: "bg-blue-600 text-white", icon: "text-blue-300" },
    emerald: { tile: "bg-emerald-600 text-white", icon: "text-emerald-300" },
    purple: { tile: "bg-violet-600 text-white", icon: "text-violet-300" },
    amber: { tile: "bg-amber-500 text-ink", icon: "text-amber-300" },
    cyan: { tile: "bg-cyan-600 text-white", icon: "text-cyan-300" },
};

export function FeatureCTA({
    headline,
    subheadline,
    primaryCTA,
    secondaryCTA,
    gradient = "blue",
    icon,
    badge,
}: FeatureCTAProps) {
    return (
        <section className="relative overflow-hidden bg-ink py-24 text-ink-foreground">
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    {badge && (
                        <p className="mb-4 text-sm font-medium text-ink-muted">
                            {badge}
                        </p>
                    )}

                    {/* Icon */}
                    {icon && (
                        <div className="flex justify-center mb-6">
                            <div className={`p-4 rounded-lg ${accents[gradient].tile}`}>
                                {icon}
                            </div>
                        </div>
                    )}

                    {/* Headline */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-foreground mb-6 leading-tight">
                        {headline}
                    </h2>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-ink-muted mb-10 max-w-2xl mx-auto leading-relaxed">
                        {subheadline}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={primaryCTA.href}
                            className="inline-flex min-h-12 items-center justify-center px-8 py-3 text-base font-semibold bg-blue-600 text-white rounded-lg shadow-button hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                        >
                            {primaryCTA.text}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>

                        {secondaryCTA && (
                            <Link
                                href={secondaryCTA.href}
                                className="inline-flex min-h-12 items-center justify-center px-8 py-3 text-base font-semibold text-ink-foreground border border-ink-border rounded-lg transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                            >
                                {secondaryCTA.text}
                            </Link>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-ink-muted text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${accents[gradient].icon}`} />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${accents[gradient].icon}`} />
                            <span>Setup in 2 minutes</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
