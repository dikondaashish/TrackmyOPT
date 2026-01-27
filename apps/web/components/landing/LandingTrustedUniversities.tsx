"use client";

import { motion } from "framer-motion";

export function LandingTrustedUniversities() {
    const universities = [
        { name: "Carnegie Mellon", domain: "cmu.edu" },
        { name: "Georgia Tech", domain: "gatech.edu" },
        { name: "USC", domain: "usc.edu" },
        { name: "NYU", domain: "nyu.edu" },
        { name: "Columbia", domain: "columbia.edu" },
        { name: "MIT", domain: "mit.edu" },
        { name: "Stanford", domain: "stanford.edu" },
        { name: "UC Berkeley", domain: "berkeley.edu" },
        { name: "Harvard", domain: "harvard.edu" },
        { name: "Cornell", domain: "cornell.edu" },
        { name: "UIUC", domain: "illinois.edu" },
        { name: "Purdue", domain: "purdue.edu" },
        { name: "UT Austin", domain: "utexas.edu" },
        { name: "Northeastern", domain: "northeastern.edu" },
        { name: "Boston University", domain: "bu.edu" },
        { name: "Texas A&M", domain: "tamu.edu" },
        { name: "Arizona State", domain: "asu.edu" },
        { name: "University of Washington", domain: "washington.edu" },
        { name: "UCLA", domain: "ucla.edu" },
        { name: "University of Michigan", domain: "umich.edu" },
    ];

    return (
        <div className="w-full py-12 border-y border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden mb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    Trusted by students from 100+ universities worldwide
                </p>
            </div>

            <div className="relative w-full overflow-hidden group">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent" />

                {/* Scrolling Container */}
                <div
                    className="flex gap-16 items-center w-max animate-scroll group-hover:[animation-play-state:paused]"
                    style={{
                        animation: "scroll 50s linear infinite"
                    }}
                >
                    {/* Double the list for seamless loop */}
                    {[...universities, ...universities].map((uni, index) => (
                        <div
                            key={index}
                            className="relative w-32 h-16 flex items-center justify-center grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-110 cursor-pointer"
                        >
                            <img
                                src={`https://logo.clearbit.com/${uni.domain}?size=128&format=png`}
                                alt={uni.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    // Fallback if logo fails
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerText = uni.name;
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
