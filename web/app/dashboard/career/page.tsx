"use client";

import { CareerStatRow } from "@/components/career/CareerStatRow";
import { CareerHubCards } from "@/components/career/CareerHubCards";

export default function CareerHubPage() {
    // Placeholder data
    const stats = {
        applications: 0,
        interviews: 0,
        followUps: 0
    };

    return (
        <div className="flex-1 w-full bg-background min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Career Hub</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Everything you need to get hired on OPT/STEM OPT
                    </p>
                </div>

                {/* Stats Row */}
                <CareerStatRow stats={stats} />

                {/* Feature Cards Grid */}
                <CareerHubCards />
            </div>
        </div>
    );
}
