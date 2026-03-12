import { Metadata } from "next";
import Link from "next/link";
import {
    BookOpen,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Calculator,
    FileText,
    DollarSign,
    Globe,
    Calendar,
    ExternalLink,
} from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";

export const metadata: Metadata = {
    title: "The Ultimate F-1 Student Tax Guide (2026) | TrackMyOPT",
    description: "Complete step-by-step guide to US tax filing for international F-1 students. Covers forms, deadlines, FICA refunds, tax treaties, and strategies to maximize refunds.",
    alternates: {
        canonical: "https://www.trackmyopt.com/guides/f1-tax-filing",
    },
};

export default function F1TaxFilingPillarGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Schema Markup */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "The Ultimate F-1 Student Tax Guide (2026)",
                "description": "The most comprehensive, step-by-step guide to US tax filing for international students on F-1 visas. Covers every form, every deadline, FICA refunds, tax treaties for 15+ countries, state taxes, software comparisons, and the mistakes that cost students thousands of dollars.",
                "image": "https://trackmyopt.com/og-f1-tax-guide.jpg",
                "datePublished": "2026-03-12",
                "dateModified": "2026-03-12",
                "author": {
                    "@type": "Organization",
                    "name": "TrackMyOPT Team",
                    "url": "https://trackmyopt.com"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "TrackMyOPT",
                    "url": "https://trackmyopt.com",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://trackmyopt.com/logo.png"
                    }
                },
                "articleBody": "Complete guide to F-1 student tax filing, including forms, strategies, and compliance requirements."
            })}} />

            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "How to File Taxes as an F-1 Student",
                "description": "Step-by-step instructions for F-1 students to properly file US taxes, including form selection, deadline compliance, and FICA exemption claims.",
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": "Determine if You Need to File",
                        "text": "All F-1 students present in the US must file at least Form 8843, even with zero income. If you have US-source income, you must also file Form 1040-NR."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Classify Your Tax Status",
                        "text": "Determine if you are a resident alien or non-resident alien using the Substantial Presence Test. F-1 students are typically non-residents for the first 5 calendar years."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Gather Required Form 8843",
                        "text": "Obtain Form 8843 (Statement for Exempt Individuals). This form establishes your exempt status and must be filed by June 15 if you have no income, or April 15 if attached to Form 1040-NR."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Complete Form 8843 Information",
                        "text": "Enter your name, SSN/ITIN, visa type (F-1), US entry date, university name, and program of study. List all years present in the US to establish your 5-year exemption period."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "File Form 1040-NR if Applicable",
                        "text": "If you have US-source income, file Form 1040-NR to report wages, scholarships, and other taxable income. Attach Form 8843 to this return."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Claim FICA Tax Exemption",
                        "text": "Verify that Social Security and Medicare taxes were not withheld on your wages. If incorrectly withheld, file Form 843 to claim a refund using your I-20 and visa documents as proof."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Research Tax Treaty Benefits",
                        "text": "Check if your country has a tax treaty with the US that reduces your tax burden. File Form 8233 before wages are paid to claim treaty exemption at source."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Address State Tax Requirements",
                        "text": "Research your state's tax filing requirements. Most states follow federal rules, but some have additional filing obligations for non-residents."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Choose Tax Filing Software",
                        "text": "Use specialized software like Sprintax (F-1 specific) or TurboTax International. Compare features, pricing, and support before selecting."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Submit Your Return by Deadline",
                        "text": "File by April 15, 2026 (or October 15 with extension). For Form 8843 only, the deadline is June 15. Mail or e-file according to IRS requirements."
                    }
                ]
            })}} />

            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Do F-1 students have to file US taxes?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Every F-1 student physically present in the US must file at least Form 8843, even with zero income. This is required regardless of whether you earned any money. If you had US-source income, you must also file Form 1040-NR."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What is the difference between resident and non-resident aliens?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Non-resident aliens (NRA) pay tax on US-source income only and are exempt from FICA taxes for the first 5 calendar years. Resident aliens pay tax on worldwide income and must pay full FICA taxes. F-1 students are typically NRAs for their first 5 years using the Substantial Presence Test."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Which tax forms do F-1 students need?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Key forms are: Form 8843 (required for all F-1 students), Form 1040-NR (if you have US-source income), W-2 (from employers), 1042-S (from scholarship/fellowship payers), Form 843 (to claim FICA refund if incorrectly withheld), and Form 8233 (to claim tax treaty exemption)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How do I claim FICA tax exemption as an F-1 student?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "First, ensure your employer witholds correctly by giving them your I-20 and visa documentation. If FICA was incorrectly withheld, file Form 843 (Claim for Refund) with copies of your W-2, I-20, visa stamp, and a written explanation within 3 years of the original tax deadline."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What tax treaty benefits can F-1 students claim?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Tax treaty benefits vary by your country of citizenship. Over 50+ US tax treaties provide exemptions for students and teachers. For example, India, China, Canada, and many others have favorable student tax rates. File Form 8233 before your first paycheck to claim exemption at source rather than filing for a refund later."
                        }
                    }
                ]
            })}} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
                <span>/</span>
                <Link href="/guides" className="hover:text-blue-600 dark:hover:text-blue-400">Guides</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">F-1 Tax Filing</span>
            </nav>

            {/* Hero Section */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                        Pillar Guide
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        Tax & Finance
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        35 min read
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    The Ultimate F-1 Student Tax Guide (2026)
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The most comprehensive, step-by-step guide to US tax filing for international students on F-1 visas. Covers every form, every deadline, FICA refunds, tax treaties for 15+ countries, state taxes, software comparisons, and the mistakes that cost students thousands of dollars.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Last updated: March 12, 2026</span>
                    <span>•</span>
                    <span>Written by TrackMyOPT Team</span>
                    <span>•</span>
                    <span>IRS-sourced & expert-reviewed</span>
                </div>
            </header>

            {/* Key Takeaway Box */}
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-teal-900 dark:text-teal-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-teal-800 dark:text-teal-200 font-medium">
                    <strong>Every F-1 student in the United States must file at least Form 8843 — even if you earned zero income.</strong> If you had any US-source income (wages, scholarships, stipends, bank interest), you must also file Form 1040-NR. Most F-1 students are <strong>non-resident aliens</strong> for their first 5 calendar years and are exempt from FICA taxes (Social Security + Medicare = 7.65% of wages). Filing incorrectly — or not filing at all — can jeopardize future visa applications, green card petitions, and H-1B transfers.
                </p>
                <p className="text-teal-700 dark:text-teal-300 text-sm mt-3">
                    Source: <a href="https://www.irs.gov/individuals/international-taxpayers/foreign-students-scholars-and-visitors" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-900 dark:hover:text-teal-100">IRS.gov — Foreign Students, Scholars & Visitors</a> &nbsp;|&nbsp; <a href="https://www.irs.gov/pub/irs-pdf/p519.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-900 dark:hover:text-teal-100">IRS Publication 519</a>
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
                <nav className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                        ["#do-f1-need-to-file", "1. Do F-1 Students Need to File Taxes?"],
                        ["#resident-vs-nonresident", "2. Resident vs Non-Resident Alien for Tax Purposes"],
                        ["#essential-forms", "3. Tax Forms Every F-1 Student Needs to Know"],
                        ["#form-8843", "4. Form 8843: Step-by-Step Instructions"],
                        ["#form-1040nr", "5. Form 1040-NR: Filing as a Non-Resident"],
                        ["#fica-exemption", "6. FICA Tax Exemption: The 5-Year Rule"],
                        ["#tax-treaties", "7. Tax Treaty Benefits by Country"],
                        ["#state-taxes", "8. State Tax Filing for F-1 Students"],
                        ["#sprintax-vs-turbotax", "9. Sprintax vs TurboTax: Which Should You Use?"],
                        ["#common-mistakes", "10. Common Tax Mistakes F-1 Students Make"],
                        ["#timeline", "11. Tax Filing Timeline & Deadlines"],
                        ["#free-resources", "12. Free Tax Resources for International Students"],
                        ["#faq", "Frequently Asked Questions"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm py-1">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">

                {/* Section 1 */}
                <section id="do-f1-need-to-file" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        1. Do F-1 Students Need to File Taxes?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <strong>Yes — without exception.</strong> Every F-1 student who was physically present in the United States during any part of the calendar year is required to file at least one form with the IRS. This is true regardless of whether you earned a single dollar.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The IRS requires all F-1, F-2, J-1, and J-2 visa holders to file <strong>Form 8843</strong> ("Statement for Exempt Individuals and Individuals with a Medical Condition"). This is an informational return — not a tax payment form. It tells the IRS that you are an "exempt individual" under the Substantial Presence Test and should not be counted as a US resident for tax purposes.
                    </p>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                            <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-teal-900 dark:text-teal-100">You MUST File If:</h3>
                                <ul className="mt-2 space-y-1 text-sm text-teal-800 dark:text-teal-200">
                                    <li>• You were physically present in the US on F-1 status at any point during 2025</li>
                                    <li>• You received any US-source income — wages, scholarships, stipends, bank interest</li>
                                    <li>• You had federal or state taxes withheld and want a refund</li>
                                    <li>• You are claiming a tax treaty benefit to reduce your tax burden</li>
                                    <li>• You received a 1042-S for fellowship or scholarship payments</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100">No Income? You Still File Form 8843</h3>
                                <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                                    Failure to file Form 8843 does not trigger an immediate penalty. However, it can create complications for future visa applications, green card petitions (I-485), H-1B transfers, and any USCIS status change. Immigration attorneys consistently recommend filing it every year you are in the US.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        For a quick overview, see our <Link href="/blog/f1-student-tax-filing-guide" className="text-blue-600 dark:text-blue-400 underline">F-1 Tax Filing Blog Post</Link>. For automated form determination, use the <Link href="/features/tax-filing" className="text-blue-600 dark:text-blue-400 underline">TrackMyOPT Tax Filing Assistant</Link>.
                    </p>
                </section>

                {/* Section 2 */}
                <section id="resident-vs-nonresident" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        2. Resident vs Non-Resident Alien for Tax Purposes
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Your tax classification — <strong>resident alien</strong> or <strong>non-resident alien (NRA)</strong> — determines which form you file, which deductions you can claim, whether your worldwide income is taxed, and whether you qualify for FICA exemption. The IRS determines this using the <strong>Substantial Presence Test (SPT)</strong>.
                    </p>

                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-teal-600" />
                            The Substantial Presence Test Formula
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                            You are a <strong>resident alien</strong> if your day count meets <strong>both</strong> conditions:
                        </p>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm mb-4 border border-gray-200 dark:border-zinc-700">
                            <p className="text-gray-900 dark:text-white">Days present in current year ≥ 31</p>
                            <p className="text-gray-900 dark:text-white mt-1"><strong>AND</strong></p>
                            <p className="text-gray-900 dark:text-white mt-1">(Days in current year × 1) + (Days in year-1 × ⅓) + (Days in year-2 × ⅙) ≥ 183</p>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                            <strong>However</strong>, F-1 students get a critical exemption: days spent in the US as an "exempt individual" on F-1 status are excluded from the SPT count for the first <strong>5 calendar years</strong>.
                        </p>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>• Arrived August 2021 → Exempt through all of 2025 (5 calendar years: 2021, 2022, 2023, 2024, 2025)</p>
                            <p>• Arrived January 2023 → Exempt through all of 2027 (5 calendar years: 2023, 2024, 2025, 2026, 2027)</p>
                            <p>• Arrived August 2019 → Exempt ended after 2023; take the SPT for 2024 onward</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Factor</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Non-Resident Alien (NRA)</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Resident Alien (RA)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Tax Form", "1040-NR", "1040 (same as US citizens)"],
                                    ["Income Taxed", "US-source income only", "Worldwide income"],
                                    ["Standard Deduction", "Not available (treaty exceptions)", "$15,000 (2025 tax year)"],
                                    ["FICA Exemption", "Yes (first 5 calendar years)", "No — full 7.65% withheld"],
                                    ["Tax Treaty Benefits", "Yes, if applicable", "Generally not available"],
                                    ["Filing Status Options", "Single or Married NRA", "All statuses (incl. Head of Household)"],
                                    ["Education Credits", "Not eligible", "Eligible (AOTC, LLC)"],
                                    ["Earned Income Credit", "Not eligible", "May be eligible"],
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

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>Critical:</strong> Filing as a resident alien when you are a non-resident — or vice versa — is the single most costly mistake F-1 students make. It can result in IRS notices, incorrect refunds that must be returned with interest, and immigration complications. Use the <Link href="/dashboard/tax-filing" className="underline font-medium">TrackMyOPT Tax Tool</Link> to determine your exact classification.
                        </p>
                    </div>
                </section>

                {/* Section 3 */}
                <section id="essential-forms" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        3. Tax Forms Every F-1 Student Needs to Know
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        International students deal with a unique set of IRS forms. Here is every form you may encounter, who needs it, and when it is due. Refer to our <Link href="/glossary" className="text-blue-600 dark:text-blue-400 underline">Immigration Glossary</Link> for definitions of unfamiliar terms.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                form: "Form 8843",
                                who: "ALL F-1/F-2/J-1/J-2 visa holders present in the US",
                                purpose: "Declares your exempt status under the Substantial Presence Test. Not a tax return — no tax is calculated. Required even with zero income.",
                                deadline: "June 15, 2026 (no income) or April 15, 2026 (attached to 1040-NR)",
                                icon: "teal",
                            },
                            {
                                form: "Form 1040-NR",
                                who: "Non-resident aliens with US-source income",
                                purpose: "The non-resident alien federal income tax return. Reports wages, taxable scholarships, fellowship grants, and other US-source income. Attach Form 8843.",
                                deadline: "April 15, 2026 (extensions available to October 15)",
                                icon: "blue",
                            },
                            {
                                form: "W-2 (from employer)",
                                who: "F-1 students who worked on-campus, CPT, or OPT",
                                purpose: "Reports annual wages and taxes withheld by each employer. Check Box 4 (Social Security) and Box 6 (Medicare) for incorrect FICA withholding.",
                                deadline: "Employer must issue by January 31",
                                icon: "gray",
                            },
                            {
                                form: "1042-S (from payer)",
                                who: "Students who received scholarships, fellowships, or treaty-exempt income",
                                purpose: "Reports income paid to non-resident aliens that is subject to withholding. Common for scholarship/fellowship payments and tax treaty-exempt wages.",
                                deadline: "Payer must issue by March 15",
                                icon: "gray",
                            },
                            {
                                form: "Form 843",
                                who: "F-1 students who had FICA taxes incorrectly withheld",
                                purpose: "Claim for refund of erroneously collected Social Security and Medicare taxes. File with copies of W-2, I-20, visa stamp, and a written explanation.",
                                deadline: "Within 3 years of the original filing deadline",
                                icon: "amber",
                            },
                            {
                                form: "Form 8233",
                                who: "F-1 students claiming tax treaty exemption on wages",
                                purpose: "Given to your employer before they pay you so they can apply the treaty exemption at source (less withholding from each paycheck).",
                                deadline: "Submit to employer before wages are paid",
                                icon: "gray",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.icon === "teal" ? "text-teal-600" : item.icon === "blue" ? "text-blue-600" : item.icon === "amber" ? "text-amber-600" : "text-gray-500"}`} />
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.form}</h3>
                                        <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-1">Who: {item.who}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.purpose}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Deadline: {item.deadline}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 4 */}
                <section id="form-8843" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        4. Form 8843: Step-by-Step Instructions
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Form 8843 is a 2-page IRS form that takes about 10–15 minutes to complete. It is the single most important form for F-1 students because it establishes your exempt status under the Substantial Presence Test. Here is how to fill out each section.
                    </p>

                    <div className="space-y-4 mb-6">
                        {[
                            { part: "Part I — General Information", instructions: "Enter your name, SSN or ITIN (write 'APPLIED FOR' if you don't have one), and current US address. If you are filing a joint 8843 with a spouse, each person needs their own form." },
                            { part: "Part II — Teachers & Trainees", instructions: "Skip this section entirely. Part II is for J-1 teachers and researchers, not F-1 students." },
                            { part: "Part III — Students", instructions: "This is the key section for F-1 students. Enter your visa type (F-1), the date you entered the US, your university name, and your program of study. List all years you have been present in the US as a student (e.g., 2021, 2022, 2023, 2024, 2025). This establishes your 5-year exemption period." },
                            { part: "Part IV — Professional Athletes", instructions: "Skip this section. It applies to professional athletes only." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.part}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.instructions}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5 mb-6">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Where to Mail Form 8843
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                            If filing Form 8843 <strong>by itself</strong> (no income, no 1040-NR), mail it to:
                        </p>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 text-sm font-mono text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800">
                            Department of the Treasury<br />
                            Internal Revenue Service Center<br />
                            Austin, TX 73301-0215
                        </div>
                        <p className="text-blue-800 dark:text-blue-200 text-sm mt-3">
                            If filing <strong>with</strong> Form 1040-NR, attach Form 8843 to your 1040-NR and mail to the address specified in the 1040-NR instructions for your state.
                        </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Download Form 8843 from <a href="https://www.irs.gov/pub/irs-pdf/f8843.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">IRS.gov (PDF) <ExternalLink className="w-3 h-3 inline" /></a>. Our <Link href="/features/tax-filing" className="text-blue-600 dark:text-blue-400 underline">Tax Filing Assistant</Link> can pre-fill your 8843 based on your OPT timeline.
                    </p>
                </section>

                {/* Section 5 */}
                <section id="form-1040nr" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        5. Form 1040-NR: Filing as a Non-Resident
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Form 1040-NR is the federal income tax return for non-resident aliens. If you are an F-1 student within your first 5 calendar years and you earned any US-source income, this is the form you file — <strong>not</strong> the standard 1040.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">When You Must File 1040-NR</h3>
                    <ul className="space-y-2 mb-6">
                        {[
                            "You earned wages from on-campus employment, CPT, or OPT",
                            "You received a taxable scholarship or fellowship (amount exceeding tuition & required fees)",
                            "You had US-source bank interest income",
                            "You received royalties, rental income, or capital gains from US sources",
                            "You want to claim a refund of over-withheld federal taxes",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Income Types Reported on 1040-NR</h3>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Income Type</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Source Document</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Where on 1040-NR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Wages & salary", "W-2", "Line 1a"],
                                    ["Taxable scholarship/fellowship", "1042-S or university letter", "Line 1a (or Schedule NEC)"],
                                    ["Tax treaty exempt income", "1042-S", "Line 1a with treaty claim on Schedule OI"],
                                    ["Bank interest", "1099-INT", "Schedule NEC (flat 30% or treaty rate)"],
                                    ["Capital gains", "1099-B", "Schedule NEC or Schedule D"],
                                ].map(([type, doc, line], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{type}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{doc}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-600 dark:text-gray-400">{line}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>Deductions:</strong> Non-resident aliens generally <strong>cannot</strong> claim the standard deduction. Exceptions exist for students from India (under the US-India treaty, Article 21). NRAs can claim itemized deductions for state/local taxes paid, charitable contributions to US organizations, and casualty/theft losses.
                        </p>
                    </div>
                </section>

                {/* Section 6 */}
                <section id="fica-exemption" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        6. FICA Tax Exemption: The 5-Year Rule
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        FICA stands for the Federal Insurance Contributions Act and includes two taxes: <strong>Social Security (6.2%)</strong> and <strong>Medicare (1.45%)</strong> — a combined <strong>7.65% of your gross wages</strong>. Under IRC Section 3121(b)(19), F-1 students are exempt from FICA during their first <strong>5 calendar years</strong> in the US.
                    </p>

                    <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500 p-4 rounded-r-xl my-6">
                        <p className="text-teal-900 dark:text-teal-100 font-semibold text-lg">
                            &quot;F-1 students are exempt from FICA taxes for services performed to carry out the purpose of their visa. This exemption saves $3,825 for every $50,000 earned — money that most students never reclaim.&quot;
                        </p>
                        <p className="text-teal-700 dark:text-teal-300 text-sm mt-2">
                            — IRS Publication 519, IRC § 3121(b)(19)
                        </p>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">How the 5-Year Rule Works</h3>
                    <ul className="space-y-2 mb-6">
                        {[
                            "The 5 years are calendar years, not full 365-day periods. Even arriving in December counts as year 1.",
                            "The exemption applies to F-1 students performing services related to their visa purpose (on-campus work, CPT, OPT, STEM OPT).",
                            "Starting in calendar year 6, you must pass the Substantial Presence Test. If you become a resident alien, FICA is owed.",
                            "The exemption also covers F-1 students working on STEM OPT — employers must not withhold FICA for exempt students.",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">How to Get a FICA Refund (Step-by-Step)</h3>
                    <div className="space-y-4 mb-6">
                        {[
                            { step: "1. Check your W-2", detail: "Look at Box 4 (Social Security tax withheld) and Box 6 (Medicare tax withheld). If either is greater than $0, FICA was incorrectly withheld." },
                            { step: "2. Request a refund from your employer", detail: "Contact payroll and ask them to correct the withholding by filing Form 941-X (Adjusted Employer's Quarterly Federal Tax Return). Provide a copy of your I-20 and explain the F-1 exemption." },
                            { step: "3. If employer refuses or cannot help, file Form 843", detail: "Submit IRS Form 843 ('Claim for Refund and Request for Abatement') with: (a) copy of W-2, (b) Form 8316 or written statement, (c) copy of I-20, (d) visa stamp copy, (e) I-94 arrival record, (f) letter explaining you are exempt under IRC § 3121(b)(19)." },
                            { step: "4. Mail Form 843 to the IRS", detail: "Send to the IRS service center where your employer files their 941 (check Form 843 instructions). Processing takes 6–12 weeks. You have up to 3 years from the filing deadline to claim the refund." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.step}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Sample IRS Letter Template
                        </h3>
                        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 font-mono border border-blue-100 dark:border-blue-800 whitespace-pre-line leading-relaxed">
{`To: Internal Revenue Service
Re: Claim for Refund of FICA Taxes — Tax Year 2025

I am an F-1 student at [University Name] and have been
in the United States since [arrival date]. I am within
my first 5 calendar years and am exempt from FICA taxes
under IRC § 3121(b)(19).

My employer, [Employer Name], incorrectly withheld
$[amount] in Social Security tax and $[amount] in
Medicare tax from my wages as shown on the enclosed W-2.

I am requesting a full refund of $[total amount].

Enclosed: W-2, Form 843, I-20, Visa stamp copy, I-94.`}
                        </div>
                    </div>
                </section>

                {/* Section 7 */}
                <section id="tax-treaties" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Globe className="w-8 h-8 text-teal-600" />
                        7. Tax Treaty Benefits by Country
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The US has income tax treaties with over 65 countries, and many include special provisions for students and trainees. These benefits are <strong>not automatic</strong> — you must claim them on your tax return using Schedule OI (Other Information) on Form 1040-NR and, for wages, by submitting Form 8233 to your employer. Check our <Link href="/glossary" className="text-blue-600 dark:text-blue-400 underline">glossary</Link> for treaty-related terms.
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Country</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Treaty Article</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Exemption</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Applies To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["India", "Article 21(d)", "$5,000/year", "Wages, scholarships, fellowships"],
                                    ["China", "Article 20(c)", "$5,000/year", "Wages from employment"],
                                    ["South Korea", "Article 21(1)", "$2,000/year", "Personal services income"],
                                    ["Japan", "Article 20", "Entire scholarship", "Scholarships & fellowships only"],
                                    ["Germany", "Article 20(4)", "$9,000/year", "Employment & self-employment"],
                                    ["France", "Article 21", "$5,000/year", "Personal services"],
                                    ["United Kingdom", "Article 20", "Entire scholarship", "Scholarships & government grants"],
                                    ["Canada", "Article XV", "No student-specific provision", "General employment rules apply"],
                                    ["Mexico", "Article 20", "Entire scholarship", "Government scholarships only"],
                                    ["Brazil", "No treaty", "N/A", "No US-Brazil income tax treaty in force"],
                                    ["Russia", "Article 18", "Entire scholarship", "Scholarships & government grants"],
                                    ["Australia", "Article 20", "Entire scholarship", "Scholarships & fellowships"],
                                    ["Pakistan", "Article XII", "$5,000/year", "Personal services income"],
                                    ["Bangladesh", "Article 21", "$5,000/year", "Personal services"],
                                    ["Philippines", "Article 22", "Entire scholarship", "Scholarships only"],
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

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>Important:</strong> Treaty benefits must be actively claimed on your tax return. Consult <a href="https://www.irs.gov/pub/irs-pdf/p901.pdf" target="_blank" rel="noopener noreferrer" className="underline">IRS Publication 901 <ExternalLink className="w-3 h-3 inline" /></a> for the full list of treaties. Treaty provisions change — always verify current terms. Students from India should note that the US-India treaty also permits claiming the standard deduction on Form 1040-NR.
                        </p>
                    </div>
                </section>

                {/* Section 8 */}
                <section id="state-taxes" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        8. State Tax Filing for F-1 Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        In addition to federal taxes, most US states require you to file a state income tax return if you earned income in that state. State filing rules vary widely — here is what F-1 students need to know.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">States With No Income Tax</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        If you live and work in one of these states, you do not need to file a state income tax return:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {["Texas", "Florida", "Washington", "Nevada", "Wyoming", "Alaska", "South Dakota", "Tennessee", "New Hampshire*"].map((state) => (
                            <span key={state} className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium border border-teal-200 dark:border-teal-800">
                                {state}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                        *New Hampshire and Tennessee only tax investment income (dividends and interest), not wages.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">States With Special Rules for NRAs</h3>
                    <div className="space-y-3 mb-6">
                        {[
                            { state: "California", note: "Requires Form 540NR. CA taxes all income earned in the state. NRA students cannot claim the CA standard deduction." },
                            { state: "New York", note: "Requires Form IT-203 (Non-Resident/Part-Year). NY taxes income earned in the state and allocates based on days present." },
                            { state: "Massachusetts", note: "Requires Form 1-NR/PY. MA taxes all income earned in the state at a flat 5% rate." },
                            { state: "Illinois", note: "Requires Form IL-1040. IL has a flat 4.95% income tax. NRA students file as non-residents." },
                            { state: "Pennsylvania", note: "Requires Form PA-40. PA has a flat 3.07% rate. Relatively straightforward for NRAs." },
                        ].map((item, i) => (
                            <div key={i} className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong className="text-gray-900 dark:text-white">{item.state}:</strong> {item.note}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Sprintax supports state tax returns for 44 states. Check your university's international student office — many provide free state tax filing assistance through VITA programs or Glacier Tax Prep.
                    </p>
                </section>

                {/* Section 9 */}
                <section id="sprintax-vs-turbotax" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        9. Sprintax vs TurboTax: Which Should F-1 Students Use?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        This is one of the most important decisions F-1 students face during tax season. Using the wrong software can result in filing the wrong form entirely. Here is a detailed comparison.
                    </p>

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Feature</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Sprintax</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">TurboTax</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Glacier Tax Prep</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Supports 1040-NR (NRA)", "Yes", "No", "Yes"],
                                    ["Supports 1040 (Resident)", "No", "Yes", "No"],
                                    ["Form 8843 generation", "Yes", "No", "Yes"],
                                    ["Tax treaty benefits", "Auto-detects", "Not applicable", "Auto-detects"],
                                    ["State returns", "44 states ($39.95 extra)", "All states", "Limited"],
                                    ["Federal return cost", "$49.95–$69.95", "$0–$89", "Free (via university)"],
                                    ["E-file available", "Yes (federal)", "Yes", "No (paper only)"],
                                    ["FICA refund guidance", "Yes", "No", "No"],
                                    ["Live chat support", "Yes", "Yes (paid tier)", "No"],
                                    ["Best for", "Non-resident aliens (NRA)", "Resident aliens / US citizens", "Simple NRA returns"],
                                ].map(([feature, sprintax, turbotax, glacier], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{feature}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{sprintax}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{turbotax}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{glacier}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 mb-6">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-900 dark:text-red-100">TurboTax Does NOT Support Non-Resident Alien Filing</h3>
                            <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                                TurboTax, H&R Block, FreeTaxUSA, and Cash App Taxes only generate Form 1040. They do not support Form 1040-NR. If you are a non-resident alien and use TurboTax, you will file the <strong>wrong form</strong> — which can trigger IRS audit notices and create immigration complications.
                            </p>
                        </div>
                    </div>

                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800 p-5">
                        <h3 className="font-bold text-teal-900 dark:text-teal-100 mb-2">Our Recommendation</h3>
                        <p className="text-teal-800 dark:text-teal-200 text-sm">
                            If you are a <strong>non-resident alien</strong> (most F-1 students in their first 5 years): use <strong>Sprintax</strong>. It is purpose-built for NRA tax filing, auto-detects treaty benefits, generates Form 8843, and supports e-filing. If your university offers <strong>Glacier Tax Prep</strong> for free, that is a solid option for simple returns. Use the <Link href="/features/tax-filing" className="underline font-medium">TrackMyOPT Tax Tool</Link> to determine your residency status first.
                        </p>
                    </div>
                </section>

                {/* Section 10 */}
                <section id="common-mistakes" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        10. Common Tax Mistakes F-1 Students Make
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        After helping thousands of international students, these are the most frequent — and most costly — tax filing errors we see. Each mistake includes the real-world consequence and how to fix it.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                mistake: "Filing as a resident alien using TurboTax or H&R Block",
                                impact: "Critical",
                                consequence: "Files Form 1040 instead of 1040-NR. IRS may issue a notice, you may owe back taxes, and your immigration record shows an incorrect filing status.",
                                fix: "Use Sprintax or Glacier Tax Prep. If you already filed incorrectly, file an amended return (Form 1040-X to undo the 1040, then file a correct 1040-NR).",
                            },
                            {
                                mistake: "Forgetting to file Form 8843 (no income, so nothing to file)",
                                impact: "High",
                                consequence: "Creates a gap in your IRS record. Can complicate green card applications, H-1B petitions, and future status changes. USCIS and immigration attorneys may flag this.",
                                fix: "File Form 8843 retroactively for every year you were present in the US. There is no penalty for late filing, but do it as soon as possible.",
                            },
                            {
                                mistake: "Not claiming the FICA tax refund",
                                impact: "Critical",
                                consequence: "You lose 7.65% of your gross wages. On $30,000 of income, that is $2,295 left on the table.",
                                fix: "Check W-2 boxes 4 and 6. If amounts were withheld, request a refund through your employer or file Form 843.",
                            },
                            {
                                mistake: "Claiming the standard deduction as a non-resident alien",
                                impact: "High",
                                consequence: "NRAs cannot claim the standard deduction (with limited treaty exceptions for Indian citizens). The IRS may adjust your return and assess additional tax.",
                                fix: "Only claim itemized deductions or treaty-based deductions. Indian students can claim the standard deduction under Article 21.",
                            },
                            {
                                mistake: "Not reporting taxable scholarship income",
                                impact: "High",
                                consequence: "Scholarship amounts exceeding qualified tuition and required fees are taxable. Unreported income can trigger IRS notices.",
                                fix: "Calculate: Total scholarship minus qualified tuition/fees = taxable portion. Report on 1040-NR.",
                            },
                            {
                                mistake: "Missing tax treaty benefits",
                                impact: "Medium",
                                consequence: "You pay more tax than legally required. For Indian or Chinese students, this could be $5,000+ of unnecessary tax.",
                                fix: "Check if your country has a treaty (see Section 7). Claim benefits on Schedule OI of 1040-NR. Submit Form 8233 to your employer for wage exemptions.",
                            },
                            {
                                mistake: "Forgetting to file state tax returns",
                                impact: "Medium",
                                consequence: "State revenue departments can assess penalties and interest. Some states are more aggressive than others (California, New York).",
                                fix: "If you earned income in a state with income tax, you must file a state return. Sprintax supports 44 states.",
                            },
                            {
                                mistake: "Filing with the wrong SSN/ITIN or not having one",
                                impact: "Medium",
                                consequence: "Returns processed without an SSN/ITIN are delayed. You cannot e-file without one.",
                                fix: "Apply for an ITIN using Form W-7 if you don't have an SSN. You can submit W-7 with your tax return.",
                            },
                            {
                                mistake: "Ignoring the 1042-S from your university",
                                impact: "Medium",
                                consequence: "The 1042-S reports scholarship/fellowship income that was subject to withholding. Not reporting it means you cannot claim the withheld amount as a credit on your return.",
                                fix: "Contact your university's payroll office if you haven't received your 1042-S by mid-March.",
                            },
                            {
                                mistake: "Waiting until the last day to file",
                                impact: "Low",
                                consequence: "Tax software crashes, postal offices are packed, and you may miss errors that need correction. Extensions are free to file.",
                                fix: "Start gathering documents in January. File by mid-March. If you need more time, file Form 4868 for an extension to October 15.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.impact === "Critical" ? "text-red-600" : item.impact === "High" ? "text-red-500" : item.impact === "Medium" ? "text-amber-500" : "text-gray-400"}`} />
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{i + 1}. {item.mistake}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"><strong>Consequence:</strong> {item.consequence}</p>
                                            <p className="text-sm text-teal-700 dark:text-teal-300 mt-2 font-medium">Fix: {item.fix}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${item.impact === "Critical" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : item.impact === "High" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" : item.impact === "Medium" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"}`}>
                                        {item.impact}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 11 */}
                <section id="timeline" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-teal-600" />
                        11. Tax Filing Timeline & Deadlines
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Follow this month-by-month timeline to stay on track for the 2025 tax year (filed in 2026). Missing deadlines can result in penalties, interest charges, and lost refund opportunities.
                    </p>

                    <div className="space-y-4">
                        {[
                            { month: "January 2026", tasks: ["Collect W-2 forms from all employers (due by January 31)", "Gather your passport, visa stamp, I-20, and I-94 record", "Note all US entry/exit dates for 2025", "Check if your university offers free tax prep services"] },
                            { month: "February 2026", tasks: ["Determine your NRA vs RA status using the 5-year rule", "Wait for 1042-S forms (due by March 15)", "Sign up for Sprintax or check for Glacier Tax Prep access through your university", "Review your tax treaty eligibility (see Section 7)"] },
                            { month: "March 2026", tasks: ["1042-S forms should arrive by March 15", "Begin preparing your federal return (1040-NR + 8843)", "Prepare your state return if applicable", "Check W-2 Boxes 4 and 6 for incorrect FICA withholding"] },
                            { month: "April 1–15, 2026", tasks: ["April 15: Federal filing deadline (1040-NR with income)", "April 15: State tax filing deadline (most states)", "If you need more time: File Form 4868 for extension to October 15", "Any taxes owed are still due by April 15 regardless of extension"] },
                            { month: "June 15, 2026", tasks: ["Deadline for filing Form 8843 alone (no income, no 1040-NR)", "Also the automatic extension deadline for NRAs with no wage income"] },
                            { month: "October 15, 2026", tasks: ["Extended filing deadline (if Form 4868 was filed by April 15)", "Last chance to file without late-filing penalties for extension filers"] },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold">{i + 1}</div>
                                    {item.month}
                                </h3>
                                <ul className="space-y-1 ml-9">
                                    {item.tasks.map((task, j) => (
                                        <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                                            {task}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 12 */}
                <section id="free-resources" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        12. Free Tax Resources for International Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        You do not have to navigate the US tax system alone. Here are the best free and low-cost resources available to F-1 students.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {[
                            {
                                title: "IRS Free File & Forms",
                                description: "Download Form 8843, 1040-NR, and all instructions for free directly from the IRS. Publication 519 (US Tax Guide for Aliens) is the authoritative reference.",
                                link: "https://www.irs.gov/forms-instructions",
                                linkText: "IRS.gov Forms",
                            },
                            {
                                title: "University Tax Workshops",
                                description: "Most universities offer free tax filing workshops through their international student office in February–March. Many provide access to Glacier Tax Prep at no cost.",
                                link: null,
                                linkText: "Check your university's ISS office",
                            },
                            {
                                title: "VITA (Volunteer Income Tax Assistance)",
                                description: "Free IRS-certified tax preparation for individuals earning under $67,000/year. Available at many universities and community centers from February through April.",
                                link: "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers",
                                linkText: "Find a VITA site",
                            },
                            {
                                title: "TrackMyOPT Tax Filing Tool",
                                description: "Determines your NRA/RA status, identifies required forms, checks FICA eligibility, and guides you through the filing process — built specifically for F-1 students.",
                                link: null,
                                linkText: null,
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                                {item.link ? (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                        {item.linkText} <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : item.linkText ? (
                                    <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">{item.linkText}</p>
                                ) : (
                                    <Link href="/features/tax-filing" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                        Try Free <ArrowRight className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        For OPT-specific compliance concerns that intersect with tax filing (like the <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 underline">90-day unemployment rule</Link> or <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 underline">what happens when OPT expires</Link>), explore our full blog library.
                    </p>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Do F-1 students pay taxes in the US?",
                                a: "Yes. All F-1 students who earn US-source income must pay federal income tax (and usually state income tax). Even students with zero income must file Form 8843. Non-resident aliens file Form 1040-NR instead of the standard 1040.",
                            },
                            {
                                q: "What happens if I don't file Form 8843?",
                                a: "There is no immediate IRS penalty for not filing Form 8843. However, failing to file can create complications for future visa applications, green card petitions (I-485), H-1B transfers, and USCIS status changes. Immigration attorneys strongly recommend filing it every year.",
                            },
                            {
                                q: "Can F-1 students use TurboTax to file taxes?",
                                a: "No — not if you are a non-resident alien (most F-1 students in their first 5 years). TurboTax only generates Form 1040, not Form 1040-NR. Using TurboTax as an NRA means filing the wrong form. Use Sprintax or Glacier Tax Prep instead.",
                            },
                            {
                                q: "How do I know if I am a resident or non-resident alien?",
                                a: "F-1 students are classified as 'exempt individuals' for their first 5 calendar years in the US. During this period, you are a non-resident alien (NRA) for tax purposes. After 5 calendar years, you take the Substantial Presence Test to determine your status.",
                            },
                            {
                                q: "What is the FICA tax exemption and how much can I save?",
                                a: "FICA includes Social Security (6.2%) and Medicare (1.45%) — combined 7.65% of wages. F-1 students are exempt during their first 5 calendar years under IRC § 3121(b)(19). On $50,000 of annual wages, this saves $3,825. If FICA was incorrectly withheld, you can claim a refund.",
                            },
                            {
                                q: "When is the tax filing deadline for F-1 students?",
                                a: "For the 2025 tax year: April 15, 2026 if you have US-source income. June 15, 2026 if only filing Form 8843 with no income. You can request an extension to October 15, 2026 using Form 4868, but any taxes owed are still due by April 15.",
                            },
                            {
                                q: "Do I need to file state taxes as an F-1 student?",
                                a: "If you earned income in a state with income tax, yes. States like Texas, Florida, Washington, Nevada, and several others have no income tax. For states that do, you'll need to file a non-resident state return. Sprintax supports 44 states.",
                            },
                            {
                                q: "What is a tax treaty and do I qualify?",
                                a: "A tax treaty is an agreement between the US and another country that can reduce or eliminate tax on certain types of income. Many treaties include student-specific provisions. For example, Indian students can exempt $5,000 of income under Article 21(d), and Chinese students can exempt $5,000 under Article 20(c).",
                            },
                            {
                                q: "Can I get a refund if my employer withheld FICA taxes?",
                                a: "Yes. First, ask your employer's payroll department to correct the error and refund the FICA taxes. If they cannot or will not, file IRS Form 843 with copies of your W-2, I-20, visa stamp, and a letter explaining your F-1 exempt status. Processing takes 6-12 weeks.",
                            },
                            {
                                q: "What is the difference between Form 1040 and Form 1040-NR?",
                                a: "Form 1040 is for US citizens and resident aliens — it taxes worldwide income and allows the standard deduction, education credits, and all filing statuses. Form 1040-NR is for non-resident aliens — it taxes only US-source income, generally does not allow the standard deduction, and limits filing status to Single or Married NRA.",
                            },
                        ].map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800" itemScope itemType="https://schema.org/Question">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2" itemProp="name">{faq.q}</h3>
                                <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed" itemProp="text">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides & Resources</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/f1-student-tax-filing-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Tax Filing Quick-Start Guide (Blog)</Link>
                    <Link href="/blog/what-happens-if-opt-expires" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ What Happens If Your OPT Expires?</Link>
                    <Link href="/blog/90-day-unemployment-rule-opt" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ The 90-Day Unemployment Rule Explained</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                    <Link href="/blog/stem-opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ STEM OPT Extension Guide</Link>
                    <Link href="/blog/opt-health-insurance-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Health Insurance for OPT Students</Link>
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
                <h2 className="text-2xl font-bold mb-3">Stop Guessing — File Your F-1 Taxes Correctly</h2>
                <p className="text-teal-100 mb-6 max-w-lg mx-auto">
                    TrackMyOPT's Tax Filing Tool determines your residency status, identifies every form you need, checks FICA eligibility, and walks you through the entire process — built by former F-1 students who have been through it.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/features/tax-filing" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors">
                        Try Tax Filing Tool Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/dashboard/tax-filing" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">
                        Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* JSON-LD FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            { "@type": "Question", "name": "Do F-1 students pay taxes in the US?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. All F-1 students who earn US-source income must pay federal income tax and usually state income tax. Even students with zero income must file Form 8843. Non-resident aliens file Form 1040-NR." } },
                            { "@type": "Question", "name": "What happens if I don't file Form 8843?", "acceptedAnswer": { "@type": "Answer", "text": "There is no immediate IRS penalty, but failing to file can create complications for future visa applications, green card petitions (I-485), H-1B transfers, and USCIS status changes." } },
                            { "@type": "Question", "name": "Can F-1 students use TurboTax to file taxes?", "acceptedAnswer": { "@type": "Answer", "text": "No, not if you are a non-resident alien. TurboTax only generates Form 1040, not Form 1040-NR. Use Sprintax or Glacier Tax Prep instead." } },
                            { "@type": "Question", "name": "How do I know if I am a resident or non-resident alien?", "acceptedAnswer": { "@type": "Answer", "text": "F-1 students are exempt individuals for their first 5 calendar years and classified as non-resident aliens. After 5 years, take the Substantial Presence Test." } },
                            { "@type": "Question", "name": "What is the FICA tax exemption and how much can I save?", "acceptedAnswer": { "@type": "Answer", "text": "FICA includes Social Security (6.2%) and Medicare (1.45%) — combined 7.65%. F-1 students are exempt during their first 5 calendar years, saving $3,825 per $50,000 earned." } },
                            { "@type": "Question", "name": "When is the tax filing deadline for F-1 students?", "acceptedAnswer": { "@type": "Answer", "text": "April 15, 2026 for those with income. June 15, 2026 if only filing Form 8843. Extensions available to October 15 via Form 4868." } },
                            { "@type": "Question", "name": "Do I need to file state taxes as an F-1 student?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, if you earned income in a state with income tax. States like Texas, Florida, and Washington have no income tax. Sprintax supports 44 states." } },
                            { "@type": "Question", "name": "What is a tax treaty and do I qualify?", "acceptedAnswer": { "@type": "Answer", "text": "A tax treaty can reduce or eliminate tax on certain income. Indian students can exempt $5,000 under Article 21(d) and Chinese students $5,000 under Article 20(c)." } },
                            { "@type": "Question", "name": "Can I get a refund if my employer withheld FICA taxes?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Ask your employer first. If they cannot help, file IRS Form 843 with your W-2, I-20, visa stamp copy, and explanation letter. Processing takes 6-12 weeks." } },
                            { "@type": "Question", "name": "What is the difference between Form 1040 and Form 1040-NR?", "acceptedAnswer": { "@type": "Answer", "text": "Form 1040 is for US citizens and resident aliens (worldwide income, standard deduction). Form 1040-NR is for non-resident aliens (US-source income only, no standard deduction)." } },
                        ],
                    }),
                }}
            />

            {/* Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": "The Ultimate F-1 Student Tax Guide 2026",
                        "description": "The most comprehensive F-1 student tax guide covering Form 8843, 1040-NR, FICA exemption, tax treaties, state taxes, Sprintax vs TurboTax, and step-by-step filing instructions.",
                        "author": { "@type": "Organization", "name": "TrackMyOPT", "url": "https://www.trackmyopt.com" },
                        "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } },
                        "datePublished": "2026-03-12",
                        "dateModified": "2026-03-12",
                        "mainEntityOfPage": "https://www.trackmyopt.com/guides/f1-tax-filing",
                        "about": [
                            { "@type": "Thing", "name": "F-1 Student Visa" },
                            { "@type": "Thing", "name": "US Tax Filing" },
                            { "@type": "Thing", "name": "Non-Resident Alien Taxes" },
                            { "@type": "Thing", "name": "FICA Tax Exemption" },
                        ],
                    }),
                }}
            />
        </article>
    );
}
