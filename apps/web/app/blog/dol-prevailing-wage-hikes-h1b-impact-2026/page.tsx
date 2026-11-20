import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { getRelatedPostsForSlug } from "@/lib/blog/related-posts";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "DOL Proposes Massive Prevailing Wage Hikes for H-1B: What It Means (2026)",
    description: "The Department of Labor has proposed significant hikes to prevailing wage thresholds for H-1B, E-3, and PERM programs. Learn how this impacts international graduates and employers.",
    keywords: ["H1B prevailing wage 2026", "DOL wage hike H1B", "H1B salary requirements", "Level 1 wage H1B", "PERM wage increase", "OPT to H1B salary"],
    openGraph: {
        title: "DOL Proposes Massive Prevailing Wage Hikes for H-1B | TrackMyOPT",
        description: "How the proposed DOL wage hikes could price recent international graduates out of the H-1B market.",
        url: "https://www.trackmyopt.com/blog/dol-prevailing-wage-hikes-h1b-impact-2026",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "DOL Proposes Massive Prevailing Wage Hikes for H-1B" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/dol-prevailing-wage-hikes-h1b-impact-2026" },
    twitter: {
        card: "summary_large_image",
        title: "DOL Proposes Massive Prevailing Wage Hikes for H-1B | TrackMyOPT",
        description: "How the proposed DOL wage hikes could price recent international graduates out of the H-1B market.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function PrevailingWageArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "DOL Prevailing Wage Hikes", url: "https://www.trackmyopt.com/blog/dol-prevailing-wage-hikes-h1b-impact-2026" },
            ]} />
            <BlogPostSchema 
                title={metadata.title as string} 
                description={metadata.description as string} 
                publishedDate="2026-05-14" 
                modifiedDate="2026-11-20" 
                author="Vinay Kumar" 
                faqItems={[
                    {question: "What is the new DOL prevailing wage rule for H-1B?", answer: "Proposed in March 2026, this rule would raise the prevailing wage that employers must pay to sponsor H-1B, E-3 and PERM green card workers. As of November 20, 2026 it is not final."}, 
                    {question: "How much will H-1B minimum salaries increase?", answer: "Under the proposal, level I would move from about the 17th percentile of wages to the 34th, level II from the 34th to the 52nd, level III from the 50th to the 70th and level IV from the 67th to the 88th. In high-wage areas that is tens of thousands of dollars."} 
                ]} 
            />
            
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">DOL Prevailing Wage Hikes</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Economic Update</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500" aria-hidden="true">·</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    DOL Proposes Massive Prevailing Wage Hikes for H-1B: What It Means (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The Department of Labor is pushing to dramatically increase the minimum salary required for H-1B sponsorship. This article is for international graduates on OPT and employers navigating the escalating costs of foreign talent.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: May 13, 2026 • Updated: November 20, 2026 • Written by Vinay Kumar</div>
            </header>

            <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-12 border border-border shadow-card">
                <BlogPostImage src="/blog/prevailing-wage-hikes.png" alt="Financial chart showing wage increases on a corporate desk" className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>

            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    A March 2026 DOL proposal would raise the percentiles used to set prevailing wages for H-1B and PERM workers. Level I would move from about the 17th percentile to the 34th, which is about where level II sits today. As of November 20, 2026 the rule is not final and not in effect.
                </p>
            </div>

            <div className="border border-border rounded-xl p-6 mb-12 bg-surface">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Table of Contents
                </h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                    <li><a href="#the-proposal" className="hover:underline">1. The DOL Wage Hike Proposal</a></li>
                    <li><a href="#the-numbers" className="hover:underline">2. The Numbers: How Much Will Salaries Jump?</a></li>
                    <li><a href="#impact-on-graduates" className="hover:underline">3. Impact on Recent Graduates (Level 1 Wages)</a></li>
                    <li><a href="#faq" className="hover:underline">4. Frequently Asked Questions</a></li>
                    <li><a href="#conclusion" className="hover:underline">5. Conclusion & Preparation Strategies</a></li>
                </ul>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section id="the-proposal" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The DOL Wage Hike Proposal
                    </h2>
                    <p>
                        On March 27, 2026, the <a href="https://www.dol.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Department of Labor (DOL)</a> published a <a href="https://www.govinfo.gov/content/pkg/FR-2026-03-27/html/2026-06017.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">proposed rule</a> that would change how prevailing wage levels are set.
                    </p>
                    <p>
                        <strong>Status on November 20, 2026:</strong> still a proposal. The comment period closed on May 26, 2026. The law firm Fragomen <a href="https://www.fragomen.com/insights/united-states-dol-final-rule-on-prevailing-wages-now-under-omb-review.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">reported on November 9</a> that the final rule is under White House review. It is not in effect.
                    </p>
                    <p>
                        By law, employers must pay H-1B workers the "prevailing wage" for their specific occupation and geographic location to ensure they are not undercutting U.S. workers. The new rule argues that the current statistical percentiles are artificially low and proposes increases across all four OEWS wage levels.
                    </p>
                </section>

                <section id="the-numbers" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The Numbers: How Much Will Salaries Jump?
                    </h2>
                    <p>
                        Today the four wage levels sit at about the 17th, 34th, 50th and 67th percentile of wages for the occupation and area. The proposed rule moves each one up:
                    </p>
                    <ul>
                        <li><strong>Level 1 (Entry-Level):</strong> From the 17th percentile to the <strong>34th percentile</strong>.</li>
                        <li><strong>Level 2 (Qualified):</strong> From the 34th percentile to the <strong>52nd percentile</strong>.</li>
                        <li><strong>Level 3 (Experienced):</strong> From the 50th percentile to the <strong>70th percentile</strong>.</li>
                        <li><strong>Level 4 (Fully Competent):</strong> From the 67th percentile to the <strong>88th percentile</strong>.</li>
                    </ul>
                    <p>
                        In practical terms: for Software Developers in the San Jose, CA area, the level I wage for July 2026 to June 2027 is <strong>$152,797</strong> and level II is <strong>$187,075</strong>. The proposed level I sits at about the same percentile as today's level II, so the entry-level floor there would move toward the higher figure. The Labor Department has not published wage tables under the proposal.
                    </p>
                </section>

                <section id="impact-on-graduates" className="mb-12">
                    <div className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 rounded-r-xl p-6">
                        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Impact on Recent Graduates
                        </h2>
                        <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-3">
                            This matters most to recent graduates moving from OPT to H-1B. Most new graduates are hired into level I or level II roles.
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                            If the minimum salary for an entry-level role rises by tens of thousands of dollars, some employers, especially startups and mid-sized companies, may stop sponsoring junior roles.
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 text-sm font-bold">
                            Action item: ask about other wage sources. For an H-1B labor condition application, an employer may use an independent wage survey in place of the DOL's OEWS data, if the survey meets DOL criteria.
                        </p>
                    </div>

                    <div className="mt-8 p-6 border rounded-xl flex flex-wrap items-center justify-between gap-4 border-primary-muted bg-primary-soft">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">
                                Look up today's wage levels
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
                                See the current level I to IV wages for your occupation and work area, with 2026-27 examples.
                            </p>
                        </div>
                        <Link href="/blog/h1b-wage-level-by-zip-code-salary" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-button no-underline">
                            Find your wage level
                        </Link>
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Is the DOL prevailing wage hike currently in effect?", answer: "No. As of November 20, 2026, it is a proposed rule. The comment period closed on May 26, 2026, and the law firm Fragomen reported on November 9 that the final rule is under White House review. A final rule would state its own effective date." },
                            { question: "Does this wage hike apply to STEM OPT?", answer: "No. STEM OPT workers must be paid wages commensurate with U.S. workers in similar roles, but they are not strictly bound by the formal LCA/Prevailing Wage system used for H-1B and PERM." },
                            { question: "Will this affect my pending PERM application?", answer: "If finalized, it would affect any new Prevailing Wage Determinations (PWDs) issued by the DOL. If your PWD is already approved, it generally remains valid for its stated duration." },
                        ].map((faq, i) => (
                            <div key={i} className="border p-5 rounded-xl border-border bg-card shadow-card">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="conclusion" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Conclusion & Preparation Strategies</h2>
                    <p>
                        The proposed DOL wage increases would raise the bar for early-career international hires. Together with the weighted H-1B selection, current policy favors higher-paid, more senior workers.
                    </p>
                    <p>
                        <strong>Next Step:</strong> Talk to your HR department now. Ask if your company has a policy on using private wage surveys (like Radford or Willis Towers Watson) for H-1B LCAs if OEWS prevailing wages rise.
                    </p>
                </section>

                
            <RelatedPosts posts={getRelatedPostsForSlug("dol-prevailing-wage-hikes-h1b-impact-2026")} />
            <AuthorBio />
            </div>
        </article>
    );
}
