"use client";

import { Building2, ClipboardList, FileText, ScanSearch, ArrowRight, Rocket, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";

export function CareerHubCards() {
    const router = useRouter();

    const tools = [
        {
            title: "H-1B Sponsor Database",
            description: "Explore companies that sponsor H-1B and hire international students",
            icon: Building2,
            href: "/dashboard/career/h1b-sponsors",
            iconTile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
        },
        {
            title: "Track Job Applications",
            description: "Track applications, interviews, follow-ups, and offers in one place",
            icon: ClipboardList,
            href: "/dashboard/career/job-tracker",
            iconTile: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
        },
        {
            title: "Resume Generator",
            description: "Paste a job description and generate a tailored resume version",
            icon: FileText,
            href: "/dashboard/career/resume-generator",
            iconTile: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
        },
        {
            title: "ATS Scanner",
            description: "Upload resume + job description and get ATS match score and gaps",
            icon: ScanSearch,
            href: "/dashboard/career/ats-scanner",
            iconTile: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
        },
        {
            title: "Networking",
            description: "Find work emails and draft outreach for up to three contacts",
            icon: MessageSquareText,
            href: "/dashboard/career/networking",
            iconTile: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header with Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: Title */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-violet-600 dark:text-violet-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Career Hub</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Everything you need to get hired on OPT/STEM OPT
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card shadow-card">
                            <span className="text-xs text-muted-foreground">Applications:</span>
                            <span className="font-semibold text-blue-700 dark:text-blue-300">0</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card shadow-card">
                            <span className="text-xs text-muted-foreground">Interviews:</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">0</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card shadow-card">
                            <span className="text-xs text-muted-foreground">Follow-ups:</span>
                            <span className="font-semibold text-amber-700 dark:text-amber-300">0</span>
                        </div>
                    </div>
                </div>

                {/* Tool Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <button
                                key={tool.href}
                                onClick={() => router.push(tool.href)}
                                className="group surface-card-interactive p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <div>
                                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${tool.iconTile}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-foreground mb-1.5">
                                        {tool.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                                        {tool.description}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-primary dark:text-blue-300">
                                        <span>Open Tool</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
