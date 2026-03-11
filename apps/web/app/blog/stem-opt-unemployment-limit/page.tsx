import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "STEM OPT Unemployment Limit: The 150-Day Rule Explained (2026)",
    description: "The STEM OPT unemployment limit is 150 cumulative days (90 from initial OPT + 60 additional). Learn counting rules, what qualifies as employment, and how to stay compliant on STEM OPT.",
    keywords: ["STEM OPT unemployment limit", "150 day rule STEM OPT", "STEM OPT unemployment days", "STEM OPT employment requirements", "stem opt unemployment tracker"],
    openGraph: {
        title: "STEM OPT 150-Day Unemployment Rule | TrackMyOPT",
        description: "Complete guide to the 150-day unemployment limit on STEM OPT. How days are counted and strategies to stay compliant.",
        url: "https://www.trackmyopt.com/blog/stem-opt-unemployment-limit",
        type: "article",
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/stem-opt-unemployment-limit",
    },
};

export default function StemOPTUnemploymentArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">STEM OPT Unemployment Limit</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">STEM OPT</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    STEM OPT Unemployment Limit: The 150-Day Rule Explained
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you're on STEM OPT, your total unemployment limit extends to 150 days. Here's exactly how it works, what counts, and how to avoid violations.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            {/* Key Stat */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Quick Answer
                </h2>
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                    STEM OPT students are allowed <strong>150 cumulative days of unemployment</strong> across the entire OPT + STEM OPT period (36 months). This is the 90 days from initial OPT plus an additional 60 days from the STEM extension.
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt" target="_blank" rel="noopener noreferrer" className="underline">USCIS.gov</a>, 8 CFR § 214.2(f)(10)(ii)(C)
                </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        STEM OPT vs Regular OPT: Unemployment Comparison
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Factor</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Regular OPT</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">STEM OPT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Duration", "12 months", "36 months (12 + 24)"],
                                    ["Unemployment Limit", "90 days", "150 days (90 + 60)"],
                                    ["Volunteer Work Counts?", "Yes (20+ hrs/week)", "No — must be paid"],
                                    ["Employer Requirements", "Related to major", "E-Verify + related to STEM degree"],
                                    ["Min Hours/Week", "20 hours", "20 hours (paid)"],
                                    ["Reporting", "Basic SEVP Portal", "I-983 + 6-month validations"],
                                ].map(([factor, opt, stem], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{factor}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{opt}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{stem}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Critical STEM OPT Employment Rules
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        STEM OPT has <strong>stricter employment requirements</strong> than regular OPT. The key difference: volunteer and unpaid work do not count.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">What Stops the Clock on STEM OPT</h3>
                                <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                                    <li>• Paid employment ≥20 hours/week at an E-Verify employer</li>
                                    <li>• Position directly related to your STEM degree</li>
                                    <li>• Valid I-983 training plan on file with your DSO</li>
                                    <li>• Multiple employers allowed (each must meet these requirements)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">What Does NOT Count on STEM OPT</h3>
                                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                                    <li>• Volunteer/unpaid positions (unlike regular OPT)</li>
                                    <li>• Working for non-E-Verify employers</li>
                                    <li>• Jobs unrelated to your STEM field</li>
                                    <li>• Self-employment without proper registration</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        STEM OPT Reporting Requirements
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        STEM OPT students have <strong>additional reporting obligations</strong> beyond regular OPT. Failure to comply can result in SEVIS termination.
                    </p>
                    <div className="space-y-3">
                        {[
                            { title: "6-Month Validation Reports", detail: "Every 6 months, you must confirm your employment details and SEVIS record accuracy with your DSO." },
                            { title: "I-983 Evaluations", detail: "Submit self-evaluations at the 12-month and 24-month marks of your STEM extension." },
                            { title: "10-Day Change Reporting", detail: "Report any changes to employment (new job, termination, address change) to your DSO within 10 days." },
                            { title: "Annual Wage Confirmation", detail: "Your employer must confirm that your compensation is commensurate with similarly situated U.S. workers." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{i + 1}. {item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: "How many unemployment days are allowed on STEM OPT?", a: "STEM OPT students are allowed a total of 150 cumulative days of unemployment across the entire 36-month OPT + STEM OPT period. This includes the initial 90 days from post-completion OPT plus an additional 60 days from the STEM extension." },
                            { q: "Does volunteer work count as employment on STEM OPT?", a: "No. Unlike regular OPT where volunteer positions (20+ hours/week) can count, STEM OPT requires paid employment at an E-Verify employer. Volunteer and unpaid work does not stop the unemployment clock during STEM OPT." },
                            { q: "What happens if I exceed 150 days on STEM OPT?", a: "Exceeding 150 days of unemployment during the OPT + STEM OPT period can result in SEVIS termination and loss of F-1 status. Your DSO is required to report excess unemployment days to SEVP." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your STEM OPT Unemployment Days</h2>
                <p className="text-purple-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT monitors your unemployment days, sends alerts before you hit the 150-day limit, and tracks your reporting deadlines.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <AuthorBio />

            {/* Schema */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "STEM OPT Unemployment Limit: The 150-Day Rule Explained",
                    "author": { "@type": "Organization", "name": "TrackMyOPT" },
                    "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } },
                    "datePublished": "2026-03-10", "dateModified": "2026-03-10",
                    "mainEntityOfPage": "https://www.trackmyopt.com/blog/stem-opt-unemployment-limit"
                })
            }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "FAQPage",
                    "mainEntity": [
                        { "@type": "Question", "name": "How many unemployment days are allowed on STEM OPT?", "acceptedAnswer": { "@type": "Answer", "text": "STEM OPT students are allowed a total of 150 cumulative days of unemployment across the entire 36-month OPT + STEM OPT period." } },
                        { "@type": "Question", "name": "Does volunteer work count as employment on STEM OPT?", "acceptedAnswer": { "@type": "Answer", "text": "No. STEM OPT requires paid employment at an E-Verify employer. Volunteer and unpaid work does not stop the unemployment clock." } },
                        { "@type": "Question", "name": "What happens if I exceed 150 days on STEM OPT?", "acceptedAnswer": { "@type": "Answer", "text": "Exceeding 150 days can result in SEVIS termination and loss of F-1 status." } },
                    ]
                })
            }} />
        </article>
    );
}
