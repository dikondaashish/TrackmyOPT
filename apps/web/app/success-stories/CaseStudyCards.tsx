"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Briefcase } from "lucide-react";

const caseStudies = [
    {
        name: "Priya M.",
        role: "Software Engineer at Google",
        university: "Stanford University",
        image: "/avatars/student-1.jpg",
        before: {
            unemploymentDays: 45,
            applications: 120,
            interviews: 3,
        },
        after: {
            unemploymentDays: 28,
            applications: 45,
            interviews: 12,
        },
        quote: "TrackMyOPT helped me focus on the right companies. The H-1B sponsor filter saved me so much time.",
    },
    {
        name: "Raj K.",
        role: "Data Scientist at Meta",
        university: "MIT",
        image: "/avatars/student-2.jpg",
        before: {
            unemploymentDays: 60,
            applications: 200,
            interviews: 5,
        },
        after: {
            unemploymentDays: 35,
            applications: 60,
            interviews: 15,
        },
        quote: "I was panicking about my 90-day limit. The timeline tracker kept me sane and on track.",
    },
    {
        name: "Wei L.",
        role: "Product Manager at Amazon",
        university: "UC Berkeley",
        image: "/avatars/student-3.jpg",
        before: {
            unemploymentDays: 55,
            applications: 150,
            interviews: 4,
        },
        after: {
            unemploymentDays: 22,
            applications: 35,
            interviews: 10,
        },
        quote: "The AI resume tool completely transformed my applications. My callback rate tripled.",
    },
];

export function CaseStudyCards() {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Real Student Results
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        See how TrackMyOPT helped these students land their dream jobs
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {caseStudies.map((study, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-border overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-border">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary font-bold text-lg">
                                        {study.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {study.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{study.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground italic">
                                    &ldquo;{study.quote}&rdquo;
                                </p>
                            </div>

                            {/* Stats Comparison */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Results</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>Unemployment Days</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground line-through">{study.before.unemploymentDays}</span>
                                            <span className="text-sm font-semibold text-green-600">{study.after.unemploymentDays}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Briefcase className="w-4 h-4" />
                                            <span>Interviews</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground line-through">{study.before.interviews}</span>
                                            <span className="text-sm font-semibold text-green-600">{study.after.interviews}</span>
                                        </div>
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
