import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Briefcase, FileText, Search, UserCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "LinkedIn Profile Optimization for F-1 Students Seeking H-1B Sponsorship | TrackMyOPT",
    description: "Learn how to optimize your LinkedIn profile to attract recruiters who offer H-1B sponsorship. Keywords, Open to Work settings, and networking strategies for F-1 students.",
    keywords: ["LinkedIn H1B sponsorship", "F1 student LinkedIn", "OPT job search", "Find H1B employer", "LinkedIn optimization international student"],
    openGraph: {
        title: "How to Optimize Your LinkedIn for H-1B Sponsorship",
        description: "Stop hiding your immigration status on LinkedIn. Learn how to strategically position yourself to attract recruiters who actually offer H-1B sponsorship.",
        type: "article",
        url: "https://trackmyopt.com/blog/linkedin-optimization-f1-h1b-sponsorship",
        images: [{ url: "/blog/linkedin-optimization-f1-h1b-sponsorship.png", width: 1200, height: 630, alt: "Laptop showing a LinkedIn profile page with an Open to Work badge next to a resume" }],
    },
    alternates: { canonical: "https://trackmyopt.com/blog/linkedin-optimization-f1-h1b-sponsorship" }
};

export default function LinkedInOptimizationPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-12" modifiedDate="2026-07-12" author="TrackMyOPT Team" canonicalUrl={metadata.alternates?.canonical as string} />
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Career Search</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">H-1B</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">LinkedIn Profile Optimization for F-1 Students Seeking H-1B Sponsorship</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Stop hiding your immigration status on LinkedIn. Learn how to strategically position yourself to attract recruiters who actively offer H-1B sponsorship.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span><span>Updated July 12, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src="/blog/linkedin-optimization-f1-h1b-sponsorship.png" alt="Laptop showing a LinkedIn profile page with an Open to Work badge next to a resume" className="object-cover w-full h-full" />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">Most international students make a fatal mistake on LinkedIn: they try to look exactly like domestic applicants. But recruiters using LinkedIn Recruiter have filters specifically for work authorization. If you don't optimize your profile correctly, you will waste time interviewing with companies that have a strict "no sponsorship" policy.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The "Open to Work" Settings</h2>
                <p>When you turn on "Open to Work" (either the green photo badge or the recruiters-only setting), LinkedIn asks you several questions. Here is how an F-1 student should answer them:</p>
                <ul>
                    <li><strong>Job Titles:</strong> List 3-5 specific titles (e.g., "Software Engineer," "Data Analyst"). Be precise.</li>
                    <li><strong>Location Types:</strong> Select "Hybrid" and "Remote" to cast the widest net.</li>
                    <li><strong>Start Date:</strong> "Immediately, I am actively applying."</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6">Should You Mention STEM OPT or Sponsorship in Your Headline?</h2>
                <p><strong>Yes, but do it strategically.</strong> Your headline is the first thing a recruiter sees. Instead of just "Master's Student at University of XYZ," try this formula:</p>
                <p className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg font-mono text-sm border-l-4 border-primary">Target Job Title | Core Skill 1 | Core Skill 2 | STEM OPT Eligible (3 Years Work Auth)</p>
                <p>Why this works: Recruiters searching for entry-level tech talent know what STEM OPT is. By stating you have up to 3 years of work authorization <em>before</em> needing an H-1B, you instantly become a lower-risk hire than someone who needs a visa on Day 1.</p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mt-0 mb-2"><AlertTriangle className="w-5 h-5" /> Avoid the "Desperation" Headline</h4>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-0">Never write "Actively seeking H-1B sponsorship" as your main headline. It frames you as a liability rather than an asset. Lead with your skills, then clarify your work authorization in the "About" section.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The "About" Section: The Transparency Paragraph</h2>
                <p>The bottom of your "About" summary should include a clear, professional statement regarding your immigration status. This saves you from getting rejected in the final interview round when HR finally asks about sponsorship.</p>
                <p><strong>Example to copy/paste:</strong></p>
                <blockquote className="border-l-4 border-gray-300 dark:border-zinc-700 pl-4 italic text-gray-700 dark:text-gray-300">
                    "Work Authorization: Currently on F-1 STEM OPT with work authorization through [Month, Year]. I do not require sponsorship to begin employment, but will eventually require H-1B sponsorship in the future."
                </blockquote>

                <h2 className="text-2xl font-bold mt-12 mb-6">How to Find H-1B Friendly Recruiters</h2>
                <p>Stop blindly applying to jobs. Use LinkedIn's search bar to find people who actually have the power to hire international students:</p>
                <ol>
                    <li>Search for <code>"H-1B" AND "Technical Recruiter"</code></li>
                    <li>Search for <code>"Immigration" AND "Recruiter" AND "Company Name"</code></li>
                    <li>Look at the LinkedIn profiles of international alumni from your university. Where do they work? Those companies are proven sponsors. Connect with the recruiters at those specific companies.</li>
                </ol>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Track Your Job Search Deadlines</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200">While you are networking on LinkedIn, the 90-day unemployment clock is ticking. <strong>TrackMyOPT</strong> keeps your unemployment days perfectly calculated and sends you alerts before you run out of time, giving you peace of mind while you hunt for that H-1B sponsor.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Optimizing Your Skills Section</h2>
                <p>Recruiters use LinkedIn's backend (LinkedIn Recruiter) to search for candidates based on skills. Make sure your top 3 pinned skills perfectly align with the job description of the roles you want. If you are applying for Data Science roles, your top skills should be Python, SQL, and Machine Learning—not "Teamwork" or "Microsoft Word."</p>
            </div>
            <hr className="my-12 border-gray-200 dark:border-zinc-800" />
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Focus on Networking, We'll Handle Compliance</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Job hunting on OPT is stressful enough. Let TrackMyOPT handle your unemployment counter and SEVIS reporting deadlines so you can focus 100% on securing that H-1B offer.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">Start Tracking Your OPT</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/answering-sponsorship-questions-interviews" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Answering Sponsorship Questions</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">Once LinkedIn lands you the interview, here is exactly how to answer "Do you need sponsorship?"</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/h1b-visa-alternatives-opt-expires" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">H-1B Alternatives</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">What happens if you don't get selected in the H-1B lottery? Learn your backup options.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
