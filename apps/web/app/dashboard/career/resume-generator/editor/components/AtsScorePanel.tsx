import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, AlertTriangle } from "lucide-react";

interface AtsAnalysis {
    passed: boolean;
    score?: number; // Optional as it might not be computed by backend yet
    issues: string[];
}

interface AtsScorePanelProps {
    analysis: AtsAnalysis | null;
}

export function AtsScorePanel({ analysis }: AtsScorePanelProps) {
    if (!analysis) return null;

    // Calculate score if not provided
    const score = analysis.score ?? Math.max(0, 100 - (analysis.issues.length * 10));
    const isPassing = analysis.passed || score >= 80;

    return (
        <Card className="h-full border-0 shadow-none bg-gray-50/50 dark:bg-gray-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>ATS Compatibility Score</span>
                    <span className={`text-lg font-bold ${isPassing ? 'text-green-600' : 'text-amber-600'}`}>
                        {score}/100
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Score Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 rounded-full ${score >= 90 ? 'bg-green-500' :
                                score >= 70 ? 'bg-amber-500' :
                                    'bg-red-500'
                            }`}
                        style={{ width: `${score}%` }}
                    />
                </div>

                {/* Status Message */}
                <div className={`p-3 rounded-lg text-sm mb-4 flex items-start gap-2 ${isPassing ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                        'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                    }`}>
                    {isPassing ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                    <div>
                        <p className="font-medium">{isPassing ? 'ATS compliant!' : 'Needs improvement'}</p>
                        <p className="opacity-90 mt-0.5 text-xs">
                            {isPassing
                                ? 'Your resume follows standard formatting best practices.'
                                : 'Fix the issues below to ensure parsing by ATS systems.'}
                        </p>
                    </div>
                </div>

                {/* Issues List */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {analysis.issues.length > 0 ? 'Detected Issues' : 'All Checks Passed'}
                    </p>

                    {analysis.issues.length === 0 ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            <span>No formatting errors found.</span>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {analysis.issues.map((issue, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>{issue}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
