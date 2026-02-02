"use client";

import { motion } from "framer-motion";
import { Send, Gift, Star } from "lucide-react";
import Link from "next/link";

export function SubmitStorySection() {
    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-border p-8 lg:p-12"
                >
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left - Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                                <Star className="w-4 h-4" />
                                Share Your Story
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Got a Success Story?
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Did TrackMyOPT help you land your dream job? We'd love to hear about it!
                                Share your story and inspire other international students.
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Gift className="w-5 h-5 text-primary" />
                                    <span>Featured stories get 3 months free Premium</span>
                                </div>
                            </div>
                        </div>

                        {/* Right - Simple CTA */}
                        <div className="text-center lg:text-left">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25"
                            >
                                <Send className="w-5 h-5" />
                                Submit Your Story
                            </Link>
                            <p className="text-xs text-muted-foreground mt-4">
                                We'll reach out within 2-3 business days
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
