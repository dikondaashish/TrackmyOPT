import { defineArticle } from './shared';
import {
  STATUS_GUIDE_DATE,
  TRACKER_DATA_NOTE,
  statusSources as src,
} from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "card was mailed to me tracking number unavailable", "uscis
// card tracking number unavailable", "ead card tracking number unavailable",
// "card was picked up by usps". Covered before only as one line in the case
// status guide.

const SLUG = 'card-was-mailed-tracking-number-unavailable';

export const cardMailedTrackingGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'USCIS Says "Card Was Mailed To Me" but the Tracking Number Is Unavailable',
  seoTitle: 'Card Was Mailed, Tracking Number Unavailable: What to Do',
  description:
    'Your USCIS status says the card was mailed or picked up by USPS, but you see no tracking number. Where the number appears, how to find the card without it, and when to report it missing.',
  category: 'USCIS',
  tags: [
    'card was mailed to me',
    'tracking number unavailable',
    'card was picked up by USPS',
    'EAD card not delivered',
    'USCIS card tracking',
  ],
  readTime: '5 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: three places to find a mailed USCIS card when the tracking number is missing.',
  imageCaption:
    'Where to look for a mailed EAD when the status shows no tracking number.',
  dataNote: TRACKER_DATA_NOTE,
  directAnswer:
    'A missing tracking number usually means USPS has not scanned the card yet. USCIS posts the USPS tracking number in your USCIS online account, and in the "Card Was Picked Up By The United States Postal Service" message. If it is still missing after a day or two, use USPS Informed Delivery, which shows packages addressed to you without a number, or ask the USCIS Contact Center for it.',
  keyTakeaways: [
    'The tracking number lives in your USCIS online account, not always on the public status page.',
    'USPS Informed Delivery finds the envelope by your address. No number is needed.',
    'In tracked cases USPS pickup was recorded the same day the card was produced.',
    'About 1 in 100 tracked approvals showed the card coming back to USCIS. An old address is the usual cause.',
  ],
  sections: [
    {
      heading: 'Why the tracking number is not showing',
      paragraphs: [
        'USCIS mails cards by USPS Priority Mail with delivery confirmation. The number appears only after USCIS hands the card to USPS and the data reaches your account.',
        'There are three common reasons you do not see it.',
      ],
      bullets: [
        'USPS has not scanned the envelope yet. Wait one business day.',
        'You are on the public status page. Not every message there carries the number. Your USCIS online account shows it once posted.',
        'You filed on paper and never linked the case to an account.',
      ],
      table: {
        caption: 'Mailing messages and where the tracking number appears.',
        columns: ['Status message', 'Tracking number?', 'Next step'],
        rows: [
          ['Card Was Produced', 'Not yet', 'Wait for the mailing message.'],
          ['Card Was Mailed To Me', 'In your USCIS account, once posted', 'Check the account, then Informed Delivery.'],
          ['Card Was Picked Up By The United States Postal Service', 'Yes, in the message', 'Track it at USPS.'],
          ['Card Was Delivered To Me By The Post Office', 'Yes', 'Check your mailbox and building office.'],
          ['Card Was Returned To USCIS', 'Not useful now', 'Fix the address and file a case inquiry.'],
        ],
      },
      sources: [src.delivery, src.status],
    },
    {
      heading: 'Three ways to find the card without a number',
      figure: {
        src: '/blog/illustrations/card-was-mailed-tracking-number-unavailable.webp',
        alt: 'Painted illustration of a hand placing a white envelope into a row of brass apartment mailboxes.',
        caption: 'The card goes to the mailing address USCIS has on file. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'You do not need the number to locate the envelope.',
      ],
      numbered: [
        'Sign in to your USCIS online account and open the case. Paper filers can add the case with the online access code from the receipt notice.',
        'Sign up for USPS Informed Delivery. It lists packages coming to your address and can send email or text alerts.',
        'Call the USCIS Contact Center or ask Emma on uscis.gov. Give the receipt number and ask for the USPS tracking number.',
      ],
      links: [
        { label: 'Every EAD status message explained', href: '/blog/ead-card-status-check' },
        { label: 'Receipt number not working?', href: '/blog/opt-receipt-number-not-working' },
      ],
      sources: [src.delivery, src.informedDelivery, src.contact],
    },
    {
      heading: 'How long delivery takes after mailing',
      paragraphs: [
        'USCIS does not date the delivery step, so we cannot measure it from case history. What we can measure is the handoff: in 180 tracked I-765 cases with a recorded pickup, USPS collected the card on the day it was produced in almost every case, and never more than 2 days later.',
        'After pickup, the card travels by Priority Mail and normally arrives within a few days.',
      ],
      links: [
        { label: '"Card Is Being Produced": how long it takes', href: '/blog/card-is-being-produced-how-long' },
      ],
      sources: [src.delivery],
    },
    {
      heading: 'When to treat the card as missing',
      paragraphs: [
        'Act in this order. Each step has a different owner.',
      ],
      numbered: [
        'USPS says delivered but you have nothing: check with neighbours, your building office and your local post office the same day.',
        'Seven days after mailing with no card: submit a USPS Missing Mail search request.',
        'USPS cannot find it, or you think it went back: contact the USCIS Contact Center or submit a "did not receive card by mail" case inquiry.',
        'Status says returned to USCIS: update your address first, then submit the case inquiry.',
      ],
      note: 'USCIS sets no public waiting period on its delivery page. Arizona State University tells OPT students to allow 30 days from approval before inquiring. The e-Request tool shows the rule that applies on the day you file.',
      sources: [src.delivery, src.missingMail, src.inquiries, src.asu],
    },
    {
      heading: 'Will USCIS send a new card?',
      paragraphs: [
        'USCIS says it may try a second delivery, and it may reissue a card that was never delivered. It also says you generally need to file a new form for a non-delivered card to be reissued.',
        'A lost or stolen card needs a new Form I-765 with the fee, if a fee applies. Ask your DSO before you refile an OPT card, because OPT dates do not move.',
      ],
      links: [
        { label: 'EAD lost, stolen, incorrect or never delivered', href: '/blog/ead-card-lost-stolen-incorrect-never-delivered' },
        { label: 'Change your address on OPT: SEVP Portal and USCIS', href: '/blog/change-address-on-opt-sevp-portal-uscis' },
      ],
      sources: [src.delivery, src.ead],
    },
  ],
  checklist: [
    'Open the case in your USCIS online account.',
    'Turn on USPS Informed Delivery.',
    'Confirm your address with USCIS and USPS.',
    'Label your mailbox with your name.',
    'File the USPS search at day 7, then the USCIS inquiry.',
  ],
  mistakes: [
    'Waiting weeks for a number instead of using Informed Delivery.',
    'Filing a new I-765 before USPS and USCIS have looked for the card.',
    'Updating the address with USCIS but not with USPS.',
    'Starting a first OPT job without the card in hand.',
  ],
  faq: [
    {
      question: 'Why does USCIS say "tracking number unavailable"?',
      answer:
        'USPS has usually not scanned the envelope yet, or you are on the public status page. Check your USCIS online account after one business day.',
    },
    {
      question: 'Can I track my EAD without a tracking number?',
      answer:
        'Yes. USPS Informed Delivery shows packages addressed to you. The USCIS Contact Center can also give you the number.',
    },
    {
      question: 'What does "Card Was Picked Up By The United States Postal Service" mean?',
      answer:
        'USPS has the card and is delivering it to the address USCIS has on file. The message includes the tracking number.',
    },
    {
      question: 'USPS says delivered but I do not have my card. What now?',
      answer:
        'Check with your local post office and building office at once, then file a USPS Missing Mail search. If USPS cannot find it, submit a "did not receive card by mail" inquiry to USCIS.',
    },
    {
      question: 'Do I pay again if my card never arrived?',
      answer:
        'It depends on the cause. USCIS may redeliver or reissue a card it could not deliver, but it generally asks for a new form. A lost card needs a new I-765 with the fee.',
    },
  ],
  sources: [src.delivery, src.status, src.ead, src.informedDelivery, src.missingMail, src.inquiries, src.contact, src.asu],
  related: [
    { label: '"Card Is Being Produced": how long it takes', href: '/blog/card-is-being-produced-how-long' },
    { label: 'EAD card status: every message explained', href: '/blog/ead-card-status-check' },
    { label: 'Moving while OPT is pending: EAD delivery', href: '/blog/moving-while-opt-pending-ead-delivery' },
    { label: 'EAD lost, stolen, incorrect or never delivered', href: '/blog/ead-card-lost-stolen-incorrect-never-delivered' },
  ],
});
