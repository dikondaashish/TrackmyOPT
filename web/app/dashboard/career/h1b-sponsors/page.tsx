"use client";

import { Building2, ArrowLeft, Search, Filter, Bookmark } from "lucide-react";
import Link from "next/link";

export default function H1BSponsorPage() {
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
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                        <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">H-1B Sponsor Database</h1>
                        <p className="text-muted-foreground">
                            Explore companies that sponsor H-1B and hire international students
                        </p>
                    </div>
                </div>

                {/* Placeholder Content */}
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Search className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Filter className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Bookmark className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Search and filter through thousands of H-1B sponsoring companies.
                        Save your favorites and track sponsor history.
                    </p>
                </div>
            </div>
        </div>
    );
}
