import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "i-765 processing time after biometrics" and "how long after biometrics to
// get work permit 2026" have no page of their own (about 800 impressions a
// quarter). Readers are mid-wait, so the guide uses the USCIS tracking CTA and
// links sideways to the biometrics and EAD status guides.

const src = {
  biometrics: {
    label: 'Preparing for Your Biometric Services Appointment',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/filing-guidance/preparing-for-your-biometric-services-appointment',
  },
  times: {
    label: 'Check Case Processing Times',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/',
  },
  timesFaq: {
    label: 'Processing Times FAQs',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/processing-times-faqs',
  },
  status: {
    label: 'Case Status Online',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  i765: {
    label: 'Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  i765instr: {
    label: 'Instructions for Form I-765',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf',
  },
  reuse: {
    label: 'Policy Manual, Volume 1, Part C, Chapter 2: Biometrics Collection (updated by PA-2025-29, December 12, 2025)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-1-part-c-chapter-2',
  },
  i539bio: {
    label: 'USCIS Exempts Biometric Services Fee for All Form I-539 Applicants',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/newsroom/alerts/uscis-exempts-biometric-services-fee-for-all-form-i-539-applicants',
  },
  premium: {
    label: 'How Do I Request Premium Processing?',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing',
  },
  eRequest: {
    label: 'Case inquiries and outside normal processing time requests (e-Request)',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/e-request/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'i-765-processing-time-after-biometrics';

export const i765AfterBiometricsGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  hub: 'processing-times',
  title:
    'I-765 Processing Time After Biometrics: How Long Until the Work Permit Arrives (2026)',
  seoTitle: 'I-765 Processing Time After Biometrics (2026): What Comes Next',
  description:
    'Biometrics does not restart the I-765 clock. See what USCIS does after the appointment, how long each remaining step usually takes by category, and when a case counts as late.',
  category: 'USCIS',
  tags: [
    'I-765 processing time',
    'after biometrics',
    'work permit 2026',
    'EAD timeline',
    'OPT biometrics',
    'USCIS processing times',
  ],
  readTime: '8 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  showContents: true,
  cta: 'uscis-tracking',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the I-765 path from biometrics appointment to the card in the mailbox.',
  imageCaption:
    'What is left after biometrics: background checks, adjudication, card production and mailing. Timings come from the USCIS steps described in this guide.',
  directAnswer:
    'There is no separate USCIS processing time that starts at biometrics. The posted I-765 time still counts from the receipt date, and the appointment is one step inside it. After the fingerprints are taken, most applicants see "Case Is Being Actively Reviewed" within days, then wait for the decision for the rest of the posted time for their category. Once "Case Was Approved" appears, the card is usually produced within a week and delivered by USPS within one to three weeks. How long the gap from biometrics to approval lasts depends on the category: weeks for most OPT cases, several months for categories such as pending adjustment of status.',
  keyTakeaways: [
    'Biometrics is a checkpoint, not a clock. USCIS measures the I-765 processing time from the receipt date, and the appointment date changes nothing in that calculation.',
    'The wait after biometrics is the category wait minus the time already spent. Look up Form I-765 and your category in the USCIS processing-times tool, then subtract how long the case has been pending.',
    'Since December 12, 2025, USCIS no longer uses self-submitted photos and reuses a photo only if it was taken at a USCIS biometrics appointment within the last three years. Most first-time OPT applicants therefore get a biometrics notice now. It is routine, not a sign of a problem.',
    'After approval the remaining steps are predictable: card production in a few business days, USPS delivery in 3 to 10 days, and a nondelivery request from 30 days after "Card Was Mailed".',
  ],
  sections: [
    {
      heading: 'Why there is no "after biometrics" processing time',
      paragraphs: [
        'USCIS publishes one processing time per form and category, and it describes how long recently completed cases took from the receipt date to the decision. The biometrics appointment sits inside that window. When the tool says a category takes about four months, it already includes the weeks it took to schedule and attend the appointment and run the checks on the fingerprints.',
        'That is why the search "I-765 processing time after biometrics" has no official answer. The useful calculation is simple: find the posted time for your category, then subtract how long your case has already been pending. If the posted time is 4 months and you filed 10 weeks ago, the remaining wait, on a typical case, is around 6 weeks, whether the appointment happened in week 3 or week 8.',
        'The appointment does change one thing. Until the fingerprints are on file, USCIS cannot complete the background and identity checks that every decision needs. A case where biometrics is pending cannot be approved, so a delayed or rescheduled appointment pushes the decision back by the same delay.',
      ],
      links: [
        {
          label: 'OPT biometrics appointment: why you were scheduled and what to bring',
          href: '/blog/opt-biometrics-appointment-2026',
        },
        {
          label: 'OPT processing time 2026, with the current USCIS figures',
          href: '/blog/opt-processing-time-2026',
        },
      ],
      sources: [src.times, src.timesFaq],
    },
    {
      heading: 'What USCIS does after the fingerprints are taken',
      paragraphs: [
        'At the Application Support Center the officer scans your fingerprints, takes a photograph and captures a signature, then stamps the appointment notice. Within a few days the online status usually changes to a message saying your fingerprints were taken. Cases where USCIS reused earlier biometrics skip that message and move straight to review.',
        'The prints go to the FBI and to the Department of Homeland Security identity systems for criminal and immigration-history checks. Most results return within days. A name or fingerprint match that needs manual review takes longer and is invisible to you; the status stays on "Case Is Being Actively Reviewed" for the whole time.',
        'Only after the checks clear does an officer adjudicate the application. For OPT, that means confirming the Form I-20 recommendation, the filing window, the requested dates and the eligibility category, then approving or issuing a request for evidence. The decision date, not the biometrics date, is what USCIS reports in its processing-time statistics.',
      ],
      table: {
        caption: 'The status messages that typically follow biometrics, in order.',
        columns: ['Status message', 'When it appears', 'What it means'],
        rows: [
          ['Fingerprint Fee Was Received', 'With or shortly after the receipt', 'A biometrics fee, where charged, was recorded. Not every I-765 shows it.'],
          ['Case Was Updated To Show Fingerprints Were Taken', '1 to 3 days after the appointment', 'The ASC uploaded your prints. The background checks start.'],
          ['Case Is Being Actively Reviewed', 'Days to weeks after the prints', 'Checks or review are under way. The message can sit unchanged for weeks.'],
          ['Request for Evidence Was Sent', 'Any time during review', 'USCIS needs a document. The clock keeps running, but the case waits for your reply.'],
          ['Case Was Approved', 'End of the category wait', 'The decision is made. The card does not exist yet.'],
          ['New Card Is Being Produced', 'Usually within a week of approval', 'Printing has started.'],
          ['Card Was Mailed To Me', '1 to 5 business days after production', 'USPS has the card; a tracking number appears in your USCIS account.'],
        ],
      },
      links: [
        {
          label: 'EAD card status: every status message and what to do at each',
          href: '/blog/ead-card-status-check',
        },
      ],
      sources: [src.biometrics, src.status],
    },
    {
      heading: 'Who gets a biometrics notice for an I-765 in 2026',
      paragraphs: [
        'More applicants than a year ago. Until late 2025 USCIS often decided I-765 cases with the passport-style photos mailed with the form and fingerprints it already had. Policy Alert PA-2025-29, effective for filings on or after December 12, 2025, ended the use of self-submitted photos. USCIS now reuses a photo only if it was taken at a USCIS biometrics appointment within roughly the previous three years, and it keeps the discretion to ask for a new one anyway.',
        'For F-1 students that changes the default. A first OPT application usually has no USCIS-taken photo on file, because visa and border photos are not USCIS biometrics, so a notice to attend an Application Support Center is now the normal path. A STEM OPT extension filed within three years of an earlier USCIS appointment may be decided with the photo already on file, but that is up to USCIS. Adjustment-of-status applicants always attend, because the I-485 requires new biometrics and that appointment covers the I-765 filed with it.',
        'A notice therefore says little about your odds. It is not a sign of a problem with the application, and the absence of one does not mean the case is fast-tracked. Attend the appointment or reschedule it before the date; the Form I-765 instructions warn that failing to appear can lead to denial.',
      ],
      bullets: [
        'First OPT filed after December 12, 2025: expect an appointment.',
        'STEM OPT extension within three years of an earlier USCIS appointment: the photo may be reused, at USCIS discretion.',
        'I-765 filed with an I-485: always an appointment, one visit covers all forms.',
        'I-765 with an I-539 (H-4 EAD): no I-539 biometrics fee since October 2023, but the I-765 photo rule still applies.',
      ],
      sources: [src.reuse, src.i539bio, src.i765instr],
    },
    {
      heading: 'Typical time from biometrics to the card, by category',
      paragraphs: [
        'The honest figure is the posted processing time for your category minus the time you have already waited. The table turns that into the ranges applicants most often report after biometrics, together with the USCIS processing-time category to look up. The ranges are descriptions of recent cases, not promises about yours, and they move every month.',
        'For OPT the picture in TrackMyOPT’s own reported cases is consistent with those ranges. Among completed, non-premium initial OPT cases in the August 2026 partner snapshot, the median application-to-approval time was 72 to 96 calendar days depending on the receipt month, and premium cases took a median of 42 calendar days from the premium request to approval. Those cases were filed before the December 2025 photo policy, so the 2026 medians may run a little longer while more applicants attend an appointment.',
      ],
      table: {
        caption: 'Where biometrics sits in the I-765 timeline and what is usually left after it. Check the current figure for your category in the USCIS processing-times tool before relying on any range.',
        columns: ['I-765 category', 'Biometrics?', 'Usual wait after biometrics to approval', 'Processing-times category to look up'],
        rows: [
          ['OPT (c)(3)(A), (c)(3)(B)', 'Usually, since December 2025', 'Often 3 to 10 weeks', 'Based on a request by a qualified F-1 academic student [(c)(3)]'],
          ['STEM OPT (c)(3)(C)', 'Sometimes; a recent USCIS photo may be reused', 'Same as OPT; 180-day automatic extension while pending', 'Based on a request by a qualified F-1 academic student [(c)(3)]'],
          ['OPT or STEM OPT with premium processing', 'Same as above', '30 business days from the complete I-907, paused until biometrics are done', 'Not shown; premium has its own clock'],
          ['Pending adjustment of status (c)(9)', 'Usually, with the I-485', 'Several months; often the longest I-765 wait', 'Based on a pending I-485 adjustment application [(c)(9)]'],
          ['H-4 spouse (c)(26)', 'Depends on a recent USCIS photo', 'Tied to the I-539 decision; weeks to months', 'Based on being an H-4 spouse of an H-1B nonimmigrant [(c)(26)]'],
          ['Pending asylum (c)(8)', 'Yes, routinely', 'Often a few weeks once the 150-day waiting period has passed', 'Based on a pending asylum application [(c)(8)]'],
        ],
      },
      note: 'Premium processing is the one case where biometrics can visibly stretch the clock: USCIS counts 30 business days from the point it has everything it needs, and a biometrics appointment it schedules after the I-907 can pause that count until you attend.',
      links: [
        {
          label: 'Monthly OPT and EAD processing times from reported receipt dates',
          href: '/blog/monthly-opt-ead-processing-times-receipt-date',
        },
        {
          label: 'Premium processing for OPT and STEM OPT: fee, clock and whether it is worth it',
          href: '/blog/premium-processing-opt-stem-opt-2026-complete-guide',
        },
        {
          label: 'STEM OPT 180-day automatic extension explained',
          href: '/blog/stem-opt-180-day-auto-extension-explained-2026',
        },
      ],
      sources: [src.times, src.premium],
    },
    {
      heading: 'When a case after biometrics counts as late',
      paragraphs: [
        'USCIS lets you ask about a case only once it is outside normal processing time. The processing-times tool shows a "receipt date for a case inquiry": if your receipt date is earlier than that date, the case qualifies and the e-Request tool will accept an "outside normal processing time" inquiry. Biometrics does not change that date, so there is no separate waiting period you must sit through after the appointment.',
        'Before the inquiry, check three things. Make sure the status does not show a request for evidence you have not seen; the summary online can lag the mailed notice. Confirm the address on file is current, because a notice sent to an old address resets nothing. And check that you are tracking the I-765 receipt and not a companion form.',
        'For OPT applicants a late case has an extra cost. The requested start date can pass while the case is pending, the 14-month completion rule can shorten the authorization, and unemployment days begin on the EAD start date even if the card arrives weeks later. The decision-window and 14-month guides below explain those effects and the options, including a late premium upgrade.',
      ],
      numbered: [
        'Look up Form I-765 and your category in the processing-times tool.',
        'Compare your receipt date with the "receipt date for a case inquiry".',
        'If eligible, file an outside-normal-processing-time e-Request; otherwise set a reminder for the date you become eligible.',
        'Tell your DSO if an OPT start date is at risk and ask about premium processing.',
      ],
      links: [
        {
          label: 'When will USCIS decide my OPT? The decision window explained',
          href: '/blog/when-will-uscis-decide-my-opt-decision-window',
        },
        {
          label: 'OPT 14-month rule: how USCIS delays shorten your EAD',
          href: '/blog/opt-14-month-rule-delays-shorten-authorization-2026',
        },
        {
          label: 'OPT EAD pending: processing delays in 2026',
          href: '/blog/opt-ead-pending-processing-delays-2026',
        },
      ],
      sources: [src.timesFaq, src.eRequest],
    },
    {
      heading: 'Example: Priya attends biometrics in week five',
      paragraphs: [
        'Fictional example: Priya files her OPT I-765 online on March 2. The posted time for the (c)(3) category that month is about 3.5 months. In week three she gets a biometrics notice, attends on April 6, and a few days later the status confirms the fingerprints were taken, then changes to "Case Is Being Actively Reviewed".',
        'Nothing changes for six weeks. Priya does the subtraction: 3.5 months from March 2 points to mid June, and the inquiry date in the tool is still weeks away, so the quiet is normal. "Case Was Approved" appears on June 9, "Card Is Being Produced" on June 12, and the card arrives on June 20, before the July 1 start date on her I-20.',
        'Her appointment added no time to the posted figure. What it did was remove the one condition that would have blocked the approval. That is the right way to read a biometrics notice: a step to clear quickly, not a new timer to watch.',
      ],
    },
  ],
  checklist: [
    'Attend or reschedule biometrics before the appointment date; a missed appointment can end the case.',
    'Look up the posted I-765 time for your exact category and note the case-inquiry receipt date.',
    'Track the I-765 receipt number, not the I-20, SEVIS ID or a companion form’s receipt.',
    'Keep the mailing address current in your USCIS account until the card is delivered.',
  ],
  mistakes: [
    'Treating the appointment date as the start of a new processing time.',
    'Assuming a biometrics notice means USCIS found a problem, or that no notice means the case is fast.',
    'Filing a case inquiry before the receipt date qualifies, which gets a form reply and no action.',
    'Starting OPT work on the approval message before the EAD start date on the card.',
  ],
  faq: [
    {
      question: 'How long after biometrics does it take to get a work permit in 2026?',
      answer:
        'It depends on the I-765 category, because USCIS counts the whole time from the receipt date and biometrics is one step inside it. OPT and STEM OPT cases often see a decision within about 3 to 10 weeks of the appointment, adjustment-of-status EADs often take several months more, and asylum-based EADs are often decided within weeks once the waiting period has passed. After approval, the card typically arrives within one to three weeks.',
    },
    {
      question: 'Does the I-765 processing time restart after biometrics?',
      answer:
        'No. The posted processing time and the case-inquiry eligibility date are both calculated from the receipt date. The appointment does not reset either one.',
    },
    {
      question: 'What status should I see after biometrics?',
      answer:
        'Usually "Case Was Updated To Show Fingerprints Were Taken" within a few days, then "Case Is Being Actively Reviewed". The next meaningful change is "Case Was Approved", a request for evidence, or a denial.',
    },
    {
      question: 'Why did I get a biometrics appointment for my OPT I-765?',
      answer:
        'Since December 12, 2025, USCIS no longer uses photos mailed with the form and reuses only a photo taken at a USCIS appointment within about the last three years. Most first-time OPT applicants have no such photo, so an appointment is now routine.',
    },
    {
      question: 'Can I check whether my case is outside normal processing time?',
      answer:
        'Yes. Open the USCIS processing-times tool, choose Form I-765 and your category, and compare your receipt date with the "receipt date for a case inquiry". If your receipt date is earlier, you can submit an outside-normal-processing-time e-Request.',
    },
    {
      question: 'Will premium processing skip biometrics?',
      answer:
        'No. Premium processing changes the clock, not the steps. If USCIS needs your prints it will schedule the appointment, and the 30-business-day count can pause until you attend.',
    },
  ],
  sources: [
    src.times,
    src.timesFaq,
    src.biometrics,
    src.reuse,
    src.i539bio,
    src.i765,
    src.i765instr,
    src.premium,
    src.eRequest,
  ],
  related: [
    {
      label: 'OPT biometrics appointment in 2026',
      href: '/blog/opt-biometrics-appointment-2026',
    },
    {
      label: 'EAD card status: check it and decode every message',
      href: '/blog/ead-card-status-check',
    },
    {
      label: 'OPT processing time 2026',
      href: '/blog/opt-processing-time-2026',
    },
    {
      label: 'USCIS myProgress "taking longer than expected"',
      href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
    },
  ],
});
