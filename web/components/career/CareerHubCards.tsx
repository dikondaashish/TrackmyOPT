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
    iconBg: string;
    iconColor: string;
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
        gradient: "from-blue-500 to-indigo-600",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        iconColor: "text-blue-600 dark:text-blue-400",
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
        gradient: "from-emerald-500 to-teal-600",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
        iconColor: "text-emerald-600 dark:text-emerald-400",
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
        gradient: "from-purple-500 to-pink-600",
        iconBg: "bg-purple-100 dark:bg-purple-900/40",
        iconColor: "text-purple-600 dark:text-purple-400",
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
        gradient: "from-amber-500 to-orange-600",
        iconBg: "bg-amber-100 dark:bg-amber-900/40",
        iconColor: "text-amber-600 dark:text-amber-400",
    },
];

export function CareerHubCards() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAREER_CARDS.map((card) => (
                <div
                    key={card.id}
                    className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-border transition-all duration-300"
                >
                    {/* Gradient top accent */}
                    <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />

                    <div className="p-6">
                        {/* Icon & Title */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        </div>

                        {/* Highlights */}
                        <ul className="space-y-2 mb-6">
                            {card.highlights.map((highlight, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.gradient}`} />
                                    {highlight}
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={() => router.push(card.href)}
                            className={`w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${card.gradient} hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group/btn`}
                        >
                            {card.ctaText}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${card.gradient} transition-opacity duration-300 pointer-events-none`} />
                </div>
            ))}
        </div>
    );
}
