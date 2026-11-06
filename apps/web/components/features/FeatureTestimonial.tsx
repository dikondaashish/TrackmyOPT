"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface FeatureTestimonialProps {
    quote: string;
    author: {
        name: string;
        role: string;
        university?: string;
        avatar?: string;
    };
    accentColor?: "blue" | "emerald" | "purple" | "amber" | "cyan";
}

const accentStyles = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500",
};

export function FeatureTestimonial({
    quote,
    author,
    accentColor = "blue",
}: FeatureTestimonialProps) {
    return (
        <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Background card */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12">
                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="text-xl sm:text-2xl text-gray-900 dark:text-white font-medium leading-relaxed mb-8">
                            "{quote}"
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className={`w-14 h-14 rounded-full ${accentStyles[accentColor]} flex items-center justify-center text-white font-bold text-lg`}>
                                {author.name.split(" ").map(n => n[0]).join("")}
                            </div>

                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {author.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {author.role}
                                    {author.university && ` • ${author.university}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
