"use client";

import { motion } from "framer-motion";
import { Twitter, Quote, Linkedin, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Testimonial {
    type: "twitter" | "linkedin" | "quote" | "stat";
    content: string;
    author: string;
    role: string;
    image?: string;
    handle?: string;
    statValue?: string;
    statLabel?: string;
    color?: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        type: "twitter",
        content: "Just got my OPT approved in 30 days! The application guides on TrackMyOPT were a lifesaver. Avoided an RFE thanks to their checklist. 🚀",
        author: "Sarah Chen",
        role: "Software Engineer",
        handle: "@sarah_codes",
        image: "/avatars/avatar-1.png"
    },
    {
        type: "quote",
        content: "I applied to 500+ jobs with no luck. The AI Resume Doctor revamped my CV, and I got callbacks from Amazon and Uber within a week.",
        author: "Raj Patel",
        role: "Data Analyst @ Uber",
        color: "bg-blue-50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-100"
    },
    {
        type: "stat",
        content: "",
        author: "",
        role: "",
        statValue: "21 Days",
        statLabel: "Average time to find a job vs 90 days industry avg",
        color: "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
    },
    {
        type: "linkedin",
        content: "Highly recommend TrackMyOPT to all my juniors. The H-1B sponsor database is gold. It saves so much time filtering out companies that don't sponsor.",
        author: "Michael Obi",
        role: "Product Manager",
        handle: "michael-obi",
        image: "/avatars/avatar-2.png"
    },
    {
        type: "quote",
        content: "My DSO was surprised I knew more about the 24-month extension rules than her! All thanks to the simplified guides here.",
        author: "Elena Rodriguez",
        role: "Biotech Researcher",
        color: "bg-purple-50 dark:bg-purple-900/10 text-purple-900 dark:text-purple-100"
    },
    {
        type: "twitter",
        content: "If you are an F-1 student, you NEED this. It tracks your unemployment days automatically so you don't accidentally fall out of status.",
        author: "David Kim",
        role: "UX Designer",
        handle: "@design_david",
        image: "/avatars/avatar-3.png"
    },
    {
        type: "stat",
        content: "",
        author: "",
        role: "",
        statValue: "$15K+",
        statLabel: "Avg. Salary Negotiation Increase using our data",
        color: "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
    },
    {
        type: "quote",
        content: "TrackMyOPT is the mentor I never had. It gave me the confidence to negotiate my offer and ask for relocation support.",
        author: "Priya Gupta",
        role: "Financial Analyst",
        color: "bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100"
    }
];

export function MasonryWallOfLove() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-64 bg-pink-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Loved by 50,000+ Students
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        From navigating complex regulations to landing dream jobs, see how TrackMyOPT is changing lives.
                    </p>
                </div>

                {/* Masonry Grid (CSS Columns) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {TESTIMONIALS.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="break-inside-avoid"
                        >
                            {/* Render Card based on Type */}
                            {item.type === 'twitter' && <TwitterCard item={item} />}
                            {item.type === 'linkedin' && <LinkedinCard item={item} />}
                            {item.type === 'quote' && <QuoteCard item={item} />}
                            {item.type === 'stat' && <StatCard item={item} />}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TwitterCard({ item }: { item: Testimonial }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{item.author}</p>
                        <p className="text-gray-500 text-xs">{item.handle}</p>
                    </div>
                </div>
                <Twitter className="w-5 h-5 text-[#1DA1F2] fill-current" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-1">
                {item.content}
            </p>
        </div>
    );
}

function LinkedinCard({ item }: { item: Testimonial }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{item.author}</p>
                        <p className="text-gray-500 text-xs">{item.role}</p>
                    </div>
                </div>
                <Linkedin className="w-5 h-5 text-[#0A66C2] fill-current" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {item.content}
            </p>
        </div>
    );
}

function QuoteCard({ item }: { item: Testimonial }) {
    return (
        <div className={`rounded-2xl p-8 ${item.color} shadow-sm border border-transparent`}>
            <Quote className="w-8 h-8 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-6 leading-relaxed">
                "{item.content}"
            </p>
            <div>
                <p className="font-bold text-sm">{item.author}</p>
                <p className="text-xs opacity-70">{item.role}</p>
            </div>
        </div>
    );
}

function StatCard({ item }: { item: Testimonial }) {
    return (
        <div className={`rounded-2xl p-8 ${item.color} shadow-lg flex flex-col items-center justify-center text-center min-h-[200px]`}>
            <div className="text-5xl font-bold mb-2 tracking-tight">{item.statValue}</div>
            <div className="text-sm opacity-90 font-medium">{item.statLabel}</div>
        </div>
    );
}
