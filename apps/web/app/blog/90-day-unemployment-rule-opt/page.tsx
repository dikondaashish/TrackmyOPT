import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "How Many Unemployment Days on OPT? 90-Day Rule Explained (2026)",
    description: "How many unemployment days are allowed on OPT? 90 days on initial OPT, 150 total with STEM OPT. Learn how days are counted, how to check the SEVP portal, and track remaining days free.",
    keywords: ["how many unemployment days in opt", "how many days of unemployment on opt", "90 day rule OPT", "OPT unemployment days", "how to check unemployment days in sevp portal", "STEM OPT 150 days unemployment", "does opt unemployment days include weekends"],
    openGraph: {
        title: "OPT 90-Day Unemployment Rule (2026) — Days Counter | TrackMyOPT",
        description: "How OPT unemployment days are counted, STEM 150-day limit, and free tracker to stay compliant before SEVIS termination.",
        url: "https://www.trackmyopt.com/blog/90-day-unemployment-rule-opt",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "The 90-Day OPT Unemployment Rule: Everything You Need to Know (2026)",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/90-day-unemployment-rule-opt",
    },
    twitter: {
        card: "summary_large_image",
        title: "OPT 90-Day Unemployment Rule (2026) — Days Counter | TrackMyOPT",
        description: "How OPT unemployment days are counted, STEM 150-day limit, and free tracker to stay compliant before SEVIS termination.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

const UNEMPLOYMENT_FAQS = [
    {
        question: "How many unemployment days are allowed on OPT?",
        answer: "Post-completion OPT allows 90 cumulative calendar days of unemployment during your 12-month authorization. If you receive a STEM OPT extension, you get 60 additional days for a combined total of 150 days across the full OPT + STEM OPT period.",
    },
    {
        question: "How to check unemployment days in the SEVP portal?",
        answer: "Log in at sevp.ice.gov/opt with your SEVIS credentials. The dashboard shows your allowed, accrued, and remaining unemployment days. Update employer information within 10 days of any job change so the counter stays accurate.",
    },
    {
        question: "Do OPT unemployment days include weekends?",
        answer: "Yes. Unemployment is counted in calendar days, not business days. Weekends and holidays count if you do not have qualifying employment that day.",
    },
    {
        question: "Will the 90-day period carry over to my STEM OPT period?",
        answer: "Yes. Unemployment days used during initial OPT count toward your combined 150-day limit. STEM OPT adds 60 more days on top of the original 90 — it does not reset the counter to zero.",
    },
    {
        question: "What happens after 90 days of unemployment on OPT?",
        answer: "Exceeding the limit can lead to SEVIS termination, loss of F-1 status, and complications for future visa applications. Report employment promptly and track remaining days before you approach the limit.",
    },
] as const;

export default function NinetyDayRuleArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "90 Day Unemployment Rule Opt", url: "https://www.trackmyopt.com/blog/90-day-unemployment-rule-opt" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-01-13" modifiedDate="2026-07-27" author="Vinay Kumar" faqItems={[...UNEMPLOYMENT_FAQS]} />
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">90-Day Rule</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        OPT Basics
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        8 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    How Many Unemployment Days on OPT? The 90-Day Rule Explained (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    F-1 students on post-completion OPT get 90 unemployment days (150 with STEM OPT). Here is how days are counted, how to check the SEVP portal, and how to stay compliant.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Last updated: July 27, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    F-1 students on post-completion OPT are limited to <strong>90 cumulative calendar days</strong> of unemployment (150 total with STEM OPT). Exceeding the limit can result in SEVIS termination. Waiting for your EAD? See <Link href="/blog/opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">how long OPT takes in 2026</Link>.
                </p>
            </div>

            <BlogProductCTA
                variant="unemployment"
                sourcePage="/blog/90-day-unemployment-rule-opt"
            />

            {/* Key Takeaway Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    F-1 students on post-completion OPT are limited to <strong>90 cumulative days of unemployment</strong>. If you're on STEM OPT, you get an additional 60 days (150 total). Exceeding this limit can result in SEVIS termination and loss of F-1 status.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" target="_blank" rel="noopener noreferrer" className="underline">USCIS.gov</a>, 8 CFR § 214.2(f)(10)(ii)
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#what-is", "What Is the 90-Day Unemployment Rule?"],
                        ["#how-counted", "How Are Unemployment Days Counted?"],
                        ["#what-counts", "What Counts as Employment on OPT?"],
                        ["#stem-opt", "STEM OPT: The 150-Day Rule"],
                        ["#what-happens", "What Happens If You Exceed 90 Days?"],
                        ["#track", "How to Track Your Unemployment Days"],
                        ["#tips", "Tips to Stay Under the Limit"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="what-is" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Is the 90-Day Unemployment Rule?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The 90-day unemployment rule is a regulation under <strong>8 CFR § 214.2(f)(10)(ii)</strong> that limits the total number of days an F-1 student can be unemployed during their post-completion OPT period.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        According to USCIS, F-1 students on post-completion OPT are permitted a maximum of <strong>90 cumulative days of unemployment</strong> during the entire 12-month OPT authorization period. These days do not need to be consecutive — they are counted cumulatively from your OPT start date until your OPT end date.
                    </p>

                    {/* Quotable Stat Box */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "F-1 students on post-completion OPT cannot accumulate more than 90 days of unemployment. For STEM OPT students, the limit extends to 150 days total."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — Source: USCIS.gov, 8 CFR § 214.2(f)(10)(ii)(C)
                        </p>
                    </div>
                </section>

                <section id="how-counted" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How Are Unemployment Days Counted?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Unemployment days are counted as <strong>calendar days</strong> (including weekends and holidays) when you do not have qualifying employment. Here's exactly how the counting works:
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Days That Count as Unemployed</h3>
                                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                                    <li>• Every calendar day without a qualifying job (including weekends)</li>
                                    <li>• Any day between losing one job and starting another</li>
                                    <li>• Days after your OPT starts but before you find your first job</li>
                                    <li>• Days you are in the US but not working</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Days That Do NOT Count</h3>
                                <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                                    <li>• Days when you have qualifying employment (20+ hours/week)</li>
                                    <li>• Days you are traveling outside the US (debated — ask your DSO)</li>
                                    <li>• Days before your OPT start date</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mt-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Example Calculation</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>📅 OPT Start: January 15, 2026</p>
                            <p>💼 First job starts: February 20, 2026 → <strong>36 days unemployed</strong></p>
                            <p>🔄 Gap between jobs (March 10 - April 5): → <strong>26 days unemployed</strong></p>
                            <p>📊 Total unemployment: <strong>62 of 90 days used</strong> → 28 days remaining</p>
                        </div>
                    </div>
                </section>

                <section id="what-counts" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Counts as Employment on OPT?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Not just any job stops the unemployment clock. The employment must be <strong>directly related to your major field of study</strong> and meet these USCIS criteria:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "Paid Employment", desc: "Full-time or part-time (minimum 20 hours/week) in a position related to your degree field." },
                            { title: "Self-Employment", desc: "Starting your own business related to your field of study. Must be properly registered." },
                            { title: "Volunteer/Unpaid Work", desc: "Unpaid internships or volunteer positions related to your major. Must be 20+ hours/week for initial OPT only." },
                            { title: "Independent Contractor", desc: "1099 contract work in your field. You must be able to provide evidence of the position." },
                        ].map((item) => (
                            <div key={item.title} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Important for STEM OPT:</strong> Volunteer and unpaid positions do <strong>not</strong> count as qualifying employment during STEM OPT extension. Employment must be paid and at least 20 hours per week.
                        </p>
                    </div>
                </section>

                <section id="stem-opt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        STEM OPT: The 150-Day Rule
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you're approved for the <Link href="/blog/stem-opt-unemployment-limit" className="text-blue-600 dark:text-blue-400 underline">STEM OPT extension</Link>, you receive an additional 60 days of unemployment, bringing your total to <strong>150 cumulative days</strong> across the entire 36-month OPT + STEM OPT period.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">OPT Type</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Duration</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Unemployment Limit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Initial Post-Completion OPT</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">12 months</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">90 days</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">STEM OPT Extension</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">24 months (additional)</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">+60 days = 150 total</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="what-happens" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Happens If You Exceed 90 Days?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Exceeding the 90-day unemployment limit has serious immigration consequences:
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Your SEVIS record may be terminated by your DSO or SEVP",
                            "You could fall out of legal F-1 status",
                            "Any pending H-1B petition or status change could be affected",
                            "You may need to leave the US or apply for reinstatement",
                            "Future visa applications could be impacted",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <section id="track" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Track Your Unemployment Days
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Accurately tracking your unemployment days is critical. Here are three methods:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">1. TrackMyOPT (Recommended)</h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                                Our <Link href="/dashboard/opt-tools/opt-clock" className="underline font-medium">OPT Unemployment Clock</Link> automatically counts your unemployment days, sends alerts when you're approaching the limit, and integrates with your USCIS case timeline.
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                Track Your Days Free <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">2. SEVP Portal</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Log into the <a href="https://sevp.ice.gov/opt/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">SEVP Portal</a> to check the official SEVIS Unemployment Counter. This shows your allowed, accrued, and remaining unemployment days. See our <Link href="/blog/sevp-portal-guide-opt" className="text-blue-600 underline">SEVP portal guide</Link> for step-by-step login help.
                            </p>
                        </div>

                        <div className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">3. Manual Spreadsheet</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Keep a simple spreadsheet logging every employment start/end date. Calculate gaps between jobs. Less reliable than automated tracking but better than nothing.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="tips" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Tips to Stay Under the Unemployment Limit
                    </h2>
                    <div className="space-y-3">
                        {[
                            { tip: "Start job searching before graduation", detail: "Submit your OPT application early and begin applying for jobs 3-4 months before your program ends." },
                            { tip: "Consider volunteer positions", detail: "If you can't find paid work immediately, volunteer positions in your field (20+ hours/week) count as employment during initial OPT." },
                            { tip: "Report employment immediately", detail: "Update your employer information in the SEVP Portal within 10 days of any employment change." },
                            { tip: "Track your days proactively", detail: "Don't wait until you're near the limit. Use an automated tool like TrackMyOPT to monitor your unemployment days in real-time." },
                            { tip: "Consider short-term contracts", detail: "Even short freelance or contract positions in your field can stop the unemployment clock." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{i + 1}. {item.tip}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Schema Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {UNEMPLOYMENT_FAQS.map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide 2026</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/compare" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT vs STEM Comparison →</Link>
                    <Link href="/ai-facts" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">101 OPT & Immigration Facts →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your OPT Unemployment Days Automatically</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    Join 2,500+ F-1 students who use TrackMyOPT to monitor their unemployment days, get alerts, and stay compliant.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
