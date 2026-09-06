"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useResumeStore } from "@/store/resume-store";
import { OptimizationFeedbackModal } from "./components/OptimizationFeedbackModal";
import { DownloadGateModal } from "./components/DownloadGateModal";
import { LatexToolbar, EditorViewMode } from "./components/LatexToolbar";
import { EditorHeader } from "./components/EditorHeader";
import { LatexEditorPane } from "./components/LatexEditorPane";
import { PdfPreviewPane } from "./components/PdfPreviewPane";
import { useEditorHistory } from "@/hooks/useEditorHistory";
import { useStreamingEffect } from "@/hooks/useStreamingEffect";
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from "@/lib/resume/resume-text-limits";
import { PricingModal } from "@/components/pricing/PricingModal";
import { ResumeCreditTopUpModal } from "@/components/dashboard/resume/ResumeCreditTopUpModal";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import {
    findTextInLatex,
    getTextareaSelection,
    scrollTextareaToMatch,
} from "@/lib/resume/latex-text-sync";
import { latexToPlainText } from "@/lib/resume/latex-to-plain-text";
import { useResumeEditorActions } from "./useResumeEditorActions";

export default function ResumeEditorPage() {
    const { toast } = useToast();
    const premium = usePremiumStatus();
    const npsPlanTier = premium.planName === "dedicated"
        ? "dedicated"
        : premium.isPremium === true
            ? "pro"
            : "free";
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const generationStartedRef = useRef(false);
    const stopStreamingRef = useRef<() => void>(() => {});
    const searchParams = useSearchParams();
    const handoffLoadedRef = useRef(false);
    const handoffId = searchParams.get("handoffId");

    const {
        resumeText, jobDescription, selectedTemplateId,
        generatedLatex, compiledPdfUrl,
        setResumeText, setJobDescription, setSelectedTemplateId,
        setGeneratedLatex, setCompiledPdfUrl, setAtsAnalysis, setApplicationId,
        isGenerating, isCompiling,
    } = useResumeStore();

    const [isCopied, setIsCopied] = useState(false);
    const [isPlainCopied, setIsPlainCopied] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [pendingHandoffLatex, setPendingHandoffLatex] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<EditorViewMode>('split');
    const [, setEditorWidth] = useState(50);
    const [, setShowPreview] = useState(true);

    const {
        updateText,
        undo,
        redo,
        canUndo,
        canRedo,
        text: historyText
    } = useEditorHistory(generatedLatex, setGeneratedLatex);

    const {
        isScanning,
        showDownloadGate,
        setShowDownloadGate,
        showPricingModal,
        setShowPricingModal,
        showCreditModal,
        setShowCreditModal,
        resumeCreditBalance,
        setResumeCreditBalance,
        pdfParseOk,
        isAutoFixing,
        compiledPdfBlob,
        compileFailed,
        isStreamingEnabled,
        setIsStreamingEnabled,
        isSaving,
        pdfHighlightQuery,
        setPdfHighlightQuery,
        atsAnalysis,
        jobTitle,
        generateResume,
        compilePdf,
        handleDeepScan,
        handleRegenerate,
        handleImproveForAts,
        handleDownload,
        handleDownloadAnyway,
        handleFixAndDownload,
        handleStartOver,
        handleSave,
    } = useResumeEditorActions({
        updateText,
        stopStreaming: () => stopStreamingRef.current(),
        npsPlanTier,
    });

    const { displayedText, isStreaming, stopStreaming } = useStreamingEffect({
        text: generatedLatex,
        isEnabled: isStreamingEnabled,
        speed: 16,
        chunkSize: 48,
        onComplete: () => {
            setIsStreamingEnabled(false);
            updateText(generatedLatex, true);
        }
    });
    stopStreamingRef.current = stopStreaming;

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

    const editorValue = ((isGenerating || isStreamingEnabled) && !isStreaming) ? "" : (isStreaming ? displayedText : historyText);

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

    const [storeHydrated, setStoreHydrated] = useState(
        () => useResumeStore.persist.hasHydrated()
    );

    useEffect(() => {
        if (storeHydrated) return;
        return useResumeStore.persist.onFinishHydration(() => {
            setStoreHydrated(true);
        });
    }, [storeHydrated]);

    useEffect(() => {
        if (!storeHydrated) return;
        if (handoffId) return;
        const resumePrep = prepareResumeText(resumeText.trim());
        const jobPrep = prepareResumeText(jobDescription.trim(), JOB_DESCRIPTION_MAX_CHARS);
        if (resumePrep.truncated || jobPrep.truncated) {
            toast({
                title: "Resume trimmed for AI",
                description: [
                    resumePrep.truncated
                        ? `Resume shortened from ${resumePrep.originalLength.toLocaleString()} to ${resumePrep.text.length.toLocaleString()} characters (max ${RESUME_TEXT_MAX_CHARS.toLocaleString()}).`
                        : null,
                    jobPrep.truncated
                        ? `Job description shortened to ${jobPrep.text.length.toLocaleString()} characters.`
                        : null,
                ]
                    .filter(Boolean)
                    .join(" "),
            });
        }
        if (
            resumePrep.text &&
            jobPrep.text &&
            selectedTemplateId &&
            !generatedLatex &&
            !isGenerating &&
            !generationStartedRef.current
        ) {
            generationStartedRef.current = true;
            void generateResume(resumePrep.text, jobPrep.text, selectedTemplateId);
        } else if (generatedLatex && !compiledPdfUrl && !isCompiling) {
            compilePdf(generatedLatex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeHydrated, handoffId]);

    const handleInsert = (startTag: string, endTag: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + startTag + selection + endTag + after;

        updateText(newText);

        setTimeout(() => {
            textarea.focus();
            if (selection.length === 0) {
                textarea.setSelectionRange(start + startTag.length, start + startTag.length);
            } else {
                textarea.setSelectionRange(start + startTag.length, start + startTag.length + selection.length);
            }
        }, 0);
    };

    useEffect(() => {
        if (!pendingHandoffLatex) return;
        const latex = pendingHandoffLatex;
        setPendingHandoffLatex(null);
        void compilePdf(latex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingHandoffLatex]);

    useEffect(() => {
        if (!storeHydrated || !handoffId || handoffLoadedRef.current) return;
        handoffLoadedRef.current = true;

        const loadExtensionHandoff = async () => {
            try {
                const response = await fetch(
                    `/api/resume-generator/extension-handoff?handoffId=${encodeURIComponent(handoffId)}`,
                    { cache: "no-store" }
                );
                const result = await response.json();
                if (!response.ok || !result?.payload) {
                    throw new Error(result?.error || "Could not open generated resume");
                }

                const payload = result.payload as {
                    latex?: string;
                    resumeText?: string;
                    resumeFilename?: string;
                    jobDescription?: string;
                    jobTitle?: string | null;
                    templateId?: string;
                    applicationId?: string | null;
                };
                if (!payload.latex || !payload.resumeText || !payload.jobDescription) {
                    throw new Error("Generated resume data is incomplete");
                }

                const previousPdfUrl = useResumeStore.getState().compiledPdfUrl;
                if (previousPdfUrl) URL.revokeObjectURL(previousPdfUrl);
                setCompiledPdfUrl("");
                setResumeText(payload.resumeText, payload.resumeFilename || "resume");
                setJobDescription(payload.jobDescription, payload.jobTitle || undefined);
                if (payload.templateId) setSelectedTemplateId(payload.templateId);
                if (payload.applicationId) setApplicationId(payload.applicationId);
                setAtsAnalysis(null);
                setIsStreamingEnabled(false);
                updateText(payload.latex, true);

                const mobile = window.matchMedia("(max-width: 767px)").matches;
                setViewMode(mobile ? "code" : "split");
                setShowPreview(!mobile);
                setEditorWidth(mobile ? 100 : 50);

                setPendingHandoffLatex(payload.latex);
                toast({
                    title: "Custom resume opened",
                    description: "Your generated LaTeX is ready to edit.",
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Could not open generated resume";
                toast({
                    title: "Resume handoff failed",
                    description: message,
                    variant: "destructive",
                });
            }
        };

        void loadExtensionHandoff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handoffId, storeHydrated]);

    useEffect(() => {
        return () => {
            const currentUrl = useResumeStore.getState().compiledPdfUrl;
            if (currentUrl) URL.revokeObjectURL(currentUrl);
        };
    }, []);

    const handleLatexSelectionSync = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea || isStreaming) return;

        const selected = getTextareaSelection(textarea);
        if (selected) {
            setPdfHighlightQuery(selected);
        }
    }, [isStreaming, setPdfHighlightQuery]);

    const handlePdfTextSelect = useCallback(
        (text: string) => {
            const jump = () => {
                const textarea = textareaRef.current;
                const latex = textarea?.value ?? generatedLatex;
                const match = findTextInLatex(latex, text);
                if (match && textarea) {
                    scrollTextareaToMatch(textarea, match.index, match.length);
                }
            };

            if (viewMode === "visual") {
                setViewMode("split");
                setShowPreview(true);
                setEditorWidth(50);
                requestAnimationFrame(() => requestAnimationFrame(jump));
                return;
            }

            jump();
        },
        [generatedLatex, viewMode]
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

    const onRegenerate = async (feedback: string) => {
        setShowFeedbackModal(false);
        await handleRegenerate(feedback);
    };

    return (
        <div className="max-md:-mx-3 max-md:-my-3 max-md:min-h-[calc(100dvh-3.5rem-var(--tmopt-dashboard-promo,0px)-0.5rem)] md:h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <OptimizationFeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onConfirm={onRegenerate}
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

            <PricingModal
                open={showPricingModal}
                onClose={() => setShowPricingModal(false)}
                isPremium={premium.isPremium === true}
            />
            <ResumeCreditTopUpModal
                open={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                currentBalance={resumeCreditBalance}
                onUsageUpdated={(usage) =>
                    setResumeCreditBalance(usage.resumeCreditBalance)
                }
            />

            <EditorHeader
                isGenerating={isGenerating}
                isCompiling={isCompiling}
                isSaving={isSaving}
                isCopied={isCopied}
                isPlainCopied={isPlainCopied}
                isScanning={isScanning}
                isAutoFixing={isAutoFixing}
                generatedLatex={generatedLatex}
                compiledPdfUrl={compiledPdfUrl}
                onStartOver={handleStartOver}
                onSave={handleSave}
                onRefreshPdf={() => compilePdf(generatedLatex, 0, false, false)}
                onCopy={handleCopy}
                onCopyPlainText={handleCopyPlainText}
                onDownload={handleDownload}
            />

            <LatexToolbar
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                onInsert={handleInsert}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
            />

            <div className="flex-1 flex max-md:flex-col overflow-hidden">
                <LatexEditorPane
                    viewMode={viewMode}
                    textareaRef={textareaRef}
                    editorValue={editorValue}
                    generatedLatex={generatedLatex}
                    isGenerating={isGenerating}
                    isStreaming={isStreaming}
                    onChangeText={updateText}
                    onSelectionSync={handleLatexSelectionSync}
                    onOpenFeedback={() => setShowFeedbackModal(true)}
                    onStopStreaming={stopStreaming}
                />
                <PdfPreviewPane
                    viewMode={viewMode}
                    generatedLatex={generatedLatex}
                    jobDescription={jobDescription}
                    jobTitle={jobTitle}
                    selectedTemplateId={selectedTemplateId}
                    atsAnalysis={atsAnalysis}
                    pdfParseOk={pdfParseOk}
                    compiledPdfBlob={compiledPdfBlob}
                    compileFailed={compileFailed}
                    isGenerating={isGenerating}
                    isCompiling={isCompiling}
                    isScanning={isScanning}
                    isAutoFixing={isAutoFixing}
                    pdfHighlightQuery={pdfHighlightQuery}
                    onRefreshPdf={() => compilePdf(generatedLatex, 0, false, false)}
                    onPdfTextSelect={handlePdfTextSelect}
                    onImproveForAts={handleImproveForAts}
                    onDeepScan={handleDeepScan}
                />
            </div>
        </div >
    );
}
