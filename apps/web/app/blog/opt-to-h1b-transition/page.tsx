import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, Calendar, Briefcase } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "OPT to H-1B Transition: Step-by-Step Timeline & Guide (2026)",
    description: "Complete guide to transitioning from OPT to H-1B in 2026. Learn the timeline, cap-gap extension, employer requirements, and what happens if your H-1B isn't selected in the lottery.",
    keywords: ["OPT to H-1B transition", "OPT to H-1B timeline", "H-1B cap gap", "OPT H-1B bridge", "F-1 to H-1B", "H-1B after OPT"],
    openGraph: {
        title: "OPT to H-1B Transition Guide 2026 | TrackMyOPT",
        description: "Step-by-step timeline for transitioning from OPT to H-1B status. Cap-gap, lottery, and backup plans.",
        url: "https://www.trackmyopt.com/blog/opt-to-h1b-transition",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "OPT to H-1B Transition: Step-by-Step Timeline & Guide (2026)" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/opt-to-h1b-transition" },
};

export default function OPTtoH1BArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Opt To H1b Transition", url: "https://www.trackmyopt.com/blog/opt-to-h1b-transition" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "Can I transition from OPT to H-1B?", answer: "Yes. If your employer filed an H-1B petition while you were on OPT, you can transition to H-1B status if your petition is approved and your OPT is still valid or in the cap-gap period."}, {question: "What is cap-gap and how does it help during H-1B transition?", answer: "Cap-gap is an automatic extension of your OPT work authorization from your OPT end date until October 1 (H-1B start date), allowing you to work while waiting for your H-1B petition decision."}, {question: "Can my H-1B petition be filed multiple times if I don't win the lottery?", answer: "After not being selected in the lottery, you can change employers and file H-1B petitions with different companies. However, each application enters a new lottery cycle."} ]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">OPT to H-1B Transition</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">H-1B</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />9 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT to H-1B Transition: Step-by-Step Timeline & Guide (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Transitioning from F-1 OPT to H-1B is the most common path for international students to stay and work in the US long-term. Here's the complete timeline and strategy.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    The transition from OPT to H-1B requires your employer to file an H-1B petition with USCIS, including registration in the annual lottery. If selected and approved, your H-1B status begins October 1, with the cap-gap extension bridging any gap in work authorization.
                </p>
            </div>

            {/* Quick Answer */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Key Timeline
                </h2>
                <p className="text-amber-800 dark:text-amber-200 font-medium mb-3">
                    Your employer must register for the H-1B lottery by <strong>March</strong> of the year you want to start H-1B work. If selected, you can begin H-1B employment on <strong>October 1</strong>. The OPT cap-gap extension bridges between your OPT end date and October 1.
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                    Source: <a href="https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations" target="_blank" rel="noopener noreferrer" className="underline">USCIS H-1B Program</a>
                </p>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The OPT to H-1B Timeline
                    </h2>
                    <div className="space-y-4">
                        {[
                            { month: "Sept - Dec (Year Before)", title: "Find an H-1B Sponsor", desc: "Start identifying employers willing to sponsor. Use TrackMyOPT's H-1B Sponsor Database to research companies with high approval rates.", color: "blue" },
                            { month: "Jan - Feb", title: "Employer Prepares LCA", desc: "Your employer files a Labor Condition Application (LCA) with the Department of Labor. This takes about 7-10 business days.", color: "indigo" },
                            { month: "March 1 - March 18", title: "H-1B Registration Period", desc: "Your employer registers you for the H-1B lottery through USCIS. The registration fee is $215 per beneficiary (2026).", color: "purple" },
                            { month: "Late March", title: "Lottery Results", desc: "USCIS runs the electronic lottery. In FY2026, approximately 25-30% of registrations are selected. If selected, your employer has 90 days to file the full H-1B petition.", color: "amber" },
                            { month: "April - June", title: "File H-1B Petition", desc: "Your employer prepares and files Form I-129 with all supporting documents, including your job offer, degree evaluation, and LCA approval.", color: "orange" },
                            { month: "July - Sept", title: "USCIS Processing / Cap-Gap", desc: "While USCIS processes your petition, the cap-gap extension automatically extends your OPT and work authorization until October 1 (or the decision date).", color: "green" },
                            { month: "October 1", title: "H-1B Employment Begins", desc: "If approved, your H-1B status takes effect on October 1. You transition from F-1/OPT to H-1B status.", color: "emerald" },
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 mt-2 ring-4 ring-blue-100 dark:ring-blue-900/50" />
                                <div className="flex-1 pb-6 border-l-2 border-blue-100 dark:border-zinc-800 pl-6 -ml-[7px]">
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{step.month}</p>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{step.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Is the H-1B Cap-Gap Extension?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The cap-gap extension is an automatic extension of your F-1 status and OPT employment authorization that bridges the gap between your OPT end date and the H-1B start date (October 1).
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Scenario</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Status Extended?</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Work Authorization?</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["H-1B petition filed (change of status)", "Yes, until Oct 1", "Yes, until Oct 1"],
                                    ["H-1B petition pending", "Yes, during pendency", "Yes, during pendency"],
                                    ["H-1B petition denied", "Ends when denial is issued", "Ends when denial is issued"],
                                    ["H-1B petition withdrawn", "Ends when withdrawn", "Ends when withdrawn"],
                                    ["Not selected in lottery", "No cap-gap", "No cap-gap"],
                                ].map(([scenario, status, work], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">{scenario}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{status}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{work}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What If You're Not Selected in the Lottery?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you're not selected in the H-1B lottery, you still have options:
                    </p>
                    <div className="space-y-3">
                        {[
                            { title: "STEM OPT Extension", desc: "If you have a STEM degree, apply for the 24-month STEM OPT extension to get 2 more lottery attempts." },
                            { title: "Cap-Exempt Employers", desc: "Universities, nonprofits, and government research organizations can sponsor H-1B visas outside the lottery." },
                            { title: "Try Again Next Year", desc: "If your OPT/STEM OPT is still valid, your employer can register you for the lottery again the following year." },
                            { title: "Alternative Visa Categories", desc: "Consider O-1 (extraordinary ability), L-1 (intracompany transfer), or EB-2/EB-3 green card sponsorship." },
                            { title: "Day 1 CPT (Measure of Last Resort)", desc: "Some schools offer Day 1 CPT as a bridge. Consult an immigration attorney — this has risks." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{i + 1}. {item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Can I transition from OPT to H-1B?", answer: "Yes. The most common path is for your employer to register you for the H-1B lottery while you're on OPT. If selected, the cap-gap extension bridges your OPT to the H-1B October 1 start date." },
                            { question: "What is the H-1B cap-gap extension?", answer: "The cap-gap automatically extends your F-1 status and OPT work authorization from your EAD expiration date until October 1 (the H-1B start date), as long as your employer filed a timely H-1B petition requesting change of status." },
                            { question: "How many times can I enter the H-1B lottery?", answer: "There is no limit to the number of times you can be registered for the H-1B lottery, as long as you maintain valid immigration status (e.g., OPT, STEM OPT, or another valid visa)." },
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
                    <Link href="/blog/h1b-cap-gap-extension" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Cap-Gap Extension Explained</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Complete STEM OPT Extension Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/sponsors" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">H-1B Sponsor Database →</Link>
                    <Link href="/compare" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT vs H-1B Comparison →</Link>
                    <Link href="/ai-facts" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">101 Immigration Facts →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Find H-1B Sponsors With Real Data</h2>
                <p className="text-amber-100 mb-6 max-w-lg mx-auto">Search 25,000+ verified H-1B sponsors with approval rates, salary data, and fraud alerts.</p>
                <Link href="/features/sponsors" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-colors">
                    Search Sponsors Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

        </article>
    );
}
