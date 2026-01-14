"use client";

import { Building2, Kanban, FileEdit, ScanSearch, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface CareerCard {
    id: string;
    title: string;
    description: string;
    highlights: string[];
    ctaText: string;
    route: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    iconGradient: string;
    glowColor: string;
    badge?: string;
}

const CAREER_CARDS: CareerCard[] = [
    {
        id: "h1b-sponsors",
        title: "H-1B Sponsor Database",
        description: "Explore companies that sponsor H-1B and hire international students.",
        highlights: [
            "Search by company name",
            "Filter by location & industry",
            "Save your sponsor list"
        ],
        ctaText: "Browse Sponsors",
        route: "/dashboard/career/h1b-sponsors",
        icon: Building2,
        gradient: "from-blue-500 to-cyan-500",
        iconGradient: "from-blue-500 to-cyan-400",
        glowColor: "group-hover:shadow-blue-500/25",
        badge: "100K+ Companies"
    },
    {
        id: "job-tracker",
        title: "Track Job Applications",
        description: "Track applications, interviews, follow-ups, and offers in one place.",
        highlights: [
            "Visual Kanban pipeline",
            "Smart follow-up reminders",
            "Notes & status history"
        ],
        ctaText: "Open Tracker",
        route: "/dashboard/career/job-tracker",
        icon: Kanban,
        gradient: "from-green-500 to-emerald-500",
        iconGradient: "from-green-500 to-emerald-400",
        glowColor: "group-hover:shadow-green-500/25",
        badge: "CRM Style"
    },
    {
        id: "resume-generator",
        title: "Resume Generator",
        description: "Paste a job description and generate a tailored resume version.",
        highlights: [
            "AI-optimized bullet points",
            "Keyword matching analysis",
            "Export-ready output"
        ],
        ctaText: "Generate Resume",
        route: "/dashboard/career/resume-generator",
        icon: FileEdit,
        gradient: "from-purple-500 to-indigo-500",
        iconGradient: "from-purple-500 to-indigo-400",
        glowColor: "group-hover:shadow-purple-500/25",
        badge: "AI Powered"
    },
    {
        id: "ats-scanner",
        title: "ATS Scanner",
        description: "Upload resume + job description and get ATS match score and gaps.",
        highlights: [
            "Match score percentage",
            "Missing keyword detection",
            "Actionable improvements"
        ],
        ctaText: "Scan Resume",
        route: "/dashboard/career/ats-scanner",
        icon: ScanSearch,
        gradient: "from-orange-500 to-pink-500",
        iconGradient: "from-orange-500 to-pink-400",
        glowColor: "group-hover:shadow-orange-500/25",
        badge: "Score Your Resume"
    }
];

export function CareerHubCards() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAREER_CARDS.map((card, index) => (
                <div
                    key={card.id}
                    className={`group relative overflow-hidden rounded-2xl bg-card border border-border 
                               hover:border-transparent hover:shadow-2xl ${card.glowColor}
                               transition-all duration-500 ease-out hover:-translate-y-1`}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    {/* Background glow effect */}
                    <div className={`absolute -inset-px bg-gradient-to-r ${card.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                    <div className="absolute inset-[1px] bg-card rounded-2xl" />

                    {/* Content */}
                    <div className="relative p-6">
                        {/* Badge */}
                        {card.badge && (
                            <div className="absolute top-4 right-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${card.gradient} text-white shadow-lg`}>
                                    <Zap className="w-3 h-3" />
                                    {card.badge}
                                </span>
                            </div>
                        )}

                        {/* Icon */}
                        <div className="mb-4">
                            <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} p-0.5 shadow-lg`}>
                                <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
                                    <card.icon className="w-7 h-7 text-gray-700 dark:text-gray-200" />
                                </div>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-muted-foreground group-hover:bg-clip-text transition-all">
                            {card.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                            {card.description}
                        </p>

                        {/* Highlights */}
                        <ul className="space-y-2.5 mb-6">
                            {card.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm">
                                    <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${card.gradient} flex items-center justify-center flex-shrink-0`}>
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        {highlight}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={() => router.push(card.route)}
                            className={`w-full py-3 px-5 rounded-xl bg-gradient-to-r ${card.gradient} text-white font-semibold 
                                       flex items-center justify-center gap-2 
                                       shadow-lg shadow-black/10 hover:shadow-xl
                                       hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
                        >
                            {card.ctaText}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
