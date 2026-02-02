"use client";

import { motion } from "framer-motion";
import { GraduationCap, Building2, Megaphone, Check } from "lucide-react";
import Link from "next/link";

const programs = [
    {
        icon: Building2,
        title: "DSO Partnership",
        subtitle: "For International Student Offices",
        description: "Provide TrackMyOPT access to all your F-1 students with institutional licensing and custom branding.",
        features: [
            "Bulk student onboarding",
            "DSO admin dashboard",
            "Custom university branding",
            "Analytics & reporting",
            "Priority support channel",
            "Training & onboarding",
        ],
        cta: "Request Demo",
        href: "#contact",
        highlight: true,
    },
    {
        icon: GraduationCap,
        title: "Campus Ambassador",
        subtitle: "For Student Leaders",
        description: "Join our ambassador program to help fellow international students while earning rewards and building your resume.",
        features: [
            "Free Premium access",
            "Commission on referrals",
            "Leadership experience",
            "Networking opportunities",
            "Resume & LinkedIn boost",
            "Exclusive events",
        ],
        cta: "Apply Now",
        href: "#contact",
        highlight: false,
    },
    {
        icon: Megaphone,
        title: "Career Services Integration",
        subtitle: "For Career Centers",
        description: "Integrate our H-1B sponsor database and resume tools into your career services offerings.",
        features: [
            "API integration options",
            "White-label solutions",
            "Workshop materials",
            "Co-branded resources",
            "Joint webinars",
            "Placement tracking",
        ],
        cta: "Learn More",
        href: "#contact",
        highlight: false,
    },
];

export function ProgramTypes() {
    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Partnership Programs
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Choose the program that fits your needs
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {programs.map((program, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-6 rounded-2xl border ${program.highlight
                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-transparent text-white"
                                    : "bg-white dark:bg-zinc-900 border-border"
                                }`}
                        >
                            {program.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-blue-600 text-xs font-bold rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${program.highlight
                                    ? "bg-white/20"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-primary"
                                }`}>
                                <program.icon className="w-6 h-6" />
                            </div>

                            <h3 className={`text-xl font-bold mb-1 ${program.highlight ? "text-white" : "text-gray-900 dark:text-white"
                                }`}>
                                {program.title}
                            </h3>
                            <p className={`text-sm mb-3 ${program.highlight ? "text-blue-100" : "text-muted-foreground"
                                }`}>
                                {program.subtitle}
                            </p>
                            <p className={`text-sm mb-6 ${program.highlight ? "text-blue-100" : "text-muted-foreground"
                                }`}>
                                {program.description}
                            </p>

                            <ul className="space-y-2 mb-6">
                                {program.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className={`w-4 h-4 flex-shrink-0 ${program.highlight ? "text-green-300" : "text-green-600"
                                            }`} />
                                        <span className={program.highlight ? "text-white" : "text-gray-700 dark:text-gray-300"}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={program.href}
                                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${program.highlight
                                        ? "bg-white text-blue-600 hover:bg-blue-50"
                                        : "bg-primary text-white hover:bg-blue-600"
                                    }`}
                            >
                                {program.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
