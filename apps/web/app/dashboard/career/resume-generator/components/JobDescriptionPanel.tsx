"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Briefcase,
    Loader2,
    Check,
    CheckCircle2,
    XCircle,
    AlertCircle,
    X,
    Upload,
    Link2,
    HelpCircle,
    Lightbulb,
} from "lucide-react";
import { extractJobTitle } from "@/lib/resume/extract-job-title";
import { OcrProcessingCard, type OcrStatus } from "./OcrProcessingCard";

export type JobDescriptionPanelProps = {
    text: string;
    onTextChange: (value: string, title?: string) => void;
    title: string | null;
    alignJobTitles: boolean;
    onAlignJobTitlesChange: (value: boolean) => void;
    onClear: () => void;
    error?: string;
    ocr: OcrStatus;
    onStartOcr: () => void;
    onCancelOcr: () => void;
    isUploading: boolean;
    url: string;
    onUrlChange: (value: string) => void;
    isUrlProcessing: boolean;
    onUrlProcess: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onFileUpload: (file: File) => void;
    onDragOver: (e: React.DragEvent) => void;
    onFileDrop: (e: React.DragEvent) => void;
};

export function JobDescriptionPanel({
    text,
    onTextChange,
    title,
    alignJobTitles,
    onAlignJobTitlesChange,
    onClear,
    error,
    ocr,
    onStartOcr,
    onCancelOcr,
    isUploading,
    url,
    onUrlChange,
    isUrlProcessing,
    onUrlProcess,
    fileInputRef,
    onFileUpload,
    onDragOver,
    onFileDrop,
}: JobDescriptionPanelProps) {
    return (
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
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    onBlur={() => {
                        if (!text.trim()) return;
                        const extracted = extractJobTitle(text);
                        if (extracted) {
                            onTextChange(text, extracted);
                        }
                    }}
                    placeholder="Copy and paste the full job description here..."
                    className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 transition-all resize-none text-sm"
                />
                {text && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-1 right-1 min-h-11 min-w-11 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear job description"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                <Checkbox
                    id="align-job-titles"
                    checked={alignJobTitles}
                    onCheckedChange={(checked) => onAlignJobTitlesChange(checked === true)}
                />
                <label
                    htmlFor="align-job-titles"
                    className="flex-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                >
                    Align job titles to this role
                </label>
                <div className="relative group shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400"
                        aria-label="What does align job titles mean?"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-full right-0 z-10 mb-2 w-64 rounded-lg bg-gray-800 p-3 text-xs text-white opacity-0 transition-opacity pointer-events-none group-hover:opacity-100">
                        <div className="mb-1 font-medium">Align job titles:</div>
                        <p className="leading-relaxed text-gray-200">
                            Rewrites your employment titles as a career progression toward the role in
                            this job description.
                        </p>
                        <p className="mt-2 leading-relaxed text-gray-300">
                            Example: if the posting is Senior Data Analyst and your resume says Software
                            Engineer, titles may become Junior Data Analyst → Data Analyst → Lead Data
                            Analyst → Senior Data Analyst.
                        </p>
                        <p className="mt-2 leading-relaxed text-gray-400">
                            Company names and dates stay the same. Off by default.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Success indicator */}
            {title && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    Loaded: {title}
                </div>
            )}

            <OcrProcessingCard
                ocr={ocr}
                accent="amber"
                onStart={onStartOcr}
                onCancel={onCancelOcr}
            />

            {/* File Upload Area */}
            <div
                onDragOver={onDragOver}
                onDrop={onFileDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        fileInputRef.current?.click();
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload a job description file"
                className="mt-4 p-5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all cursor-pointer group"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileUpload(file);
                    }}
                    className="hidden"
                />
                <div className="flex flex-col items-center text-center">
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                    ) : (
                        <Upload className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors mb-2" />
                    )}
                    <p className="text-sm">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {isUploading ? "Processing..." : "Upload a file"}
                        </span>
                        {!isUploading && <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        PDF, DOC, DOCX, TXT (max 10MB)
                    </p>
                </div>
            </div>

            {/* URL Input */}
            <div className="mt-4 flex gap-2">
                <Input
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="Or enter job posting URL (Indeed, Glassdoor, etc.)"
                    className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-sm"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && url.trim()) {
                            onUrlProcess();
                        }
                    }}
                />
                <Button
                    onClick={onUrlProcess}
                    disabled={!url.trim() || isUrlProcessing}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3"
                >
                    {isUrlProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
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
                {text.length} characters
                {text.length < 50 && text.length > 0 && (
                    <span className="text-amber-500"> (min 50 required)</span>
                )}
            </div>
        </Card>

    );
}
