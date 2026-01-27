"use client";

import { motion } from "framer-motion";

const universities = [
    "Carnegie Mellon", "Georgia Tech", "USC", "NYU", "Columbia", "MIT", "Stanford", "UC Berkeley",
    "Harvard", "Cornell", "UIUC", "Purdue", "UT Austin", "Northeastern", "Boston University",
    "Texas A&M", "Arizona State", "University of Washington", "UCLA", "University of Michigan"
];

export function LandingTrustedUniversities() {
    return (
        <div className="w-full py-8 border-y border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden mt-12 lg:mt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    Trusted by students from 100+ universities worldwide
                </p>
            </div>

            <div className="relative flex w-full overflow-hidden mask-linear-gradient">
                {/* Left Fade */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10" />

                {/* Scrolling Container */}
                <div className="flex animate-scroll whitespace-nowrap gap-16 py-2">
                    {/* First Loop */}
                    {universities.map((uni, index) => (
                        <span
                            key={`uni-1-${index}`}
                            className="text-xl md:text-2xl font-bold font-serif text-gray-400 dark:text-gray-600 hover:text-primary transition-colors cursor-default"
                        >
                            {uni}
                        </span>
                    ))}

                    {/* Second Loop (Duplicate for seamless scroll) */}
                    {universities.map((uni, index) => (
                        <span
                            key={`uni-2-${index}`}
                            className="text-xl md:text-2xl font-bold font-serif text-gray-400 dark:text-gray-600 hover:text-primary transition-colors cursor-default"
                        >
                            {uni}
                        </span>
                    ))}


                </div>

                {/* Right Fade */}
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10" />
            </div>
        </div>
    );
}
