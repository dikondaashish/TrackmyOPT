"use client";

import { Briefcase, Sparkles, Target, Rocket, TrendingUp } from "lucide-react";
import { CareerStatRow } from "@/components/career/CareerStatRow";
import { CareerHubCards } from "@/components/career/CareerHubCards";

export default function CareerHubPage() {
    // Placeholder data - will be connected to backend later
    const applicationsCount = 0;
    const interviewsCount = 0;
    const followUpsDueCount = 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section with Premium Design */}
            <div className="relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent" />

                {/* Floating decorative elements */}
                <div className="absolute top-20 right-[15%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 left-[10%] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-500/30 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Career Tools for OPT Students
                            </span>
                            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Main Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Career Hub
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Everything you need to <span className="text-foreground font-medium">get hired</span> on OPT/STEM OPT
                        </p>
                    </div>

                    {/* Quick Stats Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">100K+ Companies</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20">
                            <Rocket className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">AI-Powered Tools</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">Track Progress</span>
                        </div>
                    </div>

                    {/* Status Row */}
                    <div className="flex justify-center">
                        <CareerStatRow
                            applicationsCount={applicationsCount}
                            interviewsCount={interviewsCount}
                            followUpsDueCount={followUpsDueCount}
                        />
                    </div>
                </div>
            </div>

            {/* Section Divider */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Your Career Toolkit</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
            </div>

            {/* Feature Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <CareerHubCards />
            </div>

            {/* Premium CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                            <Sparkles className="w-4 h-4" />
                            Pro Tip
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                            Ready to Land Your Dream Job?
                        </h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-6">
                            Start by exploring H-1B sponsors, then track your applications. Our tools help you stay organized and increase your chances.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a
                                href="/dashboard/career/h1b-sponsors"
                                className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
                            >
                                Start Exploring →
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <p className="text-center text-sm text-muted-foreground">
                    More career tools coming soon. Have a suggestion?{" "}
                    <a href="/dashboard/help" className="text-primary hover:underline font-medium">Let us know</a>
                </p>
            </div>
        </div>
    );
}
