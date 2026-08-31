"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useToast } from "@/hooks/useToast";
import { useResumeStore } from "@/store/resume-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizationFeedbackModal } from "./components/OptimizationFeedbackModal";
import { AtsScorePanel } from "./components/AtsScorePanel";
import { ApplyReadinessChecklist } from "./components/ApplyReadinessChecklist";
import { DownloadGateModal } from "./components/DownloadGateModal";
import { PdfSelectablePreview } from "./components/PdfSelectablePreview";
import { GeneratingOverlay } from "./components/GeneratingOverlay";
import { LatexToolbar, EditorViewMode } from "./components/LatexToolbar";
import { useEditorHistory } from "@/hooks/useEditorHistory";
import { useStreamingEffect } from "@/hooks/useStreamingEffect";
import { supabase } from "@/lib/supabase/client";
import { Save } from "lucide-react";
import { buildResumePdfFilename, extractNameFromLatex } from "@/lib/resume/build-resume-filename";
import { latexToPlainText } from "@/lib/resume/latex-to-plain-text";
import { extractPdfTextFromBlob } from "@/lib/resume/pdf-text-extract-client";
import {
    JOB_DESCRIPTION_MAX_CHARS,
    prepareResumeText,
    RESUME_TEXT_MAX_CHARS,
} from "@/lib/resume/resume-text-limits";
import { isDownloadGateRequired } from "@/lib/resume/apply-readiness";
import {
    ATS_PASS_SCORE,
    buildAutoRegenFeedback,
    limitRegenerationFeedback,
    type AtsAnalysis,
} from "@/lib/resume/ats-analysis-types";
import { captureClientEvent, captureUpgradePromptShown } from "@/lib/posthog-client";
import { requestNpsSurvey } from "@/lib/posthog/nps-survey";
import { PricingModal } from "@/components/pricing/PricingModal";
import { ResumeCreditTopUpModal } from "@/components/dashboard/resume/ResumeCreditTopUpModal";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import {
    findTextInLatex,
    getTextareaSelection,
    scrollTextareaToMatch,
} from "@/lib/resume/latex-text-sync";

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const autoRegenAttempts = useRef(0);
    const skipNextAutoRegen = useRef(false);
    const handoffLoadedRef = useRef(false);
    const handoffId = searchParams.get("handoffId");

    // Store
    const {
        resumeText, jobDescription, selectedTemplateId, selectedColor, jobTitle, applicationId,
        generatedLatex, compiledPdfUrl, atsAnalysis,
        setResumeText, setJobDescription, setSelectedTemplateId,
        setGeneratedLatex, setCompiledPdfUrl, setAtsAnalysis, setApplicationId,
        isGenerating, setIsGenerating,
        isCompiling, setIsCompiling,
        reset
    } = useResumeStore();

    // Local UI State
    const [isCopied, setIsCopied] = useState(false);
    const [isPlainCopied, setIsPlainCopied] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showDownloadGate, setShowDownloadGate] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [resumeCreditBalance, setResumeCreditBalance] = useState(0);
    const [pdfParseOk, setPdfParseOk] = useState<boolean | null>(null);
    const [isAutoFixing, setIsAutoFixing] = useState(false);
    const [compiledPdfBlob, setCompiledPdfBlob] = useState<Blob | null>(null);
    const [pdfHighlightQuery, setPdfHighlightQuery] = useState<string | null>(null);
    const [pendingHandoffLatex, setPendingHandoffLatex] = useState<string | null>(null);

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

    const handleGenerationLimitResponse = useCallback(
        (data: {
            code?: string;
            canBuyCredits?: boolean;
            creditBalance?: number;
            details?: string;
        }) => {
            if (data.code === "credits_required" && data.canBuyCredits === true) {
                setResumeCreditBalance(Number(data.creditBalance) || 0);
                setShowCreditModal(true);
                toast({
                    title: "Included resume allowance used",
                    description: data.details || "Add 10 resume credits for $1 to continue.",
                    variant: "destructive",
                });
                return;
            }

            setShowPricingModal(true);
            toast({
                title: "Resume limit reached",
                description: data.details || "Upgrade your plan to continue generating resumes.",
                variant: "destructive",
            });
        },
        [toast]
    );

    const { displayedText, isStreaming, stopStreaming } = useStreamingEffect({
        text: generatedLatex,
        isEnabled: isStreamingEnabled,
        speed: 16,
        chunkSize: 48,
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

    // 1. Load data & Generate on Mount (after persisted store rehydrates)
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
        // Extension handoffs load their already-generated LaTeX below. Do not
        // restart the normal three-step generation flow with stale store data.
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

    const trackAtsScored = useCallback(
        (
            analysis: { score?: number | null },
            scanSource: "deep_scan" | "generate" | "regenerate" | "auto_regenerate"
        ) => {
            captureClientEvent("resume_ats_scored", {
                score: analysis.score ?? null,
                ats_score: analysis.score ?? null,
                template_id: selectedTemplateId,
                application_id: applicationId,
                auto_regen_count: autoRegenAttempts.current,
                scan_source: scanSource,
                source: "resume_editor",
            });
            if (scanSource === "deep_scan") {
                requestNpsSurvey({
                    trigger: "ats_scan_completed",
                    planTier: npsPlanTier,
                });
            }
        },
        [applicationId, npsPlanTier, selectedTemplateId]
    );

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
                if (response.status === 402) {
                    captureUpgradePromptShown({ source: "ats_limit" });
                    setShowPricingModal(true);
                    if (!silent) {
                        toast({
                            title: "ATS scan limit reached",
                            description: `You have used ${data.usage ?? data.limit ?? 0}/${data.limit ?? 0} deep scans this month. Upgrade for more scans.`,
                            variant: "destructive",
                        });
                    }
                    return null;
                }
                if (!response.ok) {
                    throw new Error(
                        data.error || "We could not complete the ATS analysis. Please try again."
                    );
                }

                setAtsAnalysis(data);
                trackAtsScored(data, "deep_scan");
                if (!silent) {
                    toast({
                        title: "Analysis complete",
                        description: `Estimated ATS match: ${data.score ?? "—"}/100`,
                    });
                }
                return data as AtsAnalysis;
            } catch (error) {
                console.error(error);
                if (!silent) {
                    toast({
                        title: "Scan Failed",
                        description:
                            error instanceof Error
                                ? error.message
                                : "Could not perform deep analysis.",
                        variant: "destructive",
                    });
                }
                return null;
            } finally {
                setIsScanning(false);
            }
        },
        [jobDescription, setAtsAnalysis, toast, trackAtsScored]
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
                        userFeedback: limitRegenerationFeedback(feedback),
                        atsAnalysis: analysis,
                    }),
                });

                const data = await response.json();
                if (response.status === 403) {
                    handleGenerationLimitResponse(data);
                    return;
                }
                if (!response.ok) throw new Error(data.error || "Regenerate failed");

                updateText(data.latex, false);
                setIsStreamingEnabled(true);
                if (data.atsCheck) {
                    setAtsAnalysis(data.atsCheck);
                    trackAtsScored(data.atsCheck, "auto_regenerate");
                }

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
        [generatedLatex, handleGenerationLimitResponse, jobDescription, resumeText, selectedTemplateId, setAtsAnalysis, toast, trackAtsScored, updateText]
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
                    templateId: template,
                    // Accent chosen on the template selection page, if any.
                    ...(selectedColor?.hex ? { accentHex: selectedColor.hex } : {})
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const detail =
                    typeof data.details === "object" && data.details !== null
                        ? Object.entries(data.details as Record<string, unknown>)
                              .filter(([key]) => key !== "_errors")
                              .map(([field, issue]) => {
                                  const errors = (issue as { _errors?: string[] })?._errors;
                                  return errors?.length ? `${field}: ${errors.join(", ")}` : null;
                              })
                              .filter(Boolean)
                              .join("; ")
                        : "";
                throw new Error(
                    detail ? `${data.error || "Failed to generate resume"} (${detail})` : data.error || "Failed to generate resume"
                );
            }

            updateText(data.latex, false);
            setIsStreamingEnabled(true);

            if (data.atsCheck) {
                setAtsAnalysis({ ...data.atsCheck, score: data.atsCheck.score ?? 0 });
                trackAtsScored(data.atsCheck, "generate");
            }

            if (data.latex) {
                await compilePdf(data.latex);
                captureClientEvent("resume_generated", {
                    template_id: template,
                    job_description_length: job.length,
                    application_id: applicationId,
                    source: "resume_editor",
                });
            }

            if (Array.isArray(data.warnings) && data.warnings.length > 0) {
                toast({
                    title: "Content trimmed",
                    description: data.warnings.join(" "),
                });
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
        if (!pendingHandoffLatex) return;
        const latex = pendingHandoffLatex;
        setPendingHandoffLatex(null);
        void compilePdf(latex);
        // Run after the handoff's store updates have rendered so compilation,
        // ATS scanning, and history saving use the new job/resume context.
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
        // compilePdf intentionally runs once for this one-time handoff.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handoffId, storeHydrated]);

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
    const handleRegenerate = async (feedback: string, analysisOverride?: AtsAnalysis | null) => {
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
                    userFeedback: limitRegenerationFeedback(feedback),
                    // A just-completed scan is not guaranteed to be visible in React state yet.
                    // Prefer it so this regeneration receives the exact gaps the user saw.
                    atsAnalysis: analysisOverride ?? atsAnalysis,
                })
            });

            const data = await response.json();

            if (response.status === 403) {
                handleGenerationLimitResponse(data);
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to regenerate resume');
            }

            updateText(data.latex, false);
            setIsStreamingEnabled(true);
            if (data.atsCheck) {
                setAtsAnalysis(data.atsCheck);
                trackAtsScored(data.atsCheck, "regenerate");
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

    const handleImproveForAts = async () => {
        if (!generatedLatex) return;

        const analysis = atsAnalysis ?? await runDeepScan(generatedLatex, true);
        if (!analysis) {
            toast({
                title: "ATS analysis needed",
                description: "We could not read the ATS gaps yet. Please run the analysis again.",
                variant: "destructive",
            });
            return;
        }

        if (analysis.passed && (analysis.score ?? 0) >= ATS_PASS_SCORE) {
            toast({
                title: "Resume already meets the ATS target",
                description: "Review the suggestions before making another change.",
            });
            return;
        }

        captureClientEvent("resume_ats_fix_requested", {
            score: analysis.score ?? null,
            template_id: selectedTemplateId,
            application_id: applicationId,
            source: "resume_editor",
        });

        await handleRegenerate(limitRegenerationFeedback([
            "Improve ATS readability, keyword placement, and bullet quality for this job description. Only use skills, experience, employers, dates, degrees, credentials, and metrics supported by the source resume. Do not invent, exaggerate, or rename anything.",
            buildAutoRegenFeedback(analysis),
        ].join("\n\n")), analysis);
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

    const performDownload = useCallback(
        (options?: { had_gate_warning?: boolean }) => {
            if (!compiledPdfUrl) return;
            captureClientEvent("resume_downloaded", {
                ats_score: atsAnalysis?.score ?? null,
                template_id: selectedTemplateId,
                application_id: applicationId,
                had_gate_warning: options?.had_gate_warning ?? false,
                filename: buildPdfFilename(),
                source: "resume_editor",
            });
            requestNpsSurvey({
                trigger: "resume_downloaded",
                planTier: npsPlanTier,
            });
            triggerUrlDownload(compiledPdfUrl, buildPdfFilename());
        },
        [
            applicationId,
            atsAnalysis?.score,
            buildPdfFilename,
            compiledPdfUrl,
            npsPlanTier,
            selectedTemplateId,
        ]
    );

    const handleDownloadAnyway = useCallback(() => {
        setShowDownloadGate(false);
        performDownload({ had_gate_warning: true });
    }, [performDownload]);

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

    const handleStartOver = useCallback(() => {
        if (!window.confirm("Clear this in-progress resume and start again? Your saved resumes will not be deleted.")) {
            return;
        }

        stopStreaming();
        const currentUrl = useResumeStore.getState().compiledPdfUrl;
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        reset();
        router.replace("/dashboard/career/resume-generator");
    }, [reset, router, stopStreaming]);

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

            <PricingModal
                open={showPricingModal}
                onClose={() => setShowPricingModal(false)}
                isPremium={premium.isPremium === true}
            />
            <ResumeCreditTopUpModal
                open={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                currentBalance={resumeCreditBalance}
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
                                variant="ghost"
                                size="sm"
                                onClick={handleStartOver}
                                disabled={isGenerating || isCompiling}
                                className="hidden xl:flex items-center gap-1 text-gray-600"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Start over
                            </Button>
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
                                                onClick={handleImproveForAts}
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
