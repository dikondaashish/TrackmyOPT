"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Sarah K.",
        role: "UX Designer",
        company: "Apple",
        quote: "The document vault feature is a lifesaver. All my OPT documents in one secure place.",
    },
    {
        name: "Michael C.",
        role: "Backend Engineer",
        company: "Stripe",
        quote: "Best investment I made during my OPT. The timeline tracking alone is worth it.",
    },
    {
        name: "Ananya P.",
        role: "ML Engineer",
        company: "OpenAI",
        quote: "Found my job through the H-1B sponsor database. Game changer for international students.",
    },
    {
        name: "David L.",
        role: "Product Designer",
        company: "Figma",
        quote: "The Chrome extension syncs everything automatically. So convenient.",
    },
    {
        name: "Elena R.",
        role: "Data Analyst",
        company: "Netflix",
        quote: "My DSO was impressed when I showed them my tracking dashboard. Very professional.",
    },
    {
        name: "James W.",
        role: "iOS Developer",
        company: "Airbnb",
        quote: "The AI resume feedback helped me get callbacks from companies I never expected.",
    },
];

export function QuoteWall() {
    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        What Students Are Saying
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of satisfied users
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-border"
                        >
                            <Quote className="w-8 h-8 text-primary/20 mb-4" />
                            <p className="text-gray-900 dark:text-white mb-4">
                                &ldquo;{testimonial.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary font-semibold">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {testimonial.role} at {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
