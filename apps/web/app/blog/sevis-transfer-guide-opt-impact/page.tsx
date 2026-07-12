import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, GraduationCap, RefreshCw, XCircle, FileQuestion } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "SEVIS Transfer Guide: How Moving Schools Impacts Your OPT | TrackMyOPT",
    description: "Planning to transfer to a new university or start a master's degree? Learn how a SEVIS transfer instantly cancels your OPT and CPT authorization.",
    keywords: ["SEVIS transfer OPT", "Transfer I20 OPT", "Cancel OPT for masters", "Day 1 CPT SEVIS transfer", "SEVIS release date"],
    openGraph: {
        title: "How a SEVIS Transfer Instantly Cancels Your OPT",
        description: "Accepted into a Master's program? Read this before you request a SEVIS transfer from your DSO, or you might accidentally lose your current OPT job.",
        type: "article",
        url: "https://trackmyopt.com/blog/sevis-transfer-guide-opt-impact",
        images: [
            {
                url: "/blog/sevis-transfer-guide-opt-impact.png",
                width: 1200,
                height: 630,
                alt: "Academic desk with a SEVIS transfer request form, university admission letter, and I-20 document",
            },
        ],
    },
    alternates: {
        canonical: "https://trackmyopt.com/blog/sevis-transfer-guide-opt-impact",
    }
};

export default function SevisTransferPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-07-12"
                modifiedDate="2026-07-12"
                author="TrackMyOPT Team"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">SEVIS</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    SEVIS Transfer Guide: How Moving Schools Impacts Your OPT
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Planning to start a Master's degree or transition to a Day-1 CPT school? Read this before you request a SEVIS transfer, or you might accidentally work illegally.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/sevis-transfer-guide-opt-impact.png"
                    alt="Academic desk with a SEVIS transfer request form, university admission letter, and I-20 document"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    A SEVIS transfer allows you to move your F-1 student record from your current school to a new school without having to leave the US, pay the SEVIS fee again, or get a new visa stamp. While the process itself is straightforward, its impact on your current employment authorization (like OPT) is immediate and unforgiving. 
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Golden Rule: Transfer = Cancellation</h2>
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl mb-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2">
                        <XCircle className="w-6 h-6" />
                        Immediate OPT Cancellation
                    </h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">
                        The moment your SEVIS record is electronically transferred to your new school (on your "SEVIS Release Date"), <strong>your OPT or STEM OPT is immediately and irreversibly canceled.</strong>
                    </p>
                </div>
                <p>
                    Even if your EAD card says it is valid for another 6 months, it does not matter. The SEVIS transfer voids the underlying authorization. If you work even one day past your SEVIS release date, you are engaging in unauthorized employment, which can result in deportation and a permanent ban from the US.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Understanding the "SEVIS Release Date"</h2>
                <p>
                    When you ask your current DSO to transfer your record, they will ask you for a <strong>SEVIS Release Date</strong>. This is the exact calendar day that ownership of your digital SEVIS record shifts from School A to School B.
                </p>
                
                <h3 className="text-xl font-bold mt-6 mb-3">How to Strategize Your Release Date</h3>
                <ul className="space-y-4">
                    <li>
                        <strong>If you are currently working on OPT:</strong> You should set your release date for the day <em>after</em> your last day of work. For example, if you plan to quit your OPT job on Friday, August 10th, you should set your SEVIS Release Date to Monday, August 13th.
                    </li>
                    <li>
                        <strong>If you are in your 60-day grace period:</strong> If your OPT has already ended, you must request a SEVIS release date <em>before</em> your 60-day grace period expires.
                    </li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6">The 5-Month Rule</h2>
                <p>
                    To be eligible for a SEVIS transfer, classes at your new school must begin within <strong>5 months</strong> of either:
                </p>
                <ol>
                    <li>The date of your SEVIS release, OR</li>
                    <li>The end date of your OPT authorization (or the end of your degree program), whichever is earlier.</li>
                </ol>
                <p>
                    If the gap between your OPT ending and your new master's degree starting is more than 5 months, you cannot do a SEVIS transfer. You will have to leave the US, get a brand new "Initial" I-20, pay a new SEVIS fee, and re-enter.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Transitioning to Day-1 CPT</h2>
                <p>
                    A very common scenario is a student transferring from OPT to a Day-1 CPT master's program after failing the H-1B lottery. Because the SEVIS transfer instantly cancels your OPT, you will have a gap in work authorization.
                </p>
                
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm my-6">
                    <h4 className="flex items-center gap-2 font-bold text-lg mt-0 mb-3"><RefreshCw className="w-5 h-5 text-blue-500" /> The Work Gap Timeline</h4>
                    <ol className="mb-0 text-sm space-y-2">
                        <li><strong>August 10:</strong> Your last day working on OPT.</li>
                        <li><strong>August 11 (Release Date):</strong> SEVIS record transfers. OPT is canceled. You cannot work.</li>
                        <li><strong>August 11 to August 24:</strong> You are legally in the US, but you cannot work. (Unpaid leave of absence).</li>
                        <li><strong>August 25:</strong> Classes start at your new Day-1 CPT school. Your new DSO activates your CPT.</li>
                        <li><strong>August 26:</strong> You resume working for your employer under CPT authorization.</li>
                    </ol>
                </div>

                <p>
                    You must coordinate this gap perfectly with your employer's HR department. You must be taken off the payroll entirely during the gap period.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2">
                        <AlertTriangle className="w-5 h-5" />
                        Pending H-1B Petitions (Cap-Gap)
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">
                        If you were selected in the H-1B lottery and are currently working under the Cap-Gap Extension, <strong>requesting a SEVIS transfer will instantly cancel your Cap-Gap work authorization</strong> and may cause USCIS to deny your pending change of status to H-1B. Always consult an immigration lawyer before transferring schools if you have a pending H-1B.
                    </p>
                </div>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Manage Your Transition Safely
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Don't guess when your grace period ends or when your SEVIS transfer must be initiated. TrackMyOPT helps you map out your school transfers and alerts you to critical deadlines before you accidentally fall out of status.
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
                    <Link href="/blog/fall-out-of-f1-status-options" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Falling Out of F-1 Status
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Did you accidentally work past your SEVIS release date? Learn your options for reinstatement and recovery.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/h1b-cap-gap-extension-guide" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                H-1B Cap-Gap Extension
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Understand how the Cap-Gap protects your work authorization and why you must not transfer schools while it is active.
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
