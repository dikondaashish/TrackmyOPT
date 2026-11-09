import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "h1b case status tracker" (198 impressions a quarter at position 6.5) and
// "opt to h1b" (488 impressions at position 9.9) had no page that explains
// how an H-1B petition is tracked after OPT. Generic USCIS tracking CTA: the
// OPT decision-window estimate does not apply to Form I-129.

const src = {
  status: {
    label: 'Check your immigration case status',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  i129: {
    label: 'Form I-129, Petition for a Nonimmigrant Worker',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-129',
  },
  h1b: {
    label: 'H-1B Specialty Occupations',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  },
  registration: {
    label: 'H-1B Electronic Registration Process',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-electronic-registration-process',
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
  capGap: {
    label: 'Cap-Gap Extension',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/cap-gap-extension',
  },
  inquiries: {
    label: 'Case inquiries (e-Request)',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/e-request/',
  },
  i94: {
    label: 'Form I-94 and travel history',
    publisher: 'U.S. Customs and Border Protection',
    url: 'https://i94.cbp.dhs.gov/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'h1b-case-status-tracker';

export const h1bCaseStatusGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'H-1B Case Status Tracker: How to Track an I-129 Petition After OPT, From Registration to Approval',
  seoTitle: 'H-1B Case Status Tracker: Track Your I-129 Petition (2026)',
  description:
    'Track an H-1B petition after OPT: the receipt number to use, what each I-129 status means, premium processing clocks, cap-gap coverage, and what to do when the case sits in review.',
  category: 'USCIS',
  tags: [
    'H-1B case status',
    'H1B tracker',
    'I-129 status',
    'OPT to H-1B',
    'H-1B premium processing',
    'cap-gap',
  ],
  readTime: '9 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  showContents: true,
  hub: 'case-status',
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the H-1B path from registration through I-129 receipt, review and approval.',
  imageCaption:
    'The H-1B stages an OPT worker tracks. Generated from the USCIS process described in this guide.',
  directAnswer:
    'An H-1B petition is tracked with the Form I-129 receipt number on the I-797C notice your employer or its attorney receives, entered at USCIS Case Status Online. The registration confirmation number from the March lottery is not a case and cannot be tracked there. Regular I-129 processing is measured in months in the USCIS processing-times tool; premium processing has a 15-business-day target. If the petition requests a change of status from F-1 and was filed on time, cap-gap rules keep your OPT work authorization running while the case is pending.',
  keyTakeaways: [
    'Three different numbers appear in an H-1B journey: the registration confirmation number, the I-129 receipt number, and the I-797 approval notice number. Only the receipt number tracks the case.',
    'The employer is the petitioner, so USCIS mails notices to the employer or attorney. Ask for the receipt number and copies of every notice; you have a right to know the status of your own case.',
    'A pending or approved I-129 does not by itself change your OPT or STEM OPT EAD. Cap-gap and the October 1 start date are what change your work authorization, and both have conditions.',
    'Premium processing promises a USCIS action within 15 business days, which may be an RFE rather than an approval.',
  ],
  sections: [
    {
      heading: 'Which number tracks an H-1B case',
      paragraphs: [
        'The H-1B process produces three numbers that are easy to confuse. The registration confirmation number comes from the electronic registration in March and looks different from a receipt number; it proves the employer entered you in the selection process, but it is not a case and returns nothing in Case Status Online. The I-129 receipt number appears on the I-797C Notice of Action after the employer files the petition, usually between April and June for a cap case, and is the number you track. The I-797A or I-797B approval notice is the result.',
        'Because the employer is the petitioner, every notice goes to the employer or its attorney. Ask HR or the attorney for the receipt number as soon as the case is filed, and for a copy of the receipt notice. You are the beneficiary and are entitled to know the case status, even though you cannot file inquiries on the petition yourself.',
      ],
      table: {
        caption: 'The three H-1B numbers and what each one does.',
        columns: ['Number', 'Where it comes from', 'Can you track it?', 'What it proves'],
        rows: [
          ['Registration confirmation number', 'USCIS registration in March', 'No', 'The employer registered you; later, that you were selected'],
          ['I-129 receipt number (13 characters, e.g. WAC2612345678 or IOE...)', 'I-797C receipt notice after filing', 'Yes, Case Status Online', 'A petition is pending'],
          ['I-797A/B approval notice', 'Mailed on approval', 'Not needed', 'Approved; I-797A includes a new I-94 if status was changed'],
        ],
      },
      links: [
        { label: 'How to read a USCIS receipt number', href: '/blog/ioe-receipt-number-elis-case-status' },
        { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
      ],
      sources: [src.registration, src.i129, src.status],
    },
    {
      heading: 'I-129 status messages, in order',
      paragraphs: [
        'The public status messages for an I-129 are the same ones used for other forms. The practical meaning differs because the petition belongs to the employer and because H-1B petitions often request a change of status for someone already in the United States.',
      ],
      table: {
        caption: 'Common Form I-129 status messages for an H-1B petition.',
        columns: ['Status message', 'What it means for an H-1B beneficiary', 'What to do'],
        rows: [
          ['Case Was Received', 'USCIS accepted the petition and fees. For a cap case this is usually April to June.', 'Save the receipt number. Check whether premium processing was requested.'],
          ['Premium Processing Fee Was Received', 'The 15-business-day clock started on the date USCIS received the I-907.', 'Count business days from that date; USCIS must act, which can mean an RFE.'],
          ['Case Is Being Actively Reviewed', 'An officer or system touched the case. Not a decision date.', 'Nothing. Regular cases sit here for months.'],
          ['Request for Evidence Was Sent', 'USCIS wants more documents, usually about the job, the degree match or the employer.', 'The employer or attorney responds; the premium clock pauses until the reply arrives.'],
          ['Case Was Approved', 'The petition is approved. If a change of status was granted, H-1B status begins on the start date in the notice, typically October 1 for a cap case.', 'Get a copy of the I-797A; check the I-94 attached to it.'],
          ['Case Was Approved, consular notification', 'Approved without a change of status. You must get an H-1B visa stamp abroad and re-enter to start H-1B.', 'Plan the consular appointment and travel with the employer.'],
          ['Case Was Denied', 'The petition was denied; the notice explains why and whether a motion or appeal is possible.', 'Read the notice with counsel. Check how the denial affects cap-gap and your OPT.'],
        ],
      },
      note: 'A beneficiary cannot submit an e-Request on an I-129. If the case is outside normal processing time, the employer or attorney files the inquiry. Keep your own log of the status dates so you can hand it over.',
      sources: [src.status, src.i129],
    },
    {
      heading: 'How long an H-1B petition takes',
      paragraphs: [
        'Regular processing for an I-129 H-1B petition is published in the USCIS processing-times tool by service center and is usually several months for cap cases filed in spring. Premium processing, requested on Form I-907 for an additional fee, commits USCIS to take an action within 15 business days of receiving the request. That action can be an approval, a denial, an RFE or a notice of intent to deny; after an RFE response, a new 15-business-day period begins.',
        'For a change-of-status cap case the timing question is whether the approval arrives before October 1. If it does, H-1B status starts on October 1 and you move from OPT to H-1B that day. If it does not, cap-gap rules keep you in F-1 status with work authorization while the petition is pending, as long as the petition was timely filed and requested a change of status.',
      ],
      table: {
        caption: 'Timing checkpoints in a cap-subject H-1B case for an OPT worker.',
        columns: ['Checkpoint', 'When', 'What it depends on'],
        rows: [
          ['Registration and selection', 'March', 'Employer registers you; USCIS notifies selections by about March 31'],
          ['I-129 filing window', 'April 1 to about June 30', 'Employer files within the 90-day window for selected registrations'],
          ['Receipt notice', '1 to 3 weeks after filing', 'Lockbox or online intake'],
          ['Regular processing decision', 'Several months; see the processing-times tool', 'Service center workload, RFEs'],
          ['Premium processing action', '15 business days from the I-907 receipt', 'Pauses on RFE; restarts on response'],
          ['H-1B status start', 'October 1 for a cap case', 'Approval with change of status; otherwise consular processing'],
        ],
      },
      links: [
        { label: 'Premium processing for OPT and STEM OPT compared', href: '/blog/premium-processing-opt-stem-opt-2026-complete-guide' },
        { label: 'H-1B change of status vs consular processing', href: '/blog/h1b-change-of-status-vs-consular-processing-opt' },
      ],
      sources: [src.times, src.premium],
    },
    {
      heading: 'Cap-gap: what the pending petition does to your OPT',
      paragraphs: [
        'The cap-gap rule bridges the period between the end of OPT or STEM OPT and the start of H-1B status. If the employer filed a timely cap-subject H-1B petition requesting a change of status while your OPT was valid, your F-1 status and work authorization are extended automatically while the petition is pending and, if approved, until the H-1B start date, subject to the current regulation’s outer limit. Ask your DSO for an updated I-20 showing the cap-gap extension; employers and I-9 verifiers rely on it.',
        'The extension ends early if the petition is denied, rejected, withdrawn or revoked. That is why the I-129 status matters to an OPT worker: a denial notice is also the date your cap-gap work authorization stops, and the 60-day grace period rules then apply. Track the petition yourself rather than waiting to hear from the employer.',
      ],
      numbered: [
        'Confirm with the employer that the petition requested a change of status, not consular notification.',
        'Confirm the filing date falls while your OPT or STEM OPT EAD was still valid.',
        'Get the cap-gap I-20 from the DSO and keep it with the I-129 receipt notice.',
        'Watch the I-129 status; a denial or withdrawal ends the extension.',
      ],
      links: [
        { label: 'H-1B cap-gap extension explained', href: '/blog/h1b-cap-gap-extension' },
        { label: 'Cap-gap after a denial, rejection, withdrawal or layoff', href: '/blog/h1b-cap-gap-denial-rejection-withdrawal-layoff' },
      ],
      sources: [src.capGap],
    },
    {
      heading: 'After approval: I-94, start date and travel',
      paragraphs: [
        'An I-797A approval with a change of status includes a new I-94 at the bottom of the notice. Its validity dates become your period of authorized stay in H-1B. Check the name, dates and class of admission against the petition, because a typo on the I-94 can affect later extensions and travel. Your CBP online I-94 record is not updated by a change of status approved inside the country; the paper I-94 on the I-797A controls until you next enter the United States.',
        'If the approval is for consular notification, you remain in your current status and must obtain an H-1B visa at a consulate and re-enter before H-1B status begins. Travel while a change-of-status petition is pending is treated as abandoning the change-of-status request, so plan international trips with the employer’s attorney before booking anything.',
      ],
      links: [
        { label: 'I-94 travel history for OPT and H-1B holders', href: '/blog/i94-travel-history-opt-h1b' },
        { label: 'OPT to H-1B transition checklist', href: '/blog/opt-to-h1b-transition' },
      ],
      sources: [src.i94, src.h1b],
    },
    {
      heading: 'Tracking the petition alongside your OPT case',
      paragraphs: [
        'Most OPT workers reach H-1B with at least two live USCIS cases: the I-765 for OPT or STEM OPT and the I-129 for H-1B, sometimes with an I-140 behind them. Each has its own receipt and its own meaning. TrackMyOPT stores all of them, checks USCIS for changes and emails you when a status moves, so a denial on the I-129 or an approval on the I-765 does not go unnoticed for days. The free plan holds the receipts and refreshes on demand; Pro checks daily.',
        'The community decision-window estimate on TrackMyOPT is built from OPT and STEM OPT timelines and does not estimate I-129 decisions. For an H-1B, use the USCIS processing-times tool for the relevant service center and form type.',
      ],
      links: [
        { label: 'How TrackMyOPT case tracking works', href: '/features/case-status' },
        { label: 'I-140 tracker for the next step', href: '/blog/i-140-case-status-tracking' },
      ],
      sources: [src.times, src.inquiries],
    },
    {
      heading: 'Example: Meera’s petition is still pending on October 1',
      paragraphs: [
        'Fictional example: Meera’s employer filed her cap-subject H-1B change-of-status petition in May while her STEM OPT EAD was valid. On October 1 the I-129 still says "Case Is Being Actively Reviewed" and her STEM OPT EAD expired on September 20.',
        'She confirms with her DSO that her cap-gap I-20 is on file, and with HR that the petition requested a change of status. Her work authorization continues under cap-gap while the petition is pending. She keeps checking the I-129; when it is approved in November with a new I-94, her H-1B status begins on the date in the notice and she gives HR the I-797A for the I-9 update.',
      ],
    },
  ],
  checklist: [
    'Get the I-129 receipt number and a copy of the receipt notice from the employer.',
    'Note whether premium processing was requested and when the I-907 was received.',
    'Confirm change of status vs consular notification before October 1.',
    'Hold the cap-gap I-20 and watch the I-129 for a denial or withdrawal.',
  ],
  mistakes: [
    'Trying to track the registration confirmation number in Case Status Online.',
    'Assuming an approved I-129 with consular notification lets you start work without a visa stamp.',
    'Travelling abroad while a change-of-status petition is pending.',
    'Letting a cap-gap extension run without the updated I-20.',
  ],
  faq: [
    {
      question: 'How do I check my H-1B case status?',
      answer:
        'Enter the Form I-129 receipt number from the I-797C notice at USCIS Case Status Online. The employer or attorney receives the notice; ask them for the number. The registration confirmation number cannot be tracked.',
    },
    {
      question: 'How long does H-1B approval take after the receipt notice?',
      answer:
        'Regular processing is published by service center in the USCIS processing-times tool and is usually several months for cap cases. Premium processing commits USCIS to an action within 15 business days of receiving Form I-907.',
    },
    {
      question: 'Can I keep working on OPT while my H-1B is pending?',
      answer:
        'Yes, if the cap-gap conditions are met: a timely filed cap-subject petition requesting a change of status while your OPT or STEM OPT EAD was valid. The extension ends if the petition is denied, rejected, withdrawn or revoked.',
    },
    {
      question: 'What does "Case Was Approved" mean for my start date?',
      answer:
        'If a change of status was granted, H-1B status starts on the date on the I-797A, usually October 1 for a cap case. If the approval is consular notification, you need an H-1B visa stamp and re-entry first.',
    },
    {
      question: 'Can TrackMyOPT estimate when my H-1B will be approved?',
      answer:
        'It can track the I-129 status and alert you on changes. Its decision-window estimates are built from OPT and STEM OPT timelines, not I-129 cases.',
    },
  ],
  sources: [src.status, src.i129, src.h1b, src.registration, src.times, src.premium, src.capGap, src.i94],
  related: [
    { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
    { label: 'H-1B cap-gap extension', href: '/blog/h1b-cap-gap-extension' },
    { label: 'H-1B transfer and portability while on OPT', href: '/blog/h1b-transfer-portability-while-on-opt' },
    { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
  ],
});
