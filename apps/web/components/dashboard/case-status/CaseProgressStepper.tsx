'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import {
  biometricsAppliesToCase,
  getBiometricsState,
  getVisibleI765Steps,
  mapStatusToRawStep,
  toDisplayStep,
} from '@/lib/case-status/i765-stepper';

interface CaseProgressStepperProps {
  currentStatus: string | null;
  statusHistory?: Array<{
    status?: string | null;
    description?: string | null;
  }>;
  className?: string;
  userBiometricsDate?: string | null;
}

export function CaseProgressStepper({
  currentStatus,
  statusHistory = [],
  className = '',
  userBiometricsDate,
}: CaseProgressStepperProps) {
  const skipBiometrics =
    !userBiometricsDate &&
    !biometricsAppliesToCase(currentStatus, statusHistory);
  const steps = getVisibleI765Steps(skipBiometrics);
  const currentStep = toDisplayStep(
    mapStatusToRawStep(currentStatus),
    skipBiometrics
  );
  const biometrics = getBiometricsState(currentStatus, statusHistory);
  const officialBiometricsDone = ['completed', 'reused', 'waived'].includes(
    biometrics
  );
  const biometricsDone = officialBiometricsDone || Boolean(userBiometricsDate);
  const milestoneStates = steps.map((step, index) => ({
    ...step,
    completed:
      step.key === 'biometrics' ? biometricsDone : index + 1 < currentStep,
    label:
      step.key === 'biometrics' && userBiometricsDate && !officialBiometricsDone
        ? 'Biometrics completed · Confirmed by you'
        : step.key === 'biometrics'
          ? {
              completed: 'Biometrics completed',
              reused: 'Biometrics reused',
              waived: 'Biometrics waived',
              pending: 'Biometrics — completion not recorded',
              scheduled: 'Biometrics appointment scheduled',
              unrecorded: 'Biometrics',
            }[biometrics]
          : step.name,
  }));
  const completedCount = milestoneStates.filter(
    (step) => step.completed
  ).length;

  if (currentStep === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {skipBiometrics && (
        <p className="text-xs text-muted-foreground mb-3">
          No biometrics update recorded. Not every OPT case requires an
          appointment.
        </p>
      )}

      {/* Desktop: horizontal stepper */}
      <div className="hidden md:flex items-center justify-between">
        {milestoneStates.map((step, index) => {
          const stepNum = index + 1;
          const resolvedCompleted = step.completed;
          const isCurrent = !resolvedCompleted && stepNum === currentStep;

          return (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-initial"
            >
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={`
                    w-11 h-11 rounded-full flex items-center justify-center transition-colors relative
                    ${
                      resolvedCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                    }
                  `}
                >
                  {resolvedCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 bg-white rounded-full" />
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
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector bar */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                    <div
                      className={`
                        h-full rounded-full transition-[width] duration-700 ease-out
                        ${
                          resolvedCompleted
                            ? 'bg-emerald-500'
                            : isCurrent
                              ? 'bg-indigo-500'
                              : ''
                        }
                      `}
                      style={{
                        width: resolvedCompleted
                          ? '100%'
                          : isCurrent
                            ? '50%'
                            : '0%',
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
        <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{currentStep}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Step {currentStep} of {steps.length}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 break-words">
              {milestoneStates[currentStep - 1]?.label || 'Processing'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {completedCount}/{steps.length}
            </p>
          </div>
        </div>

        {/* Segmented bar */}
        <div className="flex gap-1.5">
          {milestoneStates.map((step, index) => {
            const stepNum = index + 1;
            const resolvedCompleted = step.completed;
            const isCurrent = !resolvedCompleted && stepNum === currentStep;

            return (
              <div
                key={step.key}
                className={`
                  h-2.5 rounded-full flex-1 transition-colors
                  ${
                    resolvedCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}
                title={step.label}
              />
            );
          })}
        </div>

        {/* Step labels (completed count) */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{completedCount} completed milestones</span>
          <span>Not a processing-time estimate</span>
        </div>
        {!skipBiometrics && (
          <p className="text-xs text-muted-foreground">
            {milestoneStates.find((step) => step.key === 'biometrics')?.label}
          </p>
        )}
      </div>
    </div>
  );
}
