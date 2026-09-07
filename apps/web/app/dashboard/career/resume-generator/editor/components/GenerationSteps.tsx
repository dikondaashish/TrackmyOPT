"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, CircleAlert, CircleDotDashed, CircleX, Sparkles } from "lucide-react";
import type { GenerationStep, GenerationStepStatus } from "@/lib/resume/generation-steps";

const STATUS_ICONS: Record<GenerationStepStatus, { Icon: typeof Circle; className: string }> = {
    completed: { Icon: CheckCircle2, className: "text-green-500" },
    active: {
        Icon: CircleDotDashed,
        className: "text-blue-500 animate-spin [animation-duration:3s] motion-reduce:animate-none",
    },
    warning: { Icon: CircleAlert, className: "text-amber-500" },
    failed: { Icon: CircleX, className: "text-red-500" },
    pending: { Icon: Circle, className: "opacity-40" },
};

/**
 * Inherits colour from its container so the same list reads correctly over the
 * dark code editor and the light PDF pane.
 */
export function GenerationSteps({ steps }: { steps: GenerationStep[] }) {
    return (
        <div className="w-full max-w-xs">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Building your resume
            </div>

            <ul className="space-y-3" aria-live="polite">
                <AnimatePresence initial={false}>
                    {steps.map((step) => {
                        const { Icon, className } = STATUS_ICONS[step.status];

                        return (
                            <motion.li
                                key={step.id}
                                className="relative flex items-start gap-3"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={step.status}
                                        className="mt-0.5 flex-shrink-0"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon className={`h-4 w-4 ${className}`} />
                                    </motion.span>
                                </AnimatePresence>

                                <div className="min-w-0 text-xs leading-5">
                                    <span
                                        className={
                                            step.status === "pending"
                                                ? "opacity-50"
                                                : step.status === "active"
                                                    ? "font-medium"
                                                    : "opacity-80"
                                        }
                                    >
                                        {step.label}
                                    </span>
                                    {step.detail && (
                                        <p className="opacity-60">{step.detail}</p>
                                    )}
                                </div>
                            </motion.li>
                        );
                    })}
                </AnimatePresence>
            </ul>
        </div>
    );
}
