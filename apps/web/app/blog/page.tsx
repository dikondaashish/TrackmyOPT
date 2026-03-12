import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, TrendingUp, BookOpen } from "lucide-react";

export const metadata: Metadata = {
    title: "OPT & F-1 Visa Blog — Guides for International Students",
    description: "Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, USCIS case tracking, and unemployment day rules. Written by former F-1 students.",
    keywords: ["OPT blog", "F-1 visa guide", "STEM OPT blog", "H-1B guide", "international student blog", "OPT tips"],
};

const blogPosts = [
    {
        slug: "90-day-unemployment-rule-opt",
        title: "The 90-Day OPT Unemployment Rule: Everything You Need to Know in 2026",
        description: "Understand the 90-day unemployment limit for OPT, how days are counted, what counts as employment, and how to avoid violating your F-1 status.",
        category: "OPT Basics",
        readTime: "8 min read",
        date: "March 10, 2026",
        tags: ["OPT", "Unemployment", "F-1 Visa"],
        featured: true,
    },
    {
        slug: "opt-processing-time-2026",
        title: "OPT Processing Time 2026: Current Wait Times & Tips to Avoid Delays",
        description: "Latest EAD processing times for OPT applications in 2026. Learn how long USCIS takes, tips to speed up approval, and what to do while waiting.",
        category: "USCIS",
        readTime: "7 min read",
        date: "March 10, 2026",
        tags: ["OPT", "Processing Time", "USCIS"],
        featured: true,
    },
    {
        slug: "stem-opt-unemployment-limit",
        title: "STEM OPT Unemployment Limit: The 150-Day Rule Explained",
        description: "How the 150-day unemployment limit works for STEM OPT, counting rules, what qualifies as employment, and strategies to stay compliant.",
        category: "STEM OPT",
        readTime: "6 min read",
        date: "March 10, 2026",
        tags: ["STEM OPT", "Unemployment", "Compliance"],
    },
    {
        slug: "opt-application-checklist-2026",
        title: "OPT Application Checklist 2026: Complete I-765 Filing Guide",
        description: "Step-by-step checklist for filing your OPT application. Every document, form, and deadline you need to know to avoid RFEs and delays.",
        category: "OPT Basics",
        readTime: "10 min read",
        date: "March 10, 2026",
        tags: ["OPT", "I-765", "Application"],
    },
    {
        slug: "opt-to-h1b-transition",
        title: "OPT to H-1B Transition: Step-by-Step Timeline & Guide (2026)",
        description: "Complete guide to transitioning from OPT to H-1B. Timeline, cap-gap extension, employer requirements, and backup plans if you're not selected.",
        category: "H-1B",
        readTime: "9 min read",
        date: "March 10, 2026",
        tags: ["H-1B", "OPT", "Cap-Gap"],
        featured: true,
    },
    {
        slug: "i-983-training-plan-guide",
        title: "I-983 Training Plan for STEM OPT: Complete Guide (2026)",
        description: "Section-by-section guide to Form I-983. Employer requirements, E-Verify enrollment, common mistakes, and how to get it right the first time.",
        category: "STEM OPT",
        readTime: "8 min read",
        date: "March 10, 2026",
        tags: ["STEM OPT", "I-983", "E-Verify"],
    },
    {
        slug: "what-happens-if-opt-expires",
        title: "What Happens If Your OPT Expires? Next Steps & Options",
        description: "Your OPT is expiring — what now? The 60-day grace period, STEM OPT extension, H-1B cap-gap, and what happens to your F-1 status.",
        category: "OPT Basics",
        readTime: "7 min read",
        date: "March 10, 2026",
        tags: ["OPT", "Expiration", "Grace Period"],
    },
    {
        slug: "h1b-approval-rates-by-company",
        title: "H-1B Approval Rates by Company 2026: Data Analysis & Top Sponsors",
        description: "Which companies have the highest H-1B approval rates? Data-driven analysis of 25,000+ employers with approval rates, denial trends, and red flags.",
        category: "H-1B",
        readTime: "8 min read",
        date: "March 10, 2026",
        tags: ["H-1B", "Approval Rates", "Data"],
        featured: true,
    },
    {
        slug: "stem-opt-extension-guide",
        title: "Complete STEM OPT Guide 2026: Extension, Eligibility & Application",
        description: "The definitive guide to the 24-month STEM OPT extension. Eligibility, CIP codes, I-983, employer requirements, and unemployment rules.",
        category: "STEM OPT",
        readTime: "15 min read",
        date: "March 10, 2026",
        tags: ["STEM OPT", "Extension", "Guide"],
        featured: true,
    },
    {
        slug: "opt-extension-guide",
        title: "OPT Extension Guide 2026: How to Extend Your Work Authorization",
        description: "All ways to extend OPT: STEM OPT extension, H-1B cap-gap, and 180-day auto extension. Side-by-side comparison with eligibility details.",
        category: "OPT Basics",
        readTime: "10 min read",
        date: "March 10, 2026",
        tags: ["OPT", "Extension", "STEM OPT"],
    },
    {
        slug: "f1-visa-jobs-guide",
        title: "F-1 Visa Jobs 2026: How to Find Jobs as an International Student",
        description: "Complete job search strategy for F-1 students. Work authorization types, H-1B sponsor companies, industries hiring, and job board recommendations.",
        category: "Careers",
        readTime: "12 min read",
        date: "March 10, 2026",
        tags: ["F-1 Visa", "Jobs", "H-1B Sponsors"],
    },
    {
        slug: "opt-ead-card-guide",
        title: "OPT EAD Card 2026: How to Apply, Track & What to Do If Delayed",
        description: "Everything about your OPT EAD card. Step-by-step I-765 application, tracking methods, processing times, and what to do if delayed.",
        category: "OPT Basics",
        readTime: "9 min read",
        date: "March 10, 2026",
        tags: ["OPT", "EAD Card", "I-765"],
    },
    {
        slug: "h1b-cap-gap-extension",
        title: "H-1B Cap-Gap Extension Explained: Timeline, Work Auth & Rules",
        description: "How the cap-gap bridges OPT expiration and H-1B start date. Work authorization rules, timeline, and what happens if H-1B is denied.",
        category: "H-1B",
        readTime: "10 min read",
        date: "March 10, 2026",
        tags: ["H-1B", "Cap-Gap", "OPT"],
    },
    {
        slug: "day-1-cpt-vs-opt",
        title: "Day 1 CPT vs OPT: Key Differences Every F-1 Student Should Know",
        description: "Comprehensive comparison of Day 1 CPT and OPT. Eligibility, risks, immigration impact, and when OPT is the better choice.",
        category: "Important",
        readTime: "11 min read",
        date: "March 10, 2026",
        tags: ["CPT", "OPT", "Comparison"],
    },
    {
        slug: "f1-student-tax-filing-guide",
        title: "F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step",
        description: "Complete guide to tax filing for F-1 students. Form 8843, 1040-NR, FICA exemption, tax treaties, and step-by-step filing instructions.",
        category: "Tax & Finance",
        readTime: "12 min read",
        date: "March 12, 2026",
        tags: ["Taxes", "Form 8843", "1040-NR"],
        featured: true,
    },
    {
        slug: "opt-health-insurance-guide",
        title: "OPT Health Insurance Guide 2026: Best Plans & How to Choose",
        description: "Find affordable health insurance on OPT. Compare ACA marketplace, employer, short-term, and catastrophic plans for F-1 students.",
        category: "Health",
        readTime: "10 min read",
        date: "March 12, 2026",
        tags: ["Health Insurance", "OPT", "ACA"],
        featured: true,
    },
    {
        slug: "uscis-case-status-tracking-guide",
        title: "How to Track Your USCIS Case Status Online: Complete Guide (2026)",
        description: "Track your USCIS case status in real-time. Understand receipt numbers, status messages, and what to do if your case is delayed.",
        category: "USCIS",
        readTime: "9 min read",
        date: "March 12, 2026",
        tags: ["USCIS", "Case Status", "I-765"],
        featured: true,
    },
    {
        slug: "can-you-travel-on-opt",
        title: "Can You Travel on OPT? Complete F-1 Travel Guide (2026)",
        description: "Everything about traveling while on OPT. Required documents, re-entry rules, pending OPT risks, and STEM OPT travel considerations.",
        category: "OPT Basics",
        readTime: "10 min read",
        date: "March 12, 2026",
        tags: ["OPT", "Travel", "Re-entry"],
    },
    {
        slug: "ats-resume-international-students",
        title: "ATS Resume for International Students: Beat the Bots & Get Interviews (2026)",
        description: "Build an ATS-optimized resume for H-1B jobs. Formatting rules, keyword strategy, XYZ bullet formula, and visa status guidance.",
        category: "Careers",
        readTime: "11 min read",
        date: "March 12, 2026",
        tags: ["Resume", "ATS", "Job Search"],
        featured: true,
    },
    {
        slug: "top-h1b-sponsor-companies-2026",
        title: "Top H-1B Sponsor Companies 2026: Data-Driven Rankings & Analysis",
        description: "Which companies sponsor the most H-1B visas? Data-driven rankings by petitions, approval rates, and industry with red flags to watch.",
        category: "H-1B",
        readTime: "10 min read",
        date: "March 12, 2026",
        tags: ["H-1B", "Sponsors", "Rankings"],
    },
    {
        slug: "stem-opt-employer-requirements",
        title: "STEM OPT Employer Requirements 2026: E-Verify, I-983 & Compliance Checklist",
        description: "Everything employers must do for STEM OPT: E-Verify enrollment, I-983 training plan, reporting requirements, and wage compliance.",
        category: "STEM OPT",
        readTime: "9 min read",
        date: "March 12, 2026",
        tags: ["STEM OPT", "E-Verify", "Employer"],
    },
    {
        slug: "opt-application-denied",
        title: "OPT Application Denied? What to Do Next (2026 Guide)",
        description: "Your OPT was denied — now what? Common denial reasons, your options (refile, transfer, leave), 60-day grace period rules, and prevention tips.",
        category: "OPT Basics",
        readTime: "8 min read",
        date: "March 12, 2026",
        tags: ["OPT", "Denial", "I-765"],
    },
];

