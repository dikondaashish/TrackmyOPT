"use client";

import { Rocket, Sparkles } from "lucide-react";
import { CareerHubCards } from "@/components/career/CareerHubCards";

export default function CareerHubPage() {
    return (
        <div className="h-[calc(100vh-80px)] bg-background flex flex-col">
            {/* Hero Section - Centered */}
            <div className="relative overflow-hidden">
                {/* Background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                    {/* Badge */}
                    <div className="flex justify-center mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-500/30">
                            <Rocket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                Career Tools
                            </span>
                            <Sparkles className="w-3 h-3 text-purple-500" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70 mb-2">
                        Career Hub
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Everything you need to get hired on OPT/STEM OPT
                    </p>
                </div>
            </div>

            {/* Feature Cards Section - Fills remaining space */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
                <CareerHubCards />
            </div>
        </div>
    );
}
