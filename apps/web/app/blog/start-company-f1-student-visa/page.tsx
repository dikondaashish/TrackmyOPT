import { Metadata } from "next";
import Link from "next/link";
import { Clock, AlertTriangle, FileText, Download, CheckCircle, Lightbulb } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "How to Start a Company on an F-1 Student Visa (Without Violating Your Status)",
    description: "Can an international student start a business in the US? Yes, but with strict limits. Learn how to incorporate and passively invest while on an F-1 visa.",
    keywords: ["start company F1 visa", "F1 student entrepreneur", "passive investment F1", "incorporate LLC international student", "F1 visa business rules"],
    openGraph: {
        title: "How to Start a Company on an F-1 Student Visa | TrackMyOPT",
        description: "The complete guide to legally starting a business as an international student.",
        url: "https://www.trackmyopt.com/blog/start-company-f1-student-visa",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "How to Start a Company on an F-1 Student Visa" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/start-company-f1-student-visa" },
    twitter: {
        card: "summary_large_image",
        title: "How to Start a Company on an F-1 Student Visa | TrackMyOPT",
        description: "The complete guide to legally starting a business as an international student.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function F1StartupArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Start a Company on F-1 Visa", url: "https://www.trackmyopt.com/blog/start-company-f1-student-visa" },
            ]} />
            <BlogPostSchema 
                title={metadata.title as string} 
                description={metadata.description as string} 
                publishedDate="2026-05-25" 
                modifiedDate="2026-05-25" 
                author="Vinay Kumar" 
                faqItems={[
                    {question: "Can an F-1 student register an LLC or C-Corp?", answer: "Yes. An F-1 student can legally register a company, invest money, and hold shares. However, they cannot actively work for or operate the company without proper work authorization."}, 
                    {question: "What is considered active vs. passive involvement?", answer: "Active involvement (illegal on F-1) includes coding the app, making sales calls, or managing employees. Passive involvement (legal) means acting solely as an investor or shareholder."} 
                ]} 
            />
            
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">Start a Company on F-1</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Entrepreneurship Series: Part 1</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    How to Start a Company on an F-1 Student Visa (Without Violating Your Status)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    You have a billion-dollar idea, but you are studying in the US on an F-1 visa. This article is for international students who want to build a startup without risking deportation.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: May 25, 2026 • Written by Vinay Kumar</div>
            </header>

            <figure className="mb-12">
                <img 
                    src="/blog/f1-startup.png" 
                    alt="F-1 student reviewing incorporation documents in a library" 
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" 
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    While studying on an F-1 visa, your involvement in any U.S. business must remain strictly passive.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Yes, you can incorporate a company (LLC or C-Corp) and own equity while on an F-1 visa. However, you can only be a <strong>passive investor</strong>. You cannot "work" for your own company (e.g., coding, marketing, sales) until you transition to OPT.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Table of Contents
                </h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                    <li><a href="#incorporation" className="hover:underline">1. The Legality of Incorporation</a></li>
                    <li><a href="#active-vs-passive" className="hover:underline">2. Active vs. Passive Involvement</a></li>
                    <li><a href="#cpt-loophole" className="hover:underline">3. Can I use CPT to work for my startup?</a></li>
                    <li><a href="#faq" className="hover:underline">4. Frequently Asked Questions</a></li>
                    <li><a href="#conclusion" className="hover:underline">5. Conclusion & Action Steps</a></li>
                </ul>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section id="incorporation" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        The Legality of Incorporation
                    </h2>
                    <p>
                        There is no U.S. law preventing a foreign national from owning a business or buying property in the United States. As an F-1 student, you have the absolute legal right to:
                    </p>
                    <ul>
                        <li>Register a C-Corp or LLC (e.g., in Delaware).</li>
                        <li>Own shares or equity in that company.</li>
                        <li>Receive profits or dividends as a passive shareholder.</li>
                        <li>Open a business bank account using an <a href="https://www.irs.gov/businesses/small-businesses-self-employed/how-to-apply-for-an-ein" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">IRS Employer Identification Number (EIN)</a>.</li>
                    </ul>
                    <p>
                        The restriction lies entirely in <strong>employment law</strong>. According to <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/students-and-employment" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">USCIS F-1 employment regulations</a>, F-1 students are strictly prohibited from working off-campus without specific permission (CPT or OPT). 
                    </p>
                </section>

                <section id="active-vs-passive" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Active vs. Passive Involvement
                    </h2>
                    <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 mb-6">
                        <h3 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Illegal: Active Work
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            Even if you are not taking a salary, you cannot actively run the business. You cannot write code for the app, pitch to clients, negotiate contracts, or hire employees. Doing "unpaid" work for your own company is considered unauthorized employment by USCIS.
                        </p>
                    </div>
                    <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 mb-6">
                        <h3 className="font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Legal: Passive Investment
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            You can provide capital (money) to the business, attend board meetings to review the financials of your investment, and vote as a shareholder.
                        </p>
                    </div>
                </section>

                <section id="cpt-loophole" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Can I use CPT to work for my startup?
                    </h2>
                    <p>
                        Some students attempt to use Curricular Practical Training (CPT) to work for their own company. While technically possible, it is incredibly risky and highly scrutinized by universities. Most DSOs will refuse to authorize CPT for a student's own company because CPT requires a formal employer-employee relationship and a supervisor to evaluate your learning. You cannot be your own supervisor.
                    </p>

                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                                <Download className="w-5 h-5" /> Free F-1 Incorporation Checklist
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
                                Download our detailed PDF checklist of legal Do&apos;s and Don&apos;ts, a step-by-step incorporation roadmap, and a quick-reference table for setting up a Delaware C-Corp while on an F-1 visa.
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5 inline-block -mt-0.5" /> 2-page PDF • 21 checkpoints • Updated June 2026</p>
                        </div>
                        <a
                            href="/templates/f1-incorporation-checklist.pdf"
                            download="TrackMyOPT-F1-Incorporation-Checklist.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2 shrink-0"
                        >
                            <Download className="w-4 h-4" /> Download Free PDF
                        </a>
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Can I be the CEO of my startup on an F-1 visa?", answer: "No. The role of CEO implies active management and operation of the company. You must hire a U.S. citizen, permanent resident, or someone with valid work authorization to be the active CEO/manager." },
                            { question: "Do I need an SSN to incorporate a business?", answer: "No. You can incorporate a business and obtain an Employer Identification Number (EIN) from the IRS without a Social Security Number (SSN)." },
                            { question: "What happens if I get caught working for my startup?", answer: "Engaging in unauthorized work violates your F-1 status. You could face immediate deportation, cancellation of your visa, and severe bans from re-entering the United States." },
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
                        Starting a company while studying in the U.S. requires extreme caution. While you can lay the legal groundwork and incorporate the entity, you must keep your hands completely off the day-to-day operations until you secure work authorization.
                    </p>
                    <p>
                        <strong>Next Step:</strong> Focus on building your business plan and finding a U.S. co-founder who can actively build the product while you finish your degree. Once you graduate, you can apply for OPT and officially join your own startup as an active employee. Read Part 2 of this series to learn how!
                    </p>
                </section>
            </div>
            
            <AuthorBio />

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Read The Rest of the Series</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/start-company-f1-opt-visa" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Part 2: Starting a Company on OPT</Link>
                    <Link href="/blog/start-company-f1-stem-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Part 3: Running a Startup on STEM OPT</Link>
                </div>
            </div>
        </article>
    );
}
