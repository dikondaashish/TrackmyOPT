import { defineArticle } from './shared';
import {
  STATUS_GUIDE_DATE,
  TRACKER_DATA_NOTE,
  statusSources as src,
} from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "travel while opt is pending", "opt pending travel abroad",
// "travel while opt extension is pending", "stem opt pending travel".
// Published before winter break. The ICE FAQ is the controlling source.

const SLUG = 'travel-while-opt-pending';

export const travelWhileOptPendingGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title: 'Travel While OPT or STEM OPT Is Pending: Rules, Risks and Documents',
  seoTitle: 'Travel While OPT Is Pending: Rules, Risks, Documents',
  description:
    'You may reenter while an OPT application is pending, but ICE says to travel with caution. The risks by situation, the biometrics problem, and the documents to carry.',
  category: 'Travel',
  tags: [
    'travel while OPT is pending',
    'OPT pending travel abroad',
    'travel while STEM OPT pending',
    'OPT reentry documents',
    'winter break travel OPT',
  ],
  readTime: '6 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: travel while OPT is pending is allowed but risky, and biometrics notices arrive within about a week.',
  imageCaption:
    'Travel during a pending OPT case is allowed, with real risks.',
  dataNote: TRACKER_DATA_NOTE,
  directAnswer:
    'Yes, you may reenter the United States while your OPT application is pending, but ICE says to do so with caution. USCIS can send a biometrics notice or a request for evidence while you are away. If the case is approved while you are abroad, you are expected to have the EAD in hand to reenter, and USCIS mails it only to your U.S. address. A denial after your program end date means you cannot return.',
  keyTakeaways: [
    'Travel is allowed while OPT is pending. It is not recommended.',
    'Biometrics notices came a median of 7 days after receipt in tracked cases.',
    'If approved while abroad, you need the physical EAD to reenter.',
    'Once a STEM applicant\'s OPT EAD has expired, do not travel.',
  ],
  sections: [
    {
      heading: 'What ICE says',
      paragraphs: [
        'The ICE travel page for F-1 students answers the question directly. You can reenter while a request for OPT is pending, but it should be undertaken with caution.',
        'It gives two reasons. USCIS may send a request for evidence while you are away, and if USCIS approves the application you will be expected to have the EAD in hand to reenter. USCIS can send both only to your U.S. address.',
        'The page also says you cannot reenter during the 60-day period after your program or OPT ends.',
      ],
      sources: [src.sevpTravel],
    },
    {
      heading: 'Risk by situation',
      paragraphs: [
        'The risk depends on where you are in the timeline.',
      ],
      table: {
        caption: 'Travel risk while an OPT or STEM OPT application is pending.',
        columns: ['Your situation', 'Can you reenter?', 'Main risk'],
        rows: [
          ['OPT pending, program not finished yet', 'Yes, as a continuing student', 'Missing a biometrics appointment'],
          ['OPT pending, program finished', 'Yes, with caution', 'A denial abroad ends your F-1 status'],
          ['OPT approved while you are abroad', 'Only with the EAD in hand', 'The card is mailed to your U.S. address'],
          ['STEM OPT pending, OPT EAD still valid', 'Yes, as an OPT worker', 'Missing a notice or biometrics'],
          ['STEM OPT pending, OPT EAD expired', 'Schools advise against travel', 'A denial abroad means no return'],
          ['F-1 visa expired', 'Not until you have a new visa', 'No new visa until the EAD is approved'],
        ],
      },
      note: 'Berkeley\'s international office states the last three rows plainly: travel during the application is allowed but not recommended.',
      sources: [src.sevpTravel, src.berkeleyTravel],
    },
    {
      heading: 'The biometrics problem',
      paragraphs: [
        'Most OPT applicants now get a biometrics appointment. In 1,980 tracked I-765 cases, the notice came a median of 7 days after the receipt date, and 9 in 10 came within 22 days.',
        'You cannot give biometrics from abroad. To move the appointment, you must ask through your USCIS online account before the appointment time and show a good reason. If you miss it, USCIS may treat the application as abandoned and deny it.',
        'So the worst time to leave is the first three weeks after filing.',
      ],
      links: [
        { label: 'OPT biometrics appointment in 2026', href: '/blog/opt-biometrics-appointment-2026' },
        { label: '"Fingerprints Were Taken": what comes next', href: '/blog/fingerprints-were-taken-uscis-status-i765' },
      ],
      sources: [src.biometrics],
    },
    {
      heading: 'Documents to carry',
      paragraphs: [
        'Carry originals. Ask your DSO to check the list for your case before you book.',
      ],
      bullets: [
        'Passport, valid for at least six months.',
        'Valid F-1 visa. An expired visa cannot be renewed while the case is pending.',
        'I-20 with the OPT recommendation and a recent travel signature.',
        'I-797C receipt notice for the pending I-765.',
        'EAD, if it is approved before you return.',
        'Job offer or employment letter, if you have one.',
      ],
      links: [
        { label: 'OPT travel signature on the I-20', href: '/blog/opt-travel-signature-i20' },
        { label: 'Can you travel on OPT? Complete guide', href: '/blog/can-you-travel-on-opt-complete-guide' },
        { label: 'Renewing an F-1 visa on OPT', href: '/blog/renewing-f1-visa-on-opt' },
      ],
      sources: [src.sevpTravel, src.berkeleyTravel],
    },
    {
      heading: 'If you must travel',
      figure: {
        src: '/blog/illustrations/travel-while-opt-pending.webp',
        alt: 'Painted illustration of a carry-on suitcase by an apartment door in winter, with a passport and a folded paper on top.',
        caption: 'Carry the receipt notice, I-20, visa and passport. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'Some trips cannot wait. These steps lower the risk.',
      ],
      numbered: [
        'Wait until biometrics are done, if you can.',
        'Keep the trip short and return before your program end date if possible.',
        'Ask someone you trust to check your U.S. mail every day.',
        'Check your USCIS online account daily for notices.',
        'Have a plan to get the EAD sent to you if the case is approved.',
        'Talk to your DSO before you book.',
      ],
      links: [
        { label: 'Moving while OPT is pending: EAD delivery', href: '/blog/moving-while-opt-pending-ead-delivery' },
        { label: 'STEM OPT pending past 180 days', href: '/blog/stem-opt-pending-after-180-days' },
      ],
      sources: [src.sevpTravel, src.delivery],
    },
  ],
  checklist: [
    'Ask your DSO before you book.',
    'Check that your F-1 visa is valid for the return date.',
    'Get a recent travel signature on the I-20.',
    'Carry the I-797C receipt notice.',
    'Arrange for someone to watch your U.S. mail.',
  ],
  mistakes: [
    'Leaving in the first three weeks after filing.',
    'Travelling with an expired F-1 visa while the case is pending.',
    'Assuming an approval notice is enough to reenter without the card.',
    'Travelling after the OPT EAD expired with STEM OPT still pending.',
  ],
  faq: [
    {
      question: 'Can I travel while my OPT is pending?',
      answer:
        'Yes, but ICE says to do it with caution. You may miss a biometrics notice or a request for evidence, and you need the EAD to reenter if the case is approved while you are away.',
    },
    {
      question: 'Can I reenter with only the OPT receipt notice?',
      answer:
        'While the case is still pending, yes, with your I-20, valid visa and passport. Once it is approved, you are expected to have the EAD in hand.',
    },
    {
      question: 'What if my OPT is approved while I am abroad?',
      answer:
        'USCIS mails the EAD to your U.S. address. Someone must send it to you before you return.',
    },
    {
      question: 'What if my OPT is denied while I am abroad?',
      answer:
        'If your program end date has passed, you cannot reenter or reapply, and your F-1 status ends.',
    },
    {
      question: 'Can I travel while my STEM OPT extension is pending?',
      answer:
        'Before your OPT EAD expires, you travel as any OPT worker does. After it expires, schools advise against travel because a denial abroad means you cannot return.',
    },
    {
      question: 'Can I renew my F-1 visa while OPT is pending?',
      answer:
        'Berkeley\'s international office says no. You can apply for a new F-1 visa only after the application is approved and you have the EAD.',
    },
  ],
  sources: [src.sevpTravel, src.berkeleyTravel, src.biometrics, src.delivery],
  related: [
    { label: 'Can you travel on OPT? Complete guide', href: '/blog/can-you-travel-on-opt-complete-guide' },
    { label: 'OPT travel signature on the I-20', href: '/blog/opt-travel-signature-i20' },
    { label: 'STEM OPT pending past 180 days', href: '/blog/stem-opt-pending-after-180-days' },
    { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
  ],
});
