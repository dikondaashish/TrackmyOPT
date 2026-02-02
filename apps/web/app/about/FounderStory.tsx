"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Lightbulb, Rocket, Users, Trophy } from "lucide-react";

const timelineEvents = [
    {
        year: "2021",
        icon: GraduationCap,
        title: "The Problem We Faced",
        description: "As F-1 students ourselves, we struggled with tracking OPT deadlines, finding H-1B sponsors, and managing the stress of maintaining legal status while job hunting.",
        color: "from-blue-500 to-indigo-600",
    },
    {
        year: "2022",
        icon: Lightbulb,
        title: "The Idea Was Born",
        description: "After missing an important deadline and nearly losing status, we knew there had to be a better way. We started building a simple tracker for ourselves.",
        color: "from-amber-500 to-orange-600",
    },
    {
        year: "2023",
        icon: Briefcase,
        title: "Building the Platform",
        description: "What started as a personal project grew into a full platform. We added H-1B sponsor search, resume tools, and compliance tracking based on feedback from fellow students.",
        color: "from-emerald-500 to-teal-600",
    },
    {
        year: "2024",
        icon: Users,
        title: "Growing Community",
        description: "TrackMyOPT launched publicly and quickly grew to help thousands of students across 100+ universities stay compliant and find great opportunities.",
        color: "from-purple-500 to-pink-600",
    },
    {
        year: "2025",
        icon: Rocket,
        title: "AI-Powered Features",
        description: "We introduced AI Resume Doctor, Chrome Extension for job hunting, and enhanced sponsor intelligence to give students every advantage possible.",
        color: "from-cyan-500 to-blue-600",
    },
    {
        year: "Future",
        icon: Trophy,
        title: "Your Success Story",
        description: "We're continuously building new features based on what students need. Your success is our mission, and we're just getting started.",
        color: "from-rose-500 to-red-600",
    },
];

export function FounderStory() {
    return (
        <section className="py-24 relative bg-gradient-to-b from-transparent to-gray-50 dark:to-zinc-900/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
                        Our Journey
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        From Frustrated Students to Building Solutions
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Every great solution starts with a real problem. Here's how TrackMyOPT came to be.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-rose-500" />

                    {timelineEvents.map((event, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex items-center gap-8 mb-12 last:mb-0 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                                }`}
                        >
                            {/* Icon */}
                            <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center shadow-lg`}
                                >
                                    <event.icon className="w-7 h-7 text-white" />
                                </motion.div>
                            </div>

                            {/* Content Card */}
                            <div className={`w-full lg:w-1/2 pl-28 lg:pl-0 ${index % 2 === 0 ? "lg:pr-16" : "lg:pl-16"}`}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`inline-flex px-3 py-1 rounded-full bg-gradient-to-r ${event.color} text-white text-xs font-bold mb-3`}>
                                        {event.year}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {event.description}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
