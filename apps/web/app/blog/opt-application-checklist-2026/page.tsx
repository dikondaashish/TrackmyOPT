import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "OPT Application Checklist 2026: Complete I-765 Filing Guide",
    description: "Step-by-step OPT application checklist. Every document, form, and deadline for filing Form I-765. Avoid RFEs with our comprehensive 2026 checklist for F-1 students.",
    keywords: ["OPT application checklist", "I-765 checklist", "OPT documents needed", "how to apply for OPT", "OPT application requirements 2026", "EAD application checklist"],
    openGraph: {
        title: "OPT Application Checklist 2026 | TrackMyOPT",
        description: "Complete checklist for filing I-765. Every document, deadline, and tip to avoid delays.",
        url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "OPT Application Checklist 2026: Complete I-765 Filing Guide" }],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/opt-application-checklist-2026",
    },
    twitter: {
        card: "summary_large_image",
        title: "OPT Application Checklist 2026 | TrackMyOPT",
        description: "Complete checklist for filing I-765. Every document, deadline, and tip to avoid delays.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function OPTChecklistArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Opt Application Checklist 2026", url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-05-25" modifiedDate="2026-05-25" author="Vinay Kumar" howToItems={[{step: 1, name: "Meet with Your DSO", url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026#dso", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 2, name: "Get Your OPT I-20", url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026#i20", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 3, name: "Complete Form I-765", url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026#i765", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 4, name: "Gather All Required Documents", url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026#documents", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 5, name: "File Your OPT Application Online or by Mail", url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026#filing", image: "https://www.trackmyopt.com/og-image.jpg"}, {step: 6, name: "Receive Your Receipt Notice and Track Your Case", url: "https://www.trackmyopt.com/blog/opt-application-checklist-2026#tracking", image: "https://www.trackmyopt.com/og-image.jpg"}]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">OPT Application Checklist</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">OPT Basics</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />10 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT Application Checklist 2026: Complete I-765 Filing Guide
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Filing Form I-765 for OPT? Use this step-by-step checklist to make sure you have every document, meet every deadline, and avoid the most common mistakes that cause RFEs and delays.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: May 24, 2026 • Written by Vinay Kumar</div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    To apply for OPT, you need Form I-765, a new I-20 with OPT recommendation from your DSO, passport copies, I-94, passport photos, and the $410 filing fee. You must file within 90 days before and 60 days after your program end date.
                </p>
            </div>

            {/* Key Deadlines */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical Deadlines
                </h2>
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl">
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">90 days</div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Earliest you can file before program end</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">60 days</div>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Latest you can file after program end</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">30 days</div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">After DSO recommends in SEVIS</p>
                    </div>
                </div>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                {/* Step 1 */}
                <section className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step 1: Before Applying (Pre-Filing)
                    </h2>
                    <div className="space-y-3 mb-4">
                        {[
                            "Confirm your program end date with your academic advisor",
                            "Attend the OPT information session at your international student office",
                            "Request an OPT recommendation from your DSO (Designated School Official)",
                            "Wait for your DSO to issue a new I-20 with the OPT recommendation",
                            "Pay the SEVIS I-901 fee if required (varies by institution)",
                        ].map((item, i) => (
                            <label key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Step 2 */}
                <section className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step 2: Gather Required Documents
                    </h2>
                    <div className="space-y-3">
                        {[
                            { doc: "Form I-765 (completed and signed)", note: "File online at uscis.gov for faster processing" },
                            { doc: "New I-20 with OPT recommendation from DSO", note: "Pages 1-3, signed by you and your DSO" },
                            { doc: "Copies of all previous I-20s", note: "Every I-20 you have ever received" },
                            { doc: "Passport biographical page (copy)", note: "Must be valid; renew if expiring soon" },
                            { doc: "Most recent F-1 visa stamp (copy)", note: "Even if expired — entry stamp counts" },
                            { doc: "I-94 arrival record", note: "Download from i94.cbp.dhs.gov" },
                            { doc: "Previous EAD cards (copies, front + back)", note: "If you had any prior employment authorization" },
                            { doc: "Two passport-style photos", note: "2x2 inches, white background, taken within 30 days" },
                            { doc: "Filing fee: $410", note: "Check, money order, or online payment" },
                        ].map((item, i) => (
                            <label key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <div>
                                    <span className="text-gray-900 dark:text-white text-sm font-medium">{item.doc}</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.note}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Step 3 */}
                <section className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step 3: File Form I-765
                    </h2>
                    <div className="space-y-3">
                        {[
                            "Select eligibility category (c)(3)(B) for post-completion OPT",
                            "Enter your SEVIS ID accurately (starts with N followed by 10 digits)",
                            "Verify your I-94 admission number",
                            "Upload all required documents (if filing online)",
                            "Pay the $410 filing fee",
                            "Submit and save your receipt number (starts with IOE, EAC, WAC, etc.)",
                        ].map((item, i) => (
                            <label key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Step 4 */}
                <section className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step 4: After Filing
                    </h2>
                    <div className="space-y-3">
                        {[
                            "Save your receipt number (I-797C notice)",
                            "Track your case status on TrackMyOPT or USCIS.gov",
                            "Complete biometrics appointment (if requested)",
                            "Do NOT start working until you have your EAD card AND your OPT start date has passed",
                            "Start tracking unemployment days from your OPT start date",
                            "Begin job searching using TrackMyOPT's H-1B sponsor database",
                        ].map((item, i) => (
                            <label key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Common Mistakes */}
                <section className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Top 5 Mistakes That Cause OPT Delays
                    </h2>
                    <div className="space-y-3">
                        {[
                            { mistake: "Wrong eligibility category", fix: "Use (c)(3)(B) for post-completion OPT, not (c)(3)(A) for pre-completion or (c)(3)(C) for STEM." },
                            { mistake: "Passport photos don't meet specs", fix: "Must be 2x2 inches, white background, taken within 30 days. Use a professional service." },
                            { mistake: "Missing I-20 signatures", fix: "Both you and your DSO must sign the I-20. Missing signatures = automatic RFE." },
                            { mistake: "Filing too late", fix: "USCIS must receive your I-765 within 30 days of DSO SEVIS recommendation AND within 60 days after program end." },
                            { mistake: "Address mismatch", fix: "The address on your I-765 must match your current physical address. Update if you've moved recently." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                <h3 className="font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Mistake #{i + 1}: {item.mistake}
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-1"><strong>Fix:</strong> {item.fix}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "When should I apply for OPT?", answer: "You can file Form I-765 up to 90 days before your program end date and no later than 60 days after. Most experts recommend filing 60-90 days before graduation for the best timing." },
                            { question: "How much does OPT cost in 2026?", answer: "The I-765 filing fee is $410. Premium processing is available for an additional $1,685. No additional SEVIS fee is required for OPT itself." },
                            { question: "Can I track my OPT application status?", answer: "Yes. Use your receipt number (from the I-797C notice) to check status at uscis.gov/case-status, or use TrackMyOPT for real-time alerts and timeline tracking." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Ready to Apply for OPT?</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT guides you through every step — from I-765 filing to EAD tracking to your first job search.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Processing Time 2026</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day Unemployment Rule</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* JSON-LD: BlogPosting + HowTo come from <BlogPostSchema /> above — avoid duplicate HowTo scripts for rich results */}
        </article>
    );
}
