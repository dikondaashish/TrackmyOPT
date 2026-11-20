import { defineArticle } from './shared';
import {
  STATUS_GUIDE_DATE,
  TRACKER_DATA_NOTE,
  statusSources as src,
} from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete shows 12+ variants ("card is being produced how long", "how
// many days", "meaning", "timeline"); forum threads rank. The answer here is
// the tracker's own approval-to-production figure.

const SLUG = 'card-is-being-produced-how-long';

export const cardIsBeingProducedGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title: '"Card Is Being Produced": How Long Until Your EAD Arrives',
  seoTitle: 'Card Is Being Produced: How Long Until the EAD Arrives?',
  description:
    'USCIS gives no timeline for "New Card Is Being Produced". In 1,290 tracked I-765 cases the card was produced a median of 5 days after approval. Here is what happens next.',
  category: 'USCIS',
  tags: [
    'card is being produced',
    'new card is being produced how long',
    'card was produced',
    'EAD card after approval',
    'I-765 approved',
  ],
  readTime: '5 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: card produced a median of 5 days after approval in 1,290 tracked I-765 cases.',
  imageCaption:
    'From approval to a produced card in tracked I-765 cases, read on November 20, 2026.',
  dataNote: TRACKER_DATA_NOTE,
  directAnswer:
    'USCIS gives no official timeline for "New Card Is Being Produced". In 1,290 approved Form I-765 cases tracked on TrackMyOPT, the card was produced a median of 5 days after approval, and 98% were produced within 7 days. USPS usually picks the card up the same day, then delivers it by Priority Mail within a few days. Expect the card about one to two weeks after approval.',
  keyTakeaways: [
    'The message means USCIS ordered the card. It is not mailed yet.',
    'Median 5 days from approval to "Card Was Produced"; 98% within 7 days in tracked cases.',
    'USPS pickup was recorded on the production day in most tracked cases.',
    'For a first OPT EAD, wait for the card and its start date before you work.',
  ],
  sections: [
    {
      heading: 'What "New Card Is Being Produced" means',
      paragraphs: [
        'USCIS approved your Form I-765 and ordered the card. The card is not printed or mailed yet. The same message is used for every EAD category, including OPT, STEM OPT, H-4 and adjustment of status.',
        'Many cases never show this message. In our tracked cases the history usually goes from approval straight to "Card Was Produced". If you skipped it, nothing is wrong.',
      ],
      table: {
        caption: 'Card messages after an I-765 approval, in the usual order.',
        columns: ['Status message', 'What it means', 'What to do'],
        rows: [
          ['Case Was Approved', 'The I-765 is approved. No card exists yet.', 'Check your mailing address today.'],
          ['New Card Is Being Produced', 'USCIS ordered the card.', 'Sign up for USPS Informed Delivery.'],
          ['Card Was Produced', 'The card is printed.', 'Watch for the USPS tracking number.'],
          ['Card Was Picked Up By The United States Postal Service', 'USPS has the card. The message carries a tracking number.', 'Track it at USPS.'],
          ['Card Was Delivered To Me By The Post Office', 'USPS reports delivery.', 'Check every date and your name on the card.'],
        ],
      },
      links: [
        { label: 'Every EAD status message explained', href: '/blog/ead-card-status-check' },
      ],
      sources: [src.status, src.delivery],
    },
    {
      heading: 'How long it takes: tracked cases',
      paragraphs: [
        'USCIS does not publish a time for card production. These figures come from the dated status history of I-765 cases saved on TrackMyOPT.',
        'School offices give a similar range. Arizona State University tells OPT students the card should be produced within one to two weeks of approval.',
      ],
      table: {
        caption: 'Days between card milestones in tracked I-765 cases, read on November 20, 2026.',
        columns: ['Step', 'Cases', 'Median', 'Most cases', 'Longest seen'],
        rows: [
          ['Approval to "Card Was Produced"', '1,290', '5 days', '4 to 6 days; 98% within 7', '20 days'],
          ['"Card Was Produced" to USPS pickup', '180', 'Same day', 'Same day', '2 days'],
          ['USPS pickup to delivery', 'Not dated by USCIS', 'A few days', 'USPS Priority Mail', 'Check USPS tracking'],
        ],
      },
      note: 'Only 2 of the 1,290 cases took longer than 14 days from approval to a produced card.',
      sources: [src.status, src.asu],
    },
    {
      heading: 'Can you start work while the card is in production?',
      paragraphs: [
        'For a first OPT EAD, no. USCIS says you may begin post-completion OPT only after it approves the I-765 and you receive the EAD. You also cannot start before the start date printed on the card.',
        'Tell your employer the exact status and date. An approval notice or a status screenshot is not a Form I-9 work document for a first EAD.',
        'STEM OPT is different. A STEM extension filed on time keeps you authorized for up to 180 days while the I-765 is pending, so production time does not stop your work.',
      ],
      links: [
        { label: 'Can you start work before the OPT EAD arrives?', href: '/blog/can-you-start-work-before-opt-ead-arrives' },
        { label: 'STEM OPT 180-day extension explained', href: '/blog/stem-opt-180-day-auto-extension-explained-2026' },
      ],
      sources: [src.opt, src.ead],
    },
    {
      heading: 'Four things to do while you wait',
      figure: {
        src: '/blog/illustrations/card-is-being-produced-how-long.webp',
        alt: 'Painted illustration of a blank card on a card printer tray beside a stack of white envelopes on a wooden desk.',
        caption: 'After approval the card is printed, then mailed. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'The card goes to the mailing address USCIS has on file. Most late cards trace back to an address problem, so fix that first.',
      ],
      numbered: [
        'Confirm the mailing address in your USCIS online account. Update it with USCIS and USPS if you moved.',
        'Sign up for USPS Informed Delivery so you see the envelope coming.',
        'Put your name on the mailbox, especially in an apartment building.',
        'Open your USCIS account each day for the USPS tracking number.',
      ],
      links: [
        { label: 'Moving while OPT is pending: EAD delivery', href: '/blog/moving-while-opt-pending-ead-delivery' },
        { label: 'Card mailed but no tracking number?', href: '/blog/card-was-mailed-tracking-number-unavailable' },
      ],
      sources: [src.delivery, src.address, src.informedDelivery],
    },
    {
      heading: 'When production takes too long',
      paragraphs: [
        'Wait two weeks from approval before you worry. After that, contact the USCIS Contact Center or ask Emma, the chat assistant on uscis.gov, with your receipt number ready.',
        'If the status later shows the card was returned to USCIS, correct your address and submit a "did not receive card by mail" case inquiry at once.',
      ],
      links: [
        { label: 'EAD lost, stolen, incorrect or never delivered', href: '/blog/ead-card-lost-stolen-incorrect-never-delivered' },
      ],
      sources: [src.contact, src.inquiries, src.delivery],
    },
  ],
  checklist: [
    'Confirm your USCIS mailing address on approval day.',
    'Turn on USPS Informed Delivery.',
    'Check your USCIS account daily for the tracking number.',
    'Give your employer the real status and date.',
    'Contact USCIS if no card is produced two weeks after approval.',
  ],
  mistakes: [
    'Starting a first OPT job on the approval message.',
    'Moving without updating the address with both USCIS and USPS.',
    'Reading "being produced" as "mailed".',
    'Filing a replacement I-765 before checking USPS tracking.',
  ],
  faq: [
    {
      question: 'How long does "Card Is Being Produced" take?',
      answer:
        'USCIS gives no official time. In 1,290 tracked I-765 cases the card was produced a median of 5 days after approval, and 98% within 7 days.',
    },
    {
      question: 'How long after the card is produced will it arrive?',
      answer:
        'USPS usually picks it up the same day and delivers by Priority Mail within a few days. Most people hold the card one to two weeks after approval.',
    },
    {
      question: 'My status went from approved to "Card Was Produced". Did I miss a step?',
      answer:
        'No. Most tracked cases never show "New Card Is Being Produced". The history goes from approval to a produced card.',
    },
    {
      question: 'Can I work when the status says the card is being produced?',
      answer:
        'Not on a first OPT EAD. Wait until you have the card and its start date has arrived. A timely filed STEM OPT extension lets you keep working while the case is pending.',
    },
    {
      question: 'Where do I find the USPS tracking number?',
      answer:
        'In your USCIS online account, and in the "Card Was Picked Up By The United States Postal Service" message when it appears.',
    },
  ],
  sources: [src.status, src.delivery, src.ead, src.opt, src.address, src.informedDelivery, src.asu],
  related: [
    { label: 'EAD card status: every message explained', href: '/blog/ead-card-status-check' },
    { label: 'Card mailed but tracking number unavailable', href: '/blog/card-was-mailed-tracking-number-unavailable' },
    { label: 'OPT EAD processing time 2026', href: '/blog/opt-processing-time-2026' },
    { label: 'OPT EAD card guide', href: '/blog/opt-ead-card-guide' },
  ],
});
