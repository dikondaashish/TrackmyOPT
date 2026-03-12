import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, FileText, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "OPT Extension Guide 2026: How to Extend Your OPT Work Authorization",
    description: "How to extend OPT in 2026. STEM OPT extension eligibility, cap-gap extension, 180-day auto extension, and what to do when your OPT is about to expire.",
    keywords: ["OPT extension", "extend OPT", "OPT extension 2026", "STEM OPT extension", "how to extend OPT", "OPT extension options", "OPT EAD extension"],
    openGraph: { title: "OPT Extension Guide 2026 | TrackMyOPT", description: "All ways to extend your OPT work authorization.", url: "https://www.trackmyopt.com/blog/opt-extension-guide", type: "article" },
    alternates: { canonical: "https://www.trackmyopt.com/blog/opt-extension-guide" },
};

export default function OPTExtensionGuideArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Opt Extension Guide", url: "https://www.trackmyopt.com/blog/opt-extension-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "Can I extend my OPT?", answer: "Regular post-completion OPT cannot be extended, but STEM degree holders can apply for a 24-month STEM OPT extension. Additionally, all students may qualify for the automatic 60-day OPT grace period."}, {question: "How long can I extend OPT for?", answer: "STEM OPT extension provides an additional 24 months (beyond your initial 12 months of OPT). Non-STEM students get a 60-day grace period if their OPT expires while they are job searching."}, {question: "When should I apply for STEM OPT extension?", answer: "File your STEM OPT extension before your initial OPT expires. You must have an I-983 training plan from your employer and be working at an E-Verify employer."} ]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">OPT Extension</span>
            </nav>
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">OPT Basics</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />10 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">OPT Extension Guide 2026: How to Extend Your Work Authorization</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">Your OPT is expiring and you need more time. Here are ALL the ways to extend your F-1 work authorization in 2026.</p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Quick Summary</h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">There are <strong>3 ways</strong> to extend OPT work authorization: (1) the <strong>24-month STEM OPT extension</strong> for STEM degree holders, (2) the <strong>H-1B cap-gap extension</strong> if your employer files an H-1B petition, and (3) the <strong>180-day automatic extension</strong> while USCIS processes a timely-filed STEM OPT application.</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">3 Ways to Extend OPT in 2026</h2>
                    <div className="space-y-6">
                        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">1. STEM OPT Extension (24 Months)</h3>
                            <p className="text-purple-800 dark:text-purple-200 mb-3">The most common and longest extension. Adds 24 months of work authorization after your initial 12-month OPT.</p>
                            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><tbody>
                                {[["Eligibility", "STEM degree (qualifying CIP code)"], ["Duration", "24 additional months (36 total)"], ["Employer req", "Must be E-Verify enrolled"], ["Key form", "I-983 Training Plan + I-765"], ["Filing fee", "$410 (2026)"], ["Must file by", "Before current OPT expires"]].map(([label, val], i) => (
                                    <tr key={i}><td className="p-2 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 w-1/3">{label}</td><td className="p-2 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{val}</td></tr>
                                ))}
                            </tbody></table></div>
                            <Link href="/blog/stem-opt-extension-guide" className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline mt-3 inline-block">Read our complete STEM OPT guide →</Link>
                        </div>

                        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3">2. H-1B Cap-Gap Extension</h3>
                            <p className="text-amber-800 dark:text-amber-200 mb-3">If your employer files an H-1B petition on your behalf, your OPT and F-1 status are automatically extended until October 1.</p>
                            <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><tbody>
                                {[["Eligibility", "H-1B petition filed (change of status)"], ["Duration", "Until Oct 1 or petition decision"], ["Work auth", "Yes — continues automatically"], ["Employer req", "Must file before OPT expires"], ["Student action", "None — automatic extension"]].map(([label, val], i) => (
                                    <tr key={i}><td className="p-2 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900 w-1/3">{label}</td><td className="p-2 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{val}</td></tr>
                                ))}
                            </tbody></table></div>
                            <Link href="/blog/opt-to-h1b-transition" className="text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline mt-3 inline-block">Read our OPT to H-1B guide →</Link>
                        </div>

                        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">3. 180-Day Automatic Extension</h3>
                            <p className="text-green-800 dark:text-green-200 mb-3">When you file a STEM OPT application before your current OPT expires, you receive an automatic 180-day extension of your EAD while USCIS processes the application.</p>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mt-2">
                                <p className="text-sm text-green-800 dark:text-green-200"><strong>Key requirement:</strong> Your I-765 must be received by USCIS <strong>before</strong> your current EAD expires. Late filing = no extension.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What You CANNOT Extend</h2>
                    <div className="space-y-2">
                        {["Pre-completion OPT cannot be extended", "Initial 12-month OPT for non-STEM degrees has no extension", "Day 1 CPT is not an OPT extension (it's a separate authorization)", "You cannot extend OPT by applying for a second OPT at the same degree level"].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800 dark:text-red-200">{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Can I extend my OPT?", answer: "Yes, if you have a STEM degree you can apply for a 24-month STEM OPT extension. If your employer files an H-1B petition, you get an automatic cap-gap extension until October 1. Non-STEM degree holders cannot extend their initial 12-month OPT." },
                            { question: "How long can I extend OPT?", answer: "The maximum extension is 24 months via STEM OPT, for a total of 36 months of work authorization. The H-1B cap-gap extends until October 1 of the H-1B start year." },
                            { question: "When should I apply for STEM OPT extension?", answer: "Apply 60-90 days before your current OPT expires. Your I-765 must be received by USCIS before your EAD expiration date to qualify for the 180-day automatic extension." },
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
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                    <Link href="/blog/h1b-cap-gap-extension" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Cap-Gap Extension Explained</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Complete STEM OPT Extension Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Never Miss an OPT Deadline</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">TrackMyOPT sends alerts 90, 60, and 30 days before your OPT expires. Stay ahead of every deadline.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">Start Tracking Free <ArrowRight className="w-4 h-4" /></Link>
            </div>
        </article>
    );
}
