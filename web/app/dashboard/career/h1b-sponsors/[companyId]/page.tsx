"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Briefcase, Globe, TrendingUp, Star, Plus, ExternalLink, Users } from "lucide-react";
import { getSponsorById, H1BSponsor, getTotalApprovals } from "@/lib/mock/h1bSponsors";

// LocalStorage key for saved sponsors
const SAVED_SPONSORS_KEY = "trackmyopt_saved_sponsors";

export default function CompanyDetailsPage() {
    const params = useParams();
    const companyId = params.companyId as string;
    const [sponsor, setSponsor] = useState<H1BSponsor | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const found = getSponsorById(companyId);
        setSponsor(found || null);

        // Check if saved
        try {
            const saved = localStorage.getItem(SAVED_SPONSORS_KEY);
            if (saved) {
                const savedIds = JSON.parse(saved) as string[];
                setIsSaved(savedIds.includes(companyId));
            }
        } catch (e) {
            console.error("Failed to load saved status:", e);
        }

        setIsLoading(false);
    }, [companyId]);

    const handleToggleSave = () => {
        try {
            const saved = localStorage.getItem(SAVED_SPONSORS_KEY);
            let savedIds: string[] = saved ? JSON.parse(saved) : [];

            if (isSaved) {
                savedIds = savedIds.filter(id => id !== companyId);
            } else {
                savedIds.push(companyId);
            }

            localStorage.setItem(SAVED_SPONSORS_KEY, JSON.stringify(savedIds));
            setIsSaved(!isSaved);
        } catch (e) {
            console.error("Failed to toggle save:", e);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            </div>
        );
    }

    if (!sponsor) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sponsor Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">The company you're looking for doesn't exist in our database.</p>
                <Link href="/dashboard/career/h1b-sponsors" className="text-blue-600 hover:underline">
                    ← Back to H-1B Sponsor Database
                </Link>
            </div>
        );
    }

    const totalApprovals = getTotalApprovals(sponsor);

    const strengthColors = {
        High: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        Low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    };

    return (
        <div className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Link */}
                <Link
                    href="/dashboard/career/h1b-sponsors"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to H-1B Sponsor Database
                </Link>

                {/* Company Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />

                    <div className="relative z-10">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Building2 className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{sponsor.name}</h1>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm">
                                        <Briefcase className="w-4 h-4" />
                                        {sponsor.industry}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {sponsor.location}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm">
                                        <Users className="w-4 h-4" />
                                        {sponsor.size}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${strengthColors[sponsor.sponsorship_strength]}`}>
                                        {sponsor.sponsorship_strength} Sponsor
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleToggleSave}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${isSaved
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <Star className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                        {isSaved ? "Saved" : "Save Sponsor"}
                    </button>

                    <button
                        onClick={() => {/* TODO: Add to Job Tracker */ }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add to Job Tracker
                    </button>

                    <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:shadow-lg transition-all"
                    >
                        <Globe className="w-5 h-5" />
                        Visit Website
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* Sponsor Overview Card */}
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Sponsor Overview
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Industry</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{sponsor.industry}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">HQ Location</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{sponsor.location}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Company Size</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{sponsor.size}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sponsorship Strength</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{sponsor.sponsorship_strength}</p>
                        </div>
                    </div>
                </div>

                {/* H-1B Sponsorship History */}
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        H-1B Sponsorship History
                    </h2>

                    <div className="space-y-4">
                        {/* Total */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">Total Approvals (3 Years)</span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalApprovals.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Year by Year */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">2023</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{sponsor.approvals_2023.toLocaleString()}</p>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                        style={{ width: `${(sponsor.approvals_2023 / Math.max(sponsor.approvals_2021, sponsor.approvals_2022, sponsor.approvals_2023)) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">2022</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{sponsor.approvals_2022.toLocaleString()}</p>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                                        style={{ width: `${(sponsor.approvals_2022 / Math.max(sponsor.approvals_2021, sponsor.approvals_2022, sponsor.approvals_2023)) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">2021</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{sponsor.approvals_2021.toLocaleString()}</p>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
                                        style={{ width: `${(sponsor.approvals_2021 / Math.max(sponsor.approvals_2021, sponsor.approvals_2022, sponsor.approvals_2023)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Common Roles Sponsored */}
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                        Common Roles Sponsored
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {sponsor.common_roles.map((role, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    Data based on DOL LCA disclosure records. Numbers represent certified LCA applications.
                </div>
            </div>
        </div>
    );
}
