import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Briefcase, FileText, SplitSquareHorizontal } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Multiple Jobs on OPT: Can You Work for Two Employers at Once? | TrackMyOPT",
    description: "Learn if F-1 students can legally hold two or more jobs simultaneously on OPT and STEM OPT. SEVIS reporting rules, 20-hour minimums, and E-Verify requirements.",
    keywords: ["Multiple jobs OPT", "Two employers F1 student", "Part time job OPT", "Second job OPT", "STEM OPT multiple employers"],
    openGraph: {
        title: "Working Multiple Jobs on OPT: The Complete Rules",
        description: "Can you hold a full-time job and a part-time job simultaneously? Yes, but tracking your hours and SEVIS reporting gets complicated.",
        type: "article",
        url: "https://trackmyopt.com/blog/multiple-jobs-opt-two-employers",
        images: [{ url: "/blog/multiple-jobs-opt-two-employers.jpg", width: 1200, height: 630, alt: "A desk split between a corporate laptop setup and a freelance tablet setup" }],
    },
    alternates: { canonical: "https://trackmyopt.com/blog/multiple-jobs-opt-two-employers" }
};

export default function MultipleJobsPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-12" modifiedDate="2026-07-12" author="TrackMyOPT Team" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Work Rules</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Compliance</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Multiple Jobs on OPT: Can You Work for Two Employers?</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Can you hold a full-time job and a part-time job simultaneously on OPT? Yes, but tracking your hours and SEVIS reporting gets complicated. Here are the rules.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/multiple-jobs-opt-two-employers.jpg" alt="A desk split between a corporate laptop setup and a freelance tablet setup" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">You landed a great 40-hour-per-week job in your field, but you also got an offer to consult part-time for a startup for 10 hours a week. Can you legally accept both? For F-1 students on OPT, the answer is usually yes, but with major caveats depending on whether you are on standard OPT or the STEM extension.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Standard 12-Month OPT Rules</h2>
                <p>During your first 12 months of post-completion OPT, you are allowed to work for as many employers as you want simultaneously, provided you follow these rules:</p>
                <ul>
                    <li><strong>The Golden Rule:</strong> <em>Every single job</em> you hold must be directly related to your major field of study. If you are a Marketing major, you cannot work full-time at an ad agency and part-time as a bartender.</li>
                    <li><strong>The 20-Hour Minimum:</strong> You must work a total of at least 20 hours per week combined across all your jobs to stop the unemployment clock.</li>
                    <li><strong>No Maximum Hours:</strong> There is no legal upper limit on how many hours you can work per week on OPT. You can work 80 hours across three jobs if you want to.</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">SEVIS Reporting for Multiple Jobs</h3>
                <p>You must report <em>each</em> employer separately in the SEVP Portal. Do not combine them into one entry. If you leave one job but keep the other, you must update the portal within 10 days to show the end date for the job you left.</p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2"><AlertTriangle className="w-5 h-5" /> H-1B Sponsorship Conflicts</h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">If both employers want to sponsor you for an H-1B visa, things get messy. USCIS generally prohibits multiple H-1B registrations by related entities for the same beneficiary. Ensure you communicate clearly with both employers about who is handling your sponsorship.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">STEM OPT Extension Rules</h2>
                <p>On the 24-month STEM OPT extension, holding multiple jobs is much harder because the regulations are stricter:</p>
                <ol>
                    <li><strong>E-Verify Requirement:</strong> <em>Every</em> employer you work for must be enrolled in E-Verify.</li>
                    <li><strong>I-983 Training Plan:</strong> You must submit a separate, complete Form I-983 for <em>each</em> employer to your DSO.</li>
                    <li><strong>Bona Fide Employer:</strong> You cannot be an independent contractor (1099) or self-employed on STEM OPT. You must be a W-2 employee for each job.</li>
                    <li><strong>Minimum Hours per Employer:</strong> Unlike standard OPT where hours combine, on STEM OPT you must work at least <strong>20 hours per week for EACH employer</strong>. This means if you have two jobs, you must work at least 40 hours total (20+20). You cannot work 30 hours for Employer A and 10 hours for Employer B.</li>
                </ol>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Simplify Multiple Employer Tracking</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">Managing SEVIS updates, offer letters, and evaluations for two different employers is a paperwork nightmare. <strong>TrackMyOPT</strong> lets you track multiple concurrent employers, separate your I-983 training plans, and sends you individual deadline reminders for each job's reporting requirements.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Tax Implications of Two Jobs</h2>
                <p>When you have two jobs, both employers will ask you to fill out a W-4 form. Because the US tax system is progressive, working two jobs might bump your combined income into a higher tax bracket. You must carefully adjust your W-4 withholdings, or you may face a massive unexpected tax bill in April.</p>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Multiple Jobs Without the Stress</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">TrackMyOPT is the only platform that cleanly handles concurrent OPT employment. Track hours per employer, store multiple I-983s, and never miss a separate reporting deadline.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Multiple Jobs</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/freelance-gig-work-uber-doordash-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Freelance Work Rules</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Is your second job 1099 contract work? Make sure you understand the freelance rules first.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/opt-reporting-requirements-dso" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Reporting to Your DSO</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Learn exactly how to report new employers and employment changes in the SEVP portal.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
