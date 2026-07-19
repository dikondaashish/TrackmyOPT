import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, Calendar, HelpCircle, GraduationCap } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Does CPT Affect OPT? The 12-Month Rule Explained | TrackMyOPT",
    description: "Understand the CPT 12-Month Rule. Learn how full-time and part-time Curricular Practical Training impacts your Optional Practical Training (OPT) eligibility as an F-1 student.",
    keywords: ["CPT 12 Month Rule", "Does CPT affect OPT", "Full-time CPT", "Part-time CPT", "OPT eligibility", "F1 student internship rules"],
    openGraph: {
        title: "Does Using CPT Affect Your OPT Eligibility? The 12-Month Rule Explained",
        description: "Will doing a CPT internship ruin your chances for OPT? Discover exactly how the 12-month CPT rule works and how to protect your post-graduation work authorization.",
        type: "article",
        url: "https://trackmyopt.com/blog/cpt-12-month-rule-opt-eligibility",
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
        canonical: "https://trackmyopt.com/blog/cpt-12-month-rule-opt-eligibility",
    }
};

export default function CPT12MonthRulePage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-01-31"
                modifiedDate="2026-01-31"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">CPT Basics</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Does Using CPT Affect Your OPT Eligibility? The 12-Month Rule Explained
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Will doing an internship on CPT ruin your chances for post-graduation OPT? Here is exactly how the 12-month rule works.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 6 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/cpt-12-month-rule.png"
                    alt="Desk calendar showing exactly 12 months marked off with a red pen and student ID"
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
                        Using CPT does <strong>not</strong> affect your OPT eligibility, <strong>unless</strong> you work <strong>Full-Time CPT for 365 days (12 months) or more</strong> during your degree level. If you work exactly 365 days of full-time CPT, you lose 100% of your OPT. Part-time CPT never affects OPT.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What is the 12-Month Rule?</h2>
                <p>
                    According to US Immigration and Customs Enforcement (ICE) regulations (8 CFR 214.2(f)(10)(i)):
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
                            Part-time CPT <strong>never</strong> affects your OPT. You can do 12 months, 18 months, or even 24 months of part-time CPT, and you will still get your full 12 months of post-completion OPT.
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-900/50">
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mt-0">
                            <Clock className="w-5 h-5" />
                            Full-Time CPT (Over 20 hours/week)
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200 mt-3 mb-0 text-sm">
                            Full-time CPT <strong>only</strong> affects your OPT if you hit <strong>365 days or more</strong>. If you do 364 days of full-time CPT, you keep your entire 12 months of OPT.
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
                    <li>If you do <strong>11 months and 29 days</strong> (364 days) of full-time CPT ➔ You get 12 months of OPT.</li>
                    <li>If you do <strong>12 months</strong> (365 days) of full-time CPT ➔ You get <strong>0 months</strong> of OPT.</li>
                </ul>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        The 364-Day Danger Zone
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        Many DSOs will refuse to approve full-time CPT past 11 or 11.5 months simply to protect you from accidentally triggering the 365-day rule. If your graduation date shifts or you make a calculation error, going over 364 days is fatal to your OPT.
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
                        <p className="text-sm mb-0"><strong>Result:</strong> You have used 12 months (365 days) of full-time CPT. <strong>You lose all 12 months of your OPT.</strong></p>
                    </div>

                    <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
                        <h4 className="font-bold text-lg mt-0 mb-2">Scenario 3: The Heavy Part-Timer</h4>
                        <p className="text-sm mb-2"><strong>Situation:</strong> You work part-time CPT (20 hrs/week) for 24 months straight during your Master's degree.</p>
                        <p className="text-sm mb-0"><strong>Result:</strong> Part-time CPT never triggers the rule, no matter the length. <strong>You keep all 12 months of your OPT.</strong></p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Safely Calculate Your Days</h2>
                <ol>
                    <li>Check your previous I-20s. Your exact CPT start and end dates are printed on page 2 of your I-20 under "Employment Authorizations."</li>
                    <li>Count every calendar day between the start date and end date (inclusive), including weekends and holidays.</li>
                    <li>If you have multiple CPT segments, add the days together.</li>
                    <li>If the total is 364 days or less of full-time CPT, you are safe.</li>
                </ol>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Track Your CPT Days Automatically
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Don't guess how many days of CPT you've used. Use TrackMyOPT to log your CPT authorizations directly from your I-20. We'll automatically calculate your accumulated days and warn you if you get close to the dangerous 365-day limit.
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
        </article>
    );
}
