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
    X,
    BookOpen,
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

    // File upload handlers
    const handleResumeFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResumeFile(file);
            setResumeSource("file");
            // Read file content
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
        // TODO: Implement URL fetching
        setResumeSource("url");
    };

    const handleJobUrlFetch = async () => {
        if (!jobUrl) return;
        // TODO: Implement URL fetching
        setJobSource("url");
    };

    // Generate handler
    const handleGenerate = async () => {
        if (!resumeText || !jobText) return;

        setIsGenerating(true);
        try {
            // TODO: Implement AI generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Navigate to template selection or results
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
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
        if (file) {
            setResumeFile(file);
            setResumeSource("file");
        }
    };

    const handleJobDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setJobFile(file);
            setJobSource("file");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <Link
                            href="/dashboard/career"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>

                        {/* Title */}
                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                Resume Generator
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Paste a job description and generate a tailored resume version
                            </p>
                        </div>

                        {/* History Button */}
                        <Button
                            variant="outline"
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <History className="w-4 h-4" />
                            <div className="hidden sm:block text-left">
                                <span className="text-sm font-medium">History</span>
                                <p className="text-xs text-gray-500">View past scans</p>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Resume Panel */}
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resume</h2>
                            </div>
                            <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                <BookOpen className="w-4 h-4 mr-1" />
                                Saved Resumes
                            </Button>
                        </div>

                        {/* Debug Info */}
                        <div className="mb-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                            Debug: Resume text length: {resumeText.length} | Source: {resumeSource}
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={resumeText}
                            onChange={(e) => {
                                setResumeText(e.target.value);
                                setResumeSource("text");
                            }}
                            placeholder="Paste resume text here..."
                            className="w-full h-32 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none"
                        />

                        {/* File Upload Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleResumeDrop}
                            onClick={() => resumeFileInputRef.current?.click()}
                            className="mt-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group"
                        >
                            <input
                                ref={resumeFileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleResumeFileChange}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center text-center">
                                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors mb-2" />
                                <p className="text-sm">
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Upload a file</span>
                                    <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    PDF, DOC, DOCX, TXT files only (max 10MB)
                                </p>
                                {resumeFile && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                        <Check className="w-4 h-4" />
                                        {resumeFile.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="mt-4 flex gap-2">
                            <Input
                                value={resumeUrl}
                                onChange={(e) => setResumeUrl(e.target.value)}
                                placeholder="Enter Google Drive or cloud storage URL"
                                className="flex-1 bg-gray-50 dark:bg-gray-800/50"
                            />
                            <Button
                                onClick={handleResumeUrlFetch}
                                disabled={!resumeUrl}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                            >
                                <Link2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400">
                                <HelpCircle className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Save Checkbox */}
                        <div className="mt-4 flex items-center gap-2">
                            <Checkbox
                                id="save-resume"
                                checked={saveResume}
                                onCheckedChange={(c) => setSaveResume(c)}
                                className="border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor="save-resume" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                Save resume for future use
                            </label>
                        </div>
                    </Card>

                    {/* Job Description Panel */}
                    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job Description</h2>
                        </div>

                        {/* Debug Info */}
                        <div className="mb-3 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-700 dark:text-amber-300">
                            Debug: Job text length: {jobText.length} | Source: {jobSource}
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={jobText}
                            onChange={(e) => {
                                setJobText(e.target.value);
                                setJobSource("text");
                            }}
                            placeholder="Copy and paste job description here..."
                            className="w-full h-32 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all resize-none"
                        />

                        {/* Tip */}
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            💡 Tip: Include requirements, skills, and qualifications for better analysis
                        </p>

                        {/* File Upload Area */}
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleJobDrop}
                            onClick={() => jobFileInputRef.current?.click()}
                            className="mt-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all cursor-pointer group"
                        >
                            <input
                                ref={jobFileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleJobFileChange}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center text-center">
                                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors mb-2" />
                                <p className="text-sm">
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">Upload a file</span>
                                    <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    PDF, DOC, DOCX, TXT files only (max 10MB)
                                </p>
                                {jobFile && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                        <Check className="w-4 h-4" />
                                        {jobFile.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="mt-4 flex gap-2">
                            <Input
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                                placeholder="Enter job posting URL (LinkedIn, Indeed, etc.)"
                                className="flex-1 bg-gray-50 dark:bg-gray-800/50"
                            />
                            <Button
                                onClick={handleJobUrlFetch}
                                disabled={!jobUrl}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4"
                            >
                                <Link2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400">
                                <HelpCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Generate Button */}
                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !resumeText || !jobText}
                        className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Select Template
                            </>
                        )}
                    </Button>
                </div>

                {/* Helper Text */}
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Our AI will analyze your resume and the job description to create a tailored version
                </p>
            </div>
        </div>
    );
}
