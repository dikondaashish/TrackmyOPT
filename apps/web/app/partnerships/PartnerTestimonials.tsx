"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Dr. Sarah Mitchell",
        role: "Director of International Student Services",
        university: "UC San Diego",
        quote: "TrackMyOPT has significantly reduced the number of OPT-related questions we receive. Students are more informed and proactive about their deadlines.",
    },
    {
        name: "James Rodriguez",
        role: "International Student Advisor",
        university: "NYU",
        quote: "The analytics dashboard helps us identify students who might be at risk of compliance issues before problems occur. It's a game-changer for our office.",
    },
    {
        name: "Emily Chen",
        role: "Campus Ambassador",
        university: "Carnegie Mellon",
        quote: "Being an ambassador helped me build leadership skills and help fellow international students. Plus, the free Premium access is amazing!",
    },
];

export function PartnerTestimonials() {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        What Our Partners Say
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Hear from DSOs and ambassadors across the country
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-border"
                        >
                            <Quote className="w-8 h-8 text-primary/20 mb-4" />
                            <p className="text-gray-900 dark:text-white text-sm leading-relaxed mb-4">
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
                                        {testimonial.role}
                                    </p>
                                    <p className="text-xs text-primary font-medium">
                                        {testimonial.university}
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
