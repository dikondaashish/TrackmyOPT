"use client";

import { Building2, TrendingUp, Bookmark, Calendar } from "lucide-react";

interface H1BSponsorStatsRowProps {
    totalSponsors: number;
    highSponsors: number;
    savedSponsors: number;
}

export function H1BSponsorStatsRow({ totalSponsors, highSponsors, savedSponsors }: H1BSponsorStatsRowProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
        }
        return num.toLocaleString();
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Sponsors - Blue */}
            <div className="rounded-xl bg-[#EEF4FF] dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Sponsors</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(totalSponsors)}</p>
                </div>
            </div>

            {/* High Sponsors - Orange/Peach */}
            <div className="rounded-xl bg-[#FFF4ED] dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F97316] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">High Sponsors</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{highSponsors.toLocaleString()}</p>
                </div>
            </div>

            {/* Saved Sponsors - Purple */}
            <div className="rounded-xl bg-[#F5F3FF] dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A855F7] flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saved Sponsors</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{savedSponsors.toLocaleString()}</p>
                </div>
            </div>

            {/* Updated - Yellow */}
            <div className="rounded-xl bg-[#FEFCE8] dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EAB308] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Updated</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">Monthly</p>
                </div>
            </div>
        </div>
    );
}
