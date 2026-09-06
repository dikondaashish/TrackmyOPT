"use client";

import { Button } from "@/components/ui/button";
import { Check, FileSearch, Loader2 } from "lucide-react";

export type OcrStatus = {
    show: boolean;
    running: boolean;
    jobId?: string;
    fileBuffer?: string;
    filename?: string;
};

type Accent = "blue" | "amber";

const accentClasses: Record<
    Accent,
    {
        iconBg: string;
        iconText: string;
        btn: string;
        stepBg: string;
        stepText: string;
        bar: string;
    }
> = {
    blue: {
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconText: "text-blue-600 dark:text-blue-400",
        btn: "bg-blue-600 hover:bg-blue-700 text-white gap-1.5",
        stepBg: "bg-blue-600 dark:bg-blue-500",
        stepText: "text-blue-700 dark:text-blue-400",
        bar: "bg-blue-600 dark:bg-blue-500",
    },
    amber: {
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconText: "text-amber-600 dark:text-amber-400",
        btn: "bg-amber-600 hover:bg-amber-700 text-white gap-1.5",
        stepBg: "bg-amber-600 dark:bg-amber-500",
        stepText: "text-amber-700 dark:text-amber-400",
        bar: "bg-amber-600 dark:bg-amber-500",
    },
};

type OcrProcessingCardProps = {
    ocr: OcrStatus;
    accent?: Accent;
    onStart: () => void;
    onCancel: () => void;
};

export function OcrProcessingCard({
    ocr,
    accent = "blue",
    onStart,
    onCancel,
}: OcrProcessingCardProps) {
    if (!ocr.show) return null;

    const c = accentClasses[accent];

    return (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
            {!ocr.running ? (
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${c.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <FileSearch className={`w-5 h-5 ${c.iconText}`} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            Scanned Document Detected
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            This PDF contains images instead of text. Use OCR to extract the content.
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={onStart} className={c.btn}>
                                <FileSearch className="w-3.5 h-3.5" />
                                Extract Text
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onCancel}
                                className="text-gray-600 dark:text-gray-400"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${c.iconBg} rounded-lg flex items-center justify-center`}>
                            <Loader2 className={`w-5 h-5 ${c.iconText} animate-spin`} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Processing Document
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Extracting text from scanned pages...
                            </p>
                        </div>
                    </div>

                    <div className="ml-2 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full ${c.stepBg} flex items-center justify-center`}>
                                <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-300">Document uploaded securely</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full ${c.stepBg} flex items-center justify-center`}>
                                <Loader2 className="w-3 h-3 text-white animate-spin" />
                            </div>
                            <span className={`text-xs ${c.stepText} font-medium`}>Analyzing page content...</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">3</span>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">Finalizing extraction</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full w-2/3 ${c.bar} rounded-full animate-pulse`} />
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                            This typically takes 1-2 minutes
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
