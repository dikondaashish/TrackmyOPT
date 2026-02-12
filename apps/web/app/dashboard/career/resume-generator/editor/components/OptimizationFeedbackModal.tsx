"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

interface OptimizationFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (feedback: string) => void;
    isGenerating: boolean;
}

export function OptimizationFeedbackModal({
    isOpen,
    onClose,
    onConfirm,
    isGenerating
}: OptimizationFeedbackModalProps) {
    const [feedback, setFeedback] = useState("");

    const handleConfirm = () => {
        onConfirm(feedback || "General improvement based on ATS best practices.");
        setFeedback(""); // Reset for next time
    };

    const suggestions = [
        "Make it more concise (1 page)",
        "Emphasize my React experience",
        "Fix the formatting issues",
        "Make the summary more punchy"
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Optimize Resume
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>What should the AI focus on?</Label>
                        <Textarea
                            placeholder="e.g. 'Make the bullet points stronger' or 'Focus on technical skills'"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="h-24 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Quick Suggestions</Label>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFeedback(s)}
                                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Optimizing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Improvements
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
