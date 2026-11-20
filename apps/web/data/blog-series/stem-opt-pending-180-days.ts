import { defineArticle } from './shared';
import {
  STATUS_GUIDE_DATE,
  TRACKER_DATA_NOTE,
  statusSources as src,
} from './card-status-shared';
import type { ResearchArticle } from './types';

// Autocomplete: "stem opt pending 180 days", "stem opt pending after 180
// days", "stem opt pending can i work", "driver's license", "laid off". The
// existing 180-day explainer covers the rule; this post covers the worry.

const SLUG = 'stem-opt-pending-after-180-days';

export const stemOptPending180Guide: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'STEM OPT Pending Past 180 Days: Can You Work, Travel or Renew a License?',
  seoTitle: 'STEM OPT Pending After 180 Days: Work, Travel, License',
  description:
    'The 180 days run from the day your OPT EAD expires, not from the day you filed. What happens when a STEM OPT extension is still pending at day 180, and how to avoid getting there.',
  category: 'STEM OPT',
  tags: [
    'STEM OPT pending 180 days',
    'STEM OPT pending after 180 days',
    'STEM OPT pending can I work',
    'STEM OPT 180 day extension',
    'STEM OPT processing time',
  ],
  readTime: '6 min read',
  publishedDate: STATUS_GUIDE_DATE,
  modifiedDate: STATUS_GUIDE_DATE,
  showContents: true,
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: the STEM OPT 180 days count from the OPT EAD expiry date, not the filing date.',
  imageCaption:
    'The 180-day bridge starts when the OPT EAD expires.',
  dataNote: TRACKER_DATA_NOTE,
  directAnswer:
    'If your STEM OPT extension was filed on time, you may keep working for up to 180 days after your OPT EAD expires while the Form I-765 is pending. The 180 days count from the EAD expiry date, not from the filing date. If USCIS has not decided by day 180, your work authorization stops that day and you must stop working until the approval. Premium processing is the way to avoid that.',
  keyTakeaways: [
    'The 180 days start on the day your OPT EAD expires.',
    'At day 180 with no decision, you must stop working.',
    '32 of 61 tracked STEM approvals took more than 180 days from filing.',
    'File as early as allowed, and add premium processing before the bridge runs short.',
  ],
  sections: [
    {
      heading: 'Which 180 days count',
      paragraphs: [
        'The regulation extends work authorization from the expiry date of the OPT EAD until USCIS decides the STEM application, but for no more than 180 days. For that period the expired EAD counts as unexpired when shown with the I-20 your DSO endorsed for STEM OPT.',
        'So a case that has been pending 180 days is not the same as a bridge that has run out. Your cover after filing is the days you filed before expiry, plus 180.',
      ],
      table: {
        caption: 'How long you can keep working after filing, by when you filed.',
        columns: ['Filed before the OPT EAD expired', 'Bridge ends', 'Days of cover after filing'],
        rows: [
          ['90 days before', '180 days after expiry', '270 days'],
          ['60 days before', '180 days after expiry', '240 days'],
          ['30 days before', '180 days after expiry', '210 days'],
          ['1 day before', '180 days after expiry', '181 days'],
        ],
      },
      links: [
        { label: 'STEM OPT 180-day extension explained', href: '/blog/stem-opt-180-day-auto-extension-explained-2026' },
      ],
      sources: [src.stemBridge],
    },
    {
      heading: 'How often cases run long: tracked cases',
      paragraphs: [
        'The sample is small, but the pattern is clear. Regular processing often takes about six months.',
      ],
      table: {
        caption: 'Receipt to approval in tracked STEM OPT extension cases, read on November 20, 2026.',
        columns: ['Cases', 'Count', 'Median', 'Middle half', 'Over 180 days'],
        rows: [
          ['Regular processing', '19', '187 days', '184 to 203 days', '15 of 19'],
          ['Used premium at some point', '42', '168 days', '132 to 203 days', '17 of 42'],
        ],
      },
      note: 'The longest tracked case took 226 days from filing. Someone who filed 90 days early still had cover on that day. Someone who filed two weeks early did not.',
      links: [
        { label: 'STEM OPT processing time 2026', href: '/blog/stem-opt-processing-time-2026' },
      ],
      sources: [src.times],
    },
    {
      heading: 'At day 180 with no decision',
      paragraphs: [
        'Your work authorization ends on day 180. Stop working that day, tell your employer in writing, and tell your DSO.',
        'Stopping work does not by itself end your F-1 status while the timely filed application is still pending. Ask your DSO how the gap is recorded in SEVIS and whether it counts toward unemployment days.',
        'You may start again only when USCIS approves the extension.',
      ],
      table: {
        caption: 'What you can do while the STEM extension is pending.',
        columns: ['Question', 'Day 1 to 180', 'After day 180'],
        rows: [
          ['Work for your STEM employer', 'Yes', 'No, until approval'],
          ['Form I-9', 'Expired EAD plus the STEM-endorsed I-20', 'Employer must wait for the new EAD'],
          ['Travel abroad', 'Risky', 'Do not travel'],
          ['Renew a driver\'s license', 'Depends on the state', 'Depends on the state'],
        ],
      },
      sources: [src.stemBridge, src.i9Students],
    },
    {
      heading: 'Form I-9, travel and your driver\'s license',
      paragraphs: [
        'Form I-9: the USCIS employer handbook lets an employer accept the expired EAD together with the I-20 endorsed for the STEM extension, and record the card expiry date plus 180 days.',
        'Travel: Berkeley\'s international office warns that if the extension is denied while you are abroad after your OPT EAD end date, you cannot reenter. With an expired F-1 visa you also cannot get a new visa until the EAD is approved and in hand.',
        'Driver\'s license: each state decides. Bring the expired EAD, the I-797C receipt notice and the STEM I-20, and ask the office what it accepts before you go.',
      ],
      links: [
        { label: 'Travel while OPT or STEM OPT is pending', href: '/blog/travel-while-opt-pending' },
        { label: 'Driver\'s license on OPT: state requirements', href: '/blog/drivers-license-opt-state-requirements' },
        { label: 'Changing employer while STEM OPT is pending', href: '/blog/change-employer-stem-opt-pending' },
      ],
      sources: [src.i9Students, src.berkeleyTravel],
    },
    {
      heading: 'How to avoid reaching day 180',
      figure: {
        src: '/blog/illustrations/stem-opt-pending-after-180-days.webp',
        alt: 'Painted illustration of a wall calendar of blank squares with one square outlined, above a desk with a closed laptop and a mug.',
        caption: 'Mark day 180, counted from the day your OPT EAD expires. Illustration generated with AI.',
        width: 1200,
        height: 675,
      },
      paragraphs: [
        'Two choices decide this: when you file, and whether you pay for premium processing.',
      ],
      numbered: [
        'File as early as the rules allow, up to 90 days before your OPT EAD expires.',
        'Mark day 180 on a calendar, counted from the EAD expiry date.',
        'Add premium processing to the pending case if the bridge is running short. It costs $1,780 and gives USCIS 30 business days, about six weeks.',
        'To finish before day 180, USCIS should have the premium request by about day 135 of the bridge. A request for evidence restarts the 30 business days.',
        'Answer any request for evidence fast.',
      ],
      links: [
        { label: 'OPT premium processing timeline 2026', href: '/blog/opt-premium-processing-timeline-2026' },
        { label: 'OPT expedite request: what works instead', href: '/blog/opt-expedite-request-i765' },
      ],
      sources: [src.premium, src.stemBridge],
    },
  ],
  checklist: [
    'Write down your OPT EAD expiry date and day 180 after it.',
    'Give your employer the expired EAD and the STEM I-20 for Form I-9.',
    'Decide on premium processing by about day 135.',
    'Avoid travel after the OPT EAD expires.',
    'Tell your DSO and employer before day 180 if no decision has come.',
  ],
  mistakes: [
    'Counting the 180 days from the filing date.',
    'Working on day 181 because the case is "still pending".',
    'Filing a few days before the OPT EAD expires and skipping premium processing.',
    'Travelling abroad after the OPT EAD has expired.',
  ],
  faq: [
    {
      question: 'Can I work if my STEM OPT is pending after 180 days?',
      answer:
        'Only if day 180 after your OPT EAD expiry has not passed. After that day you must stop working until USCIS approves the extension.',
    },
    {
      question: 'Do the 180 days start when I file?',
      answer:
        'No. They start on the day your OPT EAD expires. If you filed 60 days early, you have 240 days of cover after filing.',
    },
    {
      question: 'Do I lose F-1 status at day 180?',
      answer:
        'Not by that alone. The timely filed application is still pending. You lose work authorization, so stop working and speak with your DSO.',
    },
    {
      question: 'What does my employer need for Form I-9?',
      answer:
        'The expired OPT EAD and the I-20 endorsed for the STEM extension. The handbook for employers records it as the card expiry date plus 180 days.',
    },
    {
      question: 'Can I add premium processing to a pending STEM OPT case?',
      answer:
        'Yes. File Form I-907 for the pending I-765. The fee is $1,780 and USCIS has 30 business days to act.',
    },
    {
      question: 'Can I travel while my STEM OPT is pending?',
      answer:
        'It is risky, and schools advise against it once the OPT EAD has expired. A denial while you are abroad would leave you unable to return.',
    },
  ],
  sources: [src.stemBridge, src.i9Students, src.premium, src.times, src.berkeleyTravel],
  related: [
    { label: 'STEM OPT 180-day extension explained', href: '/blog/stem-opt-180-day-auto-extension-explained-2026' },
    { label: 'STEM OPT processing time 2026', href: '/blog/stem-opt-processing-time-2026' },
    { label: 'Travel while OPT or STEM OPT is pending', href: '/blog/travel-while-opt-pending' },
    { label: 'STEM OPT extension guide', href: '/blog/stem-opt-extension-guide' },
  ],
});
