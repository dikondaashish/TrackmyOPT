"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { triggerUrlDownload } from "@/lib/browser-download";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Download,
    Copy,
    RefreshCw,
    Sparkles,
    Code,
    Loader2,
    Check,
    Play,
    Cog,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/resume-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizationFeedbackModal } from "./components/OptimizationFeedbackModal";
import { AtsScorePanel } from "./components/AtsScorePanel";
import { ApplyReadinessChecklist } from "./components/ApplyReadinessChecklist";
import { DownloadGateModal } from "./components/DownloadGateModal";
import { PdfSelectablePreview } from "./components/PdfSelectablePreview";
import { GeneratingOverlay } from "./components/GeneratingOverlay";
import { LatexToolbar, EditorViewMode } from "./components/LatexToolbar";
import { useEditorHistory } from "@/hooks/use-editor-history";
import { useStreamingEffect } from "@/hooks/use-streaming-effect";
import { supabase } from "@/lib/supabaseClient";
import { Save } from "lucide-react";
import { buildResumePdfFilename, extractNameFromLatex } from "@/lib/resume/build-resume-filename";
import { latexToPlainText } from "@/lib/resume/latex-to-plain-text";
import { extractPdfTextFromBlob } from "@/lib/resume/pdf-text-extract-client";
import { isDownloadGateRequired } from "@/lib/resume/apply-readiness";
import { ATS_PASS_SCORE, buildAutoRegenFeedback, type AtsAnalysis } from "@/lib/resume/ats-analysis-types";
import { captureClientEvent } from "@/lib/posthog-client";
import {
    findTextInLatex,
    getTextareaSelection,
    scrollTextareaToMatch,
} from "@/lib/resume/latex-text-sync";

