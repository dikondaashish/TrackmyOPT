"use client";

import React from 'react';
import { Check, Circle } from "lucide-react";

const STEPS = [
    {
        id: 'received',
        label: 'Received',
        description: 'Application received',
        keywords: ['received', 'submitted', 'validation', 'receipt', 'accepted']
    },
    {
        id: 'biometrics',
        label: 'Biometrics',
        description: 'Biometrics appointment',
        keywords: ['biometric', 'fingerprint']
    },
    {
        id: 'review',
        label: 'Active Review',
        description: 'Being processed',
        keywords: ['review', 'active', 'pending']
    },
    {
        id: 'decision',
        label: 'Decision',
        description: 'Approved or denied',
        keywords: ['approved', 'denied', 'decision', 'notice']
    },
    {
        id: 'produced',
        label: 'Card Produced',
        description: 'Card mailed to you',
        keywords: ['card', 'produced', 'mailed', 'delivered', 'picked up', 'returned']
    },
];

interface CaseProgressStepperProps {
    currentStatus: string;
}

export function CaseProgressStepper({ currentStatus }: CaseProgressStepperProps) {
    const getStepStatus = (status: string) => {
        const statusLower = status.toLowerCase();

        // Check keywords in reverse order to find the most advanced step
        for (let i = STEPS.length - 1; i >= 0; i--) {
            const step = STEPS[i];
            if (step.keywords.some(keyword => statusLower.includes(keyword))) {
                return i;
            }
        }
        return 0; // Default to 'Received'
    };

    const activeStepIndex = getStepStatus(currentStatus || '');

    return (
        <div className="w-full py-6">
            <div className="relative">
                {/* Desktop View: Horizontal Stepper */}
                <div className="hidden md:flex justify-between items-center relative z-10">
                    {/* Connecting Line */}
                    <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10" />

                    {/* Progress Line */}
                    <div
                        className="absolute top-4 left-0 h-1 bg-green-500 transition-all duration-500 -z-10"
                        style={{ width: `${(activeStepIndex / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, index) => {
                        const isCompleted = index < activeStepIndex;
                        const isActive = index === activeStepIndex;
                        const isPending = index > activeStepIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 bg-white dark:bg-gray-800
                    ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                    ${isActive ? 'border-green-500 ring-4 ring-green-100 dark:ring-green-900/30 text-green-600 scale-110' : ''}
                    ${isPending ? 'border-gray-300 dark:border-gray-600 text-gray-300' : ''}
                  `}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className={`text-xs font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p className={`text-sm font-semibold ${isActive ? 'text-green-700 dark:text-green-400' :
                                            isCompleted ? 'text-gray-700 dark:text-gray-300' :
                                                'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile View: Vertical Stepper */}
                <div className="md:hidden space-y-0 relative">
                    {/* Vertical Grid Line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
                    {/* Vertical Progress Line (Simplified representation for mobile) */}
                    <div
                        className="absolute left-[15px] top-4 w-0.5 bg-green-500 transition-all duration-500 -z-10"
                        style={{ height: `${(activeStepIndex / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, index) => {
                        const isCompleted = index < activeStepIndex;
                        const isActive = index === activeStepIndex;
                        const isPending = index > activeStepIndex;

                        return (
                            <div key={step.id} className="flex items-start gap-4 pb-6 last:pb-0">
                                <div
                                    className={`flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 bg-white dark:bg-gray-800
                    ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                    ${isActive ? 'border-green-500 ring-4 ring-green-100 dark:ring-green-900/30 text-green-600 scale-110' : ''}
                    ${isPending ? 'border-gray-300 dark:border-gray-600 text-gray-300' : ''}
                  `}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className={`text-xs font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                                <div className={index === STEPS.length - 1 ? "pb-2" : ""}>
                                    <p className={`text-sm font-semibold ${isActive ? 'text-green-700 dark:text-green-400' :
                                            isCompleted ? 'text-gray-700 dark:text-gray-300' :
                                                'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
