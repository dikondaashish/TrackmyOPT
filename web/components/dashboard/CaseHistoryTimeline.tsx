"use client";
import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Format date for display
function formatDateShort(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

export function CaseHistoryTimeline({
    statusHistory,
    defaultExpanded = false,
    className = ""
}: CaseHistoryTimelineProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    if (!statusHistory || statusHistory.length === 0) {
        return null;
    }

    // Show only most recent event when collapsed, all when expanded
    const visibleHistory = isExpanded ? statusHistory : statusHistory.slice(0, 1);
    const hasMoreEvents = statusHistory.length > 1;

    return (
        <div className={`${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Case Timeline</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {statusHistory.length} update{statusHistory.length !== 1 ? 's' : ''} from USCIS
                        </p>
                    </div>
                </div>

                {/* Toggle Button */}
                {hasMoreEvents && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                View Full History ({statusHistory.length - 1} more)
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Connecting Line */}
                {visibleHistory.length > 1 && (
                    <div className="absolute left-[15px] top-8 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-gray-300 dark:to-gray-700" />
                )}

                {/* Timeline Events */}
                <div className="space-y-4">
                    {visibleHistory.map((event, index) => {
                        const isFirst = index === 0;

                        return (
                            <div
                                key={index}
                                className={`relative pl-10 transition-all duration-300 ${!isFirst && !isExpanded ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
                                    }`}
                            >
                                {/* Timeline Dot */}
                                <div
                                    className={`
                    absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center 
                    shadow-md transition-all duration-300
                    ${isFirst
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-emerald-100 dark:ring-emerald-900/30'
                                            : 'bg-white dark:bg-gray-800 border-2 border-emerald-500'
                                        }
                  `}
                                >
                                    <CheckCircle2 className={`w-4 h-4 ${isFirst ? 'text-white' : 'text-emerald-500'}`} />
                                </div>

                                {/* Event Card */}
                                <div
                                    className={`
                    p-4 rounded-xl transition-all duration-300
                    ${isFirst
                                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg'
                                            : 'bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                                        }
                  `}
                                >
                                    {/* Date Badge */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className={`
                        text-xs font-bold px-2 py-0.5 rounded-full
                        ${isFirst
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }
                      `}
                                        >
                                            {formatDateShort(event.date)}
                                        </span>
                                        {isFirst && (
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                ✓ Most Recent
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Text */}
                                    <p
                                        className={`
                      text-sm leading-relaxed
                      ${isFirst
                                                ? 'font-medium text-gray-800 dark:text-gray-100'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }
                    `}
                                    >
                                        {event.description || event.status}
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
                            <div className="flex -space-x-2">
                                {[...Array(Math.min(3, statusHistory.length - 1))].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center"
                                    >
                                        <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400">
                                            {i + 2}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <span>+{statusHistory.length - 1} earlier updates</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
