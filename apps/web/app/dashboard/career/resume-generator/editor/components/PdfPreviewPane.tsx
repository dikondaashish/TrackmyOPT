"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AtsScorePanel } from "./AtsScorePanel";
import { ApplyReadinessChecklist } from "./ApplyReadinessChecklist";
import { PdfSelectablePreview } from "./PdfSelectablePreview";
import { ATS_PASS_SCORE, type AtsAnalysis } from "@/lib/resume/ats-analysis-types";
import type { EditorViewMode } from "./LatexToolbar";

export type PdfPreviewPaneProps = {
    viewMode: EditorViewMode;
    generatedLatex: string;
    jobDescription: string;
    jobTitle: string | null;
    selectedTemplateId: string | null;
    atsAnalysis: AtsAnalysis | null;
    pdfParseOk: boolean | null;
    compiledPdfBlob: Blob | null;
    compileFailed: boolean;
    isGenerating: boolean;
    isCompiling: boolean;
    isScanning: boolean;
    isAutoFixing: boolean;
    pdfHighlightQuery: string | null;
    onRefreshPdf: () => void;
    onPdfTextSelect: (text: string) => void;
    onImproveForAts: () => void;
    onDeepScan: () => void;
};

export function PdfPreviewPane({
    viewMode,
    generatedLatex,
    jobDescription,
    jobTitle,
    selectedTemplateId,
    atsAnalysis,
    pdfParseOk,
    compiledPdfBlob,
    compileFailed,
    isGenerating,
    isCompiling,
    isScanning,
    isAutoFixing,
    pdfHighlightQuery,
    onRefreshPdf,
    onPdfTextSelect,
    onImproveForAts,
    onDeepScan,
}: PdfPreviewPaneProps) {
    return (
        <div
            className={`flex flex-col bg-gray-100 dark:bg-gray-800 transition-all duration-300 max-md:!w-full max-md:flex-1 ${viewMode === 'code' ? 'hidden' : 'block'}`}
            style={{ width: viewMode === 'visual' ? '100%' : viewMode === 'split' ? '50%' : '0%' }}
        >
            {/* Preview Content */}
            <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <TabsList className="h-8">
                        <TabsTrigger value="preview" className="text-xs">PDF Preview</TabsTrigger>
                        <TabsTrigger value="ats" className="text-xs">
                            ATS Analysis
                            {atsAnalysis && !atsAnalysis.passed && (
                                <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefreshPdf}
                        disabled={isCompiling}
                    >
                        <RefreshCw className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <TabsContent value="preview" className="flex-1 overflow-hidden flex justify-center bg-gray-200/50 dark:bg-gray-900/50 m-0 data-[state=inactive]:hidden">
                    <div className="relative flex h-full w-full items-center justify-center">
                        {compiledPdfBlob ? (
                            <div className="h-full w-full max-w-[8.5in]">
                                <PdfSelectablePreview
                                    blob={compiledPdfBlob}
                                    onTextSelect={onPdfTextSelect}
                                    highlightQuery={pdfHighlightQuery}
                                />
                            </div>
                        ) : compileFailed && generatedLatex ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center text-gray-600 dark:text-gray-400">
                                <p className="max-w-sm">PDF preview could not be generated. Try Refresh PDF, or edit the LaTeX and compile again.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRefreshPdf}
                                    disabled={isCompiling}
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isCompiling ? 'animate-spin' : ''}`} />
                                    Retry compile
                                </Button>
                            </div>
                        ) : isGenerating || isCompiling ? null : (
                            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-gray-500">
                                <div className="flex flex-col items-center">
                                    <RefreshCw className="mb-4 h-12 w-12 opacity-50" />
                                    <p>Waiting for compilation...</p>
                                </div>
                            </div>
                        )}
                        {(isGenerating || isCompiling) && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 p-8 text-gray-600 dark:bg-gray-950/95 dark:text-gray-300">
                                <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-500" />
                                <p className="text-sm font-medium">
                                    {isGenerating ? "Generating tailored resume…" : "Compiling PDF…"}
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="ats" className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 m-0 data-[state=inactive]:hidden">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <ApplyReadinessChecklist
                            input={{
                                latex: generatedLatex,
                                jobDescription,
                                jobTitle,
                                templateId: selectedTemplateId,
                                atsAnalysis,
                                pdfParseOk,
                            }}
                        />
                        {atsAnalysis && (!atsAnalysis.passed || (atsAnalysis.score ?? 0) < ATS_PASS_SCORE) && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/70 dark:bg-blue-950/30">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                                            Improve this resume for ATS
                                        </h3>
                                        <p className="text-xs leading-5 text-blue-800 dark:text-blue-200">
                                            Strengthens supported keyword placement and bullets for this job. It preserves your real experience and credentials.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={onImproveForAts}
                                        disabled={isScanning || isGenerating || isAutoFixing || !generatedLatex}
                                        className="min-h-11 shrink-0 bg-blue-600 px-4 text-white hover:bg-blue-700"
                                    >
                                        {isGenerating || isAutoFixing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Improving…
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Fix resume for ATS
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                onClick={onDeepScan}
                                disabled={isScanning || isGenerating || !generatedLatex}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Re-run ATS analysis
                                    </>
                                )}
                            </Button>
                        </div>
                        <AtsScorePanel analysis={atsAnalysis} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
