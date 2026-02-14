"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Wand2, Zap, ArrowRight, MessageSquareText } from "lucide-react";

interface OptimizationFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (feedback: string) => void;
    isGenerating: boolean;
}

const SUGGESTIONS = [
    { label: "Make it more concise (1 page)", icon: "✂️" },
    { label: "Stronger action verbs & metrics", icon: "📊" },
    { label: "Emphasize technical skills", icon: "⚙️" },
    { label: "Make the summary more punchy", icon: "🎯" },
    { label: "Fix formatting & spacing issues", icon: "📐" },
    { label: "Better align with the job description", icon: "🔗" },
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

    // Focus textarea on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 150);
        }
    }, [isOpen]);

    // Reset state when modal closes
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
        // Combine selected suggestions and custom feedback
        const parts: string[] = [];
        if (selectedSuggestions.size > 0) {
            parts.push("Focus areas: " + Array.from(selectedSuggestions).join("; "));
        }
        if (feedback.trim()) {
            parts.push(feedback.trim());
        }
        const combined = parts.join(". ") || "General improvement based on ATS best practices.";
        onConfirm(combined);
    };

    const hasInput = feedback.trim().length > 0 || selectedSuggestions.size > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white dark:bg-gray-900">
                {/* Header with gradient accent */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-gray-900" />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                                <Wand2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Optimize Resume
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Tell the AI what to improve — or pick from suggestions below.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 pb-2 space-y-5">
                    {/* Custom Feedback Textarea */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <MessageSquareText className="w-3.5 h-3.5" />
                            Your instructions
                        </label>
                        <div className="relative group">
                            <textarea
                                ref={textareaRef}
                                placeholder="e.g. 'Make the bullet points stronger' or 'Focus on React and AWS skills'"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                disabled={isGenerating}
                                rows={3}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {/* Character indicator */}
                            {feedback.length > 0 && (
                                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 tabular-nums">
                                    {feedback.length}/500
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Suggestions */}
                    <div className="space-y-2.5">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Zap className="w-3.5 h-3.5" />
                            Quick suggestions
                            {selectedSuggestions.size > 0 && (
                                <span className="ml-1 text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-medium">
                                    {selectedSuggestions.size} selected
                                </span>
                            )}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {SUGGESTIONS.map((s) => {
                                const isSelected = selectedSuggestions.has(s.label);
                                return (
                                    <button
                                        key={s.label}
                                        onClick={() => toggleSuggestion(s.label)}
                                        disabled={isGenerating}
                                        className={`
                                            group/chip flex items-center gap-2 text-left text-xs px-3 py-2.5 rounded-xl border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isSelected
                                                ? "bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-purple-800 dark:text-purple-200 shadow-sm"
                                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                                            }
                                        `}
                                    >
                                        <span className="text-sm flex-shrink-0">{s.icon}</span>
                                        <span className="leading-tight">{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 mt-1 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isGenerating}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isGenerating}
                        className={`
                            relative overflow-hidden rounded-xl px-5 h-10 font-medium text-sm transition-all duration-200
                            ${hasInput
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }
                        `}
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Optimizing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Generate Improvements
                                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                            </span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
