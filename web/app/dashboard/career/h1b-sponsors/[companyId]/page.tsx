"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Building2, MapPin, Globe, Briefcase, TrendingUp, DollarSign, Calendar, FileText, CheckCircle, XCircle } from "lucide-react";
import { H1BSponsor } from "@/lib/mock/h1bSponsors";
import { Database } from "@/types/supabase";

// Initialize Supabase client
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Filing {
    id: string;
    case_number: string;
    job_title: string;
    status: string;
    wage_rate_from: number | null;
    wage_rate_to: number | null;
    wage_unit: string | null;
    worksite_city: string | null;
    worksite_state: string | null;
    decision_date: string | null;
    visa_class: string | null;
}

export default function SponsorDetailPage({ params }: { params: Promise<{ companyId: string }> }) {
    const router = useRouter();
    const { companyId } = use(params); // Unwrap params
    const id = companyId; // Use companyId as id for queries

    // State
    const [sponsor, setSponsor] = useState<H1BSponsor | null>(null);
    const [filings, setFilings] = useState<Filing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);

                // 1. Fetch Sponsor Details
                const { data: sponsorData, error: sponsorError } = await supabase
                    .from("h1b_sponsors")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (sponsorError) throw sponsorError;
                if (!sponsorData) throw new Error("Sponsor not found");

                // Parse common_roles if it's a string, or use as is
                let commonRoles = [];
                if (typeof sponsorData.common_roles === 'string') {
                    try {
                        commonRoles = JSON.parse(sponsorData.common_roles);
                    } catch (e) {
                        commonRoles = [];
                    }
                } else if (Array.isArray(sponsorData.common_roles)) {
                    commonRoles = sponsorData.common_roles;
                }

                const formattedSponsor: H1BSponsor = {
                    ...sponsorData,
                    common_roles: commonRoles
                } as unknown as H1BSponsor; // Type casting for now

                setSponsor(formattedSponsor);

                // 2. Fetch Recent Filings (Limit 200)
                const { data: filingsData, error: filingsError } = await supabase
                    .from("h1b_filings")
                    .select("id, case_number, job_title, status, wage_rate_from, wage_rate_to, wage_unit, worksite_city, worksite_state, decision_date, visa_class")
                    .eq("sponsor_id", id)
                    .order("decision_date", { ascending: false })
                    .limit(200);

                if (filingsError) throw filingsError;
                setFilings(filingsData || []);

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "N/A";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !sponsor) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2 className="text-xl font-bold mb-2">Error Loading Sponsor</h2>
                <p>{error || "Sponsor not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Sponsors
            </button>

            {/* Header Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{sponsor.name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {sponsor.location}
                            </div>
                            <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {sponsor.industry}
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {sponsor.size}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400`}>
                                Strength: {sponsor.sponsorship_strength}
                            </span>
                            {sponsor.website && (
                                <a
                                    href={sponsor.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                >
                                    <Globe className="w-3 h-3" />
                                    Website
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Approvals</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {(sponsor.approvals_2021 + sponsor.approvals_2022 + sponsor.approvals_2023).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Filings Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent H-1B Filings (FY2025)</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Showing the most recent {filings.length} LCA filings
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Wage Range</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Decision Date</th>
                                <th className="px-6 py-4">Case Number</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No recent filing data available for this sponsor.
                                    </td>
                                </tr>
                            ) : (
                                filings.map((filing) => (
                                    <tr
                                        key={filing.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {filing.job_title}
                                            <div className="text-xs font-normal text-gray-500 mt-0.5">{filing.visa_class}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3 text-gray-400" />
                                                <span>{formatCurrency(filing.wage_rate_from)}</span>
                                                {filing.wage_rate_to && (
                                                    <span className="text-gray-400 mx-1">-</span>
                                                )}
                                                {filing.wage_rate_to && formatCurrency(filing.wage_rate_to)}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 capitalize">{filing.wage_unit?.toLowerCase()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                {filing.worksite_city}, {filing.worksite_state}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${filing.status === 'Certified'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {filing.status === 'Certified' ? (
                                                    <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <FileText className="w-3 h-3" />
                                                )}
                                                {filing.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                {formatDate(filing.decision_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-500">
                                            {filing.case_number}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
