"use client";

import { Building2, MapPin, Bookmark, TrendingUp, TrendingDown, ArrowRight, Linkedin, Briefcase, Sparkles } from "lucide-react";
import Link from "next/link";
import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { calculateSponsorScore } from "@/lib/career/h1b/sponsorScore";

interface H1BSponsorCardProps {
    sponsor: H1BSponsor;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
    onAddToTracker: (sponsor: H1BSponsor) => void;
}

const cleanState = (loc: string) => {
    if (!loc) return "USA";
    const parts = loc.split(",");
    return parts[parts.length - 1].trim();
}

// Get score color based on value
const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20" };
    if (score >= 60) return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50 dark:bg-blue-900/20" };
    if (score >= 40) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50 dark:bg-amber-900/20" };
    return { bg: "bg-gray-400", text: "text-gray-600", light: "bg-gray-50 dark:bg-gray-800" };
};

export function H1BSponsorCard({ sponsor, isSaved, onToggleSave, onAddToTracker }: H1BSponsorCardProps) {
    const scoreData = calculateSponsorScore(sponsor);
    const scoreColors = getScoreColor(scoreData.score);
    const approvals = sponsor.approvals_2025 || 0;
    const isActivelyHiring = approvals > 0;

    return (
        <Link href={`/dashboard/career/h1b-sponsors/${sponsor.id}`} className="block">
            <div className="group relative bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-600/50 transition-all duration-300 cursor-pointer">

                {/* Top Color Bar - Visual Indicator */}
                <div className={`h-1 ${scoreColors.bg} opacity-80`} />

                <div className="p-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        {/* Company Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Logo */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm overflow-hidden">
                                {(() => {
                                    if (!sponsor.website) return null;
                                    try {
                                        // Ensure protocol exists for URL constructor
                                        const urlStr = sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`;
                                        const hostname = new URL(urlStr).hostname.replace('www.', '');
                                        return (
                                            <img
                                                src={`https://logo.clearbit.com/${hostname}`}
                                                alt={sponsor.name}
                                                className="w-full h-full object-cover p-1.5"
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    // Try Google Favicon as fallback
                                                    if (img.src.includes('clearbit')) {
                                                        img.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
                                                    } else {
                                                        // Both failed, hide image and show icon
                                                        img.style.display = 'none';
                                                        img.nextElementSibling?.classList.remove('hidden');
                                                    }
                                                }}
                                            />
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                })()}
                                <Building2 className={`w-6 h-6 text-gray-400 dark:text-gray-500 ${sponsor.website ? "hidden" : ""}`} />
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {sponsor.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <MapPin className="w-3 h-3" />
                                        {cleanState(sponsor.location)}
                                    </span>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{sponsor.industry}</span>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(sponsor.id); }}
                            className={`p-2 rounded-lg transition-all shrink-0 ${isSaved
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            title={isSaved ? "Saved" : "Save"}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                    </div>

                    {/* Stats Row - Clean and Scannable */}
                    <div className="flex items-stretch gap-3 mb-4">
                        {/* Sponsor Score */}
                        <div className={`flex-1 rounded-xl p-3 ${scoreColors.light} border border-transparent`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Sparkles className={`w-3.5 h-3.5 ${scoreColors.text}`} />
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Score</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-2xl font-bold ${scoreColors.text} dark:opacity-90`}>{scoreData.score}</span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">/100</span>
                            </div>
                        </div>

                        {/* 2025 Approvals */}
                        <div className="flex-1 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                {scoreData.trend === "Up" ? (
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                ) : scoreData.trend === "Down" ? (
                                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                ) : (
                                    <div className="w-3.5 h-3.5" />
                                )}
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">FY25Q4</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{approvals.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">visas</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                        {isActivelyHiring ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Actively Sponsoring H-1B</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/30">
                                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">No recent FY25 activity</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Primary CTA - Careers */}
                        {sponsor.website ? (
                            <a
                                href={sponsor.website}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                            >
                                View Careers
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        ) : (
                            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-medium cursor-not-allowed">
                                No Career Page
                            </div>
                        )}

                        {/* Secondary Actions */}
                        <a
                            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(sponsor.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white transition-colors shadow-md"
                            title="Find Jobs on LinkedIn"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>

                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToTracker(sponsor); }}
                            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Add to Job Tracker"
                        >
                            <Briefcase className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
