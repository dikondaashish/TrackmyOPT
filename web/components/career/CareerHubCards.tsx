"use client";

import { Building2, ClipboardList, FileText, ScanSearch, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CareerCard {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    highlights: string[];
    ctaText: string;
    href: string;
    badge: string;
    badgeColor: string;
    category: string;
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
        badge: "Database",
        badgeColor: "from-blue-500 to-indigo-600",
        category: "Company Search",
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
        badge: "CRM",
        badgeColor: "from-emerald-500 to-teal-600",
        category: "Organization",
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
        badge: "AI",
        badgeColor: "from-purple-500 to-pink-600",
        category: "AI Tools",
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
        badge: "Score",
        badgeColor: "from-amber-500 to-orange-600",
        category: "Analysis",
    },
];

export function CareerHubCards() {
    const router = useRouter();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAREER_CARDS.map((card) => (
                <button
                    key={card.id}
                    onClick={() => router.push(card.href)}
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] text-left"
                >
                    {/* Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold uppercase text-white rounded-full bg-gradient-to-r ${card.badgeColor}`}>
                        {card.badge}
                    </div>

                    {/* Content */}
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.badgeColor} flex items-center justify-center flex-shrink-0`}>
                            <card.icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {card.category}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {card.title}
                            </h3>

                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {card.description}
                            </p>
                        </div>
                    </div>

                    {/* Highlights */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                        <ul className="space-y-1.5">
                            {card.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.badgeColor}`} />
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex items-center justify-end">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all">
                            {card.ctaText}
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>

                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />
                </button>
            ))}
        </div>
    );
}
