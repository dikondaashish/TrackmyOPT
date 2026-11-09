import { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "OPT Grace Period: 60 Days After Graduation or OPT",
    description: "The OPT grace period is generally 60 days after your program ends or your OPT ends. See what you can do, what ends it early, and what if OPT is still pending.",
    keywords: ["opt grace period", "opt grace period after graduation", "opt grace period after expiration", "grace period after opt", "opt pending after grace period", "60 day grace period F1", "F1 student grace period", "Transfer SEVIS record"],
    openGraph: {
        title: "OPT Grace Period: 60 Days After Graduation or After OPT Ends",
        description: "How the F-1 60-day grace period works after graduation, after OPT expires, and when your OPT application is still pending on day 60.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/60-day-grace-period-f1-students",
        images: [{ url: "/blog/60-day-grace-period-f1-students.jpg", width: 1200, height: 630, alt: "A calendar with a departure date circled, next to an I-20 and an airline itinerary" }],
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/60-day-grace-period-f1-students" },
    twitter: {
        card: "summary_large_image",
        title: "OPT Grace Period: 60 Days After Graduation or After OPT Ends",
        description: "How the F-1 60-day grace period works after graduation, after OPT expires, and when your OPT application is still pending on day 60.",
        images: ["/blog/60-day-grace-period-f1-students.jpg"],
    },
};

const GRACE_PERIOD_FAQS = [
    {
        question: "How long is the OPT grace period?",
        answer: "Generally 60 days. Under 8 CFR 214.2(f)(5)(iv), an F-1 student who completes a program and any authorized practical training gets 60 days to prepare to depart or to transfer. Study in the States says you may also apply to change status during this time if you are eligible. A DHS rule published in July 2026 that would cut this to 30 days was postponed by a federal court on September 14, 2026, and USCIS says it is proceeding under the previous rules.",
    },
    {
        question: "Is there a grace period after graduation if I apply for OPT?",
        answer: "The 60 days start at your program end date. You can file your post-completion OPT application during that window: no later than 60 days after your program end date, and within 30 days of your DSO's recommendation. Once a timely application is filed, your status generally continues while it is pending.",
    },
    {
        question: "What is the grace period after OPT expires?",
        answer: "Generally 60 days after your OPT employment authorization ends. You cannot work during those days. A STEM OPT extension or cap-gap H-1B petition filed before your EAD end date can automatically extend your work authorization, but nothing filed during the grace period gives you permission to work. Study in the States says you may not apply for a STEM OPT extension during this grace period.",
    },
    {
        question: "What happens if my OPT is still pending when the 60-day grace period ends?",
        answer: "If you filed on time, you generally do not have to leave on day 60. The regulation treats your status on post-completion OPT as running from the date your application was properly filed and pending. You still cannot work until USCIS approves it, you have the EAD, and the start date arrives. Confirm your situation with your DSO.",
    },
    {
        question: "Do I get a grace period if I go over 90 days of unemployment?",
        answer: "Do not count on it. Exceeding the unemployment limit is a failure to maintain status. The regulation says a student who fails to maintain status is not eligible for an additional period for departure. Talk to your DSO right away.",
    },
    {
        question: "Can I leave the US and come back during the grace period?",
        answer: "No. Study in the States says you may not depart and return during your grace period, and leaving ends the rest of it.",
    },
];

export default function GracePeriodPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-01-11" modifiedDate="2026-11-08" author="Vinay Kumar" canonicalUrl={metadata.alternates?.canonical as string} faqItems={GRACE_PERIOD_FAQS} />
            <header className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">The OPT Grace Period: 60 Days After Graduation or After OPT Ends</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">You graduated, your OPT is ending, or your OPT application is still pending. Here is how the F-1 60-day grace period works in each case.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Visa Rules · Grace Period</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span><span>Updated November 8, 2026</span>
                </div>
            </header>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-12 border border-border shadow-card">
                <BlogPostImage src="/blog/60-day-grace-period-f1-students.jpg" alt="A calendar with a departure date circled, next to an I-20 and an airline itinerary" className="object-cover w-full h-full" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>

            <div className="border rounded-xl p-6 mb-10 border-primary-muted bg-primary-soft">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    F-1 students generally get <strong>60 days</strong> after their program end date, or after their OPT ends, to leave the US, transfer to a new school, or change status. You cannot work during those days. Nothing filed during the grace period gives you permission to work. If you filed for OPT on time, you can generally stay while it is pending, even past day 60.
                </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-l-amber-500 p-5 rounded-r-xl mb-10">
                <p className="text-amber-900 dark:text-amber-100 text-sm mb-0">
                    <strong>Status check (November 8, 2026):</strong> DHS published a rule that would replace this 60-day period with 30 days. On September 14, 2026, a federal court postponed that rule. <a href="https://www.uscis.gov/i-539" target="_blank" rel="noopener noreferrer" className="underline">USCIS says</a> it will proceed under the previous regulations until the order changes. The rule could take effect if the order is lifted, so confirm with your DSO before you act. See our <Link href="/blog/september-2026-f1-fixed-admission-rule-opt" className="underline font-semibold">Duration of Status court update</Link>.
                </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">The US immigration system gives F-1 students a short buffer when a program or OPT ends. This buffer is the 60-day grace period. Many students misunderstand when it starts, what they can do during it, and how travel affects it.</p>

                <h2 id="grace-period-compared" className="text-2xl font-bold mt-12 mb-6">OPT Grace Period: After Graduation, After OPT, and While OPT Is Pending</h2>
                <p>The rule comes from 8 CFR 214.2(f)(5)(iv). A student who has completed a program and any authorized practical training gets an additional 60 days to prepare to depart or to transfer. Here is how that plays out in the three most common situations.</p>
                <div className="not-prose overflow-x-auto my-6 surface-card">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface-strong">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">Situation</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">When the 60 days run</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-border">What to know</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 border border-border font-semibold text-gray-900 dark:text-white">After graduation (program completion)</td>
                                <td className="p-3 border border-border text-gray-700 dark:text-gray-300">From the program end date on your I-20</td>
                                <td className="p-3 border border-border text-gray-700 dark:text-gray-300">You can still file for post-completion OPT, no later than 60 days after your program end date and within 30 days of your DSO&apos;s recommendation.</td>
                            </tr>
                            <tr className="bg-surface">
                                <td className="p-3 border border-border font-semibold text-gray-900 dark:text-white">After OPT ends (OPT expiration)</td>
                                <td className="p-3 border border-border text-gray-700 dark:text-gray-300">From the end date of your OPT employment authorization</td>
                                <td className="p-3 border border-border text-gray-700 dark:text-gray-300">No work. Nothing filed during the grace period gives you permission to work. You may not apply for a STEM OPT extension during this grace period.</td>
                            </tr>
                            <tr>
                                <td className="p-3 border border-border font-semibold text-gray-900 dark:text-white">OPT still pending on day 60</td>
                                <td className="p-3 border border-border text-gray-700 dark:text-gray-300">Your status generally continues while a timely filed application is pending</td>
                                <td className="p-3 border border-border text-gray-700 dark:text-gray-300">You can generally stay, but you cannot work until approval, the EAD, and the start date on the card.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">1. The grace period after graduation</h3>
                <p>Your 60 days start at the program end date on your Form I-20. If you do not apply for OPT, you use this time to depart, transfer, or change status.</p>
                <p>If you do want OPT, the filing window overlaps with this period. You may file up to 90 days before your program end date and no later than 60 days after it. You must also file within 30 days of the date your DSO enters the recommendation in SEVIS. Missing either deadline can lead to a denial.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">2. The grace period after OPT expires</h3>
                <p>For students on post-completion OPT, the regulation defines status as ending 60 days after the OPT employment authorization expires. Study in the States puts it simply: students on post-completion OPT have 60 days after their employment ends to depart.</p>
                <p>Two common surprises. First, you cannot file a STEM OPT extension during this window, so file before your OPT end date. Second, work stops on the EAD end date unless a STEM OPT extension or cap-gap petition filed before that date extends it. See <Link href="/blog/what-happens-if-opt-expires">what happens when OPT expires</Link>.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">3. OPT pending when the grace period ends</h3>
                <p>This is the question behind many late-night searches. Under 8 CFR 214.2(f)(10)(ii)(D), status on post-completion OPT begins on the date the application was properly filed and pending approval. So a timely filed, pending application generally keeps you in status after day 60 of the post-graduation grace period.</p>
                <p>You still cannot start working. You may begin OPT only after USCIS approves your Form I-765, you receive your EAD, and the start date on it arrives. If USCIS denies the application, contact your DSO right away to confirm your departure timeline.</p>
                <div className="not-prose bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 my-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
                        <strong>Fictional example:</strong> Mei&apos;s program ended on May 15. Her DSO recommended OPT on May 20, and she filed her I-765 on June 1. By July 14, day 60 after her program end date, her case is still pending. She does not need to leave because she filed on time. She waits for her EAD before starting her job and tracks her case in the meantime.
                    </p>
                </div>
                <p>Waiting on a pending case? Check <Link href="/blog/opt-processing-time-2026">how long OPT takes in 2026</Link>.</p>

                <div className="not-prose bg-red-50 dark:bg-red-950 border-l-4 border-l-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> When You Do NOT Get a Grace Period</h3>
                    <p className="mb-3 text-red-800 dark:text-red-200">The regulation says a student who fails to maintain a full course of study without DSO approval, or otherwise fails to maintain status, is not eligible for an additional period for departure. That generally includes dropping out without approval, a SEVIS termination for a status violation such as unauthorized work, and going over the OPT unemployment limit.</p>
                    <p className="mb-0 text-red-800 dark:text-red-200">A student whose DSO authorizes a withdrawal from classes gets 15 days to depart, not 60. If you think you are over the <Link href="/blog/90-day-unemployment-rule-opt" className="underline">90-day unemployment limit</Link>, talk to your DSO immediately.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">What Can You Do During the Grace Period?</h2>
                <p>During the 60 days, you generally have three options.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">1. Prepare to Depart the US</h3>
                <p>The main purpose of the grace period is to give you time to pack, close accounts, sell your car, and arrange travel home.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">2. Transfer to a New Program</h3>
                <p>You can ask your DSO to transfer your SEVIS record to a new school to start a new program. If you were on post-completion OPT, you must be able to resume classes within 5 months of transferring out of the school that recommended OPT or of your OPT end date, whichever is earlier.</p>

                <h3 className="text-xl font-bold mt-8 mb-4">3. Change Your Visa Status</h3>
                <p>If eligible, you can apply to change to another status, such as F-2 or another visa category. If your employer timely filed a cap-subject H-1B change-of-status petition while your OPT was still valid, a <Link href="/blog/h1b-cap-gap-extension">cap-gap extension</Link> can extend both your F-1 status and your OPT work authorization until April 1 of the fiscal year, or the petition&apos;s start date if earlier. If the petition is filed during your grace period, USCIS says cap-gap extends your F-1 status only. You cannot work until the H-1B starts.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Golden Rules of the Grace Period</h2>
                <ul>
                    <li><strong>NO WORKING:</strong> Your OPT work authorization ends on your EAD end date. A STEM OPT extension or cap-gap H-1B petition filed before that date can automatically extend it. Nothing filed during the grace period gives you permission to work. Check with your DSO before you keep working.</li>
                    <li><strong>NO RE-ENTRY:</strong> Study in the States says you may not depart and return during your grace period. If you leave, the rest of the grace period is lost.</li>
                </ul>

                <div className="not-prose bg-primary-soft border-l-4 border-l-primary p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0 mb-2">Never Miss a Deadline</h3>
                    <p className="mb-0 text-gray-700 dark:text-gray-200"><strong>TrackMyOPT</strong> helps you track your OPT end date and your grace period, so you have time to file a STEM extension, plan a transfer, or pack. USCIS and your DSO remain the official sources.</p>
                </div>

                <h2 id="faq" className="text-2xl font-bold mt-12 mb-6">Frequently Asked Questions</h2>
                <div className="not-prose space-y-4">
                    {GRACE_PERIOD_FAQS.map((faq) => (
                        <div key={faq.question} className="border p-5 rounded-xl border-border bg-card shadow-card">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-0">{faq.answer}</p>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                    Sources: 8 CFR 214.2(f)(5)(iv), (f)(5)(vi), (f)(8)(i), (f)(10)(ii)(D) and (f)(11)(i)(B) as in effect under the previous regulations; Study in the States, <a href="https://studyinthestates.dhs.gov/2019/07/students-understand-your-post-completion-grace-period" target="_blank" rel="noopener noreferrer">Understand your Post-completion Grace Period</a>, <a href="https://studyinthestates.dhs.gov/students/work/applying-for-practical-training" target="_blank" rel="noopener noreferrer">Applying for Practical Training</a> and <a href="https://studyinthestates.dhs.gov/stem-opt-hub/for-students/students-determining-stem-opt-extension-eligibility" target="_blank" rel="noopener noreferrer">Determining STEM OPT Extension Eligibility</a>; USCIS, <a href="https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations/extension-of-post-completion-optional-practical-training-opt-and-f-1-status-for-eligible-students" target="_blank" rel="noopener noreferrer">Cap-Gap Extension of OPT and F-1 Status</a> and <a href="https://www.uscis.gov/i-539" target="_blank" rel="noopener noreferrer">Form I-539 page alert</a>.
                </p>
            </div>

            <div className="rounded-xl p-8 mt-12 mb-12 border border-primary-muted bg-primary-soft">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Track Your Status with Confidence</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Don&apos;t guess when your status expires. Use TrackMyOPT&apos;s timeline tools to see when your OPT and grace period end.</p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors shadow-button">Start Tracking Your OPT</Link>
                </div>
            </div>
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/fall-out-of-f1-status-options" className="group block h-full">
                        <div className="surface-card-interactive p-6 h-full">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Falling Out of Status</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">What happens if you stay past your 60-day grace period? Understand the severe consequences of overstaying.</p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Link>
                    <Link href="/blog/h1b-cap-gap-extension" className="group block h-full">
                        <div className="surface-card-interactive p-6 h-full">
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
