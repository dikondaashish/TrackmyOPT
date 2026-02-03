"use client";

import { motion } from "framer-motion";
import { GlobalTalentGlobe } from "@/components/features/GlobalTalentGlobe";
import { ArrowRight, Users, Globe2, MessageSquare } from "lucide-react";
import Link from "next/link";

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
                        className="relative z-10"
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
                            Join over 50,000 international students and alumni helping each other navigate the complex US job market. Get referrals, share interview intel, and stay compliant together.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">50k+</h4>
                                <p className="text-sm text-gray-500">Active Members</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">120+</h4>
                                <p className="text-sm text-gray-500">Countries Represented</p>
                            </div>
                        </div>

                        <Link href="/community" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all group">
                            Join the Community
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Right: Globe Visual */}
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
        </section>
    );
}
