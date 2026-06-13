import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, Download, CheckCircle, Target } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Can You Run a Startup on STEM OPT? The E-Verify Rules Explained (2026)",
    description: "Unlike standard OPT, STEM OPT explicitly forbids self-employment. Learn how founders restructure their startups with a Board of Directors to qualify for STEM OPT.",
    keywords: ["start company STEM OPT", "STEM OPT entrepreneur", "STEM OPT self-employment", "STEM OPT Board of Directors", "startup E-Verify STEM OPT"],
    openGraph: {
        title: "Can You Run a Startup on STEM OPT? | TrackMyOPT",
        description: "The complex rules of keeping your startup alive when transitioning to the 24-month STEM OPT extension.",
        url: "https://www.trackmyopt.com/blog/start-company-f1-stem-opt",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "Can You Run a Startup on STEM OPT?" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/start-company-f1-stem-opt" },
};

export default function STEMOPTStartupArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Start a Company on STEM OPT", url: "https://www.trackmyopt.com/blog/start-company-f1-stem-opt" },
            ]} />
            <BlogPostSchema 
                title={metadata.title as string} 
                description={metadata.description as string} 
                publishedDate="2026-06-12" 
                modifiedDate="2026-06-12" 
                author="TrackMyOPT Team" 
                faqItems={[
                    {question: "Can I be self-employed on STEM OPT?", answer: "No. DHS regulations explicitly forbid self-employment and sole proprietorships on the 24-month STEM OPT extension. You must have a bona fide employer-employee relationship."}, 
                    {question: "Can I work for my own startup on STEM OPT?", answer: "Only if you restructure the company. You must establish a Board of Directors or an independent hiring manager who has the authority to hire, fire, and supervise you, proving you are an 'employee' of the entity."} 
                ]} 
            />
            
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white truncate">Start a Company on STEM OPT</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">Entrepreneurship Series: Part 3</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Can You Run a Startup on STEM OPT? The Employer Rules Explained
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Transitioning a self-employed startup from standard OPT to the 24-month STEM extension is notoriously difficult. This article is for founders navigating the strict E-Verify and supervision regulations.
                </p>
                <div className="mt-6 text-sm text-gray-500">Published: June 12, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <figure className="mb-12">
                <img 
                    src="/blog/f1-stem-opt-startup.png" 
                    alt="Tech startup founder presenting to investors in a modern boardroom" 
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" 
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    To transition a startup to STEM OPT, you must restructure the entity so that you are supervised by an independent board or manager.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / The Bottom Line</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Self-employment is strictly prohibited on STEM OPT. To work for your own company, you must prove a <strong>bona fide employer-employee relationship</strong>. This requires restructuring your startup with an independent Board of Directors that has the authority to fire you, and your company must be enrolled in E-Verify and pay you a salary.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Table of Contents
                </h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400 text-sm">
                    <li><a href="#the-prohibition" className="hover:underline">1. The Self-Employment Prohibition</a></li>
                    <li><a href="#employer-employee" className="hover:underline">2. The "Employer-Employee" Restructure</a></li>
                    <li><a href="#i983-and-everify" className="hover:underline">3. E-Verify and the I-983 Training Plan</a></li>
                    <li><a href="#faq" className="hover:underline">4. Frequently Asked Questions</a></li>
                    <li><a href="#conclusion" className="hover:underline">5. Conclusion & Action Steps</a></li>
                </ul>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
                <section id="the-prohibition" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        The Self-Employment Prohibition
                    </h2>
                    <p>
                        While the first 12 months of OPT allow for the ultimate freedom of self-employment, the Department of Homeland Security (DHS) explicitly bans self-employment and sole proprietorships on the 24-month STEM OPT extension, as outlined in the <a href="https://studyinthestates.dhs.gov/stem-opt-hub" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">official DHS STEM OPT Hub</a>.
                    </p>
                    <p>
                        The core requirement of STEM OPT is that a student receives formal training and supervision from a superior. If you own 100% of the company and report to no one, you cannot legally supervise yourself or sign your own training documents.
                    </p>
                </section>

                <section id="employer-employee" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The "Employer-Employee" Restructure
                    </h2>
                    <p>
                        To legally work for your own startup on STEM OPT, the company must be a separate legal entity (like a C-Corp), and you must be an <em>employee</em> of that entity. How do you prove this to USCIS?
                    </p>
                    <ul>
                        <li><strong>A Board of Directors:</strong> You must establish an independent board or appoint a CEO/manager who has the power to supervise your work, evaluate your performance, and <em>fire you</em> if necessary.</li>
                        <li><strong>Outside Investors:</strong> Giving up equity to venture capitalists or angel investors helps prove that the company is controlled by entities other than yourself.</li>
                        <li><strong>Paid Salary:</strong> You can no longer work for free. You must be paid a salary commensurate with similarly situated U.S. workers in your area.</li>
                    </ul>
                </section>

                <section id="i983-and-everify" className="mb-12">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            E-Verify and the I-983 Training Plan
                        </h2>
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-3">
                            Your startup must be officially enrolled in the government's <a href="https://www.e-verify.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">E-Verify program</a> to sponsor your STEM OPT.
                        </p>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                            Additionally, you must complete the Form I-983 Training Plan. <strong>You cannot sign this form as the employer.</strong> A member of the Board of Directors, a Co-Founder with a Green Card/Citizenship, or your appointed supervisor must sign the document confirming they will oversee your training.
                        </p>
                    </div>

                    <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1 flex items-center gap-2">
                                <Download className="w-5 h-5" /> STEM OPT Founder's Restructure Checklist
                            </h3>
                            <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-0">
                                Download our step-by-step checklist to prepare your startup's corporate structure for STEM OPT compliance.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap">
                            Download PDF
                        </button>
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "What if I can't afford to pay myself a salary?", answer: "Then your startup cannot sponsor your STEM OPT. DHS requires that STEM OPT employment be paid. If the company lacks funding to pay you, you must find a different STEM-eligible employer to maintain your status." },
                            { question: "Can another international student be my supervisor?", answer: "Generally, no. The person signing the I-983 should ideally be a U.S. citizen, permanent resident, or someone with long-term work authorization who holds a senior managerial position over you." },
                            { question: "Is it easier to just apply for an O-1 visa?", answer: "For many founders, yes. If your startup has raised venture capital, been accepted into an accelerator (like Y Combinator), or you have strong press, pivoting to an O-1A 'Extraordinary Ability' visa often bypasses the strict STEM OPT employer rules." },
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
                        Keeping your startup alive while transitioning to STEM OPT is a complex legal dance. You must fundamentally shift from being an independent owner-operator to being an employee accountable to a Board of Directors.
                    </p>
                    <p>
                        <strong>Next Step:</strong> Do not wait until your 12-month OPT is expiring. Restructuring a C-Corp, appointing a board, securing funding for your salary, and enrolling in E-Verify takes months. Start working with a corporate immigration attorney at least 6 months before your OPT expires.
                    </p>
                </section>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Read The Rest of the Series</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/start-company-f1-student-visa" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Part 1: Starting a Company on F-1 (Studying)</Link>
                    <Link href="/blog/start-company-f1-opt-visa" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Part 2: Starting a Company on OPT</Link>
                </div>
            </div>
        </article>
    );
}
