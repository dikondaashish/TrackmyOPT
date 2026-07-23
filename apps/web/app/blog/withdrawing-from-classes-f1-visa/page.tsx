import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, GraduationCap, XCircle, ShieldAlert, MonitorCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Withdrawing from Classes on an F-1 Visa: Avoid Losing Your Status | TrackMyOPT",
    description: "Failing a class and want to drop it? Learn the strict SEVIS rules for course withdrawals, full-time enrollment, and how it affects your future OPT.",
    keywords: ["Withdraw class F1 visa", "Drop course international student", "F1 full time requirement", "Reduced course load F1", "SEVIS termination drop class"],
    openGraph: {
        title: "Dropping a Class? Why You Must Talk to Your DSO First",
        description: "If you drop a class and fall below a full-time course load, your SEVIS record will be terminated and your OPT eligibility destroyed. Read this before you hit 'Withdraw'.",
        type: "article",
        url: "https://trackmyopt.com/blog/withdrawing-from-classes-f1-visa",
        images: [
            {
                url: "/blog/withdrawing-from-classes-f1-visa.png",
                width: 1200,
                height: 630,
                alt: "Academic desk with a Course Withdrawal Form, student ID, and a laptop showing a student portal",
            },
        ],
    },
    alternates: {
        canonical: "https://trackmyopt.com/blog/withdrawing-from-classes-f1-visa",
    }
};

export default function WithdrawingClassesPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-06-12"
                modifiedDate="2026-06-12"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Academics</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Withdrawing from Classes on an F-1 Visa: Avoid Losing Your Status
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Failing a class and want to hit the 'Withdraw' button on your student portal? Stop. Learn the strict SEVIS rules for course withdrawals and how a single click can destroy your future OPT.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 8 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/withdrawing-from-classes-f1-visa.png"
                    alt="Academic desk with a Course Withdrawal Form, student ID, and a laptop showing a student portal"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    College is stressful, and sometimes you find yourself in a class that is simply too difficult. For domestic students, dropping a class halfway through the semester (taking a "W" on their transcript) is a normal part of academic life. But for F-1 international students, clicking "Withdraw" on your student portal without permission can instantly trigger deportation proceedings and permanently ruin your chances of working on OPT.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Golden Rule: Full-Time Enrollment</h2>
                <p>
                    Under US immigration law, F-1 students must maintain a <strong>full course of study</strong> during every academic term (excluding authorized annual vacations, usually summer). 
                </p>
                <ul>
                    <li><strong>Undergraduates:</strong> Must be enrolled in at least 12 credit hours per semester.</li>
                    <li><strong>Graduates:</strong> Must be enrolled in what the university defines as full-time (usually 9 credit hours per semester).</li>
                </ul>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2">
                        <XCircle className="w-6 h-6" />
                        The Instant Termination Trap
                    </h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">
                        If you are taking exactly 12 credits, and you drop a 3-credit class, your enrollment drops to 9 credits. The university registrar system will automatically notify the International Student Office. Your DSO is then legally required to terminate your SEVIS record for "Unauthorized Drop Below Full Course of Study."
                    </p>
                </div>
                <p>
                    If your SEVIS record is terminated, you lose your F-1 status instantly. You have no grace period. You must leave the United States immediately. Worse, because you failed to maintain status for one full academic year, <strong>you lose your eligibility for OPT and CPT.</strong>
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Solution: Authorized Reduced Course Load (RCL)</h2>
                <p>
                    You <em>can</em> drop below full-time status, but only if you receive written authorization from your DSO <strong>before</strong> you drop the class. This is called a Reduced Course Load (RCL).
                </p>
                <p>
                    There are only three acceptable reasons DHS allows a DSO to grant an RCL:
                </p>

                <div className="space-y-6 my-8">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <BookOpen className="w-6 h-6" /> 1. Academic Difficulty
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            You can get an RCL if you are facing initial difficulties with the English language or reading requirements, unfamiliarity with US teaching methods, or improper course level placement. <strong>Crucially:</strong> You can only use this reason once per degree level, and you must still maintain at least 6 credits (half-time).
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                            <ShieldAlert className="w-6 h-6" /> 2. Medical Condition
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            If you have an illness or medical condition, you can drop classes (even down to 0 credits). You must provide documentation from a licensed medical doctor, doctor of osteopathy, or licensed clinical psychologist. This can be authorized for up to 12 months total per degree level.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <GraduationCap className="w-6 h-6" /> 3. Final Semester
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            If it is your final semester and you only need 4 credits to graduate, you do not have to take 12 credits just to satisfy the immigration rule. Your DSO can authorize an RCL for completion of studies.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What If You Are Taking 15 Credits?</h2>
                <p>
                    If you are an undergraduate taking 15 credits, and you want to drop a 3-credit class, you will still have 12 credits remaining. Because 12 credits is still considered full-time, <strong>you do not need an RCL.</strong> You can drop the class without violating your immigration status. 
                </p>
                <p>
                    However, you should still email your DSO to confirm before you do it, just in case the class has a lab component that brings you down to 11 credits.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <MonitorCheck className="w-6 h-6 text-primary" />
                        Compliance Tracking with TrackMyOPT
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        Immigration rules are unforgiving. A simple scheduling mistake can cost you your US career. <strong>TrackMyOPT</strong> helps you maintain compliance by tracking your OPT unemployment days, sending you automated reminders for SEVIS reporting deadlines, and securely storing your I-20s. Don't leave your immigration status to chance.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Failing a Class vs. Withdrawing</h2>
                <p>
                    What if you are failing a class, but dropping it would bring you below 12 credits, and you don't qualify for an RCL?
                </p>
                <p>
                    From a strict immigration perspective, <strong>it is better to fail the class (get an F) than to drop it.</strong> 
                </p>
                <p>
                    Getting an F hurts your GPA, and you may be placed on academic probation by your university. However, you maintained your full-time enrollment, so your SEVIS record remains active. If you drop the class, your SEVIS record is terminated, and your US journey ends immediately. Always consult both your academic advisor and your DSO before making this difficult decision.
                </p>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Secure Your OPT Future
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Every semester matters when you are building up to your OPT application. TrackMyOPT provides the tools you need to stay compliant, organize your immigration documents, and track your employment deadlines once you graduate.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Create Your TrackMyOPT Account
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/fall-out-of-f1-status-options" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Out of Status Options
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Did you accidentally drop below full-time and lose your status? Learn your options for SEVIS reinstatement.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/sevis-transfer-guide-opt-impact" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                SEVIS Transfer Guide
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Thinking of transferring to an easier school? Learn how a SEVIS transfer impacts your future OPT.
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
