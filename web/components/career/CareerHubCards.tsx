"use client";

import { Building2, ClipboardList, FileText, ScanSearch, ArrowRight, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export function CareerHubCards() {
    const router = useRouter();

    const tools = [
        {
            title: "H-1B Sponsor Database",
            description: "Explore companies that sponsor H-1B and hire international students",
            icon: Building2,
            href: "/dashboard/career/h1b-sponsors",
            gradient: "from-blue-500 via-blue-600 to-indigo-600",
            shadowColor: "shadow-blue-500/25",
            hoverShadow: "hover:shadow-blue-500/40",
        },
        {
            title: "Track Job Applications",
            description: "Track applications, interviews, follow-ups, and offers in one place",
            icon: ClipboardList,
            href: "/dashboard/career/job-tracker",
            gradient: "from-emerald-500 via-green-500 to-teal-600",
            shadowColor: "shadow-emerald-500/25",
            hoverShadow: "hover:shadow-emerald-500/40",
        },
        {
            title: "Resume Generator",
            description: "Paste a job description and generate a tailored resume version",
            icon: FileText,
            href: "/dashboard/career/resume-generator",
            gradient: "from-purple-500 via-violet-500 to-violet-600",
            shadowColor: "shadow-purple-500/25",
            hoverShadow: "hover:shadow-purple-500/40",
        },
        {
            title: "ATS Scanner",
            description: "Upload resume + job description and get ATS match score and gaps",
            icon: ScanSearch,
            href: "/dashboard/career/ats-scanner",
            gradient: "from-amber-500 via-orange-500 to-orange-600",
            shadowColor: "shadow-amber-500/25",
            hoverShadow: "hover:shadow-amber-500/40",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
                        <Rocket className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Everything you need to get hired on OPT/STEM OPT
                        </p>
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
                                className={`
                                    group relative overflow-hidden rounded-3xl p-8 text-left text-white
                                    bg-gradient-to-br ${tool.gradient}
                                    shadow-xl ${tool.shadowColor} ${tool.hoverShadow}
                                    hover:shadow-2xl transition-all duration-500
                                    hover:scale-[1.02] hover:-translate-y-1
                                    focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2
                                `}
                            >
                                {/* Animated background elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 group-hover:scale-150 transition-transform duration-700"></div>

                                {/* Shine sweep effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000"></div>

                                {/* Floating particles */}
                                <div className="absolute top-6 right-12 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity" style={{ animationDelay: '0s' }}></div>
                                <div className="absolute top-16 right-6 w-1.5 h-1.5 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity" style={{ animationDelay: '0.2s' }}></div>
                                <div className="absolute bottom-12 right-20 w-1 h-1 bg-white/25 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity" style={{ animationDelay: '0.4s' }}></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                        <Icon className="w-8 h-8" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold mb-3">
                                        {tool.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-white/80 mb-6 line-clamp-2">
                                        {tool.description}
                                    </p>

                                    {/* CTA */}
                                    <div className="flex items-center gap-2 font-semibold">
                                        <span>Open Tool</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
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
