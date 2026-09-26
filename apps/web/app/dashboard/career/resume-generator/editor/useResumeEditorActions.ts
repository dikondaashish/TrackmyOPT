"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { triggerUrlDownload } from "@/lib/browser-download";
import { useToast } from "@/hooks/useToast";
import { useResumeStore } from "@/store/resume-store";
import { supabase } from "@/lib/supabase/client";
import { buildResumePdfFilename, extractNameFromLatex } from "@/lib/resume/build-resume-filename";
import { latexToPlainText } from "@/lib/resume/latex-to-plain-text";
import { extractPdfTextFromBlob } from "@/lib/resume/pdf-text-extract-client";
import { isDownloadGateRequired } from "@/lib/resume/apply-readiness";
import {
    ATS_PASS_SCORE,
    buildAutoRegenFeedback,
    limitRegenerationFeedback,
    type AtsAnalysis,
} from "@/lib/resume/ats-analysis-types";
import { captureClientEvent, captureUpgradePromptShown } from "@/lib/posthog-client";
import { requestNpsSurvey } from "@/lib/posthog/nps-survey";
import { DEFAULT_RESUME_TEMPLATE_ID } from "@/lib/documents/templates";

type UpdateText = (newText: string, saveToHistory?: boolean) => void;
type NpsPlanTier = "dedicated" | "pro" | "free";

