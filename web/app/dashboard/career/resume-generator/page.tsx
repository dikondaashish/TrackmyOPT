"use client";

import React, { useState } from "react";
import { ArrowLeft, History, FileText, Link as LinkIcon, Upload, Sparkles, Check, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ResumeGeneratorPage() {
    const router = useRouter();
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [saveResume, setSaveResume] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        className="group gap-2 pl-0 hover:bg-transparent hover:text-primary"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </Button>

                    <div className="flex-1 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resume Generator</h1>
                        <p className="text-sm text-slate-500 mt-1">Paste a job description and generate a tailored resume version</p>
                    </div>

                    <Button
                        variant="outline"
                        className="gap-2 bg-white"
                        onClick={() => router.push('/dashboard/career/resume-generator/history')}
                    >
                        <History className="w-4 h-4 text-slate-500" />
                        <div className="flex flex-col items-start leading-none">
                            <span className="font-semibold text-xs text-slate-900">History</span>
                            <span className="text-[10px] text-slate-500 font-normal">View past scans</span>
                        </div>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* Left Column: Resume Input */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-white">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    Resume
                                </CardTitle>
                                <div className="flex items-center gap-2 text-primary/80 font-medium text-xs">
                                    <FileText className="w-3.5 h-3.5" />
                                    Saved Resumes
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6 bg-slate-50/30 min-h-[500px]">

                            {/* Debug/Status Strip (Matching Design) */}
                            <div className="bg-yellow-50 border border-yellow-100/50 rounded-md px-3 py-2 text-[10px] sm:text-xs text-yellow-800 font-mono flex items-center gap-2">
                                Debug: Resume text length: {resumeText.length} | Source: {resumeText ? 'text' : 'empty'} |
                            </div>

                            {/* Text Input Area */}
                            <div className="relative">
                                <Textarea
                                    placeholder="Paste resume text here..."
                                    className="min-h-[200px] resize-none bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 p-4 text-sm leading-relaxed"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                />
                            </div>

                            {/* Drag & Drop Upload Zone */}
                            <div className="border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group bg-white">
                                <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-4 transition-colors border border-slate-100 group-hover:border-primary/20 shadow-sm">
                                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-sm font-medium text-primary mb-1 group-hover:underline decoration-primary/30 underline-offset-4">
                                    Upload a file <span className="text-slate-600 no-underline font-normal">or drag and drop</span>
                                </h3>
                                <p className="text-xs text-slate-400">PDF, DOC, DOCX, TXT files only (max 10MB)</p>
                            </div>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <LinkIcon className="w-4 h-4" />
                                    </div>
                                    <Input
                                        placeholder="Enter Google Drive or cloud storage URL"
                                        className="pl-9 bg-white border-slate-200"
                                        value={resumeUrl}
                                        onChange={(e) => setResumeUrl(e.target.value)}
                                    />
                                </div>
                                <Button size="icon" className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-10 h-10">
                                    <LinkIcon className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center justify-center w-6 text-slate-300">
                                    <span className="sr-only">Info</span>
                                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-serif italic text-slate-400">i</div>
                                </div>
                            </div>

                            {/* Save Checkbox */}
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="save-resume"
                                    checked={saveResume}
                                    onCheckedChange={(c) => setSaveResume(!!c)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <label
                                    htmlFor="save-resume"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                                >
                                    Save resume for future use
                                </label>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Right Column: Job Description Input */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-white">
                            <CardTitle className="text-lg font-semibold">
                                Job Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6 bg-slate-50/30 min-h-[500px]">

                            {/* Debug/Status Strip */}
                            <div className="bg-yellow-50 border border-yellow-100/50 rounded-md px-3 py-2 text-[10px] sm:text-xs text-yellow-800 font-mono flex items-center gap-2">
                                Debug: Job text length: {jobDescription.length} | Source: {jobDescription ? 'text' : 'empty'} |
                            </div>

                            {/* Text Input Area */}
                            <div className="relative">
                                <Textarea
                                    placeholder="Copy and paste job description here..."
                                    className="min-h-[200px] resize-none bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 p-4 text-sm leading-relaxed"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            {/* Tip Text */}
                            <p className="text-xs text-slate-500 italic">
                                Tip: Include requirements, skills, and qualifications for better analysis
                            </p>

                            {/* Drag & Drop Upload Zone */}
                            <div className="border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/5 rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group bg-white">
                                <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mb-4 transition-colors border border-slate-100 group-hover:border-primary/20 shadow-sm">
                                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-sm font-medium text-primary mb-1 group-hover:underline decoration-primary/30 underline-offset-4">
                                    Upload a file <span className="text-slate-600 no-underline font-normal">or drag and drop</span>
                                </h3>
                                <p className="text-xs text-slate-400">PDF, DOC, DOCX, TXT files only (max 10MB)</p>
                            </div>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Enter job posting URL (LinkedIn, Indeed, etc.)"
                                        className="bg-white border-slate-200"
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                    />
                                </div>
                                <Button size="icon" className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-10 h-10">
                                    <LinkIcon className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center justify-center w-6 text-slate-300">
                                    <span className="sr-only">Info</span>
                                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-serif italic text-slate-400">i</div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                </div>

                {/* Footer Action */}
                <div className="flex justify-center pt-6 pb-12 sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent p-4 z-10 w-full">
                    <Button
                        size="lg"
                        className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-8 shadow-lg shadow-amber-500/20 rounded-full transition-all hover:scale-105 active:scale-95"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Select Template
                    </Button>
                </div>

            </div>
        </div>
    );
}
