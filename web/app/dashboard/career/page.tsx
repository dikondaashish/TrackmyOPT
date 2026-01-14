"use client";

import { Briefcase } from "lucide-react";
import { CareerStatRow } from "@/components/career/CareerStatRow";
import { CareerHubCards } from "@/components/career/CareerHubCards";

export default function CareerHubPage() {
    // Placeholder data - will be connected to backend later
    const applicationsCount = 0;
    const interviewsCount = 0;
    const followUpsDueCount = 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 dark:border-blue-500/30 mb-6">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Career Tools
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
                            Career Hub
                        </h1>
                        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to get hired on OPT/STEM OPT
                        </p>
                    </div>

                    {/* Status Row */}
                    <div className="flex justify-center mb-12">
                        <CareerStatRow
                            applicationsCount={applicationsCount}
                            interviewsCount={interviewsCount}
                            followUpsDueCount={followUpsDueCount}
                        />
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <CareerHubCards />
            </div>

            {/* Footer Note */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <p className="text-center text-xs text-muted-foreground">
                    More career tools coming soon. Have a suggestion?{" "}
                    <a href="/dashboard/help" className="text-primary hover:underline">Let us know</a>
                </p>
            </div>
        </div>
    );
}
