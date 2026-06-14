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

  const progressPct = Math.round((currentStep / steps.length) * 100);

  return (
    <div className={`w-full ${className}`}>
      {skipBiometrics && (
        <p className="text-xs text-muted-foreground mb-3">
          Biometrics step hidden — many I-765 OPT cases skip ASC appointments unless USCIS requests them.
        </p>
      )}

      {/* Desktop: Horizontal Stepper with animated bars */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const resolvedCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={`
                    w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 relative
                    ${
                      resolvedCompleted
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20"
                        : isCurrent
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/30 dark:shadow-indigo-500/20 animate-ripple"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700"
                    }
                  `}
                >
                  {resolvedCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 bg-white rounded-full animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`
                    mt-2.5 text-xs font-semibold text-center max-w-[90px] leading-tight
                    ${
                      resolvedCompleted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isCurrent
                          ? "text-indigo-600 dark:text-indigo-400 font-bold"
                          : "text-gray-400 dark:text-gray-500"
                    }
                  `}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector bar with animated fill */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                    <div
                      className={`
                        h-full rounded-full transition-all duration-700 ease-out animate-progress-fill
                        ${
                          index + 1 < currentStep
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            : index + 1 === currentStep
                              ? "bg-gradient-to-r from-indigo-500 to-indigo-300"
                              : ""
                        }
                      `}
                      style={{
                        width:
                          index + 1 < currentStep
                            ? "100%"
                            : index + 1 === currentStep
                              ? "50%"
                              : "0%",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Segmented Progress Bar */}
      <div className="md:hidden space-y-4">
        {/* Current step card */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">{currentStep}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">
              Step {currentStep} of {steps.length}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
              {steps[currentStep - 1]?.name || "Processing"}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {progressPct}%
            </p>
          </div>
        </div>

        {/* Segmented bar */}
        <div className="flex gap-1.5">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const resolvedCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={step.key}
                className={`
                  h-2.5 rounded-full flex-1 transition-all duration-500
                  ${
                    resolvedCompleted
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                      : isCurrent
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm shadow-indigo-500/30"
                        : "bg-gray-200 dark:bg-gray-700"
                  }
                `}
                title={step.name}
              />
            );
          })}
        </div>

        {/* Step labels (completed count) */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{currentStep - 1} completed</span>
          <span>{steps.length - currentStep} remaining</span>
        </div>
      </div>
    </div>
  );
}
