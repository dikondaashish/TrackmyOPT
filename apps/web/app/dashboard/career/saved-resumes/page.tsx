"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    FileText,
    Trash2,
    Loader2,
    AlertCircle,
    Plus,
    FolderDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/resume-store";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { format } from "date-fns";

interface SavedResume {
    id: string;
    filename: string;
    description: string;
    content: string;
    created_at: string;
    file_path?: string;
    structuredData?: any;
}

export default function HistoryPage() {
    const router = useRouter();
    const { toast } = useToast();
    // const supabase = createClientComponentClient(); -> Removed, using imported singleton


    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isSlowLoad, setIsSlowLoad] = useState(false);

    useEffect(() => {
        fetchResumes();
    }, []);

    // Effect to auto-select/preview the most recent resume if available
    useEffect(() => {
        if (!isLoading && resumes.length > 0 && !loadingId) {
            // Logic for visual cues can go here
        }
    }, [isLoading, resumes]);

    const fetchResumes = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
                setError("Please log in to view saved resumes.");
                return;
            }

            // Set a timeout for the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout (to allow for Render cold starts)

            // Show a "Waking up server" message after 8 seconds
            const slowLoadId = setTimeout(() => setIsSlowLoad(true), 8000);

            const response = await fetch(`/api/proxy/resume/list?userId=${user.id}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            clearTimeout(slowLoadId);
            setIsSlowLoad(false);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error("Invalid response format from server");
            }
            
            setResumes(data);
        } catch (error: any) {
            console.error("Fetch error:", error);
            if (error.name === 'AbortError') {
                setError("Request timed out. Please check your connection and try again.");
            } else {
                setError(error.message || "Could not load your saved resumes.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const response = await fetch(`/api/proxy/resume/${id}?userId=${user.id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete resume");

            toast({
                title: "Resume Deleted",
                description: "The resume has been removed from your profile.",
            });

            setResumes(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Delete Failed",
                description: "Could not delete the resume. Please try again.",
                variant: "destructive",
            });
        }
    };

    const { setResumeText, setGeneratedLatex, setJobDescription, setAtsAnalysis } = useResumeStore();

    const handleLoadResume = async (resume: SavedResume) => {
        setLoadingId(resume.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({
                    title: "Authentication Error",
                    description: "Please log in to load resumes.",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch(`/api/proxy/resume/${resume.id}?userId=${user.id}`);

            if (!response.ok) {
                // Fallback to basic content if detailed fetch fails
                // Could not fetch full resume details, using basic content
                setResumeText(resume.content, resume.filename);
                router.push("/dashboard/career/resume-generator");
                return;
            }

            const fullResume = await response.json();
            const structuredData = fullResume.structuredData || {};

            // Check if we have generated LaTeX content
            if (structuredData.generatedLatex || structuredData.latexCode) {
                const latex = structuredData.generatedLatex || structuredData.latexCode;

                // Set store state for editor
                setGeneratedLatex(latex);
                setResumeText(resume.content, resume.filename); // Keep source text too

                if (structuredData.jobDescription) {
                    setJobDescription(structuredData.jobDescription);
                }

                if (structuredData.atsAnalysis) {
                    // Ensure type compatibility or let it be inferred
                    setAtsAnalysis(structuredData.atsAnalysis);
                }

                router.push("/dashboard/career/resume-generator/editor");
            } else {
                // Legacy behavior - just text
                setResumeText(resume.content, resume.filename);
                router.push("/dashboard/career/resume-generator");
            }

        } catch (error) {
            console.error("Error loading resume:", error);
            toast({
                title: "Error",
                description: "Failed to load resume details. Using available content.",
                variant: "destructive",
            });
            // Fallback
            setResumeText(resume.content, resume.filename);
            router.push("/dashboard/career/resume-generator");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDownload = async (resume: SavedResume) => {
        if (!resume.file_path) {
            toast({
                title: "Download Unavailable",
                description: "This resume does not have a saved file.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(`/api/proxy/resume/download-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ s3Key: resume.file_path }),
            });

            if (!response.ok) throw new Error("Failed to get download link");

            const { url } = await response.json();
            window.open(url, "_blank");
        } catch (error) {
            console.error("Download error:", error);
            toast({
                title: "Download Failed",
                description: "Could not download the file.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dashboard/career/resume-generator"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>

                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                Resume History
                            </h1>
                        </div>

                        <Link href="/dashboard/career/resume-generator">
                            <Button size="sm" className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4" />
                                New Resume
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500">Loading your resumes...</p>
                        {isSlowLoad && (
                            <p className="text-xs text-blue-500 mt-4 animate-pulse italic">
                                Wait a moment while we wake up the server...
                            </p>
                        )}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Resumes</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <Button onClick={fetchResumes}>Try Again</Button>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No history yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            Upload and save your resumes to quickly access them when generating new applications.
                        </p>
                        <Link href="/dashboard/career/resume-generator">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Resume
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {resumes.map((resume, index) => (
                            <div key={resume.id} className={`group bg-white dark:bg-slate-800/60 rounded-xl border ${index === 0 ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-gray-200 dark:border-slate-600'} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-200 overflow-hidden`}>
                                {/* Modern Header */}
                                <div className={`p-4 ${index === 0 ? 'bg-blue-100/50 dark:bg-blue-900/50' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">📄</div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white capitalize text-sm flex items-center gap-2">
                                                    Resume
                                                    {index === 0 && (
                                                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Latest</span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5" title={new Date(resume.created_at).toLocaleString()}>
                                                    Created {format(new Date(resume.created_at), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-1 text-xs rounded-full px-2.5 py-1 font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                            <span>✓</span>
                                            <span>Parsed</span>
                                        </div>
                                        {/* Generated Badge */}
                                        {(resume.structuredData?.latexCode || resume.structuredData?.generatedLatex) && (
                                            <div className="ml-2 flex items-center gap-1 text-xs rounded-full px-2.5 py-1 font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                                <span>⚡</span>
                                                <span>Generated</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    {/* Filename */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={resume.filename}>
                                            {resume.filename}
                                        </p>
                                    </div>

                                    {/* Summary/Preview */}
                                    <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed h-8">
                                        {resume.content || "No content preview available."}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={() => handleLoadResume(resume)}
                                            disabled={loadingId === resume.id}
                                            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium hover:shadow-md h-9"
                                        >
                                            {loadingId === resume.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                (resume.structuredData?.latexCode || resume.structuredData?.generatedLatex) ? "Edit Resume" : "Use Resume"
                                            )}
                                        </Button>

                                        {resume.file_path && (
                                            <button
                                                onClick={() => handleDownload(resume)}
                                                className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                                title="Download resume"
                                            >
                                                <FolderDown className="w-4 h-4" />
                                            </button>
                                        )}

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
                                                    title="Delete resume"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete this resume from your saved list.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(resume.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
