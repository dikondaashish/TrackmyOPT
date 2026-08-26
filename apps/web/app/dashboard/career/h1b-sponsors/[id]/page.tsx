"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Building2, MapPin, Globe, Bookmark, ExternalLink, Linkedin, Star, Check,
    Scale, DollarSign, Lock
} from "lucide-react";
import { Database } from "@/types/supabase";
import type { H1BSponsor } from "@/lib/mock/h1b-sponsors";
import { calculateSponsorScore } from "@/lib/career/h1b/sponsor-score";
import { AnalyticsDashboard } from "@/components/career/h1b/profile/analytics/AnalyticsDashboard";
import { LCAFilingsTable } from "@/components/career/h1b/profile/LCAExplorer/LCAFilingsTable";
import { getLogoUrl, handleLogoError } from "@/lib/documents/image-utils";
import { Button } from "@/components/ui/button";
import { captureUpgradePromptShown } from "@/lib/posthog-client";
import { FREE_H1B_SPONSOR_LIMIT } from "@/lib/career/h1b/constants";
import { readBrowserStorage, writeBrowserStorage } from "@/lib/browser-storage";

const SAVED_SPONSORS_KEY = "trackmyopt_saved_sponsors";

function readSavedSponsorIds(): Set<string> {
    const saved = readBrowserStorage(SAVED_SPONSORS_KEY);
    if (!saved) return new Set();
    try {
        const parsed: unknown = JSON.parse(saved);
        return new Set(
            Array.isArray(parsed)
                ? parsed.filter((value): value is string => typeof value === "string")
                : []
        );
    } catch {
        return new Set();
    }
}

type H1BSponsorRow = Database['public']['Tables']['h1b_sponsors']['Row'];
type H1BFilingRow = Database['public']['Tables']['h1b_filings']['Row'];

// Get score color based on value
const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20" };
    if (score >= 60) return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50 dark:bg-blue-900/20" };
    if (score >= 40) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50 dark:bg-amber-900/20" };
    return { bg: "bg-gray-400", text: "text-gray-600", light: "bg-gray-50 dark:bg-gray-800" };
};

