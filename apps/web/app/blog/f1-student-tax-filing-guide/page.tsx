import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, FileText, DollarSign, Calculator } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
export const metadata: Metadata = {
    title: "F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step",
    description: "Complete F-1 student tax filing guide for 2026. Learn which forms to file (8843, 1040-NR), FICA tax exemption, resident vs non-resident status, tax treaties, and step-by-step filing instructions.",
    keywords: ["f-1 student tax filing", "international student taxes", "form 8843", "1040-NR", "FICA exemption", "F-1 tax guide 2026", "non-resident alien tax", "international student tax return"],
    openGraph: {
        title: "F-1 Student Tax Filing Guide 2026 | TrackMyOPT",
        description: "Complete guide to filing taxes as an F-1 student in 2026. Forms, deadlines, FICA exemption, and step-by-step instructions.",
        url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide",
        type: "article",
        images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step" }]
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide",
    },
};

export default function F1TaxFilingGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "F1 Student Tax Filing Guide", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-03-12" modifiedDate="2026-03-12" author="TrackMyOPT Team" howToItems={[{step: 1, name: "Determine Your Residency Status", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide#residency", image: "https://www.trackmyopt.com/og-image.png"}, {step: 2, name: "Complete Form 8843", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide#form-8843", image: "https://www.trackmyopt.com/og-image.png"}, {step: 3, name: "Complete Form 1040-NR if You Earned Income", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide#form-1040-nr", image: "https://www.trackmyopt.com/og-image.png"}, {step: 4, name: "Gather All Required Documents", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide#documents", image: "https://www.trackmyopt.com/og-image.png"}, {step: 5, name: "File With the IRS Before Deadline", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide#filing", image: "https://www.trackmyopt.com/og-image.png"}, {step: 6, name: "Keep Your Records for Future Years", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide#records", image: "https://www.trackmyopt.com/og-image.png"}]} />
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">F-1 Tax Filing Guide</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                        Tax & Finance
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        12 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    Filing taxes as an international student is confusing — especially when the rules differ from US citizens. This guide breaks down every form, deadline, and exemption F-1 students need to know for the 2026 tax season.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Last updated: March 12, 2026</span>
                    <span>•</span>
                    <span>Written by TrackMyOPT Team</span>
                </div>
            </header>

            {/* Key Takeaway Box */}
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-teal-900 dark:text-teal-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-teal-800 dark:text-teal-200 font-medium">
                    Every F-1 student in the US must file <strong>Form 8843</strong> — even with zero income. If you earned any income, you also need to file <strong>Form 1040-NR</strong>. Most F-1 students are classified as <strong>non-resident aliens</strong> for their first 5 calendar years and are exempt from FICA taxes (Social Security & Medicare).
                </p>
                <p className="text-teal-700 dark:text-teal-300 text-sm mt-2">
                    Source: <a href="https://www.irs.gov/individuals/international-taxpayers/foreign-students-scholars-and-visitors" target="_blank" rel="noopener noreferrer" className="underline">IRS.gov — Foreign Students & Scholars</a>
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#do-f1-need-to-file", "Do F-1 Students Need to File Taxes?"],
                        ["#resident-vs-nonresident", "Resident vs Non-Resident Alien: Which Are You?"],
                        ["#essential-forms", "Essential Tax Forms for F-1 Students"],
                        ["#fica-exemption", "FICA Tax Exemption: Getting Your Money Back"],
                        ["#step-by-step", "Step-by-Step Tax Filing Process"],
                        ["#common-mistakes", "Common Tax Mistakes F-1 Students Make"],
                        ["#tax-treaties", "Tax Treaties: Reduced Rates by Country"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">

                <section id="do-f1-need-to-file" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Do F-1 Students Need to File Taxes?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <strong>Yes — every F-1 student present in the US during any part of the tax year is required to file at least one tax form</strong>, regardless of whether they earned income. This is a common source of confusion because many students assume "no income = no filing."
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The IRS requires all F-1, F-2, J-1, and J-2 visa holders to file <strong>Form 8843</strong> ("Statement for Exempt Individuals"), which is an informational return — not a tax payment. It declares your exempt status under the Substantial Presence Test.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                            <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-teal-900 dark:text-teal-100">You MUST File If:</h3>
                                <ul className="mt-2 space-y-1 text-sm text-teal-800 dark:text-teal-200">
                                    <li>• You were physically present in the US on F-1 status during 2025 (even for one day)</li>
                                    <li>• You received any US-source income (wages, scholarships, stipends, interest)</li>
                                    <li>• You had taxes withheld from paychecks and want a refund</li>
                                    <li>• You are claiming a tax treaty benefit</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Even With No Income:</h3>
                                <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                                    You still must file <strong>Form 8843</strong>. Failure to file does not trigger an immediate penalty, but it can create complications for future visa applications, green card petitions, or status changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        TrackMyOPT's <Link href="/features/tax-filing" className="text-blue-600 dark:text-blue-400 underline">Tax Filing Assistant</Link> helps you determine exactly which forms you need based on your income and visa history.
                    </p>
                </section>

                <section id="resident-vs-nonresident" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Resident vs Non-Resident Alien: Which Are You?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Your tax classification determines which forms you file and which deductions you can claim. The IRS uses the <strong>Substantial Presence Test (SPT)</strong> to determine if you are a resident alien or non-resident alien for tax purposes — and F-1 students get a special exemption.
                    </p>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-teal-600" />
                            The 5-Year Exemption Rule
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                            F-1 students are classified as <strong>"exempt individuals"</strong> and can exclude their first <strong>5 calendar years</strong> from the Substantial Presence Test. This means most F-1 students are <strong>non-resident aliens</strong> for tax purposes during their studies.
                        </p>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>📅 Arrived August 2021 → Exempt through all of 2025 (5 calendar years: 2021–2025)</p>
                            <p>📅 Arrived January 2023 → Exempt through all of 2027 (5 calendar years: 2023–2027)</p>
                            <p>📋 Starting year 6, you take the SPT and may become a resident alien for tax purposes</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Factor</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Non-Resident Alien</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Resident Alien</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Tax Form", "1040-NR", "1040 (same as US citizens)"],
                                    ["Standard Deduction", "Not available (unless treaty)", "$14,600 (2025 tax year)"],
                                    ["FICA Exemption", "Yes (first 5 years)", "No"],
                                    ["Worldwide Income", "Only US-source income", "Worldwide income taxed"],
                                    ["Tax Treaty Benefits", "Yes, if applicable", "Generally no"],
                                    ["Filing Status", "Single or Married NRA", "All statuses available"],
                                ].map(([factor, nra, ra], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{factor}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{nra}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{ra}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Critical:</strong> Filing as a resident alien when you are actually a non-resident alien (or vice versa) is one of the most common and costly mistakes F-1 students make. Use the <Link href="/dashboard/tax-filing" className="underline font-medium">TrackMyOPT Tax Tool</Link> to determine your correct classification.
                        </p>
                    </div>
                </section>

                <section id="essential-forms" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Essential Tax Forms for F-1 Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Here are the key IRS forms every F-1 student should know. The forms you need depend on whether you earned income and your residency classification.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                form: "Form 8843",
                                who: "ALL F-1 students (even with no income)",
                                purpose: "Declares your exempt status under the Substantial Presence Test. This is an informational form — it is not a tax return and does not calculate taxes owed.",
                                deadline: "June 15, 2026 (if no income) or April 15, 2026 (if filing with 1040-NR)",
                                color: "teal",
                            },
                            {
                                form: "Form 1040-NR",
                                who: "Non-resident aliens with US-source income",
                                purpose: "The non-resident alien income tax return. Used to report wages, scholarships, fellowship grants, and other US-source income. Attach Form 8843 to this return.",
                                deadline: "April 15, 2026",
                                color: "blue",
                            },
                            {
                                form: "W-2 (received from employer)",
                                who: "F-1 students who worked (on-campus, CPT, OPT)",
                                purpose: "Reports your annual wages and taxes withheld by your employer. You should receive this by January 31. You need this to complete your 1040-NR.",
                                deadline: "Employer must send by Jan 31",
                                color: "gray",
                            },
                            {
                                form: "1042-S (received from payer)",
                                who: "F-1 students who received scholarships, fellowships, or treaty-exempt income",
                                purpose: "Reports income subject to withholding for non-resident aliens. Common for scholarship/fellowship payments and income exempt under tax treaties.",
                                deadline: "Payer must send by March 15",
                                color: "gray",
                            },
                            {
                                form: "Form 843 (FICA refund claim)",
                                who: "F-1 students who had FICA taxes incorrectly withheld",
                                purpose: "Used to request a refund of Social Security and Medicare taxes that were incorrectly withheld from your pay. F-1 students in their first 5 years are exempt from FICA.",
                                deadline: "Within 3 years of the tax year",
                                color: "amber",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.color === "teal" ? "text-teal-600" : item.color === "blue" ? "text-blue-600" : item.color === "amber" ? "text-amber-600" : "text-gray-500"}`} />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.form}</h3>
                                        <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-1">Who: {item.who}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.purpose}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">📅 Deadline: {item.deadline}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="fica-exemption" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        FICA Tax Exemption: Getting Your Money Back
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        One of the most valuable tax benefits for F-1 students is the <strong>FICA tax exemption</strong>. FICA taxes include Social Security (6.2%) and Medicare (1.45%) — a combined 7.65% of your gross pay. During your first 5 calendar years on F-1 status, you are <strong>exempt from FICA taxes</strong> under IRC Section 3121(b)(19).
                    </p>

                    <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500 p-4 rounded-r-xl my-6">
                        <p className="text-teal-900 dark:text-teal-100 font-semibold text-lg">
                            "F-1 students are exempt from FICA taxes for their first 5 calendar years in the US, potentially saving $3,825 for every $50,000 earned."
                        </p>
                        <p className="text-teal-700 dark:text-teal-300 text-sm mt-1">
                            — Source: IRS Publication 519, IRC § 3121(b)(19)
                        </p>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What If FICA Was Incorrectly Withheld?</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Many employers — especially large payroll systems — automatically withhold FICA taxes from all employees. If you're an F-1 student within your first 5 calendar years and FICA was deducted from your paycheck, you can get a refund.
                    </p>

                    <div className="space-y-4">
                        {[
                            { step: "Check your W-2", detail: "Look at Box 4 (Social Security tax withheld) and Box 6 (Medicare tax withheld). If either shows an amount greater than $0, FICA was withheld." },
                            { step: "Contact your employer first", detail: "Ask your employer's payroll department to correct the withholding and issue a refund. They can file Form 941-X (adjusted employer quarterly return) to process this." },
                            { step: "If employer can't help, file Form 843", detail: "Submit Form 843 (Claim for Refund) directly to the IRS along with copies of your W-2, Form 8316, a letter explaining your F-1 exempt status, and copies of your I-20 and visa stamp." },
                            { step: "Wait for your refund", detail: "IRS processing typically takes 6-12 weeks for Form 843 claims. You have up to 3 years from the original filing deadline to claim a FICA refund." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 text-sm font-bold">{i + 1}</div>
                                    {item.step}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="step-by-step" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step-by-Step Tax Filing Process
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Follow this timeline to file your 2025 tax return correctly as an F-1 student. The federal tax filing deadline is <strong>April 15, 2026</strong>.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                step: "January: Gather Your Documents",
                                tips: [
                                    "Collect all W-2s from employers (due to you by January 31)",
                                    "Collect 1042-S forms for scholarship/fellowship income (due by March 15)",
                                    "Have your passport, visa, I-20, and I-94 arrival record ready",
                                    "Note all US entry/exit dates for the Substantial Presence Test",
                                ],
                            },
                            {
                                step: "February: Determine Your Tax Status",
                                tips: [
                                    "Count your calendar years on F-1 status (5-year exemption applies)",
                                    "If within 5 years → you are a non-resident alien (file 1040-NR)",
                                    "If beyond 5 years → take the Substantial Presence Test to determine status",
                                    "Use TrackMyOPT's Tax Filing Tool to automate this determination",
                                ],
                            },
                            {
                                step: "March: Choose Your Filing Method",
                                tips: [
                                    "Sprintax — designed specifically for non-resident aliens; recommended for most F-1 students",
                                    "Glacier Tax Prep — offered by many universities for free; good for simple returns",
                                    "TurboTax/H&R Block — do NOT use these if you are a non-resident alien (they file 1040, not 1040-NR)",
                                    "Paper filing — always an option but slower; download forms from IRS.gov",
                                ],
                            },
                            {
                                step: "April: File Before the Deadline",
                                tips: [
                                    "Federal deadline: April 15, 2026 (for those with income)",
                                    "State tax returns: check your state's deadline (varies by state)",
                                    "Form 8843 only (no income): deadline is June 15, 2026",
                                    "If you need an extension, file Form 4868 before April 15 (gives you until October 15)",
                                ],
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 text-sm font-bold">{i + 1}</div>
                                    {item.step}
                                </h3>
                                <ul className="space-y-1 ml-9">
                                    {item.tips.map((tip, j) => (
                                        <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            State Tax Filing
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                            Most states also require you to file a state tax return if you earned income in that state. Some states (Texas, Florida, Washington, Nevada, and a few others) have no state income tax. Check your state's department of revenue website for non-resident alien filing requirements.
                        </p>
                    </div>
                </section>

                <section id="common-mistakes" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Common Tax Mistakes F-1 Students Make
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        These are the most frequent errors international students make when filing taxes. Avoiding them can save you money and prevent immigration complications.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                mistake: "Filing as a Resident Alien (Using Form 1040 Instead of 1040-NR)",
                                impact: "High",
                                detail: "TurboTax, H&R Block, and most popular tax software assume you are a US citizen or resident alien. If you use them as a non-resident alien, you'll file the wrong form, which can trigger IRS notices and affect your immigration record.",
                                fix: "Use Sprintax or Glacier Tax Prep, which are designed for non-resident aliens and file Form 1040-NR.",
                            },
                            {
                                mistake: "Forgetting to File Form 8843",
                                impact: "Medium",
                                detail: "Even if you had no income, you must file Form 8843. While the IRS doesn't typically penalize for missing this form, it can create issues when applying for a green card or during a USCIS status review.",
                                fix: "File Form 8843 every year you are in the US on F-1 status. It's a simple 2-page form.",
                            },
                            {
                                mistake: "Not Claiming the FICA Tax Refund",
                                impact: "High",
                                detail: "Many F-1 students don't realize they are exempt from Social Security and Medicare taxes. If your employer withheld FICA, you could be owed hundreds or thousands of dollars.",
                                fix: "Check W-2 boxes 4 and 6. If amounts were withheld, request a refund from your employer or file Form 843 with the IRS.",
                            },
                            {
                                mistake: "Claiming the Standard Deduction as a Non-Resident",
                                impact: "Medium",
                                detail: "Non-resident aliens generally cannot claim the standard deduction ($14,600 for 2025). Only students from India can claim it under the US-India tax treaty (Article 21).",
                                fix: "Only claim itemized deductions (state/local taxes, charitable contributions) or treaty-based deductions if applicable.",
                            },
                            {
                                mistake: "Not Reporting Scholarship Income Above Tuition",
                                impact: "Medium",
                                detail: "Scholarship amounts used for tuition and required fees are tax-free. But amounts used for room, board, books, or living expenses are taxable income that must be reported.",
                                fix: "Calculate the taxable portion of your scholarship (total scholarship minus qualified tuition/fees) and report it on your 1040-NR.",
                            },
                            {
                                mistake: "Missing Tax Treaty Benefits",
                                impact: "Medium",
                                detail: "Many countries have tax treaties with the US that provide reduced tax rates or exemptions for students. These benefits are not automatic — you must claim them on your return.",
                                fix: "Check if your country has a tax treaty with the US (see table below). Claim the benefit on Form 1040-NR and attach Form 8233 if required.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{item.mistake}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                                            <p className="text-sm text-teal-700 dark:text-teal-300 mt-2 font-medium">✅ Fix: {item.fix}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${item.impact === "High" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"}`}>
                                        {item.impact} Impact
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="tax-treaties" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Tax Treaties: Reduced Rates by Country
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The US has income tax treaties with over 65 countries. Many of these treaties include specific provisions for students and trainees. Below are the most commonly used treaty benefits for F-1 students. Check <Link href="/glossary" className="text-blue-600 dark:text-blue-400 underline">our glossary</Link> for definitions of key tax terms.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Country</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Treaty Article</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Exemption Amount</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Applies To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["India", "Article 21(2)", "$9,000/year", "Wages, scholarships, fellowships"],
                                    ["China", "Article 20(c)", "$5,000/year", "Wages from employment"],
                                    ["South Korea", "Article 21(1)", "$2,000/year", "Personal services income"],
                                    ["Japan", "Article 20", "Entire scholarship", "Scholarships & fellowships only"],
                                    ["Germany", "Article 20(4)", "$9,000/year", "Employment & self-employment"],
                                    ["France", "Article 21", "$5,000/year", "Personal services"],
                                    ["Canada", "Article XV", "No student-specific provision", "General employment rules apply"],
                                    ["Bangladesh", "Article 21", "$5,000/year", "Personal services"],
                                    ["Philippines", "Article 22", "Entire scholarship", "Scholarships only"],
                                    ["Thailand", "Article 22", "Entire scholarship", "Scholarships, government grants"],
                                ].map(([country, article, amount, applies], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{country}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{article}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-teal-700 dark:text-teal-300 font-medium">{amount}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{applies}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>⚠️ Note:</strong> Tax treaty benefits must be actively claimed on your tax return — they are not applied automatically. Consult IRS Publication 901 for the full list of treaties and provisions. Always verify the current treaty terms as they can change.
                        </p>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "Do F-1 students pay taxes?", answer: "Yes. F-1 students who earn income in the US must pay federal (and usually state) income tax. Even F-1 students with no income must file Form 8843 as an informational return. Non-resident alien F-1 students file Form 1040-NR instead of the standard 1040.",
                            },
                            { question: "What is Form 8843?", answer: "Form 8843 ('Statement for Exempt Individuals') is an IRS form that all F-1 and J-1 visa holders must file each year they are present in the US. It declares your exempt status under the Substantial Presence Test. It is not a tax return — it does not calculate taxes owed. Filing it takes about 10 minutes.",
                            },
                            { question: "Can F-1 students use TurboTax?", answer: "Generally no — if you are a non-resident alien (most F-1 students in their first 5 years). TurboTax, H&R Block, and FreeTaxUSA only support Form 1040, not Form 1040-NR. Use Sprintax or Glacier Tax Prep instead, which are designed for non-resident alien tax filing.",
                            },
                            { question: "What is the FICA tax exemption for F-1 students?", answer: "F-1 students are exempt from paying FICA taxes (Social Security at 6.2% and Medicare at 1.45%) during their first 5 calendar years in the US under IRC Section 3121(b)(19). If your employer incorrectly withheld FICA, you can request a refund through your employer or by filing Form 843 with the IRS.",
                            },
                            { question: "When is the tax filing deadline for F-1 students?", answer: "For the 2025 tax year, the federal deadline is April 15, 2026 if you have US-source income. If you have no income and are only filing Form 8843, the deadline is June 15, 2026. You can file for an extension using Form 4868, which gives you until October 15, 2026 — but any taxes owed are still due by April 15.",
                            },
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
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day Unemployment Rule</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                    <Link href="/blog/opt-health-insurance-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Health Insurance Guide 2026</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/tax-filing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tax Filing Assistant →</Link>
                    <Link href="/features/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">OPT Compliance Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                    <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">View Pricing →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Simplify Your F-1 Tax Filing</h2>
                <p className="text-teal-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT's Tax Filing Tool determines your residency status, identifies required forms, and guides you through every step.
                </p>
                <Link href="/features/tax-filing" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors">
                    Try Tax Filing Tool Free <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
