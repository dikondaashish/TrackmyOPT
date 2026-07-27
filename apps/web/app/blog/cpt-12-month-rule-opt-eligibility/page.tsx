import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Should I Use 11 Months of CPT? The OPT 12-Month Rule",
    description: "Should you use 11 months of CPT? Learn when full-time CPT blocks post-completion OPT, why part-time CPT is different, and how to verify your CPT history.",
    keywords: ["should I use 11 months of CPT", "CPT 12 month rule", "does CPT affect OPT", "full-time CPT", "part-time CPT", "OPT eligibility"],
    openGraph: {
        title: "Should I Use 11 Months of CPT? The OPT 12-Month Rule",
        description: "Understand the one-year full-time CPT bar, how part-time CPT is treated, and why your DSO should verify your authorization history before you approach the limit.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/cpt-12-month-rule-opt-eligibility",
        images: [
            {
                url: "/blog/cpt-12-month-rule.png",
                width: 1200,
                height: 630,
                alt: "Desk calendar showing exactly 12 months marked off with a red pen and student ID",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/cpt-12-month-rule-opt-eligibility",
    }
};

const CPT_FAQS = [
    {
        question: "Should I use 11 months of full-time CPT?",
        answer: "Eleven months of authorized full-time CPT generally does not reach the regulatory bar of one year or more, but do not plan from an estimate. Ask your DSO to review every CPT authorization at your current education level before approving another period.",
    },
    {
        question: "Does 12 months of full-time CPT make me ineligible for OPT?",
        answer: "Yes. ICE states that an F-1 student who has 12 months or more of full-time CPT is ineligible for post-completion OPT at that education level.",
    },
    {
        question: "Does part-time CPT affect OPT eligibility?",
        answer: "Part-time CPT does not count toward the one-year full-time CPT bar. It must still be authorized by your DSO and comply with all F-1 and school requirements.",
    },
    {
        question: "Is CPT time subtracted from my 12 months of OPT?",
        answer: "No. CPT is not deducted day by day from post-completion OPT. The separate rule is that one year or more of full-time CPT makes you ineligible for post-completion OPT at that education level.",
    },
] as const;

export default function CPT12MonthRulePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "CPT 12-Month Rule", url: "https://www.trackmyopt.com/blog/cpt-12-month-rule-opt-eligibility" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-01-31"
                modifiedDate="2026-07-27"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
                faqItems={[...CPT_FAQS]}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">CPT Basics</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Should I Use 11 Months of CPT? The OPT 12-Month Rule
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Eleven months of full-time CPT is below the one-year bar, but getting close to the limit deserves a DSO review. Here is how full-time and part-time CPT affect post-completion OPT.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 6 min read</span>
                    <span>•</span>
                    <span>Updated July 27, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <Image
                    src="/blog/cpt-12-month-rule.png"
                    alt="Desk calendar showing exactly 12 months marked off with a red pen and student ID"
                    fill
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    If you are an F-1 student considering an internship, you've probably heard the terrifying rumor: "Don't use CPT, or you'll lose your OPT!" This rumor is only half-true. In reality, you can do plenty of CPT internships without losing a single day of your post-graduation OPT—but you must understand the <strong>12-Month Rule</strong>.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl mb-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        The Quick Answer
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        Using CPT does <strong>not</strong> reduce OPT day by day. However, <strong>one year or more of full-time CPT</strong> makes you ineligible for post-completion OPT at that education level. Part-time CPT does not count toward that bar. Ask your DSO to verify the official authorization history before you approach one year.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What is the 12-Month Rule?</h2>
                <p>
                    Under 8 CFR 214.2(f)(10)(i) and <a href="https://www.ice.gov/sevis/practical-training" target="_blank" rel="noopener noreferrer">ICE practical-training guidance</a>:
                </p>
                <blockquote className="border-l-4 border-gray-300 dark:border-zinc-700 pl-4 py-2 italic text-gray-700 dark:text-gray-300 my-6 bg-gray-50 dark:bg-zinc-800/50 rounded-r-lg">
                    "Students who have received one year or more of full time curricular practical training are ineligible for post-completion academic training [OPT]."
                </blockquote>
                <p>
                    Let's break down exactly what this means in practice.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-10">
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-900/50">
                        <h3 className="text-xl font-bold text-green-900 dark:text-green-300 flex items-center gap-2 mt-0">
                            <Calendar className="w-5 h-5" />
                            Part-Time CPT (20 hours or less/week)
                        </h3>
                        <p className="text-green-800 dark:text-green-200 mt-3 mb-0 text-sm">
                            Part-time CPT does not count toward the one-year full-time CPT bar. It still must be properly authorized, related to the curriculum, and compliant with your school&apos;s requirements.
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-900/50">
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mt-0">
                            <Clock className="w-5 h-5" />
                            Full-Time CPT (Over 20 hours/week)
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200 mt-3 mb-0 text-sm">
                            Full-time CPT affects post-completion OPT eligibility when you receive <strong>one year or more</strong> at the same education level. Use your DSO&apos;s SEVIS/I-20 records rather than a self-calculated estimate.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How CPT Math Works: It's All or Nothing</h2>
                <p>
                    One of the biggest misconceptions is that CPT time is <em>subtracted</em> from OPT time. <strong>This is false.</strong>
                </p>
                <p>
                    Unlike Pre-Completion OPT (which subtracts from post-completion OPT day-by-day), CPT is an <strong>"all or nothing"</strong> trigger:
                </p>
                <ul className="space-y-3">
                    <li>If your authorized full-time CPT totals <strong>less than one year</strong>, the one-year CPT bar is not triggered.</li>
                    <li>If it totals <strong>one year or more</strong>, you are ineligible for post-completion OPT at that education level.</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        Do Not Plan Up to the Edge
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        CPT authorizations can span different month lengths, overlap academic terms, or be recorded differently than a personal spreadsheet. Before accepting another full-time CPT period near one year, ask your DSO to calculate your official total and explain the effect on OPT eligibility.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Does the 12-Month Rule Reset?</h2>
                <p>
                    Yes! The 12-month rule is specific to your <strong>educational level</strong>.
                </p>
                <p>
                    If you complete a Bachelor's degree and use 12 months of full-time CPT (losing your Bachelor's OPT), the clock resets when you enroll in a Master's degree program. You will have a fresh slate for Master's level CPT and a fresh 12 months of Master's level OPT.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Common CPT Scenarios Explained</h2>

                <div className="space-y-6 my-8">
                    <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
                        <h4 className="font-bold text-lg mt-0 mb-2">Scenario 1: The Summer Intern</h4>
                        <p className="text-sm mb-2"><strong>Situation:</strong> You do full-time CPT for 3 months during sophomore summer, and another 3 months full-time CPT during junior summer.</p>
                        <p className="text-sm mb-0"><strong>Result:</strong> You have used 6 months of full-time CPT. This is under 12 months. <strong>You keep all 12 months of your OPT.</strong></p>
                    </div>

                    <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
                        <h4 className="font-bold text-lg mt-0 mb-2">Scenario 2: The Co-Op Student</h4>
                        <p className="text-sm mb-2"><strong>Situation:</strong> You do a 6-month full-time co-op, plus two 3-month summer internships (all full-time CPT).</p>
                        <p className="text-sm mb-0"><strong>Result:</strong> This may reach one year of full-time CPT. <strong>Have your DSO verify the exact authorized dates before relying on post-completion OPT.</strong></p>
                    </div>

                    <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
                        <h4 className="font-bold text-lg mt-0 mb-2">Scenario 3: The Heavy Part-Timer</h4>
                        <p className="text-sm mb-2"><strong>Situation:</strong> You work part-time CPT (20 hrs/week) for 24 months straight during your Master's degree.</p>
                        <p className="text-sm mb-0"><strong>Result:</strong> Part-time CPT does not trigger the one-year full-time CPT bar. <strong>Your OPT eligibility still depends on meeting all other requirements.</strong></p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Safely Calculate Your Days</h2>
                <ol>
                    <li>Check your previous I-20s. Your exact CPT start and end dates are printed on page 2 of your I-20 under "Employment Authorizations."</li>
                    <li>Separate part-time and full-time CPT authorizations.</li>
                    <li>Ask your DSO to review the cumulative full-time CPT recorded at your current education level.</li>
                    <li>Keep copies of the DSO&apos;s calculation and every relevant I-20 before accepting another CPT period.</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {CPT_FAQS.map((faq) => (
                        <div key={faq.question} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">{faq.answer}</p>
                        </div>
                    ))}
                </div>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Track Your CPT Days Automatically
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Don&apos;t guess how much CPT you have used. Log each authorization from your I-20 so you can compare your records with your DSO&apos;s official calculation before you approach the one-year full-time CPT limit.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Create Free Account
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/pre-completion-opt-vs-cpt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Pre-Completion OPT vs CPT
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Deciding between Pre-Completion OPT and CPT? See our full comparison on costs, timelines, and impact.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/cpt-complete-guide" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                The Complete CPT Guide
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Learn exactly how to apply for Curricular Practical Training at your university.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>

            <AuthorBio />
        </article>
    );
}
