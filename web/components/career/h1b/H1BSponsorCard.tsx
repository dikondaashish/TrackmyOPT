"use client";

import { Building2, MapPin, Briefcase, TrendingUp, Star, Plus, ExternalLink, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { H1BSponsor, getTotalApprovals } from "@/lib/mock/h1bSponsors";

interface H1BSponsorCardProps {
    sponsor: H1BSponsor;
    isSaved: boolean;
    onToggleSave: (id: string) => void;
}

export function H1BSponsorCard({ sponsor, isSaved, onToggleSave }: H1BSponsorCardProps) {
    const router = useRouter();
    const totalApprovals = getTotalApprovals(sponsor);

    const strengthColors = {
        High: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
        Low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Top gradient accent */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="p-5">
                {/* Header: Logo + Name + Tags */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Company Logo Placeholder */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Building2 className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            className="text-lg font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => router.push(`/dashboard/career/h1b-sponsors/${sponsor.id}`)}
                        >
                            {sponsor.name}
                        </h3>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                                <TrendingUp className="w-3 h-3" />
                                H-1B Sponsor
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                <Briefcase className="w-3 h-3" />
                                {sponsor.industry}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                <MapPin className="w-3 h-3" />
                                {sponsor.location}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${strengthColors[sponsor.sponsorship_strength]}`}>
                                {sponsor.sponsorship_strength}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sponsorship Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{totalApprovals.toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">2025</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(sponsor.approvals_2025 || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">2024</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(sponsor.approvals_2024 || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center border-l border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">2023</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{sponsor.approvals_2023.toLocaleString()}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onToggleSave(sponsor.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSaved
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        <Star className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                        {isSaved ? "Saved" : "Save"}
                    </button>

                    <button
                        onClick={() => {/* TODO: Add to Job Tracker */ }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add to Tracker
                    </button>

                    <button
                        onClick={() => router.push(`/dashboard/career/h1b-sponsors/${sponsor.id}`)}
                        className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-all"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:shadow-lg transition-all"
                    >
                        Apply Now
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
