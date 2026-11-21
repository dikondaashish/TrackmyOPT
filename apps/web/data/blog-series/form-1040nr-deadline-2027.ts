import { defineArticle } from './shared';
import { PLANNING_GUIDE_DATE, planningSources as src } from './planning-guides-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "1040nr due date", "1040-nr deadline 2027", "form 8843
// deadline", "1040nr extension". No existing post states the June 15 case,
// the December 15 extension or the 16-month rule.
// The IRS had not published 2026 instructions on November 20, 2026. Dates
// follow the standing rule (15th day of the 4th or 6th month) applied to 2027.

const SLUG = '1040-nr-deadline-2027';

export const form1040nrDeadlineGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title: '1040-NR Deadline 2027: When F-1 and OPT Students Must File',
  seoTitle: '1040-NR Deadline 2027 for F-1 and OPT Students',
  description:
    'Form 1040-NR for tax year 2026 is due April 15, 2027 if you had U.S. wages, and June 15, 2027 if you did not. Form 8843, extensions, penalties and when your W-2 arrives.',
  category: 'F-1 Taxes',
  tags: [
    '1040-NR deadline 2027',
    '1040NR due date',
    'Form 8843 deadline',
    'F-1 student tax deadline',
    'OPT tax filing deadline',
  ],
  readTime: '6 min read',
  publishedDate: PLANNING_GUIDE_DATE,
  modifiedDate: PLANNING_GUIDE_DATE,
  showContents: true,
  cta: 'tax',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: Form 1040-NR is due April 15, 2027 with wages and June 15, 2027 without.',
  imageCaption: 'Two deadlines, depending on whether you had U.S. wages.',
  statusNote:
    'Checked November 20, 2026. The IRS has posted only a draft of the 2026 Form 1040-NR and has not announced when the 2027 filing season opens. The dates here follow the standing IRS rule.',
  directAnswer:
    'For tax year 2026, Form 1040-NR is due Thursday, April 15, 2027 if you received wages subject to U.S. tax withholding. If you had no such wages, it is due Tuesday, June 15, 2027. Form 8843 follows the same date. Form 4868 extends the filing date by six months. It does not extend the time to pay.',
  keyTakeaways: [
    'Had a U.S. job in 2026: file by April 15, 2027.',
    'No U.S. wages: file by June 15, 2027.',
    'No income at all: mail Form 8843 alone by June 15, 2027.',
    'An extension moves the filing date to October 15 or December 15, 2027.',
  ],
  sections: [
    {
      heading: 'Your deadline at a glance',
      paragraphs: [
        'The date depends on one question: did an employer withhold U.S. tax from your wages in 2026? OPT, CPT and on-campus jobs count.',
      ],
      table: {
        caption: 'Federal deadlines in 2027 for tax year 2026.',
        columns: ['Your 2026 situation', 'What to file', 'Due', 'With Form 4868'],
        rows: [
          ['Wages with U.S. withholding', '1040-NR and Form 8843', 'April 15, 2027', 'October 15, 2027'],
          ['Other U.S. income, no wages', '1040-NR and Form 8843', 'June 15, 2027', 'December 15, 2027'],
          ['No U.S. income', 'Form 8843 alone', 'June 15, 2027', 'Not needed'],
        ],
      },
      note: 'Neither date falls on a weekend or holiday in 2027, so nothing moves.',
      sources: [src.i1040nr, src.topic851, src.pub519],
    },
    {
      heading: 'When your tax forms arrive',
      figure: {
        src: `/blog/illustrations/${SLUG}.webp`,
        alt: 'Painted illustration of a kitchen table with a box of folders and envelopes, a mug and a pen in spring light.',
        caption: 'Most forms arrive by early February. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'You need these before you file. January 31, 2027 is a Sunday, so the usual date moves to Monday.',
      ],
      table: {
        caption: 'Dates by which payers must send 2026 forms.',
        columns: ['Form', 'What it reports', 'Sent by'],
        rows: [
          ['W-2', 'Wages and tax withheld', 'February 1, 2027'],
          ['1099 and 1098-T', 'Interest, other income, tuition', 'February 1, 2027'],
          ['1042-S', 'Scholarships and treaty-exempt income', 'March 15, 2027'],
        ],
      },
      sources: [src.w2Instructions, src.i1042s],
    },
    {
      heading: 'Form 8843: everyone on F-1 files it',
      paragraphs: [
        'Form 8843 is not a tax return. It tells the IRS you are an exempt individual, so your days in the United States do not count toward tax residency.',
        'If you file a 1040-NR, attach Form 8843 to it. If you have no return to file, mail Form 8843 alone to the Internal Revenue Service Center, Austin, TX 73301-0215.',
      ],
      links: [
        { label: 'Form 8843 with zero income', href: '/blog/form-8843-f1-students-zero-income' },
        { label: '1040-NR or 1040: the five-year rule', href: '/blog/1040nr-vs-1040-five-calendar-year-rule-f1' },
      ],
      sources: [src.f8843],
    },
    {
      heading: 'If you need more time',
      paragraphs: [
        'File Form 4868 by your original due date. It gives six more months to file: October 15, 2027 for April filers and December 15, 2027 for June filers.',
        'It does not give more time to pay. Estimate what you owe and pay it by the original date, or interest and a late-payment penalty apply.',
      ],
      sources: [src.f4868, src.pub519],
    },
    {
      heading: 'If you file late',
      paragraphs: [
        'Penalties are a share of the tax you still owe. If you are due a refund, there is no late-filing penalty, but a second rule below still matters.',
      ],
      bullets: [
        'Late filing: 5% of the unpaid tax for each month or part of a month, up to 25%.',
        'More than 60 days late: the minimum penalty is $535 or the tax due, whichever is less.',
        'Late payment: 0.5% of the unpaid tax per month, up to 25%.',
        'Interest: 7% a year in late 2026. The IRS resets the rate each quarter.',
      ],
      sources: [src.lateFiling, src.latePayment, src.revProc],
    },
    {
      heading: 'The 16-month rule for nonresidents',
      paragraphs: [
        'A nonresident must file a timely return to claim deductions and credits. The IRS treats a return as timely for this purpose if it is filed within 16 months of the due date.',
        'For a return due April 15, 2027, that is August 15, 2028. After that, the IRS can deny deductions and credits. The credit for tax already withheld from your pay is not affected.',
        'If your return for the year before was also not filed, the cut-off can come sooner.',
      ],
      sources: [src.pub519],
    },
    {
      heading: 'State returns and refunds',
      paragraphs: [
        'Most states use April 15. A few do not: Virginia returns are due May 1, which moves to Monday, May 3 in 2027. Check your own state tax agency.',
        'The IRS says most e-filed refunds arrive in about 3 weeks and mailed returns take 6 weeks or more. If you claim a refund of tax withheld on Form 1042-S, allow up to 6 months.',
        'TurboTax does not support Form 1040-NR. Use software built for nonresident returns, which many schools provide free.',
      ],
      links: [
        { label: 'F-1 student tax filing guide', href: '/blog/f1-student-tax-filing-guide-2026' },
        { label: 'FICA refund with Forms 843 and 8316', href: '/blog/fica-tax-refund-f1-opt-forms-843-8316' },
        { label: 'Tax treaty benefits for Indian and Chinese students', href: '/blog/tax-treaty-indian-chinese-f1-students' },
      ],
      sources: [src.refunds, src.i1040nr, src.virginia],
    },
  ],
  checklist: [
    'Confirm you are still a nonresident for 2026.',
    'Collect your W-2, 1042-S and 1099 forms.',
    'Fill in Form 8843 for yourself and each F-2 dependent.',
    'File the 1040-NR by April 15 or June 15, 2027.',
    'File Form 4868 and pay your estimate if you need more time.',
    'File your state return.',
  ],
  mistakes: [
    'Filing Form 1040 as a nonresident.',
    'Skipping Form 8843 because you had no income.',
    'Treating an extension as more time to pay.',
    'Waiting past 16 months and losing deductions.',
  ],
  faq: [
    {
      question: 'When is Form 1040-NR due in 2027?',
      answer:
        'April 15, 2027 if you had wages subject to U.S. withholding in 2026. June 15, 2027 if you did not.',
    },
    {
      question: 'When is Form 8843 due in 2027?',
      answer:
        'On the due date of your 1040-NR. If you have no return to file, mail it alone by June 15, 2027.',
    },
    {
      question: 'Can an F-1 student get a tax extension?',
      answer:
        'Yes. File Form 4868 by your original due date. You get six more months to file, not to pay.',
    },
    {
      question: 'What if I miss the 1040-NR deadline?',
      answer:
        'File as soon as you can. If you owe tax, penalties and interest grow each month. If you are due a refund, there is no late-filing penalty, but file within 16 months to keep your deductions and credits.',
    },
    {
      question: 'Do I file a 1040-NR if I only worked on OPT for part of the year?',
      answer:
        'Yes. Any wages with U.S. withholding mean a 1040-NR, due April 15, 2027, as long as you are a nonresident for tax purposes.',
    },
    {
      question: 'Has the IRS released the 2026 Form 1040-NR?',
      answer:
        'Only a draft, as of November 20, 2026. The final form and instructions usually arrive before the filing season opens in late January.',
    },
  ],
  sources: [
    src.i1040nr,
    src.topic851,
    src.pub519,
    src.f8843,
    src.f4868,
    src.lateFiling,
    src.latePayment,
    src.revProc,
    src.w2Instructions,
    src.i1042s,
    src.refunds,
  ],
  related: [
    { label: 'F-1 student tax filing guide', href: '/blog/f1-student-tax-filing-guide-2026' },
    { label: 'Form 8843 with zero income', href: '/blog/form-8843-f1-students-zero-income' },
    { label: 'Common OPT and STEM OPT tax filing mistakes', href: '/blog/f1-opt-stem-opt-tax-filing-mistakes' },
    { label: 'OPT tax calculator', href: '/blog/opt-tax-calculator-percentage' },
  ],
});
