"use client";
import { sanitizeUscisDescription } from '@/lib/case-status/uscis-status-text';
import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, AlertCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientDate } from "@/hooks/useClientDate";
import { daysSinceEpochMs, formatDisplayDateShort } from "@/lib/case-status/safe-dates";

interface HistoryEvent {
    status: string;
    date: string;
    description?: string;
}

interface CaseHistoryTimelineProps {
    statusHistory: HistoryEvent[];
    defaultExpanded?: boolean;
    className?: string;
}

// Get relative time label — accepts explicit `now` to avoid hydration mismatch.
function getRelativeTime(dateString: string, now: Date | null): string {
    if (!now) return "";
    const days = daysSinceEpochMs(dateString, now.getTime());
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
}

// Determine icon based on status text
function getStatusIcon(status: string | null | undefined, isFirst: boolean) {
    if (typeof status !== "string" || !status.trim()) {
        return <Clock className={`w-4 h-4 ${isFirst ? "text-white" : "text-blue-500"}`} />;
    }
    const lower = status.toLowerCase();
    if (lower.includes("approved") || lower.includes("produced")) {
        return <CheckCircle2 className={`w-4 h-4 ${isFirst ? "text-white" : "text-emerald-500"}`} />;
    }
    if (lower.includes("denied") || lower.includes("rejected")) {
        return <AlertCircle className={`w-4 h-4 ${isFirst ? "text-white" : "text-red-500"}`} />;
    }
    if (lower.includes("received") || lower.includes("accepted")) {
        return <FileCheck className={`w-4 h-4 ${isFirst ? "text-white" : "text-blue-500"}`} />;
    }
    return <Clock className={`w-4 h-4 ${isFirst ? "text-white" : "text-blue-500"}`} />;
}

export function CaseHistoryTimeline({
    statusHistory,
    defaultExpanded = false,
    className = ""
}: CaseHistoryTimelineProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    // Client-only date — null during SSR, set after hydration to avoid error #418.
    const clientNow = useClientDate();
    const safeHistory = Array.isArray(statusHistory) ? statusHistory : [];

    if (safeHistory.length === 0) {
        return null;
    }

    // Show only most recent event when collapsed, all when expanded
    const visibleHistory = isExpanded ? safeHistory : safeHistory.slice(0, 1);
    const hasMoreEvents = safeHistory.length > 1;

    return (
        <div className={`${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Case Timeline</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {safeHistory.length} update{safeHistory.length !== 1 ? 's' : ''} from USCIS
                        </p>
                </div>

                {/* Toggle Button */}
                {hasMoreEvents && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                View Full History ({safeHistory.length - 1} more)
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Connecting line */}
                {visibleHistory.length > 1 && (
                    <div className="absolute left-[15px] top-8 bottom-4 w-0.5 bg-emerald-500 rounded-full" />
                )}

                {/* Timeline Events */}
                <div className="space-y-4">
                    {visibleHistory.map((event, index) => {
                        const isFirst = index === 0;
                        const relativeTime = getRelativeTime(event.date, clientNow);

                        return (
                            <div
                                key={index}
                                className={`relative pl-10 ${
                                    !isFirst && !isExpanded ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
                                }`}
                            >
                                {/* Timeline Dot */}
                                <div
                                    className={`
                                        absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center 
                                        ${isFirst
                                            ? 'bg-emerald-500'
                                            : 'bg-white dark:bg-gray-800 border-2 border-emerald-400'
                                        }
                                    `}
                                >
                                    {getStatusIcon(event.status, isFirst)}
                                </div>

                                {/* Event Card */}
                                <div
                                    className={`
                                        p-4 rounded-lg
                                        ${isFirst
                                            ? 'bg-emerald-50 dark:bg-emerald-950'
                                            : 'bg-gray-50 dark:bg-gray-950'
                                        }
                                    `}
                                >
                                    {/* Date + Relative time */}
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span
                                            className={`
                                                text-xs font-medium px-2 py-0.5 rounded-md
                                                ${isFirst
                                                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }
                                            `}
                                        >
                                            {formatDisplayDateShort(event.date)}
                                        </span>
                                        {relativeTime && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {relativeTime}
                                            </span>
                                        )}
                                        {isFirst && (
                                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                Most recent
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Text */}
                                    <p
                                        className={`
                                            text-sm leading-relaxed
                                            ${isFirst
                                                ? 'font-semibold text-gray-800 dark:text-gray-100'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }
                                        `}
                                    >
                                        {sanitizeUscisDescription(event.description || event.status)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Collapsed State Indicator */}
                {!isExpanded && hasMoreEvents && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <span className="font-medium">+{safeHistory.length - 1} earlier updates</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
