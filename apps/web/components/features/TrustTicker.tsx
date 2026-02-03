"use client";

import { motion } from "framer-motion";

const UNIVERSITIES = ["USC", "Northeastern", "NYU", "Columbia", "CMU", "Georgia Tech", "UIUC", "ASU"];
const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Tesla", "Apple", "Netflix", "Uber"];

export function TrustTicker() {
    return (
        <div className="w-full py-12 border-y border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Trusted by students from top universities and companies
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                {/* Gradient Masks */}
                <div className="absolute top-0 bottom-0 left-0 w-24 z-10 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent" />
                <div className="absolute top-0 bottom-0 right-0 w-24 z-10 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent" />

                <div className="animate-marquee flex whitespace-nowrap gap-16 px-16">
                    {/* First Set */}
                    {UNIVERSITIES.concat(COMPANIES).map((name, i) => (
                        <span key={i} className="text-xl font-bold text-gray-300 dark:text-zinc-700 flex items-center gap-2">
                            {/* Placeholder Icon/Logo */}
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800" />
                            {name}
                        </span>
                    ))}
                    {/* Duplicate Set for Loop */}
                    {UNIVERSITIES.concat(COMPANIES).map((name, i) => (
                        <span key={`dup-${i}`} className="text-xl font-bold text-gray-300 dark:text-zinc-700 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800" />
                            {name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
