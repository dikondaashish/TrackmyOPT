import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, FileText, CheckCircle2, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "CPT Complete Guide 2026: Eligibility, Application & Rules for F-1 Students",
    description: "Everything F-1 students need to know about Curricular Practical Training (CPT): eligibility requirements, part-time vs full-time, application steps, Day 1 CPT risks, and how CPT affects your OPT.",
    keywords: ["CPT guide", "curricular practical training", "F-1 CPT", "Day 1 CPT", "CPT vs OPT", "CPT eligibility", "CPT application", "full time CPT OPT impact"],
    openGraph: {
        title: "CPT Complete Guide 2026: Eligibility, Application & Rules for F-1 Students | TrackMyOPT",
        description: "Complete guide to Curricular Practical Training for F-1 students: eligibility, application, Day 1 CPT risks, and impact on OPT.",
        url: "https://www.trackmyopt.com/blog/cpt-complete-guide",
        type: "article",
        publishedTime: "2026-07-11T00:00:00.000Z",
        authors: ["Vinay Kumar"],
        images: [
            {
                url: "/blog/cpt-complete-guide.png",
                width: 1200,
                height: 630,
                alt: "University bulletin board with CPT application forms and internship flyers",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/cpt-complete-guide",
    },
    twitter: {
        card: "summary_large_image",
        title: "CPT Complete Guide 2026: Eligibility, Application & Rules for F-1 Students | TrackMyOPT",
        description: "Complete guide to Curricular Practical Training for F-1 students: eligibility, application, Day 1 CPT risks, and impact on OPT.",
        images: ["/blog/cpt-complete-guide.png"],
    },
};

export default function CPTCompleteGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "CPT Complete Guide", url: "https://www.trackmyopt.com/blog/cpt-complete-guide" },
            ]} />
            <BlogPostSchema
                title="CPT Complete Guide 2026: Eligibility, Application & Rules for F-1 Students"
                description="Everything F-1 students need to know about Curricular Practical Training (CPT): eligibility, application, Day 1 CPT risks, and how CPT affects OPT."
                publishedDate="2026-02-02"
                modifiedDate="2026-02-02"
                author="Vinay Kumar"
                faqItems={[
                    { question: "What is CPT and who is eligible?", answer: "Curricular Practical Training (CPT) is a type of F-1 work authorization that allows students to participate in internships, co-ops, or practicums that are an integral part of their curriculum. You must have been enrolled full-time for at least one academic year (two semesters) before you can apply, unless your program requires immediate participation." },
                    { question: "Does using CPT affect my OPT eligibility?", answer: "Part-time CPT (20 hours/week or less) does not affect your OPT eligibility at all. However, if you accumulate 12 months or more of full-time CPT, you become ineligible for post-completion OPT at that same degree level." },
                    { question: "What is Day 1 CPT and is it risky?", answer: "Day 1 CPT refers to programs that authorize CPT from the first day of enrollment, without requiring one academic year of study first. While legal at certain schools, USCIS heavily scrutinizes Day 1 CPT during H-1B and green card petitions, and it may raise questions about maintaining valid F-1 status." },
                    { question: "Can I do CPT and OPT at the same time?", answer: "No, you cannot use CPT and OPT simultaneously. CPT is for students who are still enrolled in their degree program, while OPT is for students who have completed or are about to complete their program." },
                    { question: "How long does CPT authorization take?", answer: "CPT is authorized by your Designated School Official (DSO), not USCIS. Processing typically takes 1-3 weeks depending on your school. You receive an updated I-20 with CPT authorization noted on page 2." },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">CPT Guide</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                        CPT Guide
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        12 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    CPT Complete Guide 2026: Eligibility, Application & Rules for F-1 Students
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Curricular Practical Training (CPT) is one of the most valuable work authorizations available to F-1 students — but using it incorrectly can cost you your OPT. Here is everything you need to know.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: February 2, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            {/* Hero Image */}
            <figure className="mb-12">
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800">
                    <BlogPostImage src="/blog/cpt-complete-guide.png" alt="University bulletin board with CPT application forms and internship flyers" className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800" sizes="(max-width: 768px) 100vw, 768px" priority />
                </div>
                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    CPT allows F-1 students to gain practical work experience while still enrolled in their degree program.
                </figcaption>
            </figure>

            {/* TL;DR */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">TL;DR / Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    <strong>CPT is work authorization for F-1 students to do internships, co-ops, or practicums that are an integral part of their curriculum.</strong> You need to be enrolled full-time for at least one academic year first (unless your program requires immediate participation). Part-time CPT does NOT affect your OPT — but 12+ months of full-time CPT will make you ineligible for post-completion OPT.
                </p>
            </div>

            {/* Key Takeaway */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    CPT is authorized by your school (DSO), not USCIS. It must be directly related to your major and required or integral to your curriculum. <strong>Part-time CPT = safe for OPT. Full-time CPT for 12+ months = no OPT.</strong>
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/students-and-employment" target="_blank" rel="noopener noreferrer" className="underline">USCIS.gov</a>, 8 CFR § 214.2(f)(10)(i)
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    In This Guide
                </h2>
                <nav className="space-y-2">
                    {[
                        ["#what-is-cpt", "What Is Curricular Practical Training (CPT)?"],
                        ["#eligibility", "CPT Eligibility Requirements"],
                        ["#part-time-vs-full-time", "Part-Time vs Full-Time CPT"],
                        ["#application", "How to Apply for CPT (Step-by-Step)"],
                        ["#cpt-opt-impact", "How CPT Affects Your OPT Eligibility"],
                        ["#day1-cpt", "Day 1 CPT: Risks and Red Flags"],
                        ["#cpt-vs-opt", "CPT vs OPT: Key Differences"],
                        ["#compliance", "Staying Compliant on CPT"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="what-is-cpt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Is Curricular Practical Training (CPT)?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Curricular Practical Training (CPT) is a type of off-campus work authorization available to F-1 students that allows them to participate in <strong>internships, cooperative education (co-ops), practicums, or other work experiences</strong> that are an integral part of their established curriculum.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Unlike <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 underline">OPT</Link>, which is authorized by USCIS and used after (or just before) completing your degree, CPT is authorized <strong>by your school's Designated School Official (DSO)</strong> and is used while you are still actively enrolled in your program.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            &quot;CPT must be an integral part of the student&apos;s curriculum — either required by the program or for which academic credit is given.&quot;
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — Source: 8 CFR § 214.2(f)(10)(i)
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                CPT Can Be Used For
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Required internships</li>
                                <li>• Cooperative education (co-op)</li>
                                <li>• Practicums and clinical rotations</li>
                                <li>• Student teaching placements</li>
                                <li>• Work-study programs for credit</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                CPT Cannot Be Used For
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Jobs unrelated to your major</li>
                                <li>• Work after graduation (use OPT)</li>
                                <li>• Positions with no academic connection</li>
                                <li>• Work before completing 1 year of study*</li>
                                <li>• Self-employment or freelancing</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="eligibility" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        CPT Eligibility Requirements
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        To qualify for CPT, you must meet <strong>all</strong> of the following requirements:
                    </p>

                    <div className="space-y-3">
                        {[
                            { title: "Valid F-1 Status", desc: "You must be in valid F-1 student status with an active SEVIS record. Any status violations disqualify you." },
                            { title: "One Academic Year of Full-Time Study", desc: "You must have been enrolled full-time for at least one full academic year (two semesters or three quarters) at your current school. Exception: graduate programs that require immediate CPT participation." },
                            { title: "Job Offer in Hand", desc: "You must have a specific job or internship offer before applying. CPT cannot be authorized speculatively — your DSO needs the employer name, address, dates, and hours." },
                            { title: "Integral to Curriculum", desc: "The work experience must be required by your program, a course requirement, or offered as a for-credit cooperative education component. Your academic advisor must confirm this." },
                            { title: "Registered for Relevant Course", desc: "Most schools require you to be simultaneously enrolled in the internship/co-op course that corresponds to your CPT. Check with your international office." },
                        ].map((req, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{req.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{req.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="part-time-vs-full-time" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Part-Time vs Full-Time CPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The distinction between part-time and full-time CPT is <strong>critical</strong> because it directly affects your future OPT eligibility.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Feature</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Part-Time CPT</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Full-Time CPT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Hours per Week</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">20 hours or less</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">More than 20 hours</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">During Classes?</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Yes — while enrolled full-time</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Typically during summer or final semester</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Impact on OPT</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-green-700 dark:text-green-400">No impact ✓</td>
                                    <td className="p-3 border dark:border-zinc-700 font-semibold text-red-700 dark:text-red-400">12+ months = No OPT ✗</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Duration Limit</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">No practical limit</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Keep under 12 months to preserve OPT</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mt-6">
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Critical Warning: The 12-Month Rule
                        </h3>
                        <p className="text-red-800 dark:text-red-200">
                            If you accumulate <strong>12 months or more of full-time CPT</strong> at any single degree level, you become permanently ineligible for post-completion OPT at that degree level. This is per <a href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214" target="_blank" rel="noopener noreferrer" className="underline">8 CFR § 214.2(f)(10)(i)</a>. There is no exception or waiver.
                        </p>
                    </div>
                </section>

                <section id="application" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Apply for CPT (Step-by-Step)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Unlike OPT, CPT does not require a USCIS application. Your DSO authorizes CPT directly by updating your I-20. Here is the process:
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: "1", title: "Secure a Job or Internship Offer", desc: "Get a written offer letter with your employer's name, address, job title, start/end dates, and weekly hours. The position must be directly related to your major." },
                            { step: "2", title: "Register for the CPT Course", desc: "Enroll in the internship, co-op, or practicum course at your school. This course must correspond to the CPT work experience. Your academic advisor can help identify the right course." },
                            { step: "3", title: "Get Academic Advisor Approval", desc: "Your faculty advisor or department head must sign off confirming the position is integral to your curriculum. Most schools have a standard CPT recommendation form." },
                            { step: "4", title: "Submit CPT Request to Your DSO", desc: "Bring your offer letter, course registration confirmation, and advisor approval to your International Student Office. Your DSO will review and authorize CPT on your I-20." },
                            { step: "5", title: "Receive Updated I-20", desc: "Your DSO issues a new I-20 with CPT authorization noted on page 2, including your employer name, employment dates, and whether it's part-time or full-time. This is your work authorization." },
                            { step: "6", title: "Start Work on the Authorized Date", desc: "You may ONLY begin work on the start date printed on your I-20. Starting even one day early is considered unauthorized employment and violates your F-1 status." },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-lg font-bold flex-shrink-0">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mt-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Timeline Estimate
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                Offer letter secured: Week 1
                            </p>
                            <p className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                Course registration + advisor approval: Week 1-2
                            </p>
                            <p className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                DSO processing: 1-3 weeks (varies by school)
                            </p>
                            <p className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                Total: <strong>2-5 weeks from offer to authorization</strong>
                            </p>
                        </div>
                    </div>
                </section>

                <section id="cpt-opt-impact" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How CPT Affects Your OPT Eligibility
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is the most important thing to understand about CPT. The impact depends entirely on whether your CPT was <strong>part-time or full-time</strong>:
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Part-Time CPT (≤20 hours/week)</h3>
                                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                    <strong>No impact on OPT.</strong> You can do unlimited part-time CPT and still qualify for the full 12 months of post-completion OPT plus STEM OPT extension.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Full-Time CPT (&gt;20 hours/week) — Under 12 Months</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                    <strong>No impact on OPT eligibility.</strong> However, track your cumulative full-time CPT months carefully. Once you cross 12, there is no going back.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Full-Time CPT (&gt;20 hours/week) — 12+ Months</h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                    <strong>You lose OPT eligibility entirely.</strong> You will NOT be able to apply for post-completion OPT at that degree level. This cannot be reversed. The 12-month count is cumulative across all full-time CPT authorizations at that degree level.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="day1-cpt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Day 1 CPT: Risks and Red Flags
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        &quot;Day 1 CPT&quot; programs allow students to begin CPT from their very first day of enrollment, bypassing the standard one-academic-year requirement. While <strong>technically legal</strong> at certain schools whose programs require immediate CPT participation, these programs carry significant immigration risks.
                    </p>

                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl my-6">
                        <p className="text-red-900 dark:text-red-100 font-semibold text-lg">
                            &quot;USCIS has increased scrutiny of Day 1 CPT programs. Multiple H-1B petitions have been denied based on concerns about the legitimacy of prior CPT employment.&quot;
                        </p>
                        <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                            — Source: AILA Practice Advisory, 2025
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Red Flags USCIS Looks For</h3>
                    <div className="space-y-3">
                        {[
                            "The school is not well-known or has been flagged by SEVP",
                            "You continue working at the same employer as before enrolling",
                            "Classes are primarily online with minimal in-person attendance",
                            "You enrolled primarily for work authorization, not academic advancement",
                            "The school has a disproportionately high percentage of CPT students",
                            "Your previous OPT or H-1B status recently ended before enrollment",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-red-700 dark:text-red-200 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mt-6">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Our Recommendation</h3>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                            If you're considering a Day 1 CPT program, consult an immigration attorney first. Understand the risks to your future H-1B and green card petitions. Read our <Link href="/blog/day-1-cpt-vs-opt" className="underline font-medium">Day 1 CPT vs OPT comparison</Link> for a deeper dive.
                        </p>
                    </div>
                </section>

                <section id="cpt-vs-opt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        CPT vs OPT: Key Differences
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        CPT and OPT are both F-1 work authorizations, but they serve different purposes and have different rules:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Feature</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">CPT</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">OPT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Authorized By", "Your DSO (school)", "USCIS (federal)"],
                                    ["When Used", "During your degree", "Before or after graduation"],
                                    ["Application", "No USCIS filing — DSO updates I-20", "Form I-765 + filing fee to USCIS"],
                                    ["Processing Time", "1-3 weeks (school)", "3-6 months (USCIS)"],
                                    ["Duration", "Per semester — renewable", "12 months (+ 24 STEM extension)"],
                                    ["Employer Specific?", "Yes — tied to one employer", "No — can change employers"],
                                    ["Must Be Related to Major?", "Yes", "Yes"],
                                    ["EAD Card Required?", "No — I-20 is authorization", "Yes — EAD card required"],
                                ].map(([feature, cpt, opt], i) => (
                                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">{feature}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{cpt}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{opt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="compliance" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Staying Compliant on CPT
                    </h2>
                    <div className="space-y-3">
                        {[
                            { tip: "Never start work before your CPT start date", detail: "Even one day early is unauthorized employment, which can result in SEVIS termination and bars on future immigration benefits." },
                            { tip: "Never work past your CPT end date", detail: "Your CPT authorization has a specific end date on your I-20. Working beyond it without renewal is unauthorized employment." },
                            { tip: "Track full-time CPT months carefully", detail: "Maintain a personal log of all full-time CPT authorizations. Once you hit 12 cumulative months, you lose OPT eligibility forever at that degree level." },
                            { tip: "Only work for the employer listed on your I-20", detail: "CPT is employer-specific. If you change employers, you need a new CPT authorization from your DSO before starting work." },
                            { tip: "Maintain full-time enrollment", detail: "You must remain a full-time student while on CPT (unless it's your final semester and you need fewer credits to graduate)." },
                            { tip: "Renew CPT each semester", detail: "CPT authorization is typically granted per semester. Submit renewal paperwork before each new term if continuing." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{i + 1}. {item.tip}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Product CTA */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 my-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Planning OPT After CPT? Track It All</h3>
                        </div>
                        <p className="text-blue-100 mb-6 text-lg max-w-2xl">
                            TrackMyOPT helps you monitor your OPT timeline, unemployment days, and USCIS case status — so you can transition smoothly from CPT to OPT.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-blue-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>Real-time OPT unemployment day tracking</span>
                            </li>
                            <li className="flex items-center gap-3 text-blue-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>Automated USCIS case status monitoring</span>
                            </li>
                            <li className="flex items-center gap-3 text-blue-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <span>100% Free for F-1 International Students</span>
                            </li>
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "What is CPT and who is eligible?", answer: "Curricular Practical Training (CPT) is F-1 work authorization for internships, co-ops, or practicums integral to your curriculum. You must be enrolled full-time for at least one academic year before applying (unless your program requires immediate participation)." },
                            { question: "Does using CPT affect my OPT eligibility?", answer: "Part-time CPT (≤20 hours/week) does NOT affect OPT at all. However, 12+ months of cumulative full-time CPT at a single degree level makes you permanently ineligible for post-completion OPT at that level." },
                            { question: "What is Day 1 CPT and is it risky?", answer: "Day 1 CPT programs authorize CPT from the first day of enrollment. While legal at certain schools, USCIS heavily scrutinizes this during H-1B and green card petitions, and it may raise questions about your F-1 status." },
                            { question: "Can I do CPT and OPT at the same time?", answer: "No. CPT is for students still enrolled in their program. OPT is for students who have completed or are about to complete their degree. They cannot overlap." },
                            { question: "How long does CPT authorization take?", answer: "CPT is authorized by your DSO, not USCIS, so it typically takes 1-3 weeks depending on your school's processing time. You receive an updated I-20 with CPT noted on page 2." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.question}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm" itemProp="text">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/day-1-cpt-vs-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Day 1 CPT vs OPT: Key Differences</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day OPT Unemployment Rule</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Planning Your OPT After CPT?</h2>
                <p className="text-purple-100 mb-6 max-w-lg mx-auto">
                    Join 2,500+ F-1 students who use TrackMyOPT to track deadlines, monitor unemployment days, and find H-1B sponsors.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
