import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "Spring 2026 Graduates: How to Time Your OPT Application to Avoid a Work Gap",
    description: "If you are graduating in May or June 2026, the timing of your OPT I-765 application directly determines whether you can work on day one. Here is the exact timeline to follow, what delays to expect, and how to protect yourself.",
    keywords: [
        "OPT application timing spring 2026",
        "spring graduate OPT timeline",
        "how early to apply for OPT",
        "OPT I-765 filing deadline",
        "OPT EAD delay spring 2026",
        "when to submit OPT application",
        "OPT application 90 days before graduation",
        "avoid OPT work gap",
        "F-1 spring graduate OPT",
        "OPT start date after graduation 2026",
    ],
    openGraph: {
        title: "Spring 2026 Graduates: Time Your OPT Application to Avoid a Work Gap | TrackMyOPT",
        description: "Graduating in May or June 2026? The timing of your OPT application directly determines whether you can start work on day one. Here is the exact timeline.",
        url: "https://www.trackmyopt.com/blog/spring-graduates-opt-application-timing-2026",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Spring 2026 Graduates: OPT Application Timing Guide",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/spring-graduates-opt-application-timing-2026",
    },
    twitter: {
        card: "summary_large_image",
        title: "Spring 2026 Graduates: Time Your OPT Application to Avoid a Work Gap | TrackMyOPT",
        description: "Graduating in May or June 2026? The timing of your OPT application directly determines whether you can start work on day one. Here is the exact timeline.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

const faqItems = [
    {
        question: "When is the earliest I can apply for OPT as a spring 2026 graduate?",
        answer: "You can apply for post-completion OPT up to 90 days before your program end date (not graduation ceremony date — your I-20 program end date). For most spring graduates, that means you could file as early as late February or early March 2026 for a May/June program end date. Filing at the 90-day mark gives you the maximum possible buffer against processing delays.",
    },
    {
        question: "What happens if my OPT EAD is not approved by the time I graduate?",
        answer: "If you have a timely, pending OPT application (filed before your program end date), you are still in valid F-1 status during the 60-day grace period after your program ends. You cannot legally work until your EAD is approved and in hand with the correct start date — but you are not out of status. The risk is that processing delays eat into your 12-month OPT window.",
    },
    {
        question: "Can OPT be backdated if my EAD is approved late?",
        answer: "No. Your OPT period begins on the requested start date on your I-765, or the approval date, whichever is later. USCIS does not add back time lost to processing delays. If your EAD approval takes 4 months, you have 4 fewer months of OPT to use. This is why early filing is critical.",
    },
    {
        question: "Can OPT extend beyond 14 months after graduation even if USCIS approved late?",
        answer: "No. OPT cannot extend beyond 14 months after your program completion date, regardless of when USCIS approved your application. If USCIS approves your OPT 6 months late, you effectively lose those 6 months. The 14-month cap is hard — it does not shift based on processing time.",
    },
    {
        question: "My DSO has not I-20 endorsed yet. What should I do?",
        answer: "Contact your DSO (Designated School Official) immediately. They must recommend OPT in your SEVIS record and issue an updated I-20 before you can file your I-765 with USCIS. DSO processing at your university can take 1–3 weeks, so build that time into your planning. Start the request to your DSO at the 90-day mark, not on graduation day.",
    },
    {
        question: "What is the 60-day grace period and does it affect my unemployment count?",
        answer: "After your program end date, you have a 60-day grace period in valid F-1 status to prepare for departure or await your OPT start. If your OPT has been approved and started, unemployment counting begins from your OPT start date — not from your graduation date. The 60-day grace period is not counted as unemployment against your 90-day OPT limit.",
    },
];

export default function SpringGraduatesOptTimingPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Spring Graduates OPT Application Timing 2026", url: "https://www.trackmyopt.com/blog/spring-graduates-opt-application-timing-2026" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-05-29"
                modifiedDate="2026-05-29"
                author="Vinay Kumar"
                faqItems={faqItems}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Spring OPT Timing 2026</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        OPT BASICS
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        8 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Spring 2026 Graduates: How to Time Your OPT Application to Avoid a Work Gap
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you are graduating in May or June 2026, the window to file your OPT application is right now — or possibly already closing. Here is the exact timeline, what to expect from USCIS processing in 2026, and how to make sure delays do not cost you months of work authorization.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: May 28, 2026</span>
                    <span>•</span>
                    <span>Written by Vinay Kumar</span>
                </div>
            </header>

            {/* Quick Answer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    File your OPT I-765 application up to 90 days before your I-20 program end date. With USCIS processing times in 2026 running 3–5+ months for many applicants, filing at the 90-day mark is no longer early — it is the minimum needed to avoid a gap. OPT cannot extend beyond 14 months after graduation regardless of processing delays.
                </p>
            </div>

            {/* Key Takeaway */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    The Critical Rule Most Students Miss
                </h2>
                <p className="text-red-800 dark:text-red-200 font-medium">
                    USCIS does not give you back time lost to processing delays. <strong>OPT cannot extend beyond 14 months after your program end date</strong> no matter when USCIS approves your application. A 4-month processing delay means a 4-month shorter OPT period — and lost work authorization you can never recover.
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" target="_blank" rel="noopener noreferrer" className="underline">USCIS — OPT for F-1 Students</a>, 8 CFR § 214.2(f)(10)(ii)
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#key-dates", "The 5 Dates Every Spring Graduate Must Know"],
                        ["#timeline", "Your Complete OPT Application Timeline (Spring 2026)"],
                        ["#processing-times", "What USCIS Processing Times Look Like in 2026"],
                        ["#14-month-cap", "Why the 14-Month Cap Is Non-Negotiable"],
                        ["#grace-period", "The 60-Day Grace Period: What It Does and Does Not Do"],
                        ["#checklist", "Pre-Filing Checklist: Before You Submit"],
                        ["#after-filing", "After You File: What to Monitor"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href as string} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="key-dates" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The 5 Dates Every Spring Graduate Must Know
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        OPT timing is governed by 5 key dates. Get any of them wrong and you either cannot file, cannot work, or lose months of your OPT period. Here is what each one means:
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                label: "1. I-20 Program End Date",
                                color: "blue",
                                description: "This is the date printed on your current I-20 as your program end date. This is NOT your graduation ceremony date. It is the official end of your academic program in SEVIS. All OPT timing calculations use this date.",
                                warning: null,
                            },
                            {
                                label: "2. 90-Day Mark Before Program End Date",
                                color: "green",
                                description: "The earliest date you can file your OPT I-765 application with USCIS. For a May 15 program end date, this is February 14. This is the target filing date — not a backup option.",
                                warning: "File on this date or as close to it as possible.",
                            },
                            {
                                label: "3. OPT Requested Start Date",
                                color: "blue",
                                description: "The date you request as your OPT start date on your I-765. It must be after your program end date and within 60 days of it. Your actual OPT can only start on this date or the approval date — whichever is later.",
                                warning: null,
                            },
                            {
                                label: "4. EAD Approval Date",
                                color: "amber",
                                description: "The date USCIS approves your I-765 and issues your Employment Authorization Document. You cannot legally work on OPT until this date. If this is later than your requested start date, your OPT starts from the approval date — and that time is lost.",
                                warning: "Every month of delay here is a month of OPT you never get back.",
                            },
                            {
                                label: "5. 14-Month Hard Cap",
                                color: "red",
                                description: "OPT cannot extend beyond 14 months after your I-20 program end date, no matter what. If USCIS approves your EAD 6 months late, your OPT period ends 6 months earlier than it otherwise would have. There is no exception to this rule.",
                                warning: "This cap does not shift. It cannot be extended. Plan around it.",
                            },
                        ].map((item, i) => {
                            const bgMap: Record<string, string> = {
                                blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                                green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                                amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
                                red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                            };
                            const textMap: Record<string, string> = {
                                blue: "text-blue-900 dark:text-blue-100",
                                green: "text-green-900 dark:text-green-100",
                                amber: "text-amber-900 dark:text-amber-100",
                                red: "text-red-900 dark:text-red-100",
                            };
                            const subMap: Record<string, string> = {
                                blue: "text-blue-800 dark:text-blue-200",
                                green: "text-green-800 dark:text-green-200",
                                amber: "text-amber-800 dark:text-amber-200",
                                red: "text-red-800 dark:text-red-200",
                            };
                            return (
                                <div key={i} className={`p-5 rounded-xl border ${bgMap[item.color]}`}>
                                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${textMap[item.color]}`}>
                                        <CalendarDays className="w-4 h-4 flex-shrink-0" />
                                        {item.label}
                                    </h3>
                                    <p className={`text-sm ${subMap[item.color]}`}>{item.description}</p>
                                    {item.warning && (
                                        <p className={`text-xs font-semibold mt-2 ${subMap[item.color]}`}>⚠️ {item.warning}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section id="timeline" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Your Complete OPT Application Timeline (Spring 2026 Example)
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Here is a worked example for a student with an I-20 program end date of <strong>May 15, 2026</strong>:
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-blue-100 dark:bg-blue-900/40">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Date</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Action</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Why</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Feb 14, 2026", "Contact DSO to initiate OPT recommendation", "DSO processing takes 1–3 weeks. Starting here gives buffer."],
                                    ["Feb 14, 2026", "Earliest filing date (90 days before May 15)", "Do not wait — file the same day your DSO issues the updated I-20."],
                                    ["Feb 14 – Mar 1", "Submit I-765 + I-20 + passport copy + fees to USCIS", "Earlier submission = earlier in the processing queue."],
                                    ["May 15, 2026", "I-20 program end date", "After this date you are in the 60-day grace period."],
                                    ["May 15 – Jul 14", "60-day grace period", "You are in valid F-1 status but cannot work until EAD is approved."],
                                    ["Jun–Jul 2026 (estimated)", "EAD approval (based on current processing times)", "At 3–5 month processing, a February filing should yield a summer approval."],
                                    ["Jun–Jul 2026", "OPT work authorization begins", "You can start working as soon as EAD is approved and start date is reached."],
                                    ["Jul 14, 2026", "Grace period ends", "If EAD not yet approved, consult your DSO about your options immediately."],
                                    ["Jul 15, 2027 (14-month cap)", "Latest possible OPT end date", "14 months after May 15, 2026, regardless of approval date."],
                                ].map(([date, action, why], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white text-xs">{date}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm">{action}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-500 dark:text-gray-400 text-xs">{why}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="processing-times" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What USCIS Processing Times Look Like in 2026
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is where spring 2026 is genuinely different from previous years. USCIS is processing I-765 OPT applications more slowly than ever, with some students reporting extreme delays.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "My STEM OPT I-765 was filed August 1, 2025 and was still pending in January 2026 — nearly 6 months later."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — F-1 student report, r/f1visa, 2026
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Country-specific processing holds</h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                    Some OPT and STEM OPT applications from nationals of certain countries are in effectively frozen queues under a USCIS policy hold. <strong>Premium processing does not bypass these country-specific holds.</strong> If you are a national of a country that USCIS has flagged for additional review, your application may be held significantly longer than average published processing times suggest.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Published processing times may not reflect reality</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                    USCIS currently lists I-765 processing times on their website. However, multiple students in 2025–2026 have reported actual processing times significantly exceeding published estimates. Check the USCIS processing times page regularly and sign up for case status email alerts immediately after filing.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">What early filing actually buys you</h3>
                                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                    Filing at the 90-day mark means USCIS receives your application roughly 3 months before your program ends. Even at 4–5 month processing, this gives you a reasonable chance of having your EAD approved within your 60-day grace period after graduation — meaning zero work gap.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="14-month-cap" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why the 14-Month Cap Is Non-Negotiable
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is one of the most important and least understood rules in the OPT program. Under 8 CFR § 214.2(f)(10)(ii), post-completion OPT cannot be authorized beyond 14 months after the student's program completion date — regardless of when USCIS approved the application.
                    </p>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mt-4 mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">The Math That Hurts</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>📅 Program end date: <strong>May 15, 2026</strong></p>
                            <p>📋 I-765 filed: <strong>February 14, 2026</strong> (90-day mark)</p>
                            <p>⏳ USCIS approval date: <strong>September 1, 2026</strong> (6.5 months processing)</p>
                            <p>🗓️ OPT actual start: <strong>September 1, 2026</strong></p>
                            <p>🚫 OPT hard end date: <strong>July 15, 2027</strong> (14 months after May 15, 2026)</p>
                            <p className="pt-2 font-semibold text-red-700 dark:text-red-400">
                                Result: Only ~10.5 months of actual OPT instead of 12 — 1.5 months lost to delays, never recovered.
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Every month of processing delay is a month subtracted from your actual usable OPT time. This is not a theoretical concern — it is happening to students in the 2025–2026 cycle right now.
                    </p>
                </section>

                <section id="grace-period" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        The 60-Day Grace Period: What It Does and Does Not Do
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        After your I-20 program end date, F-1 students get a <strong>60-day grace period</strong>. During this period, you remain in valid F-1 status. But the grace period is widely misunderstood.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">What the 60-day grace period DOES</h3>
                                <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                                    <li>• Keeps you in valid F-1 status after your program ends</li>
                                    <li>• Gives you time for your OPT EAD to be approved and delivered</li>
                                    <li>• Does not count against your 90-day OPT unemployment limit</li>
                                    <li>• Allows you to remain in the US while waiting for your approved EAD</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">What the 60-day grace period does NOT do</h3>
                                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                                    <li>• Does NOT authorize you to work — you cannot work until your EAD is approved</li>
                                    <li>• Does NOT stop the 14-month OPT clock — that runs from your program end date</li>
                                    <li>• Does NOT extend if your OPT EAD takes longer than 60 days to arrive</li>
                                    <li>• Does NOT apply if you never filed an OPT application — no application, no grace period extension</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ If your EAD is not approved within 60 days of your program end date:</strong> You are no longer in valid F-1 status. Consult your DSO and an immigration attorney immediately. Do not simply wait — the consequences of falling out of status compound quickly.
                        </p>
                    </div>
                </section>

                <section id="checklist" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Pre-Filing Checklist: Before You Submit Your OPT Application
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Use this checklist before sending your I-765 to USCIS. An incomplete or incorrect application causes a Request for Evidence (RFE) — which adds weeks or months to your processing time.
                    </p>

                    <div className="space-y-3">
                        {[
                            { item: "Contact your DSO to request OPT recommendation in SEVIS", detail: "Do this first — everything else depends on your DSO updating your record and issuing an updated I-20." },
                            { item: "Receive your updated I-20 with OPT recommendation", detail: "Your updated I-20 will show 'OPT Recommended' and the dates. Check all dates and your name spelling carefully." },
                            { item: "Complete Form I-765", detail: "Use the most recent version from USCIS.gov. Select the correct eligibility category for OPT (usually (c)(3)(B) for post-completion OPT)." },
                            { item: "Prepare copies of all required documents", detail: "Passport bio page, F-1 visa stamp, all previous EADs (if any), I-94, updated I-20, copies of all previous I-20s, 2 passport photos." },
                            { item: "Pay the filing fee", detail: "Current I-765 filing fee — verify the current amount on USCIS.gov before submitting. Fee amounts change and sending the wrong amount causes rejection." },
                            { item: "Double-check your requested OPT start date", detail: "It must be after your program end date and within 60 days of it. You cannot change this date after filing without refiling." },
                            { item: "Make a complete copy of everything you send", detail: "Keep a copy of every page, every document, every check or payment receipt. You will need this if USCIS loses something or sends an RFE." },
                            { item: "Use certified mail or USCIS online filing if available", detail: "Get a delivery confirmation. Know the exact date your application reached USCIS — this is your 'receipt date' for processing time calculations." },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.item}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="after-filing" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        After You File: What to Monitor
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Filing is not the end — it is the beginning of an active monitoring phase. With 2026 processing times being unpredictable, staying on top of your case status is essential.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                action: "Set up USCIS case status email alerts immediately",
                                detail: "Go to USCIS.gov and sign up for email/text notifications on your receipt number. You will be notified of any status changes, RFEs, or approvals without needing to check manually.",
                            },
                            {
                                action: "Check the USCIS processing times page weekly",
                                detail: "The published times at uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt... are updated periodically. If your case is significantly outside the published time, you may be eligible to file an inquiry.",
                            },
                            {
                                action: "Respond to any RFE immediately",
                                detail: "If USCIS sends a Request for Evidence, the clock continues ticking during the RFE period. Get the response in as fast as possible — consult your DSO or an attorney immediately upon receiving an RFE.",
                            },
                            {
                                action: "Keep your address updated with USCIS",
                                detail: "Your EAD will be mailed to the address on file. If you move after filing, you must update your address with USCIS. A returned EAD causes significant additional delays.",
                            },
                            {
                                action: "Track your unemployment days from your OPT start date",
                                detail: "Once your EAD is approved and your OPT starts, the 90-day unemployment clock begins. Use TrackMyOPT's unemployment tracker to monitor your days in real time — especially important if you have a gap between graduation and your first job.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{i + 1}. {item.action}</h3>
                                <p className="text-sm text-blue-800 dark:text-blue-200">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
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

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Full OPT Application Checklist 2026</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day Unemployment Rule</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/is-opt-ending-dhs-rule-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Is OPT Ending? DHS Rule Explained</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your OPT Deadlines and Unemployment Days Automatically</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT keeps your OPT timeline, unemployment day counter, and employer reporting deadlines all in one place — so you always know exactly where you stand.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Track Your OPT Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
