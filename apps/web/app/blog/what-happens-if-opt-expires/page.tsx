import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "What Happens If Your OPT Expires? Next Steps & Options (2026)",
    description: "Your OPT is expiring or expired — what now? Learn about the 60-day grace period, STEM OPT extension, H-1B cap-gap, and what happens to your F-1 status when OPT ends.",
    keywords: ["what happens if OPT expires", "OPT expiration", "OPT grace period", "60 day grace period OPT", "after OPT expires", "OPT expired what to do"],
    openGraph: {
        title: "What Happens When OPT Expires? | TrackMyOPT",
        description: "Your options when OPT expires: grace period, STEM extension, H-1B, and more.",
        url: "https://www.trackmyopt.com/blog/what-happens-if-opt-expires",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "What Happens If Your OPT Expires? Next Steps & Options (2026)" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/what-happens-if-opt-expires" },
};

export default function OPTExpiresArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "What Happens If Opt Expires", url: "https://www.trackmyopt.com/blog/what-happens-if-opt-expires" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-06-11" modifiedDate="2026-06-11" author="Vinay Kumar" faqItems={[{question: "What happens when my OPT expires?", answer: "When your OPT EAD expires, your work authorization ends immediately. You enter a 60-day grace period during which you can prepare to leave the US, change visa status, transfer to a new school, or wait for a pending H-1B decision (cap-gap)."}, {question: "Can I stay in the US after OPT expires?", answer: "Yes, for up to 60 days (the grace period). However, you cannot work during this time. If you stay beyond 60 days without changing status, you begin accruing unlawful presence."}, {question: "Can I extend my OPT?", answer: "Regular OPT cannot be extended. However, STEM degree holders can apply for a 24-month STEM OPT extension before their current OPT expires. You must have an E-Verify employer and file Form I-765."} ]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">What Happens If OPT Expires</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">OPT Basics</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    What Happens If Your OPT Expires? Next Steps & Options
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your OPT EAD is about to expire — or already has. Don't panic. Here are your options and the exact steps to take.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: June 10, 2026 • Written by Vinay Kumar</div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    When your OPT expires, you enter a 60-day grace period during which you cannot work but can prepare to leave the US, change status, or transfer to a new school. If you have a pending H-1B petition, the cap-gap provision may extend your work authorization.
                </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical: The 60-Day Grace Period
                </h2>
                <p className="text-red-800 dark:text-red-200 font-medium">
                    After your OPT EAD expires, you have a <strong>60-day grace period</strong> to either leave the US, change your visa status, or transfer to a new school. You <strong>cannot work</strong> during this grace period — your employment authorization ended on your EAD expiration date.
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-2">
                    Source: 8 CFR § 214.2(f)(5)(iv)
                </p>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Your Options When OPT Expires
                    </h2>
                    <div className="space-y-4">
                        {[
                            { title: "Apply for STEM OPT Extension", desc: "If you have a STEM degree and your employer is E-Verify enrolled, you can apply for a 24-month extension. You must file before your current OPT expires.", eligible: "STEM degree holders only", link: "/blog/stem-opt-unemployment-limit", linkText: "STEM OPT Guide →" },
                            { title: "H-1B Cap-Gap Extension", desc: "If your employer filed an H-1B petition on your behalf, your status and work authorization are automatically extended until October 1 of the H-1B start year.", eligible: "H-1B petitioners only", link: "/blog/opt-to-h1b-transition", linkText: "OPT to H-1B Guide →" },
                            { title: "Change to Another Visa Status", desc: "You can apply to change to another visa category (B-1/B-2 tourist, H-4 dependent, O-1 extraordinary ability) before your 60-day grace period ends.", eligible: "Must file before grace period ends", link: null, linkText: null },
                            { title: "Transfer to a New School", desc: "You can transfer to a new academic program and start a new I-20. This resets your student status but does not provide work authorization immediately.", eligible: "Must be admitted to new program", link: null, linkText: null },
                            { title: "Depart the United States", desc: "You must leave before the 60-day grace period ends. Overstaying can result in unlawful presence and affect future visa applications.", eligible: "All students", link: null, linkText: null },
                        ].map((option, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Option {i + 1}: {option.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{option.desc}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500">{option.eligible}</span>
                                    {option.link && (
                                        <Link href={option.link} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                            {option.linkText}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Critical Timeline After OPT Expires
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Period</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Can You Work?</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">What You Can Do</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Day 1-60 (Grace Period)", "❌ No", "File change of status, transfer schools, prepare to depart, or wait for H-1B decision"],
                                    ["Day 61+ (After Grace)", "❌ No", "You are accruing unlawful presence. Leave immediately or consult attorney"],
                                    ["During Cap-Gap (if applicable)", "✅ Yes", "Continue working if H-1B petition was filed before OPT expired"],
                                    ["During STEM OPT (if filed on time)", "✅ Yes", "Work continues under automatic 180-day extension while USCIS processes"],
                                ].map(([period, work, action], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{period}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{work}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "What happens when my OPT expires?", answer: "When your OPT EAD expires, your work authorization ends immediately. You enter a 60-day grace period during which you can prepare to leave the US, change visa status, transfer to a new school, or wait for a pending H-1B decision (cap-gap)." },
                            { question: "Can I stay in the US after OPT expires?", answer: "Yes, for up to 60 days (the grace period). However, you cannot work during this time. If you stay beyond 60 days without changing status, you begin accruing unlawful presence." },
                            { question: "Can I extend my OPT?", answer: "Regular OPT cannot be extended. However, STEM degree holders can apply for a 24-month STEM OPT extension before their current OPT expires. You must have an E-Verify employer and file Form I-765." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day OPT Unemployment Rule</Link>
                    <Link href="/blog/h1b-cap-gap-extension" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Cap-Gap Extension Explained</Link>
                    <Link href="/blog/opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Extension Guide 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Don't Let Your OPT Deadlines Sneak Up</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">TrackMyOPT sends automated alerts 90, 60, and 30 days before your OPT expires.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Set Up Alerts Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

        </article>
    );
}
