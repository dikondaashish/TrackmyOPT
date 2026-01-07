"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronDown, ChevronUp, History } from "lucide-react";

interface StatusHistoryItem {
    status: string;
    date: string;
    description?: string;
}

interface CaseHistoryTimelineProps {
    history: StatusHistoryItem[];
}

export function CaseHistoryTimeline({ history }: CaseHistoryTimelineProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // If no history, don't render
    if (!history || history.length === 0) return null;

    const formatDateShort = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Show only the first item by default, or all if expanded
    const visibleHistory = isExpanded ? history : history.slice(0, 1);
    const hasMoreHistory = history.length > 1;

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Case Timeline</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Your case journey from USCIS</p>
                    </div>
                </div>

                {hasMoreHistory && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <History className="w-4 h-4 mr-1" />
                                View Full History ({history.length})
                            </>
                        )}
                    </Button>
                )}
            </div>

            <div className="relative">
                {/* Timeline Line - Gradient */}
                <div className={`absolute left-[15px] top-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-gray-300 dark:to-gray-700 transition-all duration-500 ${isExpanded ? 'bottom-0' : 'h-full'}`}></div>

                {/* Timeline Items */}
                <div className="space-y-6">
                    {visibleHistory.map((item, index) => {
                        const isFirst = index === 0;

                        return (
                            <div key={index} className="relative pl-10 group">
                                {/* Timeline Dot with Checkmark */}
                                <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${isFirst
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-emerald-100 dark:ring-emerald-900/30'
                                    : 'bg-white dark:bg-gray-800 border-2 border-emerald-500 group-hover:scale-110'
                                    }`}>
                                    {isFirst ? (
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className={`p-4 rounded-xl transition-all ${isFirst
                                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg'
                                    : 'bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                                    }`}>
                                    {/* Date Badge */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFirst
                                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {formatDateShort(item.date)}
                                        </span>
                                        {isFirst && (
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                                                ✓ Most Recent
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Text */}
                                    <div className="space-y-1">
                                        <p className={`text-sm leading-relaxed ${isFirst
                                            ? 'font-bold text-gray-800 dark:text-gray-100'
                                            : 'font-semibold text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {item.status}
                                        </p>
                                        {item.description && item.description !== item.status && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Fade out effect when collapsed and more items exist */}
                {!isExpanded && hasMoreHistory && (
                    <div className="absolute bottom-[-20px] left-0 w-full h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none z-0" />
                )}
            </div>

            {!isExpanded && hasMoreHistory && (
                <div className="mt-4 text-center md:hidden">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => setIsExpanded(true)}
                        className="text-blue-600"
                    >
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View {history.length - 1} more updates
                    </Button>
                </div>
            )}
        </Card>
    );
}
