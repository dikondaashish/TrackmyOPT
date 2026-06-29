"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Target } from "lucide-react";

export interface GapAnalysisResult {
    matchScore: number;
    missingKeywords: string[];
    foundKeywords: string[];
    gapAnalysis: string;
    recommendations: string[];
}

interface GapAnalysisPanelProps {
    resumeText: string;
    jobDescription: string;
    disabled?: boolean;
}

export function GapAnalysisPanel({
    resumeText,
    jobDescription,
    disabled,
}: GapAnalysisPanelProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GapAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canAnalyze = resumeText.length > 50 && jobDescription.length > 50;

    const runAnalysis = async () => {
        if (!canAnalyze) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/resume-generator/analyze-gap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText, jobDescription }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Analysis failed");
            setResult(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not analyze fit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-600" />
                        Job fit preview
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        See missing keywords before generating — saves credits and targets gaps.
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={runAnalysis}
                    disabled={disabled || loading || !canAnalyze}
                    className="shrink-0"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Analyze fit"
                    )}
                </Button>
            </div>

            {error && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {result && (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Match score:</span>
                        <span
                            className={`text-lg font-bold ${
                                result.matchScore >= 75
                                    ? "text-green-600"
                                    : result.matchScore >= 50
                                      ? "text-amber-600"
                                      : "text-red-600"
                            }`}
                        >
                            {result.matchScore}%
                        </span>
                    </div>
                    {result.missingKeywords?.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                                Missing keywords ({result.missingKeywords.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {result.missingKeywords.slice(0, 15).map((kw) => (
                                    <span
                                        key={kw}
                                        className="text-xs px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800"
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {result.recommendations?.length > 0 && (
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-4">
                            {result.recommendations.slice(0, 3).map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
