"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Building2, GraduationCap, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

interface CaseStudy {
    name: string;
    photo?: string;
    university: string;
    degree: string;
    company: string;
    role: string;
    beforeStats: {
        applications: number;
        interviews: number;
        timeline: string;
    };
    afterStats: {
        applications: number;
        interviews: number;
        timeline: string;
    };
    quote: string;
    tags: string[];
    color: string;
}

const caseStudies: CaseStudy[] = [
    {
        name: "Priya Sharma",
        university: "Georgia Tech",
        degree: "MS Computer Science",
        company: "Google",
        role: "Software Engineer",
        beforeStats: { applications: 150, interviews: 2, timeline: "8 months" },
        afterStats: { applications: 45, interviews: 12, timeline: "3 months" },
        quote: "TrackMyOPT's sponsor database helped me focus on companies that actually hire international students.",
        tags: ["STEM OPT", "H-1B Sponsor", "Big Tech"],
        color: "from-blue-500 to-indigo-600",
    },
    {
        name: "Rahul Krishnan",
        university: "USC",
        degree: "MS Data Science",
        company: "Meta",
        role: "Data Scientist",
        beforeStats: { applications: 200, interviews: 3, timeline: "10 months" },
        afterStats: { applications: 60, interviews: 15, timeline: "4 months" },
        quote: "The AI Resume Doctor transformed my resume and I started getting callbacks within a week.",
        tags: ["STEM OPT", "AI Tools", "FAANG"],
        color: "from-emerald-500 to-teal-600",
    },
    {
        name: "Sarah Chen",
        university: "Stanford",
        degree: "MBA",
        company: "Amazon",
        role: "Product Manager",
        beforeStats: { applications: 100, interviews: 5, timeline: "6 months" },
        afterStats: { applications: 30, interviews: 10, timeline: "2 months" },
        quote: "Tracking my unemployment days prevented a compliance issue that could have ended my OPT.",
        tags: ["Post-OPT", "H-1B Sponsor", "Leadership"],
        color: "from-purple-500 to-pink-600",
    },
    {
        name: "Amit Patel",
        university: "NYU",
        degree: "MS Finance",
        company: "Goldman Sachs",
        role: "Analyst",
        beforeStats: { applications: 120, interviews: 4, timeline: "7 months" },
        afterStats: { applications: 35, interviews: 8, timeline: "2.5 months" },
        quote: "The Chrome extension saved me hours of research on which companies sponsor visas.",
        tags: ["Finance", "H-1B Sponsor", "NYC"],
        color: "from-amber-500 to-orange-600",
    },
];

function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <div className="relative rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${study.color} p-6 pb-12`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold">
                                {study.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="text-white">
                                <h3 className="text-xl font-bold">{study.name}</h3>
                                <p className="text-white/80">{study.role} at {study.company}</p>
                            </div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
                        >
                            <ArrowUpRight className="w-5 h-5 text-white" />
                        </motion.div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 -mt-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {study.tags.map((tag) => (
                            <span
                                key={tag}
                                className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${study.color} text-white`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* University & Degree */}
                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{study.university}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{study.degree}</span>
                        </div>
                    </div>

                    {/* Before/After Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">Before TrackMyOPT</p>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <p>{study.beforeStats.applications} applications</p>
                                <p>{study.beforeStats.interviews} interviews</p>
                                <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {study.beforeStats.timeline}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">After TrackMyOPT</p>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <p>{study.afterStats.applications} applications</p>
                                <p className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <TrendingUp className="w-3 h-3" />
                                    {study.afterStats.interviews} interviews
                                </p>
                                <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {study.afterStats.timeline}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-700 dark:text-gray-300 italic border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                        &ldquo;{study.quote}&rdquo;
                    </blockquote>
                </div>
            </div>
        </motion.div>
    );
}

export function CaseStudyCards() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
                        Featured Stories
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        From Struggling to Thriving
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        See the real impact TrackMyOPT has had on students&apos; job search journeys.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {caseStudies.map((study, index) => (
                        <CaseStudyCard key={study.name} study={study} index={index} />
                    ))}
                </div>

                {/* View All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        href="#"
                        className="inline-flex items-center gap-2 px-6 py-3 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-3 transition-all"
                    >
                        View All Success Stories
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
