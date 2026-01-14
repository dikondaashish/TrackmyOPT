"use client";

import { Building2, ClipboardList, FileText, ScanSearch, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CareerCard {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    highlights: string[];
    ctaText: string;
    href: string;
    iconBg: string;
    iconColor: string;
    buttonColor: string;
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
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
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
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        buttonColor: "bg-emerald-600 hover:bg-emerald-700",
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
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        buttonColor: "bg-purple-600 hover:bg-purple-700",
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
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
        buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
];

export function CareerHubCards() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAREER_CARDS.map((card) => (
                <Card key={card.id} className="p-6 hover:shadow-lg transition-shadow">
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${card.iconBg}`}>
                            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                                {card.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {card.description}
                            </p>
                        </div>
                    </div>

                    {/* Highlights */}
                    <ul className="space-y-2 mb-6 ml-1">
                        {card.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className={`w-1.5 h-1.5 rounded-full ${card.iconBg.replace('100', '500').replace('/30', '')}`} />
                                {highlight}
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                        onClick={() => router.push(card.href)}
                        className={`w-full ${card.buttonColor} text-white`}
                    >
                        {card.ctaText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Card>
            ))}
        </div>
    );
}
