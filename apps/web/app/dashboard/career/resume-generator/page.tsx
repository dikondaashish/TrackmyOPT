"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    ChevronRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useResumeStore } from "@/store/resume-store";
import { hasResumeGenerationInputs } from "@/lib/resume/generation-inputs";
import { useToast } from "@/hooks/useToast";

import {
    ResumeUsageStats,
    type ResumeUsageData,
} from "@/components/dashboard/resume/ResumeUsageStats";
import { ResumeCreditTopUpModal } from "@/components/dashboard/resume/ResumeCreditTopUpModal";
import { PricingModal } from "@/components/pricing/PricingModal";
import { GapAnalysisPanel } from "./components/GapAnalysisPanel";
import { ResumeGeneratorHeader } from "./components/ResumeGeneratorHeader";

import { ResumeInputPanel } from "./components/ResumeInputPanel";
import { JobDescriptionPanel } from "./components/JobDescriptionPanel";
import type { OcrStatus } from "./components/OcrProcessingCard";

export default function ResumeGeneratorPage() {
    const router = useRouter();
    const { toast } = useToast();
    // const supabase = createClientComponentClient(); -> Removed


    // Resume state
    // Resume state from store
    const {
        resumeText, resumeFilename, setResumeText,
        jobDescription, jobTitle, setJobDescription,
        alignJobTitles, setAlignJobTitles,
        setApplicationId,
    } = useResumeStore();

    const [resumeUrl, setResumeUrl] = useState("");
    const [saveResume, setSaveResume] = useState(true); // Default to true based on user request
    const [resumeName, setResumeName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const resumeFileInputRef = useRef<HTMLInputElement>(null);

    // Job Description state
    // Job state
    const [jobUrl, setJobUrl] = useState("");
    const jobFileInputRef = useRef<HTMLInputElement>(null);

    // UI state
    const [isResumeUploading, setIsResumeUploading] = useState(false);
    const [isJobUploading, setIsJobUploading] = useState(false);
    const [isResumeUrlProcessing, setIsResumeUrlProcessing] = useState(false);
    const [isJobUrlProcessing, setIsJobUrlProcessing] = useState(false);
    const [errors, setErrors] = useState<{ resume?: string; job?: string }>({});
    const [showHistory, setShowHistory] = useState(false);

    // Usage limit state
    const [usageLimit, setUsageLimit] = useState<ResumeUsageData | null>(null);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [isPremium, setIsPremium] = useState<boolean | null>(null);
    const creditConfirmationRef = useRef<string | null>(null);

    // OCR state
    const [resumeOcr, setResumeOcr] = useState<OcrStatus>({ show: false, running: false });
    const [jobOcr, setJobOcr] = useState<OcrStatus>({ show: false, running: false });

    useEffect(() => {
        async function fetchUsage() {
            try {
                const res = await fetch("/api/user/usage", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setUsageLimit({
                        resumeUsage: data.resumeUsage,
                        resumeLimit: data.resumeLimit,
                        resumeCreditBalance: data.resumeCreditBalance ?? 0,
                        canBuyResumeCredits: data.canBuyResumeCredits === true,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch resume usage:", error);
            }
        }
        fetchUsage();
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await fetch("/api/premium/status", {
                    credentials: "include",
                    cache: "no-store",
                });
                if (cancelled) return;
                if (response.ok) {
                    const data = (await response.json()) as { isPremium?: boolean };
                    setIsPremium(data.isPremium === true);
                } else {
                    setIsPremium(false);
                }
            } catch {
                if (!cancelled) setIsPremium(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);
    
    const searchParams = useSearchParams();
    const companyParam = searchParams.get("company");
    const roleParam = searchParams.get("role");
    const applicationIdParam = searchParams.get("applicationId");
    const creditCheckoutStatus = searchParams.get("credit_checkout");
    const creditCheckoutSessionId = searchParams.get("session_id");

    useEffect(() => {
        if (creditCheckoutStatus === "cancelled") {
            router.replace("/dashboard/career/resume-generator", { scroll: false });
            return;
        }

        if (
            creditCheckoutStatus !== "success" ||
            !creditCheckoutSessionId ||
            creditConfirmationRef.current === creditCheckoutSessionId
        ) {
            return;
        }

        creditConfirmationRef.current = creditCheckoutSessionId;
        let cancelled = false;

        (async () => {
            try {
                const confirmationResponse = await fetch("/api/resume-credits/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ sessionId: creditCheckoutSessionId }),
                });
                const confirmation = await confirmationResponse.json().catch(() => ({}));
                if (!confirmationResponse.ok) {
                    throw new Error(
                        typeof confirmation.error === "string"
                            ? confirmation.error
                            : "We could not confirm your credit purchase."
                    );
                }

                const usageResponse = await fetch("/api/user/usage", {
                    credentials: "include",
                    cache: "no-store",
                });
                const usage = usageResponse.ok ? await usageResponse.json() : null;
                if (cancelled) return;

                if (usage) {
                    setUsageLimit({
                        resumeUsage: usage.resumeUsage,
                        resumeLimit: usage.resumeLimit,
                        resumeCreditBalance: usage.resumeCreditBalance ?? 0,
                        canBuyResumeCredits: usage.canBuyResumeCredits === true,
                    });
                }

                toast({
                    title: "Resume credits added",
                    description: `${confirmation.creditsGranted ?? "Your"} credits are ready to use.`,
                });
            } catch (confirmationError) {
                if (cancelled) return;
                toast({
                    title: "Credit confirmation delayed",
                    description:
                        confirmationError instanceof Error
                            ? confirmationError.message
                            : "Your payment may still be processing. Please refresh shortly.",
                    variant: "destructive",
                });
            } finally {
                if (!cancelled) {
                    router.replace("/dashboard/career/resume-generator", { scroll: false });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [creditCheckoutSessionId, creditCheckoutStatus, router, toast]);

    // Link resume flow to a Job Tracker application when opened from drawer
    useEffect(() => {
        if (applicationIdParam) {
            setApplicationId(applicationIdParam);
        }
    }, [applicationIdParam, setApplicationId]);

    // Handle pre-filled job via query params
    useEffect(() => {
        if (companyParam || roleParam) {
            const title = roleParam 
                ? (companyParam ? `${roleParam} at ${companyParam}` : roleParam)
                : (companyParam || "");
                
            const content = [
                companyParam ? `Company: ${companyParam}` : null,
                roleParam ? `Role: ${roleParam}` : null
            ].filter(Boolean).join("\n");

            if (content && (!jobDescription || jobDescription.length < 5)) {
                setJobDescription(content, title);
            }
        }
    }, [companyParam, roleParam, setJobDescription, jobDescription]);

    // Auto-fill last resume
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const fetchLastResume = async () => {
            // Only fetch if resumeText is empty (don't overwrite if user already typed/uploaded)
            if (resumeText) return;

            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) return;

                const response = await fetch(`/api/proxy/resume/list?userId=${user.id}`, {
                    signal: controller.signal
                });

                if (!cancelled && response.ok) {
                    const data = await response.json();
                    const resumes = Array.isArray(data) ? data : (data.data ?? []);
                    
                    if (resumes.length > 0) {
                        const lastResume = resumes[0];
                        if (lastResume && lastResume.content) {
                            setResumeText(lastResume.content, lastResume.filename);
                            toast({
                                title: "Resume Auto-filled",
                                description: `Loaded your last saved resume: ${lastResume.filename}`,
                            });
                        }
                    }
                }
            } catch (error) {
                if (cancelled || controller.signal.aborted) return;
                console.error("Failed to auto-fill resume:", error);
            } finally {
                clearTimeout(timeoutId);
            }
        };

        fetchLastResume();
        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
            controller.abort();
        };
        // Run once on mount: this is intentionally an initial best-effort restore.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    // Save Resume Handler
    // Save Resume Handler
    const handleSaveResume = async (text: string, filename: string, s3Key?: string) => {
        if (!text || text.length < 50) return;

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "Authentication Error",
                    description: "You must be logged in to save resumes.",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch(`/api/proxy/resume/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    filename: filename,
                    content: text,
                    structuredData: {}, // We'll add structured data later
                    filePath: s3Key,
                }),
            });

            if (!response.ok) throw new Error("Failed to save resume");

            toast({
                title: "Resume Saved",
                description: "Your resume has been saved to your profile.",
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

    // File upload handler
    const handleFileUpload = async (file: File, type: "resume" | "job") => {
        const setUploading = type === "resume" ? setIsResumeUploading : setIsJobUploading;
        setUploading(true);
        setErrors(prev => ({ ...prev, [type]: undefined }));

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/resume-generator/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                if (type === "resume") {
                    setResumeText(result.text, result.filename);
                    setResumeName(result.filename);
                    setResumeOcr({ show: false, running: false });

                    if (result.truncated) {
                        toast({
                            title: "Resume trimmed",
                            description: `Extracted text was shortened from ${Number(result.originalLength || result.length).toLocaleString()} to ${Number(result.length).toLocaleString()} characters for AI processing.`,
                        });
                    }

                    // Auto-save if checked
                    if (saveResume) {
                        handleSaveResume(result.text, result.filename, result.s3Key);
                    }
                } else {
                    setJobDescription(result.text, result.filename);
                    setJobOcr({ show: false, running: false });
                }
            } else if (result.error === "pdf_no_extractable_text" && result.can_ocr) {
                // Show OCR prompt for scanned PDFs
                const ocrData = {
                    show: true,
                    running: false,
                    fileBuffer: result.fileBuffer,
                    filename: result.filename,
                };
                if (type === "resume") {
                    setResumeOcr(ocrData);
                    setResumeName(result.filename);
                } else {
                    setJobOcr(ocrData);
                }
                setErrors(prev => ({ ...prev, [type]: undefined }));
            } else {
                setErrors(prev => ({ ...prev, [type]: result.message || result.error }));
            }
        } catch (_error) {
            setErrors(prev => ({ ...prev, [type]: "Upload failed. Please try again." }));
        } finally {
            setUploading(false);
        }
    };

    // URL processing handler
    const handleUrlProcess = async (url: string, type: "resume" | "job") => {
        if (!url.trim()) return;

        const setProcessing = type === "resume" ? setIsResumeUrlProcessing : setIsJobUrlProcessing;
        setProcessing(true);
        setErrors(prev => ({ ...prev, [type]: undefined }));

        try {
            const response = await fetch("/api/resume-generator/process-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, type }),
            });

            const result = await response.json();

            if (result.success) {
                if (type === "resume") {
                    setResumeText(result.content, result.title);
                    setResumeUrl("");

                    // Auto-save if checked
                    if (saveResume) {
                        handleSaveResume(result.content, result.title); // URLs typically don't fail, but we don't have s3Key yet unless we upload it
                    }
                } else {
                    setJobDescription(result.content, result.title);
                    setJobUrl("");
                }
            } else {
                setErrors(prev => ({ ...prev, [type]: result.error }));
            }
        } catch (_error) {
            setErrors(prev => ({ ...prev, [type]: "URL processing failed. Please try again." }));
        } finally {
            setProcessing(false);
        }
    };

    // Clear data handlers
    const clearResume = () => {
        setResumeText("");
        setErrors(prev => ({ ...prev, resume: undefined }));
        if (resumeFileInputRef.current) resumeFileInputRef.current.value = "";
    };

    const clearJob = () => {
        setJobDescription("");
        setErrors(prev => ({ ...prev, job: undefined }));
        if (jobFileInputRef.current) jobFileInputRef.current.value = "";
    };

    // OCR handlers - Uses direct synchronous OCR (no queue/polling)
    const startOcr = async (type: "resume" | "job") => {
        const ocrInfo = type === "resume" ? resumeOcr : jobOcr;
        const setOcr = type === "resume" ? setResumeOcr : setJobOcr;

        if (!ocrInfo.fileBuffer) return;

        setOcr(prev => ({ ...prev, running: true }));
        setErrors(prev => ({ ...prev, [type]: undefined }));

        try {
            // Use direct OCR endpoint (synchronous, no queue)
            const response = await fetch(`/api/proxy/ocr/direct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileBuffer: ocrInfo.fileBuffer,
                    filename: ocrInfo.filename,
                }),
            });

            const result = await response.json();

            if (result.ok && result.text) {
                // Update data with extracted text
                if (type === "resume") {
                    setResumeText(result.text, result.filename);

                    // Auto-save if checked
                    if (saveResume) {
                        handleSaveResume(result.text, result.filename);
                    }
                } else {
                    setJobDescription(result.text, result.filename);
                }
                setOcr({ show: false, running: false });
            } else {
                setOcr(prev => ({ ...prev, running: false }));
                setErrors(prev => ({ ...prev, [type]: result.message || result.error || "OCR failed" }));
            }
        } catch (_error) {
            setOcr(prev => ({ ...prev, running: false }));
            setErrors(prev => ({ ...prev, [type]: "OCR failed. Please paste text manually." }));
        }
    };

    const cancelOcr = (type: "resume" | "job") => {
        const setOcr = type === "resume" ? setResumeOcr : setJobOcr;
        setOcr({ show: false, running: false });
    };

    // Navigate to template selection
    const handleSelectTemplate = () => {
        if (!hasResumeGenerationInputs(resumeText, jobDescription)) return;

        // Data is already in Zustand store and persisted
        router.push("/dashboard/career/resume-generator/templates");
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleResumeDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file, "resume");
    };

    const handleJobDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file, "job");
    };

    const canProceed = hasResumeGenerationInputs(resumeText, jobDescription);
    const isPlanLimitReached =
        !!usageLimit && usageLimit.resumeUsage >= usageLimit.resumeLimit;
    const canUsePurchasedCredit =
        !!usageLimit &&
        usageLimit.canBuyResumeCredits &&
        usageLimit.resumeCreditBalance >= 1;
    const isGenerationBlocked = isPlanLimitReached && !canUsePurchasedCredit;

    return (
        <>
        <div className="max-md:-mx-3 max-md:-my-3 md:min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <ResumeGeneratorHeader
                usageLimit={usageLimit}
                onBuyCredits={() => setShowCreditModal(true)}
                onUpgrade={() => setShowPricingModal(true)}
                onOpenHistory={() => router.push("/dashboard/career/history")}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 max-md:px-3 py-6 sm:py-8">
                <div className="lg:hidden">
                    <ResumeUsageStats
                        stats={usageLimit}
                        onBuyCredits={() => setShowCreditModal(true)}
                        onUpgrade={() => setShowPricingModal(true)}
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResumeInputPanel
                        text={resumeText}
                        onTextChange={setResumeText}
                        filename={resumeFilename}
                        resumeName={resumeName}
                        onResumeNameChange={setResumeName}
                        saveResume={saveResume}
                        onSaveResumeChange={setSaveResume}
                        isSaving={isSaving}
                        onSave={handleSaveResume}
                        onClear={clearResume}
                        onOpenSaved={() => router.push("/dashboard/career/saved-resumes")}
                        error={errors.resume}
                        ocr={resumeOcr}
                        onStartOcr={() => startOcr("resume")}
                        onCancelOcr={() => cancelOcr("resume")}
                        isUploading={isResumeUploading}
                        url={resumeUrl}
                        onUrlChange={setResumeUrl}
                        isUrlProcessing={isResumeUrlProcessing}
                        onUrlProcess={() => handleUrlProcess(resumeUrl, "resume")}
                        fileInputRef={resumeFileInputRef}
                        onFileUpload={(file) => handleFileUpload(file, "resume")}
                        onDragOver={handleDragOver}
                        onFileDrop={handleResumeDrop}
                    />
                    <JobDescriptionPanel
                        text={jobDescription}
                        onTextChange={setJobDescription}
                        title={jobTitle}
                        alignJobTitles={alignJobTitles}
                        onAlignJobTitlesChange={setAlignJobTitles}
                        onClear={clearJob}
                        error={errors.job}
                        ocr={jobOcr}
                        onStartOcr={() => startOcr("job")}
                        onCancelOcr={() => cancelOcr("job")}
                        isUploading={isJobUploading}
                        url={jobUrl}
                        onUrlChange={setJobUrl}
                        isUrlProcessing={isJobUrlProcessing}
                        onUrlProcess={() => handleUrlProcess(jobUrl, "job")}
                        fileInputRef={jobFileInputRef}
                        onFileUpload={(file) => handleFileUpload(file, "job")}
                        onDragOver={handleDragOver}
                        onFileDrop={handleJobDrop}
                    />
                </div>

                <GapAnalysisPanel
                    resumeText={resumeText}
                    jobDescription={jobDescription}
                    disabled={isGenerationBlocked}
                />

                {/* CTA Button */}
                <div className="mt-8 flex justify-center">
                    {isGenerationBlocked ? (
                        <Button
                            type="button"
                            onClick={() => {
                                if (usageLimit?.canBuyResumeCredits) {
                                    setShowCreditModal(true);
                                } else {
                                    setShowPricingModal(true);
                                }
                            }}
                            className="px-8 py-6 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            {usageLimit?.canBuyResumeCredits ? "Buy Resume Credits" : "Upgrade to Pro"}
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSelectTemplate}
                            disabled={!canProceed}
                            className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Select Template
                            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                </div>

                {/* Helper Text */}
                {!canProceed && !isGenerationBlocked && (
                    <p className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400">
                        Please add both your resume and job description (min 50 characters each) to continue
                    </p>
                )}
                {isPlanLimitReached && canUsePurchasedCredit && (
                    <p className="mt-4 text-center text-sm text-emerald-600 dark:text-emerald-400">
                        Your included monthly allowance is used. This resume will use 1 purchased credit.
                    </p>
                )}
                {isGenerationBlocked && (
                    <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
                        {usageLimit?.canBuyResumeCredits
                            ? `You’ve used all ${usageLimit.resumeLimit} included resumes. Add 10 credits for $1 to keep generating.`
                            : "You’ve reached your monthly free resume limit. Upgrade to Pro for more ATS-optimized resumes."}
                    </p>
                )}

                {/* Best Results Tips */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">i</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">For best results:</h3>
                            <ul className="text-blue-700 dark:text-blue-300 text-xs space-y-0.5">
                                <li>• Upload your resume in PDF or DOCX format</li>
                                <li>• Include the complete job description</li>
                                <li>• Ensure your resume includes contact info and skills</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <PricingModal
            open={showPricingModal}
            onClose={() => setShowPricingModal(false)}
            isPremium={isPremium ?? false}
        />
        <ResumeCreditTopUpModal
            open={showCreditModal}
            onClose={() => setShowCreditModal(false)}
            currentBalance={usageLimit?.resumeCreditBalance ?? 0}
            resumeUsage={usageLimit?.resumeUsage}
            resumeLimit={usageLimit?.resumeLimit}
            onUsageUpdated={setUsageLimit}
        />
        </>
    );
}
