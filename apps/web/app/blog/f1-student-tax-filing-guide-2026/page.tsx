import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, BookOpen, ExternalLink, DollarSign } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step",
    description: "Complete guide to F-1 student tax filing in 2026. Learn which forms to file (Form 8843, 1040-NR), FICA exemptions, tax treaty benefits, and step-by-step filing instructions.",
    keywords: ["F-1 student tax filing", "international student taxes", "form 8843", "1040-NR", "FICA exemption", "tax treaty benefits", "nonresident alien taxes"],
    openGraph: {
        title: "F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step | TrackMyOPT",
        description: "Complete guide to F-1 tax filing with step-by-step instructions, form requirements, and deadline information.",
        url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide-2026",
        type: "article",
        images: [
            {
                url: "https://www.trackmyopt.com/og-image.png",
                width: 1200,
                height: 630,
                alt: "F-1 Student Tax Filing Guide 2026: Forms, Deadlines & Step-by-Step",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide-2026",
    },
};

export default function F1TaxFilingArticle() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BreadcrumbSchema items={[
                { name: "Home", url: "https://www.trackmyopt.com" },
                { name: "Blog", url: "https://www.trackmyopt.com/blog" },
                { name: "F-1 Student Tax Filing Guide 2026", url: "https://www.trackmyopt.com/blog/f1-student-tax-filing-guide-2026" },
            ]} />
            <BlogPostSchema title={metadata.title} description={metadata.description} publishedDate="2026-05-19" modifiedDate="2026-05-19" author="Vinay Kumar" faqItems={[
                { question: "Do F-1 students have to pay taxes?", answer: "F-1 students on OPT are required to pay federal income taxes on wages earned in the US, FICA taxes (Social Security & Medicare), and state taxes if applicable. You are considered a nonresident alien for tax purposes in your first 5 years." },
                { question: "What form does an F-1 student file?", answer: "F-1 students typically file Form 1040-NR (Nonresident Alien Income Tax Return) instead of Form 1040. You must also file Form 8843 to claim the Substantial Presence Test exception or to report if you were exempt from taxation." },
                { question: "What is Form 8843 used for?", answer: "Form 8843 is filed by nonresident aliens to claim exemption from the Substantial Presence Test or to report that they were exempt from US income tax. It must be filed even if you have no US income." },
                { question: "Can F-1 students claim FICA exemptions?", answer: "Yes, F-1 students can be exempt from Social Security and Medicare taxes (FICA) if they are on valid F-1 status. You must provide a copy of your valid I-94 to your employer when hired to claim this exemption." },
                { question: "What is the tax deadline for international students?", answer: "The tax filing deadline for F-1 students is April 15, 2027 for the 2026 tax year. If you cannot file by this date, you can file Form 4868 to request a 6-month automatic extension." },
                { question: "Do I need to file if I didn't work?", answer: "If you received no US income during the year, you typically do not need to file a federal tax return. However, you may still need to file Form 8843 to claim Substantial Presence Test exemption." },
                { question: "What is the Substantial Presence Test?", answer: "The Substantial Presence Test determines your tax residency. If you fail this test, you must file Form 1040-NR. F-1 students are generally exempt from this test for the first 5 years, but must file Form 8843 to claim the exemption." },
                { question: "Should I file a state tax return?", answer: "This depends on your state of residence and income. Generally, if you earned income in a state, you should file that state's tax return even if you're not a US citizen. Rules vary by state, so check your specific state's requirements." },
            ]} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">F-1 Tax Filing</span>
            </nav>

            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                        TAX & FINANCE
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
                    Master F-1 tax filing with complete instructions on forms, deadlines, FICA exemptions, and tax-saving strategies for international students earning US income.
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Published: May 18, 2026</span>
                    <span>•</span>
                    <span>Updated by TrackMyOPT Tax Team</span>
                </div>
            </header>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span>Last Updated: February 2026</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Quick Answer</p>
                <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                    F-1 students must file taxes in the US even if they had no income — at minimum Form 8843 is required. Most F-1 students file as nonresident aliens using Form 1040-NR and are exempt from FICA taxes during their first 5 calendar years.
                </p>
            </div>

            {/* Key Takeaway Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Key Takeaway
                </h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    F-1 students earning US income file <strong>Form 1040-NR</strong> (not Form 1040) and must file <strong>Form 8843</strong> by April 15, 2027. You must claim your FICA exemption with your employer using a valid I-94. Take advantage of tax treaty benefits to reduce your tax burden.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Source: <a href="https://www.irs.gov/individuals/international-individuals/nonresident-aliens" target="_blank" rel="noopener noreferrer" className="underline">IRS.gov</a>, Publication 519
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Guide</h2>
                <nav className="space-y-2">
                    {[
                        ["#do-f1-pay", "Do F-1 Students Pay US Taxes?"],
                        ["#tax-status", "F-1 Resident vs. Nonresident Alien for Tax Purposes"],
                        ["#forms-needed", "What Forms Do F-1s File?"],
                        ["#fica-exemption", "Understanding FICA Exemption for F-1 Students"],
                        ["#tax-treaty", "Tax Treaty Benefits for International Students"],
                        ["#step-by-step", "Step-by-Step Filing Instructions"],
                        ["#deadlines", "Key Tax Deadlines for 2026"],
                        ["#common-mistakes", "Common Tax Filing Mistakes to Avoid"],
                    ].map(([href, text]) => (
                        <a key={href} href={href} className="block text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            → {text}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                <section id="do-f1-pay" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Do F-1 Students Pay US Taxes?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        <strong>Yes, F-1 students on OPT are required to pay federal and state income taxes</strong> on any wages earned in the United States. This applies regardless of whether you're a US citizen or permanent resident.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        As a nonresident alien for tax purposes (during your first 5 years in the US), you file a different tax form than US citizens and may qualify for specific exemptions and tax treaty benefits.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl my-6">
                        <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg">
                            "F-1 students earning US wages must file federal income tax returns and report all compensation earned on OPT, even if the employer is a sponsoring company."
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                            — IRS Publication 519: US Tax Guide for Aliens
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">What Taxes Must You Pay?</h3>
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Federal Income Tax</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Withheld from your paycheck based on your W-4 form. File Form 1040-NR by April 15, 2027.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">FICA Taxes (Social Security & Medicare)</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">F-1 students may be exempt if they provide proper documentation (I-94 copy) to their employer. Self-employed F-1 students must pay self-employment tax.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">State Income Tax</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Varies by state. Most states tax nonresident aliens on income earned within the state. Check your specific state requirements.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="tax-status" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        F-1 Resident vs. Nonresident Alien for Tax Purposes
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        For tax purposes, your status is NOT based on your visa or immigration status. The IRS uses the <strong>Substantial Presence Test</strong> to determine if you're a resident or nonresident alien.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm mt-4">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Criteria</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Resident Alien</th>
                                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">Nonresident Alien</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Tax Form</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Form 1040</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Form 1040-NR</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">SPT Exemption</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Not available</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">F-1 exempt for first 5 years</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">Deductions</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">All allowed deductions</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Only US-source income deductions</td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">State Filing</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Generally required</td>
                                    <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">Only if earned income in state</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                        Most F-1 students qualify as <strong>nonresident aliens for tax purposes</strong> and file Form 1040-NR throughout their OPT period. However, F-1 students are exempt from the Substantial Presence Test for their first 5 years in the US.
                    </p>
                </section>

                <section id="forms-needed" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        What Forms Do F-1s File?
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        F-1 students file several forms to properly report income and claim exemptions. Here's what you need:
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Form 1040-NR (Nonresident Alien Income Tax Return)</h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                                This is the main tax return for nonresident aliens. You report all US-source income (wages, interest, dividends) and claim any applicable deductions or exemptions.
                            </p>
                            <p className="text-blue-700 dark:text-blue-300 text-sm"><strong>Due:</strong> April 15, 2027 | <strong>Extension available:</strong> Form 4868</p>
                        </div>

                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">Form 8843 (Statement for Individuals Exempt From Withholding)</h3>
                            <p className="text-green-800 dark:text-green-200 text-sm mb-3">
                                Filed by nonresident aliens to claim exemption from the Substantial Presence Test or to report being exempt. F-1 students must file this even if they have no taxable income.
                            </p>
                            <p className="text-green-700 dark:text-green-300 text-sm"><strong>Due:</strong> April 15, 2027 (same deadline as 1040-NR)</p>
                        </div>

                        <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">W-2 or 1099 Forms (From Your Employer)</h3>
                            <p className="text-purple-800 dark:text-purple-200 text-sm mb-3">
                                Your employer sends W-2 (if you're an employee) or 1099 (if contract/self-employed) by January 31, 2027. Use this to complete your 1040-NR.
                            </p>
                            <p className="text-purple-700 dark:text-purple-300 text-sm"><strong>Received:</strong> January 31, 2027</p>
                        </div>

                        <div className="p-5 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                            <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2">State Tax Return (if applicable)</h3>
                            <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                                If you earned income in a state, file that state's nonresident income tax return. Deadlines typically match federal (April 15) but verify with your state.
                            </p>
                            <p className="text-orange-700 dark:text-orange-300 text-sm"><strong>Due:</strong> Varies by state (usually April 15, 2027)</p>
                        </div>
                    </div>
                </section>

                <section id="fica-exemption" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Understanding FICA Exemption for F-1 Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        F-1 students are typically exempt from FICA taxes (Social Security and Medicare) if they maintain valid F-1 status. However, you must notify your employer of this exemption.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">How to Claim FICA Exemption</h3>
                    <div className="space-y-3">
                        {[
                            { step: "Request the exemption form from your employer's HR department when hired.", detail: "Most employers use Form I-94 photocopy or state this on I-9 completion." },
                            { step: "Provide a valid, unexpired I-94 showing F-1 status.", detail: "Digital I-94 from CBP website acceptable. Passport stamp also works." },
                            { step: "Employer reports exemption to Social Security Administration.", detail: "They'll add 'F' code to your record indicating FICA exemption." },
                            { step: "Your paycheck shows $0 FICA withholding.", detail: "You'll only see federal income tax, not Social Security (6.2%) or Medicare (1.45%)." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.step}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-red-800 dark:text-red-200 text-sm">
                            <strong>⚠️ Important:</strong> If you're self-employed or have 1099 income, you must pay self-employment tax (15.3%) even as an F-1 student. This exemption only applies to W-2 employment.
                        </p>
                    </div>
                </section>

                <section id="tax-treaty" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Tax Treaty Benefits for International Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Many countries have tax treaties with the United States that provide special benefits to students. If your country has a treaty with the US, you may be able to reduce your tax liability.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Common Tax Treaty Benefits</h3>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex gap-2"><span>✓</span> <span>Waived or reduced FICA taxes on certain scholarships</span></li>
                            <li className="flex gap-2"><span>✓</span> <span>Exemption from income tax on stipends/scholarships (Article 20)</span></li>
                            <li className="flex gap-2"><span>✓</span> <span>Reduced tax rates on student wages</span></li>
                            <li className="flex gap-2"><span>✓</span> <span>Income exclusion for certain types of support</span></li>
                        </ul>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        To claim tax treaty benefits, you typically file <strong>Form W-8BEN</strong> with your employer. Check the <a href="https://www.irs.gov/individuals/international-individuals/tax-treaties" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">IRS Treaty section</a> to see if your country has a treaty with the US.
                    </p>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-900 dark:text-amber-100 font-medium text-sm">
                            Not all countries have treaties, and treaty benefits vary widely. Consult a tax professional familiar with your country's tax treaty to maximize your benefits.
                        </p>
                    </div>
                </section>

                <section id="step-by-step" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Step-by-Step Filing Instructions
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Here's how to file your taxes as an F-1 student on OPT:
                    </p>

                    <div className="space-y-4">
                        {[
                            { title: "Step 1: Gather Your Documents", items: ["W-2 from employer(s) (arrives by January 31)", "Any 1099 forms if self-employed or contracted", "Proof of FICA exemption claim (if applicable)", "Social Security Number or ITIN", "Documentation of travel dates outside US (if applicable)"] },
                            { title: "Step 2: Determine Your Filing Status", items: ["Most F-1s file as 'Single' (or appropriate status)", "Check if claimed as dependent on parents' return (affects your deductions)", "F-1 exemption claim requires Form 8843 filing"] },
                            { title: "Step 3: Complete Form 1040-NR", items: ["Report all W-2 and 1099 income", "Claim only US-source income deductions", "Do NOT claim standard deduction if claiming SPT exemption", "Include all pages and schedules (Schedules NEC, etc)"] },
                            { title: "Step 4: Complete Form 8843", items: ["List your days in the US during tax year", "Claim exemption status (must check F-1 box if applicable)", "Include your visa status and SEVIS number"] },
                            { title: "Step 5: Calculate State Taxes (if applicable)", items: ["Check if your state requires nonresident filing", "Calculate income tax based on state's nonresident rules", "File state return by April 15, 2027"] },
                            { title: "Step 6: File Your Return", items: ["File electronically via IRS e-file (required for most filers)", "Use tax software (TurboTax, H&R Block, etc) or hire a tax professional", "Keep copies of everything for 3 years", "File before April 15, 2027 deadline"] },
                        ].map((section, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.items.map((item, j) => (
                                        <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="deadlines" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Key Tax Deadlines for 2026
                    </h2>

                    <div className="space-y-3">
                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">April 15, 2027 — Federal Tax Filing Deadline</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">File Form 1040-NR and Form 8843 with IRS</p>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">April 15, 2027 — State Tax Deadline (varies)</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Most states follow federal deadline but verify your state</p>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">April 15, 2027 — Filing Extension Deadline</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">File Form 4868 to request automatic 6-month extension (by April 15)</p>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">January 31, 2027 — W-2/1099 Receipt Deadline</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Employers must provide W-2/1099 statements by this date</p>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">October 15, 2027 — Extended Filing Deadline</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Final deadline if extended with Form 4868</p>
                        </div>
                    </div>
                </section>

                <section id="common-mistakes" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Common Tax Filing Mistakes to Avoid
                    </h2>
                    <div className="space-y-4">
                        {[
                            { mistake: "Filing Form 1040 instead of 1040-NR", solution: "Nonresident aliens must file 1040-NR. Form 1040 is for US citizens and residents only." },
                            { mistake: "Not filing Form 8843", solution: "All F-1 students must file Form 8843 to claim SPT exemption, even if no income." },
                            { mistake: "Forgetting to claim FICA exemption", solution: "Give your employer proof of F-1 status to avoid unnecessary FICA withholding ($1,400+ per year)." },
                            { mistake: "Claiming unrelated deductions", solution: "Nonresident aliens can only deduct US-source income deductions. No personal exemptions or standard deduction." },
                            { mistake: "Missing state tax filing", solution: "If you earned income in a state, file that state's nonresident return even if federal liability is zero." },
                            { mistake: "Not reporting days outside the US", solution: "Form 8843 requires detailed information about your time in and outside the US. Keep records of trips." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                                <h3 className="font-semibold text-red-900 dark:text-red-100">{item.mistake}</h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-2">💡 {item.solution}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Schema Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { question: "Do F-1 students have to pay taxes?", answer: "Yes, F-1 students on OPT must pay federal income taxes on wages earned in the US, FICA taxes (if not exempt), and state taxes if applicable. You are considered a nonresident alien for tax purposes in your first 5 years." },
                            { question: "What form does an F-1 student file?", answer: "F-1 students file Form 1040-NR (Nonresident Alien Income Tax Return) instead of Form 1040. You must also file Form 8843 to claim Substantial Presence Test exemption even if you have no taxable income." },
                            { question: "What is Form 8843 used for?", answer: "Form 8843 is filed by nonresident aliens to claim exemption from the Substantial Presence Test or to report that they were exempt from US income tax requirements during the tax year." },
                            { question: "Can F-1 students claim FICA exemptions?", answer: "Yes, F-1 students on valid F-1 status are exempt from Social Security and Medicare taxes (FICA) for W-2 employment. You must provide a copy of your valid I-94 to your employer to claim this exemption." },
                            { question: "What is the tax deadline for international students?", answer: "The federal tax filing deadline for F-1 students is April 15, 2027 for the 2026 tax year. You can request a 6-month extension by filing Form 4868, making the extended deadline October 15, 2027." },
                            { question: "Do I need to file if I didn't work?", answer: "If you received no US income, you typically don't need to file a federal income tax return. However, you should still file Form 8843 to claim your Substantial Presence Test exemption and report your status." },
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
                    <Link href="/blog/opt-extension-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Complete OPT Extension Guide 2026</Link>
                    <Link href="/blog/opt-application-checklist-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT Application Checklist 2026</Link>
                    <Link href="/blog/opt-ead-card-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT EAD Card Guide 2026</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/guides/f1-tax-filing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">F-1 Tax Resources →</Link>
                    <Link href="/features/case-status" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">USCIS Case Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA Box */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Calculate Your Tax Obligation Free</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                    Use TrackMyOPT's Tax Calculator to estimate your federal, state, and FICA obligations based on your specific situation.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                    Calculate Your Tax Obligation <ArrowRight className="w-4 h-4" />
                </Link>
            </div>


        </article>
    );
}
