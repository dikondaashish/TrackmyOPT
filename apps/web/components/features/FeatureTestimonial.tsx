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
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    purple: "bg-violet-600",
    amber: "bg-amber-500",
    cyan: "bg-cyan-600",
};

export function FeatureTestimonial({
    quote,
    author,
    accentColor = "blue",
}: FeatureTestimonialProps) {
    return (
        <section className="relative bg-background py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Background card */}
                    <div className="relative surface-card p-8 sm:p-12">
                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="text-xl sm:text-2xl text-foreground font-medium leading-relaxed mb-8">
                            "{quote}"
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className={`w-14 h-14 rounded-full ${accentStyles[accentColor]} flex items-center justify-center text-white font-bold text-lg`}>
                                {author.name.split(" ").map(n => n[0]).join("")}
                            </div>

                            <div>
                                <p className="font-semibold text-foreground">
                                    {author.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
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
