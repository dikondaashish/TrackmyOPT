"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Shield,
    Building2,
    FileText,
    Chrome,
    Briefcase,
    ArrowRight,
    Sparkles
} from "lucide-react";

const features = [
    {
        icon: Shield,
        title: "OPT Compliance Hub",
        description: "Track your 90-day clock, filing windows, and USCIS deadlines in real-time.",
        href: "/features/compliance",
        gradient: "from-blue-500 to-indigo-600",
        badge: "Core Feature",
    },
    {
        icon: Building2,
        title: "H-1B Sponsor Intelligence",
        description: "Research 25,000+ sponsors with E-Verify status, fraud alerts, and hiring trends.",
        href: "/features/sponsors",
        gradient: "from-emerald-500 to-teal-600",
        badge: "Most Popular",
    },
    {
        icon: FileText,
        title: "AI Resume Doctor",
        description: "Optimize your resume for ATS systems and H-1B-friendly job descriptions.",
        href: "/features/resume-ai",
        gradient: "from-purple-500 to-pink-600",
        badge: "AI Powered",
    },
    {
        icon: Chrome,
        title: "Chrome Extension",
        description: "See sponsor history and E-Verify status directly on LinkedIn and job boards.",
        href: "/features/extension",
        gradient: "from-blue-500 to-cyan-500",
        badge: "Free",
    },
    {
        icon: Briefcase,
        title: "Job Application Tracker",
        description: "Track applications alongside your OPT unemployment counter in one place.",
        href: "/features/job-tracker",
        gradient: "from-amber-500 to-orange-600",
        badge: "New",
    },
];

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-3xl opacity-10" />
                <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-3xl opacity-10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Built for International Students
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                            Everything You Need to{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Protect Your OPT
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
                            From compliance tracking to job search intelligence—all the tools
                            international students need to stay legal and land a job.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="relative pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link
                                    href={feature.href}
                                    className="group block h-full"
                                >
                                    <div className="relative h-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                        {/* Gradient Overlay on Hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                        {/* Badge */}
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-xs font-medium mb-4`}>
                                            {feature.badge}
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                                            <feature.icon className="w-7 h-7 text-white" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {feature.title}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                            {feature.description}
                                        </p>

                                        {/* CTA */}
                                        <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                                            Learn more
                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to Protect Your OPT Status?
                        </h2>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of international students who trust TrackMyOPT
                            to stay compliant and find H-1B sponsors.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-blue-600 bg-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
