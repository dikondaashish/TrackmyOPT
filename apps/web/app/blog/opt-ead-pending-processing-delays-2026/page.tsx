import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "OPT EAD Still Pending After 3, 6, or 12 Months? Here's What to Do (2026)",
    description: "USCIS OPT and STEM OPT processing delays are worse than ever in 2026, with some I-765 cases pending over a year. Here is exactly what to do, when to file an inquiry, and how to protect your status while you wait.",
    keywords: [
        "OPT EAD pending 2026",
        "USCIS I-765 processing delay",
        "OPT taking too long USCIS",
        "STEM OPT pending months",
        "how to check OPT status",
        "OPT delay country hold",
        "USCIS inquiry OPT pending",
        "OPT case status pending 2026",
        "I-765 pending over 6 months",
        "what to do OPT EAD delayed",
    ],
    openGraph: {
        title: "OPT EAD Still Pending After Months? What to Do in 2026 | TrackMyOPT",
        description: "USCIS OPT processing delays are at record highs in 2026. If your I-765 has been pending for months, here is exactly what to do at each stage.",
        url: "https://www.trackmyopt.com/blog/opt-ead-pending-processing-delays-2026",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "OPT EAD Still Pending? What to Do in 2026",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/opt-ead-pending-processing-delays-2026",
    },
};

const faqItems = [
    {
        question: "How long does USCIS take to process an OPT I-765 in 2026?",
        answer: "Published USCIS processing times for I-765 OPT applications have ranged from 3 to 7+ months in 2025–2026, but real-world reports from students show cases regularly exceeding published estimates. Some students have reported I-765 applications pending for 9–12 months with no resolution. Processing times vary significantly by filing location, nationality, and whether a country-specific hold applies.",
    },
    {
        question: "When can I file an inquiry with USCIS about a delayed OPT application?",
        answer: "You can submit an e-request (service request) on USCIS.gov once your case has been pending beyond the published processing time for your application type and service center. You can find the current published processing time at uscis.gov/forms/check-case-processing-times. If your case is within the published time, USCIS will typically close the inquiry without action.",
    },
    {
        question: "Does premium processing speed up OPT applications?",
        answer: "Premium processing is not available for most OPT I-765 applications. Even when a form of expedited processing is available, country-specific holds at USCIS cannot be bypassed with premium processing — the hold supersedes the expedite request. Students subject to national security or country-specific holds have reported no improvement even when expedited processing was theoretically available.",
    },
    {
        question: "Can I work while my OPT application is pending?",
        answer: "No. You cannot work on OPT until your EAD card is approved and in hand, and your OPT start date has been reached. There is no automatic employment authorization for a pending OPT I-765 application (unlike the STEM OPT 180-day auto-extension, which requires timely filing before your existing OPT EAD expires).",
    },
    {
        question: "What happens to my OPT if USCIS takes longer than 14 months after graduation to approve?",
        answer: "If USCIS approves your OPT more than 14 months after your program end date, the OPT authorization is technically untimely and may have a very short or zero usable period. This is an extreme edge case but has happened. If you are approaching the 14-month mark without approval, consult an immigration attorney immediately — do not wait.",
    },
    {
        question: "I have a job offer waiting. Can I start working before my EAD arrives?",
        answer: "No. Starting work before your EAD is approved is unauthorized employment — a serious immigration violation that can result in SEVIS termination, bars on future visa applications, and possible removal. Inform your employer of the situation, ask them to defer your start date, and keep them updated on your case status. Most tech employers are familiar with OPT processing delays.",
    },
    {
        question: "What is a country-specific hold and how do I know if I am affected?",
        answer: "A country-specific hold is a USCIS policy that places applications from nationals of certain countries in a separate, slower review queue — often related to national security screening requirements. USCIS does not publish a current list of affected countries. Signs you may be subject to one: your case far exceeds published processing times, an e-request inquiry results in a generic response citing 'additional review,' and premium processing had no impact on your timeline.",
    },
];

export default function OptEadPendingDelaysBlogPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "OPT EAD Pending Processing Delays 2026", url: "https://www.trackmyopt.com/blog/opt-ead-pending-processing-delays-2026" },
            ]} />
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-05-14"
                modifiedDate="2026-05-14"
                author="TrackMyOPT Team"
                faqItems={faqItems}
            />

            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">OPT EAD Pending 2026</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        USCIS
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        9 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT EAD Still Pending After 3, 6, or 12 Months? Here's Exactly What to Do in 2026
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    USCIS processing delays for OPT and STEM OPT I-765 applications are at some of the worst levels in the program's history. If your case has been pending for months with no update, here is a step-by-step guide for what to do at each stage — and how to protect your status while you wait.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: May 14, 2026</span>
                    <span>•</span>
                    <span>Written by TrackMyOPT Team (former F-1 students)</span>
                </div>
            </header>

            {/* Quick Answer */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    If your OPT I-765 is pending beyond USCIS's published processing time: file a service request (e-request) on USCIS.gov. If your case approaches your grace period end date without approval, contact your DSO immediately. If you are approaching 14 months after graduation, consult an immigration attorney — not a Reddit thread.
                </p>
            </div>

            {/* Key Takeaway */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    The Two Things That Actually Matter
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    First: you cannot work until your EAD is in hand — no exceptions. Second: OPT cannot extend beyond <strong>14 months after your program end date</strong> regardless of when USCIS approves. Every month of delay is a month of OPT you lose permanently. This is why filing at the earliest possible date is so critical.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov/forms/check-case-processing-times" target="_blank" rel="noopener noreferrer" className="underline">USCIS Processing Times</a> · 8 CFR § 214.2(f)(10)(ii)
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#why-delays", "Why OPT Processing Is So Slow in 2026"],
                        ["#country-holds", "Country-Specific Holds: Are You Affected?"],
                        ["#action-by-stage", "What to Do at Each Stage of Your Wait"],
                        ["#employer", "How to Handle Your Employer While Waiting"],
                        ["#protect-status", "How to Protect Your F-1 Status During the Wait"],
                        ["#stem-opt-difference", "STEM OPT: The 180-Day Auto-Extension Changes Everything"],
                        ["#escalation", "When and How to Escalate Your Case"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href as string} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="why-delays" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Why OPT Processing Is So Slow in 2026
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Processing delays for OPT I-765 applications are not a new problem — but 2025 and 2026 have produced some of the most extreme cases on record. Multiple converging factors are responsible:
                    </p>

                    <div className="space-y-4 mb-6">
                        {[
                            {
                                reason: "Increased fraud scrutiny following HSI investigations",
                                detail: "After DHS's public announcement of OPT employer fraud involving 10,000+ students, USCIS has added additional review steps to many OPT applications — particularly from students at certain schools or in certain industries where fraud clusters were identified.",
                            },
                            {
                                reason: "Country-specific national security screening",
                                detail: "Applications from nationals of countries flagged for additional national security review are routed to a separate queue that moves significantly slower than standard OPT adjudication. USCIS does not publish the list of affected countries.",
                            },
                            {
                                reason: "Staffing and administrative capacity constraints at USCIS",
                                detail: "USCIS has faced staffing challenges and shifting policy priorities under the current administration. Service center workloads have not adjusted proportionally to application volume.",
                            },
                            {
                                reason: "High spring graduation volume",
                                detail: "Spring is the peak filing season for post-completion OPT, as the majority of US universities end their academic year in May–June. The surge in applications further strains already-stretched processing queues.",
                            },
                            {
                                reason: "RFE (Request for Evidence) rates increasing",
                                detail: "USCIS has issued more Requests for Evidence on OPT applications in recent cycles, asking for additional employer documentation, relationship-to-degree explanations, and other supporting materials — each of which adds weeks to months to processing.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.reason}</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "My OPT application has now been pending for almost 12 months. I found out that applications from nationals of certain high-risk countries are effectively frozen. Premium processing did not help."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — F-1 student, r/immigration, 2026
                        </p>
                    </div>
                </section>

                <section id="country-holds" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Country-Specific Holds: Are You Affected?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        One of the most significant — and least publicly discussed — drivers of extreme OPT delays is country-specific processing holds at USCIS. These holds place applications from nationals of flagged countries into a separate adjudication queue that moves significantly slower than normal.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Signs you may be subject to a country-specific hold</h3>
                                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                                    <li>• Your case has been pending significantly longer than the published processing time</li>
                                    <li>• An e-request inquiry returned a generic response about "additional review"</li>
                                    <li>• Other students from your country at your university are also experiencing extreme delays</li>
                                    <li>• Your case has had no status updates for 4+ months after receipt</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">What you can do if affected</h3>
                                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    <li>• Contact your DSO to document your status and timeline in SEVIS</li>
                                    <li>• Consult an immigration attorney about whether a mandamus lawsuit (to compel USCIS action) is viable in your situation</li>
                                    <li>• File a congressional inquiry through your US Representative's office — caseworkers can sometimes prompt a USCIS status update</li>
                                    <li>• Contact your country's consulate for any potential assistance or documentation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="action-by-stage" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What to Do at Each Stage of Your Wait
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Your appropriate actions depend on how long your case has been pending relative to published processing times and your key OPT deadlines. Use this stage guide:
                    </p>

                    <div className="space-y-5">
                        {[
                            {
                                stage: "Within published processing time",
                                color: "green",
                                actions: [
                                    "Monitor your case status on USCIS.gov using your receipt number",
                                    "Ensure your address on file with USCIS is current",
                                    "Sign up for USCIS case status email alerts if not already done",
                                    "Keep your DSO informed of your pending status",
                                ],
                                escalate: null,
                            },
                            {
                                stage: "Beyond published processing time",
                                color: "amber",
                                actions: [
                                    "File a service request (e-request) at uscis.gov/e-request",
                                    "Contact your DSO to note the delay in your SEVIS record",
                                    "Check the USCIS processing times page to confirm your case is genuinely outside the window",
                                    "Begin preparing employer documentation in case of an RFE",
                                ],
                                escalate: "File the e-request the day your case crosses the published processing time threshold.",
                            },
                            {
                                stage: "60-90 days beyond published time with no movement",
                                color: "orange",
                                actions: [
                                    "File a second service request if the first received no substantive response",
                                    "Contact your US Representative's office for a congressional inquiry",
                                    "Consult an immigration attorney about your options",
                                    "Discuss backup plans with your employer (deferred start, remote international option)",
                                ],
                                escalate: "Congressional inquiry is a real tool — their caseworkers contact USCIS directly.",
                            },
                            {
                                stage: "Approaching end of 60-day grace period without approval",
                                color: "red",
                                actions: [
                                    "Contact your DSO immediately — this is urgent",
                                    "Consult an immigration attorney the same day",
                                    "Document everything: dates, e-requests, responses, all communications",
                                    "Do NOT work while unauthorized — the consequences are severe",
                                ],
                                escalate: "This is an emergency situation. Act on the same day, not the next week.",
                            },
                            {
                                stage: "Approaching 14 months after graduation with no approval",
                                color: "red",
                                actions: [
                                    "Consult an immigration attorney immediately — this is the most time-sensitive scenario",
                                    "Ask your attorney about mandamus litigation (federal lawsuit to compel USCIS action)",
                                    "Contact your congressional representative for emergency intervention",
                                    "Discuss departure or alternative visa options with your attorney",
                                ],
                                escalate: "At this stage, only legal action or congressional pressure can move the needle quickly enough.",
                            },
                        ].map((item, i) => {
                            const bgMap: Record<string, string> = {
                                green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                                amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
                                orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
                                red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                            };
                            const titleMap: Record<string, string> = {
                                green: "text-green-900 dark:text-green-100",
                                amber: "text-amber-900 dark:text-amber-100",
                                orange: "text-orange-900 dark:text-orange-100",
                                red: "text-red-900 dark:text-red-100",
                            };
                            const bodyMap: Record<string, string> = {
                                green: "text-green-800 dark:text-green-200",
                                amber: "text-amber-800 dark:text-amber-200",
                                orange: "text-orange-800 dark:text-orange-200",
                                red: "text-red-800 dark:text-red-200",
                            };
                            return (
                                <div key={i} className={`p-5 rounded-xl border ${bgMap[item.color]}`}>
                                    <h3 className={`font-bold mb-3 ${titleMap[item.color]}`}>Stage {i + 1}: {item.stage}</h3>
                                    <ul className={`space-y-1 text-sm mb-3 ${bodyMap[item.color]}`}>
                                        {item.actions.map((a, j) => (
                                            <li key={j} className="flex items-start gap-2">
                                                <span className="mt-0.5 flex-shrink-0">→</span>
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                    {item.escalate && (
                                        <p className={`text-xs font-semibold border-t pt-2 mt-2 ${bodyMap[item.color]} border-current/20`}>
                                            ⚡ {item.escalate}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section id="employer" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Handle Your Employer While Waiting
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        One of the most stressful parts of a processing delay is managing a job offer when you cannot legally start work. Here is how to handle this professionally:
                    </p>

                    <div className="space-y-3">
                        {[
                            { action: "Tell your employer early and in writing", detail: "Inform your employer as soon as you know your EAD will be delayed. Give them a realistic timeline based on USCIS's published processing times, not wishful thinking. Most established employers — especially tech companies — are familiar with OPT processing delays." },
                            { action: "Request a deferred start date", detail: "Ask for a start date that is 1–2 months after your expected EAD approval. Having buffer prevents you from needing multiple start date extensions." },
                            { action: "Do NOT accept work before your EAD arrives", detail: "This is not negotiable. Starting work before your EAD is authorized employment — it jeopardizes your current and future immigration status far more severely than a delayed start date." },
                            { action: "Provide regular updates", detail: "Check your USCIS case status weekly and proactively update your employer. Silence signals uncertainty; regular updates signal professionalism and good faith." },
                            { action: "Discuss remote / international options as a last resort", detail: "Some employers will allow a student to begin working from their home country until the US work authorization is resolved. This is legally complex — consult an attorney and your DSO before agreeing to this arrangement." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.action}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="protect-status" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How to Protect Your F-1 Status During the Wait
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        While your OPT application is pending, your F-1 status depends on a combination of factors. Here is how to make sure you remain in valid status throughout the wait:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { action: "Do not travel internationally without counseling your DSO first", detail: "Traveling while your OPT is pending can complicate reentry. Talk to your DSO and have a valid F-1 visa stamp before considering travel." },
                            { action: "Maintain your address on file with USCIS", detail: "Your EAD will be mailed to your address of record. Update it immediately if you move." },
                            { action: "Keep your DSO informed of your timeline", detail: "Your DSO needs to know the status of your pending OPT to properly maintain your SEVIS record during the grace period." },
                            { action: "Do not enroll full-time in another academic program", detail: "Changing your academic status while OPT is pending can complicate or invalidate your application. Discuss any plans to enroll in courses with your DSO first." },
                            { action: "Respond immediately to any USCIS correspondence", detail: "RFEs, notices, or requests have hard deadlines. Missing a USCIS deadline can result in denial even if your application was otherwise approvable." },
                            { action: "Do not let your passport expire", detail: "Your valid passport is required for your F-1 status. If your passport expires while OPT is pending, renew it immediately and update USCIS." },
                        ].map((item) => (
                            <div key={item.action} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {item.action}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="stem-opt-difference" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        STEM OPT: The 180-Day Auto-Extension Changes Everything
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you are applying for a STEM OPT extension (not initial OPT), the processing delay situation is materially different — and more manageable — because of the 180-day automatic employment authorization.
                    </p>

                    <div className="flex items-start gap-3 p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg">If you file on time: 180 days of automatic work authorization</h3>
                            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                If you file your STEM OPT I-765 extension before your current OPT EAD expiration date, you automatically receive up to <strong>180 days of continued employment authorization</strong> while USCIS processes your case. This protection is NOT affected by the October 2025 rule changes. You can continue working for your existing employer under the auto-extension while waiting.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-900 dark:text-red-100">But ONLY if you file before your OPT EAD expires</h3>
                            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                File even one day after your OPT EAD expiration date and the 180-day auto-extension does not apply. You lose your work authorization immediately, and your employer must stop your employment. There is no grace period for late STEM OPT I-765 filings. File 90 days before your OPT EAD expires — not 89.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="escalation" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        When and How to Escalate Your Case
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Here are the escalation tools available to you in order of typical usefulness:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Escalation Tool</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">When to Use</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">How to Do It</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Effectiveness</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["E-request (service request)", "Beyond published processing time", "uscis.gov/e-request", "Moderate — gets a human review, may prompt a status update"],
                                    ["Emma (USCIS virtual assistant)", "Any time for status inquiries", "uscis.gov — click Emma chat", "Low — mostly generic responses"],
                                    ["Congressional inquiry", "60+ days beyond published time", "Contact your US House Representative's local office", "Good — caseworkers can contact USCIS directly and often get responses"],
                                    ["Immigration attorney consult", "Before grace period ends", "Find an AILA member immigration attorney", "High for complex situations — they know non-public escalation paths"],
                                    ["Mandamus lawsuit", "14-month cap approaching, all else failed", "Requires an immigration attorney — federal district court filing", "High but expensive — often prompts USCIS resolution to avoid litigation"],
                                    ["USCIS Ombudsman", "For systemic delays or no-response situations", "dhs.gov/uscis-ombudsman", "Moderate — best for documented, unresponsive cases"],
                                ].map(([tool, when, how, eff], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{tool}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400 text-xs">{when}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400 text-xs">{how}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400 text-xs">{eff}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                    <Link href="/blog/spring-graduates-opt-application-timing-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Spring 2026 OPT Application Timing Guide</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Full OPT Application Checklist 2026</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day Unemployment Rule</Link>
                    <Link href="/blog/is-opt-ending-dhs-rule-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Is OPT Ending? DHS Rule Explained</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/answers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Q&A Hub →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your USCIS Case Status Automatically</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT monitors your USCIS case status, tracks your OPT deadlines, and alerts you the moment anything changes — so you can focus on your job search, not the USCIS website.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Track Your Case Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
}
