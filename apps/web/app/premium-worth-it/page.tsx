import Link from "next/link";
import {
    ArrowRight,
    Shield,
    Clock,
    Bell,
    FileCheck,
    Briefcase,
    CheckCircle2,
    AlertTriangle,
    Star,
} from "lucide-react";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Is TrackMyOPT premium worth it?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — for F-1 students on OPT or STEM OPT, TrackMyOPT Premium is worth it because it automates unemployment day tracking, sends deadline alerts before USCIS cutoffs, and consolidates job tracking, resume tools, and I-983 planning in one place. Missing an OPT deadline can result in status termination, making the cost of premium negligible compared to the risk.",
            },
        },
        {
            "@type": "Question",
            name: "What does TrackMyOPT premium include that the free plan doesn't?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Premium adds automated deadline reminders, unemployment day alerts, daily USCIS case auto-checks, employer tracking, unlimited AI resume generation, secure document vault, STEM OPT extension planning, and priority support — all designed to eliminate manual USCIS monitoring and reduce compliance risk.",
            },
        },
        {
            "@type": "Question",
            name: "Can I track OPT without TrackMyOPT premium?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "You can track basic dates manually with the free plan, but premium removes the risk of human error for unemployment day counts, which directly affect your F-1 status. A single miscalculation could push you over the 90-day limit and trigger status termination.",
            },
        },
        {
            "@type": "Question",
            name: "Is TrackMyOPT free enough for OPT students?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "The free plan is a solid starting point for basic OPT date tracking. However, OPT students managing unemployment limits, job transitions, or STEM OPT extensions benefit significantly from premium automation to stay compliant and avoid costly errors.",
            },
        },
        {
            "@type": "Question",
            name: "How much does TrackMyOPT Premium cost?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "TrackMyOPT Pro costs $4.99/month or $49.99/year (saving 40%). The Dedicated plan with 1-on-1 lawyer sessions is $14.99/month or $149.99/year. Both include a 7-day free trial with no credit card required.",
            },
        },
    ],
};

const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Is TrackMyOPT Premium Worth It?",
    speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".direct-answer", ".key-reasons"],
    },
    url: "https://www.trackmyopt.com/premium-worth-it",
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.trackmyopt.com",
        },
        {
            "@type": "ListItem",
            position: 2,
            name: "Pricing",
            item: "https://www.trackmyopt.com/pricing",
        },
        {
            "@type": "ListItem",
            position: 3,
            name: "Is Premium Worth It?",
        },
    ],
};

