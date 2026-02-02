"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Zap, Clock } from "lucide-react";
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
    blue: "from-blue-600 via-blue-700 to-indigo-700",
    emerald: "from-emerald-600 via-emerald-700 to-teal-700",
    purple: "from-purple-600 via-purple-700 to-pink-700",
    amber: "from-amber-500 via-orange-600 to-red-600",
    cyan: "from-cyan-500 via-blue-600 to-indigo-600",
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
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradient]}`} />

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    {badge && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium mb-6 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4" />
                            {badge}
                        </div>
                    )}

                    {/* Icon */}
                    {icon && (
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                                {icon}
                            </div>
                        </div>
                    )}

                    {/* Headline */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        {headline}
                    </h2>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {subheadline}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={primaryCTA.href}
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-gray-900 rounded-full shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            {primaryCTA.text}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {secondaryCTA && (
                            <Link
                                href={secondaryCTA.href}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-full hover:bg-white/10 transition-all duration-300"
                            >
                                {secondaryCTA.text}
                            </Link>
                        )}
                    </div>

                    {/* Trust indicators */}
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
                </motion.div>
            </div>
        </section>
    );
}
