import { defineArticle } from './shared';
import { STATUS_GUIDE_DATE, statusSources as src } from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "opt expedite request", "opt expedite fee", "expedite opt
// application", "uscis expedite request for ead", "letter sample". University
// pages rank. The key fact is the premium-processing bar on the USCIS page
// (last reviewed September 8, 2026).

const SLUG = 'opt-expedite-request-i765';

export const optExpediteRequestGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'OPT Expedite Request: Why USCIS Will Not Take It, and What Works Instead',
  seoTitle: 'OPT Expedite Request: Criteria, Fee and Faster Options',
  description:
    'USCIS does not consider expedite requests where premium processing exists, and OPT and STEM OPT I-765s have it. The expedite criteria, who can still ask, and the faster options that work.',
  category: 'USCIS',
  tags: [
    'OPT expedite request',
    'expedite OPT application',
    'USCIS expedite request EAD',
    'OPT expedite fee',
    'premium processing OPT',
  ],
  readTime: '6 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: OPT expedite requests are not considered because premium processing is available.',
  imageCaption:
    'For OPT and STEM OPT, premium processing replaces the expedite request.',
  directAnswer:
    'For OPT and STEM OPT, an expedite request is almost never an option. USCIS says it will not consider expedite requests for applications where premium processing is available, and Form I-765 for OPT and STEM OPT has premium processing. The working route is Form I-907: $1,780 for a decision step within 30 business days. A job offer or start date alone does not meet the expedite criteria either.',
  keyTakeaways: [
    'Premium processing is available for OPT, so USCIS will not consider an expedite request.',
    'An expedite request has no fee. The $1,780 people ask about is premium processing.',
    'A job offer alone is not "severe financial loss" under USCIS criteria.',
    'You can add premium processing to an I-765 that is already pending.',
  ],
  sections: [
    {
      heading: 'The rule that blocks OPT expedite requests',
      paragraphs: [
        'The USCIS expedite page tells applicants to check for premium processing first. It says USCIS will not consider expedite requests for petitions and applications where premium processing is available.',
        'The one exception is a petitioner that the IRS designates as a nonprofit, filing for a person whose services further the cultural or social interests of the United States. A student filing their own I-765 rarely fits it.',
        'Premium processing covers Form I-765 in categories (c)(3)(A) pre-completion OPT, (c)(3)(B) post-completion OPT and (c)(3)(C) STEM OPT.',
      ],
      sources: [src.expedite, src.premium],
    },
    {
      heading: 'USCIS expedite criteria, and how OPT fits',
      paragraphs: [
        'USCIS decides every request case by case and at its sole discretion. These are the published criteria.',
      ],
      table: {
        caption: 'USCIS expedite criteria and typical OPT situations.',
        columns: ['Criterion', 'What USCIS says', 'Typical OPT case'],
        rows: [
          ['Severe financial loss to a company or person', 'Job loss may be enough, depending on circumstances. The need for work authorization alone is not.', 'A job offer or start date alone does not qualify.'],
          ['Emergency or urgent humanitarian situation', 'A pressing circumstance tied to human welfare, such as illness or disaster.', 'Rare. Needs strong evidence.'],
          ['Nonprofit furthering U.S. cultural or social interests', 'The nonprofit must show an urgent need for the person\'s specific role.', 'Applies to petitions by the organization.'],
          ['Government interests', 'A government agency states an urgent public interest.', 'Rare. The agency makes the request.'],
          ['Clear USCIS error', 'USCIS made a mistake on the case.', 'Rare on a pending OPT case.'],
        ],
      },
      note: 'Even when a criterion fits, the premium processing bar still applies to OPT and STEM OPT I-765s.',
      sources: [src.expedite, src.expeditePolicy],
    },
    {
      heading: 'What works instead: premium processing',
      paragraphs: [
        'Premium processing is the paid fast lane. You file Form I-907 with the fee, online or by mail, together with the I-765 or later while it is pending.',
        'USCIS then has 30 business days to approve, deny, or issue a request for evidence or notice of intent to deny. If it misses the period, it refunds the premium fee and keeps working on the case.',
      ],
      table: {
        caption: 'Expedite request and premium processing compared for OPT.',
        columns: ['', 'Expedite request', 'Premium processing'],
        rows: [
          ['Open to OPT and STEM OPT', 'Not considered', 'Yes'],
          ['Fee', 'None', '$1,780'],
          ['Time limit', 'None', '30 business days'],
          ['Evidence of hardship', 'Required', 'Not required'],
          ['How to ask', 'Contact Center, Emma or secure message', 'Form I-907'],
        ],
      },
      links: [
        { label: 'OPT premium processing fee: $1,780', href: '/blog/opt-premium-processing-fee-increase-1780' },
        { label: 'OPT premium processing timeline 2026', href: '/blog/opt-premium-processing-timeline-2026' },
        { label: 'Business days or calendar days?', href: '/blog/premium-processing-business-days-or-calendar-days' },
      ],
      sources: [src.premium, src.expedite],
    },
    {
      heading: 'Other ways to move a slow OPT case',
      paragraphs: [
        'These cost nothing. None of them is a promise of a faster decision.',
      ],
      bullets: [
        'Case inquiry: when your receipt date is outside the posted processing time, submit an "outside normal processing time" inquiry.',
        'Fix what is pending with you: attend biometrics and answer any request for evidence before the deadline.',
        'Ask your DSO to check your SEVIS record and I-20 for errors that could hold the case.',
        'Check your USCIS account for a notice you have not opened.',
      ],
      links: [
        { label: 'OPT EAD pending: delays in 2026', href: '/blog/opt-ead-pending-processing-delays-2026' },
        { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
        { label: 'When will USCIS decide my OPT?', href: '/blog/when-will-uscis-decide-my-opt-decision-window' },
      ],
      sources: [src.times, src.inquiries],
    },
    {
      heading: 'How an expedite request works for other EADs',
      paragraphs: [
        'Other I-765 categories, such as H-4 or a pending green card, have no premium processing. For those, an expedite request can be considered.',
      ],
      numbered: [
        'Finish anything pending with you, such as biometrics or evidence.',
        'Call the USCIS Contact Center or ask Emma. With a USCIS account you can send a secure message and choose "expedite".',
        'Explain the reason and give the receipt number.',
        'Upload evidence in your online account.',
        'Make one request only. USCIS says repeat requests can slow it down.',
      ],
      note: 'USCIS usually replies but generally gives no reason for its decision. An expedite decision is not an approval or denial of the case.',
      sources: [src.expedite, src.contact],
    },
  ],
  checklist: [
    'Check whether premium processing covers your I-765 category.',
    'Compare the $1,780 fee with the cost of a late start.',
    'Check your receipt date against posted processing times.',
    'Clear biometrics and any request for evidence first.',
    'Keep your employer informed with real dates.',
  ],
  mistakes: [
    'Calling USCIS to expedite an OPT case that has premium processing.',
    'Citing a job offer alone as severe financial loss.',
    'Sending several expedite requests for one case.',
    'Paying a third party an "expedite fee". USCIS charges none.',
  ],
  faq: [
    {
      question: 'Can I expedite my OPT application?',
      answer:
        'Not through an expedite request. USCIS will not consider one where premium processing is available, and OPT has it. Use Form I-907 premium processing.',
    },
    {
      question: 'Is there an OPT expedite fee?',
      answer:
        'No. An expedite request has no fee. Premium processing for an OPT or STEM OPT I-765 costs $1,780.',
    },
    {
      question: 'Does a job offer qualify for an expedite?',
      answer:
        'Not alone. USCIS says the need for work authorization, without other compelling factors, does not warrant expedited treatment.',
    },
    {
      question: 'Can I add premium processing after I filed?',
      answer:
        'Yes. You can file Form I-907 while the I-765 is pending. The 30 business days start when USCIS has the I-907 and everything it needs to decide the case, not on the I-765 filing date.',
    },
    {
      question: 'Does premium processing guarantee approval?',
      answer:
        'No. It guarantees action within 30 business days: an approval, a denial, or a request for evidence or notice of intent to deny.',
    },
    {
      question: 'How do I ask for an expedite on another type of EAD?',
      answer:
        'Contact the USCIS Contact Center, ask Emma, or send a secure message from your USCIS account, then upload evidence. Make one request only.',
    },
  ],
  sources: [src.expedite, src.expeditePolicy, src.premium, src.times, src.inquiries, src.contact],
  related: [
    { label: 'OPT premium processing timeline 2026', href: '/blog/opt-premium-processing-timeline-2026' },
    { label: 'OPT premium processing fee: $1,780', href: '/blog/opt-premium-processing-fee-increase-1780' },
    { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
    { label: 'OPT EAD pending: delays in 2026', href: '/blog/opt-ead-pending-processing-delays-2026' },
  ],
});
