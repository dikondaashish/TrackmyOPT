"use client";

import { useRouter } from "next/navigation";
import { MapPin, Bookmark, TrendingUp, TrendingDown, ArrowRight, Linkedin, Briefcase, Star, Check, AlertTriangle } from "lucide-react";
import type { H1BSponsor } from "@/lib/career/h1b/types";
import { calculateSponsorScore } from "@/lib/career/h1b/sponsor-score";
import { EmployerSuggestionLogo } from "@/components/dashboard/opt/EmployerSuggestionLogo";

interface H1BSponsorCardProps {
    sponsor: H1BSponsor;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
    onAddToTracker: (sponsor: H1BSponsor) => void;
}



// Get score color based on value
const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50 dark:bg-emerald-950" };
    if (score >= 60) return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50 dark:bg-blue-950" };
    if (score >= 40) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50 dark:bg-amber-950" };
    return { bg: "bg-gray-400", text: "text-gray-600", light: "bg-gray-50 dark:bg-gray-800" };
};

export function H1BSponsorCard({ sponsor, isSaved, onToggleSave, onAddToTracker }: H1BSponsorCardProps) {
    const router = useRouter();
    const scoreData = calculateSponsorScore(sponsor);
    const scoreColors = getScoreColor(scoreData.score);
    const approvals = sponsor.approvals_2025 || 0;
    const hasRecentRecordedActivity = approvals > 0;

    const handleCardClick = () => {
        router.push(`/dashboard/career/h1b-sponsors/${sponsor.id}`);
    };

    return (
        <div
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
        >

            {/* Top Color Bar - Visual Indicator */}
            <div className={`h-1 ${scoreColors.bg}`} />

            <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Company Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Logo */}
                        <EmployerSuggestionLogo name={sponsor.name} domain={sponsor.website || ''} className="size-12" />

                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {sponsor.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-3 h-3" />
                                    {sponsor.location || "USA"}
                                </span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{sponsor.industry}</span>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(sponsor.id); }}
                        className={`min-h-11 min-w-11 p-2 rounded-lg transition-all shrink-0 ${isSaved
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shadow-sm"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                        aria-label={isSaved ? `Remove ${sponsor.name} from saved sponsors` : `Save ${sponsor.name}`}
                        aria-pressed={isSaved}
                    >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                </div>

                {/* Stats Row - Clean and Scannable */}
                <div className="flex items-stretch gap-3 mb-4">
                    {/* Sponsor Score */}
                    <div className={`flex-1 rounded-lg p-3 ${scoreColors.light}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Star className={`w-3.5 h-3.5 ${scoreColors.text}`} />
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Score</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl font-bold ${scoreColors.text} dark:opacity-90`}>{scoreData.score}</span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">/100</span>
                        </div>
                    </div>

                    {/* 2025 Approvals */}
                    <div className="flex-1 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-1.5 mb-1">
                            {scoreData.trend === "Up" ? (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            ) : scoreData.trend === "Down" ? (
                                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            ) : (
                                <div className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">FY2025</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{approvals.toLocaleString()}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">records</span>
                        </div>
                    </div>
                </div>

                {/* Intelligence Signals (Virtual Office / Wages) */}
                {(sponsor.is_virtual_office || (sponsor.entry_level_percent || 0) > 0.7) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {sponsor.is_virtual_office && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-xs font-medium" title="High volume of companies at this address">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Specific Office Cluster</span>
                            </div>
                        )}
                        {(sponsor.entry_level_percent || 0) > 0.7 && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 text-xs font-medium">
                                <Briefcase className="w-3 h-3" />
                                <span>Entry Level Friendly</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Status Badge */}
                {!((sponsor.is_virtual_office || (sponsor.entry_level_percent || 0) > 0.7)) && (
                    <div className="mb-4">
                        {hasRecentRecordedActivity ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">FY2025 activity recorded</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">No FY2025 activity recorded</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Overview Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCardClick();
                        }}
                        className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Overview
                    </button>

                    {/* Primary CTA - Careers (Direct or Google Search) */}
                    <a
                        href={sponsor.careers_url || `https://www.google.com/search?q=${encodeURIComponent(sponsor.name + " careers")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${sponsor.careers_url
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                    >
                        {sponsor.careers_url ? (
                            <>
                                <span className="flex items-center gap-1">
                                    Careers <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                </span>
                            </>
                        ) : (
                            "Careers"
                        )}
                        {!sponsor.careers_url && <ArrowRight className="w-4 h-4" />}
                    </a>

                    {/* Secondary Actions */}
                    <a
                        href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(sponsor.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[#0A66C2] p-2.5 text-white shadow-md transition-colors hover:bg-[#004182] shrink-0"
                        aria-label={`Find ${sponsor.name} on LinkedIn`}
                    >
                        <Linkedin className="w-4 h-4" />
                    </a>

                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToTracker(sponsor); }}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-100 p-2.5 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 shrink-0"
                        aria-label={`Add ${sponsor.name} to job tracker`}
                    >
                        <Briefcase className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
