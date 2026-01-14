"use client";

import { Rocket } from "lucide-react";
import { CareerHubCards } from "@/components/career/CareerHubCards";

export default function CareerHubPage() {
    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Career Tools
                    </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Career Hub
                </h1>
                <p className="text-muted-foreground">
                    Everything you need to get hired on OPT/STEM OPT
                </p>
            </div>

            {/* Feature Cards */}
            <CareerHubCards />
        </div>
    );
}
