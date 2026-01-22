"use client";

import { useState, useRef, useCallback } from "react";
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
    Briefcase,
    HelpCircle,
    Loader2,
    Check,
    BookOpen,
    Wand2,
    ChevronRight,
    Target,
    Zap,
    Shield,
    X,
} from "lucide-react";
import Link from "next/link";

export default function ResumeGeneratorPage() {
    // Resume state
    const [resumeText, setResumeText] = useState("");
    const [resumeSource, setResumeSource] = useState<"text" | "file" | "url">("text");
    const [resumeUrl, setResumeUrl] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [saveResume, setSaveResume] = useState(false);
    const resumeFileInputRef = useRef<HTMLInputElement>(null);

    // Job Description state
    const [jobText, setJobText] = useState("");
    const [jobSource, setJobSource] = useState<"text" | "file" | "url">("text");
    const [jobUrl, setJobUrl] = useState("");
    const [jobFile, setJobFile] = useState<File | null>(null);
    const jobFileInputRef = useRef<HTMLInputElement>(null);

    // UI state
    const [isGenerating, setIsGenerating] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isDraggingResume, setIsDraggingResume] = useState(false);
    const [isDraggingJob, setIsDraggingJob] = useState(false);

    // File upload handlers
    const handleResumeFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResumeFile(file);
            setResumeSource("file");
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setResumeText(text);
            };
            if (file.type === "text/plain") {
                reader.readAsText(file);
            }
        }
    }, []);

    const handleJobFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setJobFile(file);
            setJobSource("file");
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setJobText(text);
            };
            if (file.type === "text/plain") {
                reader.readAsText(file);
            }
        }
    }, []);

    // URL fetch handlers
    const handleResumeUrlFetch = async () => {
        if (!resumeUrl) return;
        setResumeSource("url");
    };

    const handleJobUrlFetch = async () => {
        if (!jobUrl) return;
        setJobSource("url");
    };

    // Generate handler
    const handleGenerate = async () => {
        if (!resumeText || !jobText) return;

        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent, setDragging: (v: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent, setDragging: (v: boolean) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleResumeDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingResume(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setResumeFile(file);
            setResumeSource("file");
        }
    };

    const handleJobDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingJob(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setJobFile(file);
            setJobSource("file");
        }
    };

    const clearResumeFile = () => {
        setResumeFile(null);
        setResumeSource("text");
    };

    const clearJobFile = () => {
        setJobFile(null);
        setJobSource("text");
    };

    // Progress calculation
    const hasResume = resumeText.length > 50 || resumeFile;
    const hasJobDescription = jobText.length > 50 || jobFile;
    const canGenerate = hasResume && hasJobDescription;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                {/* Back Link */}
                <Link
                    href="/dashboard/career"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Career Hub
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                            <Wand2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Resume Generator</h1>
                            <p className="text-muted-foreground">
                                AI-powered resume tailoring for your dream job
                            </p>
                        </div>
                    </div>

                    {/* History Button */}
                    <Button
                        variant="outline"
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 self-start sm:self-auto"
                    >
                        <History className="w-4 h-4" />
                        <span>History</span>
                    </Button>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${hasResume ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                            {hasResume ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">1</span>}
                            <span className="text-sm font-medium">Upload Resume</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${hasJobDescription ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                            {hasJobDescription ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">2</span>}
                            <span className="text-sm font-medium">Add Job Description</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${canGenerate ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' : 'bg-muted text-muted-foreground'}`}>
                            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">3</span>
                            <span className="text-sm font-medium">Generate</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Resume Panel */}
                    <Card className="overflow-hidden border-2 transition-all hover:border-blue-200 dark:hover:border-blue-800">
                        {/* Panel Header */}
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Your Resume</h2>
                                        <p className="text-xs text-muted-foreground">Paste text or upload file</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                                    <BookOpen className="w-4 h-4 mr-1" />
                                    Saved
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Text Area */}
                            <textarea
                                value={resumeText}
                                onChange={(e) => {
                                    setResumeText(e.target.value);
                                    setResumeSource("text");
                                }}
                                placeholder="Paste your resume content here...

Include your work experience, skills, education, and any relevant achievements."
                                className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none text-sm"
                            />

                            {/* File Upload Area */}
                            <div
                                onDragOver={(e) => handleDragOver(e, setIsDraggingResume)}
                                onDragLeave={(e) => handleDragLeave(e, setIsDraggingResume)}
                                onDrop={handleResumeDrop}
                                onClick={() => !resumeFile && resumeFileInputRef.current?.click()}
                                className={`relative p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer ${isDraggingResume
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : resumeFile
                                            ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                                    }`}
                            >
                                <input
                                    ref={resumeFileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleResumeFileChange}
                                    className="hidden"
                                />
                                {resumeFile ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{resumeFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearResumeFile(); }} className="text-gray-400 hover:text-red-500">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <Upload className={`w-8 h-8 mb-2 transition-colors ${isDraggingResume ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <p className="text-sm">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">Upload a file</span>
                                            <span className="text-muted-foreground"> or drag and drop</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT (max 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <Input
                                    value={resumeUrl}
                                    onChange={(e) => setResumeUrl(e.target.value)}
                                    placeholder="Or paste Google Drive / cloud URL"
                                    className="flex-1 text-sm"
                                />
                                <Button onClick={handleResumeUrlFetch} disabled={!resumeUrl} size="icon" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Link2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Save Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    id="save-resume"
                                    checked={saveResume}
                                    onCheckedChange={(c) => setSaveResume(c)}
                                />
                                <span className="text-sm text-muted-foreground">Save resume for future use</span>
                            </label>
                        </div>
                    </Card>

                    {/* Job Description Panel */}
                    <Card className="overflow-hidden border-2 transition-all hover:border-amber-200 dark:hover:border-amber-800">
                        {/* Panel Header */}
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                                    <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Job Description</h2>
                                    <p className="text-xs text-muted-foreground">The role you're applying for</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Text Area */}
                            <textarea
                                value={jobText}
                                onChange={(e) => {
                                    setJobText(e.target.value);
                                    setJobSource("text");
                                }}
                                placeholder="Paste the job description here...

Include requirements, responsibilities, and qualifications for best results."
                                className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all resize-none text-sm"
                            />

                            {/* Tip Box */}
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    💡 <strong>Pro tip:</strong> Include the full job posting with requirements, skills, and qualifications for the most accurate resume tailoring.
                                </p>
                            </div>

                            {/* File Upload Area */}
                            <div
                                onDragOver={(e) => handleDragOver(e, setIsDraggingJob)}
                                onDragLeave={(e) => handleDragLeave(e, setIsDraggingJob)}
                                onDrop={handleJobDrop}
                                onClick={() => !jobFile && jobFileInputRef.current?.click()}
                                className={`relative p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer ${isDraggingJob
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                        : jobFile
                                            ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-900/10'
                                    }`}
                            >
                                <input
                                    ref={jobFileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleJobFileChange}
                                    className="hidden"
                                />
                                {jobFile ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{jobFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{(jobFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearJobFile(); }} className="text-gray-400 hover:text-red-500">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <Upload className={`w-8 h-8 mb-2 transition-colors ${isDraggingJob ? 'text-amber-500' : 'text-gray-400'}`} />
                                        <p className="text-sm">
                                            <span className="text-amber-600 dark:text-amber-400 font-medium">Upload a file</span>
                                            <span className="text-muted-foreground"> or drag and drop</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT (max 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <Input
                                    value={jobUrl}
                                    onChange={(e) => setJobUrl(e.target.value)}
                                    placeholder="Or paste job posting URL (LinkedIn, Indeed...)"
                                    className="flex-1 text-sm"
                                />
                                <Button onClick={handleJobUrlFetch} disabled={!jobUrl} size="icon" className="bg-amber-500 hover:bg-amber-600 text-white">
                                    <Link2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Features Highlight */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-card border rounded-xl">
                        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Keyword Optimization</p>
                            <p className="text-xs text-muted-foreground">Match ATS requirements</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-card border rounded-xl">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Instant Generation</p>
                            <p className="text-xs text-muted-foreground">AI-powered in seconds</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-card border rounded-xl">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Privacy First</p>
                            <p className="text-xs text-muted-foreground">Your data stays secure</p>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <div className="mt-8 flex flex-col items-center">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !canGenerate}
                        size="lg"
                        className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Tailored Resume
                            </>
                        )}
                    </Button>
                    <p className="mt-3 text-sm text-muted-foreground text-center max-w-md">
                        Our AI will analyze both documents and create a resume optimized for this specific role
                    </p>
                </div>
            </div>
        </div>
    );
}
