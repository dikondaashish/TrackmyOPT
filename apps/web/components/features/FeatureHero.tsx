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
    gradient = "from-blue-600 to-indigo-600",
    className,
}: FeatureHeroProps) {
    return (
        <section className={cn("relative min-h-[85vh] flex items-center overflow-hidden pt-20", className)}>
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />

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
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px]" />
                </div>
            )}

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Gradient Orbs */}
            {!videoSrc && (
                <>
                    <div className={`absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-10 dark:opacity-20 animate-pulse`} />
                    <div className={`absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-10 dark:opacity-15 animate-float-slow`} />
                </>
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
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-medium mb-6 shadow-lg shadow-blue-500/20`}
                            >
                                {badge}
                            </motion.div>
                        )}

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
                            {headline.split(' ').map((word, i) => (
                                <span key={i}>
                                    {/* Rudimentary check for keywords to highlight - can be improved with parsing */}
                                    {['Intel.', 'Clock.', 'Status.', 'Resume.', 'Maggi.', 'Sponsors', 'Free'].some(k => word.includes(k)) ? (
                                        <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                                            {word}{' '}
                                        </span>
                                    ) : (
                                        word + ' '
                                    )}
                                </span>
                            ))}
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            {subheadline}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href={ctaHref}
                                className={`inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r ${gradient} rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 group`}
                            >
                                {ctaText}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {secondaryCta && (
                                <Link
                                    href={secondaryCta.href}
                                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-700 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    {secondaryCta.text}
                                    {secondaryCta.text.toLowerCase().includes('demo') && <Play className="ml-2 w-4 h-4 fill-current" />}
                                </Link>
                            )}
                        </div>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, rotate: 2 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                        className="relative hidden lg:block perspective-1000"
                    >
                        {/* Decorative Ring behind visual */}
                        <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-20 blur-3xl rounded-full scale-90`} />

                        <div className="relative transform transition-transform duration-500 hover:scale-[1.01] hover:rotate-1">
                            {visual ? (
                                visual
                            ) : (
                                <div className={`aspect-square max-w-lg mx-auto rounded-3xl bg-gradient-to-br ${gradient} opacity-20 shadow-2xl border border-white/20`} />
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
