"use client";

import { GlassyFeatureTags } from "@/components/landing/glassy-feature-tags";
import { AnimatedRoadmap } from "@/components/landing/animated-roadmap";
import { MoveRight } from "lucide-react";
import Link from "next/link";

export function LandingValueGrid() {
    return (
        <section className="py-8 container px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Card 1: Peace of Mind (Feature Tags) */}
                <div className="relative group bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 lg:p-6 overflow-hidden border border-white/20 dark:border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 h-full flex flex-col min-h-[300px]">
                    {/* Content */}
                    <div className="prose-longform relative z-10 flex flex-col items-center text-center mb-4">
                        <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground mb-2">
                            Everything You Need for<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Peace of Mind
                            </span>
                        </h2>
                        <p className="text-muted-foreground/90 text-sm max-w-sm">
                            Navigating F-1 status is complex. We turn the chaos into a structured, trackable journey.
                        </p>
                    </div>

                    {/* Interactive Tags */}
                    <div className="relative mt-auto w-full flex-1 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-105">
                        <GlassyFeatureTags />
                    </div>

                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-900/10 pointer-events-none transition-opacity duration-500 group-hover:opacity-80" />
                </div>

                {/* Card 2: Road to H-1B (Roadmap) */}
                <div className="relative group bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 lg:p-6 overflow-hidden border border-white/20 dark:border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 h-full flex flex-col min-h-[300px]">
                    {/* Content */}
                    <div className="prose-longform relative z-10 flex flex-col items-center text-center mb-4">
                        <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground mb-2">
                            The Road to<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                H-1B
                            </span>
                        </h2>
                        <p className="text-muted-foreground/90 text-sm max-w-sm">
                            From your first OPT application to your final visa approval, we guide you through every milestone.
                        </p>
                    </div>

                    {/* Roadmap Visual */}
                    <div className="relative mt-auto w-full flex-1 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-105">
                        <AnimatedRoadmap />
                    </div>

                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-purple-50/50 dark:to-purple-900/10 pointer-events-none transition-opacity duration-500 group-hover:opacity-80" />
                </div>
            </div>
        </section>
    );
}
