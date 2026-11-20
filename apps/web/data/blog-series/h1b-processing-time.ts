import { defineArticle } from './shared';
import { STATUS_GUIDE_DATE, statusSources as src } from './card-status-shared';
import type { ResearchArticle } from './types';

// Search Console: "h1b petition status" (188 impressions in 28 days), "h1b
// extension status" (143). Autocomplete: "h1b premium processing time 2026",
// "h1b transfer premium processing time", "h1b transfer timeline".
// This post gives the fixed periods set by rule. It does not quote the USCIS
// tool's current figures, which change monthly.

const SLUG = 'h1b-processing-time-2026';

export const h1bProcessingTimeGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'H-1B Processing Time 2026: Regular, Premium, Transfer and Extension',
  seoTitle: 'H-1B Processing Time 2026: Premium, Transfer, Extension',
  description:
    'H-1B premium processing takes 15 business days and costs $2,965. Regular times vary by service center. What you can do while a cap case, transfer or extension is pending.',
  category: 'H-1B',
  tags: [
    'H-1B processing time 2026',
    'H-1B premium processing time',
    'H-1B transfer processing time',
    'H-1B extension status',
    'H-1B petition status',
  ],
  readTime: '6 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: H-1B premium processing takes 15 business days and costs $2,965.',
  imageCaption:
    'The fixed periods that apply to every H-1B petition.',
  directAnswer:
    'H-1B premium processing takes 15 business days and costs $2,965. Regular processing has no fixed time: it varies by service center and case type, and USCIS posts the current figure in its processing-times tool under Form I-129. For a transfer you can usually start work when the new petition is filed. For an extension filed on time you can keep working for up to 240 days after your status expires.',
  keyTakeaways: [
    'Premium processing: 15 business days, $2,965, paid by the employer in most cases.',
    'Regular processing varies. Check Form I-129 in the USCIS processing-times tool.',
    'Transfer: you can start when the new employer properly files the petition.',
    'Extension: up to 240 days of continued work with the same employer while it is pending.',
  ],
  sections: [
    {
      heading: 'H-1B times at a glance',
      paragraphs: [
        'Every H-1B request is filed on Form I-129. What changes is whether you can work while it is pending.',
      ],
      table: {
        caption: 'H-1B case types, premium availability and work while pending.',
        columns: ['Case type', 'Premium processing', 'Can you work while it is pending?'],
        rows: [
          ['New cap case, change of status from F-1', '15 business days', 'On OPT, and under cap-gap if it applies'],
          ['New cap case, consular', '15 business days', 'Not in the United States'],
          ['Transfer to a new employer', '15 business days', 'Yes, from proper filing'],
          ['Extension with the same employer', '15 business days', 'Yes, up to 240 days past expiry'],
          ['Amendment for a material change', '15 business days', 'Ask counsel before the change'],
        ],
      },
      sources: [src.h1b, src.premium],
    },
    {
      heading: 'Premium processing: 15 business days',
      paragraphs: [
        'With Form I-907, USCIS must approve, deny, or send a request for evidence or notice of intent to deny within 15 business days. If it misses the period, it refunds the premium fee and keeps working on the case.',
        'A request for evidence stops the clock. A new 15 business days start when USCIS receives the answer.',
        'The fee is $2,965. The employer or its attorney files it, with the petition or later.',
      ],
      links: [
        { label: 'Premium processing: business days or calendar days?', href: '/blog/premium-processing-business-days-or-calendar-days' },
      ],
      sources: [src.premium],
    },
    {
      heading: 'Regular processing: how to read the USCIS tool',
      figure: {
        src: '/blog/illustrations/h1b-processing-time-2026.webp',
        alt: 'Painted illustration of an office mail room with shelves of plain folders and a wall clock.',
        caption: 'Regular H-1B times vary by service center. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'USCIS does not promise a time for regular H-1B cases. Its tool shows how long recent cases took at each service center.',
      ],
      numbered: [
        'Open the USCIS processing-times tool.',
        'Choose Form I-129, then the H-1B category that matches your case.',
        'Choose the service center named on your receipt notice.',
        'Read the time shown. It describes finished cases and is not a promise.',
        'Enter your receipt date to see when you may send a case inquiry.',
      ],
      links: [
        { label: 'H-1B case status tracker', href: '/blog/h1b-case-status-tracker' },
        { label: 'IOE and service-center receipt numbers', href: '/blog/ioe-receipt-number-elis-case-status' },
      ],
      sources: [src.times, src.inquiries],
    },
    {
      heading: 'Transfer: start on filing',
      paragraphs: [
        'If you already hold H-1B status, USCIS says you may begin working for the new employer as soon as it properly files a non-frivolous petition for you, or on the requested start date, whichever is later.',
        'You must not have worked without authorization since your last admission, and the petition must be filed before your authorized stay ends.',
        'If the new petition is denied, the work authorization based on it ends.',
      ],
      links: [
        { label: 'H-1B transfer and portability while on OPT', href: '/blog/h1b-transfer-portability-while-on-opt' },
      ],
      sources: [src.h1b, src.cfrH],
    },
    {
      heading: 'Extension: the 240-day rule',
      paragraphs: [
        'If your employer files the extension before your current status expires, you may keep working for the same employer for up to 240 days after the expiry date while it is pending.',
        'If USCIS denies the extension during that period, the authorization ends when you are notified.',
        'With an approved I-140, extensions beyond the six-year limit are possible.',
      ],
      links: [
        { label: 'I-140 approved: what happens next', href: '/blog/i-140-approved-what-next' },
      ],
      sources: [src.cfr240, src.cfrH],
    },
    {
      heading: 'Cap cases for OPT students',
      paragraphs: [
        'USCIS runs registration in March. The last one ran March 4 to 19, 2026. USCIS has not announced the next dates.',
        'Selected employers then file the petition. If it asks for a change of status and your OPT is still valid when it is filed, cap-gap can carry your status and work authorization forward.',
      ],
      links: [
        { label: 'H-1B lottery 2027 (FY2028): dates, fee and odds', href: '/blog/h1b-lottery-2027-fy2028' },
        { label: 'H-1B cap-gap extension', href: '/blog/h1b-cap-gap-extension' },
        { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
        { label: 'Change of status or consular processing?', href: '/blog/h1b-change-of-status-vs-consular-processing-opt' },
      ],
      sources: [src.h1b],
    },
  ],
  checklist: [
    'Ask your employer for the I-129 receipt number.',
    'Note the service center on the receipt notice.',
    'Ask whether premium processing was filed.',
    'Know which rule lets you work while the case is pending.',
    'Check the status weekly and after any notice.',
  ],
  mistakes: [
    'Reading the posted regular time as a promise.',
    'Counting premium processing in calendar days.',
    'Starting a transfer job before the petition is filed.',
    'Working past day 240 on a pending extension.',
  ],
  faq: [
    {
      question: 'How long does H-1B premium processing take in 2026?',
      answer:
        '15 business days from the day USCIS receives Form I-907. A request for evidence starts a new 15 business days after you answer.',
    },
    {
      question: 'How long does regular H-1B processing take?',
      answer:
        'There is no fixed time. It varies by service center and case type. The USCIS processing-times tool shows the current figure for Form I-129.',
    },
    {
      question: 'How much is H-1B premium processing?',
      answer: '$2,965. The employer or its attorney files Form I-907.',
    },
    {
      question: 'Can I start my new job while the H-1B transfer is pending?',
      answer:
        'Yes, if you already hold H-1B status and the new employer has properly filed the petition. You may start on filing or on the requested start date, whichever is later.',
    },
    {
      question: 'Can I keep working while my H-1B extension is pending?',
      answer:
        'Yes, for the same employer, for up to 240 days after your status expires, if the extension was filed on time.',
    },
    {
      question: 'How do I check my H-1B status?',
      answer:
        'Enter the I-129 receipt number at USCIS Case Status Online. Your employer or its attorney has the receipt notice.',
    },
  ],
  sources: [src.h1b, src.premium, src.times, src.cfrH, src.cfr240, src.inquiries],
  related: [
    { label: 'H-1B case status tracker', href: '/blog/h1b-case-status-tracker' },
    { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
    { label: 'H-1B cap-gap extension', href: '/blog/h1b-cap-gap-extension' },
    { label: 'Premium processing: business days or calendar days?', href: '/blog/premium-processing-business-days-or-calendar-days' },
  ],
});
