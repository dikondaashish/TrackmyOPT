"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    Download,
    Copy,
    RefreshCw,
    Sparkles,
    FileText,
    Code,
    Eye,
    Loader2,
    Check,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    Settings,
    Play,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useResumeStore } from "@/store/resume-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtsScorePanel } from "./components/AtsScorePanel";

export default function ResumeEditorPage() {
    const { toast } = useToast();


    // Store
    const {
        // Data
        resumeText, jobDescription, selectedTemplateId,
        generatedLatex, compiledPdfUrl, atsAnalysis,
        // Setters
        setGeneratedLatex, setCompiledPdfUrl, setAtsAnalysis,
        // Status
        isGenerating, setIsGenerating,
        isCompiling, setIsCompiling
    } = useResumeStore();

    // Local UI State
    const [isCopied, setIsCopied] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // UI States
    const [editorWidth, setEditorWidth] = useState(50); // Percentage
    const [showPreview, setShowPreview] = useState(true);

    // 1. Load data & Generate on Mount
    // 1. Generate on Mount if missing
    useEffect(() => {
        // Only generate if we have data and NO code yet
        // If we already have generatedLatex (from persistence), use it
        if (resumeText && jobDescription && selectedTemplateId && !generatedLatex && !isGenerating) {
            generateResume(resumeText, jobDescription, selectedTemplateId);
        }
    }, [resumeText, jobDescription, selectedTemplateId, generatedLatex]);

    // API: Generate Resume
    const generateResume = async (resume: string, job: string, template: string) => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/resume-generator/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: resume,
                    jobDescription: job,
                    templateId: template
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate resume');
            }

            setGeneratedLatex(data.latex);

            // Auto-compile after generation
            if (data.latex) {
                compilePdf(data.latex);
            }

            toast({
                title: "Resume Generated",
                description: "AI has tailored your resume to the job description.",
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Generation Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // API: Compile PDF
    const compilePdf = async (code: string) => {
        if (!code) return;
        setIsCompiling(true);
        try {
            const response = await fetch('/api/resume-generator/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latexCode: code })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Compilation failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setCompiledPdfUrl(url);

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Compilation Failed",
                description: "Could not create PDF preview. Please check LaTeX syntax.",
                variant: "destructive",
            });
        } finally {
            setIsCompiling(false);
        }
    };

    // API: Deep ATS Scan
    const handleDeepScan = async () => {
        if (!resumeText || !jobDescription || !generatedLatex) return;

        setIsScanning(true);
        try {
            const response = await fetch('/api/resume-generator/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,          // Original text (for content comparison)
                    jobDescription,
                    latexCode: generatedLatex // For formatting check
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Scan failed');
            }

            setAtsAnalysis(data);

            toast({
                title: "Deep Analysis Complete",
                description: "Gemini 2.5 Pro has analyzed your resume against the job description.",
            });

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Scan Failed",
                description: "Could not perform deep analysis.",
                variant: "destructive",
            });
        } finally {
            setIsScanning(false);
        }
    };

    // Handle Manual Regenerate
    const handleRegenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/resume-generator/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    jobDescription,
                    templateId: selectedTemplateId || "modern",
                    previousLatex: generatedLatex,
                    userFeedback: "Make it better" // TODO: Add UI for user feedback
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to regenerate resume');
            }

            setGeneratedLatex(data.latex);
            if (data.atsCheck) {
                setAtsAnalysis(data.atsCheck);
            }

            // Show toast
            toast({
                title: "Resume Regenerated",
                description: "AI has improved your resume based on the previous version.",
            });

            // Auto-compile
            if (data.latex) {
                compilePdf(data.latex);
            }

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Regeneration Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(generatedLatex);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({ description: "LaTeX code copied to clipboard" });
    }, [generatedLatex, toast]);

    const handleDownload = useCallback(() => {
        // If we have a compiled PDF, download that
        if (compiledPdfUrl) {
            const a = document.createElement("a");
            a.href = compiledPdfUrl;
            a.download = `resume_${selectedTemplateId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Fallback: Compile and download
            compilePdf(generatedLatex).then(() => {
                // The compile function sets pdfUrl, user has to click again or we automate it? 
                // For simplicity, just trigger compile if not ready.
                toast({ description: "Compiling PDF... click download again when ready." });
            });
        }
    }, [compiledPdfUrl, generatedLatex, selectedTemplateId, toast]);

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* Header */}
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
                                    <span className="text-xs text-blue-600 animate-pulse font-medium">✨ Generating with AI...</span>
                                ) : isCompiling ? (
                                    <span className="text-xs text-amber-600 animate-pulse font-medium">⚙️ Compiling PDF...</span>
                                ) : (
                                    <span className="text-xs text-green-600 font-medium">Ready</span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => compilePdf(generatedLatex)}
                                disabled={isCompiling || !generatedLatex}
                                className="hidden sm:flex items-center gap-1 text-gray-600"
                            >
                                <Play className="w-4 h-4" />
                                <span className="hidden lg:inline">Refresh PDF</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="hidden sm:flex items-center gap-1"
                            >
                                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {isCopied ? "Copied" : "Copy Source"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDownload}
                                disabled={!compiledPdfUrl && !generatedLatex}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-4 sm:px-6 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-1" />
                            )}
                            {isGenerating ? "Regenerating..." : "Regenerate with AI"}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowPreview(false); setEditorWidth(100); }}
                                className={`px-3 py-1 rounded ${!showPreview ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <Code className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowPreview(true); setEditorWidth(50); }}
                                className={`px-3 py-1 rounded ${showPreview && editorWidth === 50 ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowPreview(true); setEditorWidth(0); }}
                                className={`px-3 py-1 rounded ${showPreview && editorWidth === 0 ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* LaTeX Editor */}
                {editorWidth > 0 && (
                    <div
                        className="flex flex-col border-r border-gray-200 dark:border-gray-800"
                        style={{ width: showPreview ? `${editorWidth}%` : '100%' }}
                    >
                        {/* Editor Header */}
                        <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LaTeX Editor</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {generatedLatex.split('\n').length} lines
                            </span>
                        </div>

                        {/* Code Editor */}
                        <div className="flex-1 overflow-hidden">
                            <textarea
                                value={generatedLatex}
                                onChange={(e) => setGeneratedLatex(e.target.value)}
                                className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
                                spellCheck={false}
                                placeholder="LaTeX code will appear here..."
                                style={{
                                    lineHeight: '1.6',
                                    tabSize: 2,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Resize Handle */}
                {showPreview && editorWidth > 0 && editorWidth < 100 && (
                    <div className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize flex-shrink-0" />
                )}

                {/* PDF Preview */}
                {showPreview && (
                    <div
                        className="flex flex-col bg-gray-100 dark:bg-gray-800"
                        style={{ width: editorWidth === 0 ? '100%' : `${100 - editorWidth}%` }}
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
                                    onClick={() => compilePdf(generatedLatex)}
                                    disabled={isCompiling}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>

                            <TabsContent value="preview" className="flex-1 overflow-hidden flex justify-center bg-gray-200/50 dark:bg-gray-900/50 p-4 m-0 data-[state=inactive]:hidden">
                                {compiledPdfUrl ? (
                                    <iframe
                                        src={`${compiledPdfUrl}#toolbar=0&view=FitH`}
                                        className="w-full h-full max-w-[8.5in] bg-white shadow-2xl rounded-lg"
                                        title="Resume Preview"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-gray-500 w-full h-full">
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                                                <p>Generating tailored resume...</p>
                                            </>
                                        ) : isCompiling ? (
                                            <>
                                                <Loader2 className="w-10 h-10 animate-spin mb-4 text-amber-500" />
                                                <p>Compiling PDF...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-12 h-12 mb-4 opacity-50" />
                                                <p>PDF preview will appear here</p>
                                                <Button variant="link" onClick={() => compilePdf(generatedLatex)}>
                                                    Force Refresh
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="ats" className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 m-0 data-[state=inactive]:hidden">
                                <div className="max-w-2xl mx-auto">
                                    <div className="mb-4 flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={handleDeepScan}
                                            disabled={isScanning || isGenerating}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            {isScanning ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Scanning...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Run Deep ATS Scan (Gemini 2.5)
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <AtsScorePanel analysis={atsAnalysis} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
}
