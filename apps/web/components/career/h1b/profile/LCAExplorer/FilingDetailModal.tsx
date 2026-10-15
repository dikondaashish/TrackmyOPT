"use client";

import { useEffect, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { Database } from "@/types/supabase";
import { X, MapPin, Building2, Briefcase, DollarSign, Scale, User, FileCheck, Users } from "lucide-react";

type H1BFilingRow = Database['public']['Tables']['h1b_filings']['Row'];

interface FilingDetailModalProps {
    filing: H1BFilingRow | null;
    isOpen: boolean;
    onClose: () => void;
}

type FieldValue = string | number | null | undefined;

interface Section {
    title: string;
    icon: ComponentType<{ className?: string }>;
    items: { label: string; value: FieldValue; highlight?: boolean }[];
}

function isBlank(value: FieldValue) {
    if (value === null || value === undefined) return true;
    const text = String(value).trim();
    return text === "" || text.toUpperCase() === "N/A";
}

// Joins the non-empty parts so missing columns never render as "null" or stray commas.
function joinParts(parts: FieldValue[], separator: string) {
    const present = parts.filter((part) => !isBlank(part)).map((part) => String(part).trim());
    return present.length ? present.join(separator) : null;
}

function formatPhone(phone: FieldValue, ext: FieldValue) {
    if (isBlank(phone)) return null;
    return isBlank(ext) ? String(phone) : `${phone} x${ext}`;
}

// DOL dates are date-only strings; parse them as local dates so they don't shift a day.
function formatDate(date: string | null) {
    if (!date) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    const parsed = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(date);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatCurrency(amount: number | null) {
    return amount ? `$${amount.toLocaleString()}` : null;
}

export function FilingDetailModal({ filing, isOpen, onClose }: FilingDetailModalProps) {
    const open = isOpen && !!filing;

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open, onClose]);

    if (!open || !filing || typeof document === "undefined") return null;

    // Mapped sections based on comprehensive LCA dataset
    const sections: Section[] = [
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
                { label: "Public Disclosure", value: filing.public_disclosure },
            ]
        },
        {
            title: "Compensation & Prevailing Wage",
            icon: DollarSign,
            items: [
                { label: "Wage Rate From", value: formatCurrency(filing.wage_rate_from), highlight: true },
                { label: "Wage Rate To", value: formatCurrency(filing.wage_rate_to) },
                { label: "Wage Unit", value: filing.wage_unit },
                { label: "Prevailing Wage", value: formatCurrency(filing.prevailing_wage) },
                { label: "PW Unit", value: filing.pw_unit },
                { label: "PW Wage Level", value: filing.pw_wage_level },
                { label: "PW Source", value: filing.pw_source },
                { label: "PW Source Year", value: filing.pw_source_year },
                { label: "PW Other Source", value: filing.pw_other_source },
                { label: "PW Other Year", value: filing.pw_other_year },
                { label: "PW Tracking #", value: filing.pw_tracking_number },
                { label: "PW Survey Publisher", value: filing.pw_survey_publisher },
                { label: "PW Survey Name", value: filing.pw_survey_name },
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
                { label: "H-1B Dependent", value: filing.h_1b_dependent },
                { label: "Willful Violator", value: filing.willful_violator },
                { label: "Support H-1B", value: filing.support_h1b },
                { label: "Statutory Basis", value: filing.statutory_basis },
                { label: "Appendix A Attached", value: filing.appendix_a_attached },
                { label: "Agree to LC Stmt", value: filing.agree_to_lc_statement },
            ]
        },
        {
            title: "Worker Positions",
            icon: Users,
            items: [
                { label: "Total Workers", value: filing.total_workers, highlight: true },
                { label: "New Employment", value: filing.new_employment },
                { label: "Continued Employment", value: filing.continued_employment },
                { label: "Change Previous Employment", value: filing.change_previous_employment },
                { label: "New Concurrent Employment", value: filing.new_concurrent_employment },
                { label: "Change Employer", value: filing.change_employer },
                { label: "Amended Petition", value: filing.amended_petition },
            ]
        },
        {
            title: "Worksite Information",
            icon: MapPin,
            items: [
                { label: "Address", value: joinParts([filing.worksite_address1, filing.worksite_address2], ", ") },
                { label: "City", value: filing.worksite_city },
                { label: "County", value: filing.worksite_county },
                { label: "State", value: joinParts([filing.worksite_state, filing.worksite_postal_code], " ") },
                { label: "Total Locations", value: filing.total_worksite_locations },
                { label: "Worksite Workers", value: filing.worksite_workers },
                { label: "Secondary Entity", value: filing.secondary_entity },
                { label: "Sec. Entity Name", value: filing.secondary_entity_business_name },
            ]
        },
        {
            title: "Employer Information",
            icon: Building2,
            items: [
                { label: "Name", value: filing.employer_name },
                { label: "Trade Name (DBA)", value: filing.trade_name_dba },
                { label: "FEIN", value: filing.employer_fein },
                { label: "Phone", value: formatPhone(filing.employer_phone, filing.employer_phone_ext) },
                {
                    label: "Address",
                    value: joinParts([
                        filing.employer_address1,
                        filing.employer_city,
                        joinParts([filing.employer_state, filing.employer_postal_code], " "),
                    ], ", "),
                },
                { label: "Country", value: filing.employer_country },
                { label: "Province", value: filing.employer_province },
                { label: "NAICS Code", value: filing.naics_code },
            ]
        },
        {
            title: "Employer Point of Contact",
            icon: User,
            items: [
                { label: "Name", value: filing.employer_poc_name },
                { label: "Job Title", value: filing.employer_poc_job_title },
                { label: "Email", value: filing.employer_poc_email },
                { label: "Phone", value: formatPhone(filing.employer_poc_phone, filing.employer_poc_phone_ext) },
                { label: "Address", value: joinParts([filing.employer_poc_address1, filing.employer_poc_city], ", ") },
            ]
        },
        {
            title: "Legal Representation",
            icon: Scale,
            items: [
                { label: "Law Firm", value: filing.lawfirm_name },
                { label: "Firm FEIN", value: filing.lawfirm_business_fein },
                { label: "Agent Representing", value: filing.agent_representing_employer },
                { label: "Attorney Name", value: filing.agent_attorney_name },
                { label: "Attorney Email", value: filing.agent_attorney_email },
                { label: "Attorney Phone", value: formatPhone(filing.agent_attorney_phone, filing.agent_attorney_phone_ext) },
                { label: "Attorney Address", value: joinParts([filing.agent_attorney_address1, filing.agent_attorney_city], ", ") },
                { label: "State of Highest Court", value: filing.state_of_highest_court },
                { label: "Name of Court", value: filing.name_of_highest_state_court },
            ]
        },
        {
            title: "Preparer Information",
            icon: FileCheck,
            items: [
                { label: "Name", value: joinParts([filing.preparer_first_name, filing.preparer_middle_initial, filing.preparer_last_name], " ") },
                { label: "Business Name", value: filing.preparer_business_name },
                { label: "Email", value: filing.preparer_email },
            ]
        }
    ];

    // Hide empty fields and sections instead of filling the dialog with "N/A".
    const visibleSections = sections
        .map((section) => ({ ...section, items: section.items.filter((item) => !isBlank(item.value)) }))
        .filter((section) => section.items.length > 0);

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="lca-case-details-title"
                className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 dark:border-gray-800 dark:bg-gray-900 sm:max-h-[88vh] sm:rounded-2xl sm:zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/50 sm:px-6">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h2 id="lca-case-details-title" className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">LCA Case Details</h2>
                            {filing.status && (
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${filing.status === "Certified"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    }`}>
                                    {filing.status}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 truncate font-mono text-sm text-gray-500 dark:text-gray-400">Case #: {filing.case_number}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mr-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Close LCA case details"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50/50 p-4 dark:bg-black/20 sm:p-6">
                    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                        {visibleSections.map((section) => (
                            <section key={section.title} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
                                <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-700/50">
                                    <section.icon className="h-4 w-4 shrink-0 text-blue-500" />
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                                </div>
                                <dl className="space-y-2.5">
                                    {section.items.map((item) => (
                                        <div key={item.label} className="flex flex-col gap-0.5">
                                            <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                {item.label}
                                            </dt>
                                            <dd className={`break-words text-sm ${item.highlight
                                                ? "font-semibold text-emerald-600 dark:text-emerald-400"
                                                : "text-gray-900 dark:text-gray-200"
                                                }`}>
                                                {item.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-gray-800 dark:bg-gray-900 sm:px-6">
                    <p className="text-xs italic text-gray-500 dark:text-gray-400">
                        Source: US Department of Labor LCA Disclosure Data
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 shrink-0 rounded-xl bg-gray-100 px-6 font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
