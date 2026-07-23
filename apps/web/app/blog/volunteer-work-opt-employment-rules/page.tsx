import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Heart, FileText, Briefcase } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Volunteer Work on OPT: Does Unpaid Work Stop the Unemployment Clock? | TrackMyOPT",
    description: "Learn how to use unpaid volunteer work to stop your 90-day OPT unemployment clock. Rules for F-1 students, degree relevance, and STEM OPT restrictions.",
    keywords: ["Volunteer on OPT", "Unpaid work OPT", "Stop OPT unemployment", "F1 student volunteer rules", "Unpaid internship OPT"],
    openGraph: {
        title: "How to Stop the OPT Unemployment Clock with Volunteer Work",
        description: "Running out of your 90 days of OPT unemployment? You can legally stop the clock by volunteering—if you follow these strict rules.",
        type: "article",
        url: "https://trackmyopt.com/blog/volunteer-work-opt-employment-rules",
        images: [{ url: "/blog/volunteer-work-opt-employment-rules.jpg", width: 1200, height: 630, alt: "Clipboard with a volunteer sign-in sheet next to a volunteer agreement form and an EAD card" }],
    },
    alternates: { canonical: "https://trackmyopt.com/blog/volunteer-work-opt-employment-rules" }
};

export default function VolunteerWorkPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-06-07" modifiedDate="2026-06-07" author="Vinay Kumar" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Work Rules</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Unemployment</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">Volunteer Work on OPT: Stopping the Unemployment Clock</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Running out of your 90 days of OPT unemployment? You can legally stop the clock by doing unpaid volunteer work—if you follow these strict immigration rules.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 6 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/volunteer-work-opt-employment-rules.jpg" alt="Clipboard with a volunteer sign-in sheet next to a volunteer agreement form and an EAD card" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">You are 60 days into your 90-day unemployment allowance, and you still haven't found a paid job. Panic is setting in. Before your SEVIS record is terminated, there is a legal lifeline: <strong>Unpaid volunteer work or unpaid internships count as employment on standard OPT.</strong> But you cannot just volunteer anywhere.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Rules for Volunteering on Standard OPT</h2>
                <p>During your first 12 months of OPT, unpaid work perfectly satisfies the employment requirement and stops your 90-day unemployment clock, provided it meets these three criteria:</p>
                
                <ol>
                    <li><strong>Directly Related to Your Major:</strong> You cannot volunteer at an animal shelter walking dogs if you are a Computer Science major. However, if you are a CS major building a website for that animal shelter, that <em>does</em> count.</li>
                    <li><strong>Minimum 20 Hours Per Week:</strong> To stop the unemployment clock, you must volunteer for at least 20 hours a week.</li>
                    <li><strong>Must Not Violate Labor Laws:</strong> You cannot "volunteer" to do a job that someone would normally be paid for at a for-profit company (this violates the Fair Labor Standards Act). Genuine unpaid internships or volunteering for a 501(c)(3) non-profit are the safest routes.</li>
                </ol>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2"><AlertTriangle className="w-5 h-5" /> Document Everything</h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">Because there are no pay stubs or W-2s to prove you were employed, USCIS scrutinizes unpaid work. You must secure an official letter from the organization detailing your title, start/end dates, weekly hours, and a description of duties proving it relates to your degree.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Can I Volunteer on STEM OPT?</h2>
                <p><strong>Absolutely NOT.</strong></p>
                <p>The rules change completely when you transition to the 24-month STEM OPT extension. According to DHS regulations, all STEM OPT employment must be <strong>paid</strong>, and the employer must be enrolled in E-Verify. Unpaid internships and volunteer work are strictly prohibited on STEM OPT.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Where to Find Volunteer Work Fast</h2>
                <p>If you are racing against the 90-day clock, look for opportunities here:</p>
                <ul>
                    <li><strong>Your University:</strong> Reach out to professors to see if you can work as an unpaid research assistant in their lab. (Note: Most DSOs prefer this).</li>
                    <li><strong>Non-Profits (501c3):</strong> Local charities always need skilled help (accounting, IT, marketing).</li>
                    <li><strong>Startups:</strong> You can do an unpaid internship at a startup, provided it is designed as a training experience and doesn't displace a regular employee.</li>
                </ul>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Track Your Unemployment Days Accurately</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">The 90-day unemployment clock is unforgiving. <strong>TrackMyOPT</strong> calculates your exact remaining days, factors in weekends and travel outside the US, and provides secure cloud storage for your volunteer offer letters so you are always ready for an H-1B RFE.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Report Volunteer Work in SEVIS</h2>
                <p>Once you secure a volunteer position, you must report it in the SEVP Portal (or via your DSO) within 10 days of starting. You will list the organization as your employer, enter the address, and clearly state in the job description that it is an unpaid volunteer/internship position related to your major.</p>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stop Stressing About the Clock</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">TrackMyOPT's precision unemployment calculator ensures you always know exactly how many days you have left. Store your volunteer documentation securely and never miss a reporting deadline.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT Days</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/fall-out-of-f1-status-reinstatement-options" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Falling Out of Status</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">What happens if you exceed 90 days of unemployment? Learn your options.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/freelance-gig-work-uber-doordash-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Freelance & Gig Work</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Instead of volunteering, can you freelance or do gig work? Read the rules first.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
