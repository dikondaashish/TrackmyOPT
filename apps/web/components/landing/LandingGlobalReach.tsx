"use client";

import { motion } from "framer-motion";
import { GlobalTalentGlobe } from "@/components/features/GlobalTalentGlobe";
import { ArrowRight, Globe2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function LandingGlobalReach() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10 prose-longform"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-6">
                            <Globe2 className="w-4 h-4" />
                            Global Network
                        </div>

                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Your Network is Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                                Net Worth
                            </span>
                        </h2>

                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            We have over 50,000 HR, technical leads, and managers' company email IDs to contact. This helps for cold emailing to navigate the complex US job market. Get referrals, share interview intel, and stay compliant together.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">50k+</h4>
                                <p className="text-sm text-gray-500">Active Company Emails</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">120+</h4>
                                <p className="text-sm text-gray-500">Companies Represented</p>
                            </div>
                        </div>

                        <Link href="/features/community" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all group">
                            Join the Community
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Right: Globe Visual with Floating Companies */}
                    <div className="relative">
                        {/* Floating Logos - Left Column */}
                        <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-center gap-6 z-20 pointer-events-none hidden md:flex">
                            <FloatingBadge
                                domain="google.com"
                                name="Google"
                                delay={0}
                            />
                            <FloatingBadge
                                domain="microsoft.com"
                                name="Microsoft"
                                delay={1.5}
                            />
                            <FloatingBadge
                                domain="amazon.com"
                                name="Amazon"
                                delay={3}
                            />
                        </div>

                        {/* Floating Logos - Right Column */}
                        <div className="absolute -right-12 top-0 bottom-0 flex flex-col justify-center gap-8 z-20 pointer-events-none hidden md:flex">
                            <FloatingBadge
                                domain="meta.com"
                                name="Meta"
                                delay={0.5}
                            />
                            <FloatingBadge
                                domain="netflix.com"
                                name="Netflix"
                                delay={2}
                            />
                            <FloatingBadge
                                domain="tesla.com"
                                name="Tesla"
                                delay={3.5}
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

function FloatingBadge({ domain, name, delay }: { domain: string, name: string, delay: number }) {
    return (
        <motion.div
            className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-zinc-700"
            animate={{
                y: [-10, 10, -10],
                rotate: [-2, 2, -2]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
            }}
        >
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
        </motion.div>
    );
}
