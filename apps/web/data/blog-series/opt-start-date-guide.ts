import { defineArticle } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// "opt start date" (147 impressions), "ead start date" (91), "when does opt
// clock start" (33) and "opt 14 month rule" (31) had no single guide on
// choosing the requested start date. Rules checked on 2026-11-09 against the
// USCIS Form I-765 and OPT pages, 8 CFR 214.2(f) as in force before the
// postponed DHS "fixed time period of admission" rule (eCFR version of
// 2026-08-11), the Study in the States OPT and unemployment-counter pages,
// and the USCIS premium processing page. The current eCFR text shows the
// postponed 30-day limits; USCIS says it is applying the previous rules, so
// the 60-day limits are used here. No processing-time numbers are stated.

const src = {
  i765: {
    label: 'Form I-765, Application for Employment Authorization',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-765',
  },
  uscisOpt: {
    label: 'Optional Practical Training (OPT) for F-1 Students',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students',
  },
  cfr2142: {
    label: '8 CFR 214.2(f)(10) and (f)(11): practical training and the OPT application process',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/section-214.2',
  },
  sitsOpt: {
    label: 'F-1 Optional Practical Training (OPT)',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/f-1-optional-practical-training-opt',
  },
  counter: {
    label: 'Unemployment Counter',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-employment/unemployment-counter',
  },
  sitsTravel: {
    label: 'Traveling as an F or M Student',
    publisher: 'Study in the States (DHS)',
    url: 'https://studyinthestates.dhs.gov/students/study/traveling-as-an-f-or-m-student',
  },
  premium: {
    label: 'How Do I Request Premium Processing?',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing',
  },
} satisfies Record<string, ArticleSource>;

const SLUG = 'choosing-opt-start-date';

