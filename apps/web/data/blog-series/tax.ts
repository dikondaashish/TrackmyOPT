import { defineArticle, source } from './shared';

const taxRelated = [
  {
    label: 'F-1 student tax filing guide',
    href: '/blog/f1-student-tax-filing-guide-2026',
  },
  { label: 'OPT tax tools', href: '/features/tax-filing' },
  {
    label: 'FICA exemption guide',
    href: '/blog/f1-opt-stem-opt-tax-filing-mistakes',
  },
];

export const taxArticles = [
  defineArticle({
    slug: 'form-8843-f1-students-zero-income',
    title: 'Form 8843 for F-1 Students: Who Must File Even with Zero Income',
    description:
      'Many F-1 students who are nonresident aliens must send Form 8843 for each tax year even when they had no U.S. income and do not owe federal tax.',
    category: 'F-1 Taxes',
    tags: ['Form 8843', 'Zero Income', 'Nonresident Alien', 'F-1'],
    readTime: '9 min read',
    cta: 'opt-timeline',
    directAnswer:
      'An F-1 student who is treated as an exempt individual for the substantial presence test generally files Form 8843 to explain the days excluded from that test—even with no income and no Form 1040-NR requirement. Each F-2 dependent generally files a separate Form 8843. If you file 1040-NR, attach it; if Form 8843 is the only form, mail it to the address in the current instructions by the applicable deadline.',
    keyTakeaways: [
      '‘Exempt individual’ usually means days are excluded from the presence test—not exemption from all tax.',
      'No-income students can still have a Form 8843 filing obligation.',
      'Each spouse or child files their own form.',
    ],
    sections: [
      {
        heading: 'Why Form 8843 Exists',
        paragraphs: [
          'The substantial presence test counts days in the United States, but qualifying F, J, M, and Q individuals can exclude certain days for a limited period. Form 8843 provides the information supporting that exclusion.',
          'For F students, the commonly discussed five-calendar-year period is counted by calendar years, not five 365-day blocks. Prior F/J/M/Q years can matter.',
        ],
        bullets: [
          'Identify visa/status history',
          'Count calendar years in exempt status',
          'Provide school and program information',
          'Explain any claimed closer-connection exception when applicable',
        ],
      },
      {
        heading: 'How to File with or without Income',
        paragraphs: [
          'If a nonresident return is required, attach Form 8843 to Form 1040-NR. If no return is required, complete the relevant identification and student sections and mail the standalone form using the current address. Keep a signed copy and proof of mailing.',
          'Tax software eligibility varies. Do not use ordinary resident software merely because it is free or because a friend used it.',
        ],
        note: 'Make a tax-status timeline before opening software: every U.S. entry year, visa category, and prior exempt year. That prevents the most common residency mistake.',
      },
      {
        heading: 'When to Get Professional Help',
        paragraphs: [
          'Seek a nonresident-tax professional for prior missed forms, dual-status years, income in multiple states, treaty positions, or prior resident returns filed incorrectly. Immigration status and tax residency use different definitions.',
        ],
      },
    ],
    checklist: [
      'List every calendar year previously present in F/J/M/Q status.',
      'Determine whether Form 1040-NR is also required.',
      'Prepare one Form 8843 per family member.',
      'Keep the signed form and mailing proof.',
    ],
    mistakes: [
      'Assuming zero income means zero filing.',
      'Combining a spouse or child on one Form 8843.',
      'Calling exempt days a general income-tax exemption.',
    ],
    faq: [
      {
        question: 'Do F-1 students with no income file Form 8843?',
        answer:
          'Many nonresident F-1 students do, because the form supports exclusion of days from the substantial presence test.',
      },
      {
        question: 'Can I e-file Form 8843 by itself?',
        answer:
          'Standalone e-filing is not universally available; follow the current IRS instructions and approved software capabilities.',
      },
      {
        question: 'Do F-2 dependents file Form 8843?',
        answer:
          'Generally, each qualifying dependent files a separate form, including minors.',
      },
    ],
    sources: [source.form8843, source.pub519],
    related: taxRelated,
  }),
  defineArticle({
    slug: 'fica-tax-refund-f1-opt-forms-843-8316',
    title:
      'FICA Tax Refund for F-1 and OPT Workers: Forms 843 and 8316, Documents, and Deadlines',
    description:
      'If Social Security and Medicare taxes were withheld from exempt F-1 wages, first request an employer refund; if unsuccessful, prepare an IRS claim with Forms 843 and 8316.',
    category: 'OPT Taxes',
    tags: ['FICA Refund', 'Form 843', 'Form 8316', 'OPT'],
    readTime: '12 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A nonresident F-1 student may be exempt from Social Security and Medicare tax on wages for services permitted by the F-1 status, including qualifying OPT work. Ask the employer to refund and correct the payroll reporting first. If it will not, file Form 843 with Form 8316 and the supporting records requested by the IRS. Resident aliens for tax and work not authorized or not connected to the status may not qualify for the student FICA exemption.',
    keyTakeaways: [
      'The FICA exemption depends on tax residency and the nature of authorized employment.',
      'Employer correction is the first step.',
      'Federal income-tax withholding is not claimed through the FICA refund process.',
    ],
    sections: [
      {
        heading: 'Confirm That the Withholding Was Actually Wrong',
        paragraphs: [
          'Review paystubs for Social Security and Medicare lines, then determine tax residency for the year. A student who has become a resident alien under the substantial presence test may owe FICA even while still in F-1 immigration status.',
          'Confirm the work was authorized and performed to carry out the purpose of the visa, and separate FICA from federal and state income taxes.',
        ],
        bullets: [
          'Nonresident-alien status for tax purposes',
          'Authorized F-1/OPT employment',
          'Social Security and Medicare actually withheld',
          'No other exception that makes FICA due',
        ],
      },
      {
        heading: 'Employer Request Before IRS Claim',
        paragraphs: [
          'Send payroll a written request identifying the affected pay periods and attach the visa, I-94, I-20/EAD, and tax-residency explanation as appropriate. Ask for a refund and corrected wage statement.',
          'If the employer refuses or does not respond, preserve that correspondence. The IRS package generally includes Form 843, Form 8316, W-2, pay records, status documents, and proof you first sought reimbursement.',
        ],
        note: 'Match the exact Social Security and Medicare amounts across paystubs and W-2 boxes. A refund claim with unexplained totals is easy to delay.',
      },
      {
        heading: 'Deadline and Tracking',
        paragraphs: [
          'Refund claims are subject to limitation periods, commonly the later of three years from filing the return or two years from paying the tax, with important details. File early, use the current instructions and address, and keep delivery proof. IRS processing can be lengthy.',
        ],
      },
    ],
    checklist: [
      'Determine nonresident or resident tax status for the wage year.',
      'Ask the employer for refund and correction in writing.',
      'Reconcile W-2 and paystub FICA amounts.',
      'Assemble Forms 843 and 8316 with required evidence.',
    ],
    mistakes: [
      'Claiming federal income tax on Form 843 as FICA.',
      'Skipping the employer-refund request.',
      'Assuming every F-1 worker remains FICA-exempt forever.',
    ],
    faq: [
      {
        question: 'Are all OPT wages exempt from FICA?',
        answer:
          'No. The common exemption applies to qualifying nonresident students and authorized work connected to status; tax residents generally pay FICA.',
      },
      {
        question: 'What is Form 8316?',
        answer:
          'It is information supporting a claim for refund of Social Security and Medicare tax withheld from certain foreign students and other nonimmigrants.',
      },
      {
        question: 'How long does an IRS FICA refund take?',
        answer:
          'No reliable universal timeline exists. Preserve proof and follow IRS procedures for inquiries.',
      },
    ],
    sources: [source.fica, source.form843],
    related: taxRelated,
  }),
  defineArticle({
    slug: '1040nr-vs-1040-five-calendar-year-rule-f1',
    title:
      'Form 1040-NR vs Form 1040: The Five-Calendar-Year Rule for F-1 Students',
    description:
      'F-1 immigration status does not choose your tax return. The substantial presence test, exempt student years, elections, and treaty positions determine 1040-NR versus 1040.',
    category: 'F-1 Taxes',
    tags: ['1040-NR', '1040', 'Five-Year Rule', 'Tax Residency'],
    readTime: '12 min read',
    cta: 'opt-timeline',
    directAnswer:
      'F-1 students generally exclude U.S. days from the substantial presence test during their first five calendar years as qualifying exempt individuals. After that, days usually count unless an exception applies. If you remain a nonresident alien, Form 1040-NR is generally the federal income-tax return; if you become a resident alien for tax, Form 1040 generally applies. Count calendar years touched—not exactly sixty months—and include prior F/J/M/Q history.',
    keyTakeaways: [
      'The five-year rule concerns day counting, not the length of F-1 status.',
      'Arriving on December 31 can use one calendar year.',
      'A wrong resident return can also produce an incorrect standard deduction or credit claim.',
    ],
    sections: [
      {
        heading: 'Build the Residency Calculation',
        paragraphs: [
          'List each calendar year present in the United States and the visa category used. Mark years whose days were excluded as a student or teacher/trainee, then apply the substantial presence formula to countable days in the current and prior two years.',
          'Do not assume an OPT year is separate; OPT remains F-1 status for this analysis, but the calendar-year limit continues.',
        ],
        bullets: [
          'Current-year countable days',
          'One-third of prior-year countable days',
          'One-sixth of second-prior-year countable days',
          'Any treaty, closer-connection, or first-year election issue',
        ],
      },
      {
        heading: 'Why the Form Choice Matters',
        paragraphs: [
          'Residents and nonresidents face different income scope, deductions, credits, filing status, and information-reporting rules. A Form 1040 prepared by generic software can look favorable while being legally wrong for a nonresident.',
          'Some students cross residency midyear and face a dual-status return. That is a good reason to use a professional familiar with international returns.',
        ],
        note: "Your university's tax software code is not proof of residency. Keep the calculation worksheet that explains why the chosen return is correct.",
      },
      {
        heading: 'Correcting a Prior Wrong Return',
        paragraphs: [
          'Do not simply file both forms. Determine the correct amended-return procedure for the year, attach explanations and required international forms, and evaluate whether treaty, FICA, or state returns also change.',
        ],
      },
    ],
    checklist: [
      'List every U.S. presence calendar year and visa category.',
      'Calculate the substantial presence test using only countable days.',
      'Check treaty and closer-connection issues.',
      'Use software that supports your actual residency.',
    ],
    mistakes: [
      'Counting five years from an anniversary date.',
      'Assuming OPT restarts the exemption.',
      'Filing Form 1040 to claim credits unavailable to a nonresident.',
    ],
    faq: [
      {
        question: 'Does five calendar years mean 1,825 days?',
        answer:
          'No. Any part of a calendar year can count as one of the five student-exempt years.',
      },
      {
        question: 'Do OPT years count toward the five?',
        answer:
          'Yes. OPT is part of F-1 status and does not reset the calendar-year count.',
      },
      {
        question: 'Can an F-1 student file Form 1040?',
        answer:
          'Yes, if the student is a resident alien for tax or another valid rule/election applies; immigration status alone does not decide.',
      },
    ],
    sources: [source.pub519, source.form8843],
    related: taxRelated,
  }),
  defineArticle({
    slug: 'resident-alien-tax-still-f1-immigration',
    title:
      '‘Resident Alien for Tax’ but Still F-1 for Immigration: How Both Can Be True',
    description:
      'Tax residency and immigration status are separate legal classifications. An F-1 student can become a resident alien for federal tax while remaining in valid F-1 status.',
    category: 'F-1 Taxes',
    tags: ['Resident Alien', 'F-1 Status', 'Substantial Presence Test'],
    readTime: '9 min read',
    cta: 'opt-timeline',
    directAnswer:
      '‘Resident alien for tax purposes’ is an IRS classification based primarily on the green card test or substantial presence test. F-1 status is a DHS immigration classification based on admission, SEVIS, study, and authorized employment. After the student-exempt calendar years end, an F-1 student may meet the tax test and file like a U.S. tax resident while still needing an I-20, maintaining SEVIS, and following OPT rules.',
    keyTakeaways: [
      'Tax residency does not grant a green card or immigration residence.',
      'Immigration status does not guarantee nonresident tax treatment.',
      'The same person can have two different labels for two different legal systems.',
    ],
    sections: [
      {
        heading: 'Two Agencies, Two Questions',
        paragraphs: [
          'The IRS asks how U.S. income and reporting rules apply. DHS asks whether the student was admitted and continues to comply with F-1 conditions. The shared word ‘resident’ causes confusion, but it does not merge the tests.',
          'Be precise in forms: ‘resident alien for tax purposes’ is not an admission that you abandoned a foreign residence or acquired permanent residence.',
        ],
        bullets: [
          'IRS: income tax, FICA, worldwide-income and reporting questions',
          'DHS/State: status, visa, SEVIS, study, and employment authorization',
          'State tax agencies: their own residency rules',
        ],
      },
      {
        heading: 'What Changes When Tax Residency Changes',
        paragraphs: [
          'Form 1040 may replace 1040-NR, worldwide income and foreign-account reporting can become relevant, and the student FICA exemption may end. Treaty benefits may change or continue only under specific saving-clause exceptions.',
          'None of that authorizes employment outside F-1 rules or removes OPT unemployment limits.',
        ],
        note: 'Keep separate folders titled ‘Immigration status’ and ‘Tax residency.’ Mixing the documents is how people send an EAD to answer an IRS question—or a 1040 to answer a status question.',
      },
      {
        heading: 'State Taxes Add a Third Definition',
        paragraphs: [
          'States can use domicile, statutory residence, or other tests that do not follow the federal result. Review every state where you lived or worked.',
        ],
      },
    ],
    checklist: [
      'Calculate federal residency annually.',
      'Review FICA treatment with payroll after residency changes.',
      'Evaluate worldwide-income and information-reporting duties.',
      'Continue all F-1/SEVIS compliance independently.',
    ],
    mistakes: [
      'Calling tax residency a green card.',
      'Assuming a resident Form 1040 permits unrestricted work.',
      'Ignoring state residency rules.',
    ],
    faq: [
      {
        question: 'Does filing Form 1040 violate F-1 status?',
        answer:
          'Not when Form 1040 is the correct return under tax law. The filing reflects tax residency, not a status change.',
      },
      {
        question: 'Do tax residents still need an I-20?',
        answer: 'Yes, if they remain in F-1 status.',
      },
      {
        question:
          'Does becoming a tax resident end the student FICA exemption?',
        answer:
          'Generally, resident-alien students do not qualify for the nonresident F-1 FICA exemption, though another exception may apply.',
      },
    ],
    sources: [source.pub519, source.fica],
    related: taxRelated,
  }),
  defineArticle({
    slug: 'f1-opt-form-w4-nonresident-alien',
    title:
      'How F-1 and OPT Workers Should Complete Form W-4 as Nonresident Aliens',
    description:
      'Nonresident employees generally complete Form W-4 using the ordinary form plus special adjustments in IRS Notice 1392. Treaty withholding is handled separately.',
    category: 'OPT Taxes',
    tags: ['Form W-4', 'Nonresident Alien', 'OPT Payroll'],
    readTime: '10 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A nonresident-alien F-1 or OPT employee completes the current Form W-4 and applies the additional instructions in IRS Notice 1392. The special rules can affect filing status, Step 4 income adjustments, and withholding calculations. Do not claim exempt unless you satisfy the narrow W-4 conditions. Income-tax treaty wage exemptions are generally claimed through Form 8233, not by improvising on W-4.',
    keyTakeaways: [
      'W-4 controls withholding, not final tax liability.',
      'Notice 1392 supplements the form for nonresident employees.',
      'FICA and federal income-tax withholding are separate payroll questions.',
    ],
    sections: [
      {
        heading: 'Before Completing the Form',
        paragraphs: [
          'Determine whether you are a resident or nonresident for the payroll year. Review the current W-4 and Notice 1392 together because ordinary instructions alone can produce underwithholding for nonresidents.',
          "Provide accurate identity information and follow the notice's special entries. Revisit the form after a residency change, marriage, second job, or major income change.",
        ],
        bullets: [
          'Tax residency for the current calendar year',
          'Expected wages and other income',
          'Multiple jobs',
          'Treaty eligibility and required separate forms',
        ],
      },
      {
        heading: 'Treaty, FICA, and W-4 Are Different',
        paragraphs: [
          'A treaty wage exemption may require Form 8233 and employer acceptance. A FICA exemption affects Social Security and Medicare. W-4 estimates federal income-tax withholding. Payroll must analyze each line separately.',
          'Check the first paystub rather than waiting for the W-2.',
        ],
        note: 'Ask payroll three separate questions: federal income tax, Social Security, and Medicare. ‘My taxes look wrong’ is too broad to troubleshoot.',
      },
      {
        heading: 'Avoid the ‘Exempt’ Checkbox Trap',
        paragraphs: [
          'Claiming exempt generally requires no federal income-tax liability in the prior year and an expectation of none in the current year. Visa status or a tax treaty does not automatically satisfy that statement.',
        ],
      },
    ],
    checklist: [
      'Determine current-year tax residency.',
      'Use the current W-4 and Notice 1392.',
      'Submit Form 8233 separately if claiming an eligible treaty exemption.',
      'Audit the first paystub and year-to-date totals.',
    ],
    mistakes: [
      'Writing NRA on an outdated line without current instructions.',
      'Claiming exempt because you are an international student.',
      'Treating FICA exemption as zero federal withholding.',
    ],
    faq: [
      {
        question:
          'Can a nonresident alien claim the standard W-4 filing status?',
        answer:
          'Notice 1392 provides the special filing-status and adjustment instructions; follow its current wording.',
      },
      {
        question: 'Do I use W-4 for a tax treaty?',
        answer:
          'Employment-income treaty claims are generally made on Form 8233 with required statements, not solely through W-4.',
      },
      {
        question: 'Should I update W-4 after becoming a tax resident?',
        answer:
          'Yes, review withholding when residency or personal circumstances change.',
      },
    ],
    sources: [source.nraW4, source.pub519],
    related: taxRelated,
  }),
  defineArticle({
    slug: 'tax-treaty-indian-chinese-f1-students',
    title:
      'U.S. Tax Treaty Benefits for Indian and Chinese F-1 Students: What You Can Actually Claim',
    description:
      'India and China treaty benefits differ by income type, residency, time limits, and saving-clause rules. Nationality alone does not create an automatic refund.',
    category: 'F-1 Taxes',
    tags: ['Tax Treaty', 'India', 'China', 'F-1 Students'],
    readTime: '12 min read',
    cta: 'opt-timeline',
    directAnswer:
      'Indian F-1 students commonly examine Article 21(2) of the U.S.–India treaty, which can allow the same standard deduction as U.S. students for qualifying nonresident students and business apprentices. Chinese F-1 students commonly examine Article 20, which can exempt up to $5,000 of qualifying compensation for personal services under its conditions. The benefits are not interchangeable, may require Form 8233 or return disclosure, and depend on treaty residence and income type.',
    keyTakeaways: [
      'Use the treaty article, not a nationality-based tax tip.',
      'Scholarship and wage provisions can have different limits.',
      'A treaty benefit may survive a tax-residency change only if a saving-clause exception allows it.',
    ],
    sections: [
      {
        heading: 'India and China Are Not the Same Rule',
        paragraphs: [
          'For qualifying Indian nonresident students, the frequently used benefit is a standard-deduction provision, not a blanket $5,000 wage exclusion. For qualifying Chinese students, Article 20 includes a limited personal-services benefit commonly described as up to $5,000, alongside separate scholarship/remittance language.',
          'Read the treaty text and technical explanation for the specific year and facts. OPT wages can raise questions about whether the services and time remain within the article.',
        ],
        bullets: [
          'Country of treaty residence',
          'Income type: wages, scholarship, grant, or remittance',
          'Time and purpose conditions',
          'Required withholding and return forms',
        ],
      },
      {
        heading: 'How Benefits Are Claimed',
        paragraphs: [
          'A wage exemption is commonly presented to the employer on Form 8233 with a required statement. A deduction or return position may be claimed on Form 1040-NR. Form 8833 disclosure can apply in some treaty-based positions, subject to exceptions.',
          'Keep the treaty article, arrival history, I-20, compensation records, and employer response.',
        ],
        note: 'Treaty claims should be explainable in one sentence with an article number. If the explanation is only ‘students from my country get a refund,’ stop and verify.',
      },
      {
        heading: 'When the Benefit Stops or Changes',
        paragraphs: [
          "Tax residency, time limits, a change from study to another purpose, or income outside the article can change treatment. Recalculate each year rather than carrying forward last year's software answer.",
        ],
      },
    ],
    checklist: [
      'Identify the exact treaty article and income type.',
      'Verify treaty residence and time conditions.',
      'Use Form 8233 or the correct return treatment.',
      'Keep documentation supporting the claim.',
    ],
    mistakes: [
      'Giving Indian students the Chinese $5,000 rule.',
      'Claiming a treaty based only on citizenship.',
      'Assuming every scholarship or OPT wage is exempt.',
    ],
    faq: [
      {
        question: 'Do Indian F-1 students get a $5,000 wage exemption?',
        answer:
          'That is not the common India treaty student benefit; qualifying Indian nonresidents typically examine the standard-deduction provision.',
      },
      {
        question: 'Do Chinese students automatically receive $5,000 tax free?',
        answer:
          'No. Article 20 conditions, treaty residence, income type, and proper claiming procedures apply.',
      },
      {
        question: 'Can a resident alien still claim a student treaty benefit?',
        answer:
          'Sometimes a saving-clause exception preserves a benefit, but this requires article-specific analysis.',
      },
    ],
    sources: [source.treaty, source.pub519],
    related: taxRelated,
  }),
  defineArticle({
    slug: 'opt-taxes-moving-states-part-year-multistate',
    title:
      'OPT Taxes After Moving States: Part-Year and Multi-State Filing Guide',
    description:
      "Moving for an OPT job can create resident, part-year resident, and nonresident state returns. Track work location and domicile evidence, not only the employer's headquarters.",
    category: 'OPT Taxes',
    tags: ['State Taxes', 'Part-Year Return', 'Multi-State', 'OPT'],
    readTime: '11 min read',
    cta: 'opt-timeline',
    directAnswer:
      'An OPT worker who moves states may need a part-year resident return in the old state, a part-year resident return in the new state, and sometimes a nonresident return where work was physically performed or withholding occurred. Each state defines residence and income sourcing separately. Record the move date, physical workdays, addresses, leases, payroll withholding, and domicile actions before preparing the returns.',
    keyTakeaways: [
      'Federal tax residency does not decide state residency.',
      'Remote work is often sourced to the place services are physically performed, with state-specific exceptions.',
      'A W-2 state box can be wrong and still require correction rather than blind filing.',
    ],
    sections: [
      {
        heading: 'Build a State-by-State Timeline',
        paragraphs: [
          "List every overnight location, actual work location, permanent address, lease, driver's license, and payroll state. Mark the date you left the old home and established the new one. States may look at domicile and statutory day-count tests.",
          "Then allocate wages using pay periods or workdays under each state's instructions. Employer headquarters alone rarely answers the sourcing question.",
        ],
        bullets: [
          'Old-state residency end',
          'New-state residency start',
          'Physical workdays by location',
          'Withholding by state',
          'Reciprocity or credit-for-taxes-paid rules',
        ],
      },
      {
        heading: 'Remote and Hybrid Work',
        paragraphs: [
          'A remote employee may owe tax where the work was physically performed. Some states use convenience-of-the-employer rules that can source remote wages back to the employer state. This can create two-state filing and a resident credit analysis.',
          'Tell payroll promptly after moving and review each paystub.',
        ],
        note: 'Keep a simple work-location calendar. Six months later, memory is weaker than a dated calendar and travel receipts.',
      },
      {
        heading: 'Correcting Withholding',
        paragraphs: [
          'Ask payroll for a corrected W-2 when employer records are factually wrong. If tax was validly withheld to a nonresident state but exceeds liability, the nonresident return may claim the refund while the resident state taxes the income and may provide a credit.',
        ],
      },
    ],
    checklist: [
      'Record the exact move and work-location dates.',
      'Update payroll and address records.',
      "Read each state's residency and sourcing instructions.",
      'Reconcile W-2 state wages and withholding.',
    ],
    mistakes: [
      'Filing only where the employer is headquartered.',
      'Assuming F-1 status makes you a state nonresident.',
      'Ignoring remote workdays in another state.',
    ],
    faq: [
      {
        question:
          'Can I be a state resident while a federal nonresident alien?',
        answer:
          'Yes. State residency definitions can differ from federal tax residency.',
      },
      {
        question: 'Do I file in both states after a move?',
        answer:
          'Often part-year returns are required in each, but the facts and state rules control.',
      },
      {
        question: 'Where are remote OPT wages taxed?',
        answer:
          "Usually where services are performed, subject to each state's sourcing and convenience rules.",
      },
    ],
    sources: [source.stateTax, source.pub519],
    related: taxRelated,
  }),
  defineArticle({
    slug: 'f1-scholarship-fellowship-assistantship-stipend-taxes',
    title:
      'Scholarship, Fellowship, Assistantship, and Stipend Taxes for F-1 Students',
    description:
      'The label on a university payment does not determine tax. Tuition scholarships, living stipends, research fellowships, and assistantship wages can receive different treatment.',
    category: 'F-1 Taxes',
    tags: ['Scholarship Tax', 'Fellowship', 'Assistantship', 'Stipend'],
    readTime: '12 min read',
    cta: 'opt-timeline',
    directAnswer:
      'A qualified scholarship used for tuition and required fees, books, supplies, and equipment may be excludable under the applicable rules, while amounts for room, board, travel, optional equipment, or services can be taxable. An assistantship payment tied to teaching or research services is generally compensation, even if the university calls it a stipend. Nonresident students must also evaluate withholding, Forms W-2 or 1042-S, and any treaty article.',
    keyTakeaways: [
      'Substance and use of funds matter more than the word ‘stipend.’',
      'Service-required payments are generally wages.',
      'Form 1042-S can report taxable scholarship or treaty-exempt income and should not be ignored.',
    ],
    sections: [
      {
        heading: 'Classify Each Payment',
        paragraphs: [
          'Read the award letter and identify whether payment requires teaching, research, or another service. Separate tuition remission from cash paid for living costs. Keep bursar statements and receipts for required books or equipment.',
          'A single award can contain both qualified and taxable portions. Do not classify the full amount from the name on one bank deposit.',
        ],
        bullets: [
          'Tuition and required enrollment fees',
          'Required books, supplies, and equipment',
          'Room, board, travel, and living allowance',
          'Teaching/research services',
          'Treaty-exempt or taxable scholarship reporting',
        ],
      },
      {
        heading: 'Match the Tax Documents',
        paragraphs: [
          "W-2 usually signals compensation. Form 1042-S can report scholarship, fellowship, or treaty-exempt amounts with an income code. Form 1098-T is primarily an education-credit information statement and may not establish a nonresident's taxable amount.",
          'Reconcile documents with the award and actual use of funds before filing.',
        ],
        note: 'Create one row per payment source: purpose, service required, form received, qualified expense, taxable amount, and treaty article.',
      },
      {
        heading: 'Assistantships and FICA',
        paragraphs: [
          'Assistantship wages may be exempt from FICA under the student-employee exception or the nonresident F-1 rule, depending on enrollment, tax residency, and employment. This is a separate analysis from whether wages are subject to income tax.',
        ],
      },
    ],
    checklist: [
      'Collect award letters, bursar statements, W-2, and 1042-S.',
      'Separate service compensation from scholarship.',
      'Document qualified educational expenses.',
      'Check treaty and FICA treatment separately.',
    ],
    mistakes: [
      'Treating every stipend as tax free.',
      'Ignoring a Form 1042-S because no W-2 arrived.',
      'Claiming room and board as qualified scholarship expense.',
    ],
    faq: [
      {
        question: 'Is a PhD stipend taxable?',
        answer:
          'Often at least partly. Treatment depends on whether it pays for services and how scholarship funds are used.',
      },
      {
        question: 'Is tuition remission taxable?',
        answer:
          'It may be excludable under qualified scholarship or educational-assistance rules, but program and service conditions matter.',
      },
      {
        question: 'What if both W-2 and 1042-S report university payments?',
        answer:
          'They may represent different portions. Reconcile them rather than entering the same income twice.',
      },
    ],
    sources: [source.scholarship, source.pub519, source.treaty],
    related: taxRelated,
  }),
] as const;
