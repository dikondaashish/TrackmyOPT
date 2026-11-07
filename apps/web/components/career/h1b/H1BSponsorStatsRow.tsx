"use client";

import { Building2, TrendingUp, Bookmark, Calendar } from "lucide-react";

interface H1BSponsorStatsRowProps {
    totalSponsors: number;
    highSponsors: number;
    savedSponsors: number;
}

export function H1BSponsorStatsRow({ totalSponsors, highSponsors, savedSponsors }: H1BSponsorStatsRowProps) {


    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Sponsors - Blue */}
            <div className="rounded-xl bg-card border border-border shadow-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Total Sponsors</p>
                    <p className="text-xl font-semibold text-foreground">{totalSponsors.toLocaleString()}</p>
                </div>
            </div>

            {/* High Sponsors - Orange/Peach */}
            <div className="rounded-xl bg-card border border-border shadow-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">High Sponsors</p>
                    <p className="text-xl font-semibold text-foreground">{highSponsors.toLocaleString()}</p>
                </div>
            </div>

            {/* Saved Sponsors - Purple */}
            <div className="rounded-xl bg-card border border-border shadow-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-violet-600 dark:text-violet-300" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Saved Sponsors</p>
                    <p className="text-xl font-semibold text-foreground">{savedSponsors.toLocaleString()}</p>
                </div>
            </div>

            {/* Updated - Yellow */}
            <div className="rounded-xl bg-card border border-border shadow-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-600 dark:text-zinc-300" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Updated</p>
                    <p className="text-xl font-semibold text-foreground">Monthly</p>
                </div>
            </div>
        </div>
    );
}