export const optStartDateGuide: ResearchArticle = defineArticle({
  slug: SLUG,
  hub: 'opt-rules',
  title:
    'Choosing Your OPT Start Date: Filing Window, the 14-Month Rule and When the Clock Starts',
  seoTitle: 'OPT Start Date: How to Choose It and When the Clock Starts',
  description:
    'How to pick the start date on your post-completion OPT I-765: the filing window, the 60-day start date limit, the 14-month rule, what happens if approval comes late, and when unemployment days begin.',
  category: 'OPT Rules',
  tags: [
    'OPT start date',
    'EAD start date',
    'OPT 14 month rule',
    'when does OPT start',
    'OPT unemployment clock',
    'OPT filing window',
  ],
  readTime: '9 min read',
  publishedDate: '2026-11-02',
  modifiedDate: '2026-11-09',
  showContents: true,
  cta: 'opt-timeline',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: choosing a post-completion OPT start date, with the 60-day start limit, the 14-month rule and the 90-day unemployment limit.',
  imageCaption:
    'Your OPT begins on the later of the date you request or the date USCIS approves. Generated from the rules described in this guide.',
  directAnswer:
    'For post-completion OPT, you request a start date between your program end date and 60 days after it. Authorization begins on that date or on the approval date, whichever is later. All 12 months must generally fit within 14 months after your program ends, so a late approval can shorten your OPT. Unemployment days begin counting from the OPT start date, not from graduation.',
  keyTakeaways: [
    'File Form I-765 up to 90 days before and no later than 60 days after your program end date, and within 30 days of your DSO’s recommendation.',
    'The requested start date must be on or after your program end date and no more than 60 days after it.',
    'OPT begins on the requested date or the approval date, whichever is later. You cannot work before the start date on your EAD.',
    'All post-completion OPT must be completed within 14 months after your studies end. A late approval can cut days from the end.',
    'SEVIS counts unemployment from the OPT start date. Days before that date, including while the case is pending, are not unemployment days.',
  ],
  sections: [
    {
      heading: 'The rules USCIS is applying now',
      paragraphs: [
        'DHS published a final rule on a "fixed time period of admission" for F-1 students in July 2026. On September 14, 2026, a federal court postponed its effective date. USCIS says it will proceed under the previous regulatory provisions until further order of the court.',
        'This guide uses those previous rules. They include the 60-day limits after the program end date. The current eCFR text already shows the postponed rule with shorter 30-day limits. Do not rely on those numbers while the postponement is in place. Check the USCIS Form I-765 page and your DSO before you file.',
      ],
      sources: [src.i765, src.cfr2142],
    },
    {
      heading: 'The post-completion OPT filing window',
      paragraphs: [
        'Two deadlines apply at the same time. You may file Form I-765 up to 90 days before your program end date and no later than 60 days after it. You must also file within 30 days of the date your DSO enters the OPT recommendation in SEVIS.',
        'The 30-day deadline is strict. Study in the States says applications USCIS receives after day 30 will be denied. Plan the DSO recommendation and your filing date together so both deadlines are met.',
        'Filing early does not let you start early. It only gives USCIS more time to decide before the start date you request.',
      ],
      links: [
        { label: 'OPT application helper', href: '/tools/opt-apply' },
        { label: 'Spring graduates: when to file for OPT', href: '/blog/spring-graduates-opt-application-timing-2026' },
      ],
      sources: [src.i765, src.uscisOpt, src.sitsOpt, src.cfr2142],
    },
    {
      heading: 'What start dates you can request',
      paragraphs: [
        'For post-completion OPT, the start date must be on or after your program end date. It cannot be more than 60 days after your program end date. Your DSO notes the recommended start and end dates in SEVIS and gives you a signed I-20 showing the recommendation.',
        'You can generally receive up to 12 months of OPT at each degree level. The regulation requires all practical training to be completed within 14 months after your studies end. The 24-month STEM OPT extension is not counted in that 14-month window.',
      ],
      sources: [src.sitsOpt, src.cfr2142],
    },
    {
      heading: 'How processing time changes your real start date',
      paragraphs: [
        'Under 8 CFR 214.2(f)(11)(iii)(A), post-completion OPT begins on the requested start date or the approval date, whichever is later. It ends at the end of your remaining OPT eligibility.',
        'If USCIS approves before your requested date, your OPT starts on the requested date. If USCIS approves after it, your OPT starts on the approval date instead. You cannot work in between, because you may not begin OPT until USCIS approves the I-765 and you receive the EAD.',
        'A late approval can also cost time at the end. Your OPT must still finish within 14 months after your program end date. When the approval comes late enough, the EAD period can be shorter than 12 months.',
      ],
      links: [
        {
          label: 'How the 14-month rule can shorten OPT after a delay',
          href: '/blog/opt-14-month-rule-delays-shorten-authorization-2026',
        },
        { label: 'OPT processing time 2026, updated monthly', href: '/blog/opt-processing-time-2026' },
        { label: 'Estimate your OPT decision window', href: '/tools/opt-decision-window' },
      ],
      sources: [src.cfr2142, src.uscisOpt],
    },
    {
      heading: 'When the unemployment clock starts',
      paragraphs: [
        'Post-completion OPT allows 90 days of unemployment in total. A STEM OPT extension raises the total to 150 days, including days already used.',
        'SEVIS counts from the actual OPT start date for each OPT period. It counts each day without employer information as a day of unemployment. Days between graduation and your OPT start date are not counted, including time while the case is pending.',
        'This is why the start date matters when you do not have a job yet. A later start date gives you more search time before the count begins. It also means you cannot work before that date, even if USCIS approves early.',
      ],
      links: [
        { label: 'When does the OPT unemployment clock start?', href: '/blog/when-does-opt-unemployment-clock-start' },
      ],
      sources: [src.counter, src.sitsOpt, src.cfr2142],
    },
    {
      heading: 'How to pick your date',
      paragraphs: [
        'There is no single best date. Weigh four things: your job offer, how long USCIS is taking, whether you will use premium processing, and any travel you plan.',
      ],
      bullets: [
        'You have an offer: request the employer’s planned start date if it is within 60 days of your program end date. Leave enough time for USCIS to decide before then.',
        'You have no offer yet: a later start date, still within 60 days, delays the unemployment count while you search.',
        'You want to start soon after graduation: file early in the 90-day window, so approval is more likely to come before your requested date.',
        'You are short on time: premium processing for OPT I-765 categories has a 30-business-day timeframe. You can request it with Form I-907 after filing.',
        'You plan to travel: talk to your DSO first. Study in the States does not recommend leaving the United States while a practical training application is pending.',
      ],
      links: [
        {
          label: 'Premium processing for OPT and STEM OPT: complete guide',
          href: '/blog/premium-processing-opt-stem-opt-2026-complete-guide',
        },
      ],
      sources: [src.premium, src.sitsOpt, src.counter, src.sitsTravel],
    },
    {
      heading: 'Scenarios at a glance',
      paragraphs: [
        'The table uses a program end date of May 15 to show how each rule plays out. Your own dates come from your I-20 and SEVIS record.',
      ],
      table: {
        caption:
          'Post-completion OPT start date scenarios for a program end date of May 15, under the rules USCIS is applying now.',
        columns: ['Scenario', 'What happens', 'Rule'],
        rows: [
          [
            'You request June 1 and USCIS approves on May 20',
            'OPT starts June 1. Unemployment counting starts June 1 if you have no reported employer.',
            'Later of requested date or approval date',
          ],
          [
            'You request June 1 and USCIS approves on June 20',
            'OPT starts June 20. You cannot work before June 20.',
            'Later of requested date or approval date',
          ],
          [
            'You request June 1 and approval comes in late August',
            'OPT starts on the approval date. It must still end within 14 months of May 15, so you may get less than 12 months.',
            '14-month rule',
          ],
          [
            'You want to request a start date of August 1',
            'Not allowed. August 1 is more than 60 days after May 15.',
            'Start date limit of 60 days',
          ],
          [
            'Your DSO recommends OPT on April 1 and you file on May 5',
            'Too late. The filing is more than 30 days after the recommendation, and USCIS will deny it.',
            '30 days from DSO recommendation',
          ],
          [
            'You file on February 20',
            'Allowed. February 20 is within 90 days before May 15, if it is also within 30 days of the recommendation.',
            '90-day early filing window',
          ],
        ],
      },
      sources: [src.cfr2142, src.sitsOpt, src.i765],
    },
    {
      heading: 'Example: Arjun matches his start date to his offer',
      paragraphs: [
        'Fictional example: Arjun’s program ends on May 15. His employer wants him to start on July 1, which is 47 days after his program end date.',
        'His DSO recommends OPT on February 20 with a requested start date of July 1. Arjun files his I-765 on March 2, well within both deadlines. He watches the processing times through April.',
        'In May his case is still pending, so he adds premium processing with Form I-907. USCIS approves in mid-June. His OPT starts on July 1, the later date, and so does his first day of work.',
      ],
    },
  ],
  checklist: [
    'Find your program end date on your I-20 and in SEVIS.',
    'Pick a start date between your program end date and 60 days after it.',
    'File within 30 days of the DSO recommendation and within the 90-day early window.',
    'Compare the current processing time with the gap before your start date.',
    'Do not start work until the start date on your EAD.',
  ],
  mistakes: [
    'Using the 30-day limits shown in the current eCFR text while the rule is postponed.',
    'Filing more than 30 days after the DSO recommendation.',
    'Assuming OPT starts on the requested date even when approval comes later.',
    'Starting work on the offer date before the EAD start date.',
    'Forgetting that the 14-month limit can shorten OPT after a late approval.',
  ],
  faq: [
    {
      question: 'When does OPT start?',
      answer:
        'Post-completion OPT begins on the start date you requested or the date USCIS approves your I-765, whichever is later. You may not work before the start date on your EAD.',
    },
    {
      question: 'How far after graduation can my OPT start date be?',
      answer:
        'Under the rules USCIS is currently applying, the requested start date can be no more than 60 days after your program end date. It must be on or after the program end date.',
    },
    {
      question: 'What is the OPT 14-month rule?',
      answer:
        'All post-completion OPT must be completed within 14 months after your studies end. If USCIS approves late, your OPT still has to end inside that window, so you may get less than 12 months.',
    },
    {
      question: 'When does the OPT unemployment clock start?',
      answer:
        'SEVIS counts unemployment from the actual OPT start date. Each day without employer information in SEVIS counts. Days before the OPT start date do not count.',
    },
    {
      question: 'Is the EAD start date the same as my requested start date?',
      answer:
        'Only if USCIS approves before your requested date. If approval comes later, the EAD start date is generally the approval date.',
    },
    {
      question: 'Can premium processing protect my start date?',
      answer:
        'It can help. USCIS lists a 30-business-day timeframe for OPT I-765 premium processing. It does not change the rule itself: OPT still begins on the later of your requested date or the approval date.',
    },
  ],
  sources: [src.i765, src.uscisOpt, src.cfr2142, src.sitsOpt, src.counter, src.premium],
  related: [
    {
      label: 'How the 14-month rule can shorten OPT after a delay',
      href: '/blog/opt-14-month-rule-delays-shorten-authorization-2026',
    },
    { label: 'When does the OPT unemployment clock start?', href: '/blog/when-does-opt-unemployment-clock-start' },
    { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
    { label: 'OPT decision window estimate', href: '/tools/opt-decision-window' },
  ],
  statusNote:
    'TrackMyOPT is a case tracker, not legal advice. Your I-20, SEVIS record, USCIS notices and EAD are the official record. Ask your DSO before you choose dates.',
});
