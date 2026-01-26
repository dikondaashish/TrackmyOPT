"use client";

import {
    Clock,
    BarChart3,
    Bell,
    FolderLock,
    Briefcase,
    Building2,
    Calculator,
    FileText,
    Shield,
    Calendar,
    Heart,
    HelpCircle,
    Receipt,
    GraduationCap,
    Settings,
    ScanSearch,
} from "lucide-react";

const allFeatures = [
    // OPT Timeline Tools
    {
        category: "OPT Timeline Management",
        features: [
            {
                icon: Clock,
                title: "OPT Timeline Dashboard",
                description:
                    "Real-time countdown to EAD expiration, filing windows, and every critical deadline. visualize your complete OPT journey from program end to work authorization expiry.",
                color: "blue",
                premium: false,
            },
            {
                icon: BarChart3,
                title: "Unemployment Clock",
                description:
                    "Track your 90-day (OPT) or 150-day (STEM OPT) unemployment limit with visual progress bars. Get alerts before you approach the danger zone.",
                color: "green",
                premium: false,
            },
            {
                icon: Calendar,
                title: "Smart Date Calculator",
                description:
                    "Enter your program end date and get auto-calculated filing windows, earliest/latest start dates, and recommended action timelines.",
                color: "indigo",
                premium: false,
            },
        ],
    },
    // USCIS & Documents
    {
        category: "USCIS & Documents",
        features: [
            {
                icon: Bell,
                title: "USCIS Case Tracker",
                description:
                    "Monitor your I-765, I-140, or any USCIS case in real-time. Get email notifications when your status changes. Track multiple cases with Premium.",
                color: "purple",
                premium: false,
            },
            {
                icon: FolderLock,
                title: "Secure Document Vault",
                description:
                    "Store I-20s, EAD cards, passports, and tax forms with bank-grade AES-256 encryption. AI auto-extracts document types and expiry dates.",
                color: "amber",
                premium: true,
            },
            {
                icon: FileText,
                title: "Application Guides",
                description:
                    "Step-by-step checklists for Initial OPT and STEM Extension applications. Know exactly what documents you need and when to submit.",
                color: "teal",
                premium: false,
            },
        ],
    },
    // Career Tools
    {
        category: "Career & Job Search",
        features: [
            {
                icon: Building2,
                title: "H-1B Sponsor Database",
                description:
                    "Search 80,000+ verified H-1B sponsors. Filter by industry, location, approval rate. See which companies are actively hiring and sponsoring.",
                color: "rose",
                premium: false,
            },
            {
                icon: Briefcase,
                title: "Job Application Tracker",
                description:
                    "Kanban-style board to manage your job search. Drag applications through stages: Wishlist → Applied → Interview → Offer.",
                color: "emerald",
                premium: false,
            },
            {
                icon: GraduationCap,
                title: "Resume Manager",
                description:
                    "Upload, parse, and save multiple resumes. AI-powered OCR for scanned PDFs. Keep all versions organized for different applications.",
                color: "sky",
                premium: false,
            },
            {
                icon: ScanSearch,
                title: "ATS Resume Scanner",
                description:
                    "Get your ATS compatibility score against any job description. Identify missing keywords and get improvement suggestions.",
                color: "orange",
                premium: true,
                comingSoon: true,
            },
        ],
    },
    // Resources & Support
    {
        category: "Resources & Support",
        features: [
            {
                icon: Receipt,
                title: "Tax Filing Guide",
                description:
                    "Interactive quiz to determine your filing status. Get personalized recommendations for Form 1040-NR vs 1040. Exclusive tax software discounts.",
                color: "violet",
                premium: false,
            },
            {
                icon: Heart,
                title: "Health Insurance Finder",
                description:
                    "Find affordable health insurance for OPT students by state. Compare plans specifically designed for international students and visa holders.",
                color: "pink",
                premium: false,
            },
            {
                icon: Shield,
                title: "Email Alerts & Reminders",
                description:
                    "Get notified before deadlines, when documents expire, or when your case status changes. Never miss an important date again.",
                color: "cyan",
                premium: false,
            },
            {
                icon: HelpCircle,
                title: "Comprehensive Help Center",
                description:
                    "FAQs, video tutorials, glossary of immigration terms, and direct support. Everything you need to understand your OPT journey.",
                color: "slate",
                premium: false,
            },
        ],
    },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", icon: "text-blue-600 dark:text-blue-400" },
    green: { bg: "bg-green-100 dark:bg-green-900/30", icon: "text-green-600 dark:text-green-400" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400" },
    amber: { bg: "bg-amber-100 dark:bg-amber-900/30", icon: "text-amber-600 dark:text-amber-400" },
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald-600 dark:text-emerald-400" },
    rose: { bg: "bg-rose-100 dark:bg-rose-900/30", icon: "text-rose-600 dark:text-rose-400" },
    indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: "text-indigo-600 dark:text-indigo-400" },
    teal: { bg: "bg-teal-100 dark:bg-teal-900/30", icon: "text-teal-600 dark:text-teal-400" },
    sky: { bg: "bg-sky-100 dark:bg-sky-900/30", icon: "text-sky-600 dark:text-sky-400" },
    orange: { bg: "bg-orange-100 dark:bg-orange-900/30", icon: "text-orange-600 dark:text-orange-400" },
    violet: { bg: "bg-violet-100 dark:bg-violet-900/30", icon: "text-violet-600 dark:text-violet-400" },
    pink: { bg: "bg-pink-100 dark:bg-pink-900/30", icon: "text-pink-600 dark:text-pink-400" },
    cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", icon: "text-cyan-600 dark:text-cyan-400" },
    slate: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-600 dark:text-slate-400" },
};

export function LandingAllFeatures() {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full mb-4">
                        Complete Feature Set
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Every Tool You Need for Your{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            OPT Journey
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        From day one of your OPT to H-1B sponsorship, TrackMyOPT provides comprehensive tools
                        designed specifically for international students navigating the U.S. immigration system.
                    </p>
                </div>

                {/* Feature Categories */}
                <div className="space-y-16">
                    {allFeatures.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {category.category}
                                </h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-zinc-700" />
                            </div>

                            {/* Feature Cards Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {category.features.map((feature, featureIndex) => {
                                    const colors = colorClasses[feature.color] || colorClasses.blue;
                                    return (
                                        <div
                                            key={featureIndex}
                                            className="group bg-white dark:bg-zinc-800/70 rounded-xl p-5 border border-gray-200 dark:border-zinc-700/50 hover:shadow-lg hover:border-gray-300 dark:hover:border-zinc-600 transition-all duration-300"
                                        >
                                            {/* Header with Icon */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-11 h-11 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                                    <feature.icon className={`w-5 h-5 ${colors.icon}`} />
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {feature.premium && (
                                                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                                                            Premium
                                                        </span>
                                                    )}
                                                    {feature.comingSoon && (
                                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                                                            Soon
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                                                {feature.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16 pt-12 border-t border-gray-200 dark:border-zinc-700">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Ready to take control of your OPT journey?
                    </p>
                    <a
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-xl"
                    >
                        Get Started Free
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
