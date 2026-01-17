"use client";

import { useState, useMemo } from "react";
import { JobApplication, JobStage } from "@/lib/career/job-tracker/types";
import { CompanyLogo } from "./CompanyLogo";
import { cn } from "@/lib/utils";
import {
    ExternalLink,
    ChevronUp,
    ChevronDown,
    Edit2,
    Trash2,
    Check,
    X,
    Award
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { getRelativeDate, getFollowupBadgeInfo } from "@/lib/career/job-tracker/filtering";

interface JobTrackerTableViewProps {
    applications: JobApplication[];
    onCardClick: (app: JobApplication) => void;
    onStageChange?: (appId: string, newStage: JobStage) => void;
    onDelete?: (appId: string) => void;
}

type SortField = "company" | "role" | "stage" | "location" | "applied" | "followup" | "interviews";
type SortDirection = "asc" | "desc";

const STAGES: JobStage[] = [
    "Wishlist",
    "Applied",
    "Recruiter Screen",
    "Interviewing",
    "Final Round",
    "Offer",
    "Rejected"
];

const STAGE_COLORS: Record<JobStage, string> = {
    "Wishlist": "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    "Applied": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    "Recruiter Screen": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
    "Interviewing": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    "Final Round": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    "Offer": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    "Rejected": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
};

export function JobTrackerTableView({
    applications,
    onCardClick,
    onStageChange,
    onDelete
}: JobTrackerTableViewProps) {
    const [sortField, setSortField] = useState<SortField>("applied");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [editingStage, setEditingStage] = useState<string | null>(null);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedApplications = useMemo(() => {
        return [...applications].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "company":
                    comparison = a.company_name.localeCompare(b.company_name);
                    break;
                case "role":
                    comparison = a.role_title.localeCompare(b.role_title);
                    break;
                case "stage":
                    comparison = STAGES.indexOf(a.status as JobStage) - STAGES.indexOf(b.status as JobStage);
                    break;
                case "location":
                    comparison = (a.location || "").localeCompare(b.location || "");
                    break;
                case "applied":
                    comparison = new Date(a.applied_at || 0).getTime() - new Date(b.applied_at || 0).getTime();
                    break;
                case "followup":
                    comparison = new Date(a.next_follow_up_at || 0).getTime() - new Date(b.next_follow_up_at || 0).getTime();
                    break;
                case "interviews":
                    const aInterviews = (a as any).job_interviews || (a as any).interviews || [];
                    const bInterviews = (b as any).job_interviews || (b as any).interviews || [];
                    comparison = aInterviews.length - bInterviews.length;
                    break;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [applications, sortField, sortDirection]);

    const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <th
            onClick={() => handleSort(field)}
            className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        >
            <div className="flex items-center gap-1">
                {children}
                {sortField === field && (
                    sortDirection === "asc"
                        ? <ChevronUp className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />
                )}
            </div>
        </th>
    );

    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-4">
                    <span className="text-3xl">📊</span>
                </div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">No applications yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                    Add your first job application to see it here
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortHeader field="company">Company</SortHeader>
                            <SortHeader field="role">Role</SortHeader>
                            <SortHeader field="stage">Stage</SortHeader>
                            <SortHeader field="location">Location</SortHeader>
                            <SortHeader field="applied">Applied</SortHeader>
                            <SortHeader field="followup">Follow-up</SortHeader>
                            <SortHeader field="interviews">Interviews</SortHeader>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {sortedApplications.map((app) => {
                            const followupBadge = app.next_follow_up_at
                                ? getFollowupBadgeInfo(app.next_follow_up_at)
                                : null;
                            const isOffer = app.status === "Offer";

                            return (
                                <tr
                                    key={app.id}
                                    onClick={() => onCardClick(app)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                                >
                                    {/* Company */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <CompanyLogo
                                                companyName={app.company_name}
                                                jobUrl={app.job_url}
                                                size="sm"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {app.company_name}
                                                </p>
                                                {(app as any).sponsor_h1b && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                                                        <Award className="w-2.5 h-2.5" />
                                                        H-1B
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                                            {app.role_title}
                                        </p>
                                    </td>

                                    {/* Stage - Inline Editable */}
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        {editingStage === app.id ? (
                                            <select
                                                value={app.status}
                                                onChange={(e) => {
                                                    onStageChange?.(app.id, e.target.value as JobStage);
                                                    setEditingStage(null);
                                                }}
                                                onBlur={() => setEditingStage(null)}
                                                autoFocus
                                                className="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                {STAGES.map(stage => (
                                                    <option key={stage} value={stage}>{stage}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span
                                                onClick={() => setEditingStage(app.id)}
                                                className={cn(
                                                    "inline-block px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer hover:ring-2 hover:ring-blue-400",
                                                    STAGE_COLORS[app.status as JobStage]
                                                )}
                                            >
                                                {app.status}
                                            </span>
                                        )}
                                    </td>

                                    {/* Location */}
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                            {app.location || "—"}
                                        </p>
                                    </td>

                                    {/* Applied Date */}
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {app.applied_at
                                                ? format(parseISO(app.applied_at), "MMM d, yyyy")
                                                : "—"
                                            }
                                        </p>
                                    </td>

                                    {/* Follow-up */}
                                    <td className="px-4 py-3">
                                        {app.next_follow_up_at ? (
                                            <span className={cn(
                                                "text-sm",
                                                followupBadge?.variant === "overdue" && "text-red-500 font-medium",
                                                followupBadge?.variant === "today" && "text-amber-600 font-medium",
                                                followupBadge?.variant === "soon" && "text-yellow-600",
                                                followupBadge?.variant === "none" && "text-gray-500 dark:text-gray-400"
                                            )}>
                                                {getRelativeDate(app.next_follow_up_at)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </td>

                                    {/* Interviews Count */}
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {((app as any).job_interviews || (app as any).interviews || []).length}
                                        </span>
                                    </td>

                                    {/* Offer Status */}
                                    <td className="px-4 py-3">
                                        {isOffer ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                                <Check className="w-3 h-3" />
                                                Offer
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">—</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            {app.job_url && (
                                                <a
                                                    href={app.job_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => onCardClick(app)}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {onDelete && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Delete this application?")) {
                                                            onDelete(app.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
