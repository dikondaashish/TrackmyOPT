"use client";

import { GlassyFeatureTags } from "@/components/landing/GlassyFeatureTags";
import { AnimatedRoadmap } from "@/components/landing/AnimatedRoadmap";

export function LandingValueGrid() {
    return (
        <section className="py-8 container px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Card 1: Peace of Mind (Feature Tags) */}
                <div className="relative bg-white dark:bg-zinc-900 rounded-xl p-5 lg:p-6 overflow-hidden border border-gray-200 dark:border-zinc-800 h-full flex flex-col min-h-[300px]">
                    {/* Content */}
                    <div className="prose-longform relative z-10 flex flex-col items-center text-center mb-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                            Everything you need for peace of mind
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            Navigating F-1 status is complex. We turn the chaos into a structured, trackable journey.
                        </p>
                    </div>

                    {/* Interactive Tags */}
                    <div className="relative mt-auto w-full flex-1 flex items-center justify-center">
                        <GlassyFeatureTags />
                    </div>
                </div>

                {/* Card 2: Road to H-1B (Roadmap) */}
                <div className="relative bg-white dark:bg-zinc-900 rounded-xl p-5 lg:p-6 overflow-hidden border border-gray-200 dark:border-zinc-800 h-full flex flex-col min-h-[300px]">
                    {/* Content */}
                    <div className="prose-longform relative z-10 flex flex-col items-center text-center mb-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                            The road to H-1B
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            From your first OPT application to your final visa approval, we guide you through every milestone.
                        </p>
                    </div>

                    {/* Roadmap Visual */}
                    <div className="relative mt-auto w-full flex-1 flex items-center justify-center">
                        <AnimatedRoadmap />
                    </div>
                </div>
            </div>
        </section>
    );
}
