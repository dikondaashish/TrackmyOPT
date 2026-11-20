import { defineArticle } from './shared';
import { STATUS_GUIDE_DATE, statusSources as src } from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "opt api update", "stem opt silent api update", "i-765 silent
// update", "uscis case status api reddit". No explainer ranks. USCIS does not
// define the term, so this post says only what can be verified.

const SLUG = 'uscis-silent-update-api-update-meaning';

export const uscisSilentUpdateGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'USCIS Silent Update or "API Update": What It Means for Your OPT or STEM OPT Case',
  seoTitle: 'USCIS Silent Update (API Update): What It Means',
  description:
    'A "silent update" is a change in a case\'s last-updated date with no new status message. USCIS does not define it. What it can and cannot tell you about an OPT, STEM OPT or other I-765 case.',
  category: 'USCIS',
  tags: [
    'USCIS silent update',
    'API update',
    'OPT API update',
    'STEM OPT silent update',
    'I-765 silent update',
  ],
  readTime: '5 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: a silent update is a date change with no new USCIS status message.',
  imageCaption:
    'A silent update changes a date on the case, not the status message.',
  directAnswer:
    'A "silent update" or "API update" is a community term. It means the last-updated date on a USCIS case changed while the status message stayed the same. USCIS does not define the term or say what triggers it. It is not a decision and not a notice. The only updates that change what you should do are a new status message or a notice in your USCIS account or mailbox.',
  keyTakeaways: [
    'It is a date change with no new status message.',
    'USCIS has published no definition and no list of causes.',
    'It does not mean approval, an RFE or a denial is coming.',
    'Act on status messages and notices only.',
  ],
  sections: [
    {
      heading: 'What people mean by a silent update',
      paragraphs: [
        'USCIS shows one short status message per case. Behind that message the case record also carries dates. Some apps and browser tools read those dates and show a "last updated" value.',
        'When that value changes and the message does not, applicants call it a silent update. "API update" is the same thing, named after the data feed the tools read.',
        'USCIS does run an official Case Status API for developers. Its terms say a vendor may not look up receipt numbers for people who are not its users without their consent.',
      ],
      sources: [src.status, src.api],
    },
    {
      heading: 'What it can and cannot tell you',
      paragraphs: [
        'USCIS has not said what causes a date to change. Anything more specific is a guess, including the common claim that approval follows within days.',
      ],
      table: {
        caption: 'What a silent update does and does not show.',
        columns: ['Claim', 'Supported?', 'Why'],
        rows: [
          ['Something touched the case record', 'Likely', 'A date changed.'],
          ['An officer is reviewing the file', 'Unknown', 'USCIS does not say what triggers the change.'],
          ['Approval is coming soon', 'No', 'No official source links the two.'],
          ['An RFE or denial is coming', 'No', 'Those arrive as a status message and a notice.'],
          ['You need to do something', 'No', 'USCIS tells you by notice when it needs anything.'],
        ],
      },
      note: 'Forum posts that say "approved three days after my silent update" are real stories. They do not show how many people saw an update and waited weeks more.',
      sources: [src.status],
    },
    {
      heading: 'The updates that do matter',
      paragraphs: [
        'These change what you should do. Check them in your USCIS online account, which also holds copies of notices.',
      ],
      bullets: [
        'A new status message, such as a biometrics appointment, a request for evidence, approval or card production.',
        'A notice in the Documents tab of your account or in the mail.',
        'A premium processing clock that starts, stops or restarts.',
        'A receipt date that falls outside the posted processing time, which opens a case inquiry.',
      ],
      links: [
        { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
        { label: 'OPT RFE: reasons and how to respond', href: '/blog/opt-rfe-request-for-evidence-i765' },
        { label: '"Case Is Being Actively Reviewed": what it means', href: '/blog/case-is-being-actively-reviewed-uscis-meaning' },
      ],
      sources: [src.status, src.times],
    },
    {
      heading: 'What to do after a silent update',
      paragraphs: [
        'Nothing new is required. A short routine keeps you from missing a real change.',
      ],
      numbered: [
        'Open your USCIS account and look for an unread notice.',
        'Confirm your mailing address is current.',
        'Compare your receipt date with the USCIS processing time for your category.',
        'For OPT or STEM OPT, decide on premium processing from your start date, not from the update.',
      ],
      links: [
        { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
        { label: 'When will USCIS decide my OPT? Decision window', href: '/blog/when-will-uscis-decide-my-opt-decision-window' },
      ],
      sources: [src.times, src.address],
    },
    {
      heading: 'How TrackMyOPT treats it',
      paragraphs: [
        'TrackMyOPT alerts you when the USCIS status message for your case changes. A date change with the same message is not treated as a status change, so you do not get an email for it.',
        'We check only receipts that our users save. The USCIS notice remains the official record of any decision.',
      ],
      links: [
        { label: 'How case tracking works', href: '/features/case-status' },
      ],
      sources: [src.api],
    },
  ],
  checklist: [
    'Check your USCIS account for a new notice.',
    'Confirm your mailing address.',
    'Compare your receipt date with posted processing times.',
    'Keep your employer and DSO informed with real status messages only.',
  ],
  mistakes: [
    'Telling an employer a start date based on a silent update.',
    'Skipping premium processing because an update "means approval is close".',
    'Giving your receipt number to an unknown site to see hidden dates.',
    'Missing a real notice while watching a date field.',
  ],
  faq: [
    {
      question: 'What is a silent update on a USCIS case?',
      answer:
        'A change in the last-updated date of the case with no new status message. It is a community term. USCIS does not define it.',
    },
    {
      question: 'Does a silent update mean my OPT will be approved soon?',
      answer:
        'No official source says so. Some cases are approved soon after one and others wait for weeks.',
    },
    {
      question: 'What is an "API update"?',
      answer:
        'The same thing. Third-party tools read case data through a feed and show a changed date. People call that an API update.',
    },
    {
      question: 'Should I contact USCIS after a silent update?',
      answer:
        'No. Contact USCIS when your case is outside posted processing times, when a notice is missing, or when a card does not arrive.',
    },
    {
      question: 'Is it safe to use apps that show silent updates?',
      answer:
        'Use only tools you trust with your receipt number. USCIS terms bar vendors from looking up receipts of people who are not their users without consent.',
    },
  ],
  sources: [src.status, src.api, src.times, src.address],
  related: [
    { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
    { label: '"Case Is Being Actively Reviewed": what it means', href: '/blog/case-is-being-actively-reviewed-uscis-meaning' },
    { label: 'OPT EAD pending: delays in 2026', href: '/blog/opt-ead-pending-processing-delays-2026' },
    { label: 'IOE receipt numbers explained', href: '/blog/ioe-receipt-number-elis-case-status' },
  ],
});
