"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Comprehensive FAQ data optimized for AI models and search engines
// Each question is structured to match common search queries
const faqCategories = [
    {
        category: "OPT Basics",
        questions: [
            {
                question: "What is OPT (Optional Practical Training)?",
                answer:
                    "OPT (Optional Practical Training) is a temporary employment authorization that allows F-1 international students to work in the United States for up to 12 months after completing their academic program. The employment must be directly related to your major field of study. STEM degree holders may apply for an additional 24-month extension, allowing up to 36 months of total OPT work authorization. OPT is administered by USCIS through Form I-765 (Application for Employment Authorization).",
            },
            {
                question: "How many days of unemployment are allowed on OPT?",
                answer:
                    "For initial Post-Completion OPT, you are allowed a maximum of 90 days of unemployment during your entire OPT period. For STEM OPT extension, the aggregate limit is 150 days total (combining days from both initial OPT and STEM extension). Unemployment days start accumulating from your EAD start date or program end date, whichever is later. Exceeding these limits can result in falling out of F-1 status and violating your immigration status.",
            },
            {
                question: "What is the 90-day rule for OPT?",
                answer:
                    "The 90-day rule states that F-1 students on Post-Completion OPT cannot accumulate more than 90 days of unemployment. Working at least 20 hours per week in a position related to your major stops the unemployment clock. Unpaid internships, volunteer work (at least 20 hours/week), and self-employment in your field also count as employment. TrackMyOPT helps you monitor these days with real-time tracking and alerts.",
            },
        ],
    },
    {
        category: "STEM OPT Extension",
        questions: [
            {
                question: "How do I apply for STEM OPT extension?",
                answer:
                    "To apply for STEM OPT extension: (1) Verify your degree qualifies as STEM using the DHS STEM Designated Degree Program List, (2) Ensure your employer is enrolled in E-Verify, (3) Complete Form I-983 Training Plan with your employer, (4) Request your DSO to issue a new I-20 recommending STEM extension in SEVIS, (5) File Form I-765 with USCIS with category (c)(3)(C) before your current OPT expires. You can file up to 90 days before your current EAD expiration.",
            },
            {
                question: "What is cap-gap extension?",
                answer:
                    "Cap-gap extension automatically extends your F-1 status and OPT work authorization if you have a pending or approved H-1B petition subject to the annual cap. It bridges the gap between your OPT/F-1 expiration and October 1 when H-1B status begins. Your employer must file the H-1B petition while you have valid F-1 status. Cap-gap extends your EAD authorization until September 30 or until USCIS acts on your petition.",
            },
        ],
    },
    {
        category: "USCIS Case Tracking",
        questions: [
            {
                question: "How can I track my USCIS case status?",
                answer:
                    "You can track your USCIS case status using your 13-character receipt number (e.g., IOE1234567890 or MSC1234567890). With TrackMyOPT's Case Status Tracker, you can monitor multiple cases, get plain-English explanations of status codes, see processing times by service center, and receive email notifications when your status changes. The system checks USCIS directly and updates you automatically.",
            },
            {
                question: "What does each USCIS case status mean?",
                answer:
                    "Common USCIS case statuses include: 'Case Was Received' (USCIS received your application), 'Case Is Being Actively Reviewed' (under processing), 'Request for Evidence' (RFE - additional documents needed), 'Case Was Approved' (approval granted), 'Card Is Being Produced' (EAD being manufactured), 'Card Was Mailed' (shipped to you), and 'Case Was Denied' (application rejected). TrackMyOPT provides detailed explanations for each status.",
            },
        ],
    },
    {
        category: "H-1B Sponsorship",
        questions: [
            {
                question: "Which companies sponsor H-1B visas?",
                answer:
                    "TrackMyOPT provides a searchable database of 80,000+ companies that sponsor H-1B visas. Top sponsors include technology companies (Google, Microsoft, Amazon, Apple, Meta), consulting firms (Deloitte, Accenture, Infosys, Cognizant, TCS), financial institutions (JPMorgan, Goldman Sachs, Bank of America), and healthcare organizations. You can filter by industry, location, approval rate, and number of petitions. Data is sourced from Department of Labor LCA filings.",
            },
            {
                question: "How do I find H-1B sponsors in my field?",
                answer:
                    "Use TrackMyOPT's H-1B Sponsor Database to search by industry, job title, location, and company size. Filter by approval rate to find companies with higher success rates. Look at 'petitions filed' to see hiring volume. Save companies to track them and add directly to your job application tracker. The database includes sponsor scores based on our proprietary algorithm considering multiple factors.",
            },
        ],
    },
    {
        category: "Taxes & Insurance",
        questions: [
            {
                question: "Do F-1 students need to file taxes?",
                answer:
                    "Yes, F-1 students must file taxes even with zero income. If you have no U.S. income, you must file Form 8843 (Statement for Exempt Individuals). If you have income, most F-1 students file as non-resident aliens using Form 1040-NR. The Substantial Presence Test determines your tax residency status. International students are typically exempt from FICA taxes (Social Security and Medicare) for the first 5 years. TrackMyOPT's Tax Guide helps determine your requirements.",
            },
            {
                question: "Do OPT students need health insurance?",
                answer:
                    "While not federally required, health insurance is highly recommended for OPT students. Many universities require it, and medical costs in the US are expensive. OPT students can purchase private insurance, join employer plans, or use international student health insurance. Some states offer Medicaid to eligible immigrants. TrackMyOPT's Health Insurance Finder helps you compare plans by state and visa type.",
            },
        ],
    },
    {
        category: "TrackMyOPT Platform",
        questions: [
            {
                question: "Is TrackMyOPT free?",
                answer:
                    "Yes! TrackMyOPT offers a comprehensive free plan that includes: OPT timeline dashboard with countdown timers, unemployment clock tracking, 1 USCIS case status tracker, H-1B sponsor database access, job application tracker, and email alerts. The Premium plan ($19.99 one-time lifetime payment, not a subscription) adds: unlimited case tracking, secure Document Vault with AI extraction, expiry reminders, data export, and priority support.",
            },
            {
                question: "Is my data secure on TrackMyOPT?",
                answer:
                    "Absolutely. TrackMyOPT uses bank-grade AES-256 encryption for all stored documents and data. Your Document Vault is protected with passcode authentication and auto-lock features. We never share personal information with third parties. Data is encrypted both at rest and in transit. You can export or delete all your data at any time (GDPR compliant). Our infrastructure is hosted on secure, SOC 2 compliant cloud providers.",
            },
        ],
    },
];