export default function PremiumWorthItPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(speakableSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <li>
                            <Link
                                href="/"
                                className="hover:text-blue-600 transition-colors"
                            >
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link
                                href="/pricing"
                                className="hover:text-blue-600 transition-colors"
                            >
                                Pricing
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-gray-900 dark:text-white font-medium">
                            Is Premium Worth It?
                        </li>
                    </ol>
                </nav>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Updated: February 2026</span>
                    <span className="mx-2">·</span>
                    <span>4 min read</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                    Is TrackMyOPT Premium Worth It?
                </h1>

                {/* Direct Answer — AI-citable */}
                <div className="direct-answer bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        Bottom Line
                    </p>
                    <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                        Yes — for F-1 students on OPT or STEM OPT, TrackMyOPT
                        Premium is worth it. It automates unemployment day
                        tracking, sends deadline alerts before USCIS cutoffs,
                        and consolidates job tracking, resume tools, and I-983
                        planning in one place. At $4.99/month, the cost is
                        negligible compared to the consequences of a single
                        missed deadline, which can result in F-1 status
                        termination.
                    </p>
                </div>

                {/* Key Reasons */}
                <section className="key-reasons mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        5 Reasons Premium Is Worth the Investment
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    1. Missing the 90-Day Limit Ends Your OPT
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    F-1 students on post-completion OPT are
                                    limited to 90 cumulative days of
                                    unemployment (150 for STEM OPT). Exceeding
                                    this limit results in automatic status
                                    termination — not a warning, not a second
                                    chance. Premium tracks your unemployment
                                    days in real time and sends alerts at 60,
                                    75, and 85 days so you always have time to
                                    act.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    2. Daily USCIS Monitoring Catches Changes
                                    Instantly
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Premium checks your USCIS case status every
                                    morning and emails you the moment anything
                                    changes. If you receive an RFE (Request for
                                    Evidence), you have limited time to respond.
                                    Finding out days late can mean the difference
                                    between approval and denial.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    3. STEM OPT Compliance Is Too Complex for
                                    Manual Tracking
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    STEM OPT students must track the 150-day
                                    unemployment limit across a 36-month
                                    period, maintain an I-983 training plan,
                                    verify E-Verify employer enrollment, and
                                    report changes within 10 days. Premium
                                    automates all of this and sends proactive
                                    reminders for each requirement.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    4. Unlimited Career Tools Accelerate Your
                                    Job Search
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Premium unlocks unlimited AI resume
                                    generation, ATS scanning, job application
                                    tracking, and full access to the H-1B
                                    sponsor database with approval rate data.
                                    The faster you find employment, the fewer
                                    unemployment days you accumulate.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    5. The Cost vs Risk Math Is Obvious
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Premium costs $4.99/month — less than a
                                    single coffee. A missed OPT deadline can
                                    cost you your legal status, your job, and
                                    your ability to remain in the United States.
                                    The Sprintax partner coupon is available to
                                    all users; premium pays for automation that
                                    protects your status every day.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Premium Includes */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        What TrackMyOPT Premium Includes
                    </h2>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6">
                        <ul className="space-y-3">
                            {[
                                "Automated unemployment day tracking with alerts at 60, 75, and 85 days",
                                "Daily USCIS case status auto-checks with instant email notifications",
                                "Daily 9AM email reminders for all upcoming deadlines",
                                "Secure encrypted document vault with expiry reminders",
                                "Unlimited AI resume generation and ATS scanning",
                                "Unlimited job application tracking",
                                "Full H-1B sponsor database with approval rate data",
                                "STEM OPT I-983 training plan tracking and E-Verify verification",
                                "Chrome extension priority alerts",
                                "Priority email support",
                            ].map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Who Premium Is For */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Who Should Get Premium?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        TrackMyOPT Premium is the responsible default for any
                        F-1 student who is actively on OPT or STEM OPT. If you
                        fall into any of these categories, premium pays for
                        itself:
                    </p>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            You are between jobs and your unemployment clock is ticking
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            You are on STEM OPT and tracking the 150-day limit across multiple employers
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            You have a pending USCIS case and need to know immediately when it updates
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            You are applying for jobs and need unlimited AI resume tools and ATS scanning
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            You want peace of mind that no deadline will slip through the cracks
                        </li>
                    </ul>
                </section>

                {/* Testimonials */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        What Students Say
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                quote: "I was manually tracking my unemployment days in a spreadsheet and almost missed the 90-day limit. Premium alerts saved my OPT status.",
                                name: "Priya S.",
                                detail: "CS Graduate, University of Illinois",
                            },
                            {
                                quote: "The daily USCIS auto-check caught my case status change the same morning it happened. Worth every penny for the peace of mind.",
                                name: "Wei L.",
                                detail: "ECE Graduate, Georgia Tech",
                            },
                        ].map((t, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6"
                            >
                                <div className="flex gap-1 mb-3">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Star
                                            key={j}
                                            className="w-4 h-4 text-amber-400 fill-amber-400"
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic mb-3">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    — {t.name},{" "}
                                    <span className="font-normal text-gray-500">
                                        {t.detail}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Internal Links */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Related Resources
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { text: "View All Pricing Plans", href: "/pricing" },
                            { text: "OPT 90-Day Unemployment Rule", href: "/blog/90-day-unemployment-rule-opt" },
                            { text: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
                            { text: "What Happens If OPT Expires?", href: "/blog/what-happens-if-opt-expires" },
                            { text: "Free OPT Tools", href: "/tools" },
                            { text: "USCIS Case Status Tracking", href: "/features/case-status" },
                        ].map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                            >
                                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                                    {link.text}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </article>

            {/* CTA */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Protect Your OPT Status Today
                    </h2>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        Start with a 7-day free trial. No credit card required.
                        Cancel anytime. Because your F-1 status is too important
                        to leave to a spreadsheet.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-blue-700 rounded-full shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        Start 7-Day Free Trial
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </>
    );
}
