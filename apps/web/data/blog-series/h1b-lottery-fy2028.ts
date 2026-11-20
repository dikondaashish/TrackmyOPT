import { defineArticle } from './shared';
import { PLANNING_GUIDE_DATE, planningSources as src } from './planning-guides-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "fy2028 h1b lottery", "h1b registration 2027 dates", "h1b
// lottery 2027 fee", "h1b lottery chances by wage level".
// USCIS had announced no FY2028 dates on November 20, 2026 (registration page
// reviewed 09/21/2026, cap-season page reviewed 11/09/2026). Update this post
// when USCIS announces; the last three announcements came between January 30
// and February 5.

const SLUG = 'h1b-lottery-2027-fy2028';

export const h1bLotteryFy2028Guide: ResearchArticle = defineArticle({
  slug: SLUG,
  title: 'H-1B Lottery 2027 (FY2028): Dates, Fee and Odds by Wage Level',
  seoTitle: 'H-1B Lottery 2027 (FY2028): Dates, Fee, Odds by Wage Level',
  description:
    'USCIS has not announced FY2028 H-1B registration dates. The last three ran in March. The fee was $215, and a level IV salary gets four entries to one for level I.',
  category: 'H-1B',
  tags: [
    'H-1B lottery 2027',
    'FY2028 H-1B registration dates',
    'H-1B registration fee',
    'H-1B lottery odds by wage level',
    'H-1B weighted selection',
  ],
  readTime: '6 min read',
  publishedDate: PLANNING_GUIDE_DATE,
  modifiedDate: PLANNING_GUIDE_DATE,
  showContents: true,
  cta: 'sponsors',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: H-1B lottery 2027 for FY2028, with a $215 fee and one to four entries by wage level.',
  imageCaption: 'Registration has run in March for the last three years.',
  statusNote:
    'Checked November 20, 2026. USCIS has not announced FY2028 registration dates or the FY2028 registration fee. We will update this page when it does.',
  directAnswer:
    'The H-1B lottery in 2027 is for fiscal year 2028, with jobs starting October 1, 2027. USCIS has not announced the dates. The last three registration periods opened in the first week of March and closed about two weeks later. The fee was $215 per registration last cycle. Selection is weighted by wage level: level IV gets four entries, level III three, level II two and level I one.',
  keyTakeaways: [
    'No FY2028 dates yet. Expect an announcement in late January or early February.',
    'The last registration ran March 4 to 19, 2026, with a $215 fee.',
    'A higher wage level means more entries, from one to four.',
    'DHS projected a 15% chance at level I and 61% at level IV.',
  ],
  sections: [
    {
      heading: 'FY2028 dates: what is known',
      paragraphs: [
        'Nothing is announced. The pattern of the last three years is the best guide.',
      ],
      table: {
        caption: 'H-1B cap registration periods and announcement dates.',
        columns: ['Fiscal year', 'USCIS announced', 'Registration period'],
        rows: [
          ['FY2025', 'January 30, 2024', 'March 6 to 25, 2024'],
          ['FY2026', 'February 5, 2025', 'March 7 to 24, 2025'],
          ['FY2027', 'January 30, 2026', 'March 4 to 19, 2026'],
          ['FY2028', 'Not announced', 'Not announced'],
        ],
      },
      note: 'For FY2027, USCIS finished selection by March 31, 2026 and employers could file from April 1.',
      sources: [src.registration, src.fy2027Dates, src.capSeason],
    },
    {
      heading: 'The registration fee',
      paragraphs: [
        'The fee was $215 per registration for FY2027. The employer pays it. USCIS has not stated the FY2028 fee.',
        'Two larger charges are in the news. Neither is a registration fee, and neither is being collected today.',
      ],
      bullets: [
        'The $100,000 payment: courts have set aside the policies that collect it. Appeals are pending.',
        'The $103,265 petition fee: proposed on August 25, 2026. No final rule as of November 20.',
      ],
      links: [
        { label: 'Does the $100,000 fee apply to F-1 and OPT students?', href: '/blog/h1b-100k-fee-f1-opt-students' },
      ],
      sources: [src.registration, src.h1bPage, src.feeProposal],
    },
    {
      heading: 'Odds by wage level',
      figure: {
        src: `/blog/illustrations/${SLUG}.webp`,
        alt: 'Painted illustration of four glass jars on a wooden table, each holding more paper slips than the one before.',
        caption: 'One to four entries, by wage level. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'Since FY2027, USCIS weights the selection by wage level. Each person still counts once toward the cap, however many entries they have.',
        'The last column is what DHS projected when it wrote the rule. Under the old random selection it estimated 29.59% for everyone.',
      ],
      table: {
        caption: 'Entries per registration and the selection chance DHS projected in the final rule.',
        columns: ['Wage level', 'Entries', 'DHS projected chance'],
        rows: [
          ['Level I', '1', '15.29%'],
          ['Level II', '2', '30.58%'],
          ['Level III', '3', '45.87%'],
          ['Level IV', '4', '61.16%'],
        ],
      },
      note: 'These are projections, not results. USCIS has not published FY2027 selection rates by wage level.',
      links: [
        { label: 'Find your H-1B wage level from your salary and location', href: '/blog/h1b-wage-level-by-zip-code-salary' },
      ],
      sources: [src.capSeason, src.weightedRule],
    },
    {
      heading: 'What happened in the FY2027 lottery',
      paragraphs: [
        'Registrations fell sharply in the first weighted year. USCIS has released only a few figures, reported by the law firm Fragomen.',
      ],
      table: {
        caption: 'Eligible registrations and selections by fiscal year.',
        columns: ['Fiscal year', 'Eligible registrations', 'Selected'],
        rows: [
          ['FY2025', '470,342', '135,137'],
          ['FY2026', '343,981', '120,141'],
          ['FY2027', '211,600', 'Not published'],
        ],
      },
      bullets: [
        '17.7% of selected FY2027 registrations were at level I.',
        '71.5% of those selected held a U.S. advanced degree, up from 57% a year earlier.',
        'USCIS announced on July 17, 2026 that the FY2027 cap was reached.',
      ],
      sources: [src.registration, src.fragomenCap, src.capReached],
    },
    {
      heading: 'How the wage level is chosen',
      paragraphs: [
        'The employer selects the highest wage level that your offered salary equals or exceeds, for your occupation code and work area.',
      ],
      bullets: [
        'Several work locations: the lowest level among them applies.',
        'A salary range: the bottom of the range decides the level.',
        'Several employers register you: USCIS uses the lowest level among them.',
        'The later petition must match the registration. A false attestation can lead to denial or revocation.',
      ],
      sources: [src.registrationFaq, src.registration, src.weightedRule],
    },
    {
      heading: 'What could change before March',
      paragraphs: [
        'Three items are open. Check each one again in January.',
      ],
      bullets: [
        'Wage thresholds. A Labor Department rule that would raise the wage for each level is under White House review, according to Fragomen. If it takes effect first, the same salary can land at a lower level.',
        'The $103,265 petition fee. Still a proposal.',
        'The $100,000 payment. Blocked by courts, with appeals pending.',
      ],
      links: [
        { label: 'Labor Department prevailing wage proposal', href: '/blog/dol-prevailing-wage-hikes-h1b-impact-2026' },
        { label: 'The $100,000 payment and the $103,265 proposal compared', href: '/blog/dhs-proposes-103265-h1b-fee-2026' },
      ],
      sources: [src.fragomenWage, src.wageProposal, src.feeProposal],
    },
    {
      heading: 'What OPT students should do now',
      paragraphs: ['Employers plan cap season in December and January. Start before the announcement.'],
      numbered: [
        'Ask your employer in writing whether it will register you for FY2028.',
        'Check that your passport is valid. The registration uses its number.',
        'Find your occupation code and wage level, and ask what salary the registration will state.',
        'Check your OPT or STEM OPT end date against October 1, 2027, and learn how cap-gap works.',
        'Plan a backup: STEM OPT gives more tries, and cap-exempt employers skip the lottery.',
      ],
      links: [
        { label: 'H-1B cap-gap extension', href: '/blog/h1b-cap-gap-extension' },
        { label: 'OPT to H-1B transition', href: '/blog/opt-to-h1b-transition' },
        { label: 'Find cap-exempt H-1B employers', href: '/blog/find-cap-exempt-h1b-employers' },
      ],
      sources: [src.registration, src.capSeason],
    },
  ],
  checklist: [
    'Confirm your employer will register you.',
    'Renew your passport if it expires soon.',
    'Look up your wage level for your work area.',
    'Check your OPT end date and cap-gap.',
    'Watch for the USCIS announcement in late January.',
    'Recheck the fee and wage rules before registration opens.',
  ],
  mistakes: [
    'Waiting for the announcement before talking to your employer.',
    'Reading the DHS projections as last year\'s results.',
    'Assuming level I cannot be selected.',
    'Letting two employers register you at different wage levels without knowing the lowest one counts.',
  ],
  faq: [
    {
      question: 'When is the H-1B lottery in 2027?',
      answer:
        'USCIS has not announced the dates. The last three registration periods opened between March 4 and March 7 and closed between March 19 and March 25.',
    },
    {
      question: 'What is the H-1B registration fee for FY2028?',
      answer:
        'USCIS has not stated it. The fee was $215 per registration for FY2027, paid by the employer.',
    },
    {
      question: 'What are the H-1B lottery odds by wage level?',
      answer:
        'USCIS has not published results by level. DHS projected 15.29% at level I, 30.58% at level II, 45.87% at level III and 61.16% at level IV.',
    },
    {
      question: 'Can a level I registration still be selected?',
      answer:
        'Yes. Every level is in the same pool. Level I has one entry. In FY2027, 17.7% of selected registrations were at level I.',
    },
    {
      question: 'Does a master\'s degree still help?',
      answer:
        'Yes. The 20,000 advanced-degree exemption remains, on top of the 65,000 regular cap.',
    },
    {
      question: 'Was there a second lottery for FY2027?',
      answer:
        'No. USCIS announced on July 17, 2026 that the FY2027 cap was reached.',
    },
  ],
  sources: [
    src.registration,
    src.capSeason,
    src.registrationFaq,
    src.weightedRule,
    src.fy2027Dates,
    src.capReached,
    src.fragomenCap,
    src.fragomenWage,
    src.feeProposal,
  ],
  related: [
    { label: 'Find your H-1B wage level from your salary and location', href: '/blog/h1b-wage-level-by-zip-code-salary' },
    { label: 'Does the $100,000 fee apply to F-1 and OPT students?', href: '/blog/h1b-100k-fee-f1-opt-students' },
    { label: 'H-1B cap-gap extension', href: '/blog/h1b-cap-gap-extension' },
    { label: 'Top H-1B sponsor companies', href: '/blog/top-h1b-sponsor-companies-2026' },
  ],
});
