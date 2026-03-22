"use client";

import { ScanSearch, ArrowLeft, Percent, AlertTriangle, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function ATSScannerPage() {
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
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                        <ScanSearch className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">ATS Scanner</h1>
                        <p className="text-muted-foreground">
                            Upload resume + job description and get ATS match score and gaps
                        </p>
                    </div>
                </div>

                {/* Placeholder Content */}
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Percent className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Lightbulb className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">We're perfecting our algorithm</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        The ATS Scanner is currently in deep beta. Soon, you'll be able to get exact compatibility scores and identify missing keywords before hitting submit.
                    </p>
                </div>
            </div>
        </div>
    );
}
