"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const quotes = [
    {
        text: "I was so stressed about my 90-day clock. TrackMyOPT made it visual and simple to understand.",
        author: "Jessica W.",
        details: "Yale, Economics",
        color: "from-blue-500 to-indigo-600",
    },
    {
        text: "Finally found a company that sponsors H-1B through the sponsor database. Game changer!",
        author: "Vikram R.",
        details: "CMU, SWE",
        color: "from-emerald-500 to-teal-600",
    },
    {
        text: "The Chrome extension shows me sponsorship info right on LinkedIn. So convenient.",
        author: "Ming L.",
        details: "Berkeley, Data Science",
        color: "from-purple-500 to-pink-600",
    },
    {
        text: "My resume went from 0 callbacks to 5 interviews in two weeks after using the AI tool.",
        author: "Ana G.",
        details: "MIT, MechE",
        color: "from-amber-500 to-orange-600",
    },
    {
        text: "Best investment I made during my job search. Worth every penny for the premium.",
        author: "David K.",
        details: "Stanford, MBA",
        color: "from-rose-500 to-red-600",
    },
    {
        text: "Helped me avoid losing my OPT status when I forgot about my unemployment days.",
        author: "Fatima A.",
        details: "Columbia, Finance",
        color: "from-cyan-500 to-blue-600",
    },
    {
        text: "The job tracker integration with OPT countdown is genius. Wish I had this earlier.",
        author: "Chen W.",
        details: "NYU, Marketing",
        color: "from-indigo-500 to-violet-600",
    },
    {
        text: "Finally a tool that understands what F-1 students actually go through.",
        author: "Raj P.",
        details: "Georgia Tech, CS",
        color: "from-teal-500 to-emerald-600",
    },
];

export function QuoteWall() {
    return (
        <section className="py-24 relative bg-gray-50 dark:bg-zinc-900/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
                        <Quote className="w-4 h-4" />
                        In Their Words
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        What Students Are Saying
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Real quotes from real students who transformed their job search.
                    </p>
                </motion.div>

                {/* Masonry Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {quotes.map((quote, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="break-inside-avoid"
                        >
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
                                {/* Quote Icon */}
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${quote.color} flex items-center justify-center mb-4`}>
                                    <Quote className="w-5 h-5 text-white" />
                                </div>

                                {/* Quote Text */}
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                    &ldquo;{quote.text}&rdquo;
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${quote.color} flex items-center justify-center text-white text-xs font-bold`}>
                                        {quote.author.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {quote.author}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {quote.details}
                                        </p>
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
