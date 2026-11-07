"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Briefcase, GraduationCap, Microscope } from "lucide-react";

interface CaseStudy {
    id: string;
    name: string;
    role: string;
    company: string;
    university: string;
    category: "engineering" | "business" | "research";
    story: string;
    highlight: string;
    color: string;
}

const CASE_STUDIES: CaseStudy[] = [
    {
        id: "1",
        name: "Aditi Varma",
        role: "Software Engineer",
        company: "Google",
        university: "Georgia Tech",
        category: "engineering",
        story: "Used TrackMyOPT to stay compliant during my job search. The H-1B sponsor database helped me target the right companies.",
        highlight: "OPT to H-1B in 8mo",
        color: "blue",
    },
    {
        id: "2",
        name: "Wei Chen",
        role: "Product Manager",
        company: "Meta",
        university: "Stanford",
        category: "business",
        story: "The AI Resume Doctor helped me tailor my resume for each application. Landed 5 interviews in my first week!",
        highlight: "5 Offers in 1 Week",
        color: "purple",
    },
    {
        id: "3",
        name: "Elena Rodriguez",
        role: "Research Scientist",
        company: "Pfizer",
        university: "MIT",
        category: "research",
        story: "Navigating STEM OPT extension rules was a nightmare until I found this. The automated timeline kept me on track.",
        highlight: "Zero RFE Approval",
        color: "green",
    },
    {
        id: "4",
        name: "Ahmed Khan",
        role: "DevOps Engineer",
        company: "Netflix",
        university: "UT Austin",
        category: "engineering",
        story: "I tracked every unemployment day here. When I got my RFE, I just downloaded the report and sent it. Approved in 48 hours.",
        highlight: "RFE Solved Instantly",
        color: "blue",
    },
    {
        id: "5",
        name: "Sarah Kim",
        role: "Financial Analyst",
        company: "J.P. Morgan",
        university: "Columbia",
        category: "business",
        story: "The salary insights for F-1 hires gave me the data I needed to negotiate a $15k sign-on bonus.",
        highlight: "$15k Bonus Negotiated",
        color: "amber",
    }
];

const CATEGORIES = [
    { id: "all", label: "All Stories" },
    { id: "engineering", label: "Engineering", icon: Briefcase },
    { id: "business", label: "Business", icon: GraduationCap },
    { id: "research", label: "Research", icon: Microscope },
];

export function FilterableCaseStudies() {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredCases = activeCategory === "all"
        ? CASE_STUDIES
        : CASE_STUDIES.filter(c => c.category === activeCategory);

    return (
        <section className="py-24 border-y border-border bg-surface relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Success Across Every Field
                    </h2>

                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeCategory === cat.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                {cat.icon && <cat.icon className="w-4 h-4" />}
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div layout className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredCases.map((cs) => (
                            <motion.div
                                key={cs.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="surface-card p-6 transition-all group h-full flex flex-col"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-full ${cs.category === 'engineering' ? 'bg-blue-500' :
                                            cs.category === 'business' ? 'bg-violet-600' :
                                                'bg-green-500'
                                        } flex items-center justify-center text-white font-bold text-lg`}>
                                        {cs.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{cs.name}</h3>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cs.role}</p>
                                        <p className="text-xs text-gray-500">{cs.company} • {cs.university}</p>
                                    </div>
                                </div>

                                <div className="mb-6 flex-grow">
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium mb-4 ${cs.category === 'engineering' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                                            cs.category === 'business' ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300' :
                                                'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                                        }`}>
                                        {cs.highlight}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        &ldquo;{cs.story}&rdquo;
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-400">{cs.category}</span>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

            </div>
        </section>
    );
}
