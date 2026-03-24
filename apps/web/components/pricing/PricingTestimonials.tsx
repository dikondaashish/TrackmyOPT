"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "./PricingData";

export function PricingTestimonials() {
    return (
        <section className="py-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Students Who Protected Their Status with Premium
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6"
                        >
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: 5 }).map(
                                    (_, j) => (
                                        <Star
                                            key={j}
                                            className="w-4 h-4 text-amber-400 fill-amber-400"
                                        />
                                    )
                                )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {t.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t.role}, {t.university}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
