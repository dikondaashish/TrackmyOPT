"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    Upload,
    Link2,
    History,
    Sparkles,
    FileText,
    FileSearch,
    Briefcase,
    HelpCircle,
    Loader2,
    Check,
    CheckCircle2,
    XCircle,
    Lightbulb,
    BookOpen,
    ChevronRight,
    AlertCircle,
    X,
    Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useResumeStore } from "@/store/resume-store";
import { extractJobTitle } from "@/lib/resume/extract-job-title";
import { hasResumeGenerationInputs } from "@/lib/resume/generation-inputs";
import { useToast } from "@/hooks/useToast";

import {
    ResumeUsageStats,
    type ResumeUsageData,
} from "@/components/dashboard/resume/ResumeUsageStats";
import { ResumeCreditTopUpModal } from "@/components/dashboard/resume/ResumeCreditTopUpModal";
import { PricingModal } from "@/components/pricing/PricingModal";
import { GapAnalysisPanel } from "./components/GapAnalysisPanel";

interface OcrStatus {
    show: boolean;
    running: boolean;
    jobId?: string;
    fileBuffer?: string;
    filename?: string;
}

export default function ResumeGeneratorPage() {
    const router = useRouter();
    const { toast } = useToast();
    // const supabase = createClientComponentClient(); -> Removed


    // Resume state
    // Resume state from store
    const {
        resumeText, resumeFilename, setResumeText,
        jobDescription, jobTitle, setJobDescription,
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
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto max-md:px-3 md:px-4 sm:px-6 py-4">
                    <div className="grid grid-cols-1 max-md:gap-3 md:grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center gap-4">
                        {/* Back Button */}
                        <div className="flex justify-start">
                            <Link
                                href="/dashboard/career"
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Back</span>
                            </Link>
                        </div>

                        {/* Title + Progress */}
                        <div className="text-center flex flex-col items-center">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                Resume Generator
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-1 rounded-full bg-blue-600" />
                                    <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                    <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Step 1 of 3</span>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <div className="hidden lg:block">
                                <ResumeUsageStats
                                    compact
                                    stats={usageLimit}
                                    onBuyCredits={() => setShowCreditModal(true)}
                                    onUpgrade={() => setShowPricingModal(true)}
                                />
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => router.push("/dashboard/career/history")}
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <History className="w-4 h-4" />
                                <span className="hidden sm:inline text-sm font-medium">History</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

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

                    <div className="space-y-6">
                        {/* Resume Panel */}
                        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resume</h2>
                                        <p className="text-xs text-gray-500">Paste or upload your current resume</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {resumeText && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-500 hover:text-blue-600"
                                            onClick={() => handleSaveResume(resumeText, resumeFilename || resumeName || "My Resume")}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                        onClick={() => router.push("/dashboard/career/saved-resumes")}
                                    >
                                        <BookOpen className="w-4 h-4 mr-1" />
                                        Saved
                                    </Button>
                                </div>
                            </div>

                            {/* Text Area */}
                            <div className="relative">
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your resume text here..."
                                    className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none text-sm"
                                />
                                {resumeText && (
                                    <button
                                        type="button"
                                        onClick={clearResume}
                                        className="absolute top-1 right-1 min-h-11 min-w-11 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        aria-label="Clear resume text"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Error Message */}
                            {errors.resume && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.resume}</p>
                                </div>
                            )}

                            {/* Success indicator */}
                            {resumeFilename && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <Check className="w-4 h-4" />
                                    Loaded: {resumeFilename}
                                </div>
                            )}

                            {/* OCR Processing UI */}
                            {resumeOcr.show && (
                                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    {!resumeOcr.running ? (
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                    Scanned Document Detected
                                                </h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                                    This PDF contains images instead of text. Use OCR to extract the content.
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => startOcr("resume")}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                                    >
                                                        <FileSearch className="w-3.5 h-3.5" />
                                                        Extract Text
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => cancelOcr("resume")}
                                                        className="text-gray-600 dark:text-gray-400"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
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

                                            {/* Progress Steps */}
                                            <div className="ml-2 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Document uploaded securely</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                                                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                                                    </div>
                                                    <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Analyzing page content...</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">3</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">Finalizing extraction</span>
                                                </div>
                                            </div>

                                            {/* Progress Indicator */}
                                            <div className="space-y-1.5">
                                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full w-2/3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse" />
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                                                    This typically takes 1-2 minutes
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* File Upload Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleResumeDrop}
                                onClick={() => resumeFileInputRef.current?.click()}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        resumeFileInputRef.current?.click();
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label="Upload a resume file"
                                className="mt-4 p-5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group"
                            >
                                <input
                                    ref={resumeFileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "resume");
                                    }}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center text-center">
                                    {isResumeUploading ? (
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                    ) : (
                                        <Upload className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors mb-2" />
                                    )}
                                    <p className="text-sm">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                                            {isResumeUploading ? "Processing..." : "Upload a file"}
                                        </span>
                                        {!isResumeUploading && <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        PDF, DOC, DOCX, TXT (max 10MB)
                                    </p>
                                </div>
                            </div>

                            {/* URL Input */}
                            <div className="mt-4 flex gap-2">
                                <Input
                                    value={resumeUrl}
                                    onChange={(e) => setResumeUrl(e.target.value)}
                                    placeholder="Or enter Google Drive / cloud storage URL"
                                    className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && resumeUrl.trim()) {
                                            handleUrlProcess(resumeUrl, "resume");
                                        }
                                    }}
                                />
                                <Button
                                    onClick={() => handleUrlProcess(resumeUrl, "resume")}
                                    disabled={!resumeUrl.trim() || isResumeUrlProcessing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                                >
                                    {isResumeUrlProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                </Button>
                                <div className="relative group">
                                    <Button variant="ghost" size="icon" className="text-gray-400">
                                        <HelpCircle className="w-4 h-4" />
                                    </Button>
                                    <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        <div className="font-medium mb-1">Supported URLs:</div>
                                        <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" /> Google Drive, Dropbox</div>
                                        <div className="flex items-center gap-1.5"><XCircle className="w-3 h-3 text-red-400 shrink-0" /> LinkedIn (copy text manually)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Save Checkbox */}
                            <div className="mt-4 flex items-center gap-3">
                                <Checkbox
                                    id="save-resume"
                                    checked={saveResume}
                                    onCheckedChange={(c) => setSaveResume(c as boolean)}
                                />
                                <label htmlFor="save-resume" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                    Save resume for future use
                                </label>
                                {saveResume && (
                                    <Input
                                        value={resumeName}
                                        onChange={(e) => setResumeName(e.target.value)}
                                        placeholder="Resume name (optional)"
                                        className="flex-1 h-8 text-sm"
                                    />
                                )}
                            </div>

                            {/* Character count */}
                            <div className="mt-3 text-xs text-gray-400">
                                {resumeText.length} characters
                                {resumeText.length < 50 && resumeText.length > 0 && (
                                    <span className="text-amber-500"> (min 50 required)</span>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Job Description Panel */}
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job Description</h2>
                                <p className="text-xs text-gray-500">Paste the job posting you're applying for</p>
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className="relative">
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                onBlur={() => {
                                    if (!jobDescription.trim()) return;
                                    const extracted = extractJobTitle(jobDescription);
                                    if (extracted) {
                                        setJobDescription(jobDescription, extracted);
                                    }
                                }}
                                placeholder="Copy and paste the full job description here..."
                                className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all resize-none text-sm"
                            />
                            {jobDescription && (
                                <button
                                    type="button"
                                    onClick={clearJob}
                                    className="absolute top-1 right-1 min-h-11 min-w-11 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    aria-label="Clear job description"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Error Message */}
                        {errors.job && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.job}</p>
                            </div>
                        )}

                        {/* Success indicator */}
                        {jobTitle && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <Check className="w-4 h-4" />
                                Loaded: {jobTitle}
                            </div>
                        )}

                        {/* OCR Prompt with Animated Progress */}
                        {jobOcr.show && (
                            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                                {!jobOcr.running ? (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileSearch className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                Scanned Document Detected
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                                This PDF contains images instead of text. Use OCR to extract the content.
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => startOcr("job")}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                                                >
                                                    <FileSearch className="w-3.5 h-3.5" />
                                                    Extract Text
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => cancelOcr("job")}
                                                    className="text-gray-600 dark:text-gray-400"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
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

                                        {/* Progress Steps */}
                                        <div className="ml-2 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-amber-600 dark:bg-amber-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-xs text-gray-700 dark:text-gray-300">Document uploaded securely</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-amber-600 dark:bg-amber-500 flex items-center justify-center">
                                                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                                                </div>
                                                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Analyzing page content...</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">3</span>
                                                </div>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">Finalizing extraction</span>
                                            </div>
                                        </div>

                                        {/* Progress Indicator */}
                                        <div className="space-y-1.5">
                                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full w-2/3 bg-amber-600 dark:bg-amber-500 rounded-full animate-pulse" />
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                                                This typically takes 1-2 minutes
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* File Upload Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleJobDrop}
                            onClick={() => jobFileInputRef.current?.click()}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    jobFileInputRef.current?.click();
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label="Upload a job description file"
                            className="mt-4 p-5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all cursor-pointer group"
                        >
                            <input
                                ref={jobFileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, "job");
                                }}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center text-center">
                                {isJobUploading ? (
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                                ) : (
                                    <Upload className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors mb-2" />
                                )}
                                <p className="text-sm">
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        {isJobUploading ? "Processing..." : "Upload a file"}
                                    </span>
                                    {!isJobUploading && <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    PDF, DOC, DOCX, TXT (max 10MB)
                                </p>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="mt-4 flex gap-2">
                            <Input
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="Or enter job posting URL (Indeed, Glassdoor, etc.)"
                                className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && jobUrl.trim()) {
                                        handleUrlProcess(jobUrl, "job");
                                    }
                                }}
                            />
                            <Button
                                onClick={() => handleUrlProcess(jobUrl, "job")}
                                disabled={!jobUrl.trim() || isJobUrlProcessing}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3"
                            >
                                {isJobUrlProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                            </Button>
                            <div className="relative group">
                                <Button variant="ghost" size="icon" className="text-gray-400">
                                    <HelpCircle className="w-4 h-4" />
                                </Button>
                                <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    <div className="font-medium mb-1">Supported URLs:</div>
                                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" /> Indeed, Glassdoor, ZipRecruiter</div>
                                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" /> Company career pages</div>
                                    <div className="flex items-center gap-1.5"><XCircle className="w-3 h-3 text-red-400 shrink-0" /> LinkedIn (copy text manually)</div>
                                </div>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span><strong>Tip:</strong> Include the full job requirements, skills, and qualifications for better AI matching.</span>
                            </p>
                        </div>

                        {/* Character count */}
                        <div className="mt-3 text-xs text-gray-400">
                            {jobDescription.length} characters
                            {jobDescription.length < 50 && jobDescription.length > 0 && (
                                <span className="text-amber-500"> (min 50 required)</span>
                            )}
                        </div>
                    </Card>
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
        />
        </>
    );
}
