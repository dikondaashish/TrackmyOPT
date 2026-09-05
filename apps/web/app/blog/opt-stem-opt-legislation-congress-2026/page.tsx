import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, AlertTriangle, FileText, Download, CheckCircle, Scale } from "lucide-react";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { getRelatedPostsForSlug } from "@/lib/blog/related-posts";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "Dueling Congress Bills Target OPT & STEM OPT: What You Need to Know (2026)",
    description: "New 2026 legislation in Congress targets the OPT program. While some bills aim to restrict it, bipartisan efforts are pushing to protect and codify OPT into federal law.",
    keywords: ["OPT legislation 2026", "STEM OPT congress bill", "protect OPT act", "eliminate OPT bill", "F1 student visa laws", "international student congress"],
    openGraph: {
        title: "Dueling Congress Bills Target OPT & STEM OPT | TrackMyOPT",
        description: "Explore the current legislative battle in Congress over the future of the Optional Practical Training (OPT) program.",
        url: "https://www.trackmyopt.com/blog/opt-stem-opt-legislation-congress-2026",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "Dueling Congress Bills Target OPT & STEM OPT: What You Need to Know (2026)" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/opt-stem-opt-legislation-congress-2026" },
    twitter: {
        card: "summary_large_image",
        title: "Dueling Congress Bills Target OPT & STEM OPT | TrackMyOPT",
        description: "Explore the current legislative battle in Congress over the future of the Optional Practical Training (OPT) program.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function OPTCongressArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "OPT Legislation in Congress", url: "https://www.trackmyopt.com/blog/opt-stem-opt-legislation-congress-2026" },
            ]} />
            <BlogPostSchema 
                title={metadata.title as string} 
                description={metadata.description as string} 
                publishedDate="2026-05-22" 
                modifiedDate="2026-05-22" 
                author="Vinay Kumar" 
                faqItems={[
                    {question: "Is Congress trying to cancel OPT?", answer: "There are currently dueling legislative efforts. While some lawmakers have introduced bills aiming to restrict or pause OPT to protect domestic workers, a bipartisan coalition has introduced legislation to permanently codify and protect OPT in federal law."}, 
                    {question: "Will the OPT program be eliminated in 2026?", answer: "It is highly unlikely to be eliminated overnight. The OPT program has survived decades of legal and legislative challenges. However, the current political climate means the program is under intense scrutiny."} 
                ]} 
            />
            
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">OPT Legislation in Congress</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">Legislative News</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />6 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Dueling Congress Bills Target OPT & STEM OPT: What You Need to Know (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The Optional Practical Training (OPT) program has become a major legislative battleground. This article is for universities, employers, and international students tracking the political future of post-graduate work authorization.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: May 21, 2026 • Written by Vinay Kumar</div>
            </header>

            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-12 shadow-lg border border-gray-200 dark:border-zinc-800">
                <BlogPostImage src="/blog/opt-congress-bills.png" alt="US Capitol building with legislation documents" className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Two completely opposing movements are clashing in Congress over OPT. Restrictionist bills are seeking to pause or heavily limit the program, while a strong bipartisan coalition, backed by the tech industry and higher education, is pushing the "Protect OPT Act" to formally codify the program into law and shield it from executive branch interference.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Table of Contents
                </h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                    <li><a href="#the-threat" className="hover:underline">1. The Threat: Restrictionist Legislation</a></li>
                    <li><a href="#the-defense" className="hover:underline">2. The Defense: The Protect OPT Act</a></li>
                    <li><a href="#tech-industry" className="hover:underline">3. Why Big Tech is Fighting Back</a></li>
                    <li><a href="#faq" className="hover:underline">4. Frequently Asked Questions</a></li>
                    <li><a href="#conclusion" className="hover:underline">5. Conclusion & Action Steps</a></li>
                </ul>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section id="the-threat" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        The Threat: Restrictionist Legislation
                    </h2>
                    <p>
                        A faction of lawmakers has recently introduced bills aimed at severely restricting the OPT program. The core argument of these bills is that OPT provides a tax loophole for employers (since OPT workers are exempt from FICA taxes) and allegedly undercuts domestic U.S. graduates in the entry-level job market.
                    </p>
                    <p>
                        These restrictionist bills aim to:
                    </p>
                    <ul>
                        <li>Pause the issuance of all new OPT and STEM OPT EAD cards for 1-2 years.</li>
                        <li>Require employers to pay higher prevailing wages to OPT students.</li>
                        <li>Eliminate the FICA tax exemption to make hiring international students more expensive.</li>
                    </ul>
                </section>

                <section id="the-defense" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        The Defense: The Protect OPT Act
                    </h2>
                    <p>
                        In direct response, a powerful bipartisan coalition has introduced legislation aimed at permanently protecting the program. Currently, OPT exists primarily through regulatory frameworks created by the Department of Homeland Security (DHS), which makes it vulnerable to executive action and lawsuits.
                    </p>
                    <p>
                        The <strong>Protect OPT Act</strong> would formally codify the 12-month standard OPT and the 24-month STEM OPT extension directly into federal immigration law. This would effectively permanently insulate the program from being dismantled by presidential executive orders or agency policy memos.
                    </p>
                </section>

                <section id="tech-industry" className="mb-12">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Why Big Tech is Fighting Back
                        </h2>
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-3">
                            The U.S. technology sector and higher education lobbies are heavily backing the Protect OPT Act. Data from the National Foundation for American Policy (NFAP) shows that international students account for over <strong>70%</strong> of full-time graduate students in critical fields like computer science and electrical engineering at U.S. universities.
                        </p>
                        <p className="text-blue-800 dark:text-blue-200 text-sm font-bold">
                            Tech companies have bluntly warned Congress that eliminating OPT will simply force them to move jobs to Canada, the UK, and Australia, where post-study work visas are more accessible.
                        </p>
                    </div>

                    <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-2">
                                <Download className="w-5 h-5" /> Free OPT Advocacy Toolkit
                            </h3>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mb-0">
                                Download our ZIP file containing letter templates you can send to your local representatives to support the Protect OPT Act.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap">
                            Download ZIP
                        </button>
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Are my current OPT or STEM OPT benefits at risk?", answer: "Currently, no. The bills are merely proposals and have not been passed into law. Even if a restrictionist bill were to pass, it would likely face immediate injunctions in federal court." },
                            { question: "What is the likelihood of the Protect OPT Act passing?", answer: "In a heavily divided Congress, immigration legislation is notoriously difficult to pass. However, the Protect OPT Act has strong bipartisan support and backing from the influential U.S. Chamber of Commerce." },
                            { question: "How can international students get involved?", answer: "While non-citizens cannot vote, you can legally participate in advocacy. You can write to the representative of the district where your university or employer is located, detailing your economic contributions to the community." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="conclusion" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Conclusion & Action Steps</h2>
                    <p>
                        The OPT program remains the crucial bridge between U.S. higher education and the global workforce. While it is currently secure, its future will depend on whether lawmakers choose to codify it or allow restrictionist momentum to build.
                    </p>
                    <p>
                        <strong>Next Step:</strong> Use our Advocacy Toolkit to email your local representative and urge them to co-sponsor the Protect OPT Act, ensuring the U.S. remains the top destination for global talent.
                    </p>
                </section>

                
            <RelatedPosts posts={getRelatedPostsForSlug("opt-stem-opt-legislation-congress-2026")} />
            <AuthorBio />
            </div>
        </article>
    );
}
