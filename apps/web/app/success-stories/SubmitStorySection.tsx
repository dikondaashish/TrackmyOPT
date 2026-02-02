"use client";

import { motion } from "framer-motion";
import { Send, Award, Star, Gift } from "lucide-react";
import Link from "next/link";

export function SubmitStorySection() {
    return (
        <section className="py-24 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 lg:p-12"
                >
                    {/* Decorative elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <div className="relative grid lg:grid-cols-2 gap-10 items-center">
                        {/* Left Content */}
                        <div className="text-white">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
                                    <Star className="w-4 h-4" />
                                    Share Your Journey
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                    Got a Success Story?
                                </h2>

                                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                                    Landed your dream job? Secured H-1B sponsorship? We want to celebrate your success
                                    and inspire other students on their journey. Share your story with our community!
                                </p>

                                <div className="space-y-4">
                                    {[
                                        { icon: Award, text: "Get featured on our website" },
                                        { icon: Gift, text: "Receive 3 months of Premium free" },
                                        { icon: Star, text: "Inspire thousands of students" },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-white/90">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right - Form Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 lg:p-8 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Submit Your Story
                            </h3>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="you@university.edu"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Your Story (Brief)
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us about your journey..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Send className="w-5 h-5" />
                                    Submit Your Story
                                </button>
                            </form>

                            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                                By submitting, you agree to let us share your story on our platform.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
