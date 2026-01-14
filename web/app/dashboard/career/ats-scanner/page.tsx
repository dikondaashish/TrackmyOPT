"use client";

import { ScanSearch, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ATSScannerPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Link */}
                <Link
                    href="/dashboard/career"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Career Hub
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                        <ScanSearch className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">ATS Scanner</h1>
                        <p className="text-muted-foreground mt-1">
                            Upload resume + job description and get ATS match score and gaps
                        </p>
                    </div>
                </div>

                {/* Placeholder Content */}
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                    <ScanSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Get instant feedback on how well your resume matches the job description. See your match score and missing keywords.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium">
                        🚀 Under Development
                    </div>
                </div>
            </div>
        </div>
    );
}