function CategoryBadge({ category }: { category: string }) {
    const colors: Record<string, string> = {
        "OPT Basics": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        "USCIS": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        "STEM OPT": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        "H-1B": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        "Careers": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        "Important": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
        "Tax & Finance": "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
        "Health": "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[category] || "bg-gray-100 text-gray-700"}`}>
            {category}
        </span>
    );
}

export default function BlogIndexPage() {
    const featured = blogPosts.filter(p => p.featured);
    const rest = blogPosts.filter(p => !p.featured);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                    <BookOpen className="w-4 h-4" />
                    OPT Knowledge Hub
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    OPT & F-1 Visa Guides
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Expert guides on OPT timelines, STEM OPT extensions, H-1B sponsors, and USCIS tracking.
                    Written by former F-1 students who've been through it all.
                </p>
            </div>

            {/* Featured Posts */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
                {featured.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                        <article className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border border-blue-100 dark:border-zinc-700 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-4">
                                <CategoryBadge category={post.category} />
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                                    <TrendingUp className="w-3 h-3" />
                                    Featured
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {post.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                {post.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{post.date}</span>
                                <span className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                                    Read Guide <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* All Posts */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">All Guides</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {rest.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                        <article className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <CategoryBadge category={post.category} />
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {post.description}
                            </p>
                            <span className="text-sm text-gray-400">{post.date}</span>
                        </article>
                    </Link>
                ))}
            </div>
        </div>
    );
}
