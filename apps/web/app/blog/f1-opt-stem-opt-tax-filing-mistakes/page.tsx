import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, FileWarning } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Tax Filing Mistakes to Avoid on F-1 OPT/STEM OPT (2026)",
    description: "Avoid the most common F-1 OPT/STEM OPT tax filing mistakes. Learn Form 8843 and 1040-NR errors, FICA withholding issues, tax treaty pitfalls, and how to file correctly.",
    keywords: [
        "F-1 OPT tax mistakes",
        "STEM OPT tax filing mistakes",
        "Form 8843 mistakes",
        "1040-NR errors",
        "FICA refund for F-1 students",
        "international student tax filing"
    ],
    openGraph: {
        title: "Tax Filing Mistakes to Avoid on F-1 OPT/STEM OPT (2026) | TrackMyOPT",
        description: "A practical checklist of F-1 OPT/STEM OPT tax filing mistakes and how to fix them before they cost you money.",
        url: "https://www.trackmyopt.com/blog/f1-opt-stem-opt-tax-filing-mistakes",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Tax Filing Mistakes to Avoid on F-1 OPT/STEM OPT",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/f1-opt-stem-opt-tax-filing-mistakes",
    },
};

const faqItems = [
    {
        question: "Do F-1 OPT/STEM OPT students need to file taxes every year?",
        answer: "Yes, in most cases. If you had US income, you typically file Form 1040-NR and Form 8843. Even with no income, Form 8843 is commonly required.",
    },
    {
        question: "What is the biggest tax mistake international students make?",
        answer: "Filing the wrong form (1040 instead of 1040-NR for nonresident aliens) is one of the most expensive mistakes because it can trigger incorrect tax treatment and delays.",
    },
    {
        question: "Can F-1 students on OPT be exempt from FICA taxes?",
        answer: "Many F-1 students in eligible periods are exempt from Social Security and Medicare taxes. If FICA was withheld in error, you may request a refund from your employer and then from the IRS if needed.",
    },
    {
        question: "Should I skip filing if I earned very little?",
        answer: "No. Low income does not automatically remove filing obligations. Filing correctly protects your record and can help you recover over-withheld taxes.",
    },
    {
        question: "Can I claim tax treaty benefits automatically?",
        answer: "No. Treaty benefits must be applied correctly with proper documentation. Claiming treaty benefits without eligibility can create compliance risk.",
    },
    {
        question: "What should I do if I already filed incorrectly?",
        answer: "Review your residency status, identify the error, and file an amended return where applicable. Keep all supporting records and timelines.",
    },
];

export default function F1OptTaxMistakesBlogPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Tax Filing Mistakes to Avoid on F-1 OPT/STEM OPT", url: "https://www.trackmyopt.com/blog/f1-opt-stem-opt-tax-filing-mistakes" },
            ]} />
            <BlogPostSchema
                title={metadata.title}
                description={metadata.description}
                publishedDate="2026-02-11"
                modifiedDate="2026-02-11"
                author="Vinay Kumar"
                faqItems={faqItems}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Tax Mistakes</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                        TAX & FINANCE
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Tax Filing Mistakes to Avoid on F-1 OPT/STEM OPT (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    A practical, student-friendly checklist of filing errors that can cost you refunds, create IRS notices, or complicate your immigration paperwork.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: February 10, 2026</span>
                    <span>•</span>
                    <span>Updated by TrackMyOPT Tax Team</span>
                </div>
            </header>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <section className="mb-10">
                    <div className="p-5 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-0 mb-3">Quick Answer</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-0">
                            The biggest F-1 OPT/STEM OPT tax mistakes are filing the wrong form, skipping Form 8843, ignoring FICA errors, and misusing tax treaty claims. A correct return is not just about money; it is also a compliance record.
                        </p>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why These Mistakes Matter</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Tax errors can lead to delayed refunds, avoidable penalties, and extra documentation work. For F-1 students, tax paperwork often intersects with future visa applications, travel plans, and employment transitions.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Good tax hygiene keeps your records clean and helps you recover money you are owed.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">10 Common Tax Filing Mistakes to Avoid</h2>
                    <div className="space-y-4">
                        {[
                            "Filing Form 1040 when you should file 1040-NR.",
                            "Skipping Form 8843 because you had little or no income.",
                            "Using tax software that does not support nonresident filings correctly.",
                            "Ignoring Social Security/Medicare (FICA) withholding mistakes.",
                            "Claiming tax treaty benefits without confirming eligibility.",
                            "Reporting wrong residency status (resident vs nonresident alien).",
                            "Missing state tax return requirements where you lived/worked.",
                            "Forgetting to keep W-2, 1042-S, and prior return records.",
                            "Entering incorrect SSN/ITIN, address, or bank details.",
                            "Waiting until deadline week, leaving no time to fix errors.",
                        ].map((item, i) => (
                            <div key={i} className="p-5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
                                <h3 className="font-bold text-red-900 dark:text-red-200 mb-1 flex items-center gap-2">
                                    <FileWarning className="w-4 h-4" />
                                    Mistake #{i + 1}
                                </h3>
                                <p className="text-red-800 dark:text-red-300 text-sm mb-0">{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How to File Safely (Simple Workflow)</h2>
                    <div className="space-y-3">
                        {[
                            "Confirm your tax residency status for the year before choosing forms.",
                            "Collect all documents first: passport details, I-20, W-2, 1042-S, prior filings.",
                            "Prepare federal return (usually 1040-NR + 8843 for many F-1 cases).",
                            "Check whether your state requires a separate return.",
                            "Review for treaty claims, FICA handling, and personal info accuracy.",
                            "Submit early and store PDFs + confirmation receipts in one folder.",
                        ].map((step, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
                                    <strong>Step {i + 1}:</strong> {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">If You Already Made a Mistake</h2>
                    <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
                        <ul className="space-y-2 text-blue-900 dark:text-blue-200 text-sm">
                            <li>Identify whether the issue is a form type error, missing schedule, or withholding issue.</li>
                            <li>Gather supporting documents and draft an amended filing plan.</li>
                            <li>Request employer correction first for payroll/FICA errors when applicable.</li>
                            <li>Track submission dates and keep all confirmations for your records.</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/f1-student-tax-filing-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Student Tax Filing Guide 2026</Link>
                    <Link href="/guides/f1-tax-filing" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Tax Filing Guide</Link>
                    <Link href="/blog/opt-health-insurance-guide-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Health Insurance Guide 2026</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day Unemployment Rule</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Stay Organized for Tax Season</h2>
                <p className="text-green-100 mb-6 max-w-lg mx-auto">
                    Keep your OPT timeline, job records, and compliance docs in one place with TrackMyOPT so tax season is easier each year.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-colors">
                    Get Started <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
