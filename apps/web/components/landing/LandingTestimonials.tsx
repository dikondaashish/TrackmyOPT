"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
        content: "I nearly missed my OPT filing window because I miscalculated the 90-day rule. TrackMyOPT alerted me just in time. It's strictly essential for any F-1 student.",
        author: "Priya S.",
        role: "Software Engineer at Google",
        university: "Carnegie Mellon University",
        initial: "P",
        color: "bg-blue-500",
    },
    {
        content: "The unemployment clock is a lifesaver. I didn't realize volunteer work counted until I read the guide here. This platform saved my status.",
        author: "Wei C.",
        role: "Data Scientist at Amazon",
        university: "Georgia Tech",
        initial: "W",
        color: "bg-purple-500",
    },
    {
        content: "Finding H-1B sponsors was a nightmare until I used their database. I filtered for companies in Texas and found my current employer in 2 days.",
        author: "Ahmed K.",
        role: "Product Manager at Oracle",
        university: "UT Austin",
        initial: "A",
        color: "bg-green-500",
    },
];

export function LandingTestimonials() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 mb-6"
                    >
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Trusted by Students from{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Top Universities
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Join 15,000+ international students who use TrackMyOPT to secure their future in the United States.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 hover:shadow-xl dark:hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300"
                        >
                            <Quote className="w-10 h-10 text-blue-200 dark:text-blue-900/30 mb-6" />

                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 italic">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {testimonial.initial}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        {testimonial.author}
                                    </h4>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                        {testimonial.role}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {testimonial.university}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* University Logos Strip - Visual Trust */}
                <div className="mt-20 pt-10 border-t border-gray-100 dark:border-zinc-800">
                    <p className="text-center text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">
                        Students from these universities rely on us
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder text for logos since we don't have SVG assets for them yet, but styled to look like logo placeholders */}
                        {["Carnegie Mellon", "Georgia Tech", "USC", "NYU", "Columbia", "MIT"].map((uni) => (
                            <span key={uni} className="text-xl md:text-2xl font-bold font-serif text-gray-400 dark:text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-default">
                                {uni}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
