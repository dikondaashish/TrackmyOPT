import { Metadata } from "next";
import Link from "next/link";
import { Clock, AlertTriangle, FileText, Download, Briefcase } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "The Founder's Guide to Starting a Company on F-1 OPT (2026)",
    description: "Did you know you can be self-employed on OPT? Learn how to legally work for your own startup during your initial 12-month OPT period.",
    keywords: ["start company OPT", "self-employed OPT", "OPT founder", "international founder USA", "own business OPT", "F1 entrepreneur"],
    openGraph: {
        title: "The Founder's Guide to Starting a Company on F-1 OPT | TrackMyOPT",
        description: "How to legally work for your own startup during your 12-month OPT.",
        url: "https://www.trackmyopt.com/blog/start-company-f1-opt-visa",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "The Founder's Guide to Starting a Company on F-1 OPT" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/start-company-f1-opt-visa" },
};

export default function OPTStartupArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Start a Company on OPT", url: "https://www.trackmyopt.com/blog/start-company-f1-opt-visa" },
            ]} />
            <BlogPostSchema 
                title={metadata.title as string} 
                description={metadata.description as string} 
                publishedDate="2026-05-22" 
                modifiedDate="2026-05-22" 
                author="Vinay Kumar" 
                faqItems={[
                    {question: "Can I be self-employed on standard 12-month OPT?", answer: "Yes! During your initial 12-month post-completion OPT, you are allowed to be self-employed or start your own business, as long as the work is directly related to your major field of study."}, 
                    {question: "Do I need to pay myself a salary on OPT?", answer: "No. On the standard 12-month OPT, employment can be unpaid or you can work for your own unfunded startup, provided you work at least 20 hours per week."} 
                ]} 
            />
            
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">Start a Company on OPT</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Entrepreneurship Series: Part 2</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />7 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    The Founder's Guide to Starting a Company on F-1 OPT
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Once you receive your EAD card, the rules completely change. This article is for recent graduates who want to use their initial 12-month OPT to build a startup as an active founder.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: May 22, 2026 • Written by Vinay Kumar</div>
            </header>

            <figure className="mb-12">
                <img 
                    src="/blog/f1-opt-startup.png" 
                    alt="Young entrepreneur standing confidently in a modern coworking space" 
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" 
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    The initial 12-month OPT provides the only window where self-employment is explicitly permitted for F-1 students.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    During your first 12 months of post-completion OPT, you are explicitly allowed to be self-employed and work full-time for your own startup. The business <strong>must</strong> be directly related to your college degree, and you must work at least 20 hours a week to avoid unemployment days.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Table of Contents
                </h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                    <li><a href="#the-golden-window" className="hover:underline">1. The 12-Month Golden Window</a></li>
                    <li><a href="#the-degree-rule" className="hover:underline">2. The "Directly Related" Rule</a></li>
                    <li><a href="#proof-of-business" className="hover:underline">3. Proving Your Business Exists to USCIS</a></li>
                    <li><a href="#faq" className="hover:underline">4. Frequently Asked Questions</a></li>
                    <li><a href="#conclusion" className="hover:underline">5. Conclusion & Action Steps</a></li>
                </ul>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section id="the-golden-window" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        The 12-Month Golden Window
                    </h2>
                    <p>
                        The initial 12 months of Optional Practical Training (OPT) is the most flexible work authorization you will ever have in the United States. Unlike the H-1B or STEM OPT, <a href="https://www.ice.gov/sevis/practical-training" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">ICE regulations for standard OPT</a> explicitly allow for <strong>self-employment</strong>.
                    </p>
                    <p>
                        This means you can incorporate an LLC or C-Corp, name yourself the CEO or Founder, and actively work day-and-night building your product, pitching to investors, and making sales. Furthermore, because standard OPT allows for unpaid employment, you do not need to have funding or pay yourself a salary. Just ensure you work at least 20 hours per week.
                    </p>
                </section>

                <section id="the-degree-rule" className="mb-12">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            The "Directly Related" Rule
                        </h2>
                        <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-3">
                            The single most important rule is that your startup's core business activity must be <strong>directly related</strong> to your major field of study. 
                        </p>
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            If you graduated with a Computer Science degree, starting a B2B SaaS software company is perfectly fine. If you graduated with a degree in Biology, opening an e-commerce store selling t-shirts is a violation of your OPT status.
                        </p>
                    </div>
                </section>

                <section id="proof-of-business" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Proving Your Business Exists to USCIS
                    </h2>
                    <p>
                        When you report your self-employment to your university's DSO, you must provide proof that your business is legitimate. If USCIS ever issues a Request for Evidence (RFE) during a future visa application, you will need to produce documents proving your business was operational and related to your degree, per <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">USCIS OPT guidelines</a>.
                    </p>
                    <p>Keep a "Compliance Binder" containing:</p>
                    <ul>
                        <li>Articles of Incorporation / LLC Formation documents.</li>
                        <li>An Employer Identification Number (EIN) from the IRS.</li>
                        <li>A business bank account in the company's name.</li>
                        <li>Client contracts, pitch decks, or a working website.</li>
                        <li>A log proving you are working at least 20 hours per week.</li>
                    </ul>

                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                                <Download className="w-5 h-5" /> Free Founder's Compliance Log
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
                                Download our Excel template to log your weekly 20+ hours of self-employment to satisfy OPT reporting requirements.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
                            Download Excel
                        </button>
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Do I need a co-founder with a Green Card?", answer: "No. For the initial 12-month OPT, you can be a solo founder and own 100% of your business without needing a U.S. citizen co-founder." },
                            { question: "Can I raise VC funding on OPT?", answer: "Yes. You can pitch to Venture Capitalists and raise funding. However, many VCs prefer you to have a long-term visa strategy (like an O-1 or H-1B) before writing a check." },
                            { question: "Can I transition my OPT startup to STEM OPT?", answer: "This is where it gets very complicated. STEM OPT prohibits self-employment. To keep running your startup on STEM OPT, you must radically restructure your company. See Part 3 of this series." },
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
                        The 12-month OPT period is an incredible opportunity to launch your dream company. You have full legal clearance to be self-employed, hustle full-time, and act as a CEO—as long as the business aligns with your degree.
                    </p>
                    <p>
                        <strong>Next Step:</strong> Register your business, get your EIN, and ensure you report your self-employment in the SEVP portal before you hit your 90 days of unemployment. Once your startup gains traction, immediately start planning for your STEM OPT or H-1B transition.
                    </p>
                </section>
            </div>

            <AuthorBio />

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Read The Rest of the Series</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/start-company-f1-student-visa" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Part 1: Starting a Company on F-1 (Studying)</Link>
                    <Link href="/blog/start-company-f1-stem-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Part 3: Running a Startup on STEM OPT</Link>
                </div>
            </div>
        </article>
    );
}
