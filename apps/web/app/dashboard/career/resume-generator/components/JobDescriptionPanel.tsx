"use client";

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
    Link2,
    HelpCircle,
    Lightbulb,
} from "lucide-react";
import { extractJobTitle } from "@/lib/resume/extract-job-title";

export type JobDescriptionPanelProps = {
    text: string;
    onTextChange: (value: string, title?: string) => void;
    title: string | null;
    alignJobTitles: boolean;
    onAlignJobTitlesChange: (value: boolean) => void;
    onClear: () => void;
    error?: string;
    url: string;
    onUrlChange: (value: string) => void;
    isUrlProcessing: boolean;
    onUrlProcess: () => void;
};

export function JobDescriptionPanel({
    text,
    onTextChange,
    title,
    alignJobTitles,
    onAlignJobTitlesChange,
    onClear,
    error,
    url,
    onUrlChange,
    isUrlProcessing,
    onUrlProcess,
}: JobDescriptionPanelProps) {
    return (
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100" id="job-description-heading">Paste the job description</h2>
                    <p className="text-xs text-gray-500">Copy the posting from the job board or company website.</p>
                </div>
            </div>

            {/* Text Area */}
            <div className="relative">
                <textarea
                    aria-labelledby="job-description-heading"
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

            <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-amber-700 dark:text-amber-400">Import from a link instead</summary>
                <div className="mt-3 flex gap-2">
                    <Input
                        value={url}
                        onChange={(e) => onUrlChange(e.target.value)}
                        aria-label="Job posting URL"
                        placeholder="https://company.com/careers/job"
                        className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && url.trim()) {
                                onUrlProcess();
                            }
                        }}
                    />
                    <Button
                        aria-label="Import job description from link"
                        onClick={onUrlProcess}
                        disabled={!url.trim() || isUrlProcessing}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3"
                    >
                        {isUrlProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    </Button>
                    <div className="relative group">
                        <Button variant="ghost" size="icon" className="text-gray-400" aria-label="Supported job posting links">
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

            </details>

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
