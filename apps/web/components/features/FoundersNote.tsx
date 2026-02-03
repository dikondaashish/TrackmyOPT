"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { GlobalTalentGlobe } from "./GlobalTalentGlobe";

export function FoundersNote() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-6">
                        <Quote className="w-5 h-5 fill-current" />
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-serif font-medium text-gray-900 dark:text-white leading-relaxed italic"
                    >
                        "We built TrackMyOPT because we were tired of seeing brilliant friends lose their status due to simple deadline errors."
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mt-16 border-t border-gray-100 dark:border-zinc-800 pt-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="prose dark:prose-invert"
                    >
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            In 2021, I watched my roommate pack his bags and leave the country. He had missed his OPT reporting deadline by 3 days. It wasn't because he was irresponsible—he was overwhelmed.
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
                            The US immigration system is a black box designed for lawyers, not students. We realized that international talent needs more than just legal advice; they need an operating system for their life in America.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center md:items-start space-y-4"
                    >
                        <div className="w-full max-w-xs">
                            <GlobalTalentGlobe />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Ashish & Team</h4>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mt-1">Founders, TrackMyOPT</p>

                            {/* Signatures */}
                            <div className="mt-4 opacity-70">
                                <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 30 C 20 20, 40 50, 50 30 C 60 10, 70 40, 90 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-900 dark:text-white" />
                                    <path d="M110 35 C 120 45, 140 10, 150 35 C 160 55, 170 15, 190 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-900 dark:text-white" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