export default function ResumeEditorPage() {
    const { toast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const searchParams = useSearchParams();
    const autoRegenAttempts = useRef(0);
    const skipNextAutoRegen = useRef(false);

    // Store
    const {
        resumeText, jobDescription, selectedTemplateId, jobTitle, applicationId,
        generatedLatex, compiledPdfUrl, atsAnalysis,
        setGeneratedLatex, setCompiledPdfUrl, setAtsAnalysis, setApplicationId,
        isGenerating, setIsGenerating,
        isCompiling, setIsCompiling
    } = useResumeStore();

    // Local UI State
    const [isCopied, setIsCopied] = useState(false);
    const [isPlainCopied, setIsPlainCopied] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showDownloadGate, setShowDownloadGate] = useState(false);
    const [pdfParseOk, setPdfParseOk] = useState<boolean | null>(null);
    const [isAutoFixing, setIsAutoFixing] = useState(false);
    const [compiledPdfBlob, setCompiledPdfBlob] = useState<Blob | null>(null);
    const [pdfHighlightQuery, setPdfHighlightQuery] = useState<string | null>(null);

    // View Mode State
    const [viewMode, setViewMode] = useState<EditorViewMode>('split');
    const [editorWidth, setEditorWidth] = useState(50); // Percentage
    const [showPreview, setShowPreview] = useState(true);

    // History Hook
    // We wrap setGeneratedLatex to be the "onUpdate"
    // Note: useEditorHistory manages the history stack locally
    const {
        updateText,
        undo,
        redo,
        canUndo,
        canRedo,
        text: historyText
    } = useEditorHistory(generatedLatex, setGeneratedLatex);

    // Streaming Effect
    const [isStreamingEnabled, setIsStreamingEnabled] = useState(false);

    const { displayedText, isStreaming, stopStreaming } = useStreamingEffect({
        text: generatedLatex,
        isEnabled: isStreamingEnabled,
        speed: 3, // ~4× faster than 12ms; interval between chunk ticks (1–3 chars each)
        onComplete: () => {
            setIsStreamingEnabled(false);
            // Sync history with the full generated text once streaming is done/stopped
            updateText(generatedLatex, true);
        }
    });

    // While streaming: only auto-scroll the editor if the user is already near the bottom.
    // This lets them scroll up/down freely to read earlier LaTeX without being yanked back down.
    useEffect(() => {
        if (!isStreaming) return;
        const el = textareaRef.current;
        if (!el) return;

        const nearBottomPx = 120;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom > nearBottomPx) return;

        requestAnimationFrame(() => {
            const ta = textareaRef.current;
            if (!ta) return;
            ta.scrollTop = ta.scrollHeight;
        });
    }, [displayedText, isStreaming]);

    // Use streaming text if active, otherwise history text
    // If generating OR streaming is enabled but not started (transition) -> show empty to trigger overlay/prevent flash
    const editorValue = ((isGenerating || isStreamingEnabled) && !isStreaming) ? "" : (isStreaming ? displayedText : historyText);

    // Sync View Mode
    const handleViewModeChange = (mode: EditorViewMode) => {
        const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
        const nextMode = isMobile && mode === "split" ? "visual" : mode;
        setViewMode(nextMode);
        switch (nextMode) {
            case 'code':
                setShowPreview(false);
                setEditorWidth(100);
                break;
            case 'visual':
                setShowPreview(true);
                setEditorWidth(0);
                break;
            case 'split':
                setShowPreview(true);
                setEditorWidth(50);
                break;
        }
    };

    // 1. Load data & Generate on Mount (run once)
    useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
            setViewMode("visual");
            setShowPreview(true);
            setEditorWidth(0);
        }
    }, []);

    useEffect(() => {
        const appId = searchParams.get("applicationId");
        if (appId) setApplicationId(appId);
    }, [searchParams, setApplicationId]);

    useEffect(() => {
        if (resumeText && jobDescription && selectedTemplateId && !generatedLatex && !isGenerating) {
            generateResume(resumeText, jobDescription, selectedTemplateId);
        } else if (generatedLatex && !compiledPdfUrl && !isCompiling) {
            compilePdf(generatedLatex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle Text Insertion from Toolbar
    const handleInsert = (startTag: string, endTag: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value; // Use actual textarea content, not potentially stale store state
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + startTag + selection + endTag + after;

        updateText(newText);

        // Restore focus and cursor (approximate, usually inside tags)
        setTimeout(() => {
            textarea.focus();
            // Place cursor after insertion

            if (selection.length === 0) {
                textarea.setSelectionRange(start + startTag.length, start + startTag.length);
            } else {
                textarea.setSelectionRange(start + startTag.length, start + startTag.length + selection.length);
            }
        }, 0);
    };

    const buildPdfFilename = useCallback((): string => {
        return buildResumePdfFilename({
            latex: generatedLatex,
            jobDescription,
            jobTitle,
            templateId: selectedTemplateId,
        });
    }, [generatedLatex, jobDescription, jobTitle, selectedTemplateId]);

    const saveResumeToHistory = useCallback(
        async (latex: string, analysis: AtsAnalysis | null) => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const filename = buildResumePdfFilename({
                    latex,
                    jobDescription,
                    jobTitle,
                    templateId: selectedTemplateId,
                });

                await fetch(`/api/proxy/resume/save`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        filename,
                        content: resumeText,
                        structuredData: {
                            latexCode: latex,
                            jobDescription,
                            jobTitle,
                            applicationId,
                            atsAnalysis: analysis,
                            atsScore: analysis?.score ?? null,
                            templateId: selectedTemplateId,
                            resumeStatus: (analysis?.score ?? 0) >= ATS_PASS_SCORE ? "ready" : "draft",
                            type: "generated",
                        },
                    }),
                });
            } catch (error) {
                console.error("Auto-save failed:", error);
            }
        },
        [applicationId, jobDescription, jobTitle, resumeText, selectedTemplateId]
    );

    const runDeepScan = useCallback(
        async (latex: string, silent = false): Promise<AtsAnalysis | null> => {
            if (!jobDescription || !latex) return null;

            setIsScanning(true);
            try {
                const generatedText = latexToPlainText(latex);
                const response = await fetch("/api/resume-generator/scan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resumeText: generatedText,
                        generatedText,
                        jobDescription,
                        latexCode: latex,
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Scan failed");

                setAtsAnalysis(data);
                if (!silent) {
                    toast({
                        title: "Analysis complete",
                        description: `ATS score: ${data.score ?? "—"}/100`,
                    });
                }
                return data as AtsAnalysis;
            } catch (error) {
                console.error(error);
                if (!silent) {
                    toast({
                        title: "Scan Failed",
                        description: "Could not perform deep analysis.",
                        variant: "destructive",
                    });
                }
                return null;
            } finally {
                setIsScanning(false);
            }
        },
        [jobDescription, setAtsAnalysis, toast]
    );

    const runAutoRegenerate = useCallback(
        async (analysis: AtsAnalysis | null) => {
            if (autoRegenAttempts.current >= 2) return;
            if (!analysis || (analysis.score ?? 0) >= ATS_PASS_SCORE) return;
            if (!(analysis.keywordMatch?.missing?.length ?? 0)) return;

            autoRegenAttempts.current += 1;
            setIsAutoFixing(true);
            skipNextAutoRegen.current = true;

            try {
                const feedback = buildAutoRegenFeedback(analysis);
                const response = await fetch("/api/resume-generator/regenerate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resumeText,
                        jobDescription,
                        templateId: selectedTemplateId || "professional",
                        previousLatex: generatedLatex,
                        userFeedback: feedback,
                        atsAnalysis: analysis,
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Regenerate failed");

                updateText(data.latex, false);
                setIsStreamingEnabled(true);
                if (data.atsCheck) setAtsAnalysis(data.atsCheck);

                toast({
                    title: "Auto-improving resume",
                    description: `Attempt ${autoRegenAttempts.current}/2 — targeting missing keywords.`,
                });

                if (data.latex) await compilePdf(data.latex, 0, true);
            } catch (error) {
                console.error(error);
            } finally {
                setIsAutoFixing(false);
            }
        },
        [generatedLatex, jobDescription, resumeText, selectedTemplateId, setAtsAnalysis, toast, updateText]
    );

    const postCompilePipeline = useCallback(
        async (latex: string, blob: Blob, options?: { allowAutoRegen?: boolean }) => {
            const allowAutoRegen = options?.allowAutoRegen !== false;
            const name = extractNameFromLatex(latex);
            const pdfResult = await extractPdfTextFromBlob(blob, name);
            setPdfParseOk(pdfResult.ok);
            if (!pdfResult.ok && pdfResult.warning) {
                toast({
                    title: "ATS parse risk",
                    description: pdfResult.warning,
                    variant: "destructive",
                });
            }

            const analysis = await runDeepScan(latex, true);
            if (analysis) {
                await saveResumeToHistory(latex, analysis);
                if (allowAutoRegen && !skipNextAutoRegen.current) {
                    await runAutoRegenerate(analysis);
                }
                skipNextAutoRegen.current = false;
            }
        },
        [runDeepScan, runAutoRegenerate, saveResumeToHistory, toast]
    );

    // API: Generate Resume
    const generateResume = async (resume: string, job: string, template: string) => {
        setIsGenerating(true);
        autoRegenAttempts.current = 0;

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

            updateText(data.latex, false);
            setIsStreamingEnabled(true);

            if (data.atsCheck) {
                setAtsAnalysis({ ...data.atsCheck, score: data.atsCheck.score ?? 0 });
            }

            if (data.latex) {
                await compilePdf(data.latex);
            }

            toast({
                title: "Resume Generated",
                description: "AI has tailored your resume to the job description.",
            });

        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast({
                title: "Generation Failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // API: Compile PDF
    const compilePdf = async (
        code: string,
        retryCount = 0,
        fromAutoRegen = false,
        allowAutoRegen = true
    ) => {
        if (!code) return;
        setIsCompiling(true);
        setCompiledPdfBlob(null);
        setPdfHighlightQuery(null);
        try {
            const response = await fetch('/api/resume-generator/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latexCode: code })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Compilation failed';

                if (retryCount === 0) {
                    toast({
                        title: "Syntax Error Detected",
                        description: "AI is automatically fixing the LaTeX code...",
                        variant: "default",
                    });

                    const fixResponse = await fetch('/api/resume-generator/fix-latex', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            latexCode: code,
                            errorMessage: errorMessage
                        })
                    });

                    const fixData = await fixResponse.json();

                    if (fixResponse.ok && fixData.latex) {
                        updateText(fixData.latex, false);
                        await compilePdf(fixData.latex, 1, fromAutoRegen, allowAutoRegen);
                        return;
                    }
                }

                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const prevUrl = useResumeStore.getState().compiledPdfUrl;
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            setCompiledPdfUrl(url);
            setCompiledPdfBlob(blob);
            setPdfHighlightQuery(null);

            if (!fromAutoRegen) {
                skipNextAutoRegen.current = false;
            }
            await postCompilePipeline(code, blob, { allowAutoRegen });

        } catch (error: unknown) {
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

    useEffect(() => {
        return () => {
            const currentUrl = useResumeStore.getState().compiledPdfUrl;
            if (currentUrl) URL.revokeObjectURL(currentUrl);
        };
    }, []);

    const handleDeepScan = async () => {
        if (!generatedLatex) return;
        await runDeepScan(generatedLatex);
    };

    // Handle Manual Regenerate
    const handleRegenerate = async (feedback: string) => {
        setIsGenerating(true);
        setShowFeedbackModal(false); // Close modal on start

        try {
            const response = await fetch('/api/resume-generator/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    jobDescription,
                    templateId: selectedTemplateId || "professional",
                    previousLatex: generatedLatex,
                    userFeedback: feedback,
                    atsAnalysis // Pass ATS data to backend
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to regenerate resume');
            }

            updateText(data.latex, false);
            setIsStreamingEnabled(true);
            if (data.atsCheck) {
                setAtsAnalysis(data.atsCheck);
            }

            // Show toast
            toast({
                title: "Resume Regenerated",
                description: "AI has improved your resume based on your feedback.",
            });

            // Auto-compile
            if (data.latex) {
                compilePdf(data.latex);
            }

        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast({
                title: "Regeneration Failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLatexSelectionSync = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea || isStreaming) return;

        const selected = getTextareaSelection(textarea);
        if (selected) {
            setPdfHighlightQuery(selected);
        }
    }, [isStreaming]);

    const handlePdfTextSelect = useCallback(
        (text: string) => {
            const latex = textareaRef.current?.value ?? generatedLatex;
            const match = findTextInLatex(latex, text);
            if (match && textareaRef.current) {
                scrollTextareaToMatch(textareaRef.current, match.index, match.length);
            }
        },
        [generatedLatex]
    );

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(generatedLatex);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({ description: "LaTeX code copied to clipboard" });
    }, [generatedLatex, toast]);

    const handleCopyPlainText = useCallback(() => {
        const plain = latexToPlainText(generatedLatex);
        navigator.clipboard.writeText(plain);
        setIsPlainCopied(true);
        setTimeout(() => setIsPlainCopied(false), 2000);
        toast({ description: "Plain text copied — paste into job portals" });
    }, [generatedLatex, toast]);

    const performDownload = useCallback(() => {
        if (!compiledPdfUrl) return;
        triggerUrlDownload(compiledPdfUrl, buildPdfFilename());
    }, [buildPdfFilename, compiledPdfUrl]);

    const handleDownloadAnyway = useCallback(() => {
        captureClientEvent("resume_download_anyway", {
            ats_score: atsAnalysis?.score ?? null,
            application_id: applicationId,
        });
        setShowDownloadGate(false);
        performDownload();
    }, [applicationId, atsAnalysis?.score, performDownload]);

    const handleDownload = useCallback(() => {
        try {
            if (!compiledPdfUrl) {
                compilePdf(generatedLatex);
                toast({ description: "Compiling PDF... click download again when ready." });
                return;
            }

            const needsGate = isDownloadGateRequired({
                latex: generatedLatex,
                jobDescription,
                jobTitle,
                templateId: selectedTemplateId,
                atsAnalysis,
                pdfParseOk,
            });

            if (needsGate) {
                setShowDownloadGate(true);
                return;
            }

            performDownload();
        } catch (err) {
            console.error("[handleDownload] failed:", err);
            toast({ description: "Download failed. Please try again.", variant: "destructive" });
        }
    }, [atsAnalysis, generatedLatex, compilePdf, jobDescription, jobTitle, pdfParseOk, performDownload, compiledPdfUrl, selectedTemplateId, toast]);

    const handleFixAndDownload = useCallback(async () => {
        setShowDownloadGate(false);
        if (atsAnalysis) {
            await runAutoRegenerate(atsAnalysis);
        } else if (generatedLatex) {
            await runDeepScan(generatedLatex, true);
        }
    }, [atsAnalysis, generatedLatex, runAutoRegenerate, runDeepScan]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!generatedLatex) return;
        setIsSaving(true);
        try {
            await saveResumeToHistory(generatedLatex, atsAnalysis);
            toast({
                title: "Resume Saved",
                description: "Saved with smart filename and ATS score.",
            });
        } catch (error) {
            console.error("Save error:", error);
            toast({
                title: "Save Failed",
                description: "Could not save your resume. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-md:-mx-3 max-md:-my-3 max-md:min-h-[calc(100dvh-3.5rem-var(--tmopt-dashboard-promo,0px)-0.5rem)] md:h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* Feedback Modal */}
            <OptimizationFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onConfirm={handleRegenerate}
                isGenerating={isGenerating}
            />
            <DownloadGateModal
                open={showDownloadGate}
                onOpenChange={setShowDownloadGate}
                score={atsAnalysis?.score ?? 0}
                onFixAutomatically={handleFixAndDownload}
                onDownloadAnyway={handleDownloadAnyway}
                isFixing={isAutoFixing || isGenerating}
            />

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
                                variant="outline"
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || !generatedLatex}
                                className="md:hidden min-h-11 min-w-11 p-0"
                                aria-label="Save resume"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || !generatedLatex}
                                className="hidden md:flex items-center gap-1 text-gray-600"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span className="hidden lg:inline">Save</span>
                            </Button>


                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => compilePdf(generatedLatex, 0, false, false)}
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
                                className="md:hidden min-h-11 min-w-11 p-0"
                                aria-label="Copy LaTeX source"
                            >
                                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="hidden md:flex items-center gap-1"
                            >
                                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {isCopied ? "Copied" : "Copy Source"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyPlainText}
                                disabled={!generatedLatex}
                                className="hidden lg:flex items-center gap-1"
                            >
                                {isPlainCopied ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                {isPlainCopied ? "Copied" : "Copy plain text"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDownload}
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

            {/* Toolbar - NEW */}
            <LatexToolbar
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                onInsert={handleInsert}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
            />

            {/* Main Editor Area */}
            <div className="flex-1 flex max-md:flex-col overflow-hidden">
                {/* LaTeX Editor */}
                {/* Note: We keep the container even if width is "0" to keep state alive, 
                    but simpler to just condition on viewMode for now or use hidden class 
                */}
                <div
                    className={`flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-300 max-md:!w-full max-md:flex-1 ${viewMode === 'visual' ? 'hidden' : 'block'}`}
                    style={{ width: viewMode === 'code' ? '100%' : viewMode === 'split' ? '50%' : '0%' }}
                >
                    {/* Editor Header */}
                    <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LaTeX Editor</span>
                            <span className="hidden lg:inline text-xs text-gray-400">Select text to locate in PDF →</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFeedbackModal(true)}
                                disabled={isGenerating}
                                className="h-6 px-2 text-xs text-purple-600"
                            >
                                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                Optimize
                            </Button>
                            <span className="text-xs text-gray-400">
                                {generatedLatex.split('\n').length} lines
                            </span>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 overflow-hidden relative group">
                        <textarea
                            ref={textareaRef}
                            value={editorValue}
                            onChange={(e) => {
                                if (!isStreaming) updateText(e.target.value);
                            }}
                            onMouseUp={handleLatexSelectionSync}
                            onKeyUp={handleLatexSelectionSync}
                            readOnly={isStreaming}
                            className={`w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none ${isStreaming ? 'cursor-not-allowed opacity-90' : ''}`}
                            spellCheck={false}
                            placeholder="LaTeX code will appear here..."
                            style={{
                                lineHeight: '1.6',
                                tabSize: 2,
                            }}
                        />

                        {/* AI Generating Overlay — shown while waiting for Gemini */}
                        {isGenerating && !editorValue && <GeneratingOverlay />}

                        {/* Stop Streaming Button */}
                        {isStreaming && (
                            <div className="absolute bottom-6 right-6 z-10">
                                <Button
                                    onClick={stopStreaming}
                                    variant="secondary"
                                    size="sm"
                                    className="shadow-lg bg-white text-gray-900 hover:bg-gray-100"
                                >
                                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                                    Stop Generating
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* PDF Preview */}
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
                                onClick={() => compilePdf(generatedLatex, 0, false, false)}
                                disabled={isCompiling}
                            >
                                <RefreshCw className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        <TabsContent value="preview" className="flex-1 overflow-hidden flex justify-center bg-gray-200/50 dark:bg-gray-900/50 m-0 data-[state=inactive]:hidden">
                            {isGenerating || isCompiling ? (
                                <div className="flex flex-col items-center justify-center p-8 text-gray-500 w-full h-full">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                                    <p>{isGenerating ? "Generating tailored resume…" : "Compiling PDF…"}</p>
                                </div>
                            ) : compiledPdfBlob ? (
                                <div className="w-full h-full max-w-[8.5in]">
                                    <PdfSelectablePreview
                                        blob={compiledPdfBlob}
                                        onTextSelect={handlePdfTextSelect}
                                        highlightQuery={pdfHighlightQuery}
                                    />
                                </div>
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
                                            <div className="animate-pulse flex flex-col items-center">
                                                <RefreshCw className="w-12 h-12 mb-4 opacity-50" />
                                                <p>Waiting for compilation...</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
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
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={handleDeepScan}
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
            </div>
        </div >
    );
}
