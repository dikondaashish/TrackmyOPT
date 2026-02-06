"use client";

import { useMemo, useState } from "react";
import { JobApplication } from "@/lib/career/job-tracker/types";
import { differenceInDays, parseISO } from "date-fns";
import { BarChart3, TrendingUp, Clock, ChevronDown, ChevronUp, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightsPanelProps {
    applications: JobApplication[];
}

interface Metric {
    label: string;
    value: string | number;
    icon: typeof BarChart3;
    color: string;
    subtext?: string;
}

export function InsightsPanel({ applications }: InsightsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const metrics = useMemo(() => {
        const now = new Date();

        // Basic counts
        const total = applications.length;
        const withInterview = applications.filter(a => {
            const interviews = (a as any).job_interviews || (a as any).interviews || [];
            return interviews.length > 0;
        }).length;
        const offers = applications.filter(a => a.status === "Offer").length;
        const rejected = applications.filter(a => a.status === "Rejected").length;
        const applied = applications.filter(a => a.status !== "Wishlist").length;

        // Conversion rates
        const appliedToInterview = applied > 0 ? Math.round((withInterview / applied) * 100) : 0;
        const interviewToOffer = withInterview > 0 ? Math.round((offers / withInterview) * 100) : 0;

        // Average days to first interview
        let totalDaysToInterview = 0;
        let countWithInterviewDates = 0;

        applications.forEach(app => {
            const appInterviews = (app as any).job_interviews || (app as any).interviews || [];
            if (app.applied_at && appInterviews.length > 0) {
                const interview = appInterviews[0] as any;
                if (interview.date) {
                    const appliedDate = parseISO(app.applied_at);
                    const interviewDate = parseISO(interview.date);
                    const days = differenceInDays(interviewDate, appliedDate);
                    if (days >= 0) {
                        totalDaysToInterview += days;
                        countWithInterviewDates++;
                    }
                }
            }
        });

        const avgDaysToInterview = countWithInterviewDates > 0
            ? Math.round(totalDaysToInterview / countWithInterviewDates)
            : null;

        // Average days in pipeline
        let totalDaysInPipeline = 0;
        let activeApplications = 0;

        applications.forEach(app => {
            if (app.applied_at && app.status !== "Wishlist") {
                const appliedDate = parseISO(app.applied_at);
                totalDaysInPipeline += differenceInDays(now, appliedDate);
                activeApplications++;
            }
        });

        const avgDaysInPipeline = activeApplications > 0
            ? Math.round(totalDaysInPipeline / activeApplications)
            : null;

        return {
            total,
            applied,
            withInterview,
            offers,
            rejected,
            appliedToInterview,
            interviewToOffer,
            avgDaysToInterview,
            avgDaysInPipeline
        };
    }, [applications]);

    const cards: Metric[] = [
        {
            label: "Total Applications",
            value: metrics.total,
            icon: BarChart3,
            color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40"
        },
        {
            label: "Applied → Interview",
            value: `${metrics.appliedToInterview}%`,
            icon: TrendingUp,
            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40",
            subtext: `${metrics.withInterview} of ${metrics.applied} applied`
        },
        {
            label: "Interview → Offer",
            value: `${metrics.interviewToOffer}%`,
            icon: Award,
            color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40",
            subtext: `${metrics.offers} of ${metrics.withInterview} interviewed`
        },
        {
            label: "Avg. Days to Interview",
            value: metrics.avgDaysToInterview ?? "—",
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40"
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Pipeline Insights</h3>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {cards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={index}
                                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex flex-col justify-between h-full"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", card.color)}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                                            {card.value}
                                        </p>
                                        <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400 font-medium whitespace-pre-line">
                                            {card.label.replace(/ → /g, '\n→ ')}
                                        </p>
                                        {card.subtext && (
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                                                {card.subtext}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Additional Stats */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                                Avg. days in pipeline: <span className="font-medium text-gray-900 dark:text-white">{metrics.avgDaysInPipeline ?? "—"}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span>
                                Rejected: <span className="font-medium text-gray-900 dark:text-white">{metrics.rejected}</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
