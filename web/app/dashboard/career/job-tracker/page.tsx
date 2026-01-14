"use client";

import { ClipboardList, ArrowLeft, Kanban, Bell, FileText } from "lucide-react";
import Link from "next/link";

export default function JobTrackerPage() {
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
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                        <ClipboardList className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Job Application Tracker</h1>
                        <p className="text-muted-foreground">
                            Track applications, interviews, follow-ups, and offers in one place
                        </p>
                    </div>
                </div>

                {/* Placeholder Content */}
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Kanban className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <Bell className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Organize your job search with a Kanban board, set follow-up reminders,
                        and keep detailed notes on each application.
                    </p>
                </div>
            </div>
        </div>
    );
}
