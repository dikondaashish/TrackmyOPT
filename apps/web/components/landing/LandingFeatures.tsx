"use client";

import { motion } from "framer-motion";
import {
    Clock,
    Briefcase,
    ShieldCheck,
    BellRing,
    FileSearch,
    GraduationCap,
    ArrowRight
} from "lucide-react";

const features = [
    {
        name: "OPT Timeline Dashboard",
        description: "Your entire immigration journey in one view. Track dates from graduation to STEM extension with precision.",
        icon: GraduationCap,
        color: "blue",
    },
    {
        name: "Unemployment Clock",
        description: "Never violate the 90-day rule. Track your unemployment days with traffic-light alerts.",
        icon: Clock,
        color: "green",
    },
    {
        name: "CRM for Job Search",
        description: "A Kanban-style tracker to manage your job applications, interviews, and offers in one pipeline.",
        icon: Briefcase,
        color: "purple",
    },
    {
        name: "H-1B Sponsor Database",
        description: "Search 80,000+ verified companies that sponsor H-1B visas. Find employers who actually hire F-1 students.",
        icon: FileSearch,
        color: "pink",
    },
    {
        name: "USCIS Case Status",
        description: "Real-time tracking for your EAD card. We check USCIS daily and email you instantly when status changes.",
        icon: BellRing,
        color: "amber",
    },
    {
        name: "Document Vault",
        description: "Bank-grade encryption for your I-20s, EADs, and passports. AI automatically extracts expiry dates.",
        icon: ShieldCheck,
        color: "cyan",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function LandingFeatures() {
    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4"
                    >
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Everything You Need
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                    >
                        The Operating System for{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            F-1 Students
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 dark:text-gray-300"
                    >
                        Stop using spreadsheets and calendar reminders. TrackMyOPT gives you professional tools designed specifically for the immigrant journey in the US.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            variants={item}
                            className="group relative bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-zinc-700/50 hover:shadow-xl hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300
                                ${feature.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : ''}
                                ${feature.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white' : ''}
                                ${feature.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white' : ''}
                                ${feature.color === 'pink' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 group-hover:bg-pink-600 group-hover:text-white' : ''}
                                ${feature.color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white' : ''}
                                ${feature.color === 'cyan' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white' : ''}
                            `}>
                                <feature.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {feature.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                {feature.description}
                            </p>

                            <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                Learn more <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
