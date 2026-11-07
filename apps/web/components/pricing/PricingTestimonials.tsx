"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "./PricingData";

export function PricingTestimonials() {
    return (
        <section className="border-y border-border bg-surface py-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Students Who Stay on Top of OPT Deadlines with Pro
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
                            className="surface-card flex flex-col p-6"
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
                            <p className="text-foreground text-sm leading-relaxed mb-6 flex-1">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div>
                                <p className="font-semibold text-foreground text-sm">
                                    {t.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
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
