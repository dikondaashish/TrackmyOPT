import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, AlertCircle, Plane, RefreshCw, XCircle } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "What Happens If You Fall Out of F-1 Status? | TrackMyOPT",
    description: "Learn what falling out of F-1 status means, the severe consequences, and your options for reinstatement, travel and reentry, or voluntary departure.",
    keywords: ["Fall out of F1 status", "F1 reinstatement", "SEVIS terminated", "F1 out of status", "Voluntary departure F1", "OPT denied out of status"],
    openGraph: {
        title: "Fallen Out of F-1 Status? Here Are Your Options",
        description: "Whether you missed a deadline, dropped below full-time, or exceeded unemployment days, here is exactly what happens when you lose F-1 status and how to fix it.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/fall-out-of-f1-status-options",
        images: [
            {
                url: "/blog/fall-out-of-f1-status-options.png",
                width: 1200,
                height: 630,
                alt: "Stressed student desk with passport, I-20, and phone showing missed deadlines",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/fall-out-of-f1-status-options",
    }
};

export default function FallOutOfStatusPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-02-18"
                modifiedDate="2026-02-18"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Emergency</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    What Happens If You Fall Out of F-1 Status? Options & Solutions
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    A terminated SEVIS record is terrifying, but it is not always the end of your US journey. Learn how to navigate reinstatement, reentry, or voluntary departure.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 8 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/fall-out-of-f1-status-options.png"
                    alt="Stressed student desk with passport, I-20, and phone showing missed deadlines"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    "Falling out of status" means you have violated the terms of your F-1 visa, causing your Designated School Official (DSO) to terminate your SEVIS record. When this happens, you lose your legal right to remain in the United States. While this is a serious situation, acting quickly gives you several options to recover your status.
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl mb-10">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        First Step: Stop Working Immediately
                    </h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">
                        If your SEVIS record is terminated, any work authorization you have (including CPT, OPT, or on-campus employment) is immediately void. Continuing to work while out of status is a severe violation that can result in permanent bans from the US. <strong>Contact your DSO immediately.</strong>
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How Do Students Fall Out of Status?</h2>
                <p>The most common reasons for a SEVIS termination include:</p>
                <ul>
                    <li><strong>Dropping below full-time enrollment</strong> without prior DSO authorization.</li>
                    <li><strong>Failing to enroll</strong> in classes for a required semester.</li>
                    <li><strong>Unauthorized employment</strong> (working off-campus without CPT/OPT).</li>
                    <li><strong>Exceeding unemployment limits</strong> while on OPT (90 days) or STEM OPT (150 days).</li>
                    <li><strong>Failing to report</strong> OPT employment or a change of address within 10 days.</li>
                    <li><strong>Academic suspension or dismissal</strong> by the university.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6">Your 3 Primary Options</h2>
                <p>
                    If you find yourself out of status, you generally have three legal pathways depending on your specific circumstances:
                </p>

                <div className="space-y-8 my-8">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                        <h3 className="text-2xl font-bold mt-0 mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <RefreshCw className="w-6 h-6" /> Option 1: Reinstatement (Within the US)
                        </h3>
                        <p>
                            You can apply to USCIS to reinstate your F-1 status without leaving the country. This requires filing Form I-539 and paying a $470 fee.
                        </p>
                        <h4 className="font-bold text-lg mb-2 mt-4">Who is eligible?</h4>
                        <ul className="text-sm">
                            <li>You have been out of status for <strong>less than 5 months</strong>.</li>
                            <li>You do not have a record of repeated violations.</li>
                            <li>You have not worked without authorization.</li>
                            <li>You are currently pursuing, or intend to pursue, a full course of study.</li>
                            <li>The violation resulted from circumstances <strong>beyond your control</strong> (e.g., serious illness, natural disaster, DSO error).</li>
                        </ul>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mt-4 text-sm border border-amber-200 dark:border-amber-900/50">
                            <strong>Warning:</strong> Reinstatement takes 6 to 12 months for USCIS to process. You cannot work (no CPT, no OPT, no on-campus jobs) while the application is pending, though you must continue studying full-time.
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                        <h3 className="text-2xl font-bold mt-0 mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Plane className="w-6 h-6" /> Option 2: Travel and Reentry (New Initial I-20)
                        </h3>
                        <p>
                            Instead of waiting for USCIS, you can leave the US, obtain a new "Initial" I-20 with a new SEVIS ID from your school, pay a new SEVIS fee ($350), and reenter the US.
                        </p>
                        <h4 className="font-bold text-lg mb-2 mt-4">Pros & Cons</h4>
                        <ul className="text-sm">
                            <li><strong>Pro:</strong> Much faster than reinstatement. Once you reenter, you are immediately back in active F-1 status.</li>
                            <li><strong>Con:</strong> Because you get a new SEVIS ID, your F-1 "clock" resets. You must complete two full semesters (one academic year) on the new SEVIS ID before you are eligible for CPT or OPT again.</li>
                            <li><strong>Con:</strong> If your visa stamp is expired, you will need a new visa interview, which comes with a high risk of denial due to your previous violation.</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                        <h3 className="text-2xl font-bold mt-0 mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <XCircle className="w-6 h-6" /> Option 3: Voluntary Departure
                        </h3>
                        <p>
                            If you do not qualify for reinstatement, cannot afford to start over, or simply want to go home, you must leave the United States immediately.
                        </p>
                        <p className="text-sm">
                            Unlike the standard 60-day grace period after graduation, <strong>there is no grace period for a SEVIS termination.</strong> You are expected to leave the US immediately (usually within 15 days). Staying longer accrues "unlawful presence," which can trigger a 3-year or 10-year ban from returning to the US.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What Happens to My OPT If I Fall Out of Status?</h2>
                <p>
                    If you are currently on OPT or STEM OPT and your SEVIS record is terminated (e.g., because you exceeded the unemployment limit), your OPT EAD card is immediately invalidated.
                </p>
                <p>
                    <strong>You cannot apply for reinstatement if you were on OPT.</strong> Reinstatement is only for students who are currently enrolled in a full course of study. If you lose your status while on OPT, your only options are to gain admission to a new degree program and reenter, or leave the US immediately.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Immediate Actions to Take</h2>
                <ol>
                    <li><strong>Contact your DSO immediately:</strong> Do not guess. Find out exactly why your record was terminated and if it can be corrected (sometimes it's a technical error).</li>
                    <li><strong>Consult an Immigration Attorney:</strong> A SEVIS termination is serious. Before filing for reinstatement or leaving the country, spend a few hundred dollars to consult an experienced immigration lawyer.</li>
                    <li><strong>Gather Evidence:</strong> If you are applying for reinstatement, gather hospital records, emails, or official documents proving the violation was beyond your control.</li>
                </ol>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Prevent Status Violations with TrackMyOPT
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    90% of status violations happen because students miss a reporting deadline or lose track of their unemployment days. TrackMyOPT sends you automated SMS and email alerts before deadlines hit, keeping your SEVIS record safe.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Create Free Account
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/opt-reporting-requirements-dso" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                OPT Reporting Requirements
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Learn exactly what you must report to your DSO within 10 days to avoid a SEVIS termination.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                The 90-Day Unemployment Rule
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                How USCIS counts unemployment days on OPT and how to stop the clock before you fall out of status.
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
