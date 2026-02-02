"use client";

import { motion } from "framer-motion";
import { Lightbulb, Rocket, Users, TrendingUp } from "lucide-react";

const milestones = [
    {
        year: "2021",
        icon: Lightbulb,
        title: "The Idea",
        description: "Frustrated by spreadsheets and missed deadlines, we started building a better solution.",
    },
    {
        year: "2022",
        icon: Rocket,
        title: "First Launch",
        description: "Released the first version with timeline tracking and unemployment calculator.",
    },
    {
        year: "2023",
        icon: Users,
        title: "Growing Community",
        description: "Reached 5,000 students and expanded to include document storage and job tracking.",
    },
    {
        year: "2024",
        icon: TrendingUp,
        title: "Scaling Up",
        description: "Launched AI resume tools, H-1B sponsor database, and Chrome extension.",
    },
];

export function FounderStory() {
    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Our Journey
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        From a side project to helping thousands of international students
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-8">
                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex items-start gap-6 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                            >
                                {/* Timeline dot */}
                                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-zinc-950 z-10" />

                                {/* Content */}
                                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? "md:text-right md:pr-8" : "md:pl-8"
                                    }`}>
                                    <div className={`inline-flex items-center gap-2 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-sm ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                        }`}>
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary flex-shrink-0">
                                            <milestone.icon className="w-5 h-5" />
                                        </div>
                                        <div className={index % 2 === 0 ? "md:text-right" : ""}>
                                            <span className="text-sm font-bold text-primary">{milestone.year}</span>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {milestone.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
