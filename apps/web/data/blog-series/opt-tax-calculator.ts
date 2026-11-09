import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// Google autocomplete for "opt tax" shows "opt tax calculator", "opt tax
// percentage", "opt tax exemption", "opt tax rate" and "opt taxes in texas".
// Rules and numbers were checked on 2026-11-09 against Rev. Proc. 2025-32
// (2026 rate tables and standard deduction), IR-2025-103, Pub. 519 (2025),
// Pub. 15-T (2026), Notice 1392, Pub. 901, IRS Topic 751, the IRS foreign
// student FICA page, 26 U.S.C. 3121(b)(19) and official state revenue pages.
// Only seven no-wage-tax states could be confirmed on a state site that day;
// the list names those seven and no others. Worked examples are estimates of
// annual federal liability, not payroll withholding.

const src = {
  revProc: {
    label: 'Revenue Procedure 2025-32: 2026 tax rate tables (section 4.01) and standard deduction (section 4.14)',
    publisher: 'IRS',
    url: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf',
  },
  release: {
    label: 'IR-2025-103: IRS releases tax inflation adjustments for tax year 2026',
    publisher: 'IRS',
    url: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill',
  },
  ficaStudents: {
    label: 'Foreign student liability for Social Security and Medicare taxes',
    publisher: 'IRS',
    url: 'https://www.irs.gov/individuals/international-taxpayers/foreign-student-liability-for-social-security-and-medicare-taxes',
  },
  usc3121: {
    label: '26 U.S.C. 3121(b)(19): services of F, J, M and Q nonresident aliens excluded from FICA employment',
    publisher: 'Legal Information Institute (U.S. Code text)',
    url: 'https://www.law.cornell.edu/uscode/text/26/3121',
  },
  p519: {
    label: 'Publication 519 (2025), U.S. Tax Guide for Aliens',
    publisher: 'IRS',
    url: 'https://www.irs.gov/publications/p519',
  },
  n1392: {
    label: 'Notice 1392, Supplemental Form W-4 Instructions for Nonresident Aliens',
    publisher: 'IRS',
    url: 'https://www.irs.gov/pub/irs-pdf/n1392.pdf',
  },
  p15t: {
    label: 'Publication 15-T (2026), Withholding Adjustment for Nonresident Alien Employees',
    publisher: 'IRS',
    url: 'https://www.irs.gov/publications/p15t',
  },
  p901: {
    label: 'Publication 901, U.S. Tax Treaties (students and apprentices: China and India)',
    publisher: 'IRS',
    url: 'https://www.irs.gov/publications/p901',
  },
  tc751: {
    label: 'Topic no. 751, Social Security and Medicare withholding rates',
    publisher: 'IRS',
    url: 'https://www.irs.gov/taxtopics/tc751',
  },
  texas: {
    label: 'Texas does not have a personal income tax (Fiscal Notes)',
    publisher: 'Texas Comptroller of Public Accounts',
    url: 'https://comptroller.texas.gov/economy/fiscal-notes/archive/2016/february/starting.php',
  },
  florida: {
    label: 'The State of Florida does not have a personal income tax',
    publisher: 'Florida Department of Revenue',
    url: 'https://floridarevenue.com/taxes/compliance/Pages/violations.aspx',
  },
  washington: {
    label: 'Hiring employees: Washington does not have a personal income tax',
    publisher: 'Washington State Department of Revenue',
    url: 'https://dor.wa.gov/manage-business/grow-business/hiring-employees',
  },
  nevada: {
    label: 'Income Tax in Nevada',
    publisher: 'Nevada Department of Taxation',
    url: 'https://tax.nv.gov/about-nevada-department-of-taxation/income-tax-in-nevada/',
  },
  newHampshire: {
    label: 'Interest and Dividends Tax: no income tax on W-2 wages',
    publisher: 'New Hampshire Department of Revenue Administration',
    url: 'https://www.revenue.nh.gov/taxes-glance/interest-dividends-tax',
  },
  southDakota: {
    label: 'Taxes: South Dakota does not impose a state income tax',
    publisher: 'South Dakota Department of Revenue',
    url: 'https://dor.sd.gov/individuals/taxes/',
  },
  tennessee: {
    label: 'Tennessee has no individual income tax on wages',
    publisher: 'Tennessee Department of Revenue',
    url: 'https://revenue.support.tn.gov/hc/en-us/articles/360057371832-HIT-18-Pension-Income-Social-Security-401-k-and-IRA-Distributions',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'opt-tax-calculator-percentage';

export const optTaxGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'OPT Tax Calculator 2026: What Percentage of Your OPT Salary Goes to Tax, and How to Estimate Take-Home Pay',
  seoTitle: 'OPT Tax Calculator 2026: Tax Percentage and Take-Home Pay',
  description:
    'Estimate OPT take-home pay by hand with the 2026 IRS brackets: the FICA exemption for F-1 students, no standard deduction for nonresident aliens, the India treaty exception, state tax and worked examples from $60,000 to $120,000.',
  category: 'Tax & Finance',
  tags: [
    'OPT tax calculator',
    'OPT tax percentage',
    'OPT tax exemption',
    'OPT tax rate',
    'FICA exemption F-1',
    'nonresident alien tax',
    'OPT taxes Texas',
  ],
  readTime: '10 min read',
  publishedDate: '2026-11-09',
  modifiedDate: '2026-11-09',
  showContents: true,
  hub: 'money-and-life',
  cta: 'opt-timeline',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: estimating OPT tax percentage and take-home pay with the 2026 federal brackets and the F-1 FICA exemption.',
  imageCaption:
    'Federal tax estimates for a nonresident alien on OPT, worked from the 2026 IRS rate tables in Revenue Procedure 2025-32.',
  badgeLabel: 'Worked tax estimate',
  reviewLabel:
    'Rules and 2026 figures checked on November 9, 2026 against IRS Revenue Procedure 2025-32, Publications 519, 15-T and 901, and Notice 1392',
  directAnswer:
    'Most F-1 students on OPT are nonresident aliens for their first five calendar years in F, J, M or Q status. During that time they owe no Social Security or Medicare tax on OPT wages, which saves 7.65% of pay. They do owe federal income tax at the normal 2026 rates, but without the $16,100 standard deduction. That puts federal tax at about 13.2% of a $60,000 salary, 15.4% of $80,000, 16.7% of $100,000 and 17.8% of $120,000. State tax comes on top, except in states with no wage tax such as Texas. These are estimates of annual liability, not exact paycheck withholding.',
  keyTakeaways: [
    'FICA (6.2% Social Security plus 1.45% Medicare) does not apply to OPT or STEM OPT wages while you are a nonresident alien in F-1 status.',
    'The five years are calendar years, and any part of a year counts as a full year. Earlier years in F, J, M or Q status count too.',
    'Nonresident aliens cannot take the standard deduction. The main exception is students and business apprentices who qualify under Article 21(2) of the U.S.-India treaty.',
    'For 2026, the federal brackets for a single filer are 10% up to $12,400, 12% up to $50,400, 22% up to $105,700 and 24% up to $201,775.',
    'Your employer adds $16,100 a year to your wages when it figures withholding. That amount is only for the calculation and never appears on your W-2.',
    'Once you pass the substantial presence test, you become a resident alien for tax. FICA starts, and so does the standard deduction.',
  ],
  sections: [
    {
      heading: 'The short answer: how much tax comes out of an OPT salary',
      paragraphs: [
        'Three taxes can apply to an OPT paycheck: federal income tax, FICA and state income tax. For most F-1 students in their first five calendar years, FICA is zero. That leaves federal income tax and, depending on where you work, state income tax.',
        'The table shows the federal estimate for four salaries. It assumes a nonresident alien who files as single, has no other income, takes no treaty benefit and has no pre-tax deductions such as a 401(k). The worked examples later in this guide show every step.',
      ],
      table: {
        caption:
          'Estimated 2026 federal income tax for a nonresident alien on OPT, FICA-exempt, before state tax. Calculated by TrackMyOPT from Revenue Procedure 2025-32.',
        columns: ['Annual salary', 'Federal income tax', 'FICA', 'Federal tax as % of salary'],
        rows: [
          ['$60,000', '$7,912', '$0', '13.2%'],
          ['$80,000', '$12,312', '$0', '15.4%'],
          ['$100,000', '$16,712', '$0', '16.7%'],
          ['$120,000', '$21,398', '$0', '17.8%'],
        ],
      },
      note: 'These are estimates of what you owe for the year. Your actual withholding depends on your Form W-4, your pay schedule and payroll software. The real number is settled when you file Form 1040-NR.',
    },
    {
      heading: 'The OPT FICA exemption: no Social Security or Medicare tax',
      paragraphs: [
        'Section 3121(b)(19) of the Internal Revenue Code removes from FICA the work a nonresident alien does while temporarily in the United States in F, J, M or Q status. The work must carry out the purpose of that status.',
        'The IRS page on foreign student FICA lists practical training on or off campus as exempt employment. Publication 519 says the same: the exempt services generally include on-campus work, practical training and economic hardship employment. OPT and the STEM OPT extension are practical training.',
        'The exemption saves the employee share of FICA. IRS Topic 751 puts that share at 6.2% for Social Security and 1.45% for Medicare, or 7.65% together. On an $80,000 salary, that is $6,120 a year.',
      ],
      bullets: [
        'It does not cover F-2, J-2 or M-2 family members.',
        'It does not cover work that USCIS has not authorized.',
        'It stops if you change to a status that is not exempt, such as H-1B.',
        'It stops when you become a resident alien for tax purposes, even if you are still in F-1 status.',
      ],
      links: [
        { label: 'FICA withheld by mistake? Getting it back with Forms 843 and 8316', href: '/blog/fica-tax-refund-f1-opt-forms-843-8316' },
        { label: 'Your first U.S. paycheck: deductions and Form W-4', href: '/blog/first-us-paycheck-deductions-w4' },
      ],
      sources: [src.usc3121, src.ficaStudents, src.p519, src.tc751],
    },
    {
      heading: 'How to count your five calendar years',
      paragraphs: [
        'An F-1 student is an "exempt individual" for the substantial presence test. Exempt here means your days in the United States are not counted toward tax residency. It does not mean you are exempt from tax.',
        'Publication 519 says you stop being an exempt student if you were exempt as a teacher, trainee or student for any part of more than five calendar years. So the count is in calendar years, not 12-month periods. Arriving on December 20 still uses up that whole year.',
        'Earlier years in F, J, M or Q status count toward the five. A year spent on a J-1 exchange before your F-1 degree, for example, is one of your five. A student can sometimes stay exempt longer by showing no intent to live here permanently and full compliance with the visa. That is a fact-specific claim for a tax professional.',
      ],
      table: {
        caption:
          'Example: an F-1 student who first arrived in August 2022 and has no earlier F, J, M or Q years.',
        columns: ['Calendar year', 'Exempt year number', 'Counts days for residency?', 'FICA on OPT wages?'],
        rows: [
          ['2022 (arrived in August)', '1', 'No', 'No'],
          ['2023', '2', 'No', 'No'],
          ['2024', '3', 'No', 'No'],
          ['2025', '4', 'No', 'No'],
          ['2026', '5', 'No', 'No'],
          ['2027', 'None left', 'Yes, from January 1', 'Yes, once you meet the substantial presence test'],
        ],
      },
      sources: [src.p519, src.ficaStudents],
    },
    {
      heading: 'What changes when you become a resident alien',
      paragraphs: [
        'After your exempt years run out, your days start to count. You meet the substantial presence test for a year if you were in the United States at least 31 days that year and at least 183 days over three years. The 183 counts all days in the current year, one third of the days in the year before and one sixth of the days two years before. Days as an exempt individual are left out.',
        'If you meet the test, your residency usually starts on the first day you were present that calendar year. For someone in the United States all year, that is January 1 of the sixth calendar year. Tell your employer\'s payroll team when your status changes, so FICA withholding starts on time.',
        'As a resident alien you pay FICA like a U.S. citizen, at 7.65%. The 6.2% Social Security part stops at the 2026 wage base of $184,500, and the 1.45% Medicare part continues above it. You also get the standard deduction, which is $16,100 for a single filer in 2026, and you file Form 1040 instead of Form 1040-NR.',
      ],
      links: [
        { label: 'F-1, OPT and STEM OPT tax filing mistakes', href: '/blog/f1-opt-stem-opt-tax-filing-mistakes' },
        { label: 'F-1 student tax filing guide for 2026', href: '/blog/f1-student-tax-filing-guide-2026' },
      ],
      sources: [src.p519, src.tc751, src.revProc],
    },
    {
      heading: 'Federal income tax for nonresident aliens on OPT',
      paragraphs: [
        'OPT wages are taxed at the same graduated rates that apply to U.S. citizens. The difference is the deduction. Publication 519 states that nonresident aliens cannot claim the standard deduction. You can only itemize the deductions the 1040-NR allows, such as state and local income taxes on U.S. wages.',
        'Nonresident aliens file as single or, if married, usually as married filing separately. In 2026 the married-filing-separately rates match the single rates up to $256,225 of taxable income. So the single table below works for every salary in this guide.',
      ],
      table: {
        caption:
          '2026 federal tax rate table for single filers (Revenue Procedure 2025-32, section 4.01, Table 3).',
        columns: ['Taxable income', 'Tax'],
        rows: [
          ['Up to $12,400', '10% of taxable income'],
          ['$12,400 to $50,400', '$1,240 plus 12% of the amount over $12,400'],
          ['$50,400 to $105,700', '$5,800 plus 22% of the amount over $50,400'],
          ['$105,700 to $201,775', '$17,966 plus 24% of the amount over $105,700'],
          ['$201,775 to $256,225', '$41,024 plus 32% of the amount over $201,775'],
          ['$256,225 to $640,600', '$58,448 plus 35% of the amount over $256,225'],
          ['Over $640,600', '$192,979.25 plus 37% of the amount over $640,600'],
        ],
      },
      sources: [src.revProc, src.release, src.p519],
    },
    {
      heading: 'Form W-4 and the extra withholding amount',
      paragraphs: [
        'Payroll withholding tables already build in the standard deduction. Nonresident aliens do not get that deduction, so the IRS tells employers to correct for it. Under Publication 15-T for 2026, the employer adds an amount to your wages before it looks up withholding. For a Form W-4 from 2020 or later, that amount is $16,100 a year.',
        'The added amount is used only to figure income tax withholding. Publication 15-T says it does not go on your W-2, does not raise your tax liability and does not change FICA. Students from India who qualify under Article 21(2) are not subject to this adjustment.',
        'Notice 1392 changes how a nonresident alien fills out Form W-4.',
      ],
      table: {
        caption: 'Publication 15-T (2026), Table 2: amount added to wages for withholding only.',
        columns: ['Pay period', 'Amount added'],
        rows: [
          ['Weekly', '$309.60'],
          ['Every two weeks', '$619.20'],
          ['Twice a month', '$670.80'],
          ['Monthly', '$1,341.70'],
          ['Annually', '$16,100.00'],
        ],
      },
      numbered: [
        'Step 1(c): check Single or Married filing separately, whatever your actual marital status.',
        'Step 2: leave it blank unless you hold more than one job at the same time.',
        'Step 3: leave it blank unless you are from Canada, Mexico, South Korea or India and qualify for a dependent credit.',
        'Step 4(c): write "Nonresident Alien" or "NRA" in the space below it. You may add extra withholding there too.',
        'Do not write "Exempt" on the form, and do not use the IRS Tax Withholding Estimator.',
      ],
      sources: [src.p15t, src.n1392],
    },
    {
      heading: 'Treaty benefits: India and China',
      paragraphs: [
        'India: Publication 519 lets students and business apprentices who qualify under Article 21(2) of the U.S.-India treaty claim the standard deduction, as long as they do not itemize. Publication 901 adds that the benefit lasts only for the time reasonably or customarily needed to finish studying or training. With the 2026 standard deduction of $16,100, the federal estimate on an $80,000 salary drops from $12,312 to $8,770.',
        'China: Publication 901 says a resident of China who is in the United States solely for training, education or special technical experience is exempt on up to $5,000 of personal services income each tax year. The exemption lasts only for the time reasonably necessary to complete the education or training. At the 22% bracket, a $5,000 exemption lowers federal tax by about $1,100. Notice 1392 says a treaty exemption from withholding is claimed on Form 8233, not on Form W-4.',
        'Whether OPT employment still fits these treaty articles depends on your facts. Confirm with your school\'s tax resource or a tax professional before claiming either benefit.',
      ],
      links: [
        { label: 'Tax treaty benefits for Indian and Chinese F-1 students', href: '/blog/tax-treaty-indian-chinese-f1-students' },
      ],
      sources: [src.p519, src.p901, src.n1392, src.revProc],
    },
    {
      heading: 'State income tax, including OPT taxes in Texas',
      paragraphs: [
        'State tax depends on the state where you live and work. Each state sets its own rules, and a state can treat you differently from the IRS.',
        'We confirmed on official state revenue websites that seven states do not tax wages: Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas and Washington. If you work in Texas, the estimates in this guide are close to your full income tax, because Texas has no personal income tax. Other states may also have no wage tax; check your state\'s revenue department.',
        'In a state that taxes wages, subtract state withholding from the take-home figures here. On Form 1040-NR you can itemize state and local income taxes paid on your U.S. wages, which lowers federal tax a little. Check also whether your city or county has its own wage tax.',
      ],
      sources: [
        src.texas,
        src.florida,
        src.washington,
        src.nevada,
        src.newHampshire,
        src.southDakota,
        src.tennessee,
        src.p519,
      ],
    },
    {
      heading: 'Worked examples: $60,000 to $120,000 on OPT',
      paragraphs: [
        'Each example is a single nonresident alien in a FICA-exempt year, with no other income, no treaty benefit and no pre-tax deductions. Taxable income equals salary, because there is no standard deduction. Tax comes from the 2026 single rate table. Take-home pay is salary minus federal tax and minus FICA of $0, before any state tax.',
      ],
      table: {
        caption:
          'Worked 2026 estimates for a nonresident alien on OPT, FICA-exempt, before state tax. Calculated by TrackMyOPT.',
        columns: ['Salary', 'Federal tax arithmetic', 'Federal tax', 'FICA', 'Take-home before state tax', 'Per month'],
        rows: [
          ['$60,000', '$5,800 + 22% x ($60,000 - $50,400) = $5,800 + $2,112', '$7,912', '$0', '$52,088', 'About $4,341'],
          ['$80,000', '$5,800 + 22% x ($80,000 - $50,400) = $5,800 + $6,512', '$12,312', '$0', '$67,688', 'About $5,641'],
          ['$100,000', '$5,800 + 22% x ($100,000 - $50,400) = $5,800 + $10,912', '$16,712', '$0', '$83,288', 'About $6,941'],
          ['$120,000', '$17,966 + 24% x ($120,000 - $105,700) = $17,966 + $3,432', '$21,398', '$0', '$98,602', 'About $8,217'],
        ],
      },
    },
    {
      heading: 'How your status changes the estimate',
      paragraphs: [
        'The same salary produces different numbers depending on residency and treaty status. The table compares three cases with the same 2026 brackets. The resident column uses the $16,100 standard deduction and 7.65% FICA. The India column uses the $16,100 standard deduction with no FICA.',
      ],
      table: {
        caption:
          'Federal income tax plus FICA for a single filer in 2026, before state tax. Calculated by TrackMyOPT from Revenue Procedure 2025-32 and IRS Topic 751.',
        columns: [
          'Salary',
          'Nonresident alien, FICA-exempt',
          'Nonresident alien under India Article 21(2), FICA-exempt',
          'Resident alien (tax $ + FICA $)',
        ],
        rows: [
          ['$60,000', '$7,912 (13.2%)', '$5,020 (8.4%)', '$5,020 + $4,590 = $9,610 (16.0%)'],
          ['$80,000', '$12,312 (15.4%)', '$8,770 (11.0%)', '$8,770 + $6,120 = $14,890 (18.6%)'],
          ['$100,000', '$16,712 (16.7%)', '$13,170 (13.2%)', '$13,170 + $7,650 = $20,820 (20.8%)'],
          ['$120,000', '$21,398 (17.8%)', '$17,570 (14.6%)', '$17,570 + $9,180 = $26,750 (22.3%)'],
        ],
      },
      note: 'The jump in the resident column is mostly FICA. Moving from nonresident to resident adds 7.65% FICA but also adds the standard deduction, so the net change is smaller than 7.65%.',
    },
    {
      heading: 'Estimate your own OPT tax in five steps',
      paragraphs: [
        'You can reproduce any of these numbers with a calculator. Use your gross annual salary and the rate table above.',
      ],
      numbered: [
        'Count your calendar years in F, J, M or Q status. If this is year five or earlier, FICA is $0. If not, check the substantial presence test.',
        'Start with gross salary. Subtract pre-tax payroll deductions, such as 401(k) contributions, if you have them.',
        'Subtract $16,100 only if you are a resident alien or qualify under India Article 21(2). Otherwise subtract nothing.',
        'Find your bracket in the 2026 table. Add the base tax to the bracket rate times the amount over the bracket floor.',
        'Subtract federal tax, FICA if it applies and your state tax. Divide by 12 or 26 for a monthly or biweekly figure.',
      ],
      links: [
        { label: 'F-1 tax filing guide', href: '/guides/f1-tax-filing' },
        { label: 'F-1 student tax filing guide for 2026', href: '/blog/f1-student-tax-filing-guide-2026' },
      ],
    },
  ],
  checklist: [
    'Write down every calendar year you spent in F, J, M or Q status.',
    'Check your first pay stub: Social Security and Medicare should be $0 in an exempt year.',
    'Fill out Form W-4 under Notice 1392 and write "NRA" below Step 4(c).',
    'If you are from India or China, read the treaty rules in Publication 901 before claiming a benefit.',
    'Find out whether your work state taxes wages.',
    'Plan to file Form 1040-NR, plus Form 8843 for each year you are an exempt individual.',
  ],
  mistakes: [
    'Assuming "exempt individual" means you owe no income tax. It only means your days do not count toward residency.',
    'Counting five years from your arrival date instead of by calendar year.',
    'Ignoring earlier J-1 or other F, J, M or Q years in the count.',
    'Using U.S. tax software that applies the standard deduction to a nonresident return.',
    'Letting FICA come out of OPT pay for months without asking payroll to fix it.',
    'Paying no FICA after becoming a resident alien, which leaves a bill for later.',
  ],
  faq: [
    {
      question: 'What percentage of tax do I pay on OPT?',
      answer:
        'For a single nonresident alien in a FICA-exempt year, 2026 federal income tax is about 13.2% of a $60,000 salary, 15.4% of $80,000, 16.7% of $100,000 and 17.8% of $120,000. State tax is extra in states that tax wages.',
    },
    {
      question: 'Is OPT income exempt from tax?',
      answer:
        'Not from income tax. OPT wages are exempt from Social Security and Medicare tax while you are a nonresident alien in F-1 status, usually your first five calendar years. Federal income tax and any state income tax still apply.',
    },
    {
      question: 'What is the OPT tax rate in 2026?',
      answer:
        'There is no special OPT rate. OPT wages use the normal 2026 federal brackets of 10%, 12%, 22%, 24%, 32%, 35% and 37%. Nonresident aliens apply them to the full salary because they cannot take the standard deduction.',
    },
    {
      question: 'Do I pay state tax on OPT in Texas?',
      answer:
        'No. Texas has no personal income tax, according to the Texas Comptroller. On OPT in Texas you usually pay only federal income tax, plus FICA if you are no longer a nonresident alien.',
    },
    {
      question: 'When do I start paying FICA on OPT or STEM OPT?',
      answer:
        'When you become a resident alien for tax purposes, usually in your sixth calendar year in F, J, M or Q status, after you meet the substantial presence test. FICA also starts if you change to a status such as H-1B.',
    },
    {
      question: 'My employer withheld Social Security and Medicare from my OPT pay. What do I do?',
      answer:
        'Ask the employer to refund it first. If the employer will not refund it all, the IRS says to file Form 843 with Form 8316 and supporting documents.',
    },
    {
      question: 'Is this an exact paycheck calculator?',
      answer:
        'No. These are estimates of annual federal tax liability. Real withholding depends on your Form W-4, pay schedule, pre-tax deductions and state rules. Ask a tax professional about your own situation.',
    },
  ],
  sources: [
    src.revProc,
    src.release,
    src.usc3121,
    src.ficaStudents,
    src.p519,
    src.p15t,
    src.n1392,
    src.p901,
    src.tc751,
    src.texas,
    src.florida,
    src.washington,
    src.nevada,
    src.newHampshire,
    src.southDakota,
    src.tennessee,
  ],
  related: [
    { label: 'F-1 student tax filing guide for 2026', href: '/blog/f1-student-tax-filing-guide-2026' },
    { label: 'FICA refund with Forms 843 and 8316', href: '/blog/fica-tax-refund-f1-opt-forms-843-8316' },
    { label: 'Your first U.S. paycheck: deductions and W-4', href: '/blog/first-us-paycheck-deductions-w4' },
    { label: 'Tax treaties for Indian and Chinese F-1 students', href: '/blog/tax-treaty-indian-chinese-f1-students' },
    { label: 'F-1, OPT and STEM OPT tax filing mistakes', href: '/blog/f1-opt-stem-opt-tax-filing-mistakes' },
    { label: 'F-1 tax filing guide', href: '/guides/f1-tax-filing' },
  ],
  dataNote:
    'Method: estimates of 2026 annual federal liability, not payroll withholding. Brackets and the $16,100 single standard deduction come from IRS Revenue Procedure 2025-32, sections 4.01 (Table 3, unmarried individuals) and 4.14. Nonresident alien column: taxable income = salary, because Publication 519 bars the standard deduction; tax = base amount + rate x (taxable income - bracket floor). $60,000: $5,800 + 0.22 x $9,600 = $7,912. $80,000: $5,800 + 0.22 x $29,600 = $12,312. $100,000: $5,800 + 0.22 x $49,600 = $16,712. $120,000: $17,966 + 0.24 x $14,300 = $21,398. Take-home = salary - federal tax - FICA ($0), before state tax; per month = take-home / 12, rounded to the nearest dollar. India Article 21(2) and resident columns: taxable income = salary - $16,100. $43,900: $1,240 + 0.12 x $31,500 = $5,020. $63,900: $5,800 + 0.22 x $13,500 = $8,770. $83,900: $5,800 + 0.22 x $33,500 = $13,170. $103,900: $5,800 + 0.22 x $53,500 = $17,570. Resident FICA = 7.65% of salary (6.2% Social Security plus 1.45% Medicare, IRS Topic 751); all four salaries are below the 2026 wage base of $184,500 and the $200,000 Additional Medicare Tax threshold. China example: $5,000 x 22% = $1,100. Percentages are tax / salary, rounded to one decimal place. Assumptions: single or married filing separately (identical 2026 rates below $256,225), no other income, no pre-tax deductions, no itemized deductions, no credits. Not tax advice.',
});
