import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Calendar, PlaneTakeoff, GraduationCap } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "The 60-Day Grace Period for F-1 Students: A Practical Guide | TrackMyOPT",
    description: "What happens when your OPT expires or you run out of unemployment days? Learn the rules of the F-1 60-day grace period and your options to stay in the US.",
    keywords: ["60 day grace period F1", "OPT expiration", "F1 student grace period", "Transfer SEVIS record", "Leave US after OPT", "OPT unemployment limit"],
    openGraph: {
        title: "Navigating the 60-Day Grace Period on F-1",
        description: "Whether your OPT naturally expired or you hit your 90-day unemployment limit, here is exactly what you can (and cannot) do during your 60-day grace period.",
        type: "article",
        url: "https://trackmyopt.com/blog/60-day-grace-period-f1-students",
        images: [{ url: "/blog/60-day-grace-period-f1-students.png", width: 1200, height: 630, alt: "A calendar with a departure date circled, next to an I-20 and an airline itinerary" }],
    },
    alternates: { canonical: "https://trackmyopt.com/blog/60-day-grace-period-f1-students" }
};

export default function GracePeriodPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-12" modifiedDate="2026-07-12" author="TrackMyOPT Team" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Visa Rules</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Grace Period</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">The 60-Day Grace Period: A Practical Guide for F-1 Students</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Your OPT expired, or you hit your 90-day unemployment limit. What happens now? Here is exactly how the 60-day grace period works.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 6 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/60-day-grace-period-f1-students.png" alt="A calendar with a departure date circled, next to an I-20 and an airline itinerary" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">The US immigration system provides a buffer for F-1 students transitioning out of their status. This buffer is known as the 60-day grace period. However, many students misunderstand when it applies, what they can do during this time, and how travel affects it.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">When Do You Get a 60-Day Grace Period?</h2>
                <p>You are granted a 60-day grace period in three specific scenarios:</p>
                <ol>
                    <li><strong>Program Completion:</strong> After you graduate, before your OPT starts (or if you choose not to apply for OPT).</li>
                    <li><strong>OPT Expiration:</strong> After you successfully complete your 12-month standard OPT or 24-month STEM OPT extension.</li>
                    <li><strong>Hitting the Unemployment Limit (Sometimes):</strong> If you exceed your 90-day OPT unemployment limit (or 150 days on STEM), <em>technically</em> you fall out of status immediately. However, historically, SEVP has not auto-terminated records on day 91, effectively giving students a de facto grace period to leave the country. Do not rely on this—always assume you must leave immediately if you breach the unemployment limit.</li>
                </ol>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> When You Do NOT Get a Grace Period</h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">If you drop out of school, are expelled, or if your SEVIS record is terminated by your DSO for violating your status (like working illegally), you do <strong>not</strong> receive a 60-day grace period. You must depart the United States immediately.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What Can You Do During the Grace Period?</h2>
                <p>During the 60 days following your OPT expiration, you have three legal options:</p>

                <h3 className="text-xl font-bold mt-8 mb-4">1. Prepare to Depart the US</h3>
                <p>The primary purpose of the grace period is to give you time to pack your apartment, sell your car, say your goodbyes, and arrange travel back to your home country.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">2. Transfer to a New Degree Program</h3>
                <p>You can use the 60 days to transfer your SEVIS record to a new school to start a new degree (e.g., finishing a Bachelor's and transferring to start a Master's). Your new program must start within 5 months of your OPT end date or the transfer release date, whichever is earlier.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">3. Change Your Visa Status</h3>
                <p>If you have a pending H-1B petition, you can remain in the US while it processes (this is covered under Cap-Gap). You can also use this time to file a change of status to a different visa category, such as an F-2 dependent visa, a B-2 tourist visa (to give yourself more time to wrap up affairs), or an O-1 visa.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Golden Rules of the Grace Period</h2>
                <ul>
                    <li><strong>NO WORKING:</strong> You absolutely cannot work during your grace period. The moment your EAD card expires, you must stop working, even if you are waiting for a STEM extension or H-1B to be approved.</li>
                    <li><strong>NO RE-ENTRY:</strong> If you leave the United States during your 60-day grace period, <strong>the grace period ends immediately</strong>. You cannot travel to Mexico for a week and re-enter the US using your expired EAD and F-1 visa. Once you leave, you cannot come back on that F-1 record.</li>
                </ul>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Never Miss a Deadline</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">The transition from OPT to the grace period is critical. <strong>TrackMyOPT</strong> automatically calculates your exact expiration dates and sends you warnings well before your grace period begins, so you have plenty of time to apply for a STEM extension, transfer schools, or pack.</p>
                </div>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Track Your Status with Confidence</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Don't guess when your status expires. Use TrackMyOPT's precision timeline tools to know exactly when your grace period starts and ends.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/fall-out-of-f1-status-reinstatement-options" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Falling Out of Status</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">What happens if you stay past your 60-day grace period? Understand the severe consequences of overstaying.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/h1b-cap-gap-extension-guide" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Cap-Gap Extension</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">If your employer filed for an H-1B, learn how the Cap-Gap extension legally bridges the gap after your OPT expires.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
