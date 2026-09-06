"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Download,
    Copy,
    RefreshCw,
    Sparkles,
    Loader2,
    Check,
    Play,
    Cog,
    FileText,
    Save,
} from "lucide-react";

export type EditorHeaderProps = {
    isGenerating: boolean;
    isCompiling: boolean;
    isSaving: boolean;
    isCopied: boolean;
    isPlainCopied: boolean;
    isScanning: boolean;
    isAutoFixing: boolean;
    generatedLatex: string;
    compiledPdfUrl: string | null;
    onStartOver: () => void;
    onSave: () => void;
    onRefreshPdf: () => void;
    onCopy: () => void;
    onCopyPlainText: () => void;
    onDownload: () => void;
};

export function EditorHeader({
    isGenerating,
    isCompiling,
    isSaving,
    isCopied,
    isPlainCopied,
    isScanning,
    isAutoFixing,
    generatedLatex,
    compiledPdfUrl,
    onStartOver,
    onSave,
    onRefreshPdf,
    onCopy,
    onCopyPlainText,
    onDownload,
}: EditorHeaderProps) {
    return (
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Back Button */}
                    <Link
                        href="/dashboard/career/resume-generator/templates"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Templates</span>
                    </Link>

                    {/* Title + Status */}
                    <div className="text-center">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                            Resume Editor
                        </h1>
                        <div className="flex items-center justify-center gap-2 mt-0.5">
                            {isGenerating ? (
                                <span className="text-xs text-blue-600 animate-pulse font-medium inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Generating with AI...</span>
                            ) : isCompiling ? (
                                <span className="text-xs text-amber-600 animate-pulse font-medium inline-flex items-center gap-1"><Cog className="w-3.5 h-3.5" /> Compiling PDF...</span>
                            ) : (
                                <span className="text-xs text-green-600 font-medium">Ready</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onStartOver}
                            disabled={isGenerating || isCompiling}
                            className="hidden xl:flex items-center gap-1 text-gray-600"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Start over
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSave}
                            disabled={isSaving || !generatedLatex}
                            className="md:hidden min-h-11 min-w-11 p-0"
                            aria-label="Save resume"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSave}
                            disabled={isSaving || !generatedLatex}
                            className="hidden md:flex items-center gap-1 text-gray-600"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span className="hidden lg:inline">Save</span>
                        </Button>


                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefreshPdf}
                            disabled={isCompiling || !generatedLatex}
                            className="hidden sm:flex items-center gap-1 text-gray-600"
                        >
                            <Play className="w-4 h-4" />
                            <span className="hidden lg:inline">Refresh PDF</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCopy}
                            className="md:hidden min-h-11 min-w-11 p-0"
                            aria-label="Copy LaTeX source"
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCopy}
                            className="hidden md:flex items-center gap-1"
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {isCopied ? "Copied" : "Copy Source"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCopyPlainText}
                            disabled={!generatedLatex}
                            className="hidden lg:flex items-center gap-1"
                        >
                            {isPlainCopied ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            {isPlainCopied ? "Copied" : "Copy plain text"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={onDownload}
                            disabled={(!compiledPdfUrl && !generatedLatex) || isScanning || isAutoFixing}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {(isScanning || isAutoFixing) ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-1" />
                            )}
                            Download PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    );
}
