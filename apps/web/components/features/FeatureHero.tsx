"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureHeroProps {
    badge?: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaHref: string;
    secondaryCta?: {
        text: string;
        href: string;
    };
    visual?: ReactNode;
    videoSrc?: string;
    gradient?: string;
    className?: string;
}

export function FeatureHero({
    badge,
    headline,
    subheadline,
    ctaText,
    ctaHref,
    secondaryCta,
    visual,
    videoSrc,
    gradient = "bg-blue-600",
    className,
}: FeatureHeroProps) {
    return (
        <section className={cn("relative min-h-[85vh] flex items-center overflow-hidden pt-20", className)}>
            {/* Background */}
            <div className="absolute inset-0 bg-gray-50 dark:bg-zinc-950" />

            {/* Video Background (Optional) */}
            {videoSrc && (
                <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={videoSrc} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gray-50 dark:bg-zinc-950 opacity-60" />
                </div>
            )}

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        {badge && (
                            <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                {badge}
                            </p>
                        )}

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1]">
                            {headline}
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            {subheadline}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href={ctaHref}
                                className={`inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white ${gradient} rounded-lg hover:opacity-90 transition-opacity group`}
                            >
                                {ctaText}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>

                            {secondaryCta && (
                                <Link
                                    href={secondaryCta.href}
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    {secondaryCta.text}
                                    {secondaryCta.text.toLowerCase().includes('demo') && <Play className="ml-2 w-4 h-4 fill-current" />}
                                </Link>
                            )}
                        </div>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative">
                            {visual}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
