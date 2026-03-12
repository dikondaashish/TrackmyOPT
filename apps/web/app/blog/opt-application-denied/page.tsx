import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, XCircle, Shield, FileText, Scale } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "OPT Application Denied? What to Do Next (2026 Guide)",
    description: "Your OPT application was denied — now what? Common denial reasons, whether you can refile, the 60-day grace period, your legal options, and how to prevent OPT denial. Updated for 2026.",
    keywords: ["OPT application denied", "I-765 denied", "OPT denial options", "OPT denial what to do", "EAD application denied"],
    openGraph: {
        title: "OPT Application Denied? What to Do Next | TrackMyOPT",
        description: "Common OPT denial reasons, your options after denial, and how to refile or maintain status.",
        url: "https://www.trackmyopt.com/blog/opt-application-denied",
        type: "article",
    },
    alternates: { canonical: "https://www.trackmyopt.com/blog/opt-application-denied" },
};

export default function OPTDeniedArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "Can I appeal my OPT denial?", answer: "You cannot formally appeal an OPT denial, but you can file a Motion to Reopen or Motion to Reconsider. This requires new evidence or proof of a legal error in the denial."}, {question: "Can I refile my OPT application after denial?", answer: "Yes. You can refile after addressing the reason for denial. Get an explanation from USCIS, fix the issue (additional documents, corrected form, etc.), and resubmit."}, {question: "What is the 60-day grace period?", answer: "After your OPT is denied, you enter a 60-day grace period to either prepare to leave the US, refile, or obtain another immigration status."}, {question: "How long do I have to leave the US if denied?", answer: "You have 60 days from your OPT end date (or denial notice) to depart. If you stay past this period without alternate status, you accrue unlawful presence."}, {question: "Will an OPT denial affect my future visa applications?", answer: "A single OPT denial is unlikely to permanently harm your immigration record, but consult an immigration attorney before future applications to ensure no issues exist."} ]} />
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">OPT Application Denied</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">OPT Basics</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />8 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    OPT Application Denied? What to Do Next (2026 Guide)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Getting an OPT denial is stressful, but you still have options. This guide covers why applications get denied, what happens immediately after, whether you can refile, and how to protect your immigration status.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 12, 2026 • Written by TrackMyOPT Team</div>
            </header>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Key Takeaway</h2>
                <p className="text-red-800 dark:text-red-200 font-medium">
                    OPT denials (Form I-765) <strong>cannot be formally appealed</strong> — there is no motion to reopen or reconsider for EAD applications. However, you may be able to <strong>refile a new application</strong> if you're still within the filing window. If not, you typically have a <strong>60-day grace period</strong> to make alternative arrangements or depart the U.S.
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-2">Source: <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" target="_blank" rel="noopener noreferrer" className="underline">USCIS OPT Page</a></p>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="grid md:grid-cols-2 gap-2">
                    {[["#reasons", "Common Reasons for OPT Denial"], ["#after-denial", "What Happens After Denial"], ["#options", "Your Options After OPT Denial"], ["#refile", "Can You Refile?"], ["#prevent", "How to Prevent Denial"], ["#denial-vs-rfe", "Denial vs. RFE"], ["#attorney", "When to Consult an Attorney"], ["#grace-period", "60-Day Grace Period"], ["#impact-future", "Impact on Future Applications"]].map(([href, text]) => (
                        <a key={href} href={href} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ {text}</a>
                    ))}
                </nav>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">

                <section id="reasons" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Common Reasons for OPT Denial</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        USCIS denies OPT applications (Form I-765) for a variety of reasons. Understanding the most common causes helps you identify what went wrong and whether a refile is possible.
                    </p>
                    <div className="space-y-3">
                        {[
                            { reason: "Filing outside the allowed window", detail: "I-765 must be filed no earlier than 90 days before your program end date and no later than 60 days after. If USCIS receives it outside this range, it will be denied." },
                            { reason: "Incorrect eligibility category", detail: "Using the wrong category code on I-765 is a common mistake. Post-completion OPT uses (c)(3)(B). Using (c)(3)(A) for pre-completion or (c)(3)(C) for STEM OPT when filing for initial OPT leads to automatic denial." },
                            { reason: "Missing or incorrect documents", detail: "An unsigned I-20, missing passport copies, outdated photos, or incomplete Form I-765 can all trigger a denial rather than an RFE, especially for clearly deficient filings." },
                            { reason: "Expired or invalid I-20", detail: "Your I-20 must have an active OPT recommendation from your DSO in SEVIS. An I-20 without the OPT endorsement, or one where the SEVIS record has been terminated, will cause denial." },
                            { reason: "Duplicate application", detail: "If USCIS receives two I-765 applications for the same OPT period, the duplicate will be denied. This sometimes happens when students file both online and by mail." },
                            { reason: "Prior immigration violations", detail: "Unauthorized employment, failure to maintain full-time enrollment, or overstaying a previous visa can all result in OPT denial. USCIS checks your immigration history during adjudication." },
                            { reason: "Program completion issues", detail: "If your academic program has already ended and you're beyond the 60-day post-completion filing window, or if you failed to complete your program, OPT will be denied." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.reason}</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="after-denial" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Happens Immediately After Denial</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        When USCIS denies your OPT application, several things happen at once. Understanding the immediate consequences helps you act quickly.
                    </p>
                    <div className="space-y-3 mb-4">
                        {[
                            { step: "USCIS sends a denial notice", desc: "You'll receive a written denial notice (by mail or in your USCIS online account) explaining the reason for denial. Read this carefully — the stated reason determines your next steps.", color: "blue" },
                            { step: "You do NOT have work authorization", desc: "An OPT denial means you were never granted employment authorization. You cannot work in any capacity. If you were working based on a pending application (this is rare for OPT), you must stop immediately.", color: "red" },
                            { step: "Your F-1 status is affected", desc: "If your academic program has ended and you don't have another valid status, you may enter the 60-day grace period. Your DSO will be notified through SEVIS.", color: "amber" },
                            { step: "No formal appeal exists for EAD denials", desc: "Unlike some other immigration applications, Form I-765 denials cannot be appealed through a motion to reopen or motion to reconsider with the Administrative Appeals Office (AAO). Your only recourse is to refile if eligible.", color: "gray" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-300 text-xs font-bold">{i + 1}</div>
                                <div className="flex-1 pb-4 border-l-2 border-red-100 dark:border-zinc-800 pl-4 -ml-[1px]">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.step}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200"><strong>Act quickly:</strong> The 60-day grace period starts from the date USCIS denies your application (or your program end date, if later). Don't wait for the paper notice — check your USCIS online account regularly for status updates.</p>
                    </div>
                </section>

                <section id="options" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Options After OPT Denial</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        While an OPT denial is serious, it does not automatically mean you must leave the country. Your options depend on the reason for denial and your current situation.
                    </p>
                    <div className="space-y-3">
                        {[
                            { option: "Refile a new I-765 application", desc: "If the denial was due to a correctable error (wrong category, missing document, unsigned form) and you're still within the filing window (90 days before to 60 days after program end), you can submit a brand-new I-765 application with the correction. A new filing fee is required.", eligible: "Still within filing window + correctable error" },
                            { option: "Transfer to a new school program", desc: "If you're still within the 60-day grace period, you can transfer your SEVIS record to a new school and enroll in a new program. This resets your F-1 status but means you'd need to complete another degree before applying for OPT again.", eligible: "Within 60-day grace period" },
                            { option: "Change to another visa status", desc: "You may file Form I-539 to change to B-2 (tourist) status for a temporary stay, or to another eligible status. B-2 does not permit work. A change of status must be filed before your grace period expires, and you must not have violated your F-1 status.", eligible: "Valid reasons + no violations" },
                            { option: "Depart the United States", desc: "If no other option works, you must leave the U.S. before your 60-day grace period expires. Overstaying can result in bars on future visa applications. Departing on time preserves your ability to apply for future visas.", eligible: "Grace period has not expired" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ArrowRight className="w-4 h-4 text-blue-500" />{item.option}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">Eligible if: {item.eligible}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="refile" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Can You Refile Your OPT Application?</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Yes — in many cases, you can refile. But there are strict conditions.
                    </p>
                    <div className="space-y-3 mb-4">
                        {[
                            { req: "You must still be within the filing window", detail: "USCIS must receive your new I-765 no earlier than 90 days before and no later than 60 days after your program end date. If this window has passed, you cannot refile." },
                            { req: "Your SEVIS record must still be active", detail: "Your DSO must confirm that your SEVIS record is still in active or completed status. If it has been terminated, you cannot refile without resolving the SEVIS issue first." },
                            { req: "You need a new I-20 recommendation", detail: "Ask your DSO to issue a new I-20 with a fresh OPT recommendation. The original I-20 used in the denied application may no longer be valid, depending on timing." },
                            { req: "A new filing fee is required", detail: "USCIS does not refund the $410 fee from the denied application. You must pay the full fee again with your new I-765 submission." },
                            { req: "Correct the error that caused denial", detail: "Review the denial notice carefully. If the reason was an incorrect category, fix it. If documents were missing, include them. If photos were wrong, retake them. Do not simply resubmit the same application." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.req}</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p></div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200"><strong>Pro tip:</strong> If you refile, include a cover letter explaining that this is a corrected application following a prior denial. Attach a copy of the denial notice and clearly identify what was corrected. For a complete filing checklist, see our <Link href="/blog/opt-application-checklist-2026" className="underline font-medium">OPT Application Checklist 2026</Link>.</p>
                    </div>
                </section>

                <section id="prevent" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How to Prevent OPT Denial</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Most OPT denials are preventable. Use this checklist to avoid the most common mistakes.
                    </p>
                    <div className="space-y-3">
                        {[
                            "File within the window: no earlier than 90 days before and no later than 60 days after your program end date",
                            "Use the correct I-765 category: (c)(3)(B) for post-completion OPT",
                            "Ensure your I-20 has an active OPT recommendation from your DSO before filing",
                            "Sign every form — unsigned I-765 or I-20 can trigger denial",
                            "Include all required documents: I-20, passport copy, I-94, previous EADs, photos",
                            "Use passport-style photos that meet USCIS specifications (2x2 inches, white background, within 30 days)",
                            "Verify your SEVIS ID is entered correctly on the I-765",
                            "File online at uscis.gov for faster processing and to avoid mail delays",
                            "Do NOT submit duplicate applications (online + mail)",
                            "Work closely with your DSO — they review applications before submission and catch common errors",
                        ].map((item, i) => (
                            <label key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                            </label>
                        ))}
                    </div>
                </section>

                <section id="denial-vs-rfe" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Denial vs. RFE: Understanding the Difference</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Not every problem with your OPT application results in a denial. Sometimes USCIS issues a Request for Evidence (RFE) instead. Understanding the difference is important.
                    </p>
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Factor</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">RFE (Request for Evidence)</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Denial</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["What it means", "USCIS needs more information before deciding", "USCIS has rejected your application"],
                                    ["Your case status", "Still pending — your case remains open", "Closed — no further adjudication"],
                                    ["Can you respond?", "Yes — you have a deadline to submit evidence", "No formal response mechanism for I-765"],
                                    ["Work authorization", "Unchanged while case is pending", "No work authorization granted"],
                                    ["Common triggers", "Missing document, unclear photo, ambiguous info", "Wrong category, filed too late, ineligible"],
                                    ["Best response", "Submit requested evidence promptly", "Refile new application if within window"],
                                ].map(([factor, rfe, denial], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{factor}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{rfe}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{denial}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        An RFE is far better than a denial because your application remains active. If you receive an RFE, respond within the stated deadline with the exact evidence requested. For processing timelines, see our <Link href="/blog/opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 underline font-medium">OPT Processing Time guide</Link>.
                    </p>
                </section>

                <section id="attorney" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">When to Consult an Immigration Attorney</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        While many OPT denials can be resolved by refiling with corrections, some situations require professional legal help.
                    </p>
                    <div className="space-y-3">
                        {[
                            { scenario: "Prior immigration violations", detail: "If the denial references unauthorized employment, failure to maintain status, or overstay — these are complex issues that affect your entire immigration history. An attorney can assess whether you can refile or if a different strategy is needed." },
                            { scenario: "Multiple denials", detail: "If your OPT has been denied more than once, there may be an underlying issue with your SEVIS record, I-20, or immigration history that a DSO alone cannot resolve." },
                            { scenario: "SEVIS record terminated", detail: "A terminated SEVIS record is a serious problem. Reinstatement requires Form I-539 with a detailed explanation, and success is not guaranteed. An attorney experienced in F-1 reinstatement cases can significantly improve your chances." },
                            { scenario: "You're unsure about your status", detail: "If you're not sure whether you're in valid F-1 status, whether your grace period has started, or whether you've overstayed — don't guess. Incorrect assumptions about your status can compound the problem." },
                            { scenario: "Change of status or departure planning", detail: "If you're considering changing to B-2 or another status, or if you need to plan a departure that preserves your future visa eligibility, legal guidance ensures you don't make costly mistakes." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <Scale className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div><h3 className="font-semibold text-gray-900 dark:text-white">{item.scenario}</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p></div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="grace-period" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">60-Day Grace Period Rules</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        After an OPT denial, if your academic program has ended, you typically enter the standard F-1 60-day grace period. Here's what you need to know about this critical window.
                    </p>
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse text-sm">
                            <thead><tr className="bg-gray-100 dark:bg-zinc-800">
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">During Grace Period</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Allowed?</th>
                                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Details</th>
                            </tr></thead>
                            <tbody>
                                {[
                                    ["Work in any capacity", "No", "You have no work authorization during the grace period"],
                                    ["Transfer to a new school", "Yes", "You can transfer your SEVIS record and enroll in a new program"],
                                    ["Change status (B-2, etc.)", "Yes", "File I-539 before grace period expires; must have valid reason"],
                                    ["Refile OPT (if within window)", "Yes", "Only if the filing window hasn't closed"],
                                    ["Travel outside the U.S.", "Risky", "Leaving during the grace period typically means you cannot re-enter on F-1 status without a new I-20 and valid visa"],
                                    ["Remain in the U.S. past 60 days", "No", "Overstaying triggers unlawful presence, which can bar future visas"],
                                ].map(([action, allowed, details], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{action}</td>
                                        <td className="p-3 border dark:border-zinc-700">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${allowed === "Yes" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : allowed === "No" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"}`}>
                                                {allowed}
                                            </span>
                                        </td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800 dark:text-red-200"><strong>Critical:</strong> The 60-day grace period is <strong>not renewable</strong> and <strong>not extendable</strong>. If you haven't taken action by day 60, you begin accruing unlawful presence. More than 180 days of unlawful presence triggers a 3-year bar on re-entry; more than 365 days triggers a 10-year bar.</p>
                    </div>
                </section>

                <section id="impact-future" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Impact on Future Immigration Applications</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Students often worry that an OPT denial will permanently damage their immigration record. Here's what actually matters.
                    </p>
                    <div className="space-y-3">
                        {[
                            { factor: "OPT denial alone", impact: "Minimal", detail: "A denial based on a procedural error (wrong category, missing document) does not indicate fraud or willful violation. Visa officers understand that administrative errors happen." },
                            { factor: "Denial due to violation", impact: "Significant", detail: "If the denial references unauthorized employment, status violations, or misrepresentation, this is documented in your immigration file and can affect future visa adjudications." },
                            { factor: "Overstaying after denial", impact: "Severe", detail: "If you fail to depart within the 60-day grace period, you accrue unlawful presence. 180+ days triggers a 3-year re-entry bar; 365+ days triggers a 10-year bar under INA 212(a)(9)(B)." },
                            { factor: "Clean departure", impact: "Positive", detail: "Departing the U.S. within the grace period after a denial shows respect for immigration law and is viewed favorably by consular officers evaluating future visa applications." },
                            { factor: "Successful refile", impact: "Neutral", detail: "If you refile and are approved, the initial denial has no lasting negative effect. Your immigration record shows the approval, not the prior denial." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.factor}</h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.impact === "Minimal" || item.impact === "Neutral" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : item.impact === "Positive" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : item.impact === "Significant" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}>
                                            {item.impact} impact
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { question: "Can I appeal an OPT denial?", answer: "No. Form I-765 (EAD) denials do not have a formal appeal process. There is no motion to reopen or motion to reconsider available for EAD applications. Your only option is to file a brand-new I-765 application if you are still within the eligible filing window." },
                            { question: "Can I refile my OPT application after denial?", answer: "Yes, if you are still within the filing window (90 days before to 60 days after your program end date) and your SEVIS record is still active. You will need a new I-20 with an OPT recommendation, a corrected I-765, and a new $410 filing fee. Correct the issue that caused the initial denial." },
                            { question: "What is the 60-day grace period after OPT denial?", answer: "After your OPT is denied and your academic program has ended, you enter a 60-day grace period. During this time, you can prepare to depart the U.S., transfer to a new school, change your immigration status, or refile OPT if still eligible. You cannot work during the grace period." },
                            { question: "How long do I have to leave the US after OPT denial?", answer: "You must depart within 60 days of the denial (or 60 days after your program end date, whichever is later). Staying beyond this period accrues unlawful presence, which can result in 3-year or 10-year bars on future U.S. visa applications." },
                            { question: "Does OPT denial affect future visa applications?", answer: "An OPT denial by itself does not bar you from future visa applications. However, if the denial was due to a violation (unauthorized employment, overstay), or if you overstay the 60-day grace period, those factors can negatively impact future applications. A clean departure within the grace period preserves your immigration record." },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                    <Link href="/blog/opt-processing-time-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Processing Time 2026</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If OPT Expires?</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ 90-Day Unemployment Rule for OPT</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Track Your OPT Application Status</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">Get real-time case status alerts, deadline reminders, and compliance tracking — so you never miss a critical date.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "Article",
                    "headline": "OPT Application Denied? What to Do Next (2026 Guide)",
                    "author": { "@type": "Organization", "name": "TrackMyOPT" },
                    "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } },
                    "datePublished": "2026-03-12", "dateModified": "2026-03-12",
                    "mainEntityOfPage": "https://www.trackmyopt.com/blog/opt-application-denied"
                })
            }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "FAQPage",
                    "mainEntity": [
                        { "@type": "Question", "name": "Can I appeal an OPT denial?", "acceptedAnswer": { "@type": "Answer", "text": "No. Form I-765 (EAD) denials do not have a formal appeal process. Your only option is to file a brand-new I-765 application if you are still within the eligible filing window." } },
                        { "@type": "Question", "name": "Can I refile my OPT application after denial?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, if you are still within the filing window (90 days before to 60 days after your program end date) and your SEVIS record is still active." } },
                        { "@type": "Question", "name": "What is the 60-day grace period after OPT denial?", "acceptedAnswer": { "@type": "Answer", "text": "After your OPT is denied and your academic program has ended, you enter a 60-day grace period. You can prepare to depart, transfer to a new school, change status, or refile OPT. You cannot work." } },
                        { "@type": "Question", "name": "How long do I have to leave the US after OPT denial?", "acceptedAnswer": { "@type": "Answer", "text": "You must depart within 60 days of the denial or 60 days after your program end date, whichever is later." } },
                        { "@type": "Question", "name": "Does OPT denial affect future visa applications?", "acceptedAnswer": { "@type": "Answer", "text": "An OPT denial by itself does not bar future visa applications. However, violations or overstaying the grace period can negatively impact future applications." } },
                    ]
                })
            }} />
        </article>
    );
}
