import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "h4 extension status" (303 impressions), "h4 case status" (484) and
// "h4 status check" (600) land on the H-4 EAD guide, which is about the
// I-765. This guide covers the I-539 extension or change of status itself.

const src = {
  status: {
    label: 'Check your immigration case status',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  i539: {
    label: 'Form I-539, Application to Extend/Change Nonimmigrant Status',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-539',
  },
  i539online: {
    label: 'File Form I-539 online',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-539online',
  },
  times: {
    label: 'Check Case Processing Times',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/',
  },
  premium: {
    label: 'Form I-907, Request for Premium Processing Service',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-907',
  },
  h4ead: {
    label: 'Employment authorization for certain H-4 dependent spouses',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/employment-authorization-for-certain-h-4-dependent-spouses',
  },
  biometrics: {
    label: 'Preparing for Your Biometric Services Appointment',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/filing-guidance/preparing-for-your-biometric-services-appointment',
  },
  inquiries: {
    label: 'Case inquiries (e-Request)',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/e-request/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'h4-extension-status-i539';

export const h4ExtensionStatusGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'H-4 Extension Status: How to Track Form I-539, What Each Update Means, and What Happens While It Is Pending',
  seoTitle: 'H-4 Extension Status: Track Your I-539 Case (2026)',
  description:
    'Check an H-4 extension or change-of-status case with the I-539 receipt, decode the status messages, see how it relates to the H-1B I-129 and the H-4 EAD I-765, and know your position while it is pending.',
  category: 'USCIS',
  tags: [
    'H4 extension status',
    'H4 case status',
    'I-539 status',
    'H-4 status check',
    'H-4 change of status',
  ],
  readTime: '8 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  showContents: true,
  hub: 'case-status',
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the three H-family receipts, I-129, I-539 and I-765, tracked side by side.',
  imageCaption:
    'An H-4 family often has three USCIS cases open at once. Each has its own receipt and its own result.',
  directAnswer:
    'An H-4 extension or change of status is tracked with the Form I-539 receipt number, entered at USCIS Case Status Online or in the USCIS online account used to file it. It is a separate case from the principal’s H-1B petition (Form I-129) and from any H-4 EAD application (Form I-765), and the three can be decided on different days. A timely filed I-539 keeps you in a period of authorized stay while it is pending, and H-4 premium processing is available when filed with or after a premium-processed I-129.',
  keyTakeaways: [
    'Three receipts, three cases: I-129 for the H-1B worker, I-539 for the H-4 status, I-765 for the H-4 EAD. Track each one.',
    'A timely I-539 preserves lawful presence while pending, but it does not authorize work; only an approved, valid H-4 EAD does.',
    'An I-539 usually requires biometrics; a missed appointment can lead to denial.',
    'If the H-1B petition is denied or withdrawn, the dependent I-539 generally cannot be approved either.',
  ],
  sections: [
    {
      heading: 'Which receipt tracks the H-4 extension',
      paragraphs: [
        'H-4 status is requested on Form I-539, filed by the dependent spouse or parent on behalf of the family members listed on it (children are added on Form I-539A). The I-539 receipt number, on the I-797C notice or in the USCIS online account, is the number to use. It is different from the I-129 receipt for the H-1B worker, which belongs to the employer, and from the I-765 receipt for an H-4 EAD if one was filed.',
        'Searches for "H4 case status" usually mean one of these three forms. If the question is whether you can keep living in the United States, track the I-539. If the question is whether you can work, track the I-765 and read the H-4 EAD guide. If the question is whether the whole family’s status continues, start with the I-129, because the H-4 cases depend on it.',
      ],
      table: {
        caption: 'The three cases an H-4 family may have open at once.',
        columns: ['Form', 'Who is the applicant', 'What it decides', 'Receipt goes to'],
        rows: [
          ['I-129 (H-1B)', 'The employer, for the H-1B worker', 'Whether the worker gets or keeps H-1B status', 'Employer or attorney'],
          ['I-539 (H-4)', 'The spouse, with children on I-539A', 'Whether the dependents get or keep H-4 status', 'The spouse, or the online account'],
          ['I-765 (H-4 EAD, category c26)', 'The spouse', 'Whether the spouse may work', 'The spouse'],
        ],
      },
      links: [
        { label: 'H-4 EAD case status tracking', href: '/blog/h4-ead-case-status-tracking' },
        { label: 'H-1B case status tracker', href: '/blog/h1b-case-status-tracker' },
      ],
      sources: [src.i539, src.status],
    },
    {
      heading: 'I-539 status messages and what they mean',
      paragraphs: [
        'The I-539 follows the standard USCIS status sequence with one extra step most applicants see: a biometrics appointment. The messages below are listed in the usual order.',
      ],
      table: {
        caption: 'Common Form I-539 status messages for an H-4 extension or change of status.',
        columns: ['Status message', 'What it means', 'What to do'],
        rows: [
          ['Case Was Received', 'USCIS accepted the I-539 and fee. Your period of authorized stay begins if the filing was timely.', 'Save the receipt notice; note the filing date relative to your I-94 expiry.'],
          ['Fingerprint Fee Was Received / Biometrics appointment notice', 'An ASC appointment will be or has been scheduled for each applicant.', 'Attend or reschedule before the date. A missed appointment can lead to denial.'],
          ['Case Is Being Actively Reviewed', 'The case is in the queue. Not a decision date.', 'Nothing. Compare against the processing-times tool.'],
          ['Request for Evidence Was Sent', 'USCIS wants proof of the relationship, the principal’s status, or financial support.', 'Respond before the deadline; the premium clock pauses.'],
          ['Case Was Approved', 'H-4 status is extended or granted. A new I-94 is printed on the I-797A.', 'Check the I-94 dates against the H-1B approval; keep both notices together.'],
          ['Case Was Denied', 'Status was not extended. The notice explains the reason and any options.', 'Read it with counsel immediately; the period of authorized stay ends.'],
        ],
      },
      note: 'The H-4 approval dates are tied to the principal’s H-1B validity. If the I-539 is approved before the I-129, the H-4 end date may match the old H-1B period, and a further extension is needed later. Check the dates on every approval notice rather than assuming they line up.',
      sources: [src.status, src.biometrics],
    },
    {
      heading: 'How long an H-4 extension takes, and premium processing',
      paragraphs: [
        'I-539 processing times are published by form and category in the USCIS processing-times tool and have ranged from a few months to well over a year for regular processing in recent years, depending on the center and the biometrics backlog. The most reliable way to shorten the wait is to file the I-539 together with a premium-processed I-129, or to add premium processing to a pending I-539 whose underlying I-129 was premium processed. USCIS then commits to an action within 30 business days for the I-539 once biometrics are complete.',
        'Filing online through a USCIS account gives you the case history, biometrics notices and the ability to respond to an RFE without mail delays. Paper filings can be linked to an account with the online access code printed on the receipt notice.',
      ],
      links: [
        { label: 'File Form I-539 online', href: src.i539online.url },
        { label: 'Premium processing compared across forms', href: '/blog/premium-processing-opt-stem-opt-2026-complete-guide' },
      ],
      sources: [src.times, src.premium, src.i539online],
    },
    {
      heading: 'Your position while the I-539 is pending',
      paragraphs: [
        'A timely filed I-539, filed before the current I-94 expires, places you in a period of authorized stay while USCIS decides. You do not accrue unlawful presence during that period even if the I-94 date passes. You are not, however, in H-4 status again until the approval, which matters for some benefits and for travel: leaving the United States while the extension is pending is treated as abandoning it, and you would need a valid H-4 visa to return.',
        'Work is a separate question. H-4 status alone never authorizes employment. An H-4 EAD requires an approved I-765 under category (c)(26), and a renewal filed on or after October 30, 2025 generally does not extend an expiring card while pending, with limited exceptions. If the H-4 EAD is tied to a pending I-539, the I-765 cannot be approved until the I-539 is, which is why premium processing on the I-539 often matters more to the spouse than to the principal.',
      ],
      numbered: [
        'File the I-539 before the I-94 end date, with the I-129 whenever possible.',
        'Keep the receipt notice as proof of the pending extension.',
        'Do not travel internationally while the I-539 is pending without advice.',
        'Track the I-765 separately if an H-4 EAD is also pending.',
      ],
      links: [
        { label: 'H-4 EAD rules for OPT spouses', href: '/blog/h4-ead-opt-spouse-work-authorization' },
      ],
      sources: [src.i539, src.h4ead],
    },
    {
      heading: 'When the H-1B case changes',
      paragraphs: [
        'The dependent I-539 rises and falls with the principal’s H-1B. If the I-129 is denied, withdrawn or revoked, the I-539 generally cannot be approved, and the family’s period of authorized stay ends when the H-1B worker’s does. If the worker changes employers, the new employer’s I-129 does not automatically carry the dependents; a new I-539 is usually filed with it so the H-4 dates follow the new H-1B dates.',
        'A layoff is the most common surprise. The 60-day grace period after H-1B employment ends applies to the worker; dependents share it. Filing a change of status for the spouse, for example to F-1 for a degree or to H-1B through their own employer, is handled on a new I-539 or I-129 and should be started well inside the grace period.',
      ],
      links: [
        { label: 'H-1B transfer and portability', href: '/blog/h1b-transfer-portability-while-on-opt' },
        { label: 'H-1B alternatives and other work visas', href: '/blog/h1b-alternatives-work-visas' },
      ],
      sources: [src.i539],
    },
    {
      heading: 'Example: Arun’s H-1B is approved but Divya’s I-539 is not',
      paragraphs: [
        'Fictional example: Arun’s employer premium-processed his H-1B extension and it was approved in two weeks. Divya’s I-539, filed on paper a month later without premium processing, still shows "Case Is Being Actively Reviewed" after her biometrics appointment. Her I-94 has expired.',
        'Divya is in a period of authorized stay because the I-539 was filed on time, so she is not accruing unlawful presence. She does not travel. Her employer asks whether she can keep working; her H-4 EAD renewal is also pending and was filed after October 30, 2025, so the old card does not extend automatically. She and Arun ask counsel about adding premium processing to the I-539 so that the I-765 can be decided sooner.',
      ],
    },
  ],
  checklist: [
    'Track I-129, I-539 and I-765 receipts separately.',
    'Note the I-94 expiry and the I-539 filing date.',
    'Attend the biometrics appointment or reschedule before it.',
    'Check approval-notice dates against the H-1B period.',
  ],
  mistakes: [
    'Reading the H-1B approval as proof that H-4 status was extended.',
    'Travelling while the I-539 is pending.',
    'Starting or continuing work on a pending H-4 EAD renewal without checking the current rule.',
    'Forgetting to file a new I-539 when the worker changes employers.',
  ],
  faq: [
    {
      question: 'How do I check my H-4 extension status?',
      answer:
        'Enter the Form I-539 receipt number at USCIS Case Status Online, or open the case in the USCIS online account used to file it. The H-1B I-129 and the H-4 EAD I-765 are separate cases with their own receipts.',
    },
    {
      question: 'Can I stay in the US while my H-4 extension is pending?',
      answer:
        'Yes, if the I-539 was filed before your I-94 expired. You are in a period of authorized stay until USCIS decides. Leaving the country while it is pending abandons the request.',
    },
    {
      question: 'Is premium processing available for an H-4 extension?',
      answer:
        'Yes. Form I-907 can be filed for an I-539 that is filed with, or whose underlying I-129 was, premium processed. USCIS then commits to an action within 30 business days after biometrics.',
    },
    {
      question: 'Why was my H-4 approved with an end date earlier than my spouse’s new H-1B?',
      answer:
        'The I-539 was likely decided before the I-129, so the H-4 dates matched the old H-1B period. A further I-539 is needed to align the dates.',
    },
    {
      question: 'Does a pending I-539 let me work?',
      answer:
        'No. H-4 status does not authorize employment. Work requires an approved, unexpired H-4 EAD, and most renewals filed on or after October 30, 2025 do not extend automatically while pending.',
    },
  ],
  sources: [src.status, src.i539, src.i539online, src.times, src.premium, src.h4ead, src.biometrics, src.inquiries],
  related: [
    { label: 'H-4 EAD case status tracking', href: '/blog/h4-ead-case-status-tracking' },
    { label: 'H-4 EAD and OPT spouses', href: '/blog/h4-ead-opt-spouse-work-authorization' },
    { label: 'H-1B case status tracker', href: '/blog/h1b-case-status-tracker' },
    { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
  ],
});
