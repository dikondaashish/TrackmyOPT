"use client";

import { Database } from "@/types/supabase";
import { X, Calendar, MapPin, Building2, Briefcase, DollarSign, Scale, User, FileCheck } from "lucide-react";

type H1BFilingRow = Database['public']['Tables']['h1b_filings']['Row'];

interface FilingDetailModalProps {
    filing: H1BFilingRow | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FilingDetailModal({ filing, isOpen, onClose }: FilingDetailModalProps) {
    if (!isOpen || !filing) return null;

    const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString() : "N/A";
    const formatCurrency = (amount: number | null) => amount ? `$${amount.toLocaleString()}` : "N/A";

    const sections: {
        title: string;
        icon: any;
        items: { label: string; value: string | null | number; highlight?: boolean }[];
    }[] = [
            {
                title: "Case Overview",
                icon: FileCheck,
                items: [
                    { label: "Case Number", value: filing.case_number },
                    { label: "Status", value: filing.status, highlight: true },
                    { label: "Visa Class", value: filing.visa_class },
                    { label: "Received Date", value: formatDate(filing.received_date) },
                    { label: "Decision Date", value: formatDate(filing.decision_date) },
                    { label: "Original Cert Date", value: formatDate(filing.original_cert_date) },
                    { label: "Begin Date", value: formatDate(filing.begin_date) },
                    { label: "End Date", value: formatDate(filing.end_date) },
                ]
            },
            {
                title: "Job Details",
                icon: Briefcase,
                items: [
                    { label: "Job Title", value: filing.job_title },
                    { label: "SOC Code", value: filing.soc_code },
                    { label: "SOC Title", value: filing.soc_title },
                    { label: "Full Time Position", value: filing.full_time_position },
                    { label: "Total Worker Positions", value: filing.total_workers },
                    { label: "New Employment", value: filing.total_workers }, // Simplification
                ]
            },
            {
                title: "Compensation",
                icon: DollarSign,
                items: [
                    { label: "Wage Rate From", value: formatCurrency(filing.wage_rate_from) },
                    { label: "Wage Rate To", value: formatCurrency(filing.wage_rate_to) },
                    { label: "Wage Unit", value: filing.wage_unit },
                    { label: "Prevailing Wage", value: formatCurrency(filing.prevailing_wage) },
                    { label: "PW Source", value: filing.pw_source },
                    { label: "PW Source Year", value: filing.pw_source_year },
                    { label: "PW Wage Level", value: filing.pw_wage_level },
                ]
            },
            {
                title: "Worksite Location",
                icon: MapPin,
                items: [
                    { label: "Address 1", value: filing.worksite_address1 },
                    { label: "Address 2", value: filing.worksite_address2 },
                    { label: "City", value: filing.worksite_city },
                    { label: "State", value: filing.worksite_state },
                    { label: "County", value: filing.worksite_county },
                    { label: "Postal Code", value: filing.worksite_postal_code },
                ]
            },
            {
                title: "Employer Information",
                icon: Building2,
                items: [
                    { label: "Employer Name", value: filing.employer_name },
                    { label: "Trade Name (DBA)", value: filing.employer_name }, // Using name as fallback if dba missing in schema or same
                    { label: "Address 1", value: filing.employer_address1 },
                    { label: "City", value: filing.employer_city },
                    { label: "State", value: filing.employer_state },
                    { label: "Postal Code", value: filing.employer_postal_code },
                    { label: "Country", value: filing.employer_country },
                    { label: "Phone", value: filing.employer_phone },
                ]
            },
            {
                title: "Employer Point of Contact",
                icon: User,
                items: [
                    { label: "Name", value: filing.employer_poc_name },
                    { label: "Email", value: filing.employer_poc_email },
                ]
            },
            {
                title: "Legal Representation",
                icon: Scale,
                items: [
                    { label: "Law Firm", value: filing.lawfirm_name },
                    { label: "Attorney Name", value: filing.agent_attorney_name },
                    { label: "Attorney Email", value: filing.agent_attorney_email },
                ]
            }
        ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">LCA Case Details</h2>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${filing.status === "Certified"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                }`}>
                                {filing.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">Case #: {filing.case_number}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-black/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map((section) => (
                            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm break-inside-avoid">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                                    <section.icon className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                                </div>
                                <div className="space-y-3">
                                    {section.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col gap-0.5">
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                {item.label}
                                            </span>
                                            <span className={`text-sm ${item.highlight
                                                ? "font-semibold text-emerald-600 dark:text-emerald-400"
                                                : "text-gray-900 dark:text-gray-200"
                                                }`}>
                                                {item.value || "N/A"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

