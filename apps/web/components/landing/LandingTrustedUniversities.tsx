"use client";

import { motion } from "framer-motion";

export function LandingTrustedUniversities() {
    const universities = [
        { name: "Carnegie Mellon", logo: "/unis/cmu.png" },
        { name: "Georgia Tech", logo: "/unis/gatech.png" },
        { name: "USC", logo: "/unis/usc.png" },
        { name: "NYU", logo: "/unis/nyu.png" },
        { name: "Columbia", logo: "/unis/columbia.png" },
        { name: "MIT", logo: "/unis/mit.png" },
        { name: "Stanford", logo: "/unis/stanford.png" },
        { name: "UC Berkeley", logo: "/unis/berkeley.svg" },
        { name: "Harvard", logo: "/unis/harvard.png" },
        { name: "Cornell", logo: "/unis/cornell.png" },
        { name: "UIUC", logo: "/unis/illinois.png" },
        { name: "Purdue", logo: "/unis/purdue.png" },
        { name: "UT Austin", logo: "/unis/utexas.png" },
        { name: "Northeastern", logo: "/unis/northeastern.png" },
        { name: "Boston University", logo: "/unis/bu.png" },
        { name: "Texas A&M", logo: "/unis/tamu.png" },
        { name: "Arizona State", logo: "/unis/asu.webp" },
        { name: "University of Washington", logo: "/unis/washington.png" },
        { name: "UCLA", logo: "/unis/ucla.png" },
        { name: "University of Michigan", logo: "/unis/umich.png" },
    ];

    return (
        <div className="w-full py-10 border-y border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden mb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    Trusted by students from 20+ universities worldwide
                </p>
            </div>

            <div className="relative w-full overflow-hidden group">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent" />

                {/* Scrolling Container */}
                <div
                    className="flex gap-20 items-center w-max animate-scroll group-hover:[animation-play-state:paused]"
                    style={{
                        animation: "scroll 80s linear infinite"
                    }}
                >
                    {/* Double the list for seamless loop */}
                    {[...universities, ...universities].map((uni, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default group/item"
                        >
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                                <img
                                    src={uni.logo}
                                    alt={uni.name}
                                    className="max-w-full max-h-full object-contain group-hover/item:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                            <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground whitespace-nowrap group-hover/item:text-primary transition-colors">
                                {uni.name}
                            </span>
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