export function LandingFAQEnhanced() {
    const [openCategory, setOpenCategory] = useState<number>(0);
    const [openQuestion, setOpenQuestion] = useState<string | null>(
        faqCategories[0]?.questions[0]?.question || null
    );

    return (
        <section id="faq" className="py-24 bg-white dark:bg-zinc-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header - Optimized for SEO */}
                <header className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-medium rounded-full mb-4">
                        Frequently Asked Questions
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Everything About{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                            OPT & F-1 Visa
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Get answers to the most common questions about Optional Practical Training,
                        STEM extension, USCIS case tracking, H-1B sponsors, and international student taxes.
                    </p>
                </header>

                {/* Category Tabs */}
                <nav
                    className="flex flex-wrap justify-center gap-2 mb-10"
                    aria-label="FAQ categories"
                >
                    {faqCategories.map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setOpenCategory(index);
                                setOpenQuestion(cat.questions[0]?.question || null);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${openCategory === index
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                    : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                }`}
                        >
                            {cat.category}
                        </button>
                    ))}
                </nav>

                {/* FAQ Questions - Structured with semantic HTML */}
                <div className="space-y-4">
                    {faqCategories[openCategory]?.questions.map((faq, index) => (
                        <article
                            key={index}
                            className="bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
                            itemScope
                            itemProp="mainEntity"
                            itemType="https://schema.org/Question"
                        >
                            <button
                                onClick={() =>
                                    setOpenQuestion(
                                        openQuestion === faq.question ? null : faq.question
                                    )
                                }
                                className="w-full flex items-center justify-between p-6 text-left"
                                aria-expanded={openQuestion === faq.question}
                            >
                                <h3
                                    className="font-semibold text-gray-900 dark:text-white pr-4 text-lg"
                                    itemProp="name"
                                >
                                    {faq.question}
                                </h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 transition-transform ${openQuestion === faq.question ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openQuestion === faq.question ? "max-h-[500px]" : "max-h-0"
                                    }`}
                                itemScope
                                itemProp="acceptedAnswer"
                                itemType="https://schema.org/Answer"
                            >
                                <div className="px-6 pb-6 pt-0">
                                    <p
                                        className="text-gray-600 dark:text-gray-300 leading-relaxed"
                                        itemProp="text"
                                    >
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Additional SEO Content - Crawlable Definitions */}
                <aside className="mt-16 pt-12 border-t border-gray-200 dark:border-zinc-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        Key Immigration Terms Glossary
                    </h3>
                    <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { term: "F-1 Visa", definition: "Non-immigrant student visa for academic studies in the United States" },
                            { term: "EAD", definition: "Employment Authorization Document - work permit card issued by USCIS" },
                            { term: "I-20", definition: "Certificate of Eligibility for student status issued by your school" },
                            { term: "DSO", definition: "Designated School Official who manages student immigration records" },
                            { term: "SEVIS", definition: "Student and Exchange Visitor Information System database" },
                            { term: "I-765", definition: "USCIS form to apply for Employment Authorization Document" },
                            { term: "I-983", definition: "Training Plan for STEM OPT students required by employers" },
                            { term: "E-Verify", definition: "Online system employers use to verify work authorization" },
                            { term: "LCA", definition: "Labor Condition Application required for H-1B petitions" },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-zinc-800/50 rounded-lg p-4 border border-gray-200 dark:border-zinc-700"
                            >
                                <dt className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {item.term}
                                </dt>
                                <dd className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    {item.definition}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </aside>

                {/* Contact CTA */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Still have questions about OPT, STEM extension, or your immigration status?
                    </p>
                    <a
                        href="mailto:support@trackmyopt.com"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        Contact our support team
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
