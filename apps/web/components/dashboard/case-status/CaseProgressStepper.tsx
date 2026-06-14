"use client";

import { CheckCircle2, Circle } from "lucide-react";
import {
  biometricsAppliesToCase,
  getVisibleI765Steps,
  mapStatusToRawStep,
  toDisplayStep,
} from "@/lib/case-status/i765-stepper";

interface CaseProgressStepperProps {
  currentStatus: string | null;
  statusHistory?: Array<{ status?: string | null }>;
  className?: string;
}

export function CaseProgressStepper({
  currentStatus,
  statusHistory = [],
  className = "",
}: CaseProgressStepperProps) {
  const skipBiometrics = !biometricsAppliesToCase(currentStatus, statusHistory);
  const steps = getVisibleI765Steps(skipBiometrics);
  const currentStep = toDisplayStep(mapStatusToRawStep(currentStatus), skipBiometrics);

  if (currentStep === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {skipBiometrics && (
        <p className="text-xs text-muted-foreground mb-3">
          Biometrics step hidden — many I-765 OPT cases skip ASC appointments unless USCIS requests them.
        </p>
      )}

      {/* Desktop: Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const resolvedCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      resolvedCompleted
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                        : isCurrent
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 ring-4 ring-blue-100 dark:ring-blue-900/30"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700"
                    }
                  `}
                >
                  {resolvedCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-[80px]
                    ${
                      resolvedCompleted
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

              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`
                      h-1 rounded-full transition-all duration-500
                      ${
                        index + 1 < currentStep
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : index + 1 === currentStep
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

      {/* Mobile: Compact */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{currentStep}</span>
          </div>

          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Step {currentStep} of {steps.length}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {steps[currentStep - 1]?.name || "Processing"}
            </p>
          </div>

          <div className="w-20">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-1">
              {Math.round((currentStep / steps.length) * 100)}%
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-1 justify-center">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const resolvedCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={step.key}
                className={`
                  h-2 rounded-full transition-all
                  ${
                    isCurrent
                      ? "bg-blue-500 w-4"
                      : resolvedCompleted
                        ? "bg-emerald-500 w-2"
                        : "bg-gray-300 dark:bg-gray-600 w-2"
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
