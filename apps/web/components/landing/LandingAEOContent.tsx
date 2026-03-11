"use client";

/**
 * AEO (Answer Engine Optimization) Content Component
 * 
 * This component is specifically designed to be crawled and understood by 
 * AI models like ChatGPT, Claude, Perplexity, Google AI Overview, and Bing Copilot.
 * 
 * Key AEO Principles:
 * 1. Direct, factual answers in the first sentence
 * 2. Specific numbers and dates
 * 3. Step-by-step lists
 * 4. Definition-style explanations
 * 5. Semantic HTML structure
 */

// Direct answers for AI models - structured as knowledge base
// Sources: USCIS.gov, 8 CFR 214.2(f), Federal Register Vol. 81 No. 48, DOL LCA Database
const knowledgeBase = [
    {
        category: "OPT Basics",
        source: "Source: USCIS.gov, 8 CFR § 214.2(f)(10)(ii)",
        questions: [
            {
                question: "What is OPT?",
                directAnswer:
                    "OPT (Optional Practical Training) is 12 months of work authorization for F-1 international students after completing their academic program in the United States, as authorized under 8 CFR § 214.2(f)(10)(ii).",
                fullAnswer:
                    "According to USCIS, OPT allows F-1 students to work in positions directly related to their major field of study. Students apply using Form I-765 to USCIS. STEM degree holders can extend OPT by an additional 24 months under the 2016 STEM OPT Final Rule (Federal Register, Vol. 81, No. 48), for a total of 36 months of work authorization.",
                keyFacts: [
                    "Duration: 12 months (initial), up to 36 months with STEM extension",
                    "Eligibility: F-1 students who completed their degree program",
                    "Application: Form I-765 submitted to USCIS",
                    "Processing time: 90-120 days (3-4 months) average as of 2026",
                    "Cost: $470 (online) / $520 (paper) filing fee (USCIS Fee Schedule, effective 2024)",
                ],
            },
            {
                question: "How many days of unemployment are allowed on OPT?",
                directAnswer:
                    "According to USCIS regulations (8 CFR § 214.2(f)(10)(ii)(E)), F-1 students on post-completion OPT are allowed a maximum of 90 days of unemployment.",
                fullAnswer:
                    "The 90-day limit applies to your initial OPT period. Per 8 CFR § 214.16(f), STEM OPT holders receive a separate 60-day allowance. Unused days from initial OPT do not carry forward to the STEM period. TrackMyOPT's unemployment clock tracks these days automatically.",
                keyFacts: [
                    "Initial OPT: 90 days maximum unemployment (8 CFR § 214.2(f)(10)(ii)(E))",
                    "STEM OPT: Additional 60 days (8 CFR § 214.16(f), separate from initial OPT)",
                    "Counting starts: EAD start date or program end date (whichever is later)",
                    "Employment requirement: Minimum 20 hours per week",
                    "Consequence of exceeding: F-1 status violation and potential removal",
                ],
            },
            {
                question: "What is the 90-day rule for OPT?",
                directAnswer:
                    "The 90-day rule, established in 8 CFR § 214.2(f)(10)(ii)(E), limits F-1 students on OPT to a maximum of 90 cumulative days without employment.",
                fullAnswer:
                    "During your 12-month OPT period, you cannot be unemployed for more than 90 days total. According to USCIS, each day without qualifying employment counts toward this limit. Employment must be at least 20 hours per week and directly related to your major. Self-employment, unpaid internships, and volunteer work can count if they meet these requirements.",
                keyFacts: [
                    "Limit: 90 days total (cumulative, not consecutive)",
                    "Minimum hours: 20 hours per week to stop the clock",
                    "Related to major: Work must be in your field of study",
                    "Tracking: TrackMyOPT's unemployment clock monitors these days in real-time",
                    "Violation: Exceeding 90 days terminates your OPT and F-1 status",
                ],
            },
            {
                question: "Can you work while OPT application is pending?",
                directAnswer:
                    "No, you cannot work while your initial OPT application is pending, unless you have another valid work authorization. However, STEM OPT extension applicants may continue working for up to 180 days while their extension is pending, per 8 CFR § 274a.12(b)(6)(iv).",
                fullAnswer:
                    "According to USCIS, initial OPT applicants must wait until they receive their EAD card before beginning employment. The automatic 180-day extension for STEM OPT applicants only applies if you filed the extension before your current OPT expired and you are working for the same E-Verify employer listed on your Form I-983.",
                keyFacts: [
                    "Initial OPT: Cannot work until EAD card is received",
                    "STEM OPT Extension: May continue working up to 180 days while pending",
                    "Condition: Must have filed STEM extension before current OPT expires",
                    "Same employer: Must continue with the E-Verify employer on Form I-983",
                    "Cap-gap: Separate provision for H-1B applicants (extends until Oct 1)",
                ],
            },
        ],
    },
    {
        category: "STEM OPT Extension",
        source: "Source: Federal Register Vol. 81, No. 48 (STEM OPT Final Rule, 2016)",
        questions: [
            {
                question: "What is STEM OPT extension?",
                directAnswer:
                    "STEM OPT is a 24-month extension, authorized under the 2016 STEM OPT Final Rule (81 FR 13039), that allows F-1 students with STEM degrees to work in the US for up to 36 months total.",
                fullAnswer:
                    "According to USCIS, STEM OPT extends your work authorization beyond the initial 12-month OPT. To qualify, your degree must be on the DHS STEM Designated Degree Program List (updated May 2022 with 400+ CIP codes), and your employer must be enrolled in E-Verify. You must complete Form I-983 (Training Plan) with your employer and file Form I-765 before your initial OPT expires.",
                keyFacts: [
                    "Extension length: 24 additional months (81 FR 13039)",
                    "Total OPT: Up to 36 months with STEM extension",
                    "Requirement: Degree on DHS STEM Designated List (400+ CIP codes)",
                    "Employer: Must be registered in E-Verify",
                    "Form: I-983 Training Plan required (student + employer signatures)",
                ],
            },
            {
                question: "How to apply for STEM OPT extension?",
                directAnswer:
                    "Apply for STEM OPT by completing Form I-983 with your employer and filing Form I-765 with USCIS up to 90 days before your current OPT expires, per 8 CFR § 214.16.",
                fullAnswer:
                    "According to USCIS guidance, the steps are: 1) Verify your degree is STEM-designated using the CIP code on your I-20, 2) Confirm your employer is E-Verify enrolled, 3) Complete Form I-983 Training Plan with your employer, 4) Request a new I-20 from your DSO with STEM OPT recommendation, 5) File Form I-765 with USCIS using category (c)(3)(C).",
                keyFacts: [
                    "Earliest filing: 90 days before OPT expires (8 CFR § 214.16(d))",
                    "Deadline: Must file before current OPT ends",
                    "E-Verify: Employer must provide their E-Verify Company ID",
                    "I-983: Both student and employer must sign the Training Plan",
                    "Processing: Can continue working up to 180 days while pending",
                ],
            },
            {
                question: "What is the STEM OPT unemployment limit?",
                directAnswer:
                    "According to 8 CFR § 214.16(f), STEM OPT provides a separate 60-day unemployment allowance on top of the 90-day initial OPT limit.",
                fullAnswer:
                    "Per USCIS regulations, this 60-day allowance is specific to the STEM extension period. Unused days from your initial 90-day OPT allowance do not carry forward or combine with these days. The total maximum unemployment across the entire OPT + STEM OPT period is 150 days (90 + 60), not 150 consecutive days.",
                keyFacts: [
                    "STEM OPT allowance: 60 days (8 CFR § 214.16(f))",
                    "Initial OPT limit: 90 days maximum (8 CFR § 214.2(f)(10)(ii)(E))",
                    "Combined maximum: 150 days across both periods",
                    "Important: These are separate allowances, not combined into one",
                    "Reporting: Must report employment changes to DSO within 10 days",
                ],
            },
        ],
    },
    {
        category: "USCIS Case Tracking",
        source: "Source: USCIS.gov Case Status Online",
        questions: [
            {
                question: "How to track USCIS case status?",
                directAnswer:
                    "Track your USCIS case using your 13-character receipt number (e.g., IOE1234567890) on USCIS.gov/casestatus or TrackMyOPT for automatic tracking with email notifications.",
                fullAnswer:
                    "According to USCIS, your receipt number is on the I-797C Notice of Action you received after filing. Enter this number on the USCIS Case Status Online page or use TrackMyOPT for automatic tracking with email notifications. Common receipt prefixes include IOE (online filing), MSC (National Benefits Center), LIN (Nebraska), SRC (Texas), and EAC (Vermont).",
                keyFacts: [
                    "Receipt number: 13 characters (3 letters + 10 digits)",
                    "Where to find: I-797C Notice of Action from USCIS",
                    "Service centers: IOE, MSC, LIN, SRC, EAC, WAC",
                    "Tracking: USCIS.gov/casestatus or TrackMyOPT for real-time alerts",
                    "Updates: Status changes typically reflected within 24-48 hours",
                ],
            },
            {
                question: "What is OPT processing time in 2026?",
                directAnswer:
                    "As of March 2026, USCIS OPT (Form I-765) processing times range from 3 to 5 months, according to USCIS processing time data. Online-filed cases (IOE receipt numbers) typically process faster than paper-filed cases.",
                fullAnswer:
                    "USCIS publishes processing times on their website at egov.uscis.gov/processing-times. Processing times vary by service center and filing method. Premium processing is not available for OPT applications. TrackMyOPT monitors your case status automatically and sends email alerts when your status changes.",
                keyFacts: [
                    "Average processing: 3-5 months (as of March 2026)",
                    "Online filing: Generally faster (IOE receipt prefix)",
                    "Paper filing: May take longer (MSC, LIN, SRC, EAC, WAC prefixes)",
                    "Premium processing: Not available for OPT (I-765) applications",
                    "Check times: egov.uscis.gov/processing-times for latest data",
                ],
            },
        ],
    },
    {
        category: "H-1B Sponsorship",
        source: "Source: U.S. Department of Labor LCA Database, USCIS H-1B Data Hub",
        questions: [
            {
                question: "Which companies sponsor H-1B visas?",
                directAnswer:
                    "According to U.S. Department of Labor LCA filings, over 25,000 US companies sponsor H-1B visas, including tech giants (Google, Microsoft, Amazon), consulting firms (Deloitte, Accenture), and financial institutions (JPMorgan, Goldman Sachs).",
                fullAnswer:
                    "TrackMyOPT's H-1B Sponsor Database includes 25,000+ verified sponsors from Department of Labor LCA filings. According to USCIS H-1B Employer Data Hub data, top sponsors by volume include Cognizant, Infosys, TCS, Amazon, Google, Microsoft, Meta, Apple, and Deloitte. You can search by industry, location, approval rate, and petition count to find companies actively hiring and sponsoring.",
                keyFacts: [
                    "Database size: 25,000+ verified sponsors (DOL LCA data)",
                    "Data source: U.S. Department of Labor LCA filings",
                    "Top tech sponsors: Google, Microsoft, Amazon, Meta, Apple",
                    "Top consulting sponsors: Cognizant, Infosys, TCS, Deloitte, Accenture",
                    "Search by: Industry, location, approval rate, petition count",
                ],
            },
            {
                question: "What is cap-gap extension?",
                directAnswer:
                    "Cap-gap, defined in 8 CFR § 214.2(f)(5)(vi), automatically extends F-1 status and OPT work authorization until October 1 if you have a pending or approved H-1B petition subject to the annual cap.",
                fullAnswer:
                    "According to USCIS, cap-gap bridges the gap between your OPT expiration and October 1 (when H-1B status begins). It applies only to H-1B petitions subject to the annual cap, not cap-exempt employers (universities, research institutions). Your employer must file the H-1B petition while you have valid F-1 status. If your H-1B is approved, cap-gap extends your EAD until September 30.",
                keyFacts: [
                    "Duration: Until October 1 (8 CFR § 214.2(f)(5)(vi))",
                    "Eligibility: Pending/approved cap-subject H-1B petition",
                    "Automatic: No separate application required",
                    "Status: Both F-1 status and EAD are extended",
                    "If denied: Must depart US or change to another valid status",
                ],
            },
        ],
    },
    {
        category: "Taxes and Requirements",
        source: "Source: IRS.gov, Publication 519 (U.S. Tax Guide for Aliens)",
        questions: [
            {
                question: "Do F-1 students need to file taxes?",
                directAnswer:
                    "Yes, according to the IRS (Publication 519), all F-1 students in the United States must file taxes. With income, file Form 1040-NR (non-resident) or 1040 (resident). With no income, file Form 8843.",
                fullAnswer:
                    "Per IRS Publication 519, all F-1 students must file taxes, even with zero US income. Non-residents (most F-1 students in their first 5 calendar years) file Form 1040-NR for income and Form 8843 (Statement for Exempt Individuals) in all cases. The Substantial Presence Test (IRC § 7701(b)) determines residency status. F-1 students are typically exempt from FICA taxes (Social Security and Medicare) for the first 5 calendar years under IRC § 3121(b)(19).",
                keyFacts: [
                    "Required: Yes, all F-1 students must file (IRS Publication 519)",
                    "No income: File Form 8843 only (Statement for Exempt Individuals)",
                    "With income: Form 1040-NR (non-resident) for most F-1 students",
                    "Deadline: April 15 (extensions available via Form 4868)",
                    "FICA exempt: First 5 calendar years (IRC § 3121(b)(19))",
                ],
            },
            {
                question: "Can I travel outside the US while on OPT?",
                directAnswer:
                    "Yes, F-1 students on approved OPT can travel outside the US and re-enter, but you must carry specific documents. According to USCIS and CBP guidance, you need a valid passport, valid F-1 visa stamp, valid EAD card, current I-20 with travel signature (within 6 months), and a job offer letter or employment verification.",
                fullAnswer:
                    "Travel during OPT is permitted but carries risk. If your OPT application is pending (not yet approved), re-entry is not guaranteed and travel is strongly discouraged by most DSOs. Per USCIS policy, days spent abroad while unemployed still count toward your 90-day unemployment limit. Ensure your I-20 travel signature is current (signed by DSO within the last 6 months).",
                keyFacts: [
                    "Documents needed: Valid passport, F-1 visa, EAD, I-20 with travel signature",
                    "Travel signature: Must be signed by DSO within last 6 months",
                    "Pending OPT: Travel strongly discouraged — re-entry not guaranteed",
                    "Unemployment clock: Days abroad while unemployed still count",
                    "Expired visa: May need to renew at a US consulate before re-entry",
                ],
            },
        ],
    },
];

