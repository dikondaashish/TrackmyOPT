"use client";

import { FileText, ArrowLeft, Wand2, Target, Download } from "lucide-react";
import Link from "next/link";

export default function ResumeGeneratorPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Back Link */}
                <Link
                    href="/dashboard/career"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Career Hub
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40">
                        <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Resume Generator</h1>
                        <p className="text-muted-foreground">
                            Paste a job description and generate a tailored resume version
                        </p>
                    </div>
                </div>

                {/* Placeholder Content */}
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Wand2 className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Target className="w-6 h-6 text-pink-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Download className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        AI-powered resume tailoring. Paste any job description and get
                        optimized bullet points with keyword matching.
                    </p>
                </div>
            </div>
        </div>
    );
}
