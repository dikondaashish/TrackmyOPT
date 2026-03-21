import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, CreditCard, BookOpen, FileText } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "OPT EAD Card 2026: How to Apply, Track & Renew Your Employment Authorization",
    description: "Everything about the OPT EAD card in 2026. How to apply with Form I-765, required documents, processing times, how to track your card, and what to do if it's lost or delayed.",
    keywords: ["OPT EAD card", "EAD card OPT", "OPT EAD application", "I-765 OPT", "OPT work permit", "employment authorization document"],
    openGraph: { title: "OPT EAD Card Guide 2026 | TrackMyOPT", description: "Everything about your OPT EAD card — how to apply with Form I-765, track your case, what to do if it's delayed, and how to renew.", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide", type: "article", siteName: "TrackMyOPT", images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "OPT EAD Card 2026: How to Apply, Track & Renew Your Employment Authorization" }] },
    alternates: { canonical: "https://www.trackmyopt.com/blog/opt-ead-card-guide" },
};

export default function OPTEADArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Opt Ead Card Guide", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" howToItems={[{step: 1, name: "Request OPT I-20 from Your DSO", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide#request-i20", image: "https://www.trackmyopt.com/og-image.png"}, {step: 2, name: "Complete Form I-765 for EAD", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide#form-i765", image: "https://www.trackmyopt.com/og-image.png"}, {step: 3, name: "Gather All Required Documents", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide#documents", image: "https://www.trackmyopt.com/og-image.png"}, {step: 4, name: "File Your Application Online or by Mail", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide#filing", image: "https://www.trackmyopt.com/og-image.png"}, {step: 5, name: "Receive Your Receipt Notice (I-797C)", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide#receipt", image: "https://www.trackmyopt.com/og-image.png"}, {step: 6, name: "Wait for USCIS Processing and Card Delivery", url: "https://www.trackmyopt.com/blog/opt-ead-card-guide#delivery", image: "https://www.trackmyopt.com/og-image.png"}]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">OPT EAD Card</span>
            </nav>
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">OPT Basics</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />9 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">OPT EAD Card 2026: How to Apply, Track & What to Do If Delayed</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">Your EAD card is the physical proof of your work authorization. Here's every step from application to receiving it.</p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    The OPT EAD card (Form I-766) is your Employment Authorization Document that proves you can work in the US on OPT. You apply using Form I-765 with a $410 filing fee, and processing currently takes 2 to 5 months.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Key Takeaway</h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">The EAD card (Form I-766) is your <strong>Employment Authorization Document</strong> — the card that proves you can work in the US on OPT. You apply using <strong>Form I-765</strong>, the filing fee is <strong>$410</strong>, and current processing takes <strong>2-5 months</strong>. You cannot work until you have the physical card.</p>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Is the OPT EAD Card?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">The Employment Authorization Document (EAD), officially Form I-766, is a credit-card-sized document issued by USCIS that proves your authorization to work in the United States. For OPT, your EAD card shows:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        {[
                            { label: "Category", value: "(c)(3)(B) for post-completion OPT" },
                            { label: "Valid From", value: "Your OPT start date" },
                            { label: "Valid To", value: "Your OPT end date (12 months)" },
                            { label: "Card Expires", value: "Same as OPT end date" },
                        ].map((item, i) => (
                            <div key={i} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0" /><div><p className="text-xs text-gray-500">{item.label}</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How to Apply for OPT EAD (Step-by-Step)</h2>
                    <div className="space-y-4">
                        {[
                            { step: "Request OPT I-20 from DSO", detail: "Meet with your Designated School Official. They'll update your SEVIS record and issue you an I-20 with OPT recommendation.", time: "2-3 weeks" },
                            { step: "Complete Form I-765", detail: "Fill out the Application for Employment Authorization. Use category (c)(3)(B) for post-completion OPT. Double-check every field.", time: "1-2 hours" },
                            { step: "Gather required documents", detail: "2 passport photos, copy of I-20 (all pages), copy of passport, copy of I-94, copy of F-1 visa stamp, previous EADs (if any), $410 filing fee or fee waiver.", time: "1-2 days" },
                            { step: "File online or by mail", detail: "USCIS encourages online filing at myUSCIS. You can also mail to the designated lockbox. Online is faster.", time: "Same day" },
                            { step: "Receive receipt notice (I-797C)", detail: "USCIS acknowledges receipt and assigns your case number (IOE or MSC number). Save this for tracking.", time: "2-4 weeks" },
                            { step: "Wait for approval & card delivery", detail: "USCIS processes and mails your EAD card. Current processing: 2-5 months.", time: "2-5 months" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold">{i + 1}</div>
                                <div className="flex-1 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900 dark:text-white">{item.step}</h3><span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{item.time}</span></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">For the complete document checklist, see our <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 underline">OPT Application Checklist</Link>.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How to Track Your EAD Card</h2>
                    <div className="space-y-3">
                        {[
                            { method: "USCIS Case Status Online", desc: "Enter your receipt number at egov.uscis.gov to see current status.", link: "https://egov.uscis.gov/" },
                            { method: "USCIS myAccount", desc: "Log into your myUSCIS account to see detailed case history and documents.", link: "https://myaccount.uscis.gov/" },
                            { method: "TrackMyOPT", desc: "Our automated tracker monitors your case status and sends push notifications on any updates. Integrates with your OPT timeline.", link: "/login" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.method}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What If Your EAD Is Delayed?</h2>
                    <div className="space-y-3">
                        {[
                            "Check if your case is outside normal processing times at egov.uscis.gov/processing-times",
                            "Submit an e-Request (service request) if past posted processing times",
                            "Contact the USCIS Contact Center at 1-800-375-5283",
                            "Ask your DSO to escalate through the SEVP Response Center",
                            "Contact your member of Congress for a Congressional inquiry",
                        ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <span className="text-amber-600 font-bold text-sm">{i + 1}.</span>
                                <p className="text-sm text-amber-800 dark:text-amber-200">{tip}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "What is an OPT EAD card?", answer: "The OPT EAD (Employment Authorization Document) card, Form I-766, is issued by USCIS to F-1 students approved for Optional Practical Training. It's your physical proof of work authorization in the United States." },
                            { question: "How long does it take to get the OPT EAD card?", answer: "Current processing time is 2-5 months from filing. Factors include filing method (online is faster), time of year (spring graduates cause a surge), and your service center." },
                            { question: "Can I work before receiving my EAD card?", answer: "No. You cannot begin employment until you physically receive your EAD card AND your OPT start date has passed. Working without the card is a violation of your F-1 status." },
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
                    <Link href="/blog/opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Processing Time 2026</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day Unemployment Rule</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your EAD Application in Real-Time</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">TrackMyOPT monitors your USCIS case status and alerts you the moment your EAD is approved.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">Track My EAD <ArrowRight className="w-4 h-4" /></Link>
            </div>
        </article>
    );
}
