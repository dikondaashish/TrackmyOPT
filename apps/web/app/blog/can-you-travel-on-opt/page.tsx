import { Metadata } from "next";
import Link from "next/link";
import { Plane, CheckCircle2, Clock, ArrowRight, BookOpen, AlertTriangle, FileText, Globe } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "Can You Travel on OPT? Complete F-1 Travel Guide (2026)",
    description: "Can you travel internationally while on OPT? Learn what documents you need to re-enter the US, the risks of traveling while OPT is pending, how travel affects your unemployment days, and STEM OPT travel rules.",
    keywords: ["travel on OPT", "F-1 travel while OPT pending", "OPT re-entry documents", "traveling during OPT", "international travel OPT"],
    openGraph: {
        title: "Can You Travel on OPT? Complete F-1 Travel Guide | TrackMyOPT",
        description: "Everything F-1 students need to know about traveling internationally on OPT — required documents, risks, unemployment clock impact, and STEM OPT rules.",
        url: "https://www.trackmyopt.com/blog/can-you-travel-on-opt",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "Can You Travel on OPT? Complete F-1 Travel Guide (2026)",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/can-you-travel-on-opt-complete-guide",
    },
};

export default function TravelOnOPTGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "Can You Travel On Opt", url: "https://www.trackmyopt.com/blog/can-you-travel-on-opt" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" faqItems={[{question: "Can I travel while my OPT application is pending?", answer: "It is strongly discouraged. If you leave the US while your OPT application is pending before receiving your EAD card, USCIS may consider your application abandoned. Consult your DSO and an immigration attorney first."}, {question: "Do I need a valid visa stamp to re-enter the US on OPT?", answer: "Generally yes. However, if traveling to Canada, Mexico, or Caribbean islands for fewer than 30 days, you may qualify for automatic visa revalidation allowing re-entry on an expired stamp."}, {question: "Does travel outside the US stop my unemployment clock?", answer: "No. Days spent outside the US while unemployed still count toward your 90-day unemployment limit. The clock only stops with qualifying employment of at least 20 hours per week."}, {question: "How recent must my I-20 travel signature be?", answer: "Your DSO's travel endorsement signature must be dated within the last 6 months at time of re-entry. If older than 6 months, CBP may deny entry. Get a fresh signature before each trip."}, {question: "Can I travel between jobs on OPT?", answer: "Yes, but carefully. You need a job offer letter for your next position. Days between jobs count toward your 90-day unemployment limit, including days abroad."}]} />
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Travel on OPT</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        OPT Basics
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        10 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Can You Travel on OPT? Complete F-1 Travel Guide (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    International travel during OPT is one of the most anxiety-inducing topics for F-1 students. Can you leave the US? Will you be allowed back in? Does it affect your unemployment clock? This guide answers everything.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Last updated: March 12, 2026</span>
                    <span>•</span>
                    <span>Written by TrackMyOPT Team (former F-1 students)</span>
                </div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    Yes, F-1 students can travel internationally while on approved OPT, but you need a valid passport, valid F-1 visa stamp, EAD card, and an I-20 with a travel signature from your DSO dated within the last 6 months. Traveling while your OPT application is pending carries significant risk.
                </p>
            </div>

            {/* Key Takeaway Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    <strong>Yes, you can travel internationally while on approved OPT</strong> — but only if you have the right documents for re-entry: a valid passport, EAD card, travel-endorsed I-20 (signed within the last 6 months), and proof of employment. <strong>Travel while OPT is pending (before you receive your EAD) is strongly discouraged</strong> and may result in your application being considered abandoned.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" target="_blank" rel="noopener noreferrer" className="underline">USCIS.gov — OPT for F-1 Students</a>; <a href="https://studyinthestates.dhs.gov/students/travel" target="_blank" rel="noopener noreferrer" className="underline ml-1">Study in the States — Travel</a>
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#approved-opt", "Can You Travel While on Approved OPT?"],
                        ["#pending-opt", "Travel While OPT Is Pending: The Risky Scenario"],
                        ["#required-docs", "Required Documents for Re-Entry"],
                        ["#unemployment-days", "Does Travel Affect Your Unemployment Days?"],
                        ["#stem-opt-travel", "Travel During STEM OPT"],
                        ["#visa-renewal", "Countries Where F-1 Visa Renewal Is Available"],
                        ["#planning", "Step-by-Step: Planning Your Trip on OPT"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="approved-opt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Can You Travel While on Approved OPT?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <strong>Yes.</strong> Once your OPT has been approved and you have your EAD card in hand, you are generally allowed to travel outside the United States and re-enter. However, re-entry is never guaranteed — it is always at the discretion of the Customs and Border Protection (CBP) officer at the port of entry.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        To minimize any issues, you need to carry a specific set of documents every time you travel. Missing even one can lead to delays, secondary inspection, or in rare cases, denial of entry. Here's what you must have:
                    </p>

                    <div className="space-y-3 mb-6">
                        {[
                            { doc: "Valid passport", detail: "Must be valid for at least 6 months beyond your date of entry (some countries require more)." },
                            { doc: "Valid F-1 visa stamp", detail: "Must be valid at the time of re-entry — unless you qualify for automatic revalidation (see below)." },
                            { doc: "EAD card (I-766)", detail: "Your physical Employment Authorization Document. Do not travel without it." },
                            { doc: "I-20 with travel endorsement", detail: "Your I-20 must have a travel signature from your DSO dated within the last 6 months." },
                            { doc: "Job offer letter or employment verification", detail: "A letter from your current or future employer confirming your position and that it relates to your field of study." },
                        ].map((item) => (
                            <div key={item.doc} className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.doc}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "Traveling on OPT is allowed, but preparation is everything. One missing document can turn a vacation into an immigration nightmare."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — Advice from international student advisors nationwide
                        </p>
                    </div>
                </section>

                <section id="pending-opt" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Travel While OPT Is Pending: The Risky Scenario
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you've applied for OPT but have <strong>not yet received your EAD card</strong>, traveling outside the US is strongly discouraged by most international student offices and immigration attorneys. Here's why:
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Risk: Application Deemed Abandoned</h3>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    If you leave the US while your OPT application is pending, USCIS may consider your application abandoned — especially if you no longer have a valid program of study to return to. This is not guaranteed to happen, but the risk is real and well-documented.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Risk: Re-Entry Complications</h3>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    Without an EAD card, you rely on your student status for re-entry. If your program has ended, your basis for being in F-1 status is weaker, and a CBP officer may question your intent to re-enter.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">No Advance Parole for F-1</h3>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    Unlike some other visa categories, F-1 students cannot apply for Advance Parole to travel while their OPT application is pending. Your only option is to use your F-1 visa and student status.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Bottom Line</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                            If your OPT application is pending, the safest course of action is to <strong>stay in the United States</strong> until you receive your EAD card. If you absolutely must travel, consult your DSO and an immigration attorney before making any plans. Some students have successfully traveled and returned during the pending period, but it's a gamble that most advisors don't recommend.
                        </p>
                    </div>
                </section>

                <section id="required-docs" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Required Documents for Re-Entry
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        When you return to the US after traveling on OPT, the CBP officer will want to see documentation that confirms your legal status and employment. Here's a comprehensive checklist:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Document</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Requirement</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Valid Passport", "Must be valid for 6+ months beyond entry date", "Renew before traveling if it expires soon"],
                                    ["F-1 Visa Stamp", "Must be valid — unless automatic revalidation applies", "Can be expired if traveling from Canada/Mexico for <30 days (same school, same status)"],
                                    ["EAD Card (I-766)", "Must have the physical card", "A digital copy or receipt notice is not sufficient at the border"],
                                    ["I-20 with Travel Signature", "DSO signature dated within the last 6 months", "Request a new signature before every trip — don't assume an old one is recent enough"],
                                    ["Employment Verification Letter", "Letter from employer on company letterhead", "Include job title, start date, hours/week, and relationship to your major"],
                                    ["Recent Pay Stubs", "Recommended but not always required", "Proves you are actively employed, not just holding an offer"],
                                    ["I-797C Receipt Notice", "Carry your OPT approval notice", "Backup proof of your EAD authorization"],
                                ].map(([doc, req, notes], i) => (
                                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">{doc}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{req}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 mt-6">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Pro Tip</h3>
                            <p className="text-sm text-green-800 dark:text-green-200">
                                Keep all these documents in your <strong>carry-on bag</strong>, not in checked luggage. If your checked bag is lost or delayed, you need these documents at the immigration checkpoint.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="unemployment-days" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Does Travel Affect Your Unemployment Days?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is one of the most misunderstood aspects of OPT travel. Here's what you need to know:
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Leaving the US does NOT stop your unemployment clock</h3>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    According to USCIS guidance, if you are unemployed and leave the US, those days outside the country <strong>still count toward your 90-day unemployment limit</strong>. Simply being abroad does not pause the clock. The only way to stop the unemployment counter is to have qualifying employment.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">If you're employed, travel doesn't add unemployment days</h3>
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    If you have an active job and take a vacation or business trip, those days do not count as unemployment — you still have qualifying employment. Just make sure your employer confirms you're still employed during the trip.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Example Scenario</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>📅 You lose your job on June 1 (unemployment clock starts)</p>
                            <p>✈️ You fly home on June 10 and stay abroad for 3 weeks</p>
                            <p>🛬 You return to the US on July 1</p>
                            <p>📊 <strong>Total unemployment days accrued: 30 days</strong> (June 1 – July 1, including time abroad)</p>
                            <p>⚠️ Being outside the US did not pause the clock</p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                        Use TrackMyOPT's <Link href="/dashboard/opt-tools/opt-clock" className="text-blue-600 dark:text-blue-400 underline">OPT Unemployment Clock</Link> to monitor your days in real time, whether you're in the US or abroad.
                    </p>
                </section>

                <section id="stem-opt-travel" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Travel During STEM OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If you're on a <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 underline">STEM OPT extension</Link>, the travel rules are essentially the same as initial OPT, with a few important additions:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Rule</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Initial OPT</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">STEM OPT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["I-20 travel signature required", "Yes (within 6 months)", "Yes (within 6 months)"],
                                    ["EAD card required for re-entry", "Yes", "Yes (STEM EAD)"],
                                    ["Must have active employment", "Recommended", "Required — you cannot be between jobs on STEM OPT"],
                                    ["Employer reporting obligations", "Report within 10 days of change", "More strict — employer must report to DSO; I-983 must be current"],
                                    ["Unemployment day limit", "90 days", "150 days total (90 + 60)"],
                                ].map(([rule, initial, stem], i) => (
                                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-semibold text-gray-900 dark:text-white">{rule}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{initial}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{stem}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Critical for STEM OPT:</strong> You must have an active employer and a current I-983 Training Plan on file before traveling. If you are between jobs or your I-983 is out of date, do not travel — CBP may question your eligibility to re-enter in STEM OPT status.
                        </p>
                    </div>
                </section>

                <section id="visa-renewal" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Countries Where F-1 Visa Renewal Is Available
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        If your F-1 visa stamp has expired, you may be able to renew it while abroad — or in some cases, re-enter the US without a valid stamp. Here are the key scenarios:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" />
                                Automatic Visa Revalidation (Canada, Mexico, and Adjacent Islands)
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                If you travel to <strong>Canada, Mexico, or certain Caribbean islands</strong> for fewer than 30 days, you may re-enter the US on an expired F-1 visa under the <strong>automatic visa revalidation</strong> rule. Requirements:
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Trip must be less than 30 days</li>
                                <li>• You must have a valid I-20 and EAD</li>
                                <li>• You must not have applied for a new visa while abroad (if denied, revalidation doesn't apply)</li>
                                <li>• You must not be a national of Iran, Syria, Sudan, Cuba, or North Korea</li>
                            </ul>
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" />
                                Third-Country Visa Renewal
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                You can apply for a new F-1 visa stamp at a US consulate in any country that processes F-1 visas. Popular options include:
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• <strong>Canada:</strong> Ottawa, Toronto, Vancouver — generally F-1-friendly</li>
                                <li>• <strong>Mexico:</strong> Ciudad Juárez, Guadalajara, Mexico City</li>
                                <li>• <strong>Home country:</strong> Often the safest and most predictable option</li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Warning: Third-Country Visa Denial</h3>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    If you apply for a visa at a third-country consulate and are <strong>denied</strong>, you lose automatic revalidation eligibility and may be stuck outside the US until you obtain a new visa — potentially at your home country's consulate. This is a significant risk.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="planning" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step-by-Step: Planning Your Trip on OPT
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Follow this 5-step checklist to plan a safe international trip while on OPT:
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: "1", title: "Check your visa status", desc: "Verify that your F-1 visa stamp is still valid. If it has expired, determine whether you qualify for automatic revalidation (Canada/Mexico trip under 30 days) or if you need to renew at a consulate. If you need to renew, consider doing it at your home country's US consulate for the best chance of approval.", color: "blue" },
                            { step: "2", title: "Get your I-20 signed", desc: "Visit your international student office and request a travel endorsement on your I-20. The DSO's signature must be dated within the last 6 months at the time of re-entry. Request the signature at least 2 weeks before your trip in case of delays.", color: "blue" },
                            { step: "3", title: "Gather your document packet", desc: "Collect all required documents: passport (6+ months validity), EAD card, signed I-20, employment verification letter, recent pay stubs, and your I-797C receipt notice. Make photocopies and store digital copies in your email or cloud storage as backup.", color: "blue" },
                            { step: "4", title: "Check with your employer", desc: "Inform your employer of your travel plans and request an employment verification letter on company letterhead. Confirm your employment status will remain active during your trip. Some employers have specific policies about international travel on OPT.", color: "blue" },
                            { step: "5", title: "Plan your return carefully", desc: "Book a return flight well before any critical dates (OPT expiration, unemployment day limits). Arrive at a US port of entry that processes F-1 students regularly. Have all documents easily accessible in your carry-on. Be prepared to clearly explain your OPT status and employment to the CBP officer.", color: "blue" },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm flex-shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "Can I travel while my OPT application is pending?", answer: "It is strongly discouraged. If you leave the US while your OPT application is pending (before receiving your EAD card), USCIS may consider your application abandoned. You also risk re-entry complications since your student program may have ended. If you must travel, consult your DSO and an immigration attorney first." },
                            { question: "Do I need a valid visa stamp to re-enter the US on OPT?", answer: "Generally yes — you need a valid, unexpired F-1 visa stamp to re-enter the US. However, if you are traveling to Canada, Mexico, or certain Caribbean islands for fewer than 30 days, you may qualify for automatic visa revalidation, which allows re-entry on an expired F-1 visa stamp. This exception does not apply to nationals of certain countries." },
                            { question: "Does travel outside the US stop my unemployment clock?", answer: "No. Days spent outside the US while you are unemployed still count toward your 90-day unemployment limit. The unemployment clock only stops when you have qualifying employment (at least 20 hours per week in your field of study). Traveling abroad does not pause or reset the counter." },
                            { question: "How recent must my I-20 travel signature be?", answer: "Your DSO's travel endorsement signature on your I-20 must be dated within the last 6 months at the time you re-enter the United States. If your signature is older than 6 months, CBP may deny you entry. Always get a fresh signature before each international trip." },
                            { question: "Can I travel between jobs on OPT?", answer: "You can, but proceed with caution. You need to carry a job offer letter for your next position as proof that you have employment lined up. Remember that days between jobs count toward your 90-day unemployment limit, including days spent abroad. Also make sure your I-20 travel signature is current and you have all required documents." },
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
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day OPT Unemployment Rule</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Status Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Stay Compliant While Traveling on OPT</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    Join 2,500+ F-1 students who use TrackMyOPT to monitor their unemployment days, track case status changes, and stay on top of their OPT compliance — even while abroad.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Start Tracking Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