export function useResumeEditorActions({
    updateText,
    npsPlanTier,
}: {
    updateText: UpdateText;
    npsPlanTier: NpsPlanTier;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const autoRegenAttempts = useRef(0);
    const skipNextAutoRegen = useRef(false);
    const compileSeqRef = useRef(0);
    const scanSeqRef = useRef(0);
    const generationSeqRef = useRef(0);
    const mountedRef = useRef(true);
    const [compiledLatex, setCompiledLatex] = useState("");

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const {
        resumeText, jobDescription, selectedTemplateId, selectedColor, jobTitle, applicationId,
        alignJobTitles,
        generatedLatex, compiledPdfUrl, atsAnalysis,
        setCompiledPdfUrl, setAtsAnalysis,
        isGenerating, setIsGenerating,
        isCompiling, setIsCompiling,
        reset,
    } = useResumeStore();

    const [isScanning, setIsScanning] = useState(false);
    const [showDownloadGate, setShowDownloadGate] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [resumeCreditBalance, setResumeCreditBalance] = useState(0);
    const [pdfParseOk, setPdfParseOk] = useState<boolean | null>(null);
    const [isAutoFixing, setIsAutoFixing] = useState(false);
    const [compiledPdfBlob, setCompiledPdfBlob] = useState<Blob | null>(null);
    const [compileFailed, setCompileFailed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pdfHighlightQuery, setPdfHighlightQuery] = useState<string | null>(null);

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
        async (latex: string, silent = false, isCurrent: () => boolean = () => true): Promise<AtsAnalysis | null> => {
            if (!jobDescription || !latex) return null;

            const scanSeq = ++scanSeqRef.current;
            const isLatest = () => mountedRef.current && scanSeq === scanSeqRef.current && isCurrent() && useResumeStore.getState().generatedLatex === latex;
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
                if (!isLatest()) return null;
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
                if (!silent && isLatest()) {
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
                if (mountedRef.current && scanSeq === scanSeqRef.current) setIsScanning(false);
            }
        },
        [jobDescription, setAtsAnalysis, toast, trackAtsScored]
    );

    async function runAutoRegenerate(analysis: AtsAnalysis | null, sourceLatex = useResumeStore.getState().generatedLatex) {
        if (autoRegenAttempts.current >= 2) return;
        if (!analysis || (analysis.score ?? 0) >= ATS_PASS_SCORE) return;
        if (!(analysis.keywordMatch?.missing?.length ?? 0)) return;

        const seq = ++generationSeqRef.current;
        const isCurrent = () => mountedRef.current && seq === generationSeqRef.current && useResumeStore.getState().generatedLatex === sourceLatex;
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
                    templateId: selectedTemplateId || DEFAULT_RESUME_TEMPLATE_ID,
                    previousLatex: sourceLatex,
                    userFeedback: limitRegenerationFeedback(feedback),
                    atsAnalysis: analysis,
                    alignJobTitles,
                }),
            });

            const data = await response.json();
            if (!isCurrent()) return;
            if (response.status === 403) {
                handleGenerationLimitResponse(data);
                return;
            }
            if (!response.ok) throw new Error(data.error || "Regenerate failed");

            updateText(data.latex);
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
            if (mountedRef.current && seq === generationSeqRef.current) setIsAutoFixing(false);
        }
    }

    async function postCompilePipeline(latex: string, blob: Blob, isCurrent: () => boolean, options?: { allowAutoRegen?: boolean }) {
        if (!isCurrent()) return;
        const allowAutoRegen = options?.allowAutoRegen !== false;
        const name = extractNameFromLatex(latex);
        const [pdfResult, analysis] = await Promise.all([
            extractPdfTextFromBlob(blob, name),
            runDeepScan(latex, true, isCurrent),
        ]);
        if (!isCurrent()) return;
        setPdfParseOk(pdfResult.ok);
        if (!pdfResult.ok && pdfResult.warning) {
            toast({
                title: "ATS parse risk",
                description: pdfResult.warning,
                variant: "destructive",
            });
        }

        if (analysis && isCurrent()) {
            await saveResumeToHistory(latex, analysis);
            if (isCurrent() && allowAutoRegen && !skipNextAutoRegen.current) {
                await runAutoRegenerate(analysis, latex);
            }
            skipNextAutoRegen.current = false;
        }
    }

    // API: Generate Resume
    const generateResume = async (resume: string, job: string, template: string) => {
        const seq = ++generationSeqRef.current;
        const isCurrent = () => mountedRef.current && seq === generationSeqRef.current;
        ++compileSeqRef.current;
        ++scanSeqRef.current;
        setIsCompiling(false);
        setIsScanning(false);
        setPdfParseOk(null);
        setAtsAnalysis(null);
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
                    alignJobTitles,
                    // Accent chosen on the template selection page, if any.
                    ...(selectedColor?.hex ? { accentHex: selectedColor.hex } : {})
                })
            });

            const data = await response.json().catch(() => {
                if (response.ok) throw new Error("The server returned an invalid resume response. Please try again.");
                return {
                    error: response.status === 504
                        ? "Resume generation took too long. Please try again."
                        : "Resume generation is temporarily unavailable. Please try again.",
                };
            });
            if (!isCurrent()) return;

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
                const refundNote = data.creditRefunded ? " Your credit was not charged." : "";
                const detailNote =
                    typeof data.details === "string" && data.details.trim() && data.details.trim() !== data.error
                        ? ` ${data.details.trim()}`
                        : "";
                throw new Error(
                    (detail ? `${data.error || "Failed to generate resume"} (${detail})` : data.error || "Failed to generate resume") +
                        detailNote +
                        refundNote
                );
            }

            updateText(data.latex);
            setIsGenerating(false);

            if (data.atsCheck) {
                setAtsAnalysis({ ...data.atsCheck, score: data.atsCheck.score ?? 0 });
                trackAtsScored(data.atsCheck, "generate");
            }

            if (data.latex) {
                await compilePdf(data.latex);
                if (!isCurrent()) return;
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
            if (!isCurrent()) return;
            console.error(error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast({
                title: "Generation Failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            if (isCurrent()) setIsGenerating(false);
        }
    };

    // API: Compile PDF
    async function compilePdf(
        code: string,
        retryCount = 0,
        fromAutoRegen = false,
        allowAutoRegen = true
    ) {
        if (!code) return;
        const seq = ++compileSeqRef.current;
        const isCurrent = () => mountedRef.current && seq === compileSeqRef.current;
        setIsCompiling(true);
        setCompileFailed(false);
        setPdfParseOk(null);
        setPdfHighlightQuery(null);
        try {
            const response = await fetch('/api/resume-generator/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({ latexCode: code })
            });

            if (!isCurrent()) return;
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) as {
                    error?: string;
                    code?: string;
                };
                if (!isCurrent()) return;
                const errorMessage = errorData.error || 'Compilation failed';
                const isCompilerUnavailable =
                    response.status === 503 ||
                    errorData.code === 'resume_compiler_unavailable';

                if (isCompilerUnavailable) {
                    throw new Error(errorMessage);
                }

                if (retryCount === 0 && useResumeStore.getState().generatedLatex === code) {
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
                    if (!isCurrent()) return;

                    if (fixResponse.ok && fixData.latex && useResumeStore.getState().generatedLatex === code) {
                        updateText(fixData.latex);
                        await compilePdf(fixData.latex, 1, fromAutoRegen, allowAutoRegen);
                        return;
                    }
                }

                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            if (!isCurrent()) return;
            const url = URL.createObjectURL(blob);
            const prevUrl = useResumeStore.getState().compiledPdfUrl;
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            setCompiledPdfUrl(url);
            setCompiledLatex(code);
            setCompiledPdfBlob(blob);
            // The PDF is ready now; ATS work must not keep the preview covered.
            setIsCompiling(false);
            setPdfHighlightQuery(null);

            if (!fromAutoRegen) {
                skipNextAutoRegen.current = false;
            }
            const isCurrentSource = () => isCurrent() && useResumeStore.getState().generatedLatex === code;
            // Analysis failures do not turn a successfully compiled PDF into a compile error.
            void postCompilePipeline(code, blob, isCurrentSource, { allowAutoRegen }).catch((error) => {
                console.error("Post-compile analysis failed:", error);
            });

        } catch (error: unknown) {
            if (!isCurrent()) return;
            setCompileFailed(true);
            console.error(error);
            const message = error instanceof Error ? error.message : "";
            toast({
                title: "PDF preview failed",
                description: message.includes("temporarily unavailable")
                    ? "The PDF compiler is busy. Tap Refresh PDF, or Start over to clear local resume data."
                    : "This resume source could not be turned into a PDF. Tap Refresh PDF, or Start over to clear local resume data.",
                variant: "destructive",
            });
        } finally {
            if (isCurrent()) setIsCompiling(false);
        }
    };

    const handleDeepScan = async () => {
        if (!generatedLatex) return;
        await runDeepScan(generatedLatex);
    };

    const handleRegenerate = async (feedback: string, analysisOverride?: AtsAnalysis | null) => {
        const seq = ++generationSeqRef.current;
        const isCurrent = () => mountedRef.current && seq === generationSeqRef.current;
        ++compileSeqRef.current;
        ++scanSeqRef.current;
        setIsCompiling(false);
        setIsScanning(false);
        setPdfParseOk(null);
        setAtsAnalysis(null);
        setIsGenerating(true);

        try {
            const response = await fetch('/api/resume-generator/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    jobDescription,
                    templateId: selectedTemplateId || DEFAULT_RESUME_TEMPLATE_ID,
                    previousLatex: generatedLatex,
                    userFeedback: limitRegenerationFeedback(feedback),
                    // A just-completed scan is not guaranteed to be visible in React state yet.
                    // Prefer it so this regeneration receives the exact gaps the user saw.
                    atsAnalysis: analysisOverride ?? atsAnalysis,
                    alignJobTitles,
                })
            });

            const data = await response.json();
            if (!isCurrent()) return;

            if (response.status === 403) {
                handleGenerationLimitResponse(data);
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to regenerate resume');
            }

            updateText(data.latex);
            setIsGenerating(false);
            if (data.atsCheck) {
                setAtsAnalysis(data.atsCheck);
                trackAtsScored(data.atsCheck, "regenerate");
            }

            toast({
                title: "Resume Regenerated",
                description: "AI has improved your resume based on your feedback.",
            });

            if (data.latex) {
                compilePdf(data.latex);
            }

        } catch (error: unknown) {
            if (!isCurrent()) return;
            console.error(error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast({
                title: "Regeneration Failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            if (isCurrent()) setIsGenerating(false);
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

    const handleDownload = () => {
        try {
            if (!compiledPdfUrl || compiledLatex !== generatedLatex) {
                if (isCompiling) return;
                void compilePdf(generatedLatex, 0, false, false);
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
    };

    const handleStartOver = useCallback(() => {
        if (!window.confirm("Clear this in-progress resume and start again? Your saved resumes will not be deleted.")) {
            return;
        }

        ++generationSeqRef.current;
        ++compileSeqRef.current;
        ++scanSeqRef.current;
        const currentUrl = useResumeStore.getState().compiledPdfUrl;
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        setCompiledPdfBlob(null);
        try {
            window.localStorage.removeItem("resume-storage");
        } catch {
            // Ignore private-mode storage failures.
        }
        reset();
        router.replace("/dashboard/career/resume-generator");
    }, [reset, router]);

    const handleFixAndDownload = async () => {
        setShowDownloadGate(false);
        if (atsAnalysis) {
            await runAutoRegenerate(atsAnalysis);
        } else if (generatedLatex) {
            await runDeepScan(generatedLatex, true);
        }
    };

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

    return {
        // status from store (passthrough for page UI)
        isGenerating,
        isCompiling,
        generatedLatex,
        compiledPdfUrl,
        atsAnalysis,
        jobDescription,
        jobTitle,
        selectedTemplateId,

        // action-owned UI state
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
        isPdfStale: Boolean(compiledPdfBlob) && compiledLatex !== generatedLatex,
        isSaving,
        pdfHighlightQuery,
        setPdfHighlightQuery,

        // actions
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
    };
}
