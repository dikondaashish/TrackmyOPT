"use client";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface CaseProgressStepperProps {
    currentStatus: string | null;
    className?: string;
}

// Case lifecycle steps
const CASE_STEPS = [
    { id: 1, name: "Received", shortName: "Received" },
    { id: 2, name: "Biometrics", shortName: "Biometrics" },
    { id: 3, name: "Active Review", shortName: "Review" },
    { id: 4, name: "Decision", shortName: "Decision" },
    { id: 5, name: "Card Produced", shortName: "Card" },
];

// Map USCIS status strings to step index
function mapStatusToStep(status: string | null): number {
    if (!status) return 0;

    const lowerStatus = status.toLowerCase();

    // Step 5: Card Produced/Mailed/Delivered
    if (
        lowerStatus.includes("card was mailed") ||
        lowerStatus.includes("card was produced") ||
        lowerStatus.includes("card was delivered") ||
        lowerStatus.includes("card was picked up")
    ) {
        return 5;
    }

    // Step 4: Decision (Approved/Denied)
    if (
        lowerStatus.includes("was approved") ||
        lowerStatus.includes("was denied") ||
        lowerStatus.includes("case approved") ||
        lowerStatus.includes("case denied")
    ) {
        return 4;
    }

    // Step 3: Active Review
    if (
        lowerStatus.includes("actively reviewed") ||
        lowerStatus.includes("being reviewed") ||
        lowerStatus.includes("under review") ||
        lowerStatus.includes("request for evidence") ||
        lowerStatus.includes("rfe")
    ) {
        return 3;
    }

    // Step 2: Biometrics
    if (
        lowerStatus.includes("biometric") ||
        lowerStatus.includes("fingerprint") ||
        lowerStatus.includes("appointment")
    ) {
        return 2;
    }

    // Step 1: Received (default for any status)
    if (
        lowerStatus.includes("received") ||
        lowerStatus.includes("acceptance") ||
        lowerStatus.includes("fee was accepted")
    ) {
        return 1;
    }

    // Default to step 1 if we have any status
    return 1;
}

export function CaseProgressStepper({ currentStatus, className = "" }: CaseProgressStepperProps) {
    const currentStep = mapStatusToStep(currentStatus);

    if (currentStep === 0) {
        return null; // Don't show stepper if no status
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Desktop: Horizontal Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {CASE_STEPS.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const isUpcoming = step.id > currentStep;

                    return (
                        <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                                            : isCurrent
                                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 ring-4 ring-blue-100 dark:ring-blue-900/30"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700"
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : isCurrent ? (
                                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </div>
                                {/* Step Label */}
                                <span
                                    className={`
                    mt-2 text-xs font-medium text-center max-w-[80px]
                    ${isCompleted
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : isCurrent
                                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                                : "text-gray-400 dark:text-gray-500"
                                        }
                  `}
                                >
                                    {step.name}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < CASE_STEPS.length - 1 && (
                                <div className="flex-1 mx-2">
                                    <div
                                        className={`
                      h-1 rounded-full transition-all duration-500
                      ${step.id < currentStep
                                                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                : step.id === currentStep
                                                    ? "bg-gradient-to-r from-blue-500 to-gray-200 dark:to-gray-700"
                                                    : "bg-gray-200 dark:bg-gray-700"
                                            }
                    `}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile: Compact Vertical Stepper */}
            <div className="md:hidden">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    {/* Current Step Indicator */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{currentStep}</span>
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Step {currentStep} of {CASE_STEPS.length}
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {CASE_STEPS[currentStep - 1]?.name || "Processing"}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-20">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${(currentStep / CASE_STEPS.length) * 100}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-1">
                            {Math.round((currentStep / CASE_STEPS.length) * 100)}%
                        </p>
                    </div>
                </div>

                {/* Mobile Step List */}
                <div className="mt-3 flex gap-1 justify-center">
                    {CASE_STEPS.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;

                        return (
                            <div
                                key={step.id}
                                className={`
                  w-2 h-2 rounded-full transition-all
                  ${isCompleted
                                        ? "bg-emerald-500"
                                        : isCurrent
                                            ? "bg-blue-500 w-4"
                                            : "bg-gray-300 dark:bg-gray-600"
                                    }
                `}
                                title={step.name}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
