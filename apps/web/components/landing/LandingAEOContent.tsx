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
const knowledgeBase = [
    {
        category: "OPT Basics",
        questions: [
            {
                question: "What is OPT?",
                directAnswer:
                    "OPT (Optional Practical Training) is 12 months of work authorization for F-1 international students after completing their academic program in the United States.",
                fullAnswer:
                    "OPT allows F-1 students to work in positions directly related to their major field of study. Students apply using Form I-765 to USCIS. STEM degree holders can extend OPT by an additional 24 months, for a total of 36 months of work authorization.",
                keyFacts: [
                    "Duration: 12 months (initial), up to 36 months with STEM extension",
                    "Eligibility: F-1 students who completed their degree program",
                    "Application: Form I-765 submitted to USCIS",
                    "Processing time: 90-120 days (3-4 months) average",
                    "Cost: $470 (online) / $520 (paper) filing fee (2026)",
                ],
            },
            {
                question: "How many days of unemployment are allowed on OPT?",
                directAnswer:
                    "F-1 students on post-completion OPT are allowed a maximum of 90 days of unemployment.",
                fullAnswer:
                    "The 90-day limit applies to your initial OPT period. For STEM OPT, you get a separate 60-day allowance. Unused days from initial OPT do not carry forward to the STEM period.",
                keyFacts: [
                    "Initial OPT: 90 days maximum unemployment",
                    "STEM OPT: Additional 60 days (separate from initial OPT)",
                    "Counting starts: EAD start date or program end date",
                    "Employment requirement: Minimum 20 hours per week",
                    "Consequence of exceeding: F-1 status violation",
                ],
            },
            {
                question: "What is the 90-day rule for OPT?",
                directAnswer:
                    "The 90-day rule limits F-1 students on OPT to a maximum of 90 cumulative days without employment.",
                fullAnswer:
                    "During your 12-month OPT period, you cannot be unemployed for more than 90 days total. Each day without qualifying employment counts toward this limit. Employment must be at least 20 hours per week and directly related to your major. Self-employment, unpaid internships, and volunteer work can count if they meet these requirements.",
                keyFacts: [
                    "Limit: 90 days total, not consecutive",
                    "Minimum hours: 20 hours per week to stop the clock",
                    "Related to major: Work must be in your field of study",
                    "Tracking: TrackMyOPT helps monitor these days",
                    "Violation: Exceeding 90 days ends your OPT authorization",
                ],
            },
        ],
    },
    {
        category: "STEM OPT Extension",
        questions: [
            {
                question: "What is STEM OPT extension?",
                directAnswer:
                    "STEM OPT is a 24-month extension that allows F-1 students with STEM degrees to work in the US for up to 36 months total.",
                fullAnswer:
                    "STEM OPT extends your work authorization beyond the initial 12-month OPT. To qualify, your degree must be on the DHS STEM Designated Degree Program List, and your employer must be enrolled in E-Verify. You must complete Form I-983 (Training Plan) with your employer and file Form I-765 before your initial OPT expires.",
                keyFacts: [
                    "Extension length: 24 additional months",
                    "Total OPT: Up to 36 months with STEM extension",
                    "Requirement: Degree on STEM Designated List",
                    "Employer: Must be E-Verify enrolled",
                    "Form: I-983 Training Plan required",
                ],
            },
            {
                question: "How to apply for STEM OPT extension?",
                directAnswer:
                    "Apply for STEM OPT by completing Form I-983 with your employer and filing Form I-765 with USCIS up to 90 days before your current OPT expires.",
                fullAnswer:
                    "Steps to apply: 1) Verify your degree is STEM-designated using the CIP code on your I-20, 2) Confirm your employer is E-Verify enrolled, 3) Complete Form I-983 Training Plan with your employer, 4) Request a new I-20 from your DSO with STEM OPT recommendation, 5) File Form I-765 with USCIS using category (c)(3)(C).",
                keyFacts: [
                    "Earliest filing: 90 days before OPT expires",
                    "Deadline: Must file before current OPT ends",
                    "E-Verify: Employer must provide E-Verify number",
                    "I-983: Both student and employer must sign",
                    "Processing: Can continue working pending with cap-gap",
                ],
            },
            {
                question: "What is the STEM OPT unemployment limit?",
                directAnswer:
                    "STEM OPT provides a separate 60-day unemployment allowance.",
                fullAnswer:
                    "This 60-day allowance is specific to the STEM extension period. Unused days from your initial 90-day OPT allowance do not carry forward or combine with these days.",
                keyFacts: [
                    "Additional allowance: 60 days for STEM OPT",
                    "Initial OPT Limit: 90 days maximum",
                    "STEM Extension: Adds 60 days of unemployment",
                    "Total: 90 days (Initial) + 60 days (STEM)",
                    "Reporting: Must report changes within 10 days",
                ],
            },
        ],
    },
    {
        category: "USCIS Case Tracking",
        questions: [
            {
                question: "How to track USCIS case status?",
                directAnswer:
                    "Track your USCIS case using your 13-character receipt number (e.g., IOE1234567890) on USCIS.gov or TrackMyOPT.",
                fullAnswer:
                    "Your receipt number is on the I-797C Notice of Action you received after filing. Enter this number on the USCIS Case Status Online page or use TrackMyOPT for automatic tracking with email notifications. Common receipt prefixes include IOE (online filing), MSC (California), LIN (Nebraska), SRC (Texas), and EAC (Vermont).",
                keyFacts: [
                    "Receipt number: 13 characters (3 letters + 10 digits)",
                    "Where to find: I-797C Notice of Action",
                    "Service centers: IOE, MSC, LIN, SRC, EAC, WAC",
                    "Tracking: USCIS.gov or TrackMyOPT for alerts",
                    "Updates: Status changes typically within 24-48 hours",
                ],
            },
        ],
    },
    {
        category: "H-1B Sponsorship",
        questions: [
            {
                question: "Which companies sponsor H-1B visas?",
                directAnswer:
                    "Over 25,000 US companies sponsor H-1B visas, including tech giants (Google, Microsoft, Amazon), consulting firms (Deloitte, Accenture), and financial institutions (JPMorgan, Goldman Sachs).",
                fullAnswer:
                    "TrackMyOPT's H-1B Sponsor Database includes 25,000+ verified sponsors from Department of Labor LCA filings. Top sponsors by volume include Cognizant, Infosys, TCS, Amazon, Google, Microsoft, Meta, Apple, and Deloitte. You can search by industry, location, approval rate, and petition count to find companies actively hiring and sponsoring.",
                keyFacts: [
                    "Database size: 25,000+ verified sponsors",
                    "Data source: Department of Labor LCA filings",
                    "Top tech: Google, Microsoft, Amazon, Meta, Apple",
                    "Top consulting: Cognizant, Infosys, TCS, Deloitte",
                    "Search by: Industry, location, approval rate",
                ],
            },
            {
                question: "What is cap-gap extension?",
                directAnswer:
                    "Cap-gap automatically extends F-1 status and OPT work authorization until October 1 if you have a pending or approved H-1B petition.",
                fullAnswer:
                    "Cap-gap bridges the gap between your OPT expiration and October 1 (when H-1B status begins). It applies only to H-1B petitions subject to the annual cap, not cap-exempt employers. Your employer must file the H-1B petition while you have valid F-1 status. If your H-1B is approved, cap-gap extends your EAD until September 30.",
                keyFacts: [
                    "Duration: Until October 1 (if H-1B approved)",
                    "Eligibility: Pending/approved cap-subject H-1B",
                    "Automatic: No separate application required",
                    "Status: F-1 status and EAD both extended",
                    "Denial: Must depart US if H-1B denied",
                ],
            },
        ],
    },
    {
        category: "Taxes and Requirements",
        questions: [
            {
                question: "Do F-1 students need to file taxes?",
                directAnswer:
                    "Yes, F-1 students must file taxes. With income, file Form 1040-NR (non-resident) or 1040. With no income, file Form 8843.",
                fullAnswer:
                    "All F-1 students must file taxes, even with zero US income. Non-residents (most F-1 students in first 5 years) file Form 1040-NR for income and Form 8843 (Statement for Exempt Individuals) in all cases. The Substantial Presence Test determines residency status. F-1 students are typically exempt from FICA taxes (Social Security and Medicare) for the first 5 calendar years.",
                keyFacts: [
                    "Required: Yes, all F-1 students must file",
                    "No income: File Form 8843 only",
                    "With income: Form 1040-NR (non-resident) typically",
                    "Deadline: April 15 (with extensions available)",
                    "FICA exempt: First 5 calendar years in US",
                ],
            },
        ],
    },
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
                </header>

                {/* Knowledge Base Content - Structured for AI */}
                <div className="space-y-16">
                    {knowledgeBase.map((category, catIndex) => (
                        <article key={catIndex} className="space-y-8">
                            {/* Category Header */}
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-4">
                                {category.category}
                            </h3>

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
