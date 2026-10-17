import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const i94TravelHistoryOptH1bArticle = platformGap({
  slug: 'i94-travel-history-opt-h1b',
  title:
    'How to Get Your I-94 and Travel History, and Why It Matters for OPT and H-1B',
  seoTitle: 'I-94 Travel History for OPT and H-1B: How to Get It',
  description:
    'Download your most recent I-94 and travel history from CBP, check your class of admission and “D/S” entry, fix errors, and keep records for OPT, H-1B change of status, and green card filings.',
  category: 'Travel',
  tags: ['I-94', 'travel history', 'F-1 D/S', 'H-1B change of status'],
  readTime: '7 min read',
  cta: 'opt-timeline',
  imageAlt: 'Illustrated passport, boarding pass, and airplane',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Your I-94 is your official U.S. arrival record. For F-1 students it should show class of admission “F1” and “D/S” (duration of status) as the admit-until date. Download your most recent I-94 and your travel history free from the CBP I-94 website, using your passport details exactly as they appear in your passport. Check them after every entry. An H-1B change of status, a STEM OPT application, and future green card or citizenship forms can all depend on accurate entry records. If something is wrong, fix it quickly through CBP deferred inspection.',
  keyTakeaways: [
    'CBP creates the I-94 electronically when you arrive by air or sea.',
    'F-1 entries should show “F1” and “D/S,” not a fixed date, unless rules change.',
    'Travel history lists your past entries and exits; download and save it.',
    'Errors are easier to fix soon after arrival.',
  ],
  sections: [
    {
      heading: 'How to download your I-94',
      numbered: [
        'Go to the official CBP I-94 website (i94.cbp.dhs.gov).',
        'Choose “Get Most Recent I-94.”',
        'Enter your name, date of birth, passport number, and country of issuance exactly as they appear in your passport.',
        'Download and save the PDF.',
        'Choose “Get Travel History” and save that record too.',
      ],
      paragraphs: [
        'If no record is found, try variations of your name, such as given names in a different order, and confirm you are using the passport you entered with.',
      ],
      sources: [platformSources.i94],
    },
    {
      heading: 'What to check',
      paragraphs: ['Review each field on the PDF, not just the entry date:'],
      bullets: [
        'Class of admission is F1.',
        'Admit-until date shows D/S, or matches any new fixed-admission rule that applies to you.',
        'Name, date of birth, and passport number are correct.',
        'Most recent entry date matches your trip.',
      ],
      links: [
        {
          label: 'F-1 status: I-20, I-94, and visa differences',
          href: '/blog/f1-visa-status-i20-i94-differences',
        },
        {
          label: 'September 2026 F-1 fixed admission rule',
          href: '/blog/september-2026-f1-fixed-admission-rule-opt',
        },
      ],
    },
    {
      heading: 'Why it matters for OPT and H-1B',
      paragraphs: [
        'An H-1B change-of-status petition relies on your valid F-1 status and your most recent I-94. Cap-gap protection also depends on maintaining status. Green card and naturalization forms ask for your travel history, often over many years, so a saved CBP record is a reliable starting point.',
      ],
      links: [
        {
          label: 'H-1B change of status vs consular processing',
          href: '/blog/h1b-change-of-status-vs-consular-processing-opt',
        },
        {
          label: 'H-1B cap-gap extension',
          href: '/blog/h1b-cap-gap-extension',
        },
      ],
    },
    {
      heading: 'Fixing a wrong I-94',
      paragraphs: [
        'If CBP made an error, such as the wrong class of admission or a fixed date instead of D/S, you can usually request a correction at a CBP deferred inspection site or the port of entry. Bring your passport, I-20, and visa. Errors caused by USCIS on a document USCIS issued are corrected through USCIS instead.',
        'Missing exits are common when departing by land or on certain carriers. Keep boarding passes and passport stamps as backup proof.',
      ],
      links: [
        {
          label: 'Wrong I-94 for F-1 students: how to correct it',
          href: '/blog/wrong-i94-f1-student-correction',
        },
      ],
      sources: [source.cbpDeferred],
    },
    {
      heading: 'Fictional example: catching an error early',
      paragraphs: [
        'Kenji is fictional. He returns from a winter trip on OPT and checks his I-94 that night. It shows a fixed date instead of D/S. He visits a nearby deferred inspection office with his documents the following week, and the record is corrected before his employer files his H-1B change of status.',
      ],
    },
  ],
  checklist: [
    'Download your I-94 after every entry.',
    'Confirm F1 and D/S, or the date that applies to you.',
    'Save your full travel history.',
    'Keep boarding passes and stamps for trips.',
    'Correct errors quickly through CBP.',
  ],
  mistakes: [
    'Never checking the I-94 after arrival.',
    'Using a different passport than the one you entered with.',
    'Ignoring missing exit records.',
    'Waiting until an H-1B filing to discover an error.',
  ],
  faq: [
    {
      question: 'Is the I-94 the same as my visa?',
      answer:
        'No. The visa is for entry. The I-94 records your admission and how long you may stay.',
    },
    {
      question: 'Does downloading the I-94 cost anything?',
      answer:
        'No. Downloading your I-94 and travel history from the official CBP site is free. Avoid third-party sites that charge for it.',
    },
    {
      question: 'What if my travel history is incomplete?',
      answer:
        'Keep your own records, such as boarding passes and stamps. Contact CBP if entries or exits are missing.',
    },
  ],
  sources: [platformSources.i94, source.cbpDeferred, source.sevpTravel],
  related: [
    {
      label: 'Can you travel on OPT?',
      href: '/blog/can-you-travel-on-opt-complete-guide',
    },
    {
      label: 'CBP secondary inspection for F-1 students',
      href: '/blog/cbp-secondary-inspection-f1-students',
    },
    {
      label: 'Immigration documents to keep on OPT',
      href: '/blog/immigration-documents-to-keep-on-opt',
    },
  ],
});
