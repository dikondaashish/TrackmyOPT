"use client";

import { Rocket, Sparkles } from "lucide-react";
import { CareerStatRow } from "@/components/career/CareerStatRow";
import { CareerHubCards } from "@/components/career/CareerHubCards";

export default function CareerHubPage() {
    // Placeholder counts - will be replaced with real data later
    const applicationsCount = 0;
    const interviewsCount = 0;
    const followUpsDueCount = 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-500/30">
                            <Rocket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                Career Tools
                            </span>
                            <Sparkles className="w-3 h-3 text-purple-500" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70 mb-3">
                        Career Hub
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                        Everything you need to get hired on OPT/STEM OPT
                    </p>

                    {/* Stats Row */}
                    <CareerStatRow
                        applicationsCount={applicationsCount}
                        interviewsCount={interviewsCount}
                        followUpsDueCount={followUpsDueCount}
                    />
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CareerHubCards />
            </div>

            {/* Bottom CTA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-center">
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 25% 25%, white 2%, transparent 2%), radial-gradient(circle at 75% 75%, white 2%, transparent 2%)',
                            backgroundSize: '60px 60px'
                        }} />
                    </div>
                    <div className="relative">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            🎯 Ready to Land Your Dream Job?
                        </h2>
                        <p className="text-white/80 mb-1">
                            Start tracking applications, find H-1B sponsors, and optimize your resume today.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
