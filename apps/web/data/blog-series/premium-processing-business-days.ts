import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "is premium processing 30 business days or calendar days" (29),
// "how long is premium processing for opt" (45), "how long does opt premium
// processing take" (108) and "opt premium processing time" (949) had no page
// that explains how the premium clock is counted. Every rule below was
// checked on 2026-11-09 against 8 CFR 106.4, the USCIS "How Do I Request
// Premium Processing?" page (last updated 2026-03-23) and the OPM federal
// holiday list for 2026 and 2027. The worked dates were counted by hand and
// by script with those holidays. USCIS does not publish a day-by-day counting
// method, so the example dates are estimates, not official deadlines.

const src = {
  cfr1064: {
    label: '8 CFR 106.4: Premium processing service',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-106/section-106.4',
  },
  premium: {
    label: 'How Do I Request Premium Processing?',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing',
  },
  i907: {
    label: 'Form I-907, Request for Premium Processing Service',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-907',
  },
  holidays: {
    label: 'Federal Holidays',
    publisher: 'U.S. Office of Personnel Management',
    url: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/',
  },
  status: {
    label: 'Check your immigration case status',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'premium-processing-business-days-or-calendar-days';

export const premiumProcessingBusinessDays: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'Is Premium Processing Business Days or Calendar Days? How the OPT, H-1B and I-140 Clocks Are Counted',
  seoTitle: 'Premium Processing: Business Days or Calendar Days?',
  description:
    'Premium processing counts business days, not calendar days. The 30-day OPT and 15-day H-1B clocks, holidays, RFE resets, refunds and a worked example.',
  category: 'USCIS',
  tags: [
    'premium processing',
    'business days',
    'OPT premium processing time',
    'Form I-907',
    'I-765 premium processing',
    'H-1B premium processing',
  ],
  readTime: '8 min read',
  publishedDate: '2026-11-09',
  modifiedDate: '2026-11-09',
  showContents: true,
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: premium processing clocks counted in business days, with 30 days for OPT and 15 days for H-1B.',
  imageCaption:
    'Premium processing timeframes are business days. Generated from 8 CFR 106.4 and the USCIS premium processing page.',
  directAnswer:
    'Premium processing is counted in business days, not calendar days. Under 8 CFR 106.4, a business day is a day the federal government is open, so weekends, federal holidays and closure days do not count. For an OPT or STEM OPT Form I-765, USCIS must take an action within 30 business days, which is usually about six to seven calendar weeks. For an H-1B Form I-129 the timeframe is 15 business days. The action can be an approval, a denial, a request for evidence (RFE) or a notice of intent to deny (NOID), not only an approval.',
  keyTakeaways: [
    'The regulation defines a business day as a day the federal government is open. Weekends, federally observed holidays and closure days, including regional weather closures, do not count.',
    '30 business days for OPT and STEM OPT I-765s usually means about 42 to 47 calendar days, depending on holidays.',
    'The clock stops when USCIS sends an RFE or NOID. A new full timeframe starts when USCIS receives your response; it does not resume where it stopped.',
    'If USCIS takes no action in time, it refunds the premium fee and keeps processing the case, unless it opens a fraud or misrepresentation investigation.',
    '"Action" means approval, denial, RFE or NOID. A card in the mail is not part of the promise.',
  ],
  sections: [
    {
      heading: 'Business days, as the regulation defines them',
      paragraphs: [
        'The premium processing rule is 8 CFR 106.4. Paragraph (e) lists a timeframe for each form, and every timeframe is written in business days.',
        'The same paragraph defines the term. A business day is a day the federal government is open for business.',
        'It does not include weekends or federally observed holidays. It also excludes days when federal offices are closed for weather or other reasons.',
        'That closure can be nationwide. It can also be limited to the region where your case is decided, so a local closure can add a day you will not see on any calendar.',
      ],
      note: 'Search engines and forums often say "30 days" for OPT premium processing. The regulation and the USCIS page both say 30 business days. Counting calendar days makes the deadline look about two weeks earlier than it is.',
      sources: [src.cfr1064, src.premium],
    },
    {
      heading: 'Timeframes by form for OPT workers',
      paragraphs: [
        'The USCIS premium processing page lists which forms and categories can use Form I-907 and the timeframe for each. The table below covers the forms an F-1 student or OPT worker is most likely to meet.',
        'The fees in the table come from 8 CFR 106.4(c) as amended in January 2026. Check the USCIS fee schedule before you pay, because fees can change.',
      ],
      table: {
        caption: 'Premium processing timeframes and fees for forms OPT workers commonly meet (USCIS page updated March 23, 2026; 8 CFR 106.4).',
        columns: ['Form and category', 'Timeframe', 'Premium fee', 'Who files the I-907'],
        rows: [
          ['I-765 (c)(3)(A) pre-completion OPT', '30 business days', '$1,780', 'The student'],
          ['I-765 (c)(3)(B) post-completion OPT', '30 business days', '$1,780', 'The student'],
          ['I-765 (c)(3)(C) STEM OPT extension', '30 business days', '$1,780', 'The student'],
          ['I-129 H-1B petition', '15 business days', '$2,965', 'The employer or its attorney'],
          ['I-140 E11, E12, E21 (no waiver), E31, E32, EW3', '15 business days', '$2,965', 'The petitioner (an E11 can self-petition) or its attorney'],
          ['I-140 E13 multinational manager, E21 national interest waiver', '45 business days', '$2,965', 'The petitioner or attorney'],
          ['I-539 change of status to F-1, F-2, M-1, M-2, J-1 or J-2', '30 business days', '$2,075', 'The applicant'],
          ['I-539 for H-4 or L-2 dependents filed with an I-129', 'Not available', 'None', 'Decided with the principal I-129 when filed together'],
        ],
      },
      note: 'USCIS says premium processing is not available for an I-539 filed for a dependent of an I-129 worker. When the H-4 or L-2 I-539 is filed together with the I-129, USCIS reviews it right after the principal petition. A beneficiary cannot sign or file Form I-907 for an employer petition.',
      sources: [src.premium, src.cfr1064, src.i907],
    },
    {
      heading: 'When the clock starts',
      paragraphs: [
        'USCIS says the time period begins when it receives a properly completed Form I-907 at the correct filing address. If you upgrade a pending case, that is the date the I-907 arrives, not the date you filed the I-765.',
        'For the 15-business-day forms, the regulation starts the clock when the form and the required fees are received. For Form I-765 and the I-539 student categories, it adds a condition. The clock starts when all prerequisites for adjudication, the form and the fees are received.',
        'USCIS does not publish whether the receipt day counts as day one. The examples on this page treat the first business day after receipt as day one, so read each date as an estimate within a day.',
      ],
      bullets: [
        'Keep the I-907 receipt notice. The date USCIS received the I-907 is your starting point.',
        'Filing on paper: an I-907 sent to the wrong place can be rejected, and the clock does not start until the correct office has it.',
        'Upgrading an OPT I-765: USCIS says to file the I-907 online or with the Chicago Lockbox, and it must match the pending I-765 receipt.',
      ],
      sources: [src.premium, src.cfr1064],
    },
    {
      heading: 'What counts as "action"',
      paragraphs: [
        'Under 8 CFR 106.4(f)(1), USCIS must issue one of four notices within the timeframe: an approval notice, a denial notice, a notice of intent to deny or a request for evidence.',
        'The USCIS page adds a fifth outcome. USCIS may open an investigation for fraud or misrepresentation instead.',
        'The promise covers a decision step, not a card. After an I-765 approval, USCIS says the EAD should be produced within two weeks. It asks you to allow 30 days from approval before you send a card delivery inquiry.',
      ],
      links: [
        { label: 'What an OPT RFE asks for and how to answer it', href: '/blog/opt-rfe-request-for-evidence-i765' },
        { label: 'Premium processing for OPT and STEM OPT: full guide', href: '/blog/premium-processing-opt-stem-opt-2026-complete-guide' },
      ],
      sources: [src.cfr1064, src.premium],
    },
    {
      heading: 'RFE or NOID: the clock stops and starts over',
      paragraphs: [
        'If USCIS sends an RFE or a NOID, the premium timeframe stops. It does not pick up where it left off.',
        'The regulation says a new timeframe begins on the date USCIS receives your response. For an OPT I-765 that is a fresh 30 business days. For an H-1B I-129 it is a fresh 15 business days.',
        'So an RFE on business day 20 does not leave you 10 days. After your response arrives, USCIS has another full period to act.',
        'Respond as early as you can with complete evidence. The new clock starts only when USCIS has your response in hand.',
      ],
      links: [
        { label: 'NOID response guide for OPT applicants', href: '/blog/uscis-noid-response-guide-opt' },
      ],
      sources: [src.cfr1064, src.premium],
    },
    {
      heading: 'Federal holidays that pause the count',
      paragraphs: [
        'These are the federal holidays OPM lists for the rest of 2026 and for 2027. When a holiday falls on a weekend, the observed weekday is the day off, and that observed day is what removes a business day.',
      ],
      table: {
        caption: 'Federal holidays from OPM that fall inside current premium processing windows.',
        columns: ['Holiday', '2026 (observed)', '2027 (observed)'],
        rows: [
          ['New Year’s Day', 'Thu, Jan 1', 'Fri, Jan 1'],
          ['Birthday of Martin Luther King, Jr.', 'Mon, Jan 19', 'Mon, Jan 18'],
          ['Washington’s Birthday', 'Mon, Feb 16', 'Mon, Feb 15'],
          ['Memorial Day', 'Mon, May 25', 'Mon, May 31'],
          ['Juneteenth', 'Fri, Jun 19', 'Fri, Jun 18'],
          ['Independence Day', 'Fri, Jul 3', 'Mon, Jul 5'],
          ['Labor Day', 'Mon, Sep 7', 'Mon, Sep 6'],
          ['Columbus Day', 'Mon, Oct 12', 'Mon, Oct 11'],
          ['Veterans Day', 'Wed, Nov 11', 'Thu, Nov 11'],
          ['Thanksgiving Day', 'Thu, Nov 26', 'Thu, Nov 25'],
          ['Christmas Day', 'Fri, Dec 25', 'Fri, Dec 24'],
        ],
      },
      note: 'Closures also stop the count, and they can be regional or announced late, such as an extra day off around a holiday. The day after Thanksgiving is not a federal holiday on the OPM list, so it counts as a business day unless offices close.',
      sources: [src.holidays, src.cfr1064],
    },
    {
      heading: 'Worked example: converting business days to a date',
      paragraphs: [
        'Fictional example: Arjun files an I-907 to upgrade his post-completion OPT I-765. USCIS receives the I-907 on Thursday, November 19, 2026.',
        'Counting from Friday, November 20 as day one, Thanksgiving on November 26, Christmas on December 25 and New Year’s Day on January 1 all drop out. Day 30 lands on Tuesday, January 5, 2027. That is 47 calendar days after receipt.',
        'Now suppose USCIS sends an RFE on Wednesday, December 16, which is business day 18. The clock stops. Arjun’s response reaches USCIS on Monday, January 11, 2027.',
        'A new 30-business-day period starts. Martin Luther King Jr. Day on January 18 and Washington’s Birthday on February 15 drop out, so day 30 is Wednesday, February 24, 2027.',
        'For comparison, an H-1B I-907 received on Monday, November 2, 2026 has a 15-business-day target. Veterans Day on November 11 drops out, so day 15 is Tuesday, November 24, 2026, 22 calendar days later.',
      ],
      table: {
        caption: 'Fictional example dates, counted with OPM holidays. Treat each date as an estimate within a day.',
        columns: ['Scenario', 'Clock starts (receipt)', 'Business days', 'Estimated last day', 'Calendar days'],
        rows: [
          ['OPT I-765 upgrade', 'Thu, Nov 19, 2026', '30', 'Tue, Jan 5, 2027', '47'],
          ['Same case after an RFE response', 'Mon, Jan 11, 2027', '30 (new period)', 'Wed, Feb 24, 2027', '44'],
          ['H-1B I-129', 'Mon, Nov 2, 2026', '15', 'Tue, Nov 24, 2026', '22'],
        ],
      },
      sources: [src.cfr1064, src.holidays],
    },
    {
      heading: 'If USCIS misses the timeframe',
      paragraphs: [
        'Under 8 CFR 106.4(f)(4), USCIS refunds the premium processing fee if it does not take one of the listed actions in time. It continues to process the case after the refund.',
        'There is one exception in paragraph (f)(5). If USCIS opens an investigation for fraud or misrepresentation, it may keep the fee, skip the timeframe and not notify the filer.',
        'The refund does not speed up the case or approve it. If your count says the period has passed, check the receipt date and any RFE dates first. Then contact USCIS through the channel listed on your I-907 receipt notice or your online account.',
      ],
      note: 'USCIS can also suspend premium processing for a form when it cannot meet the timeframes for a large number of cases. Any suspension is announced on uscis.gov.',
      links: [
        { label: 'Is the $1,780 OPT premium fee worth it?', href: '/blog/opt-premium-processing-fee-increase-1780' },
      ],
      sources: [src.cfr1064, src.premium],
    },
    {
      heading: 'How TrackMyOPT community premium data counts days',
      paragraphs: [
        'The community premium timelines on TrackMyOPT are measured in calendar days. That is how people report their own dates, and it is what you live through while you wait.',
        'In the August 11, 2026 snapshot, the median from premium request to approval was 42 calendar days, with an 80th percentile of 59 days, across 992 usable self-reported cases.',
        'Do not compare those numbers directly with the 30-business-day promise. Thirty business days already spans roughly six calendar weeks, and some reported cases include an RFE pause or imperfect dates.',
      ],
      links: [
        { label: 'OPT premium processing: real case timelines from 2026', href: '/blog/opt-premium-processing-real-case-timelines-2026' },
        { label: 'OPT premium processing timeline, step by step', href: '/blog/opt-premium-processing-timeline-2026' },
      ],
    },
  ],
  checklist: [
    'Write down the date USCIS received your I-907, from the receipt notice or online account.',
    'Count business days, skipping weekends and the OPM federal holidays.',
    'If an RFE or NOID arrives, restart a full new count from the day USCIS receives your response.',
    'Track the receipt so you see the action the day it posts.',
    'Allow about 30 days from approval for the EAD to arrive before you file a card inquiry.',
  ],
  mistakes: [
    'Counting 30 calendar days and expecting a decision two weeks early.',
    'Assuming the clock resumes after an RFE instead of starting over.',
    'Counting from the I-765 filing date when the I-907 was filed later as an upgrade.',
    'Treating an RFE inside the timeframe as a missed deadline.',
    'Expecting the EAD card itself within 30 business days.',
  ],
  faq: [
    {
      question: 'Is premium processing 30 business days or calendar days?',
      answer:
        'Business days. 8 CFR 106.4 sets 30 business days for OPT and STEM OPT I-765s and defines a business day as a day the federal government is open, which excludes weekends, federal holidays and closure days.',
    },
    {
      question: 'How long does OPT premium processing take in calendar days?',
      answer:
        'Thirty business days is usually about 42 to 47 calendar days, depending on holidays. TrackMyOPT community data from August 2026 showed a median of 42 calendar days from premium request to approval.',
    },
    {
      question: 'When does the premium processing clock start?',
      answer:
        'USCIS says it starts when it receives a properly completed Form I-907 at the correct address. For I-765s, the regulation also requires all prerequisites for adjudication to be received.',
    },
    {
      question: 'What happens to the premium clock after an RFE?',
      answer:
        'It stops. A new full timeframe starts on the date USCIS receives your response: 30 business days for an OPT I-765 and 15 for an H-1B I-129.',
    },
    {
      question: 'Do I get a refund if USCIS misses the premium deadline?',
      answer:
        'Generally yes. USCIS refunds the premium fee and keeps processing the case. The exception is when it opens a fraud or misrepresentation investigation.',
    },
    {
      question: 'Does "action" mean approval?',
      answer:
        'No. An approval, a denial, an RFE or a NOID all count as action within the timeframe.',
    },
  ],
  sources: [src.cfr1064, src.premium, src.i907, src.holidays, src.status],
  related: [
    { label: 'Premium processing for OPT and STEM OPT: full guide', href: '/blog/premium-processing-opt-stem-opt-2026-complete-guide' },
    { label: 'OPT premium processing timeline 2026', href: '/blog/opt-premium-processing-timeline-2026' },
    { label: 'OPT premium processing real case timelines', href: '/blog/opt-premium-processing-real-case-timelines-2026' },
    { label: 'Is the $1,780 OPT premium fee worth it?', href: '/blog/opt-premium-processing-fee-increase-1780' },
    { label: 'OPT RFE: request for evidence on Form I-765', href: '/blog/opt-rfe-request-for-evidence-i765' },
  ],
});
