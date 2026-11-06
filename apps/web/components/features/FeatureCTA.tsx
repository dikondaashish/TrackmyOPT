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

const gradients = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    purple: "bg-purple-600",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500",
};

// Solid accents that sit on each background colour (icon tile, outline button).
const accents = {
    blue: { tile: "bg-blue-500", outline: "border-blue-400 hover:bg-blue-700" },
    emerald: { tile: "bg-emerald-500", outline: "border-emerald-400 hover:bg-emerald-700" },
    purple: { tile: "bg-purple-500", outline: "border-purple-400 hover:bg-purple-700" },
    amber: { tile: "bg-amber-400", outline: "border-amber-300 hover:bg-amber-600" },
    cyan: { tile: "bg-cyan-400", outline: "border-cyan-300 hover:bg-cyan-600" },
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
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className={`absolute inset-0 ${gradients[gradient]}`} />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    {badge && (
                        <p className="mb-4 text-sm font-medium text-white">
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
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        {headline}
                    </h2>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed">
                        {subheadline}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={primaryCTA.href}
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {primaryCTA.text}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>

                        {secondaryCTA && (
                            <Link
                                href={secondaryCTA.href}
                                className={`inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 rounded-lg transition-colors ${accents[gradient].outline}`}
                            >
                                {secondaryCTA.text}
                            </Link>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-10 flex items-center justify-center gap-6 text-white text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Setup in 2 minutes</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
