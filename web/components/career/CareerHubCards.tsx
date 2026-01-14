"use client";

import { Building2, ClipboardList, FileText, ScanSearch, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CareerCard {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    highlights: string[];
    ctaText: string;
    href: string;
    gradient: string;
    shadowColor: string;
    hoverShadow: string;
}

const CAREER_CARDS: CareerCard[] = [
    {
        id: "h1b-sponsors",
        icon: Building2,
        title: "H-1B Sponsor Database",
        description: "Explore companies that sponsor H-1B and hire international students.",
        highlights: [
            "Search by company",
            "Filter by location & industry",
            "Save sponsor list",
        ],
        ctaText: "Browse Sponsors",
        href: "/dashboard/career/h1b-sponsors",
        gradient: "from-blue-500 via-blue-600 to-indigo-600",
        shadowColor: "shadow-blue-500/25",
        hoverShadow: "hover:shadow-blue-500/40",
    },
    {
        id: "job-tracker",
        icon: ClipboardList,
        title: "Track Job Applications",
        description: "Track applications, interviews, follow-ups, and offers in one place.",
        highlights: [
            "Kanban pipeline",
            "Follow-up reminders",
            "Notes & status history",
        ],
        ctaText: "Open Tracker",
        href: "/dashboard/career/job-tracker",
        gradient: "from-emerald-500 via-green-500 to-teal-600",
        shadowColor: "shadow-emerald-500/25",
        hoverShadow: "hover:shadow-emerald-500/40",
    },
    {
        id: "resume-generator",
        icon: FileText,
        title: "Resume Generator",
        description: "Paste a job description and generate a tailored resume version.",
        highlights: [
            "Bullet points optimized",
            "Keyword matching",
            "Export ready output",
        ],
        ctaText: "Generate Resume",
        href: "/dashboard/career/resume-generator",
        gradient: "from-purple-500 via-violet-500 to-violet-600",
        shadowColor: "shadow-purple-500/25",
        hoverShadow: "hover:shadow-purple-500/40",
    },
    {
        id: "ats-scanner",
        icon: ScanSearch,
        title: "ATS Scanner",
        description: "Upload resume + job description and get ATS match score and gaps.",
        highlights: [
            "Match score %",
            "Missing keywords",
            "Improvement suggestions",
        ],
        ctaText: "Scan Resume",
        href: "/dashboard/career/ats-scanner",
        gradient: "from-amber-500 via-orange-500 to-orange-600",
        shadowColor: "shadow-amber-500/25",
        hoverShadow: "hover:shadow-amber-500/40",
    },
];

export function CareerHubCards() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
            {CAREER_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                    <button
                        key={card.id}
                        onClick={() => router.push(card.href)}
                        className={`
                            group relative overflow-hidden rounded-3xl p-6 text-left text-white
                            bg-gradient-to-br ${card.gradient}
                            shadow-xl ${card.shadowColor} ${card.hoverShadow}
                            hover:shadow-2xl transition-all duration-500
                            hover:scale-[1.02] hover:-translate-y-1
                            focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2
                            flex flex-col
                        `}
                    >
                        {/* Animated background elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24 group-hover:scale-150 transition-transform duration-700" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 group-hover:scale-125 transition-transform duration-700" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col flex-1">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon className="w-6 h-6" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold mb-2">
                                {card.title}
                            </h3>

                            {/* Description */}
                            <p className="text-white/80 text-sm mb-4 line-clamp-2">
                                {card.description}
                            </p>

                            {/* Highlights */}
                            <ul className="space-y-1 mb-4 flex-1">
                                {card.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs text-white/70">
                                        <span className="w-1 h-1 rounded-full bg-white/60" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <div className="flex items-center gap-2 font-semibold text-sm mt-auto">
                                <span>{card.ctaText}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
