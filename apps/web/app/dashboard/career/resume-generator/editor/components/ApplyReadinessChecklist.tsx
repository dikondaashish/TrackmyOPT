"use client";

import { Check, X } from "lucide-react";
import { evaluateApplyReadiness, type ReadinessInput } from "@/lib/resume/apply-readiness";

interface ApplyReadinessChecklistProps {
    input: ReadinessInput;
}

export function ApplyReadinessChecklist({ input }: ApplyReadinessChecklistProps) {
    const { checks, ready } = evaluateApplyReadiness(input);

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Apply readiness
                </h4>
                <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        ready
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                >
                    {ready ? "Ready to apply" : "Not ready yet"}
                </span>
            </div>
            <ul className="space-y-2">
                {checks.map((check) => (
                    <li key={check.id} className="flex items-start gap-2 text-sm">
                        {check.passed ? (
                            <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        ) : (
                            <X className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        )}
                        <div>
                            <span className="text-gray-800 dark:text-gray-200">{check.label}</span>
                            {check.detail && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {check.detail}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
