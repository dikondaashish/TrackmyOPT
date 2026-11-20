import { defineArticle } from './shared';
import { PLANNING_GUIDE_DATE, planningSources as src } from './planning-guides-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "h1b 100k fee for f1 students", "opt to h1b 100k", "does 100k
// h1b fee apply to change of status". The October fee post compares the two
// measures; this post answers the F-1 question directly.
// Status read on November 20, 2026 from the USCIS H-1B page (reviewed
// 09/21/2026) and the September 30, 2026 N.D. Cal. order. Recheck both before
// editing: the appeals can change the answer.

const SLUG = 'h1b-100k-fee-f1-opt-students';

export const h1b100kFeeF1Guide: ResearchArticle = defineArticle({
  slug: SLUG,
  title: 'Does the $100,000 H-1B Fee Apply to F-1 and OPT Students?',
  seoTitle: '$100K H-1B Fee: Does It Apply to F-1 and OPT Students?',
  description:
    'Usually no. Courts have set aside the $100,000 H-1B payment for now, and an approved change of status from F-1 inside the United States was never charged. The three cases to avoid.',
  category: 'H-1B',
  tags: [
    '$100K H-1B fee F-1 students',
    'OPT to H-1B $100,000 fee',
    'H-1B change of status fee',
    'H-1B proclamation payment',
    '$103,265 H-1B fee proposal',
  ],
  readTime: '6 min read',
  publishedDate: PLANNING_GUIDE_DATE,
  modifiedDate: PLANNING_GUIDE_DATE,
  showContents: true,
  cta: 'sponsors',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the $100,000 H-1B payment is $0 for an F-1 change of status approved in the United States.',
  imageCaption: 'An approved change of status inside the United States was never charged.',
  reviewLabel: 'USCIS guidance, proclamations and court order reviewed',
  statusNote:
    'Checked November 20, 2026. Two federal courts have set aside the agency policies that collect the $100,000 payment, and USCIS says it will comply while the orders stand. The government has appealed. Recheck the USCIS H-1B page before any filing.',
  directAnswer:
    'Usually no. Today nobody is paying the $100,000, because two federal courts set aside the agency policies behind it. Even under those policies, an F-1 or OPT student whose change of status to H-1B is approved inside the United States was not charged. The payment applied to consular cases, to a denied change of status, and to people who left the country before the change of status was decided.',
  keyTakeaways: [
    'The payment is not being collected today. The government has appealed.',
    'An approved change of status from F-1 inside the United States was exempt.',
    'Leaving the country while the change of status is pending was the main risk.',
    'A separate $103,265 fee is only proposed. It would cover change-of-status cap cases.',
  ],
  sections: [
    {
      heading: 'The short answer by situation',
      paragraphs: [
        'The middle column shows what the USCIS guidance said. Courts have set that guidance aside, so the last column is what applies today.',
      ],
      table: {
        caption: 'The $100,000 payment by situation, as of November 20, 2026.',
        columns: ['Your situation', 'Under the USCIS guidance', 'Today'],
        rows: [
          ['Change of status from F-1, approved inside the United States', 'No payment', 'No payment'],
          ['Extension or amendment, approved inside the United States', 'No payment', 'No payment'],
          ['Change of status denied', 'Payment applied', 'Not collected'],
          ['You leave before the change of status is decided', 'Payment applied', 'Not collected'],
          ['Consular processing, or you are outside the United States', 'Payment applied', 'Not collected'],
          ['Travel after the change of status is approved', 'No payment', 'No payment'],
        ],
      },
      sources: [src.h1bPage, src.feeOrder],
    },
    {
      heading: 'Where the payment stands today',
      paragraphs: [
        'A September 2025 proclamation restricted the entry of H-1B workers unless the petition came with a $100,000 payment. A second proclamation on September 18, 2026 extended it to September 21, 2027.',
        'On June 8, 2026, a federal court in Massachusetts vacated the agency guidance that carried out the payment. The First Circuit refused to pause that order on July 24.',
        'On September 30, 2026, a federal court in California also vacated the agency policies, for both proclamations, and barred the agencies from enforcing them until they complete formal rulemaking. The proclamations themselves were not struck down.',
        'USCIS says it will comply with the court order, and that it still plans to collect the payment if the order is lifted.',
      ],
      note: 'Appeals are pending in more than one circuit. A ruling can change this with little warning.',
      sources: [src.proclamation2025, src.proclamation2026, src.h1bPage, src.feeOrder],
    },
    {
      heading: 'Why a change of status from F-1 was exempt',
      figure: {
        src: `/blog/illustrations/${SLUG}.webp`,
        alt: 'Painted illustration of a graduate walking from a campus toward a city office district at sunrise.',
        caption: 'Changing status inside the United States was outside the payment. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'The proclamation restricts entry into the United States. USCIS read it to exclude a petition that asks for a change of status, amendment or extension for someone already here, when that request is granted.',
        'That is the usual path from OPT to H-1B: your employer files a cap petition with a change of status, and you stay in the country until it is approved.',
        'USCIS also said that a person approved this way is not subject to the payment if they later travel and apply for an H-1B visa on that petition.',
      ],
      links: [
        { label: 'Change of status or consular processing?', href: '/blog/h1b-change-of-status-vs-consular-processing-opt' },
        { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
      ],
      sources: [src.h1bPage, src.proclamation2025],
    },
    {
      heading: 'Three cases where the payment applied',
      paragraphs: [
        'These are the cases to plan around, because they return if a court lifts the orders.',
      ],
      numbered: [
        'Consular processing. The petition asks for consular notification, or you are outside the United States when it is filed.',
        'A denied change of status. USCIS approves the petition but finds you not eligible to change status, for example because you were out of status.',
        'Leaving too early. You leave the United States before USCIS decides the change of status. That abandons the request.',
      ],
      links: [
        { label: 'H-1B cap-gap extension', href: '/blog/h1b-cap-gap-extension' },
        { label: 'Travel while OPT is pending', href: '/blog/travel-while-opt-pending' },
      ],
      sources: [src.h1bPage],
    },
    {
      heading: 'The separate $103,265 proposal',
      paragraphs: [
        'On August 25, 2026, DHS proposed a different charge: $103,265 for every cap-subject H-1B petition, including master\'s cap cases. It has no carve-out for a change of status, so it would cover the usual F-1 path.',
        'It is a proposal. The comment period closed on September 24, 2026. As of November 20, no final rule or effective date has been published.',
        'The proposal says that where both this fee and the $100,000 payment apply, the employer would pay both. Cap-exempt petitions are outside it.',
      ],
      links: [
        { label: 'The $100,000 payment and the $103,265 proposal compared', href: '/blog/dhs-proposes-103265-h1b-fee-2026' },
        { label: 'Find cap-exempt H-1B employers', href: '/blog/find-cap-exempt-h1b-employers' },
      ],
      sources: [src.feeProposal],
    },
    {
      heading: 'What to do now',
      paragraphs: [
        'The employer files the petition and makes any payment. Your part is to keep the low-risk path open.',
      ],
      bullets: [
        'Ask your employer to file with a change of status, not consular processing, if you qualify.',
        'Keep your F-1 status and OPT reporting clean until the change of status is approved.',
        'Do not travel abroad while the change of status is pending without asking the attorney.',
        'Ask the attorney to recheck the court orders in the week of filing.',
        'Get any agreement about who pays fees in writing before you sign it.',
      ],
      sources: [src.h1bPage],
    },
  ],
  checklist: [
    'Confirm the petition will ask for a change of status.',
    'Check your OPT dates and SEVP Portal record.',
    'Hold travel until the change of status is approved.',
    'Ask the attorney about the court orders before filing.',
    'Follow the $103,265 proposal for a final rule.',
  ],
  mistakes: [
    'Assuming every OPT student owes $100,000.',
    'Adding the $100,000 and $103,265 figures into one bill.',
    'Leaving the country while the change of status is pending.',
    'Treating the court orders as permanent.',
  ],
  faq: [
    {
      question: 'Does the $100,000 H-1B fee apply to F-1 students?',
      answer:
        'Not when the change of status to H-1B is approved inside the United States. As of November 20, 2026 the payment is also not being collected from anyone, because courts set aside the agency policies behind it.',
    },
    {
      question: 'Does the $100,000 fee apply to OPT to H-1B change of status?',
      answer:
        'No, if USCIS grants the change of status. The USCIS guidance applied the payment only if the change of status was denied or you left the country before it was decided.',
    },
    {
      question: 'Is anyone paying the $100,000 H-1B fee right now?',
      answer:
        'No. USCIS says it will comply with the court order that vacated its guidance. It also says it plans to collect the payment if the order is lifted.',
    },
    {
      question: 'Who pays the $100,000, the employer or the student?',
      answer:
        'The employer. The guidance told petitioners to pay through pay.gov before filing the petition.',
    },
    {
      question: 'Can I travel after my H-1B change of status is approved?',
      answer:
        'Under the USCIS guidance, yes. A person whose change of status was approved was not subject to the payment when later applying for a visa on that petition.',
    },
    {
      question: 'Is the $103,265 H-1B fee in effect?',
      answer:
        'No. It is a proposed rule from August 25, 2026. No final rule had been published as of November 20, 2026.',
    },
  ],
  sources: [
    src.h1bPage,
    src.proclamation2025,
    src.proclamation2026,
    src.feeOrder,
    src.feeProposal,
  ],
  related: [
    { label: 'The $100,000 payment and the $103,265 proposal compared', href: '/blog/dhs-proposes-103265-h1b-fee-2026' },
    { label: 'Change of status or consular processing?', href: '/blog/h1b-change-of-status-vs-consular-processing-opt' },
    { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
    { label: 'H-1B lottery 2027 (FY2028)', href: '/blog/h1b-lottery-2027-fy2028' },
  ],
});
