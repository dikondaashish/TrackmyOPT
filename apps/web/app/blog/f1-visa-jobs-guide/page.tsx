import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, Briefcase, BookOpen, MapPin } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "F-1 Visa Jobs 2026: How to Find Jobs as an International Student",
    description: "Complete guide to finding jobs on F-1 visa in 2026. OPT jobs, CPT employment, on-campus work, H-1B sponsor companies, and job search strategies for international students.",
    keywords: ["F-1 visa jobs", "international student jobs", "OPT jobs", "F-1 student employment", "jobs for international students", "H-1B sponsor jobs", "CPT employment"],
    openGraph: { title: "F-1 Visa Jobs Guide 2026 | TrackMyOPT", description: "How to find jobs as an F-1 international student.", url: "https://www.trackmyopt.com/blog/f1-visa-jobs-guide", type: "article" },
    alternates: { canonical: "https://www.trackmyopt.com/blog/f1-visa-jobs-guide" },
};

export default function F1JobsArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">F-1 Visa Jobs</span>
            </nav>
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">Careers</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />12 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">F-1 Visa Jobs 2026: How to Find Jobs as an International Student</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">Finding a job as an F-1 student has unique challenges — work authorization, OPT timing, H-1B sponsorship. Here's the complete strategy.</p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 10, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Key Takeaway</h2>
                <p className="text-green-800 dark:text-green-200 font-medium">F-1 students have <strong>4 legal work authorization types</strong>: on-campus employment, CPT, pre-completion OPT, and post-completion OPT. To work long-term, you'll need an employer willing to sponsor H-1B. Start your job search <strong>3-6 months before graduation</strong>.</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">F-1 Student Work Authorization Types</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Type</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">When</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Hours</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Requires</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["On-Campus", "During enrollment", "20 hrs/wk (school), 40 (breaks)", "Valid F-1 status only"],
                                    ["CPT", "During enrollment", "Part-time or full-time", "DSO authorization, job offer"],
                                    ["Pre-Completion OPT", "During enrollment", "20 hrs/wk max", "I-765 filing, EAD card"],
                                    ["Post-Completion OPT", "After graduation", "Full-time (20+ hrs)", "I-765 filing, EAD card"],
                                    ["STEM OPT Extension", "After initial OPT", "Full-time (20+ hrs)", "STEM degree, E-Verify employer"],
                                ].map(([type, when, hours, req], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}><td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{type}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{when}</td><td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{hours}</td><td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{req}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Job Search Strategy for F-1 Students</h2>
                    <div className="space-y-4">
                        {[
                            { step: "Start 6 Months Before Graduation", tips: ["Begin networking at career fairs and industry events", "Update your resume with US formatting (no photo, no DOB)", "Create LinkedIn profile and connect with alumni at target companies", "Research companies that sponsor H-1B visas using TrackMyOPT's H-1B database"] },
                            { step: "Target H-1B Sponsoring Companies", tips: ["Focus on companies with proven sponsorship track records", "Large tech companies (Google, Amazon, Microsoft) sponsor heavily", "Consulting firms (Deloitte, EY, Accenture) hire many OPT students", "Avoid companies that promise sponsorship but have no history of it"] },
                            { step: "Optimize Your Applications", tips: ["Don't mention visa status in your resume", "Prepare to discuss work authorization in interviews confidently", "Have your OPT EAD dates ready when asked", "Emphasize skills and experience over visa status"] },
                            { step: "Use the Right Job Boards", tips: ["LinkedIn (filter for H-1B sponsor companies)", "Glassdoor (search for visa sponsorship)", "MyVisaJobs.com (H-1B specific job listings)", "University career services (employer partnerships)", "TrackMyOPT Job Tracker (track applications + unemployment days)"] },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-300 text-sm font-bold">{i + 1}</div>{item.step}</h3>
                                <ul className="space-y-1">{item.tips.map((tip, j) => (<li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{tip}</li>))}</ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Industries Hiring F-1 Students in 2026</h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {[
                            { industry: "Technology", roles: "Software Engineer, Data Scientist, Product Manager, UX Designer", sponsorship: "Very High" },
                            { industry: "Finance", roles: "Financial Analyst, Quant Researcher, Risk Analyst, Investment Banking", sponsorship: "High" },
                            { industry: "Consulting", roles: "Management Consultant, Strategy Analyst, IT Consultant", sponsorship: "High" },
                            { industry: "Healthcare / Biotech", roles: "Research Scientist, Clinical Data Analyst, Biostatistician", sponsorship: "High" },
                            { industry: "Engineering", roles: "Mechanical, Civil, Electrical, Chemical Engineer", sponsorship: "Moderate" },
                            { industry: "Academia", roles: "Research Assistant, Postdoc, Teaching Assistant", sponsorship: "Cap-Exempt" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="w-4 h-4 text-green-500" />{item.industry}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.roles}</p>
                                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Sponsorship: {item.sponsorship}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: "Can F-1 students work in the US?", a: "Yes. F-1 students can work on-campus during enrollment (up to 20 hrs/wk), and off-campus through CPT (during school) or OPT (after graduation). Post-completion OPT provides 12 months of work authorization, extendable to 36 months with STEM OPT." },
                            { q: "How do I find H-1B sponsor companies?", a: "Use the USCIS H-1B Employer Data Hub, TrackMyOPT's H-1B Sponsor Database (25,000+ companies with approval rates), or filter for 'visa sponsorship' on LinkedIn and Glassdoor." },
                            { q: "When should I start looking for a job on OPT?", a: "Start 3-6 months before graduation. Apply for OPT early and begin networking. Remember: your unemployment clock starts on your OPT start date, so having a job lined up is critical." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Job Applications & OPT Days Together</h2>
                <p className="text-green-100 mb-6 max-w-lg mx-auto">TrackMyOPT's Job Tracker manages your applications while monitoring your unemployment clock.</p>
                <Link href="/features/job-tracker" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors">Try Job Tracker Free <ArrowRight className="w-4 h-4" /></Link>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", "headline": "F-1 Visa Jobs 2026: How to Find Jobs as an International Student", "author": { "@type": "Organization", "name": "TrackMyOPT" }, "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } }, "datePublished": "2026-03-10", "dateModified": "2026-03-10", "mainEntityOfPage": "https://www.trackmyopt.com/blog/f1-visa-jobs-guide" }) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Can F-1 students work in the US?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, through on-campus employment, CPT, or OPT. Post-completion OPT provides 12-36 months of work authorization." } }, { "@type": "Question", "name": "How do I find H-1B sponsor companies?", "acceptedAnswer": { "@type": "Answer", "text": "Use USCIS H-1B Employer Data Hub, TrackMyOPT's sponsor database, or filter for visa sponsorship on LinkedIn/Glassdoor." } }] }) }} />
        </article>
    );
}