// Key takeaways for AI extraction (CORE-EEAT O02)
const keyTakeaways = [
    "OPT provides 12 months of work authorization for F-1 students; STEM OPT adds 24 more months (36 total)",
    "The 90-day unemployment limit is cumulative, not consecutive — exceeding it violates F-1 status",
    "STEM OPT requires an E-Verify employer and Form I-983 Training Plan",
    "OPT processing takes 3-5 months as of 2026 — premium processing is not available",
    "Over 25,000 US companies sponsor H-1B visas (DOL LCA database)",
    "All F-1 students must file taxes, even with zero income (IRS Form 8843)",
];

export function LandingAEOContent() {
    return (
        <section
            className="py-24 bg-white dark:bg-zinc-900"
            aria-labelledby="aeo-heading"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <header className="text-center max-w-3xl mx-auto mb-16">
                    <h2
                        id="aeo-heading"
                        className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                    >
                        OPT Knowledge Base
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Everything you need to know about Optional Practical Training, STEM OPT extension,
                        USCIS case tracking, and H-1B sponsorship for F-1 international students.
                    </p>
                    {/* Authority + Freshness banner */}
                    <div className="mt-6 inline-flex items-center gap-3 flex-wrap justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-100 dark:border-blue-800/30">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Built by former F-1 students
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium rounded-full border border-green-100 dark:border-green-800/30">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Last verified: March 2026
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full border border-gray-200 dark:border-zinc-700">
                            Sources: USCIS.gov · 8 CFR 214.2(f) · IRS Pub 519
                        </span>
                    </div>
                </header>

                {/* Key Takeaways - Summary Box for AI extraction (CORE-EEAT O02) */}
                <div className="max-w-4xl mx-auto mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-2xl p-8 border border-blue-200/60 dark:border-blue-800/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="text-xl">📋</span> Key Takeaways: OPT for F-1 Students
                    </h3>
                    <ul className="space-y-3">
                        {keyTakeaways.map((takeaway, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <span className="mt-0.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                <span>{takeaway}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Knowledge Base Content - Structured for AI */}
                <div className="space-y-16">
                    {knowledgeBase.map((category, catIndex) => (
                        <article key={catIndex} className="space-y-8">
                            {/* Category Header with Source */}
                            <div className="border-b border-gray-200 dark:border-zinc-700 pb-4">
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {category.category}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                                    {category.source}
                                </p>
                            </div>

                            {/* Questions */}
                            <div className="space-y-8">
                                {category.questions.map((qa, qaIndex) => (
                                    <article
                                        key={qaIndex}
                                        className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-zinc-700"
                                        itemScope
                                        itemType="https://schema.org/Question"
                                    >
                                        {/* Question */}
                                        <h4
                                            className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                                            itemProp="name"
                                        >
                                            {qa.question}
                                        </h4>

                                        {/* Direct Answer - First sentence for AI */}
                                        <div
                                            itemScope
                                            itemType="https://schema.org/Answer"
                                            itemProp="acceptedAnswer"
                                        >
                                            <p
                                                className="text-gray-800 dark:text-gray-200 font-medium mb-4 text-lg leading-relaxed"
                                                itemProp="text"
                                            >
                                                {qa.directAnswer}
                                            </p>

                                            {/* Full Explanation */}
                                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                                {qa.fullAnswer}
                                            </p>

                                            {/* Key Facts - Structured Data */}
                                            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                                                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                                    Key Facts
                                                </h5>
                                                <ul className="space-y-2">
                                                    {qa.keyFacts.map((fact, factIndex) => (
                                                        <li
                                                            key={factIndex}
                                                            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                                        >
                                                            <span className="text-green-500 mt-0.5">✓</span>
                                                            <span>{fact}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>

                {/* Quick Reference Table - For AI Understanding */}
                <aside className="mt-20 pt-12 border-t border-gray-200 dark:border-zinc-700">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
                        OPT Quick Reference
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-700">
                                    <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Topic</th>
                                    <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Initial OPT</th>
                                    <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">STEM OPT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                <tr>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">Duration</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">12 months</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">+24 months (36 total)</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">Unemployment Limit</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">90 days</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">+60 days additional</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">Application Form</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">I-765</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">I-765 + I-983</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">Filing Fee</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">$470</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">$470</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">E-Verify Required</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">No</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">Yes</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-gray-900 dark:text-white font-medium">Work Hours</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">20+ hours/week</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">20+ hours/week</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </aside>
            </div>
        </section>
    );
}
