import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "EAD status check" is the largest query family on the site with no page of
// its own (about 23K impressions a quarter across "ead status check", "ead
// tracker", "ead card status" and "check ead status"). This guide covers every
// I-765 category, not only OPT, so it uses the generic USCIS tracking CTA.

const src = {
  status: {
    label: 'Check your immigration case status',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  times: {
    label: 'Check Case Processing Times',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/',
  },
  myProgress: {
    label: 'USCIS Expands myProgress to Form I-765 and Form I-131',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/newsroom/alerts/uscis-expands-myprogress-to-form-i-765-and-form-i-131',
  },
  inquiries: {
    label: 'Case inquiries and nondelivery requests (e-Request)',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/e-request/',
  },
  i765: {
    label: 'Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  renewals: {
    label: '8 CFR 274a.13: Employment authorization renewals',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-A/section-274a.13',
  },
  ead: {
    label: 'Employment Authorization Document',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/employment-authorization-document',
  },
  informedDelivery: {
    label: 'USPS Informed Delivery',
    publisher: 'United States Postal Service',
    url: 'https://informeddelivery.usps.com/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'ead-card-status-check';

export const eadCardStatusGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  hub: 'case-status',
  title:
    'EAD Card Status: How to Check It, What Each USCIS Status Means, and When the Card Arrives',
  seoTitle: 'EAD Status Check: Track Your I-765 and Card Delivery (2026)',
  description:
    'Check your EAD status with the I-765 receipt number, decode every USCIS status message from "Case Was Received" to "Card Was Delivered", and know what to do when the card is late or lost.',
  category: 'USCIS',
  tags: [
    'EAD status check',
    'EAD tracker',
    'EAD card status',
    'I-765 status',
    'card was mailed',
    'EAD processing time',
  ],
  readTime: '9 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the EAD status path from Case Was Received through Card Was Delivered.',
  imageCaption:
    'The status path most I-765 cases follow. Generated from the USCIS status messages described in this guide.',
  directAnswer:
    'Check an EAD status by entering the 13-character Form I-765 receipt number (for example IOE0123456789) at USCIS Case Status Online or in your USCIS online account. The usual sequence is Case Was Received, Case Is Being Actively Reviewed, Case Was Approved, Card Is Being Produced, Card Was Mailed, then Card Was Delivered. Production to delivery usually takes one to three weeks; the receipt-to-approval wait depends on the category and is shown in the USCIS processing-times tool.',
  keyTakeaways: [
    'Only the I-765 receipt tracks the EAD. An I-485, I-539, I-129 or I-140 receipt is a different case with its own status.',
    '"Case Was Approved" is not the card. Watch for "Card Is Being Produced" and "Card Was Mailed", then the USPS tracking number in your USCIS account.',
    'Most renewals filed on or after October 30, 2025 no longer get an automatic extension while pending, so the status matters for your right to work, not just your mailbox.',
    'If the card has not arrived 30 days after "Card Was Mailed", or the status says returned as undeliverable, file a nondelivery e-Request promptly.',
  ],
  sections: [
    {
      heading: 'Find the right receipt number for your EAD',
      paragraphs: [
        'Every EAD comes from Form I-765, so the receipt number you need is the one on the I-797C Notice of Action for that form. It is 13 characters: three letters followed by ten digits. Online filings and most paper filings now start with IOE; older paper receipts start with EAC, WAC, LIN, SRC, MSC or NBC. The letters tell you where USCIS logged the case, not how fast it will move.',
        'People waiting on several applications at once, for example an I-485 with an I-765 and an I-131, or an H-4 I-539 with an I-765, often check the wrong receipt. Match the form number printed on the notice to the application you care about. An approval on the I-485 or I-539 does not mean the I-765 is approved.',
        'If the I-765 receipt notice never arrived, check your USCIS online account for the case, look at the bank or card statement for the fee payment reference, or call the USCIS Contact Center with the filing details. A separate guide below covers receipt numbers that return no result.',
      ],
      numbered: [
        'Locate the I-797C receipt notice for Form I-765.',
        'Confirm the form number and your name on the notice.',
        'Copy the 13-character receipt number without spaces or dashes.',
        'Enter it at USCIS Case Status Online, or open the case in your USCIS account.',
      ],
      links: [
        {
          label: 'Receipt number not working? Causes and fixes',
          href: '/blog/opt-receipt-number-not-working',
        },
        {
          label: 'What is a USCIS receipt number',
          href: '/answers/what-is-uscis-receipt-number',
        },
      ],
      sources: [src.status, src.i765],
    },
    {
      heading: 'EAD status messages in order, and what each one means',
      figure: { src: '/blog/figures/ead-card-status-check/ead-status-timeline.png', alt: 'Timeline of six EAD status messages: Case Was Received, Case Is Being Actively Reviewed, Case Was Approved, New Card Is Being Produced, Card Was Mailed To Me, Card Was Delivered.', caption: 'The usual order of I-765 status messages. The table below explains each one.', width: 1200, height: 712 },
      paragraphs: [
        'USCIS case status uses short public messages. They are the same for every I-765 category, whether the EAD is for OPT (c)(3), an H-4 spouse (c)(26), a pending adjustment of status (c)(9), asylum (c)(8) or TPS (a)(12). The table lists them in the order most cases follow, with the practical meaning of each.',
      ],
      table: {
        caption: 'Common USCIS status messages for Form I-765, in the usual order.',
        columns: ['Status message', 'What it means', 'What to do'],
        rows: [
          ['Case Was Received', 'USCIS accepted the filing and fee and assigned a receipt number.', 'Save the notice. Set a reminder for the posted processing time.'],
          ['Fingerprint Fee Was Received', 'The biometrics fee, where charged, was recorded. Not every I-765 has this step.', 'Nothing. A biometrics notice may or may not follow.'],
          ['Case Is Being Actively Reviewed', 'An officer or system touched the case. It does not mean a decision is days away.', 'Nothing. This message can sit for weeks.'],
          ['Request for Evidence Was Sent', 'USCIS mailed an RFE with a response deadline.', 'Read the full notice, not the summary. Respond before the deadline.'],
          ['Response to Request for Evidence Was Received', 'Your RFE reply was logged.', 'Wait. The case returns to review.'],
          ['Case Was Approved', 'The I-765 is approved. The card does not exist yet.', 'Watch for the card-production message.'],
          ['New Card Is Being Produced', 'The card is printing. Usually a few business days.', 'Check that your mailing address in the USCIS account is current.'],
          ['Card Was Mailed To Me', 'USPS has the card. A tracking number appears in the USCIS account.', 'Follow the USPS tracking. Expect 3 to 10 days.'],
          ['Card Was Delivered To Me By The Post Office', 'USPS reports delivery.', 'Check the card dates and category. Report an error within the correction window.'],
          ['Card Was Returned To USCIS', 'USPS could not deliver, usually because of an address problem.', 'File a nondelivery e-Request and update the address immediately.'],
          ['Case Was Denied', 'USCIS denied the application; a decision notice explains why.', 'Read the notice. Options depend on the category and the reason.'],
        ],
      },
      note: 'Two messages confuse almost everyone. "Case Was Approved" means a decision, not a card in the mail, and "Case Is Being Actively Reviewed" is not a sign that the decision is imminent. Treat the production and mailing messages as the ones that change what you should do.',
      sources: [src.status, src.ead],
    },
    {
      heading: 'How long each stage takes',
      paragraphs: [
        'The wait from receipt to approval depends on the category and the service center. USCIS publishes the figure in its processing-times tool: pick Form I-765, then the category that matches your eligibility code, and the tool shows the time within which most recent cases were completed. The number is a description of finished cases, not a promise about yours.',
        'The stages after approval are more predictable. Card production usually takes a few business days, mailing is by USPS Priority Mail with tracking, and delivery normally lands within one to three weeks of the approval message. A card that has not arrived 30 days after "Card Was Mailed" is the trigger for a nondelivery request.',
        'For OPT and STEM OPT applicants the receipt-to-approval wait is the part that matters most, because the requested start date and the 90-day unemployment clock depend on it. The processing-time guides linked below track those figures month by month from reported cases.',
      ],
      table: {
        caption: 'Typical duration of each stage after the approval message. Receipt-to-approval times vary by category and are published by USCIS.',
        columns: ['Stage', 'Typical time', 'Where to see it'],
        rows: [
          ['Receipt to approval', 'Category dependent; see USCIS processing times', 'Case Status Online, myProgress in your account'],
          ['Approval to card production', 'A few business days', 'Case Status Online'],
          ['Production to mailing', '1 to 5 business days', 'Case Status Online, tracking number in your USCIS account'],
          ['Mailing to delivery', '3 to 10 days (USPS Priority Mail)', 'USPS tracking, Informed Delivery'],
          ['Nondelivery request window', 'From 30 days after "Card Was Mailed"', 'USCIS e-Request'],
        ],
      },
      links: [
        {
          label: 'OPT EAD processing time 2026, updated monthly',
          href: '/blog/opt-processing-time-2026',
        },
        {
          label: 'STEM OPT processing time 2026',
          href: '/blog/stem-opt-processing-time-2026',
        },
        {
          label: 'H-4 EAD case tracking',
          href: '/blog/h4-ead-case-status-tracking',
        },
      ],
      sources: [src.times, src.myProgress],
    },
    {
      heading: 'Three ways to track an EAD, and what each one adds',
      paragraphs: [
        'USCIS Case Status Online is the public tool: enter the receipt number and read the current message. It needs no account and works for any receipt. It shows only the latest message, so it is easy to miss a step if you do not check daily.',
        'A USCIS online account adds the case history, the USPS tracking number once the card is mailed, myProgress estimates for I-765 cases filed online, and the ability to update your address and respond to RFEs. If you filed on paper, you can still link the case to an account with the online access code on the receipt notice.',
        'A tracker such as TrackMyOPT stores the receipt, checks USCIS for you and sends an email when the message changes. The free plan keeps the receipt and lets you refresh on demand; Pro checks daily. It never replaces the USCIS notice, which remains the only official record of the decision.',
      ],
      bullets: [
        'Case Status Online: fastest, no account, latest message only.',
        'USCIS online account: history, USPS tracking, address changes, RFE responses, myProgress.',
        'TrackMyOPT: alerts on change, one place for several receipts, OPT unemployment-day counting alongside the status.',
      ],
      links: [
        {
          label: 'USCIS case status tracking guide',
          href: '/blog/uscis-case-status-tracking-guide',
        },
        {
          label: 'How TrackMyOPT case tracking works',
          href: '/features/case-status',
        },
      ],
      sources: [src.status, src.myProgress],
    },
    {
      heading: 'Card late, lost, returned or wrong: what to do',
      paragraphs: [
        'A card that shows "Card Was Mailed" but has not arrived after 30 days qualifies for a nondelivery request through USCIS e-Request. Before filing it, check the USPS tracking number in your USCIS account and your Informed Delivery scans, and confirm that the mailing address USCIS has is the one you live at. A card returned to USCIS as undeliverable is reissued only after the address is corrected.',
        'A card that arrives with a wrong name, date of birth, category or validity date should be reported promptly. If the error was USCIS’s, there is no fee for the replacement; if it came from the application, a new I-765 with fee is usually required. Do not start work on a card whose dates or category do not match your approval notice without asking USCIS or counsel first.',
        'A lost or stolen card means a replacement I-765 with fee, and the old card number is cancelled. Keep a scan of the front and back of every EAD as soon as it arrives; the card number and dates are needed for I-9 completion, SEVP Portal reporting for OPT, and any later replacement request.',
      ],
      numbered: [
        'Check USPS tracking and Informed Delivery.',
        'Confirm the address on file in your USCIS account.',
        'File a nondelivery e-Request 30 days after "Card Was Mailed".',
        'For errors or loss, file the appropriate replacement request and keep the notices.',
      ],
      links: [
        {
          label: 'EAD lost, stolen, incorrect or never delivered',
          href: '/blog/ead-card-lost-stolen-incorrect-never-delivered',
        },
        {
          label: 'Changing address while an OPT case is pending',
          href: '/blog/change-address-on-opt-sevp-portal-uscis',
        },
      ],
      sources: [src.inquiries, src.informedDelivery, src.ead],
    },
    {
      heading: 'Can you work while the EAD status is still pending?',
      paragraphs: [
        'For a first EAD, no: employment authorization begins on the start date printed on the card, and a receipt or an approval message is not a work document for Form I-9. OPT applicants in particular cannot start before the EAD start date even if the status says approved.',
        'For a renewal, the answer changed in 2025. The automatic extension of an expiring EAD while a timely renewal is pending was ended for most categories for renewals filed on or after October 30, 2025, with limited exceptions. If your renewal falls under that rule, the pending status does not keep you authorized past the expiry on the old card, and your employer’s I-9 team will need the new card. Ask counsel which rule applies to your filing date and category.',
        'STEM OPT applicants are the main exception that still helps: a timely filed STEM extension gives up to 180 days of continued authorization while the I-765 is pending, under the F-1 regulations rather than the general renewal rule.',
      ],
      links: [
        {
          label: 'Can you start work before the OPT EAD arrives?',
          href: '/blog/can-you-start-work-before-opt-ead-arrives',
        },
        {
          label: 'STEM OPT 180-day automatic extension explained',
          href: '/blog/stem-opt-180-day-auto-extension-explained-2026',
        },
      ],
      sources: [src.renewals, src.i765],
    },
    {
      heading: 'Example: Daniel’s status says approved but the start date is Monday',
      paragraphs: [
        'Fictional example: Daniel’s OPT I-765 shows "Case Was Approved" on Wednesday. His employer wants him to start on Monday. He has no card and no "Card Was Mailed" message.',
        'Daniel tells the employer the truth: the approval exists, the card does not, and OPT work cannot begin before the EAD start date on the card. He checks his USCIS account each morning, sees "Card Was Mailed" on Friday with a USPS tracking number, and the card arrives the following Thursday. He starts the next day, completes the I-9 with the card, and reports the employer in the SEVP Portal.',
        'The useful habit is the one Daniel used: read the status for what it says, not for what you hope it implies, and keep the employer informed with the actual message and date.',
      ],
    },
  ],
  checklist: [
    'Use the I-765 receipt, not a related application’s receipt.',
    'Link the case to a USCIS online account for history and USPS tracking.',
    'Treat "Card Was Mailed" as the start of the 30-day nondelivery window.',
    'Scan the card front and back on arrival and check every printed date.',
  ],
  mistakes: [
    'Reading "Case Was Approved" as permission to start work.',
    'Checking an I-485 or I-539 receipt and assuming it reflects the EAD.',
    'Moving without updating the USCIS address while a card is in production.',
    'Relying on an automatic extension for a renewal filed after October 30, 2025.',
  ],
  faq: [
    {
      question: 'How do I check my EAD status?',
      answer:
        'Enter the 13-character Form I-765 receipt number at USCIS Case Status Online or open the case in your USCIS online account. The account also shows the case history and, after mailing, the USPS tracking number.',
    },
    {
      question: 'What does "Card Is Being Produced" mean?',
      answer:
        'USCIS has approved the I-765 and the physical card is being printed. "Card Was Mailed" usually follows within a few business days, and delivery normally takes another 3 to 10 days.',
    },
    {
      question: 'How long after approval does the EAD card arrive?',
      answer:
        'Usually one to three weeks. Production takes a few business days, then USPS Priority Mail delivery takes 3 to 10 days. If the card has not arrived 30 days after "Card Was Mailed", file a nondelivery e-Request.',
    },
    {
      question: 'Can I track my EAD card with USPS?',
      answer:
        'Yes. Once the status shows "Card Was Mailed", the USPS tracking number appears in your USCIS online account. USPS Informed Delivery also shows the envelope scan on the day of delivery.',
    },
    {
      question: 'What if my EAD status has not changed for months?',
      answer:
        'Compare your receipt date with the USCIS processing time for your I-765 category. If the case is outside that time, the e-Request tool allows an "outside normal processing time" inquiry. For OPT, also check the monthly processing-time guide to see what similar cases are doing.',
    },
    {
      question: 'Does a pending EAD renewal let me keep working?',
      answer:
        'For most categories, not if the renewal was filed on or after October 30, 2025, when the general automatic extension ended. STEM OPT extensions keep their own 180-day rule. Confirm your category and filing date with counsel.',
    },
  ],
  sources: [
    src.status,
    src.times,
    src.myProgress,
    src.inquiries,
    src.i765,
    src.renewals,
    src.ead,
  ],
  related: [
    {
      label: 'USCIS case status tracking guide',
      href: '/blog/uscis-case-status-tracking-guide',
    },
    {
      label: 'OPT EAD card guide',
      href: '/blog/opt-ead-card-guide',
    },
    {
      label: 'OPT EAD pending: delays in 2026',
      href: '/blog/opt-ead-pending-processing-delays-2026',
    },
    {
      label: 'Form I-765 and EAD application guide',
      href: '/blog/form-i765-ead-application-guide',
    },
  ],
});