export default function CompanyProfilePage() {
    const params = useParams();
    const sponsorId = params.id as string;

    const [sponsor, setSponsor] = useState<H1BSponsorRow | null>(null);
    const [filings, setFilings] = useState<H1BFilingRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setIsLocked(false);
            try {
                const response = await fetch(`/api/career/h1b-sponsors/${sponsorId}`, {
                    credentials: "include",
                });

                if (response.status === 402) {
                    setIsLocked(true);
                    setSponsor(null);
                    setFilings([]);
                    captureUpgradePromptShown({ source: "h1b_limit" });
                    return;
                }

                if (!response.ok) {
                    console.error("Error fetching sponsor:", response.status);
                    setSponsor(null);
                    return;
                }

                const payload = await response.json();
                setSponsor(payload.sponsor as H1BSponsorRow);
                setFilings((payload.filings ?? []) as H1BFilingRow[]);

                setIsSaved(readSavedSponsorIds().has(sponsorId));
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (sponsorId) {
            fetchData();
        }
    }, [sponsorId]);

    const toggleSave = () => {
        const savedSet = readSavedSponsorIds();

        if (savedSet.has(sponsorId)) {
            savedSet.delete(sponsorId);
            setIsSaved(false);
        } else {
            savedSet.add(sponsorId);
            setIsSaved(true);
        }

        writeBrowserStorage(SAVED_SPONSORS_KEY, JSON.stringify(Array.from(savedSet)));
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="text-center py-20 space-y-6">
                <div className="inline-flex p-4 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    <Lock className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Pro unlocks full sponsor profiles
                    </h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Free includes the top {FREE_H1B_SPONSOR_LIMIT} sponsors by approval volume. Upgrade to browse every company profile and LCA history.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button asChild>
                        <Link href="/premium/checkout?planId=pro&interval=year">Upgrade to Pro</Link>
                    </Button>
                    <Link href="/dashboard/career/h1b-sponsors" className="text-blue-600 hover:underline text-sm">
                        ← Back to top sponsors
                    </Link>
                </div>
            </div>
        );
    }

    if (!sponsor) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Company Not Found</h2>
                <p className="text-gray-500 mb-4">The sponsor you're looking for doesn't exist.</p>
                <Link href="/dashboard/career/h1b-sponsors" className="text-blue-600 hover:underline">
                    ← Back to Sponsors
                </Link>
            </div>
        );
    }

    // Calculate stats
    const scoreData = calculateSponsorScore({
        id: sponsor.id,
        name: sponsor.name,
        industry: sponsor.industry ?? "",
        size: (sponsor.size ?? "Mid") as H1BSponsor["size"],
        location: sponsor.location ?? "",
        website: sponsor.website ?? "",
        approvals_2021: sponsor.approvals_2021 ?? 0,
        approvals_2022: sponsor.approvals_2022 ?? 0,
        approvals_2023: sponsor.approvals_2023 ?? 0,
        approvals_2024: sponsor.approvals_2024 ?? undefined,
        approvals_2025: sponsor.approvals_2025 ?? undefined,
        sponsorship_strength: (sponsor.sponsorship_strength ?? "Medium") as H1BSponsor["sponsorship_strength"],
        common_roles: (sponsor.common_roles ?? []) as string[],
    });
    const scoreColors = getScoreColor(scoreData.score);

    // Get worksite locations
    const worksiteLocations = filings.reduce((acc, f) => {
        const key = `${f.worksite_city}, ${f.worksite_state}`;
        if (f.worksite_city && f.worksite_state) {
            acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedLocations = Object.entries(worksiteLocations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // Intelligence Data Read Directly From Database
    // These fields were backfilled and are now persistent
    const topLawFirm = sponsor.top_law_firm;
    const isEntryLevelHeavy = (sponsor.entry_level_percent || 0) > 0.7;
    const isVirtualOffice = sponsor.is_virtual_office;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Back Link */}
            <Link
                href="/dashboard/career/h1b-sponsors"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Sponsors
            </Link>

            {/* Company Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm overflow-hidden">
                            {(() => {
                                if (!sponsor.website) return null;
                                try {
                                    const urlStr = sponsor.website.startsWith('http') ? sponsor.website : `https://${sponsor.website}`;
                                    const hostname = new URL(urlStr).hostname.replace('www.', '');
                                    const initialSrc = getLogoUrl(hostname);

                                    return (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={initialSrc}
                                            alt={sponsor.name}
                                            className="w-full h-full object-cover p-2"
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                const fallback = handleLogoError(img.src, hostname);
                                                if (fallback) {
                                                    img.src = fallback;
                                                } else {
                                                    // Both failed, hide image and show icon
                                                    img.style.display = 'none';
                                                    img.nextElementSibling?.classList.remove('hidden');
                                                }
                                            }}
                                        />
                                    );
                                } catch (_e) {
                                    return null;
                                }
                            })()}
                            <Building2 className={`w-8 h-8 text-gray-400 ${sponsor.website ? "hidden" : ""}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sponsor.name}</h1>
                            <div className="flex max-md:flex-col max-md:items-start max-md:gap-1 items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {sponsor.location}
                                </span>
                                <span className="max-md:hidden">•</span>
                                <span>{sponsor.industry}</span>
                                <span className="max-md:hidden">•</span>
                                <span className="capitalize">{sponsor.size}</span>
                            </div>

                            {/* Virtual Office Warning */}
                            {isVirtualOffice && (
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    <Building2 className="w-4 h-4 shrink-0" />
                                    <span className="text-xs font-semibold">
                                        Potential Virtual Office / Cluster Address
                                    </span>
                                </div>
                            )}

                            {/* Intelligence Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {topLawFirm && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                                        <Scale className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">Rep: {topLawFirm}</span>
                                    </div>
                                )}
                                {isEntryLevelHeavy && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">Entry-Level Focus</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex max-md:flex-wrap max-md:w-full items-center gap-3">
                        {/* Score Badge */}
                        <div className={`${scoreColors.light} rounded-xl px-4 py-2 border border-transparent`}>
                            <div className="flex items-center gap-2">
                                <Star className={`w-5 h-5 ${scoreColors.text}`} />
                                <span className={`text-2xl font-bold ${scoreColors.text}`}>{scoreData.score}</span>
                                <span className="text-sm text-gray-500">/100</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={toggleSave}
                            className={`p-3 rounded-xl transition-all ${isSaved
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                }`}
                        >
                            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                        </button>

                        <a
                            href={sponsor.careers_url || `https://www.google.com/search?q=${encodeURIComponent(sponsor.name + " careers")}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`max-md:flex-1 max-md:justify-center flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${sponsor.careers_url
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {sponsor.careers_url ? <Check className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            Careers
                            {!sponsor.careers_url && <ExternalLink className="w-4 h-4" />}
                        </a>

                        <a
                            href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(sponsor.name)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white transition-colors"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="space-y-6">
                <AnalyticsDashboard filings={filings} />
            </div>

            {/* Approval History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">H-1B Approval History</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Q1 FY2025", count: 0 },
                        { label: "Q2 FY2025", count: 0 },
                        { label: "Q3 FY2025", count: 0 },
                        { label: "Q4 FY2025", count: sponsor.approvals_2025 ?? 0 },
                    ].map((item) => (
                        <div key={item.label} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{item.count.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* LCA Filings Explorer */}
            <div className="min-h-[600px]">
                <LCAFilingsTable filings={filings} />
            </div>

            {/* Worksite Locations */}
            {sortedLocations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Worksite Locations</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {sortedLocations.map(([location, count]) => (
                            <div key={location} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{location}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Common Roles */}
            {sponsor.common_roles && Array.isArray(sponsor.common_roles) && (sponsor.common_roles as string[]).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Common Roles</h2>
                    <div className="flex flex-wrap gap-2">
                        {(sponsor.common_roles as string[]).map((role, idx) => (
                            <span key={idx} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
