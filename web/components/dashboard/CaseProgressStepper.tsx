"use client";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface CaseProgressStepperProps {
    currentStatus: string | null;
}

// Define the case lifecycle steps
const CASE_STEPS = [
    { id: "received", label: "Received", keywords: ["received", "accepted"] },
    { id: "biometrics", label: "Biometrics", keywords: ["fingerprint", "biometric", "scheduled"] },
    { id: "review", label: "Active Review", keywords: ["review", "reviewing", "actively"] },
    { id: "decision", label: "Decision", keywords: ["approved", "denied", "decision", "completed"] },
    { id: "card", label: "Card Produced", keywords: ["card", "mailed", "delivered", "produced", "picked up"] },
];

/**
 * Maps USCIS status text to a step index
 */
function getStepFromStatus(status: string | null): number {
    if (!status) return -1;

    const lowerStatus = status.toLowerCase();

    // Check each step for matching keywords
    for (let i = CASE_STEPS.length - 1; i >= 0; i--) {
        const step = CASE_STEPS[i];
        if (step.keywords.some(keyword => lowerStatus.includes(keyword))) {
            return i;
        }
    }

    // Default to "received" if we have any status
    return 0;
}

export function CaseProgressStepper({ currentStatus }: CaseProgressStepperProps) {
    const currentStepIndex = getStepFromStatus(currentStatus);

    if (currentStepIndex < 0) {
        return null; // Don't show stepper if no status
    }

    return (
        <div className="w-full">
            {/* Desktop: Horizontal Stepper */}
            <div className="hidden md:block">
                <div className="flex items-center justify-between">
                    {CASE_STEPS.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <div key={step.id} className="flex items-center flex-1">
                                {/* Step Circle */}
                                <div className="flex flex-col items-center relative">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                : isCurrent
                                                    ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50 shadow-lg shadow-blue-500/30"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : isCurrent ? (
                                            <Loader2 className="w-5 h-5 animate-pulse" />
                                        ) : (
                                            <Circle className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-medium text-center ${isCompleted
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : isCurrent
                                                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                                                    : "text-gray-400 dark:text-gray-500"
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Connector Line (not after last step) */}
                                {index < CASE_STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${index < currentStepIndex
                                                ? "bg-emerald-500"
                                                : "bg-gray-200 dark:bg-gray-700"
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile: Vertical Stepper */}
            <div className="md:hidden">
                <div className="flex flex-col space-y-4">
                    {CASE_STEPS.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <div key={step.id} className="flex items-center gap-3">
                                {/* Step Circle */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isCompleted
                                            ? "bg-emerald-500 text-white"
                                            : isCurrent
                                                ? "bg-blue-600 text-white ring-2 ring-blue-200 dark:ring-blue-800"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : isCurrent ? (
                                        <Loader2 className="w-4 h-4 animate-pulse" />
                                    ) : (
                                        <Circle className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`text-sm font-medium ${isCompleted
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : isCurrent
                                                ? "text-blue-600 dark:text-blue-400 font-semibold"
                                                : "text-gray-400 dark:text-gray-500"
                                        }`}
                                >
                                    {step.label}
                                </span>

                                {/* Current indicator */}
                                {isCurrent && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                        Current
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
