import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, AlertTriangle } from "lucide-react";
import { normalizeAtsAnalysis, type AtsAnalysis } from "@/lib/resume/ats-analysis-types";
import { formatPlacementHint } from "@/lib/resume/keyword-placement";

interface AtsScorePanelProps {
    analysis: AtsAnalysis | null;
}

export function AtsScorePanel({ analysis }: AtsScorePanelProps) {
    const safeAnalysis = normalizeAtsAnalysis(analysis);

    if (!safeAnalysis) {
        return (
            <Card className="border-dashed border-gray-300 dark:border-gray-700">
                <CardContent className="py-8 text-center text-sm text-gray-500">
                    ATS analysis runs automatically after your PDF compiles.
                </CardContent>
            </Card>
        );
    }

    const score = safeAnalysis.score ?? Math.max(0, 100 - (safeAnalysis.issues.length * 10));
    const isPassing = safeAnalysis.passed === true && score >= 75;

    return (
        <Card className="h-full border-0 shadow-none bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto max-h-[calc(100vh-200px)]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Estimated ATS Match</span>
                    <span className={`text-lg font-bold ${isPassing ? 'text-green-600' : 'text-amber-600'}`}>
                        {score}/100
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${score >= 90 ? 'bg-green-500' :
                            score >= 70 ? 'bg-amber-500' :
                                'bg-red-500'
                            }`}
                        style={{ width: `${score}%` }}
                    />
                </div>

                {safeAnalysis.scoreBreakdown && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Content match {safeAnalysis.scoreBreakdown.contentScore}/100
                        {safeAnalysis.scoreBreakdown.formatPenalty > 0
                            ? ` • ${safeAnalysis.scoreBreakdown.formatPenalty}-point format penalty`
                            : " • No format penalty"}
                    </p>
                )}

                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${isPassing ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                    }`}>
                    {isPassing ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                    <div>
                        <p className="font-medium">{isPassing ? 'Ready to apply' : 'Needs improvement'}</p>
                        <p className="opacity-90 mt-0.5 text-xs">
                            {isPassing
                                ? 'Meets TrackMyOPT’s recommended 75+ match threshold.'
                                : 'Review the job-keyword gaps and recommendations below.'}
                        </p>
                    </div>
                </div>

                {safeAnalysis.keywordMatch && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Content Analysis
                        </h4>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Keyword Match</span>
                                <span className="font-medium">{safeAnalysis.keywordMatch.score}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${safeAnalysis.keywordMatch.score}%` }} />
                            </div>
                            {safeAnalysis.keywordMatch.missing.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-red-500 mb-1">Missing Keywords:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {safeAnalysis.keywordMatch.missing.map((kw, i) => (
                                            <span key={i} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {safeAnalysis.sectionScores && (
                            <div className="grid grid-cols-2 gap-4">
                                {safeAnalysis.sectionScores.impact != null && (
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Impact</p>
                                        <p className={`text-lg font-bold ${(safeAnalysis.sectionScores.impact ?? 0) > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                            {safeAnalysis.sectionScores.impact}%
                                        </p>
                                    </div>
                                )}
                                {safeAnalysis.sectionScores.relevance != null && (
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Relevance</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {safeAnalysis.sectionScores.relevance}%
                                        </p>
                                    </div>
                                )}
                                {safeAnalysis.metricsBullets && safeAnalysis.metricsBullets.total > 0 && (
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 mb-1">Quantified bullets</p>
                                        <p className={`text-lg font-bold ${(safeAnalysis.metricsRatio ?? 0) >= 0.6 ? 'text-green-600' : 'text-amber-600'}`}>
                                            {Math.round((safeAnalysis.metricsRatio ?? 0) * 100)}%
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {safeAnalysis.metricsBullets.quantified}/{safeAnalysis.metricsBullets.total} bullets
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {safeAnalysis.keywordPlacement && safeAnalysis.keywordPlacement.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Keyword placement
                        </p>
                        <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                            {safeAnalysis.keywordPlacement
                                .filter((p) => p.needsBetterPlacement)
                                .slice(0, 8)
                                .map((p) => (
                                    <li key={p.keyword} className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded border border-amber-100 dark:border-amber-800">
                                        {formatPlacementHint(p)}
                                    </li>
                                ))}
                            {safeAnalysis.keywordPlacement.filter((p) => !p.needsBetterPlacement).length > 0 && (
                                <li className="text-green-600 dark:text-green-400 text-xs pt-1">
                                    {safeAnalysis.keywordPlacement.filter((p) => !p.needsBetterPlacement).length} keywords well-placed across sections
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {safeAnalysis.issues.length > 0 ? 'Formatting Issues' : 'Formatting Checks'}
                    </p>

                    {safeAnalysis.issues.length === 0 ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            <span>No formatting errors found.</span>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {safeAnalysis.issues.map((issue, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>{issue}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {safeAnalysis.improvements && safeAnalysis.improvements.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            AI Suggestions
                        </p>
                        <ul className="space-y-2">
                            {safeAnalysis.improvements.map((imp, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 p-2 rounded border border-blue-100 dark:border-blue-800">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <span>{imp}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
