"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AtsScannerPage() {
    return (
        <div className="flex-1 w-full bg-background min-h-screen flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Link
                    href="/dashboard/career"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Career Hub
                </Link>

                <div className="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed border-border rounded-xl bg-card p-8">
                    <h1 className="text-2xl font-bold mb-2">ATS Scanner</h1>
                    <p className="text-muted-foreground max-w-md">
                        Check your resume's compatibility with Applicant Tracking Systems and get improvement tips.
                    </p>
                    <div className="mt-8 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                        Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
}
