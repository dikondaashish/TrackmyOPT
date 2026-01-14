"use client";

import { SearchX } from "lucide-react";
import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { H1BSponsorCard } from "./H1BSponsorCard";

interface H1BSponsorListProps {
    sponsors: H1BSponsor[];
    savedIds: string[];
    onToggleSave: (id: string) => void;
    isLoading?: boolean;
}

// Skeleton loader for cards
function SponsorCardSkeleton() {
    return (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
                    <div className="flex gap-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                    </div>
                </div>
            </div>
            <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4" />
            <div className="flex gap-2">
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-28" />
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-28 ml-auto" />
            </div>
        </div>
    );
}

export function H1BSponsorList({ sponsors, savedIds, onToggleSave, isLoading }: H1BSponsorListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <SponsorCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (sponsors.length === 0) {
        return (
            <div className="text-center py-16 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <SearchX className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No sponsors match your filters
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sponsors.map((sponsor) => (
                <H1BSponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    isSaved={savedIds.includes(sponsor.id)}
                    onToggleSave={onToggleSave}
                />
            ))}
        </div>
    );
}
