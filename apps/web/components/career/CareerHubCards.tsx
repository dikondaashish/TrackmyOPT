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
            surface: "bg-blue-600 hover:bg-blue-700",
            iconTile: "bg-blue-500",
        },
        {
            title: "Track Job Applications",
            description: "Track applications, interviews, follow-ups, and offers in one place",
            icon: ClipboardList,
            href: "/dashboard/career/job-tracker",
            surface: "bg-emerald-600 hover:bg-emerald-700",
            iconTile: "bg-emerald-500",
        },
        {
            title: "Resume Generator",
            description: "Paste a job description and generate a tailored resume version",
            icon: FileText,
            href: "/dashboard/career/resume-generator",
            surface: "bg-purple-600 hover:bg-purple-700",
            iconTile: "bg-purple-500",
        },
        {
            title: "ATS Scanner",
            description: "Upload resume + job description and get ATS match score and gaps",
            icon: ScanSearch,
            href: "/dashboard/career/ats-scanner",
            surface: "bg-amber-600 hover:bg-amber-700",
            iconTile: "bg-amber-500",
        },
        {
            title: "Networking",
            description: "Find work emails and draft outreach for up to three contacts",
            icon: MessageSquareText,
            href: "/dashboard/career/networking",
            surface: "bg-sky-700 hover:bg-sky-800",
            iconTile: "bg-sky-600",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header with Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: Title */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Rocket className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Everything you need to get hired on OPT/STEM OPT
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Applications:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">0</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Interviews:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">0</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Follow-ups:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">0</span>
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
                                className={`group rounded-xl p-8 text-left text-white transition-colors ${tool.surface} focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-950`}
                            >
                                <div>
                                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-lg ${tool.iconTile}`}>
                                        <Icon className="h-7 w-7" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold mb-3">
                                        {tool.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-white mb-6 line-clamp-2">
                                        {tool.description}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center gap-2 font-semibold">
                                        <span>Open Tool</span>
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
