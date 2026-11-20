import { defineArticle } from './shared';
import {
  STATUS_GUIDE_DATE,
  TRACKER_DATA_NOTE,
  statusSources as src,
} from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "case is being actively reviewed by uscis", "meaning", "how
// long", "reddit". The tracker shows the message is not a near-decision
// signal: approval came a median of 65 days after it.

const SLUG = 'case-is-being-actively-reviewed-uscis-meaning';

export const caseActivelyReviewedGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    '"Case Is Being Actively Reviewed By USCIS": What It Means and How Long It Lasts',
  seoTitle: 'Case Is Being Actively Reviewed by USCIS: Meaning, How Long',
  description:
    'The message means USCIS has your case and needs nothing from you. It is not a sign of a decision. In 390 tracked I-765 cases, approval came a median of 65 days after it appeared.',
  category: 'USCIS',
  tags: [
    'case is being actively reviewed',
    'actively reviewed by USCIS meaning',
    'I-765 actively reviewed how long',
    'USCIS case status',
    'OPT status',
  ],
  readTime: '5 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: approval came a median of 65 days after the actively reviewed message in 390 tracked I-765 cases.',
  imageCaption:
    'How long tracked I-765 cases stayed at "actively reviewed" before approval, read on November 20, 2026.',
  dataNote: TRACKER_DATA_NOTE,
  directAnswer:
    '"Case Is Being Actively Reviewed By USCIS" means USCIS has your case and nothing is outstanding from you. It does not mean an officer is deciding it now. In 390 Form I-765 cases tracked on TrackMyOPT, the message appeared a median of 22 days after receipt, and approval came a median of 65 days after that. USCIS gives no official duration.',
  keyTakeaways: [
    'It is a neutral holding message. No action is needed.',
    'Median 65 days from this message to approval in tracked I-765 cases.',
    'Only 27% of tracked approvals ever showed it. Skipping it is normal.',
    'A request for evidence or a decision arrives as a new message and a notice.',
  ],
  sections: [
    {
      heading: 'What the message says',
      paragraphs: [
        'The full text says USCIS is actively reviewing your form, that its records show nothing is outstanding, and that it will tell you if it needs anything. It also reminds you to update your address if you move.',
        'A similar message says USCIS is currently processing your form and does not need anything from you. Treat both the same way.',
      ],
      table: {
        caption: 'What the message does and does not mean.',
        columns: ['It means', 'It does not mean'],
        rows: [
          ['USCIS accepted the filing and the case is in line.', 'An officer opened your file today.'],
          ['Nothing is missing from you right now.', 'No request for evidence can come later.'],
          ['Your address on file is where notices go.', 'A decision is days away.'],
        ],
      },
      sources: [src.status],
    },
    {
      heading: 'How long it lasts: tracked cases',
      paragraphs: [
        'USCIS publishes no time for this stage. These figures come from the dated status history of I-765 cases saved on TrackMyOPT.',
        'Most of the 390 cases later used premium processing. For the 107 that stayed on regular processing, the median was 66 days.',
      ],
      table: {
        caption: 'Timing of the "actively reviewed" message in tracked I-765 cases, read on November 20, 2026.',
        columns: ['Measure', 'Cases', 'Median', 'Middle half', '9 in 10 within'],
        rows: [
          ['Receipt to "actively reviewed"', '391', '22 days', '17 to 28 days', '35 days'],
          ['"Actively reviewed" to approval', '390', '65 days', '45 to 86 days', '110 days'],
          ['Same, regular processing only', '107', '66 days', '58 to 79 days', '87 days'],
        ],
      },
      note: 'The longest gap from this message to approval was 149 days. Of 1,430 tracked approvals, 390 showed this message first.',
      links: [
        { label: 'OPT processing time 2026, updated monthly', href: '/blog/opt-processing-time-2026' },
        { label: 'STEM OPT processing time 2026', href: '/blog/stem-opt-processing-time-2026' },
      ],
      sources: [src.status, src.times],
    },
    {
      heading: 'What comes next',
      paragraphs: [
        'The next message depends on the case. For an I-765 it is usually one of these.',
      ],
      bullets: [
        'A biometrics appointment notice, if USCIS needs fingerprints or a photo.',
        'A request for evidence, with a deadline in the notice.',
        'Case Was Approved, then the card messages.',
        'A premium processing clock message, if you file Form I-907.',
      ],
      links: [
        { label: 'I-765 processing time after biometrics', href: '/blog/i-765-processing-time-after-biometrics' },
        { label: 'OPT RFE: reasons and how to respond', href: '/blog/opt-rfe-request-for-evidence-i765' },
        { label: '"Card Is Being Produced": how long it takes', href: '/blog/card-is-being-produced-how-long' },
      ],
      sources: [src.status],
    },
    {
      heading: 'What to do while it sits',
      paragraphs: [
        'You cannot speed this stage by calling. These steps keep you ready.',
      ],
      numbered: [
        'Keep your mailing address current with USCIS.',
        'Check your USCIS account weekly for a notice.',
        'Compare your receipt date with the posted processing time for your category.',
        'For OPT, weigh premium processing against your job start date.',
        'Submit a case inquiry only when your case is outside the posted time.',
      ],
      links: [
        { label: 'OPT expedite request: what works instead', href: '/blog/opt-expedite-request-i765' },
        { label: 'OPT EAD pending: delays in 2026', href: '/blog/opt-ead-pending-processing-delays-2026' },
      ],
      sources: [src.times, src.address, src.inquiries, src.premium],
    },
    {
      heading: 'If the date on the message changes',
      paragraphs: [
        'Sometimes the message stays the same and only its date moves. Applicants call that a silent update. USCIS does not explain it, and it is not a decision.',
      ],
      links: [
        { label: 'USCIS silent update: what it means', href: '/blog/uscis-silent-update-api-update-meaning' },
      ],
      sources: [src.status],
    },
  ],
  checklist: [
    'Confirm your address with USCIS.',
    'Check your account for notices each week.',
    'Note the posted processing time for your category.',
    'Decide on premium processing from your start date.',
  ],
  mistakes: [
    'Telling an employer a decision is close because of this message.',
    'Calling USCIS before the case is outside posted times.',
    'Ignoring the account and missing a request for evidence.',
    'Assuming something is wrong because the message never appeared.',
  ],
  faq: [
    {
      question: 'What does "Case Is Being Actively Reviewed By USCIS" mean?',
      answer:
        'USCIS has your case and needs nothing from you now. It is a neutral message, not a sign that a decision is near.',
    },
    {
      question: 'How long does a case stay at "actively reviewed"?',
      answer:
        'USCIS gives no time. In 390 tracked I-765 cases approval came a median of 65 days later, and 9 in 10 within 110 days.',
    },
    {
      question: 'Is "actively reviewed" a good sign?',
      answer:
        'It is neither good nor bad. It confirms the case is in line and that nothing is missing from you today.',
    },
    {
      question: 'My case never showed this message. Is that a problem?',
      answer:
        'No. Only 27% of tracked I-765 approvals showed it. Many cases go from receipt or biometrics straight to approval.',
    },
    {
      question: 'Can I get an RFE after "actively reviewed"?',
      answer:
        'Yes. The message describes today only. A request for evidence arrives as a new status message and a notice.',
    },
  ],
  sources: [src.status, src.times, src.address, src.inquiries, src.premium],
  related: [
    { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
    { label: 'EAD card status: every message explained', href: '/blog/ead-card-status-check' },
    { label: 'USCIS silent update: what it means', href: '/blog/uscis-silent-update-api-update-meaning' },
    { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
  ],
});
