"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FileText,
    BookOpen,
    Loader2,
    Check,
    CheckCircle2,
    XCircle,
    AlertCircle,
    X,
    Save,
    Upload,
    Link2,
    HelpCircle,
} from "lucide-react";
import { OcrProcessingCard, type OcrStatus } from "./OcrProcessingCard";

export type ResumeInputPanelProps = {
    text: string;
    onTextChange: (value: string) => void;
    filename: string | null;
    resumeName: string;
    onResumeNameChange: (value: string) => void;
    saveResume: boolean;
    onSaveResumeChange: (value: boolean) => void;
    isSaving: boolean;
    onSave: (content: string, name: string) => void;
    onClear: () => void;
    onOpenSaved: () => void;
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

export function ResumeInputPanel({
    text,
    onTextChange,
    filename,
    resumeName,
    onResumeNameChange,
    saveResume,
    onSaveResumeChange,
    isSaving,
    onSave,
    onClear,
    onOpenSaved,
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
}: ResumeInputPanelProps) {
    return (
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
                    {text && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-600"
                            onClick={() => onSave(text, filename || resumeName || "My Resume")}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        onClick={onOpenSaved}
                    >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Saved
                    </Button>
                </div>
            </div>

            {/* Text Area */}
            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder="Paste your resume text here..."
                    className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none text-sm"
                />
                {text && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-1 right-1 min-h-11 min-w-11 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Clear resume text"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Success indicator */}
            {filename && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    Loaded: {filename}
                </div>
            )}

            <OcrProcessingCard
                ocr={ocr}
                accent="blue"
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
                aria-label="Upload a resume file"
                className="mt-4 p-5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group"
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
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    ) : (
                        <Upload className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors mb-2" />
                    )}
                    <p className="text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
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
                    placeholder="Or enter Google Drive / cloud storage URL"
                    className="flex-1 bg-gray-50 dark:bg-gray-800/50 text-sm"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && url.trim()) {
                            onUrlProcess();
                        }
                    }}
                />
                <Button
                    onClick={() => onUrlProcess()}
                    disabled={!url.trim() || isUrlProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                >
                    {isUrlProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
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
                    onCheckedChange={(c) => onSaveResumeChange(c as boolean)}
                />
                <label htmlFor="save-resume" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    Save resume for future use
                </label>
                {saveResume && (
                    <Input
                        value={resumeName}
                        onChange={(e) => onResumeNameChange(e.target.value)}
                        placeholder="Resume name (optional)"
                        className="flex-1 h-8 text-sm"
                    />
                )}
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
