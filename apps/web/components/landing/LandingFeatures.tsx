"use client";

import {
    Clock,
    BarChart3,
    Bell,
    FolderLock,
    Briefcase,
    Building2,
} from "lucide-react";

const features = [
    {
        icon: Clock,
        title: "OPT Timeline Tracker",
        description:
            "Real-time countdown to every critical deadline. From filing windows to EAD expiration, never lose track.",
        color: "blue",
    },
    {
        icon: BarChart3,
        title: "Unemployment Clock",
        description:
            "Track your 90-day (OPT) or 150-day (STEM) unemployment limit with visual progress and alerts.",
        color: "green",
    },
    {
        icon: Bell,
        title: "USCIS Case Tracker",
        description:
            "Monitor your case status in real-time. Get email notifications when your case status changes.",
        color: "purple",
    },
    {
        icon: FolderLock,
        title: "Document Vault",
        description:
            "Securely store I-20s, EAD cards, and passports with bank-grade encryption and expiry reminders.",
        color: "amber",
    },
    {
        icon: Briefcase,
        title: "Job Application Tracker",
        description:
            "Kanban-style board to manage your job search. Track applications from wishlist to offer.",
        color: "emerald",
    },
    {
        icon: Building2,
        title: "H-1B Sponsor Database",
        description:
            "Search 80,000+ verified H-1B sponsors. Filter by industry, location, and approval rate.",
        color: "rose",
    },
];

const colorClasses = {
    blue: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        icon: "text-blue-600 dark:text-blue-400",
        border: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
    },
    green: {
        bg: "bg-green-100 dark:bg-green-900/30",
        icon: "text-green-600 dark:text-green-400",
        border: "group-hover:border-green-200 dark:group-hover:border-green-800",
    },
    purple: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        icon: "text-purple-600 dark:text-purple-400",
        border: "group-hover:border-purple-200 dark:group-hover:border-purple-800",
    },
    amber: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        icon: "text-amber-600 dark:text-amber-400",
        border: "group-hover:border-amber-200 dark:group-hover:border-amber-800",
    },
    emerald: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        icon: "text-emerald-600 dark:text-emerald-400",
        border: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
    },
    rose: {
        bg: "bg-rose-100 dark:bg-rose-900/30",
        icon: "text-rose-600 dark:text-rose-400",
        border: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
    },
};

export function LandingFeatures() {
    return (
        <section id="features" className="py-24 bg-white dark:bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full mb-4">
                        Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Everything You Need to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Stay Compliant
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Powerful tools designed specifically for international students on OPT and STEM OPT.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => {
                        const colors = colorClasses[feature.color as keyof typeof colorClasses];
                        return (
                            <div
                                key={index}
                                className={`group bg-white dark:bg-zinc-800/50 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-zinc-700 hover:shadow-xl transition-all duration-300 ${colors.border}`}
                            >
                                <div
                                    className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-6`}
                                >
                                    <feature.icon className={`w-7 h-7 ${colors.icon}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <a
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        Explore all features
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
