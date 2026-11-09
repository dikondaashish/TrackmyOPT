import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "uscis green card tracking" (105 impressions a quarter), "green card status
// tracker" (27) and "i-140 tracking by company" (29) had no page for the
// I-485 stage. Every rule below was checked on 2026-11-09 against the USCIS
// Form I-485, I-765 and employment-based green card pages, the USCIS Policy
// Manual (Vol. 7, Part A, Chapters 3, 5, 6 and 8; Part E, Chapter 5), the
// USCIS filing-charts page, the November 2026 Visa Bulletin and 8 CFR 245.2.
// No fees are quoted: the USCIS fee schedule page did not render a fee table
// for this review, so the article points readers to Form G-1055 instead.

const src = {
  i485: {
    label: 'Form I-485, Application to Register Permanent Residence or Adjust Status',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-485',
  },
  i765: {
    label: 'Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  ebGreenCard: {
    label: 'Green Card for Employment-Based Immigrants',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-employment-based-immigrants',
  },
  charts: {
    label: 'Adjustment of Status Filing Charts from the Visa Bulletin',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts-from-the-visa-bulletin',
  },
  bulletinNov: {
    label: 'Visa Bulletin for November 2026',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2027/visa-bulletin-for-november-2026.html',
  },
  pmAdjudication: {
    label: 'Policy Manual, Volume 7, Part A, Chapter 6: Adjudicative Review',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-6',
  },
  pmInterview: {
    label: 'Policy Manual, Volume 7, Part A, Chapter 5: Interview Guidelines',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-5',
  },
  pmFiling: {
    label: 'Policy Manual, Volume 7, Part A, Chapter 3: Filing Instructions',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-3',
  },
  pmTransfer: {
    label: 'Policy Manual, Volume 7, Part A, Chapter 8: Transfer of Underlying Basis',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-a-chapter-8',
  },
  pmPortability: {
    label: 'Policy Manual, Volume 7, Part E, Chapter 5: Job Portability after Adjustment Filing',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-e-chapter-5',
  },
  pmParolee: {
    label: 'Policy Manual, Volume 7, Part B, Chapter 5: Employment-Based Applicant Not in Lawful Nonimmigrant Status',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-7-part-b-chapter-5',
  },
  ebFaq: {
    label: 'Employment-Based Adjustment of Status FAQs',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/fiscal-year-2023-employment-based-adjustment-of-status-faqs',
  },
  cfr2452: {
    label: '8 CFR 245.2: Application for adjustment of status',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-245/section-245.2',
  },
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
  fees: {
    label: 'Fee Schedule (Form G-1055)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/g-1055',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'i-485-green-card-status-tracking';

export const i485StatusGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'I-485 Green Card Status Tracking: Every Receipt, Status Message and Visa Bulletin Check After OPT',
  seoTitle: 'I-485 Green Card Status Tracker: Track Every Receipt',
  description:
    'Track an I-485 green card case by receipt number: the I-765 (c)(9) and I-131 companion receipts, each status message in order, how the Visa Bulletin chart controls filing and approval, and what to keep on file.',
  category: 'USCIS',
  tags: [
    'I-485 status',
    'green card status tracker',
    'USCIS green card tracking',
    'adjustment of status',
    'c9 EAD',
    'advance parole',
    'AC21 portability',
  ],
  readTime: '10 min read',
  publishedDate: '2026-11-06',
  modifiedDate: '2026-11-09',
  showContents: true,
  hub: 'after-opt',
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the I-485 green card path from receipt through biometrics, interview, approval and card delivery.',
  imageCaption:
    'The I-485 stages an OPT or H-1B worker tracks. Generated from the USCIS process described in this guide.',
  directAnswer:
    'Track a green card application with the Form I-485 receipt number on its I-797C receipt notice, entered at USCIS Case Status Online. Most employment-based applicants also file Form I-765 under category (c)(9) and Form I-131 for advance parole. Each has its own receipt number and moves on its own schedule. You can file the I-485 only when your priority date is current on the Visa Bulletin chart USCIS selects for that month. USCIS can approve it only when your date is current on the Final Action Dates chart.',
  keyTakeaways: [
    'An employment-based green card case usually produces four receipts: the I-140 petition, the I-485, the I-765 (c)(9) work permit and the I-131 travel document. Track each one separately.',
    'USCIS picks each month whether employment-based applicants use the Dates for Filing chart or the Final Action Dates chart to file. For November 2026 it chose Dates for Filing.',
    'Approval needs a visa number under the Final Action Dates chart in effect on the decision date. A filed I-485 can wait years for that in backlogged categories.',
    'Leaving the United States while an I-485 is pending generally abandons it unless you first get advance parole. The H-1B and L-1 travel exception does not cover F-1 students.',
    'After 180 days pending, AC21 portability can let you change to a same or similar job using Supplement J, if the I-140 is approved or approvable.',
  ],
  sections: [
    {
      heading: 'Which receipt numbers a green card case produces',
      paragraphs: [
        'An employment-based green card is not one case. It is a petition plus an application, and usually two companion requests. Each filing gets its own I-797C receipt notice with a 13-character receipt number.',
        'The I-140 is the immigrant petition. Your employer files it, except in self-petition categories such as EB-1A and the EB-2 National Interest Waiver. The I-485 is your own application to become a permanent resident. If a visa is immediately available, USCIS lets you file it together with the I-140, while the I-140 is pending, or after approval.',
        'With a pending I-485 you may also file Form I-765 for a work permit under category (c)(9) and Form I-131 for advance parole. USCIS says you may file both at the same time as the I-485. Since April 1, 2024, each one carries its own fee; check the current amounts on the USCIS fee schedule, Form G-1055.',
      ],
      table: {
        caption: 'The receipts in a typical employment-based green card case.',
        columns: ['Form', 'Who files', 'What the receipt tracks', 'What approval gives you'],
        rows: [
          ['I-140', 'Employer, or you in a self-petition category', 'The immigrant petition', 'A valid basis for the green card and, usually, your priority date'],
          ['I-485', 'You', 'Your adjustment of status application', 'Permanent residence and a green card'],
          ['I-765, category (c)(9)', 'You', 'Work permit based on the pending I-485', 'An EAD showing category C09'],
          ['I-131', 'You', 'Advance parole request', 'A travel document so a trip abroad does not abandon the I-485'],
        ],
      },
      note: 'If you file the I-485 by mail at a USCIS lockbox, your A-Number may arrive in a second notice a few days after the receipt notice, according to USCIS.',
      links: [
        { label: 'I-140 case status tracker', href: '/blog/i-140-case-status-tracking' },
        { label: 'C09 and other EAD category codes explained', href: '/blog/c03b-c03c-c03a-ead-category-codes' },
        { label: 'How to read a USCIS receipt number', href: '/blog/ioe-receipt-number-elis-case-status' },
      ],
      sources: [src.ebGreenCard, src.i485, src.i765, src.fees],
    },
    {
      heading: 'I-485 status messages, in order',
      paragraphs: [
        'Case Status Online shows short public messages. The wording below is what USCIS commonly displays for an I-485. Not every case sees every message, and some steps happen without any status change at all.',
        'The notices in your mailbox or USCIS online account are the official record. Case Status Online sometimes lags behind a mailed notice by days.',
      ],
      table: {
        caption: 'Common I-485 status messages and what each one usually means.',
        columns: ['Status message', 'What it usually means', 'What to do'],
        rows: [
          ['Case Was Received', 'USCIS accepted the I-485 and the fee. The receipt date is your filing date.', 'Save the receipt notice. Check the I-765 and I-131 receipts arrived too.'],
          ['Case Was Updated To Show Fingerprints Were Taken', 'Your biometrics appointment is done.', 'Nothing. Keep the stamped appointment notice.'],
          ['Interview Was Scheduled', 'A field office set an interview date and mailed a notice.', 'Read the notice for the date, office and documents to bring.'],
          ['Request for Evidence Was Sent', 'USCIS needs more documents, for example a missing medical exam or proof of the job offer.', 'Answer by the deadline on the notice, with your attorney.'],
          ['Case Was Approved', 'You are a permanent resident as of the approval.', 'Get a copy of the approval notice and watch for the card messages.'],
          ['New Card Is Being Produced', 'The physical green card is in production.', 'Confirm your mailing address with USCIS.'],
          ['Card Was Mailed To Me', 'USCIS sent the card by mail. The status may include a tracking number.', 'Watch the mail and the tracking number.'],
          ['Card Was Delivered To Me By The Post Office', 'The Postal Service reports delivery.', 'Check the card details for errors right away.'],
        ],
      },
      note: 'An interview can be waived. In that case you may see "Case Was Approved" without ever seeing an interview message. Silence for months between biometrics and a decision is normal in many categories.',
      links: [
        { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
        { label: 'What each EAD status means', href: '/blog/ead-card-status-check' },
      ],
      sources: [src.status, src.i485],
    },
    {
      heading: 'Biometrics, interview or waiver',
      paragraphs: [
        'After the receipt, USCIS generally schedules a biometrics appointment at an Application Support Center. The appointment notice is mailed to you and is worth keeping.',
        'The USCIS Policy Manual says every adjustment applicant must be interviewed by an officer unless USCIS waives the interview. Some cases are approved without one. If you get an interview notice, it names the office and the documents to bring.',
        'Processing time depends on the office and the form type. Use the USCIS processing-times tool for the I-485 at your field office, not a forum average.',
      ],
      sources: [src.pmInterview, src.times],
    },
    {
      heading: 'How the Visa Bulletin chart controls filing and approval',
      paragraphs: [
        'Most employment-based categories have a yearly limit, so you wait in line by priority date. For PERM cases, the priority date is generally the date the Department of Labor accepted the labor certification. For self-petitions, it is generally the I-140 filing date.',
        'Every month the State Department Visa Bulletin prints two charts. The Dates for Filing chart says when you may submit an I-485. The Final Action Dates chart says when a visa number can actually be issued. USCIS decides each month which chart adjustment applicants must use to file, and posts that choice on its own filing-charts page.',
        'For November 2026, USCIS said all employment-based applicants must use the Dates for Filing chart. The December 2026 choice is posted separately. Approval is a different test. The Policy Manual says a visa must be available at filing and again at approval, and approval uses the Final Action Dates chart in effect that day.',
      ],
      table: {
        caption: 'November 2026 Visa Bulletin, employment-based cutoffs for India and most other countries (official).',
        columns: ['Category', 'India: Final Action', 'India: Dates for Filing', 'All other areas: Final Action', 'All other areas: Dates for Filing'],
        rows: [
          ['EB-1', 'Feb 1, 2023', 'Jul 1, 2024', 'Current', 'Current'],
          ['EB-2', 'Nov 1, 2013', 'Jan 15, 2015', 'Apr 1, 2025', 'Mar 15, 2026'],
          ['EB-3', 'Jan 22, 2014', 'Jan 15, 2015', 'Jun 15, 2024', 'Aug 1, 2024'],
        ],
      },
      note: 'A filed I-485 with a priority date that is current only on the Dates for Filing chart will stay pending until the Final Action Date reaches it. That wait is when the (c)(9) EAD and advance parole matter most.',
      links: [
        { label: 'December 2026 Visa Bulletin predictions', href: '/blog/december-2026-visa-bulletin-predictions' },
        { label: 'November 2026 Visa Bulletin for OPT workers', href: '/blog/november-2026-visa-bulletin-predictions-opt-workers' },
      ],
      sources: [src.charts, src.bulletinNov, src.pmAdjudication],
    },
    {
      heading: 'Changing jobs or category while the I-485 is pending',
      paragraphs: [
        'AC21 portability, in INA 204(j), lets some applicants move to a new job without restarting the case. The I-485 must have been pending for 180 days or more. The I-140 must be approved, or pending and later approved. The new job must be in the same or a similar occupational classification.',
        'You request portability, or confirm the original job offer, with Form I-485 Supplement J. USCIS reviews it as part of the I-485. Portability does not move your place in line; the visa still depends on the Final Action Date for your category and country.',
        'A transfer of underlying basis is different. It asks USCIS to decide the pending I-485 on a different petition, such as a new EB-2 I-140 instead of the original EB-3. USCIS lists four conditions: you continuously kept eligibility, the original I-485 is still pending, you qualify in the new category and a visa is immediately available there. The request must be in writing, and generally no new I-485 or fee is required.',
      ],
      note: 'USCIS does not notify you when it grants a transfer of underlying basis. A Supplement J receipt notice only shows USCIS uploaded the form; it is not a decision.',
      sources: [src.pmPortability, src.pmTransfer, src.ebGreenCard, src.ebFaq],
    },
    {
      heading: 'Travel and work while the I-485 is pending',
      paragraphs: [
        'Under 8 CFR 245.2, leaving the United States while an I-485 is pending generally abandons the application unless USCIS granted advance parole first. There is an exception for people in valid H-1 or L-1 status who return to the same employer with a valid visa. It also covers their H-4 and L-2 dependents.',
        'That exception does not include F-1 students on OPT or STEM OPT. If you are on F-1 status when the I-485 is filed, wait for the advance parole document before any trip abroad. Coming back on advance parole is a parole, not a readmission in F-1 status, and USCIS says a parolee is not in a lawful nonimmigrant status. Your OPT work permission may not continue after the trip, so ask your attorney before you travel even with advance parole.',
        'For work, the (c)(9) EAD is the permit based on the pending I-485. While your OPT or STEM OPT EAD is valid, it remains your work permit. Filing the (c)(9) request together with the I-485 starts the second permit early, which matters if OPT ends before the I-485 is decided.',
      ],
      links: [
        { label: 'Green card options after OPT', href: '/blog/green-card-after-opt' },
        { label: 'Can you travel on OPT?', href: '/blog/can-you-travel-on-opt-complete-guide' },
      ],
      sources: [src.cfr2452, src.pmParolee, src.pmFiling, src.i765],
    },
    {
      heading: 'What an OPT worker should keep on file',
      paragraphs: [
        'A green card case can last years and cross several jobs and statuses. Keep copies of everything in one place, because a later RFE or interview can ask about any of it.',
      ],
      bullets: [
        'Every I-797C receipt notice: I-140, I-485, I-765 and I-131, plus any Supplement J receipt.',
        'Biometrics appointment notices, interview notices and every RFE with your response.',
        'The I-140 approval notice, which shows your category and priority date.',
        'Each OPT and STEM OPT EAD, your I-20s with DSO endorsements and your Form I-983 if you were on STEM OPT.',
        'Your I-94 records and passport pages with entry stamps.',
        'Pay records and employment letters for each job, to show you kept status and worked as authorized.',
        'A short log of each status change and date, so you can hand it to your attorney.',
      ],
      links: [
        { label: 'Immigration documents to keep on OPT', href: '/blog/immigration-documents-to-keep-on-opt' },
        { label: 'I-94 travel history for OPT and H-1B holders', href: '/blog/i94-travel-history-opt-h1b' },
      ],
    },
    {
      heading: 'Tracking all four receipts together',
      paragraphs: [
        'The four receipts in a green card case move at different speeds. The (c)(9) EAD may be approved months before the I-485, and the I-131 can be approved on its own schedule. TrackMyOPT stores each receipt, checks USCIS for changes and emails you when a status moves.',
        'TrackMyOPT is a tracker, not legal advice. Its decision-window estimates are built from OPT and STEM OPT timelines and do not predict I-485 decisions. For strategy questions such as portability, travel or a change of category, talk to an immigration attorney.',
      ],
      links: [{ label: 'How TrackMyOPT case tracking works', href: '/features/case-status' }],
      sources: [src.times],
    },
    {
      heading: 'Example: Arjun files the I-485 near the end of STEM OPT',
      paragraphs: [
        'Fictional example: Arjun was born in Brazil and works on STEM OPT. His employer’s EB-2 I-140 was approved, and his priority date of January 10, 2026 falls before the November 2026 Dates for Filing cutoff for all other areas. USCIS used that chart for November, so he files his I-485 with an I-765 (c)(9) and an I-131.',
        'He tracks four receipts. Biometrics finish in December, and the (c)(9) EAD is approved before his STEM OPT EAD expires. His priority date is not yet current on the Final Action Dates chart, so the I-485 stays pending. He cancels a planned trip home until the advance parole document arrives. In this example, months later the Final Action Date passes his priority date and the status changes to "Case Was Approved", then "Card Was Mailed To Me".',
      ],
    },
  ],
  checklist: [
    'Save all four receipt numbers: I-140, I-485, I-765 (c)(9) and I-131.',
    'Check the USCIS filing-charts page each month before filing.',
    'Compare your priority date with the Final Action Date to see when approval is possible.',
    'Do not travel on F-1 status with a pending I-485 until advance parole is approved.',
    'File Supplement J with your attorney before changing jobs after 180 days.',
  ],
  mistakes: [
    'Tracking only the I-485 and missing an RFE on the I-765 or I-131.',
    'Using the Dates for Filing chart in a month when USCIS requires Final Action Dates.',
    'Assuming the H-1B travel exception covers F-1 students with a pending I-485.',
    'Changing jobs before the I-485 has been pending 180 days without legal advice.',
  ],
  faq: [
    {
      question: 'How do I check my green card status?',
      answer:
        'Enter the I-485 receipt number from your I-797C receipt notice at USCIS Case Status Online. Track the I-765 and I-131 receipts the same way, because each has its own status.',
    },
    {
      question: 'Which Visa Bulletin chart do I use to file an I-485?',
      answer:
        'The one USCIS names on its Adjustment of Status Filing Charts page for that month. For November 2026, employment-based applicants had to use the Dates for Filing chart.',
    },
    {
      question: 'Why is my I-485 still pending after biometrics?',
      answer:
        'Often because your priority date is not yet current on the Final Action Dates chart. USCIS cannot approve the I-485 until a visa number is available. Field office workload also matters.',
    },
    {
      question: 'Can I change employers while my I-485 is pending?',
      answer:
        'Possibly. AC21 portability generally needs the I-485 pending 180 days or more, an approved or approvable I-140 and a same or similar job. You request it with Supplement J. Ask an attorney first.',
    },
    {
      question: 'Can I travel while my I-485 is pending on OPT?',
      answer:
        'Generally not without advance parole. Leaving without it usually abandons the I-485. The H-1 and L-1 exception in the regulation does not cover F-1 students.',
    },
  ],
  sources: [
    src.i485,
    src.ebGreenCard,
    src.charts,
    src.bulletinNov,
    src.pmAdjudication,
    src.pmInterview,
    src.pmPortability,
    src.pmTransfer,
    src.cfr2452,
    src.i765,
    src.status,
    src.fees,
  ],
  related: [
    { label: 'I-140 case status tracker', href: '/blog/i-140-case-status-tracking' },
    { label: 'Green card after OPT', href: '/blog/green-card-after-opt' },
    { label: 'OPT to green card without H-1B', href: '/blog/opt-to-green-card-without-h1b' },
    { label: 'USCIS case status tracking guide', href: '/blog/uscis-case-status-tracking-guide' },
  ],
});
