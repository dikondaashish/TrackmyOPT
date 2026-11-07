"use client";

import { motion } from "framer-motion";
import { GlobalTalentGlobe } from "@/components/features/GlobalTalentGlobe";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function LandingGlobalReach() {
    return (
        <section className="py-24 bg-surface border-y border-border relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10 prose-longform"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Your network is your net worth
                        </h2>

                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            We have over 50,000 HR, technical leads, and managers' company email IDs to contact. This helps for cold emailing to navigate the complex US job market. Get referrals, share interview intel, and stay compliant together.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="surface-card p-5">
                                <h4 className="text-3xl font-bold text-primary">50k+</h4>
                                <p className="text-sm text-muted-foreground">Active Company Emails</p>
                            </div>
                            <div className="surface-card p-5">
                                <h4 className="text-3xl font-bold text-primary">120+</h4>
                                <p className="text-sm text-muted-foreground">Companies Represented</p>
                            </div>
                        </div>

                        <Link href="/features/community" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-primary-foreground font-semibold shadow-button transition-colors hover:bg-primary-hover">
                            Join the Community
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Right: Globe Visual with Floating Companies */}
                    <div className="relative">
                        {/* Floating Logos - Left Column */}
                        <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-center gap-6 z-20 pointer-events-none hidden md:flex">
                            <FloatingBadge
                                domain="google.com"
                                name="Google"
                            />
                            <FloatingBadge
                                domain="microsoft.com"
                                name="Microsoft"
                            />
                            <FloatingBadge
                                domain="amazon.com"
                                name="Amazon"
                            />
                        </div>

                        {/* Floating Logos - Right Column */}
                        <div className="absolute -right-12 top-0 bottom-0 flex flex-col justify-center gap-8 z-20 pointer-events-none hidden md:flex">
                            <FloatingBadge
                                domain="meta.com"
                                name="Meta"
                            />
                            <FloatingBadge
                                domain="netflix.com"
                                name="Netflix"
                            />
                            <FloatingBadge
                                domain="tesla.com"
                                name="Tesla"
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <GlobalTalentGlobe />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section >
    );
}

function FloatingBadge({ domain, name }: { domain: string, name: string }) {
    return (
        <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-lg border border-border shadow-card">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-white">
                <Image
                    src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                    unoptimized
                />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span>
        </div>
    );
}
