"use client";

import { useState } from "react";
import { Database } from "@/types/supabase";
import { ChevronLeft, ChevronRight, Search, Filter, ArrowUpDown, Lightbulb } from "lucide-react";
import { FilingDetailModal } from "./FilingDetailModal";

type H1BFilingRow = Database['public']['Tables']['h1b_filings']['Row'];

interface LCAFilingsTableProps {
    filings: H1BFilingRow[];
}

export function LCAFilingsTable({ filings }: LCAFilingsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFiling, setSelectedFiling] = useState<H1BFilingRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const itemsPerPage = 10;

    // Filter filings
    const filteredFilings = filings.filter(f =>
        (f.job_title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (f.case_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (f.worksite_city?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredFilings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFilings = filteredFilings.slice(startIndex, startIndex + itemsPerPage);

    const handleRowClick = (filing: H1BFilingRow) => {
        setSelectedFiling(filing);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col h-full">
            {/* Header / Controls */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">LCA Filings Explorer</h2>
                    <p className="text-sm text-gray-500 mb-2">
                        Showing {filteredFilings.length} filings
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-xs text-amber-800 dark:text-amber-200">
                        <Lightbulb className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                        <p><strong>Pro Tip:</strong> The <strong>Hiring Manager's</strong> name is often listed in <strong>Section J</strong> or "Employer Point of Contact".</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search job title, case #..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                        <tr>
                            {[
                                "Job Title",
                                "Wage Range",
                                "Location",
                                "Status",
                                "Received Date"
                            ].map((header) => (
                                <th key={header} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedFilings.length > 0 ? (
                            paginatedFilings.map((filing) => (
                                <tr
                                    key={filing.id}
                                    onClick={() => handleRowClick(filing)}
                                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {filing.job_title || "N/A"}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono">{filing.case_number}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {filing.wage_rate_from
                                                    ? `$${(filing.wage_rate_from / 1000).toFixed(0)}k`
                                                    : "N/A"}
                                                {filing.wage_rate_to && ` - $${(filing.wage_rate_to / 1000).toFixed(0)}k`}
                                            </span>
                                            <span className="text-xs text-gray-500">{filing.wage_unit || "Year"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate max-w-[150px]">{filing.worksite_city}, {filing.worksite_state}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${filing.status === "Certified"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                            : filing.status === "Denied"
                                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                            }`}>
                                            {filing.status === "Certified" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
                                            {filing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                                        {filing.received_date ? new Date(filing.received_date).toLocaleDateString() : "N/A"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No filings found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            )}

            <FilingDetailModal
                filing={selectedFiling}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
