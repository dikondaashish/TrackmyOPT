import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, Calendar, BookOpen } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "H-1B Cap-Gap Extension Explained: Timeline, Work Auth & Rules (2026)",
    description: "H-1B cap-gap extension explained for F-1 OPT students. How the automatic extension works, timeline from OPT to H-1B, work authorization during cap-gap, and what happens if your H-1B is denied.",
    keywords: ["H-1B cap-gap", "cap-gap extension", "OPT cap-gap H-1B", "cap-gap work authorization", "H-1B cap-gap timeline", "what is cap-gap"],
    openGraph: { title: "H-1B Cap-Gap Extension Explained 2026 | TrackMyOPT", description: "Complete guide to H-1B cap-gap extension. Understand automatic work authorization, timelines, travel risks, and what happens if your H-1B is denied.", url: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension", type: "article", siteName: "TrackMyOPT", images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "H-1B Cap-Gap Extension Explained: Timeline, Work Auth & Rules (2026)" }] },
    alternates: { canonical: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension" },
};

export default function CapGapArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "H1b Cap Gap Extension", url: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-10" modifiedDate="2026-03-12" author="TrackMyOPT Team" howToItems={[{step: 1, name: "Understand Cap-Gap Requirements", url: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension#requirements", image: "https://www.trackmyopt.com/og-image.png"}, {step: 2, name: "Register for H-1B and Participate in Lottery", url: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension#lottery", image: "https://www.trackmyopt.com/og-image.png"}, {step: 3, name: "Have Your Employer File H-1B Petition", url: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension#filing", image: "https://www.trackmyopt.com/og-image.png"}, {step: 4, name: "Receive I-20 Endorsement for Cap-Gap", url: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension#i20", image: "https://www.trackmyopt.com/og-image.png"}, {step: 5, name: "Work During Cap-Gap Until October 1", url: "https://www.trackmyopt.com/blog/h1b-cap-gap-extension#work", image: "https://www.trackmyopt.com/og-image.png"}]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">H-1B Cap-Gap</span>
            </nav>
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold">H-1B</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />10 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">H-1B Cap-Gap Extension Explained: What Happens Between OPT and H-1B</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">The cap-gap bridges the gap between your OPT expiration and H-1B start date. Here's exactly how it works.</p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    The H-1B cap-gap automatically extends your F-1 status and OPT work authorization from April 1 through September 30 if your employer files a timely H-1B cap-subject petition. This prevents any gap in your legal status between OPT expiration and H-1B start date.
                </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Key Takeaway</h2>
                <p className="text-orange-800 dark:text-orange-200 font-medium">The <strong>H-1B cap-gap</strong> automatically extends your F-1 status and OPT work authorization from your OPT expiration date until <strong>October 1</strong> (the H-1B start date) — but only if your employer files a timely H-1B change-of-status petition and you're selected in the lottery.</p>
                <p className="text-orange-700 dark:text-orange-300 text-sm mt-2">Source: <a href="https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/extension-of-status-and-change-of-status-for-cap-gap-h-1b-beneficiaries" target="_blank" rel="noopener noreferrer" className="underline">USCIS.gov Cap-Gap</a></p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Is the H-1B Cap-Gap?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">The cap-gap is a regulation (<strong>8 CFR 214.2(f)(5)(vi)</strong>) that fills the timing gap between:</p>
                    <div className="flex flex-col md:flex-row items-center gap-4 my-6">
                        <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Your OPT Expires</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">e.g., June 15</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 md:rotate-0" />
                        <div className="flex-1 p-4 bg-gray-100 dark:bg-zinc-800 rounded-xl text-center">
                            <p className="text-sm text-gray-500 font-medium">Cap-Gap Period</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">Auto-Extended</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 md:rotate-0" />
                        <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">H-1B Starts</p>
                            <p className="text-lg font-bold text-green-900 dark:text-green-100">October 1</p>
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Without the cap-gap, you'd have to leave the US after your OPT ends and return on October 1 when the H-1B starts. The cap-gap eliminates that disruption.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cap-Gap Timeline 2026</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Date</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Event</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Your Status</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["March 2026", "H-1B registration opens", "File registration with employer"],
                                    ["Late March", "Lottery results announced", "Selected or not selected"],
                                    ["April 1 - June 30", "Employer files H-1B petition", "OPT continues normally"],
                                    ["Your OPT expiry", "OPT would normally end", "Cap-gap auto-extends status"],
                                    ["Until Oct 1", "Cap-gap period", "Can work; F-1 status extended"],
                                    ["October 1, 2026", "H-1B start date", "Status changes to H-1B"],
                                ].map(([date, event, status], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{date}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{event}</td><td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{status}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Can You Work During the Cap-Gap?</h2>
                    <div className="space-y-3">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div><h3 className="font-semibold text-green-900 dark:text-green-100">Yes — if H-1B petition filed as change of status</h3><p className="text-sm text-green-800 dark:text-green-200">If your employer filed an H-1B petition requesting change of status (not consular processing), your EAD work authorization is automatically extended until October 1.</p></div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div><h3 className="font-semibold text-red-900 dark:text-red-100">No work auth — if consular processing</h3><p className="text-sm text-red-800 dark:text-red-200">If the petition requests consular processing instead of change of status, you get F-1 status extension (can stay in US) but NOT work authorization during the cap-gap.</p></div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What If Your H-1B Is Not Selected or Denied?</h2>
                    <div className="space-y-2">
                        {[
                            { scenario: "Not selected in lottery", result: "Cap-gap ends. Your OPT expiration date reverts to the original date (or 60-day grace period if already expired)." },
                            { scenario: "H-1B petition denied", result: "Cap-gap ends immediately. You enter the 60-day grace period from the denial date." },
                            { scenario: "H-1B petition withdrawn", result: "Same as denial — cap-gap terminates and grace period begins." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100">{item.scenario}</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{item.result}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">For backup strategies, see our <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 underline">OPT to H-1B transition guide</Link> and <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 underline">what happens when OPT expires</Link>.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "What is the H-1B cap-gap?", answer: "The cap-gap is an automatic extension of F-1 status and OPT work authorization that bridges the gap between your OPT expiration and the October 1 H-1B start date, available when your employer files a timely H-1B petition with change of status." },
                            { question: "Can I travel during the cap-gap?", answer: "Travel is risky during the cap-gap. If you leave the US, you may not be able to re-enter on F-1 status. Most immigration attorneys recommend NOT traveling during this period." },
                            { question: "Do I need a new EAD card for the cap-gap?", answer: "No. Your existing EAD card is automatically extended by regulation. USCIS does not issue a new card, but your I-20 should show the cap-gap extension. Keep your original EAD and the updated I-20 together." },
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
                    <Link href="/blog/h1b-approval-rates-by-company" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Approval Rates by Company 2026</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/sponsors" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">H-1B Sponsor Database →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your H-1B Timeline & Cap-Gap Status</h2>
                <p className="text-orange-100 mb-6 max-w-lg mx-auto">TrackMyOPT monitors your H-1B registration, lottery results, and cap-gap dates — all in one dashboard.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors">Start Tracking Free <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "What is the H-1B cap-gap?", "acceptedAnswer": { "@type": "Answer", "text": "An automatic extension of F-1 status and OPT work authorization bridging OPT expiration and October 1 H-1B start date." } }, { "@type": "Question", "name": "Can I travel during cap-gap?", "acceptedAnswer": { "@type": "Answer", "text": "Travel is risky. If you leave the US, re-entry on F-1 may not be possible. Most attorneys recommend not traveling." } }, { "@type": "Question", "name": "Do I need a new EAD for cap-gap?", "acceptedAnswer": { "@type": "Answer", "text": "No. Your existing EAD is automatically extended. Keep your original EAD and updated I-20 together." } }] }) }} />
        </article>
    );
}
