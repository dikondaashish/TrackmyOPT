import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";

export const metadata: Metadata = {
    title: "FY 2027 H-1B Weighted Selection Process Explained (2026 Update)",
    description: "Since FY 2027 the H-1B lottery is weighted by wage level: level IV gets four entries, level III three, level II two and level I one. What that means for OPT students.",
    keywords: ["H1B weighted selection", "H1B FY 2027", "USCIS H1B rules 2026", "H1B lottery 2027", "H1B wage levels", "H1B cap reached 2026"],
    openGraph: {
        title: "FY 2027 H-1B Weighted Selection Process Explained | TrackMyOPT",
        description: "Everything you need to know about the new weighted selection process for the FY 2027 H-1B cap season.",
        url: "https://www.trackmyopt.com/blog/h1b-weighted-selection-process-fy2027",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "FY 2027 H-1B Weighted Selection Process Explained (2026 Update)" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/h1b-weighted-selection-process-fy2027" },
    twitter: {
        card: "summary_large_image",
        title: "FY 2027 H-1B Weighted Selection Process Explained | TrackMyOPT",
        description: "Everything you need to know about the new weighted selection process for the FY 2027 H-1B cap season.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function H1BWeightedSelectionArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "FY 2027 H-1B Weighted Selection Process", url: "https://www.trackmyopt.com/blog/h1b-weighted-selection-process-fy2027" },
            ]} />
            <BlogPostSchema 
                title={metadata.title as string} 
                description={metadata.description as string} 
                publishedDate="2026-03-08" 
                modifiedDate="2026-11-20" 
                author="Vinay Kumar" 
                faqItems={[
                    {question: "What is the H-1B weighted selection process?", answer: "Since the FY 2027 cap season, USCIS weights the H-1B lottery by wage level. A level IV registration is entered four times, level III three times, level II twice and level I once. Every level is in the same pool."}, 
                    {question: "Has the FY 2027 H-1B cap been reached?", answer: "Yes. USCIS announced on July 17, 2026 that it had received enough petitions to reach the 65,000 regular cap and the 20,000 master's cap for FY 2027."} 
                ]} 
            />
            
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">FY 2027 H-1B Weighted Selection</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">H-1B Updates</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500" aria-hidden="true">·</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    FY 2027 H-1B Weighted Selection Process Explained (2026 Update)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The H-1B lottery is no longer purely random. Since FY 2027, a higher wage level means more entries. Here is how it works and what it means for OPT students.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: March 8, 2026 • Updated: November 20, 2026 • Written by Vinay Kumar</div>
            </header>

            <Image
                src="/blog/h1b-weighted-selection.png" 
                alt="Executives reviewing data for H-1B weighted selection" 
                width={1200}
                height={630}
                sizes="(max-width: 896px) 100vw, 896px"
                className="w-full h-[400px] object-cover rounded-xl border border-border shadow-card" 
            />
            <figcaption className="mt-3 mb-12 text-center text-sm text-gray-500 dark:text-gray-400">
                The weighted selection process gives more entries to higher wage levels.
            </figcaption>

            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    USCIS still runs a lottery, but it is weighted. Each registration gets one to four entries, based on the highest OEWS wage level that the offered wage equals or exceeds: four at level IV, three at level III, two at level II and one at level I. Every level can be selected. Higher levels have better odds.
                </p>
            </div>

            {/* Table of Contents */}
            <div className="border border-border rounded-xl p-6 mb-12 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Table of Contents
                </h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                    <li><a href="#how-it-works" className="hover:underline">1. How the Weighted Selection Works</a></li>
                    <li><a href="#cap-reached" className="hover:underline">2. FY 2027 Cap Reached</a></li>
                    <li><a href="#impact" className="hover:underline">3. What This Means for International Students</a></li>
                    <li><a href="#faq" className="hover:underline">4. Frequently Asked Questions</a></li>
                    <li><a href="#conclusion" className="hover:underline">5. Conclusion & Action Steps</a></li>
                </ul>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <BlogProductCTA variant="sponsors" sourcePage="/blog/h1b-weighted-selection-process-fy2027" placement="top" />

                <section id="how-it-works" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How the Weighted Selection Works
                    </h2>
                    <p>
                        A <a href="https://www.govinfo.gov/content/pkg/FR-2025-12-29/html/2025-23853.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">final rule</a> took effect on February 27, 2026 and changed how <a href="https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations/h-1b-cap-season" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">USCIS</a> selects H-1B registrations. Selection is still random, but it is <strong>weighted</strong> by the Occupational Employment and Wage Statistics (OEWS) wage level that the offered wage equals or exceeds.
                    </p>
                    <p>
                        Each registration goes into one pool. The wage level sets how many times it is entered:
                    </p>
                    <ul>
                        <li><strong>Level IV:</strong> 4 entries. DHS projected a <strong>61.16%</strong> chance of selection.</li>
                        <li><strong>Level III:</strong> 3 entries. Projected <strong>45.87%</strong>.</li>
                        <li><strong>Level II:</strong> 2 entries. Projected <strong>30.58%</strong>.</li>
                        <li><strong>Level I:</strong> 1 entry. Projected <strong>15.29%</strong>.</li>
                    </ul>
                    <p>
                        These are the projections DHS gave in the final rule, not results. Under the old random selection it estimated 29.59% for everyone. No level is guaranteed and no level is shut out. Each person counts once toward the cap, however many entries they have.
                    </p>
                    <p>
                        DHS says the goal is to favor higher-skilled and higher-paid workers while keeping the program open to every wage level.
                    </p>
                </section>

                <section id="cap-reached" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        FY 2027 Cap Reached
                    </h2>
                    <div className="border p-5 rounded-xl border-border mb-6 bg-card shadow-card">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Allocations Exhausted
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            On July 17, 2026, <a href="https://www.uscis.gov/newsroom/alerts/uscis-reaches-fiscal-year-2027-h-1b-cap" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">USCIS announced</a> that it had received enough petitions to reach the <strong>65,000</strong> regular cap and the <strong>20,000</strong> master's cap for FY 2027.
                        </p>
                    </div>
                    <p>
                        Registration ran from March 4 to 19, 2026. USCIS finished the weighted selection by March 31, and employers with selected registrations could file petitions from April 1. USCIS has not published selection rates by wage level. For next season, see the <Link href="/blog/h1b-lottery-2027-fy2028" className="text-blue-600 dark:text-blue-400 hover:underline">H-1B lottery 2027 (FY2028) guide</Link>.
                    </p>
                </section>

                <section id="impact" className="mb-12">
                    <div className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 rounded-r-xl p-6">
                        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            What This Means for International Students
                        </h2>
                        <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-3">
                            For recent graduates on OPT, this makes the move to H-1B harder. Many new graduates start at level I or level II wages, so they get one or two entries where an experienced professional gets three or four.
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>Action item:</strong> Use your STEM OPT extension for more tries, ask what salary and wage level your registration will state, and look at cap-exempt employers (universities, nonprofit research organizations), where the lottery does not apply.
                        </p>
                    </div>
                    
                    {/* Practical Tool */}
                    <div className="mt-8 p-6 border rounded-xl flex flex-wrap items-center justify-between gap-4 border-primary-muted bg-primary-soft">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">
                                Cap-exempt employers skip the lottery
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
                                Universities, their nonprofit affiliates and nonprofit or government research organizations can file at any time of year.
                            </p>
                        </div>
                        <Link href="/blog/find-cap-exempt-h1b-employers" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-button no-underline">
                            How to find them
                        </Link>
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "What is the H-1B weighted selection process?", answer: "Since the FY 2027 cap season, USCIS weights the H-1B lottery by OEWS wage level. A level IV registration is entered four times, level III three times, level II twice and level I once. Every level is in the same pool." },
                            { question: "Will level I wage earners still get selected?", answer: "Yes. Level I registrations are in the same pool with one entry each. DHS projected a 15.29% chance at level I. In FY 2027, 17.7% of selected registrations were at level I, according to the law firm Fragomen's report of USCIS figures." },
                            { question: "Does this affect cap-exempt H-1B petitions?", answer: "No. The weighted selection process only applies to the H-1B cap lottery. Cap-exempt employers, such as universities and non-profit research institutes, are unaffected." },
                        ].map((faq, i) => (
                            <div key={i} className="border p-5 rounded-xl border-border bg-card shadow-card">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="conclusion" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Conclusion & Action Steps</h2>
                    <p>
                        The implementation of the weighted selection process permanently changes the H-1B landscape. Higher wage levels have better odds, but no level is guaranteed. Entry-level graduates should plan for more than one try, using STEM OPT or cap-exempt routes.
                    </p>
                    <p>
                        <strong>Next step:</strong> Look up your OEWS wage level with the Labor Department's <a href="https://flag.dol.gov/wage-data/wage-search" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">OFLC Wage Search</a>, then ask your employer what salary and wage level the registration will state. Our <Link href="/blog/h1b-wage-level-by-zip-code-salary" className="text-blue-600 dark:text-blue-400 hover:underline">wage level lookup guide</Link> walks through it.
                    </p>
                </section>
            </div>

            <BlogProductCTA variant="sponsors" sourcePage="/blog/h1b-weighted-selection-process-fy2027" placement="bottom" />

            {/* Related Guides */}
            <div className="border rounded-xl border-border p-6 mt-10 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Updates</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/h1b-lottery-2027-fy2028" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Lottery 2027 (FY2028): Dates, Fee and Odds</Link>
                    <Link href="/blog/dhs-proposes-103265-h1b-fee-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ $103,265 H-1B Fee Proposal: What It Means</Link>
                    <Link href="/blog/h1b-approval-rates-by-company" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Approval Rates by Company</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The OPT to H-1B Transition Guide</Link>
                </div>
            </div>

            <div className="not-prose rounded-xl p-8 text-center text-ink-foreground mt-12 bg-ink border border-ink-border shadow-elevated">
                <h2 className="text-2xl font-bold mb-3">Optimize Your Job Search for the New Rules</h2>
                <p className="text-ink-muted mb-6 max-w-lg mx-auto">Use TrackMyOPT's AI Resume Builder to target higher-level roles and use our sponsor database to find cap-exempt employers.</p>
                <Link href="/features/resume-ai" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-500 shadow-button">
                    Build a Stronger Resume <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
