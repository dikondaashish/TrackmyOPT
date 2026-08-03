import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, Briefcase, GraduationCap } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Pre-Completion OPT vs CPT: Which Should You Choose? | TrackMyOPT",
    description: "Learn the differences between Pre-Completion OPT and CPT for international students. Compare eligibility, application timelines, fees, and how each affects your post-graduation work authorization.",
    keywords: ["Pre-Completion OPT", "CPT", "F1 student internships", "OPT vs CPT", "Curricular Practical Training", "Optional Practical Training"],
    openGraph: {
        title: "Pre-Completion OPT vs CPT: A Complete Comparison for F-1 Students",
        description: "Deciding between Pre-Completion OPT and CPT for your internship? Understand the rules, costs, and impacts on your post-graduation OPT.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/pre-completion-opt-vs-cpt",
        images: [
            {
                url: "/blog/pre-opt-vs-cpt.png",
                width: 1200,
                height: 630,
                alt: "Desk with student notes, university forms, laptop and textbooks for CPT vs OPT comparison",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/pre-completion-opt-vs-cpt",
    }
};

export default function PreCompletionOPTvsCPTPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-04-30"
                modifiedDate="2026-04-30"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">F-1 Visas</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Internships</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Pre-Completion OPT vs CPT: Which Should You Choose?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Got an internship offer? Here is how to choose between Pre-Completion OPT and CPT, including costs, processing times, and impacts on your future post-graduation OPT.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/pre-opt-vs-cpt.png"
                    alt="Desk with student notes, university forms, laptop and textbooks for CPT vs OPT comparison"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    When you land a summer internship or a part-time job during your academic program, you need proper work authorization. As an F-1 student, you generally have two main options: <strong>Curricular Practical Training (CPT)</strong> and <strong>Pre-Completion Optional Practical Training (Pre-Completion OPT)</strong>. While both allow you to work before you graduate, they have vastly different rules, costs, and long-term consequences.
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl mb-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        The Quick Answer
                    </h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">
                        Whenever possible, <strong>choose CPT</strong>. It is faster, free, authorized entirely by your school, and does not eat into your post-graduation OPT time (unless you work full-time CPT for 12 months or more). Pre-Completion OPT should only be used as a backup if you do not qualify for CPT.
                    </p>
                </div>

                <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                    <Briefcase className="w-7 h-7 text-primary" />
                    1. What is Pre-Completion OPT?
                </h2>
                <p>
                    Pre-Completion OPT is work authorization granted by USCIS (not just your school) that allows F-1 students to work in jobs directly related to their major area of study <strong>before</strong> they graduate.
                </p>
                <ul className="space-y-2">
                    <li><strong>Who authorizes it:</strong> United States Citizenship and Immigration Services (USCIS).</li>
                    <li><strong>Cost:</strong> $470 (online filing fee) to USCIS.</li>
                    <li><strong>Processing Time:</strong> 1 to 4+ months.</li>
                    <li><strong>Job Requirement:</strong> Must be related to your major, but you don't need a job offer to apply.</li>
                    <li><strong>Credit requirement:</strong> Not tied to a specific course for academic credit.</li>
                </ul>

                <h2 className="flex items-center gap-2 text-2xl font-bold mt-12 mb-6">
                    <GraduationCap className="w-7 h-7 text-primary" />
                    2. What is CPT?
                </h2>
                <p>
                    Curricular Practical Training (CPT) is work authorization granted directly by your school's Designated School Official (DSO) for employment that is an <strong>integral part of your established curriculum</strong>.
                </p>
                <ul className="space-y-2">
                    <li><strong>Who authorizes it:</strong> Your university's DSO (International Student Office).</li>
                    <li><strong>Cost:</strong> Free (though you might have to pay tuition for the internship course credit).</li>
                    <li><strong>Processing Time:</strong> 1 to 3 weeks.</li>
                    <li><strong>Job Requirement:</strong> Must be an integral part of your curriculum. You <strong>must</strong> have a job offer to apply.</li>
                    <li><strong>Credit requirement:</strong> You usually must enroll in an internship or practicum course and earn academic credit.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6 text-center">Head-to-Head Comparison</h2>
                <div className="overflow-x-auto mb-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="p-4 font-bold border-b dark:border-zinc-700">Feature</th>
                                <th className="p-4 font-bold border-b dark:border-zinc-700">Pre-Completion OPT</th>
                                <th className="p-4 font-bold border-b dark:border-zinc-700">CPT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b dark:border-zinc-800">
                                <td className="p-4 font-semibold">Approving Authority</td>
                                <td className="p-4">USCIS</td>
                                <td className="p-4 text-green-600 dark:text-green-400 font-medium">Your University (DSO)</td>
                            </tr>
                            <tr className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                                <td className="p-4 font-semibold">Processing Time</td>
                                <td className="p-4 text-red-600 dark:text-red-400 font-medium">1-4+ months</td>
                                <td className="p-4 text-green-600 dark:text-green-400 font-medium">1-3 weeks</td>
                            </tr>
                            <tr className="border-b dark:border-zinc-800">
                                <td className="p-4 font-semibold">Application Fee</td>
                                <td className="p-4 text-red-600 dark:text-red-400 font-medium">$470</td>
                                <td className="p-4 text-green-600 dark:text-green-400 font-medium">Free ($0)</td>
                            </tr>
                            <tr className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                                <td className="p-4 font-semibold">Job Offer Required to Apply?</td>
                                <td className="p-4">No</td>
                                <td className="p-4 text-blue-600 dark:text-blue-400 font-medium">Yes</td>
                            </tr>
                            <tr className="border-b dark:border-zinc-800">
                                <td className="p-4 font-semibold">Requires Course Enrollment?</td>
                                <td className="p-4 text-green-600 dark:text-green-400 font-medium">No</td>
                                <td className="p-4">Yes (usually requires paying tuition for credits)</td>
                            </tr>
                            <tr className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                                <td className="p-4 font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500"/> Impact on Post-Grad OPT</td>
                                <td className="p-4 text-red-600 dark:text-red-400 font-bold">Deducts time directly</td>
                                <td className="p-4 text-green-600 dark:text-green-400 font-bold">No impact* (unless 12+ mos full-time)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Biggest Danger: Deductions from Post-Graduation OPT</h2>
                <p>
                    The most critical difference between the two is how they affect your standard 12-month post-graduation OPT.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-900/50">
                        <h4 className="font-bold text-red-800 dark:text-red-400 mb-3 text-lg">Using Pre-Completion OPT</h4>
                        <p className="text-red-900 dark:text-red-200 text-sm mb-0">
                            <strong>Directly subtracts from your 12 months.</strong><br/><br/>
                            Every day you are authorized for Pre-Completion OPT is subtracted from your available Post-Completion OPT time.<br/><br/>
                            <em>Part-time Pre-OPT deductions happen at a 50% rate (e.g., 2 months of part-time Pre-OPT deducts 1 month from Post-OPT).</em>
                        </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-900/50">
                        <h4 className="font-bold text-green-800 dark:text-green-400 mb-3 text-lg">Using CPT</h4>
                        <p className="text-green-900 dark:text-green-200 text-sm mb-0">
                            <strong>Zero impact (in most cases).</strong><br/><br/>
                            Part-time CPT never affects your OPT.<br/><br/>
                            Full-time CPT does not affect your OPT, <strong>unless</strong> you hit exactly 12 months (365 days) of full-time CPT. If you hit 12 months of full-time CPT, you lose <strong>all</strong> of your OPT. (11.5 months is fine!)
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">When to Choose Which?</h2>
                
                <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold mb-3 mt-0">✅ When you should choose CPT:</h3>
                    <p className="mb-0">Almost always. If your school offers an internship course, a practicum, or independent study that allows for CPT authorization, you should take this route. It saves you $470, protects your post-graduation OPT time, and can be processed by your school in just a few days.</p>
                </div>

                <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-xl mb-10">
                    <h3 className="text-xl font-bold mb-3 mt-0">⚠️ When you should choose Pre-Completion OPT:</h3>
                    <p>You should only use Pre-Completion OPT if you are forced to. Common scenarios include:</p>
                    <ul className="mb-0 mt-2">
                        <li>Your degree program strictly prohibits CPT (some PhD programs or specific majors do not allow it).</li>
                        <li>You have already used all available CPT credits at your university.</li>
                        <li>You found an internship that is related to your major, but does not meet your specific university's strict requirements for academic credit.</li>
                        <li>You are an MBA or graduate student who wants to start your own business while still in school (CPT for self-employment is notoriously difficult to get approved, whereas Pre-OPT allows it).</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-6">
                    <div className="border dark:border-zinc-700 rounded-xl p-6">
                        <h4 className="text-lg font-bold mt-0 mb-2">Can I work on-campus without CPT or Pre-OPT?</h4>
                        <p className="mb-0 text-gray-600 dark:text-gray-300">
                            Yes. You do not need CPT or Pre-OPT for standard on-campus employment (like working at the library or as a TA/RA) up to 20 hours per week while school is in session.
                        </p>
                    </div>
                    
                    <div className="border dark:border-zinc-700 rounded-xl p-6">
                        <h4 className="text-lg font-bold mt-0 mb-2">Do I need a new Pre-OPT application for every semester?</h4>
                        <p className="mb-0 text-gray-600 dark:text-gray-300">
                            Yes, if the dates aren't continuous. And worse, every application requires a new $470 fee and months of waiting for USCIS approval. This is why CPT is vastly superior—your DSO can authorize CPT semester-by-semester for free.
                        </p>
                    </div>
                </div>
            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Keep Track of Your Authorized Dates
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Working even one day past your CPT or Pre-OPT end date is a violation of your F-1 status. Use TrackMyOPT to log your employment authorizations, set up reminders for upcoming expiration dates, and seamlessly transition your data when you apply for Post-Completion OPT.
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
                    <Link href="/blog/cpt-complete-guide" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                CPT Complete Guide
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Deep dive into how to apply for Curricular Practical Training, the 12-month rule, and exact timelines.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/opt-application-checklist-2026" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                OPT Application Checklist
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Preparing for graduation? Here is exactly what you need for your Post-Completion OPT application.
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
