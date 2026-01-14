"use client";

import { Building2, Kanban, FileEdit, ScanSearch, ArrowRight } from "lucide-react";
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
    iconBg: string;
}

const CAREER_CARDS: CareerCard[] = [
    {
        id: "h1b-sponsors",
        title: "H-1B Sponsor Database",
        description: "Explore companies that sponsor H-1B and hire international students.",
        highlights: [
            "Search by company",
            "Filter by location & industry",
            "Save sponsor list"
        ],
        ctaText: "Browse Sponsors",
        route: "/dashboard/career/h1b-sponsors",
        icon: Building2,
        gradient: "from-blue-500 to-cyan-500",
        iconBg: "bg-blue-100 dark:bg-blue-900/40"
    },
    {
        id: "job-tracker",
        title: "Track Job Applications",
        description: "Track applications, interviews, follow-ups, and offers in one place.",
        highlights: [
            "Kanban pipeline",
            "Follow-up reminders",
            "Notes & status history"
        ],
        ctaText: "Open Tracker",
        route: "/dashboard/career/job-tracker",
        icon: Kanban,
        gradient: "from-green-500 to-emerald-500",
        iconBg: "bg-green-100 dark:bg-green-900/40"
    },
    {
        id: "resume-generator",
        title: "Resume Generator",
        description: "Paste a job description and generate a tailored resume version.",
        highlights: [
            "Bullet points optimized",
            "Keyword matching",
            "Export ready output"
        ],
        ctaText: "Generate Resume",
        route: "/dashboard/career/resume-generator",
        icon: FileEdit,
        gradient: "from-purple-500 to-indigo-500",
        iconBg: "bg-purple-100 dark:bg-purple-900/40"
    },
    {
        id: "ats-scanner",
        title: "ATS Scanner",
        description: "Upload resume + job description and get ATS match score and gaps.",
        highlights: [
            "Match score %",
            "Missing keywords",
            "Improvement suggestions"
        ],
        ctaText: "Scan Resume",
        route: "/dashboard/career/ats-scanner",
        icon: ScanSearch,
        gradient: "from-orange-500 to-pink-500",
        iconBg: "bg-orange-100 dark:bg-orange-900/40"
    }
];

export function CareerHubCards() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAREER_CARDS.map((card) => (
                <div
                    key={card.id}
                    className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                    {/* Gradient accent top bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />

                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                                <card.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {card.description}
                                </p>
                            </div>
                        </div>

                        {/* Highlights */}
                        <ul className="space-y-2 mb-6">
                            {card.highlights.map((highlight, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.gradient}`} />
                                    {highlight}
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={() => router.push(card.route)}
                            className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${card.gradient} text-white font-medium 
                                       flex items-center justify-center gap-2 
                                       hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
                        >
                            {card.ctaText}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
