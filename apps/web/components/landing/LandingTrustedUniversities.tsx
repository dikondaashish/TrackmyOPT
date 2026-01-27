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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-12">
                    {universities.map((uni, index) => (
                        <span
                            key={index}
                            className="text-lg md:text-xl font-bold font-serif text-gray-400 dark:text-gray-600 hover:text-primary transition-colors cursor-default"
                        >
                            {uni}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
