"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Zap, Scissors, Rocket, BarChart3, Cog, Target, Ruler, Link2, type LucideIcon } from "lucide-react";

interface OptimizationFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (feedback: string) => void;
    isGenerating: boolean;
}

const SUGGESTIONS: { label: string; icon: LucideIcon }[] = [
    { label: "Make it more concise (1 page)", icon: Scissors },
    { label: "95% ATS score optimization", icon: Rocket },
    { label: "Stronger action verbs & metrics", icon: BarChart3 },
    { label: "Emphasize technical skills", icon: Cog },
    { label: "Make the summary more punchy", icon: Target },
    { label: "Fix formatting & spacing", icon: Ruler },
    { label: "Align closer to the JD", icon: Link2 },
];

export function OptimizationFeedbackModal({
    isOpen,
    onClose,
    onConfirm,
    isGenerating
}: OptimizationFeedbackModalProps) {
    const [feedback, setFeedback] = useState("");
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) setTimeout(() => textareaRef.current?.focus(), 150);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setFeedback("");
            setSelectedSuggestions(new Set());
        }
    }, [isOpen]);

    const toggleSuggestion = (label: string) => {
        setSelectedSuggestions(prev => {
            const next = new Set(prev);
            if (next.has(label)) {
                next.delete(label);
            } else {
                next.add(label);
            }
            return next;
        });
    };

    const handleConfirm = () => {
        const parts: string[] = [];
        if (selectedSuggestions.size > 0) {
            parts.push("Focus areas: " + Array.from(selectedSuggestions).join("; "));
        }
        if (feedback.trim()) parts.push(feedback.trim());
        onConfirm(parts.join(". ") || "General improvement based on ATS best practices.");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && onClose()}>
            <DialogContent onClose={onClose} className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-2xl">
                {/* Header */}
                <div className="px-5 pt-5 pb-3">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                    Optimize Resume
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Tell the AI what to improve · Uses 0.5 credit (half of a new generation)
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-5 pb-1 space-y-4">
                    {/* Textarea */}
                    <div>
                        <textarea
                            ref={textareaRef}
                            placeholder="e.g. 'Make bullet points stronger' or 'Focus on React & AWS'"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={isGenerating}
                            rows={2}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all disabled:opacity-50"
                        />
                    </div>

                    {/* Quick Suggestions */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Quick suggestions</span>
                            {selectedSuggestions.size > 0 && (
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
                                    {selectedSuggestions.size}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {SUGGESTIONS.map((s) => {
                                const isSelected = selectedSuggestions.has(s.label);
                                const SuggestionIcon = s.icon;
                                return (
                                    <button
                                        key={s.label}
                                        onClick={() => toggleSuggestion(s.label)}
                                        disabled={isGenerating}
                                        className={`
                                            inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isSelected
                                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                                            }
                                        `}
                                    >
                                        <SuggestionIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                        {s.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isGenerating}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 px-3 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleConfirm}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs rounded-lg"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Optimizing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                Generate Improvements
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
