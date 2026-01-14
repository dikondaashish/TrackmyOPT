"use client";

import { Building2, MapPin, Globe, Bookmark, TrendingUp, TrendingDown, Minus, ExternalLink, Linkedin, ArrowRight, Briefcase } from "lucide-react";
import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { calculateSponsorScore } from "@/lib/career/h1b/sponsorScore";
import { SponsorScoreBadge } from "./SponsorScoreBadge";

interface H1BSponsorCardProps {
    sponsor: H1BSponsor;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
    onAddToTracker: (sponsor: H1BSponsor) => void;
}

// Mock top locations helper
const getMockTopLocations = (state: string) => {
    // Return random locations for MVP visual
    const locs = [
        { state: "TX", count: Math.floor(Math.random() * 50) + 10 },
        { state: "CA", count: Math.floor(Math.random() * 40) + 5 },
        { state: "NY", count: Math.floor(Math.random() * 30) + 5 },
    ];
    // Ensure the sponsor's main state is first
    return [
        { state: cleanState(state), count: Math.floor(Math.random() * 100) + 20 },
        ...locs.filter(l => l.state !== cleanState(state)).slice(0, 2)
    ];
};

const cleanState = (loc: string) => {
    // Normalize "NJ" or "EAST BRUNSWICK, NJ" -> "NJ"
    if (!loc) return "USA";
    const parts = loc.split(",");
    return parts[parts.length - 1].trim();
}

export function H1BSponsorCard({ sponsor, isSaved, onToggleSave, onAddToTracker }: H1BSponsorCardProps) {
    const scoreData = calculateSponsorScore(sponsor);
    const topLocations = getMockTopLocations(sponsor.location);

    // Hiring Status Badge Logic
    const isHiring = (sponsor.approvals_2025 || 0) > 0;

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300">
            {/* Hiring Badge */}
            <div className="absolute top-5 right-5 z-10">
                {isHiring ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Hiring Now (FY25)
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        <Minus className="w-3 h-3" />
                        Not Active Recently
                    </span>
                )}
            </div>

            <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Logo / Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {sponsor.logo ? (
                            <img src={sponsor.logo} alt={sponsor.name} className="w-8 h-8 object-contain" />
                        ) : (
                            <Building2 className="w-7 h-7 text-gray-400 dark:text-gray-600" />
                        )}
                    </div>

                    <div className="flex-1 pr-24"> {/* Padding for badge */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                            {sponsor.name}
                        </h3>

                        <div className="flex flex-wrap gap-y-2 mt-1">
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {cleanState(sponsor.location)}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span>{sponsor.industry}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Intelligence Grid */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    {/* Left: Score & Stats */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">Sponsor Score</span>
                            <SponsorScoreBadge scoreData={scoreData} />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs text-gray-500">2025 Approvals</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {(sponsor.approvals_2025 || 0).toLocaleString()}
                                    </span>
                                    {/* Trend Icon */}
                                    {scoreData.trend === "Up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                                    {scoreData.trend === "Down" && <TrendingDown className="w-3 h-3 text-red-500" />}
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${scoreData.trend === 'Up' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(100, ((sponsor.approvals_2025 || 0) / 100) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Top Locations MVP */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                        <span className="text-xs font-medium text-gray-500 block mb-2">Top Locations</span>
                        <div className="flex flex-wrap gap-2">
                            {topLocations.map((loc, i) => (
                                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                                    {loc.state} <span className="ml-1 text-gray-400">({loc.count})</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onToggleSave(sponsor.id)}
                            className={`p-2 rounded-lg transition-colors ${isSaved
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-gray-50 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
                                }`}
                            title={isSaved ? "Remove from Saved" : "Save Sponsor"}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                        </button>

                        <button
                            onClick={() => onAddToTracker(sponsor)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            title="Add to Job Tracker"
                        >
                            <Briefcase className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(sponsor.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                            title="Search LinkedIn Jobs"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>

                        {sponsor.website ? (
                            <a
                                href={sponsor.website}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-gray-500/20"
                            >
                                Careers
                                <ArrowRight className="w-3 h-3" />
                            </a>
                        ) : (
                            <span className="text-xs text-gray-400 italic px-2">No site</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
