import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, FileText, CheckCircle2, BookOpen, Calendar, Home, Briefcase } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "OPT & STEM OPT Reporting Requirements: Complete DSO Guide (2026)",
    description: "Learn what F-1 students must report to their DSO and SEVIS during OPT and STEM OPT. Compliance deadlines, residential address changes, and employment updates.",
    keywords: ["OPT reporting requirements", "STEM OPT reporting", "SEVIS update DSO", "10-day reporting rule OPT", "update address SEVIS", "validate STEM OPT"],
    openGraph: {
        title: "OPT & STEM OPT Reporting Requirements: Complete DSO Guide | TrackMyOPT",
        description: "Full guide on F-1 reporting rules during OPT & STEM OPT. Learn what to report, how to report, and critical deadlines.",
        url: "https://www.trackmyopt.com/blog/opt-reporting-requirements-dso",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/opt-reporting-requirements.png",
                width: 1200,
                height: 630,
                alt: "Immigration documents, Form I-20, passport, and reporting checklists on advisor's desk",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/opt-reporting-requirements-dso",
    },
    twitter: {
        card: "summary_large_image",
        title: "OPT & STEM OPT Reporting Requirements: Complete DSO Guide | TrackMyOPT",
        description: "Full guide on F-1 reporting rules during OPT & STEM OPT. Learn what to report, how to report, and critical deadlines.",
        images: ["/blog/opt-reporting-requirements.png"],
    },
};

export default function OPTReportingRequirements() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "OPT Reporting Requirements", url: "https://www.trackmyopt.com/blog/opt-reporting-requirements-dso" },
            ]} />
            <BlogPostSchema
                title="OPT & STEM OPT Reporting Requirements: Complete DSO Guide"
                description="Everything F-1 students must report to their DSO during post-completion OPT and STEM OPT."
                publishedDate="2026-04-21"
                modifiedDate="2026-04-21"
                author="Vinay Kumar"
                faqItems={[
                    { question: "What is the 10-day reporting rule on OPT?", answer: "Under 8 CFR § 214.2(f)(12), F-1 students on OPT must report any changes to their legal name, residential address, employer name, or employer address within 10 days of the change." },
                    { question: "What do STEM OPT students need to report every 6 months?", answer: "STEM OPT students must submit a validation report to their DSO every 6 months to confirm that their residential address and employer information in SEVIS are correct." },
                    { question: "Do I need to submit a new Form I-983 if I change employers?", answer: "Yes. STEM OPT students must submit a newly completed Form I-983 signed by their new employer to their DSO within 10 days of starting the new job." },
                    { question: "What happens if I forget to report my employment on OPT?", answer: "If you do not report employment, the SEVIS system will continue to deduct your 90 allowed unemployment days. Once you exceed 90 days, DHS may automatically terminate your SEVIS record." },
                ]}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">OPT Reporting Guide</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        OPT Compliance
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT & STEM OPT Reporting Requirements: Complete DSO Guide
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Maintaining status on OPT requires strict reporting discipline. From updating your residential address to validating your STEM OPT employment, here is the comprehensive guide on what, when, and how to report.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: April 21, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            <figure className="mb-12">
                <img
                    src="/blog/opt-reporting-requirements.png"
                    alt="Immigration documents, Form I-20, passport, and reporting checklists on advisor's desk"
                    className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"
                />
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    Keep a log of all submitted reporting changes for your permanent personal immigration records.
                </figcaption>
            </figure>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    You must report changes to your <strong>name, address, or employer within 10 days</strong>. If you are on STEM OPT, you must also complete <strong>6-month validation reports</strong> and <strong>annual self-evaluations</strong> using Form I-983. Report these via the SEVP Portal or directly to your DSO.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    The 10-day window starts from the actual day the change occurs (e.g., your first day of work or the day you move), not when you receive confirmation.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://studyinthestates.dhs.gov/students/reporting-rules-during-opt" target="_blank" rel="noopener noreferrer" className="underline">DHS Study in the States</a>
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#reporting-timeline", "OPT Reporting Timeline Checklist"],
                        ["#what-to-report", "What Changes Must Be Reported?"],
                        ["#how-to-report", "How to File Your Reports"],
                        ["#stem-opt-validation", "STEM OPT Validation & Evaluation Schedule"],
                        ["#consequences", "Consequences of Late or Missing Reports"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="reporting-timeline" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        OPT Reporting Timeline Checklist
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Use this timeline checklist to stay compliant throughout your post-completion OPT and STEM OPT:
                    </p>
                    <div className="space-y-3">
                        {[
                            { title: "Within 10 Days of Moving", desc: "Report your new residential address and mailing address." },
                            { title: "Within 10 Days of Starting Work", desc: "Report employer name, EIN, address, job title, and relation to major." },
                            { title: "Every 6 Months (STEM OPT only)", desc: "Submit validation report confirming current address and employment information." },
                            { title: "At 12 Months (STEM OPT only)", desc: "Submit first annual evaluation (page 5 of Form I-983) signed by employer." },
                            { title: "At 24 Months (STEM OPT only)", desc: "Submit final self-evaluation (page 5 of Form I-983) upon program completion." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-950 dark:text-white">{item.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="what-to-report" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Changes Must Be Reported?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Federal regulations require you to keep your SEVIS profile accurate. You must report:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-2">
                                <Home className="w-4 h-4 text-indigo-500" />
                                Personal Changes
                            </h4>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• New home address</li>
                                <li>• Change of legal name</li>
                                <li>• Primary phone number</li>
                                <li>• Active email address</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-2 mb-2">
                                <Briefcase className="w-4 h-4 text-teal-500" />
                                Employment Changes
                            </h4>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Employer legal name</li>
                                <li>• Employment address</li>
                                <li>• Loss of employment</li>
                                <li>• Change in hours per week</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Track Deadlines Automatically</h3>
                        </div>
                        <p className="text-blue-100 mb-6 text-lg max-w-2xl">
                            TrackMyOPT sends automated alerts for your 6-month validation reports and annual self-evaluation milestones so you never miss a deadline.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/sevp-portal-guide-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ SEVP Portal Setup Guide</Link>
                    <Link href="/blog/can-you-work-remotely-on-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Remote Work Compliance Guide</Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
