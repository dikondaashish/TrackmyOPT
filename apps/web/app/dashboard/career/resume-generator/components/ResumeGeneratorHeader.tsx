"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History } from "lucide-react";
import {
    ResumeUsageStats,
    type ResumeUsageData,
} from "@/components/dashboard/resume/ResumeUsageStats";

export type ResumeGeneratorHeaderProps = {
    usageLimit: ResumeUsageData | null;
    onBuyCredits: () => void;
    onUpgrade: () => void;
    onOpenHistory: () => void;
};

export function ResumeGeneratorHeader({
    usageLimit,
    onBuyCredits,
    onUpgrade,
    onOpenHistory,
}: ResumeGeneratorHeaderProps) {
    return (
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="max-w-7xl mx-auto max-md:px-3 md:px-4 sm:px-6 py-4">
                <div className="grid grid-cols-1 max-md:gap-3 md:grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center gap-4">
                    {/* Back Button */}
                    <div className="flex justify-start">
                        <Link
                            href="/dashboard/career"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                    </div>

                    {/* Title + Progress */}
                    <div className="text-center flex flex-col items-center">
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                            Resume Generator
                        </h1>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                                <div className="w-8 h-1 rounded-full bg-blue-600" />
                                <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Step 1 of 3</span>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <div className="hidden lg:block">
                            <ResumeUsageStats
                                compact
                                stats={usageLimit}
                                onBuyCredits={onBuyCredits}
                                onUpgrade={onUpgrade}
                            />
                        </div>

                        <Button
                            variant="outline"
                            onClick={onOpenHistory}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <History className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm font-medium">History</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    );
}
