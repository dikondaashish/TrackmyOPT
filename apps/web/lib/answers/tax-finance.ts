import { AnswerEntry } from "./types";

export const taxFinanceAnswers: AnswerEntry[] = [
    {
        slug: "do-f1-students-pay-taxes",
        question: "Do F-1 Students Pay Taxes in the US?",
        shortAnswer:
            "Yes, F-1 students are required to file US tax returns if they have any US-source income, and must file Form 8843 even with no income. However, as nonresident aliens during their first five calendar years, they are taxed only on US-source income and may benefit from reduced rates under tax treaties.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "Every F-1 student must file at least Form 8843 each year, regardless of whether they earned any income. If you had US-source income, you will also need to file Form 1040-NR.",
        sections: [
            {
                heading: "Understanding Your Tax Obligations as an F-1 Student",
                paragraphs: [
                    "F-1 students in the United States have specific tax obligations that differ from those of US citizens and permanent residents. During the first five calendar years in F-1 status, most international students are classified as nonresident aliens for tax purposes. This classification means you are only taxed on income that is sourced within the United States, such as wages from on-campus employment, OPT earnings, fellowship stipends, or scholarship amounts that exceed tuition and required fees.",
                    "Even if you did not earn a single dollar during the tax year, you are still required to file Form 8843, a statement for exempt individuals. This form notifies the IRS that you are present in the US under an immigration status that exempts you from the Substantial Presence Test. Failing to file Form 8843 can jeopardize your ability to claim nonresident alien status in future years.",
                    "If you earned income, you will also file Form 1040-NR, the nonresident alien income tax return. The 1040-NR is used to report wages, scholarships, fellowships, and any other US-source income. Unlike US residents, nonresident aliens cannot file the standard Form 1040 or claim the standard deduction (with limited exceptions for students from India).",
                ],
            },
            {
                heading: "What Types of Income Are Taxable?",
                paragraphs: [
                    "The most common taxable income for F-1 students includes wages earned through on-campus employment, Curricular Practical Training (CPT), Optional Practical Training (OPT), and STEM OPT extension. These wages are reported on Form W-2 from your employer. Scholarship and fellowship amounts that exceed qualified tuition and related expenses are also considered taxable income.",
                    "Bank interest earned in US accounts is generally not taxable for nonresident aliens from most countries unless a tax treaty specifically addresses it. Capital gains from investments are typically not taxed for nonresident aliens unless they are present in the US for 183 days or more during the tax year. However, this area can be complex, and specific treaty provisions may apply depending on your home country.",
                ],
                bulletPoints: [
                    "Wages from on-campus jobs, CPT, OPT, and STEM OPT",
                    "Scholarship or fellowship amounts exceeding qualified tuition and fees",
                    "Stipends and assistantship payments",
                    "Self-employment income from authorized freelance work",
                    "Prizes and awards received while in the US",
                ],
            },
            {
                heading: "Tax Treaties and Reduced Rates",
                paragraphs: [
                    "The United States has income tax treaties with over 65 countries, and many of these treaties contain provisions specifically for students and trainees. For example, students from China may be eligible for an exemption on the first $5,000 of wages earned per year under Article 20 of the US-China tax treaty. Students from India can claim the standard deduction on their 1040-NR, a benefit not available to students from most other countries.",
                    "To claim a tax treaty benefit, you must include Form 8233 with your employer (for wage withholding reduction) and report the treaty-exempt income on your 1040-NR. Not all countries have student-specific provisions, so it is important to check the specific treaty between the US and your home country. The IRS publishes a complete list of treaties and their provisions on its website.",
                ],
                importantNote:
                    "Tax treaty benefits are not automatic. You must actively claim them by filing the correct forms with your employer and on your tax return.",
            },
            {
                heading: "Common Mistakes to Avoid",
                paragraphs: [
                    "One of the most frequent errors F-1 students make is using consumer tax software like TurboTax or H&R Block, which are designed for US residents and will incorrectly file you as a resident alien. Nonresident aliens should use specialized software such as Sprintax or Glacier Tax Prep, or work with a tax professional experienced in nonresident alien returns.",
                    "Another common mistake is failing to file Form 8843 in years when you had no income. Some students also incorrectly claim the standard deduction or Earned Income Tax Credit, which are generally not available to nonresident aliens. Always verify your residency status using the Substantial Presence Test before choosing which forms to file.",
                ],
                bulletPoints: [
                    "Do not use TurboTax, H&R Block, or other resident-only tax software",
                    "Do not claim the standard deduction unless you are from India",
                    "Do not skip filing Form 8843 even if you had zero income",
                    "Do not claim credits available only to residents, such as the EITC",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "Do F-1 Students Pay FICA Taxes?", slug: "do-f1-students-pay-fica" },
            { question: "What Is Form 8843?", slug: "what-is-form-8843" },
            { question: "What Is Form 1040-NR?", slug: "what-is-1040-nr" },
            { question: "When Is the Tax Filing Deadline for F-1 Students?", slug: "when-is-tax-deadline-for-f1" },
        ],
        metadata: {
            title: "Do F-1 Students Pay Taxes in the US? | TrackMyOPT",
            description:
                "Learn about F-1 student tax obligations in the US, including Form 8843, 1040-NR, tax treaties, and which income types are taxable for international students.",
            keywords: [
                "F-1 student taxes",
                "international student tax filing",
                "Form 8843",
                "1040-NR",
                "nonresident alien taxes",
                "OPT taxes",
                "F-1 visa tax obligations",
            ],
        },
    },
    {
        slug: "do-f1-students-pay-fica",
        question: "Do F-1 Students Pay FICA Taxes?",
        shortAnswer:
            "No, F-1 students are exempt from FICA taxes (Social Security and Medicare) during their first five calendar years in the US, as long as they are classified as nonresident aliens. After the five-year exemption period, or upon becoming a resident alien, FICA taxes apply.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "If your employer is deducting Social Security or Medicare taxes from your paycheck during your first five years on F-1 status, request a correction immediately and file for a refund using Form 843.",
        sections: [
            {
                heading: "The FICA Exemption for F-1 Students",
                paragraphs: [
                    "FICA stands for the Federal Insurance Contributions Act and covers Social Security tax (6.2%) and Medicare tax (1.45%). Together, these amount to 7.65% of your gross wages. Under Internal Revenue Code Section 3121(b)(19), F-1 students who are nonresident aliens are exempt from FICA taxes on wages earned in connection with their student status.",
                    "This exemption applies during the first five calendar years you are present in the US in F-1 status. The five-year count is based on calendar years, not full 365-day periods. For example, if you arrived in August 2022, the year 2022 counts as your first calendar year, even though you were only present for five months. Your exemption would generally run through December 31, 2026.",
                    "The exemption covers all employment authorized under your F-1 visa, including on-campus employment, CPT, OPT, and STEM OPT. Your employer is responsible for not withholding FICA taxes from your paycheck, but many payroll departments are unfamiliar with this rule and may withhold them incorrectly.",
                ],
            },
            {
                heading: "What to Do If FICA Was Incorrectly Withheld",
                paragraphs: [
                    "If your employer has been deducting Social Security and Medicare taxes from your paychecks, you should first contact your payroll or HR department and request a correction. Provide them with a copy of your I-20 and explain the FICA exemption under IRC Section 3121(b)(19). In most cases, the employer can issue a corrected W-2 and refund the withheld amounts.",
                    "If your employer refuses to correct the withholding or is unable to issue a refund, you can file for a refund directly with the IRS using Form 843 (Claim for Refund and Request for Abatement) along with Form 8316. You will need to include your W-2, a copy of your I-20, your I-94 record, passport, visa, and a statement explaining your nonresident alien status.",
                ],
                bulletPoints: [
                    "Contact payroll/HR and request a FICA withholding correction",
                    "Provide your I-20, I-94, and passport as documentation",
                    "If employer cannot refund, file Form 843 with the IRS",
                    "Include Form 8316 and all supporting immigration documents",
                    "The IRS refund process can take 6 to 12 months",
                ],
                importantNote:
                    "You generally have three years from the date of the tax return to claim a FICA refund. Do not wait too long to file Form 843.",
            },
            {
                heading: "When the FICA Exemption Ends",
                paragraphs: [
                    "After spending more than five calendar years in the US in F-1 status, you may become a resident alien for tax purposes under the Substantial Presence Test. Once you are classified as a resident alien, the FICA exemption no longer applies and your employer must begin withholding Social Security and Medicare taxes from your wages.",
                    "There are some exceptions. If you change to a different visa status (such as H-1B) before the five-year period ends, your FICA exemption may end at that point. Conversely, if you left the US for a substantial period and re-entered on a new F-1 visa, the five-year clock may reset in certain circumstances. Consult a tax professional if your situation involves multiple entries or status changes.",
                ],
            },
            {
                heading: "FICA and OPT/STEM OPT Employment",
                paragraphs: [
                    "Students working on OPT or STEM OPT remain eligible for the FICA exemption as long as they are within the five-year nonresident alien period. This is a significant financial benefit, saving you 7.65% on every dollar earned. For a student earning $70,000 annually on STEM OPT, that amounts to over $5,300 per year in savings.",
                    "Some employers, especially large corporations with automated payroll systems, may default to withholding FICA from all employees. Be proactive during onboarding by informing your HR department about your FICA-exempt status and providing documentation upfront. Many universities also provide template letters you can share with your employer.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            { text: "STEM OPT Employer Requirements", href: "/blog/stem-opt-employer-requirements" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "Do F-1 Students Pay Taxes in the US?", slug: "do-f1-students-pay-taxes" },
            { question: "What Is the Substantial Presence Test?", slug: "what-is-substantial-presence-test" },
            { question: "What Is an EAD Card?", slug: "what-is-an-ead-card" },
            { question: "What Is the I-983 Training Plan for STEM OPT?", slug: "what-is-i-983-training-plan" },
        ],
        metadata: {
            title: "Do F-1 Students Pay FICA Taxes? | TrackMyOPT",
            description:
                "F-1 students are exempt from FICA taxes during their first 5 years. Learn about the exemption, what to do if FICA was withheld, and how to claim a refund.",
            keywords: [
                "F-1 FICA exemption",
                "Social Security tax international students",
                "Medicare tax F-1",
                "FICA refund Form 843",
                "OPT FICA taxes",
                "nonresident alien FICA",
            ],
        },
    },
    {
        slug: "what-is-form-8843",
        question: "What Is Form 8843?",
        shortAnswer:
            "Form 8843 is an IRS form titled 'Statement for Exempt Individuals' that all F-1 students must file annually, even if they had no US income. It declares your presence in the US under an exempt visa category and ensures the IRS does not count your days toward the Substantial Presence Test.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "File Form 8843 every year you are in the US on F-1 status, even if you earned zero income. The deadline is June 15 for those with no income, or April 15 if attached to a 1040-NR.",
        sections: [
            {
                heading: "Purpose of Form 8843",
                paragraphs: [
                    "Form 8843, officially titled 'Statement for Exempt Individuals and Individuals with a Medical Condition,' serves a critical function for international students. Its primary purpose is to inform the IRS that you are present in the United States under an immigration status—such as F-1—that qualifies you for an exemption from the Substantial Presence Test. Without this form, the IRS may count all your days in the US toward the 183-day threshold that determines resident alien status.",
                    "For F-1 students, the form covers the first five calendar years of presence. During this time, the days you spend in the US do not count toward the Substantial Presence Test, which means you maintain nonresident alien status for tax purposes. This distinction is critical because nonresident aliens are taxed only on US-source income and are exempt from FICA taxes.",
                    "Filing Form 8843 is not optional. Even if you had no income and are not required to file a tax return, you must still submit this form. Failure to file could result in the IRS classifying you as a resident alien retroactively, which would subject your worldwide income to US taxation.",
                ],
            },
            {
                heading: "How to Fill Out Form 8843",
                paragraphs: [
                    "Form 8843 is a two-page form that requires basic personal information and details about your immigration status. In Part I, you will enter your name, address, Social Security Number or ITIN (if you have one), and the visa type under which you are claiming the exemption. For F-1 students, you will check the box for 'student' and enter the type of visa (F-1).",
                    "Part III is specifically for students and requires you to list the name and address of your academic institution, the type of visa, and the dates you were present in the US during the tax year. You will also need to provide information about any changes to your visa status during the year.",
                ],
                bulletPoints: [
                    "Part I: Personal information, SSN or ITIN, visa type",
                    "Part III: Academic institution name and address",
                    "List all days present in the US during the current and prior two years",
                    "Indicate whether you changed visa status during the year",
                    "Attach to your 1040-NR if filing a tax return, or mail separately if not",
                ],
            },
            {
                heading: "Filing Deadlines and Where to Send It",
                paragraphs: [
                    "If you are filing Form 8843 along with a tax return (Form 1040-NR), submit it as an attachment to your return by the regular filing deadline of April 15. If you do not need to file a tax return because you had no US-source income, Form 8843 must be mailed separately to the IRS by June 15.",
                    "When mailing Form 8843 independently, send it to the Department of the Treasury, Internal Revenue Service Center, Austin, TX 73301-0215. You do not need to include any payment or additional forms. It is a good practice to send it via certified mail or a trackable method so you have proof of timely filing.",
                ],
                importantNote:
                    "Each individual must file their own Form 8843. If you have a spouse or dependents in F-2 status, they must each file a separate Form 8843.",
            },
            {
                heading: "Common Questions About Form 8843",
                paragraphs: [
                    "Students frequently ask whether they need to file Form 8843 if they arrived mid-year, were only in the US for a few months, or were on summer break. The answer is yes in all these cases—if you were physically present in the US for even one day during the calendar year on F-1 status, you should file Form 8843 for that year.",
                    "Another common question is whether you need an SSN or ITIN to file. While the form has a field for these numbers, you can leave it blank and write 'APPLIED FOR' or 'N/A' if you do not have either. The absence of an SSN or ITIN does not excuse you from filing the form.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "TrackMyOPT Tools", href: "/tools" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "What Is Form 1040-NR?", slug: "what-is-1040-nr" },
            { question: "What Is the Substantial Presence Test?", slug: "what-is-substantial-presence-test" },
            { question: "When Is the Tax Filing Deadline for F-1 Students?", slug: "when-is-tax-deadline-for-f1" },
            { question: "What Is an ITIN and When Do F-1 Students Need One?", slug: "what-is-itin-for-f1" },
        ],
        metadata: {
            title: "What Is Form 8843? Filing Guide for F-1 Students | TrackMyOPT",
            description:
                "Form 8843 is required for all F-1 students annually, even with no income. Learn how to fill it out, where to mail it, and the filing deadline.",
            keywords: [
                "Form 8843",
                "IRS Form 8843",
                "exempt individual statement",
                "F-1 student tax form",
                "Substantial Presence Test exemption",
                "international student IRS filing",
            ],
        },
    },
    {
        slug: "what-is-1040-nr",
        question: "What Is Form 1040-NR?",
        shortAnswer:
            "Form 1040-NR is the US nonresident alien income tax return. F-1 students who earned US-source income during the tax year must file this form to report wages, scholarships, and other taxable income. It functions similarly to the standard 1040 but applies different rules for deductions and credits.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "If you earned any US-source income as an F-1 student during the tax year, you must file Form 1040-NR by April 15. Use nonresident alien tax software like Sprintax to avoid filing errors.",
        sections: [
            {
                heading: "Overview of Form 1040-NR",
                paragraphs: [
                    "Form 1040-NR, officially titled 'U.S. Nonresident Alien Income Tax Return,' is the tax return used by individuals who are classified as nonresident aliens under the Internal Revenue Code. For F-1 students in their first five calendar years in the US, this is the correct form to use when reporting income to the IRS.",
                    "Unlike the standard Form 1040 used by US citizens and residents, the 1040-NR has specific limitations. Nonresident aliens generally cannot claim the standard deduction (with limited exceptions), cannot file jointly with a spouse, and are not eligible for many tax credits available to residents, such as the Earned Income Tax Credit or the Child Tax Credit.",
                    "The form captures all US-source income, including wages from employment (reported on W-2), scholarship and fellowship income (reported on 1042-S or W-2), and any other income effectively connected to a US trade or business. Income from sources outside the United States is not reported on the 1040-NR.",
                ],
            },
            {
                heading: "Key Differences Between 1040-NR and 1040",
                paragraphs: [
                    "The most significant difference is the scope of taxable income. Resident aliens report worldwide income on Form 1040, while nonresident aliens report only US-source income on Form 1040-NR. This means income earned in your home country, foreign bank interest, and investments held abroad are generally not subject to US taxation for nonresident aliens.",
                    "Deductions also differ substantially. Nonresident aliens can claim itemized deductions only for expenses related to US-source income. The standard deduction is generally not available, except for students from India who can claim it under the US-India tax treaty. State and local tax (SALT) deductions, charitable contributions, and other common deductions for residents may not apply.",
                ],
                bulletPoints: [
                    "1040-NR reports only US-source income; 1040 reports worldwide income",
                    "Standard deduction generally not available on 1040-NR",
                    "Cannot file jointly with a spouse on 1040-NR",
                    "Limited tax credits available compared to Form 1040",
                    "Tax treaty benefits are claimed directly on the 1040-NR",
                ],
            },
            {
                heading: "How to File Form 1040-NR",
                paragraphs: [
                    "The recommended approach for F-1 students is to use specialized nonresident alien tax software such as Sprintax or Glacier Tax Prep. These platforms are designed specifically for nonresident alien tax situations and will correctly guide you through the 1040-NR, ensuring proper treatment of treaty benefits, FICA exemptions, and scholarship income.",
                    "You will need several documents to complete your return: your W-2 or 1042-S forms showing income and withholding, your passport, I-20, I-94 arrival record, and Social Security Number or ITIN. If claiming a tax treaty benefit, you will need to know the specific treaty article and the amount of income exempt under the treaty.",
                ],
                importantNote:
                    "Do not use TurboTax, H&R Block, or other standard tax software. These platforms do not support Form 1040-NR and will incorrectly file you as a resident alien.",
            },
            {
                heading: "Filing Deadlines and Extensions",
                paragraphs: [
                    "The standard filing deadline for Form 1040-NR is April 15 of the year following the tax year. If you cannot meet this deadline, you can request an automatic six-month extension by filing Form 4868 by April 15. The extension gives you until October 15 to file, but it does not extend the deadline for paying any taxes owed.",
                    "If you are outside the United States on April 15 and have no wages subject to US withholding, you may qualify for an automatic two-month extension until June 15. Attach a statement to your return explaining your eligibility for this extension. Any interest on unpaid taxes still accrues from the original April 15 deadline.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "What Is Form 8843?", slug: "what-is-form-8843" },
            { question: "Do F-1 Students Pay Taxes in the US?", slug: "do-f1-students-pay-taxes" },
            { question: "What Is an ITIN and When Do F-1 Students Need One?", slug: "what-is-itin-for-f1" },
            { question: "What Is the Substantial Presence Test?", slug: "what-is-substantial-presence-test" },
        ],
        metadata: {
            title: "What Is Form 1040-NR? Nonresident Tax Return Guide | TrackMyOPT",
            description:
                "Form 1040-NR is the nonresident alien tax return for F-1 students with US income. Learn what it covers, how to file, and key differences from Form 1040.",
            keywords: [
                "Form 1040-NR",
                "nonresident alien tax return",
                "F-1 student tax return",
                "1040-NR vs 1040",
                "international student taxes",
                "Sprintax",
                "nonresident tax filing",
            ],
        },
    },
    {
        slug: "what-is-substantial-presence-test",
        question: "What Is the Substantial Presence Test?",
        shortAnswer:
            "The Substantial Presence Test is an IRS formula that determines whether a foreign national is a resident alien or nonresident alien for tax purposes. F-1 students are exempt from counting their days in the US for the first five calendar years, meaning most students remain nonresident aliens throughout their studies.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "F-1 students do not count their days toward the Substantial Presence Test during the first five calendar years. File Form 8843 each year to document your exempt status.",
        sections: [
            {
                heading: "How the Substantial Presence Test Works",
                paragraphs: [
                    "The Substantial Presence Test is the primary method the IRS uses to determine whether a foreign national in the US should be taxed as a resident alien or a nonresident alien. Under this test, you are considered a resident alien if you were physically present in the United States for at least 31 days during the current calendar year and a total of 183 days during the current year and the two preceding years, using a weighted formula.",
                    "The formula counts all the days you were present in the current year, one-third of the days in the first preceding year, and one-sixth of the days in the second preceding year. If the total equals 183 or more, you meet the Substantial Presence Test and are classified as a resident alien for that tax year.",
                    "For example, if you were present for 120 days in 2025, 120 days in 2024, and 120 days in 2023, the calculation would be: 120 + (120 × 1/3) + (120 × 1/6) = 120 + 40 + 20 = 180 days. Since 180 is less than 183, you would not meet the test in this example.",
                ],
            },
            {
                heading: "The F-1 Student Exemption",
                paragraphs: [
                    "F-1 students receive a special exemption under IRC Section 7701(b)(5)(D). During the first five calendar years you are present in the US as an F-1 student, your days of presence are classified as exempt and do not count toward the 183-day threshold. This is a significant benefit because it ensures most F-1 students maintain nonresident alien status throughout their academic program.",
                    "The five-year count begins with the first calendar year you enter the US in F-1 status, regardless of when during that year you arrived. If you arrived on August 15, 2022, then 2022 is year one, and your exempt period runs through the end of 2026. After five calendar years, your days begin counting toward the Substantial Presence Test, and you may become a resident alien if you meet the 183-day threshold.",
                ],
                importantNote:
                    "To claim the exemption, you must file Form 8843 every year. Without this form, the IRS may count all your days toward the test and classify you as a resident alien retroactively.",
            },
            {
                heading: "What Happens After Five Years?",
                paragraphs: [
                    "Once your five-year exempt period expires, your days in the US begin counting toward the Substantial Presence Test. If you are still on F-1 status (for example, on STEM OPT) and are present in the US for a significant portion of the year, you will likely meet the 183-day threshold and become a resident alien for tax purposes.",
                    "Becoming a resident alien has several implications. You will be taxed on your worldwide income, not just US-source income. You will need to file Form 1040 instead of 1040-NR. You will no longer be exempt from FICA taxes. However, you will gain access to the standard deduction and certain tax credits not available to nonresident aliens.",
                ],
                bulletPoints: [
                    "Days start counting toward the 183-day threshold after the exempt period",
                    "Worldwide income becomes subject to US taxation",
                    "Must file Form 1040 instead of 1040-NR",
                    "FICA exemption no longer applies",
                    "Standard deduction and additional credits become available",
                ],
            },
            {
                heading: "Closer Connection Exception",
                paragraphs: [
                    "Even after meeting the Substantial Presence Test, you may be able to maintain nonresident alien status if you can demonstrate a closer connection to a foreign country. This requires showing that your tax home is in a foreign country and that you have closer personal and economic ties to that country than to the US. You must file Form 8840 to claim this exception.",
                    "The closer connection exception is evaluated based on factors such as where your permanent home is located, where your family resides, where your personal belongings are kept, where you have bank accounts, where you hold a driver's license, and where you vote. This exception is not commonly used by F-1 students who are living and working in the US full-time, but it may apply in transitional situations.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "What Is Form 8843?", slug: "what-is-form-8843" },
            { question: "Do F-1 Students Pay FICA Taxes?", slug: "do-f1-students-pay-fica" },
            { question: "Do F-1 Students File State Taxes?", slug: "do-f1-students-file-state-taxes" },
            { question: "What Is OPT?", slug: "what-is-opt" },
        ],
        metadata: {
            title: "What Is the Substantial Presence Test? F-1 Exemption Explained | TrackMyOPT",
            description:
                "The Substantial Presence Test determines resident vs nonresident alien status. F-1 students are exempt for 5 years. Learn the formula and exemption rules.",
            keywords: [
                "Substantial Presence Test",
                "resident alien vs nonresident alien",
                "F-1 student tax status",
                "183-day rule",
                "IRS residency test",
                "Form 8843 exemption",
            ],
        },
    },
    {
        slug: "what-is-tax-treaty-f1",
        question: "What Are Tax Treaties for F-1 Students?",
        shortAnswer:
            "Tax treaties are bilateral agreements between the US and other countries that can reduce or eliminate US tax on certain types of income for F-1 students. Many treaties include specific provisions for students and trainees, such as wage exemptions, scholarship exclusions, or reduced withholding rates.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "Check the US tax treaty with your home country before filing your tax return. You may be entitled to wage exemptions, reduced withholding rates, or other benefits that could significantly reduce your tax liability.",
        sections: [
            {
                heading: "How Tax Treaties Benefit F-1 Students",
                paragraphs: [
                    "The United States has income tax treaties with more than 65 countries, and many of these agreements include provisions that specifically benefit students, scholars, and trainees. These treaty provisions can exempt a portion or all of certain types of income from US taxation, resulting in significant tax savings for eligible F-1 students.",
                    "Treaty benefits are not automatic—you must actively claim them by submitting the appropriate forms to your employer and reporting the exempt income on your tax return. The specific benefits depend entirely on which country you are from and the terms of the treaty between that country and the US.",
                    "Common treaty benefits for students include exemptions on wages up to a certain threshold, exemptions on scholarship and fellowship income, and reduced withholding rates on specific income types. Some treaties also provide exemptions from taxation on income received for maintenance, education, or training purposes.",
                ],
            },
            {
                heading: "Notable Tax Treaty Provisions by Country",
                paragraphs: [
                    "Students from China benefit from Article 20 of the US-China tax treaty, which provides an exemption on the first $5,000 of wages earned per year while studying in the US. This provision applies to wages from employment, including OPT and CPT. Students must file Form 8233 with their employer to claim reduced withholding, and report the treaty benefit on Schedule OI of Form 1040-NR.",
                    "Students from India benefit from Article 21(2) of the US-India tax treaty, which exempts scholarship and fellowship grants from US taxation. Additionally, Indian students are one of the few groups eligible to claim the standard deduction on Form 1040-NR. Students from South Korea can claim an exemption on the first $2,000 of income under Article 21 of the US-South Korea treaty.",
                ],
                bulletPoints: [
                    "China (Article 20): Up to $5,000 in wages exempt per year",
                    "India (Article 21): Scholarship/fellowship exempt; standard deduction allowed",
                    "South Korea (Article 21): Up to $2,000 in income exempt",
                    "Japan (Article 20): Payments for education/training exempt",
                    "Germany (Article 20): Payments for maintenance/education exempt",
                    "France (Article 21): Scholarship and grant income exempt",
                ],
            },
            {
                heading: "How to Claim Tax Treaty Benefits",
                paragraphs: [
                    "To claim a treaty benefit on wage withholding, you must file Form 8233 (Exemption from Withholding on Compensation for Independent Personal Services of a Nonresident Alien Individual) with your employer before or at the start of employment. This form instructs your employer to reduce or eliminate federal income tax withholding on the treaty-exempt portion of your wages.",
                    "When filing your annual tax return, you report the treaty-exempt income on Schedule OI (Other Information) of Form 1040-NR. You must include the treaty country, article number, and the amount of income claimed as exempt. Specialized tax software like Sprintax will handle this automatically if you select your country and indicate the treaty benefit.",
                ],
                importantNote:
                    "Tax treaty benefits apply only to federal taxes. State taxes follow their own rules and most states do not recognize federal tax treaties, meaning your state tax liability may not be reduced even if the treaty exempts you at the federal level.",
            },
            {
                heading: "Countries Without Student Tax Treaty Provisions",
                paragraphs: [
                    "Not all US tax treaties include provisions for students. Many countries in Latin America, Africa, Southeast Asia, and the Middle East either do not have a tax treaty with the US or have treaties that do not include student-specific articles. Students from countries like Brazil, Nigeria, Vietnam, Saudi Arabia, and many others will not have access to treaty-based wage or scholarship exemptions.",
                    "If your country does not have a student provision in its US tax treaty, your income will be taxed according to standard nonresident alien rules. You can still benefit from the FICA exemption during your first five years and deduct expenses directly related to your US-source income. Check the IRS website or consult with a tax professional to confirm whether your country's treaty includes student provisions.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist" },
            { text: "TrackMyOPT Pricing", href: "/pricing" },
        ],
        relatedQuestions: [
            { question: "Do F-1 Students Pay Taxes in the US?", slug: "do-f1-students-pay-taxes" },
            { question: "What Is Form 1040-NR?", slug: "what-is-1040-nr" },
            { question: "Do F-1 Students File State Taxes?", slug: "do-f1-students-file-state-taxes" },
            { question: "What Is STEM OPT?", slug: "what-is-stem-opt" },
        ],
        metadata: {
            title: "Tax Treaties for F-1 Students Explained | TrackMyOPT",
            description:
                "Learn how US tax treaties benefit F-1 students with wage exemptions and reduced withholding from countries like China, India, South Korea, and more.",
            keywords: [
                "tax treaty F-1 student",
                "US tax treaty international students",
                "Form 8233",
                "China tax treaty $5000",
                "India tax treaty students",
                "nonresident alien treaty benefits",
            ],
        },
    },
    {
        slug: "can-f1-students-get-ssn",
        question: "Can F-1 Students Get a Social Security Number?",
        shortAnswer:
            "Yes, F-1 students can obtain a Social Security Number (SSN) if they have employment authorization in the US, such as on-campus employment, CPT, or OPT with an approved EAD card. Students without employment authorization are not eligible for an SSN but may apply for an ITIN instead.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "Apply for your SSN as soon as you receive employment authorization. Visit your local Social Security Administration office with your passport, I-20, I-94, and employment authorization documents (EAD card or employer letter).",
        sections: [
            {
                heading: "Eligibility Requirements for F-1 Students",
                paragraphs: [
                    "The Social Security Administration (SSA) issues Social Security Numbers to F-1 students who have valid employment authorization in the United States. This authorization can come in several forms: on-campus employment authorized by your Designated School Official (DSO), Curricular Practical Training (CPT) noted on your I-20, or Optional Practical Training (OPT/STEM OPT) with an approved Employment Authorization Document (EAD card).",
                    "You cannot apply for an SSN based solely on your F-1 student status without employment authorization. If you need a tax identification number but do not have employment authorization, you should apply for an Individual Taxpayer Identification Number (ITIN) instead. The SSA will reject your application if you cannot provide proof of authorized employment.",
                    "F-2 dependents (spouses and children of F-1 students) are not eligible for SSNs because they are not authorized to work in the US. They must apply for an ITIN if they need a tax identification number for any reason.",
                ],
            },
            {
                heading: "Documents Needed to Apply",
                paragraphs: [
                    "To apply for an SSN, you must visit your local Social Security Administration office in person. The SSA does not accept online or mail applications for first-time SSN requests from noncitizens. You will need to complete Form SS-5 (Application for a Social Security Card) and bring original documents—photocopies are not accepted.",
                    "The required documents include your unexpired passport, your current I-20 showing your SEVIS number, your I-94 arrival/departure record (which you can print from the CBP website), and proof of employment authorization. For on-campus employment, this is a letter from your DSO or employer. For CPT, it is your I-20 with the CPT authorization page. For OPT, it is your EAD card.",
                ],
                bulletPoints: [
                    "Completed Form SS-5 (available at the SSA office or online)",
                    "Valid, unexpired passport",
                    "Most recent I-20 with valid SEVIS number",
                    "I-94 arrival/departure record (print from i94.cbp.dhs.gov)",
                    "Employment authorization proof: EAD card, CPT I-20 page, or employer letter for on-campus work",
                    "F-1 visa stamp (if available, though not always required)",
                ],
            },
            {
                heading: "The Application Process and Timeline",
                paragraphs: [
                    "After submitting your application at the SSA office, processing typically takes two to four weeks. The SSA will mail your Social Security card to the address you provide on the application. You will receive a nine-digit number that is permanent and stays with you for life, even if you leave the US and return later.",
                    "Some students report delays, especially if the SSA needs to verify your immigration status with USCIS through the SAVE system. If verification takes longer than expected, follow up with the SSA office after two weeks. Once issued, keep your Social Security card in a safe place—do not carry it in your wallet as it is a primary identity document.",
                ],
                importantNote:
                    "Wait at least 10 days after arriving in the US before applying for an SSN to ensure your records are updated in the SAVE database. Applying too early often results in delays or denials due to unverified immigration records.",
            },
            {
                heading: "Why You Need an SSN",
                paragraphs: [
                    "An SSN is essential for several important purposes during your time in the US. Your employer requires it for payroll processing and tax reporting. You need it to file your federal and state tax returns. It is also used to build a credit history, open certain bank accounts, and apply for a driver's license in most states.",
                    "Beyond immediate practical needs, having an SSN and building a US credit history can be valuable for future visa applications, apartment rentals, and post-graduation employment. If you transition from OPT to H-1B status, your SSN carries over and continues to serve as your primary tax identification number.",
                ],
            },
        ],
        relatedLinks: [
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist" },
            { text: "What Is an EAD Card?", href: "/features/case-status" },
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
        ],
        relatedQuestions: [
            { question: "What Is an ITIN and When Do F-1 Students Need One?", slug: "what-is-itin-for-f1" },
            { question: "What Is an EAD Card?", slug: "what-is-an-ead-card" },
            { question: "How to Apply for OPT?", slug: "how-to-apply-for-opt" },
            { question: "What Documents Are Needed for OPT Application?", slug: "what-documents-needed-for-opt" },
        ],
        metadata: {
            title: "Can F-1 Students Get a Social Security Number? | TrackMyOPT",
            description:
                "F-1 students can get an SSN with employment authorization. Learn eligibility requirements, required documents, and how to apply at the SSA office.",
            keywords: [
                "F-1 student SSN",
                "Social Security Number international student",
                "SSN application F-1",
                "OPT SSN",
                "SSA Form SS-5",
                "employment authorization SSN",
            ],
        },
    },
    {
        slug: "do-f1-students-file-state-taxes",
        question: "Do F-1 Students File State Taxes?",
        shortAnswer:
            "It depends on the state where you earned income or resided. Most states with an income tax require F-1 students to file a state tax return if they earned income in that state. However, nine states have no income tax at all, and state rules for nonresident aliens vary significantly.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "Check your state's specific rules for nonresident alien taxation. If you earned income in a state with income tax, you likely need to file a state return in addition to your federal 1040-NR.",
        sections: [
            {
                heading: "State Income Tax Overview for F-1 Students",
                paragraphs: [
                    "While federal tax rules for F-1 students are standardized by the IRS, state tax obligations vary widely across the United States. Each state has its own tax laws, filing requirements, forms, and rules regarding how nonresident aliens are treated. Understanding your state tax obligation is just as important as filing your federal return.",
                    "Your state tax filing requirement is generally determined by two factors: the state where you earned income (your source state) and the state where you reside. In most cases, these will be the same state. However, if you worked in one state while living in another—for example, commuting across state lines or working remotely—you may have filing obligations in both states.",
                    "Most states follow the federal classification of resident versus nonresident alien status, but not all. Some states treat nonresident aliens as nonresidents of the state, while others may classify you differently based on domicile or other criteria.",
                ],
            },
            {
                heading: "States with No Income Tax",
                paragraphs: [
                    "Nine states have no personal income tax, meaning F-1 students earning income in these states do not need to file a state income tax return. These states are Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. New Hampshire and Washington tax only certain types of investment income, but neither taxes wages.",
                    "If you live and work in one of these states, your only tax obligation is at the federal level. However, if you moved during the tax year or earned income in multiple states, you may still owe state taxes to a state that does impose income tax, even if your primary residence is in a no-income-tax state.",
                ],
                bulletPoints: [
                    "Alaska — no state income tax",
                    "Florida — no state income tax",
                    "Nevada — no state income tax",
                    "New Hampshire — no tax on wages",
                    "South Dakota — no state income tax",
                    "Tennessee — no tax on wages",
                    "Texas — no state income tax",
                    "Washington — no tax on wages",
                    "Wyoming — no state income tax",
                ],
            },
            {
                heading: "State Tax Treaties and Special Rules",
                paragraphs: [
                    "An important consideration is that most states do not recognize federal tax treaties. Even if you are eligible for a wage exemption under a federal tax treaty (such as the China $5,000 exemption), your state may still tax the full amount. California, New York, Massachusetts, and most other states do not conform to federal treaty provisions.",
                    "A few states do recognize federal tax treaties for state tax purposes, but this is the exception rather than the rule. Always check your specific state's position on treaty conformity. If you claimed a treaty benefit on your federal return that your state does not recognize, you will need to add the treaty-exempt income back to your state return.",
                ],
                importantNote:
                    "Federal tax treaty benefits typically do not apply at the state level. Your state tax liability may be higher than expected even if you received a treaty exemption on your federal return.",
            },
            {
                heading: "How to File State Taxes",
                paragraphs: [
                    "Filing a state tax return as a nonresident alien typically requires the state's nonresident or part-year resident tax form. In California, this is Form 540NR; in New York, it is Form IT-203; in Massachusetts, it is Form 1-NR/PY. Each state has its own form number and requirements.",
                    "Specialized nonresident alien tax software like Sprintax includes state tax filing for most states. This is often the easiest approach because the software will correctly determine your state filing obligation, apply the appropriate forms, and handle the interaction between your federal and state returns. Your university's international student office may also offer resources or workshops for state tax filing.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "TrackMyOPT Tools", href: "/tools" },
            { text: "TrackMyOPT Pricing", href: "/pricing" },
        ],
        relatedQuestions: [
            { question: "Do F-1 Students Pay Taxes in the US?", slug: "do-f1-students-pay-taxes" },
            { question: "What Are Tax Treaties for F-1 Students?", slug: "what-is-tax-treaty-f1" },
            { question: "When Is the Tax Filing Deadline for F-1 Students?", slug: "when-is-tax-deadline-for-f1" },
            { question: "Can I Travel on OPT?", slug: "can-i-travel-on-opt" },
        ],
        metadata: {
            title: "Do F-1 Students File State Taxes? State-by-State Guide | TrackMyOPT",
            description:
                "F-1 students in states with income tax must file state returns. Learn which states require filing, no-income-tax states, and how state treaties differ.",
            keywords: [
                "F-1 student state taxes",
                "international student state tax filing",
                "no income tax states",
                "state tax nonresident alien",
                "California 540NR F-1",
                "state tax treaty",
            ],
        },
    },
    {
        slug: "what-is-itin-for-f1",
        question: "What Is an ITIN and When Do F-1 Students Need One?",
        shortAnswer:
            "An ITIN (Individual Taxpayer Identification Number) is a tax processing number issued by the IRS to individuals who are required to file taxes but are not eligible for a Social Security Number. F-1 students need an ITIN if they have a tax filing obligation but do not have employment authorization or an SSN.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "Apply for an ITIN only if you need to file a tax return and cannot get an SSN. Submit Form W-7 along with your tax return and required identity documents to the IRS or an IRS-authorized Certifying Acceptance Agent.",
        sections: [
            {
                heading: "What Is an ITIN?",
                paragraphs: [
                    "An Individual Taxpayer Identification Number (ITIN) is a nine-digit number issued by the Internal Revenue Service (IRS) to individuals who need to file US tax returns but are not eligible for a Social Security Number. The ITIN begins with the number 9 and follows the format 9XX-XX-XXXX. It is used strictly for tax filing purposes and does not authorize employment or provide eligibility for Social Security benefits.",
                    "The IRS created the ITIN program to ensure that all individuals with a US tax filing obligation can comply with tax law, regardless of their immigration status or employment authorization. For F-1 students, the most common scenario requiring an ITIN is when you have taxable scholarship or fellowship income but no employment authorization that would qualify you for an SSN.",
                    "It is important to understand that an ITIN is not a substitute for an SSN. If you are eligible for an SSN (because you have employment authorization), you should apply for an SSN instead. The IRS will reject your ITIN application if you are eligible for an SSN.",
                ],
            },
            {
                heading: "When Do F-1 Students Need an ITIN?",
                paragraphs: [
                    "The most common scenario is when you receive a scholarship or fellowship that exceeds qualified tuition and required fees. The excess amount is considered taxable income and must be reported on your tax return. If you do not have employment authorization and therefore cannot obtain an SSN, you need an ITIN to file your return.",
                    "Another scenario is when you need to claim a tax treaty benefit. Some tax treaties require you to file a return and claim the benefit using a taxpayer identification number, even if the treaty ultimately exempts all your income. In this case, an ITIN allows you to file the return and claim the exemption.",
                ],
                bulletPoints: [
                    "Taxable scholarship or fellowship income with no SSN",
                    "Tax treaty benefits that require a filed return",
                    "Bank reporting requirements (Form 1099-INT)",
                    "State tax filing obligations without employment authorization",
                    "Spouse or dependent filing requirements (F-2 dependents)",
                ],
            },
            {
                heading: "How to Apply for an ITIN",
                paragraphs: [
                    "To apply for an ITIN, complete IRS Form W-7 (Application for IRS Individual Taxpayer Identification Number) and submit it along with your federal tax return and original identity documents or certified copies. The IRS accepts passports as a standalone identity document—if you include your original passport, no other documents are needed.",
                    "You can submit your application by mailing it to the IRS ITIN Operations center in Austin, Texas, or by visiting an IRS-authorized Certifying Acceptance Agent (CAA). Many universities have CAAs on campus or nearby who can verify your documents and submit the application on your behalf, which avoids the need to mail your original passport to the IRS.",
                ],
                importantNote:
                    "If you mail your passport to the IRS with your ITIN application, it may take 7 to 14 weeks to be returned. Using a Certifying Acceptance Agent allows you to keep your passport while the application is processed.",
            },
            {
                heading: "ITIN Renewal and Expiration",
                paragraphs: [
                    "ITINs expire if they are not used on a federal tax return for three consecutive years. Additionally, ITINs issued before 2013 have been subject to rolling expiration schedules. If your ITIN has expired, you must renew it before you can use it on a new tax return.",
                    "To renew an expired ITIN, file Form W-7 again with 'Renew' checked in the reason section, along with your identity documents. You do not need to attach a tax return for a renewal-only application. Processing times for renewals are similar to new applications: approximately 7 to 11 weeks if mailed, or faster through a Certifying Acceptance Agent.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "Glossary of Immigration Terms", href: "/glossary" },
            { text: "TrackMyOPT Tools", href: "/tools" },
        ],
        relatedQuestions: [
            { question: "Can F-1 Students Get a Social Security Number?", slug: "can-f1-students-get-ssn" },
            { question: "What Is Form 8843?", slug: "what-is-form-8843" },
            { question: "Do F-1 Students Pay Taxes in the US?", slug: "do-f1-students-pay-taxes" },
            { question: "What Is the SEVP Portal?", slug: "what-is-sevp-portal" },
        ],
        metadata: {
            title: "What Is an ITIN? When F-1 Students Need One | TrackMyOPT",
            description:
                "An ITIN is a tax ID for F-1 students without an SSN. Learn when you need one, how to apply using Form W-7, and the difference between ITIN and SSN.",
            keywords: [
                "ITIN international student",
                "Individual Taxpayer Identification Number",
                "Form W-7",
                "ITIN vs SSN",
                "F-1 student tax ID",
                "ITIN application process",
            ],
        },
    },
    {
        slug: "when-is-tax-deadline-for-f1",
        question: "When Is the Tax Filing Deadline for F-1 Students?",
        shortAnswer:
            "The federal tax filing deadline for F-1 students filing Form 1040-NR is April 15. Form 8843 (required even with no income) is due June 15 if filed independently. Students outside the US on April 15 with no US wages may qualify for an automatic extension to June 15.",
        lastUpdated: "February 2026",
        category: "tax-finance",
        categoryLabel: "Tax & Finance",
        keyTakeaway:
            "Mark April 15 on your calendar for filing Form 1040-NR, and June 15 for Form 8843 if you had no income. File early to avoid penalties, and request an extension using Form 4868 if you need more time.",
        sections: [
            {
                heading: "Federal Tax Filing Deadlines",
                paragraphs: [
                    "F-1 students who earned US-source income must file Form 1040-NR by April 15 of the year following the tax year. For the 2025 tax year, the deadline is April 15, 2026. This is the same deadline that applies to US citizens and residents filing Form 1040, though the forms and rules differ significantly.",
                    "If you did not earn any US-source income but were present in the US during the tax year, you must still file Form 8843. When Form 8843 is your only filing obligation (no income to report), the deadline is June 15. This extended deadline recognizes that students with no income may not be aware of their filing obligation as early.",
                    "When you file Form 1040-NR and Form 8843 together (because you had income), both forms should be submitted by the April 15 deadline. Form 8843 is attached to your 1040-NR as part of the complete return.",
                ],
            },
            {
                heading: "Extensions and Special Circumstances",
                paragraphs: [
                    "If you cannot file by April 15, you can request an automatic six-month extension by filing Form 4868 (Application for Automatic Extension of Time to File U.S. Individual Income Tax Return) by the April 15 deadline. This extends your filing deadline to October 15 but does not extend the deadline for paying any taxes owed. Interest and penalties accrue on unpaid taxes from April 15.",
                    "If you are outside the United States on April 15 and your primary income is not subject to US wage withholding, you may qualify for an automatic two-month extension to June 15 without filing Form 4868. To use this provision, attach a statement to your return explaining that you were outside the US on the regular due date. Note that interest on unpaid taxes still accrues from April 15, even with this extension.",
                ],
                bulletPoints: [
                    "April 15: Deadline for Form 1040-NR (with income)",
                    "June 15: Deadline for Form 8843 (no income, filed separately)",
                    "October 15: Extended deadline if Form 4868 is filed by April 15",
                    "June 15: Automatic extension if outside US on April 15 with no US wages",
                ],
                importantNote:
                    "An extension to file is not an extension to pay. If you owe taxes, you must estimate and pay the amount due by April 15 to avoid interest and penalties.",
            },
            {
                heading: "State Tax Filing Deadlines",
                paragraphs: [
                    "State tax filing deadlines generally mirror the federal April 15 deadline, but this is not universal. Some states have different deadlines or offer different extension rules. For example, Virginia's deadline is May 1, and some states automatically extend the deadline if you receive a federal extension.",
                    "Check your state's department of revenue or taxation website for the specific deadline and extension procedures. If you earned income in multiple states, you may need to track multiple deadlines. Filing state returns is typically easier after completing your federal return, since state forms often reference your federal adjusted gross income.",
                ],
            },
            {
                heading: "Penalties for Late Filing",
                paragraphs: [
                    "Filing your tax return late can result in penalties and interest charges. The failure-to-file penalty is typically 5% of the unpaid tax for each month or part of a month the return is late, up to a maximum of 25%. The failure-to-pay penalty is 0.5% of the unpaid tax per month. Interest is charged on both unpaid taxes and penalties.",
                    "If you are due a refund, there is no penalty for filing late—but there is a time limit. You generally have three years from the original due date to file and claim your refund. After three years, the refund is forfeited. Many F-1 students are due refunds because of over-withholding by employers, so filing promptly is in your financial interest even if you are not worried about penalties.",
                ],
            },
        ],
        relatedLinks: [
            { text: "F-1 Student Tax Filing Guide", href: "/blog/f1-student-tax-filing-guide-2026" },
            { text: "F-1 Tax Filing Walkthrough", href: "/guides/f1-tax-filing" },
            { text: "OPT Application Checklist", href: "/blog/opt-application-checklist" },
            { text: "TrackMyOPT Tools", href: "/tools" },
        ],
        relatedQuestions: [
            { question: "What Is Form 1040-NR?", slug: "what-is-1040-nr" },
            { question: "What Is Form 8843?", slug: "what-is-form-8843" },
            { question: "Do F-1 Students File State Taxes?", slug: "do-f1-students-file-state-taxes" },
            { question: "What Is OPT?", slug: "what-is-opt" },
        ],
        metadata: {
            title: "Tax Filing Deadlines for F-1 Students | TrackMyOPT",
            description:
                "F-1 students must file Form 1040-NR by April 15 and Form 8843 by June 15. Learn about extensions, state deadlines, and late filing penalties.",
            keywords: [
                "F-1 tax deadline",
                "1040-NR filing deadline",
                "Form 8843 deadline",
                "international student tax deadline",
                "tax extension F-1",
                "April 15 tax deadline",
                "Form 4868 extension",
            ],
        },
    },
];
