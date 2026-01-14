"use client";

import { Building2, FileText, LayoutList, ScanSearch, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

interface CareerCardProps {
    title: string;
    description: string;
    icon: any;
    highlights: string[];
    ctaText: string;
    href: string;
    badge?: string;
}

function CareerCard({ title, description, icon: Icon, highlights, ctaText, href, badge }: CareerCardProps) {
    return (
        <div className="group relative flex flex-col bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
            {badge && (
                <span className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}

            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
            </h3>

            <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">
                {description}
            </p>

            <div className="flex-1 mb-6">
                <ul className="space-y-2">
                    {highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{highlight}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Link
                href={href}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors group-hover:shadow-lg group-hover:shadow-blue-500/20"
            >
                {ctaText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}

export function CareerHubCards() {
    const cards = [
        {
            title: "H-1B Sponsor Database",
            description: "Explore companies that sponsor H-1B and hire international students.",
            icon: Building2,
            highlights: [
                "Search by company name",
                "Filter by location & industry",
                "Save favorite sponsors"
            ],
            ctaText: "Browse Sponsors",
            href: "/dashboard/career/h1b-sponsors",
            badge: "Popular"
        },
        {
            title: "Track Job Applications",
            description: "Track applications, interviews, follow-ups, and offers in one place.",
            icon: LayoutList,
            highlights: [
                "Kanban pipeline view",
                "Follow-up reminders",
                "Notes & status history"
            ],
            ctaText: "Open Tracker",
            href: "/dashboard/career/job-tracker"
        },
        {
            title: "Resume Generator",
            description: "Paste a job description and generate a tailored resume version.",
            icon: FileText,
            highlights: [
                "Optimized bullet points",
                "Keyword matching",
                "Export ready output"
            ],
            ctaText: "Generate Resume",
            href: "/dashboard/career/resume-generator"
        },
        {
            title: "ATS Scanner",
            description: "Upload resume + job description and get ATS match score and gaps.",
            icon: ScanSearch,
            highlights: [
                "Match score percentage",
                "Identify missing keywords",
                "Improvement suggestions"
            ],
            ctaText: "Scan Resume",
            href: "/dashboard/career/ats-scanner"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, index) => (
                <CareerCard key={index} {...card} />
            ))}
        </div>
    );
}
