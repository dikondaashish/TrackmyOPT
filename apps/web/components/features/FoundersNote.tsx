"use client";

import { motion } from "framer-motion";
import { GlobalTalentGlobe } from "./GlobalTalentGlobe";

export function FoundersNote() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="flex flex-col items-center text-center mb-12">
                    <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white leading-snug"
                    >
                        <p>&ldquo;We built TrackMyOPT because we were tired of seeing brilliant friends lose their status due to simple deadline errors.&rdquo;</p>
                    </motion.blockquote>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-longform dark:prose-invert"
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
                            <p className="font-semibold text-gray-900 dark:text-white">Karthik Reddy Pochugari</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Founder & CEO, TrackMyOPT</p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
