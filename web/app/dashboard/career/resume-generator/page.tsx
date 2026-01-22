"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Link, Zap, Search, FileText, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { scanResume } from './actions';

interface ResumeData {
    text: string;
    filename?: string;
    source: 'text' | 'file' | 'url';
}

interface JobData {
    text: string;
    title?: string;
    source: 'text' | 'file' | 'url';
}

export default function ATSScannerPage() {
    const router = useRouter();
    const { toast } = useToast();

    const showToast = ({ icon, title, message }: { icon?: string; title: string; message: string }) => {
        toast({
            title: title,
            description: message,
        });
    };

    const [resumeData, setResumeData] = useState<ResumeData>({ text: '', source: 'text' });
    const [jobData, setJobData] = useState<JobData>({ text: '', source: 'text' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [urlInputs, setUrlInputs] = useState({ resume: '', job: '' });
    const [result, setResult] = useState<any>(null);

    // File Upload Handler
    const handleFileUpload = async (file: File, type: 'resume' | 'job') => {
        setIsUploading(true);
        try {
            if (type === 'resume') {
                setResumeData({ text: `[File Uploaded: ${file.name}]`, filename: file.name, source: 'file' });
            } else {
                setJobData({ text: `[File Uploaded: ${file.name}]`, title: file.name, source: 'file' });
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleScan = async () => {
        if ((!resumeData.text && resumeData.source !== 'file') || (!jobData.text && jobData.source !== 'file')) {
            showToast({ title: 'Missing Info', message: 'Please provide both resume and job description.' });
            return;
        }

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('resumeText', resumeData.text || '');
            formData.append('jobDescription', jobData.text || '');

            const data = await scanResume(formData);

            if (data.success) {
                setResult(data);
                showToast({ icon: '🎉', title: 'Scan Complete', message: `Score: ${data.score}/100` });
            } else {
                showToast({ icon: '❌', title: 'Scan Failed', message: data.error });
            }

        } catch (e) {
            showToast({ title: 'Error', message: 'Failed to scan' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="relative text-center mb-8">
                    <div className="absolute top-0 left-0">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced ATS Scanner</h1>
                        <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                            <span className="text-xs">🧠</span>
                            <span>AI Powered</span>
                        </div>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Revolutionary career intelligence with industry insights, hire probability prediction, and salary negotiation analysis
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Resume Section */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resume</h2>
                            <button
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                            >
                                <FileText className="w-4 h-4 mr-1" />
                                Saved Resumes
                            </button>
                        </div>

                        <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-xs text-gray-600 dark:text-gray-400 border border-yellow-200 dark:border-yellow-900/30 rounded">
                            Debug: Resume text length: {resumeData.text.length} | Source: {resumeData.source}
                            {resumeData.filename && ` | File: ${resumeData.filename}`}
                        </div>

                        <div className="mb-4">
                            <textarea
                                className="w-full h-40 p-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-md resize-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Paste resume text here..."
                                value={resumeData.text}
                                onChange={(e) => setResumeData({ ...resumeData, text: e.target.value, source: 'text' })}
                            />
                        </div>

                        {/* File Upload Visual */}
                        <div className="mb-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <label className="cursor-pointer">
                                        <span className="text-blue-600 hover:text-blue-700">Upload a file</span>
                                        <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resume')} />
                                    </label>
                                    <span className="text-gray-500"> or drag and drop</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">PDF, DOCX, TXT files only (max 10MB)</p>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-1">
                                    <input
                                        type="url"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-l-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-950"
                                        placeholder="Enter Google Drive or cloud storage URL"
                                        value={urlInputs.resume}
                                        onChange={(e) => setUrlInputs({ ...urlInputs, resume: e.target.value })}
                                    />
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                                        <Link className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Description Section */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>

                        <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-xs text-gray-600 dark:text-gray-400 border border-yellow-200 dark:border-yellow-900/30 rounded">
                            Debug: Job text length: {jobData.text.length} | Source: {jobData.source}
                        </div>

                        <div className="mb-4">
                            <textarea
                                className="w-full h-40 p-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-md resize-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Copy and paste job description here..."
                                value={jobData.text}
                                onChange={(e) => setJobData({ ...jobData, text: e.target.value, source: 'text' })}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Tip: Include requirements, skills, and qualifications for better analysis
                            </p>
                        </div>

                        {/* File Upload Visual */}
                        <div className="mb-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Upload a file</span>
                                    <span className="text-gray-500"> or drag and drop</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">PDF, DOCX, TXT files only (max 10MB)</p>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-1">
                                    <input
                                        type="url"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-l-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-950"
                                        placeholder="Enter job posting URL"
                                        value={urlInputs.job}
                                        onChange={(e) => setUrlInputs({ ...urlInputs, job: e.target.value })}
                                    />
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                                        <Link className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-8">
                    <button
                        className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
                        onClick={() => alert("Power Edit Coming Soon!")}
                    >
                        <Zap className="w-5 h-5" />
                        <span>Power Edit</span>
                    </button>

                    <button
                        className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        onClick={handleScan}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>Advanced AI Scan</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Results Preview (Simple) */}
                {result && (
                    <div className="mt-8 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg border border-green-200 dark:border-green-900">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" />
                            Analysis Results (Score: {result.score}/100)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2 text-green-600">Matched Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.keywords.matched.map((k: string) => (
                                        <span key={k} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-red-600">Missing Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.keywords.missing.map((k: string) => (
                                        <span key={k} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                            <p className="font-medium">Psychology Insight: {result.analysis.psychology.impression}</p>
                            <p className="text-gray-600 dark:text-gray-400">{result.analysis.psychology.summary}</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
