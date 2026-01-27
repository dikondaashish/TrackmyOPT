"use client";

import { motion } from "framer-motion";
import { Star, Quote, Building } from "lucide-react";

const testimonials = [
    {
        content: "I nearly missed my OPT filing window because I miscalculated the 90-day rule. TrackMyOPT alerted me just in time. It's strictly essential for any F-1 student.",
        author: "Priya S.",
        role: "Software Engineer",
        company: "Google",
        initial: "P",
        color: "bg-blue-500",
    },
    {
        content: "The unemployment clock is a lifesaver. I didn't realize volunteer work counted until I read the guide here. This platform saved my status.",
        author: "Wei C.",
        role: "Data Scientist",
        company: "Amazon",
        initial: "W",
        color: "bg-purple-500",
    },
    {
        content: "Finding H-1B sponsors was a nightmare until I used their database. I filtered for companies in Texas and found my current employer in 2 days.",
        author: "Ahmed K.",
        role: "Product Manager",
        company: "Oracle",
        initial: "A",
        color: "bg-green-500",
    },
];



export function LandingTestimonials() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden" id="testimonials">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                        Don't Just Take Our Word For It
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 hover:shadow-xl dark:hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>

                            <p className="text-foreground text-lg leading-relaxed mb-6">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                    {testimonial.initial}
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground text-sm">
                                        {testimonial.author}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Building className="w-3 h-3" />
                                        <span>{testimonial.role} at {testimonial.company}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
