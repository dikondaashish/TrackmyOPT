"use client";

import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Clock,
    Bell,
    Shield,
    FileText,
    Briefcase,
    Building2,
    FileSearch,
    BookOpen,
    HeartPulse,
    HelpCircle,
    UserCircle,
    Settings,
    ArrowRight
} from "lucide-react";

const allFeatures = [
    {
        category: "OPT Essentials",
        description: "Core tools to maintain your immigration status",
        features: [
            {
                name: "Timeline Dashboard",
                description: "Real-time countdown to every critical deadline from graduation to STEM extension.",
                icon: LayoutDashboard,
            },
            {
                name: "Unemployment Clock",
                description: "Track the 90-day (OPT) and 60-day (STEM) limits with precision alerts.",
                icon: Clock,
            },
            {
                name: "USCIS Tracker",
                description: "Monitor your I-765/EAD case status with automatic daily checks.",
                icon: Bell,
            },
            {
                name: "Document Vault",
                description: "Secure, encrypted storage for I-20s, EADs, and passports with AI extraction.",
                icon: Shield,
            },
        ],
    },
    {
        category: "Career & H-1B",
        description: "Your CRM for job search and sponsorship",
        features: [
            {
                name: "Job Tracker CRM",
                description: "Kanban board to manage applications, interviews, and offers in one pipeline.",
                icon: Briefcase,
            },
            {
                name: "H-1B Database",
                description: "Search 25,000+ verified sponsors. Filter by approval rate and petitions filed.",
                icon: Building2,
            },
            {
                name: "Resume Builder",
                description: "Create ATS-friendly resumes optimized for US tech roles.",
                icon: FileText,
            },
            {
                name: "Application ATS",
                description: "Scan job descriptions to see if your resume matches key requirements.",
                icon: FileSearch,
            },
        ],
    },
    {
        category: "Guides & Compliance",
        description: "Expert resources for life in the US",
        features: [
            {
                name: "Tax Filing Guide",
                description: "Determine if you're a resident or non-resident. File correctly with 8843.",
                icon: BookOpen,
            },
            {
                name: "Health Insurance",
                description: "Find affordable plans that meet university and visa requirements.",
                icon: HeartPulse,
            },
            {
                name: "Application Checklists",
                description: "Step-by-step guides for Initial OPT and STEM Extension filing.",
                icon: HelpCircle,
            },
            {
                name: "Profile Management",
                description: "Manage your diverse portfolio of immigration documents and data.",
                icon: Settings,
            },
        ],
    },
];

export function LandingAllFeatures() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="prose-longform text-center max-w-3xl mx-auto mb-20">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase text-sm">
                        Complete Toolkit
                    </span>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                        Every Tool You Need to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Thrive in the US
                        </span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        From maintaining legal status to landing your dream job, TrackMyOPT replaces
                        spreadsheets with a professional operating system for immigrants.
                    </p>
                </div>

                <div className="space-y-20">
                    {allFeatures.map((section, sectionIndex) => (
                        <motion.div
                            key={section.category}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.7, delay: sectionIndex * 0.1 }}
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-gray-100 dark:border-zinc-800 pb-4">
                                <div className="prose-longform">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {section.category}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {section.description}
                                    </p>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {section.features.map((feature, featureIndex) => (
                                    <motion.div
                                        key={feature.name}
                                        whileHover={{ y: -5 }}
                                        className="prose-longform group p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                                            <feature.icon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {feature.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
