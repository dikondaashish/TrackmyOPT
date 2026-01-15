"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
    ArrowLeft, Building2, MapPin, Globe, Bookmark, ExternalLink, Linkedin, Sparkles
} from "lucide-react";
import { Database } from "@/types/supabase";
import { calculateSponsorScore } from "@/lib/career/h1b/sponsorScore";
import { AnalyticsDashboard } from "@/components/career/h1b/profile/analytics/AnalyticsDashboard";
import { LCAFilingsTable } from "@/components/career/h1b/profile/LCAExplorer/LCAFilingsTable";

type H1BSponsorRow = Database['public']['Tables']['h1b_sponsors']['Row'];
type H1BFilingRow = Database['public']['Tables']['h1b_filings']['Row'];

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                // Fetch sponsor details
                const { data: sponsorData, error: sponsorError } = await supabase
                    .from('h1b_sponsors')
                    .select('*')
                    .eq('id', sponsorId)
                    .single();

                if (sponsorError) {
                    console.error("Error fetching sponsor:", sponsorError);
                    return;
                }
                setSponsor(sponsorData);

                // Fetch related LCA filings
                let filingsData: H1BFilingRow[] = [];

                // 1. Try by sponsor_id
                const { data: byId, error: byIdError } = await supabase
                    .from('h1b_filings')
                    .select('*')
                    .eq('sponsor_id', sponsorId)
                    .order('received_date', { ascending: false })
                    .limit(500);

                if (byId && byId.length > 0) {
                    filingsData = byId;
                } else {
                    // 2. Fallback: Try by employer name (exact match)
                    if (sponsorData.name) {
                        const { data: byName, error: byNameError } = await supabase
                            .from('h1b_filings')
                            .select('*')
                            .eq('employer_name', sponsorData.name)
                            .order('received_date', { ascending: false })
                            .limit(500);

                        if (byName && byName.length > 0) {
                            filingsData = byName;
                        } else {
                            // 3. Fallback: Case-insensitive search
                            const { data: byNameLike, error: byNameLikeError } = await supabase
                                .from('h1b_filings')
                                .select('*')
                                .ilike('employer_name', sponsorData.name)
                                .order('received_date', { ascending: false })
                                .limit(500);

                            if (byNameLike) filingsData = byNameLike;
                        }
                    }
                }

                setFilings(filingsData || []);

                // Check if saved
                const saved = localStorage.getItem("trackmyopt_saved_sponsors");
                if (saved) {
                    const savedSet = new Set(JSON.parse(saved));
                    setIsSaved(savedSet.has(sponsorId));
                }
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
        const saved = localStorage.getItem("trackmyopt_saved_sponsors");
        const savedSet = new Set(saved ? JSON.parse(saved) : []);

        if (savedSet.has(sponsorId)) {
            savedSet.delete(sponsorId);
            setIsSaved(false);
        } else {
            savedSet.add(sponsorId);
            setIsSaved(true);
        }

        localStorage.setItem("trackmyopt_saved_sponsors", JSON.stringify(Array.from(savedSet)));
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
        industry: sponsor.industry,
        size: sponsor.size as any,
        location: sponsor.location,
        website: sponsor.website,
        approvals_2021: sponsor.approvals_2021,
        approvals_2022: sponsor.approvals_2022,
        approvals_2023: sponsor.approvals_2023,
        approvals_2024: sponsor.approvals_2024,
        approvals_2025: sponsor.approvals_2025,
        sponsorship_strength: sponsor.sponsorship_strength as any,
        common_roles: sponsor.common_roles as string[],
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
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                            <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sponsor.name}</h1>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {sponsor.location}
                                </span>
                                <span>•</span>
                                <span>{sponsor.industry}</span>
                                <span>•</span>
                                <span className="capitalize">{sponsor.size}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Score Badge */}
                        <div className={`${scoreColors.light} rounded-xl px-4 py-2 border border-transparent`}>
                            <div className="flex items-center gap-2">
                                <Sparkles className={`w-5 h-5 ${scoreColors.text}`} />
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

                        {sponsor.website && (
                            <a
                                href={sponsor.website}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                Visit Careers
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}

                        <a
                            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(sponsor.name)}`}
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
                <div className="grid grid-cols-5 gap-4">
                    {[
                        { year: "2021", count: sponsor.approvals_2021 },
                        { year: "2022", count: sponsor.approvals_2022 },
                        { year: "2023", count: sponsor.approvals_2023 },
                        { year: "2024", count: sponsor.approvals_2024 },
                        { year: "2025", count: sponsor.approvals_2025 },
                    ].map((item) => (
                        <div key={item.year} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">FY{item.year}</p>
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
