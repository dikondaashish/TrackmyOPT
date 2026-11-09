import { defineArticle, source } from './shared';
import type { ArticleSource, ResearchArticle } from './types';

// Monthly data post built from TrackMyOPT's own community timeline feed.
// Targets "opt timeline reddit 2026", "opt megathread", "stem opt megathread"
// and "opt processing time 2026 reddit" (about 1,700 impressions a quarter at
// positions 6 to 9). Numbers come from the public decision-window endpoint on
// the snapshot date; see dataNote for the exact method.

const SLUG = 'opt-stem-opt-timelines-reported-november-2026';

const methodology: ArticleSource = {
  label: 'TrackMyOPT community timeline methodology',
  publisher: 'TrackMyOPT',
  url: 'https://www.trackmyopt.com/features/community',
};

const decisionWindow: ArticleSource = {
  label: 'OPT decision window tool (public estimate)',
  publisher: 'TrackMyOPT',
  url: 'https://www.trackmyopt.com/tools/opt-decision-window',
};

const processingTimes: ArticleSource = {
  label: 'Check Case Processing Times',
  publisher: 'USCIS',
  url: 'https://egov.uscis.gov/processing-times/',
};

export const communityTimelinesNovember2026: ResearchArticle = defineArticle({
  slug: SLUG,
  title:
    'OPT and STEM OPT Timelines Reported by the Community: November 2026 Snapshot (Instead of the Reddit Megathread)',
  seoTitle: 'OPT Timelines Reported by Users: November 2026 Snapshot',
  description:
    'What 2,131 completed, non-premium OPT and STEM OPT cases in the TrackMyOPT community feed show on November 8, 2026: median 125 days for initial OPT and 183 days for STEM, how that compares with August, and how to read it next to your own receipt.',
  category: 'TrackMyOPT Data',
  tags: [
    'OPT timeline 2026',
    'OPT megathread',
    'STEM OPT timeline',
    'OPT processing time reddit',
    'community timelines',
  ],
  readTime: '8 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  hub: 'processing-times',
  cta: 'case-status',
  image: `/blog/${SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: November 2026 community timeline snapshot with the initial OPT and STEM OPT medians.',
  imageCaption:
    'Cover generated from the November 8, 2026 snapshot figures in this article. Community data, not USCIS data.',
  badgeLabel: 'Monthly data snapshot',
  reviewLabel: 'Figures read from the public decision-window estimate on November 8, 2026',
  directAnswer:
    'On November 8, 2026 the TrackMyOPT community feed held 1,546 completed, non-premium initial OPT cases with a median of 125 calendar days from receipt to approval (middle half: 90 to 143 days), and 585 completed, non-premium STEM OPT extension cases with a median of 183 days (middle half: 124 to 186 days). These are self-reported timelines gathered from partner trackers and Reddit-style threads, pooled across receipt months. They are planning context, not USCIS processing times, and they say nothing about any individual pending case.',
  keyTakeaways: [
    'Initial OPT: median 125 days, interquartile range 90 to 143 days, 1,546 completed non-premium cases.',
    'STEM OPT extension: median 183 days, interquartile range 124 to 186 days, 585 completed non-premium cases.',
    'The August snapshot grouped by receipt month showed 72 to 96 day medians for February and March receipts. The pooled November figure is longer because it includes slower cohorts that had not finished in August. Compare like with like.',
    'A megathread tells you what happened to the people who posted. A pooled median tells you the same thing with more people. Neither is a queue position.',
  ],
  sections: [
    {
      heading: 'The November 8 snapshot',
      paragraphs: [
        'TrackMyOPT ingests anonymised timelines every day from partner trackers and public threads, keeps the dates and the case type, and drops names and receipt numbers. The public decision-window tool reads that table and reports the completed-case median and middle half for the case type you choose. The figures below are what the tool reported on November 8, 2026 for non-premium cases.',
      ],
      table: {
        caption: 'Completed, non-premium community cases on November 8, 2026. Days are calendar days from receipt to approval.',
        columns: ['Case type', 'Completed cases', 'Median days', '25th percentile', '75th percentile'],
        rows: [
          ['Initial (post-completion) OPT', '1,546', '125', '90', '143'],
          ['STEM OPT extension', '585', '183', '124', '186'],
        ],
      },
      note: 'The middle half is the useful number. Half of completed initial OPT cases finished between day 90 and day 143. If you are on day 100, you are inside the range where most decisions arrive, and nothing about the median tells you which side of it you will land on.',
      sources: [methodology, decisionWindow],
    },
    {
      heading: 'How this compares with the August snapshot',
      paragraphs: [
        'The August 11 data post grouped completed initial OPT cases by receipt month: 74 days for February receipts and 96 days for March receipts. Those were early-finishing cohorts measured while many of their slower cases were still pending, which is the right-censoring problem that post warned about. The November figure pools every completed case regardless of receipt month, so it includes the slow tail that August could not yet see.',
        'The honest reading is that the spring 2026 cohorts matured into longer waits than their first-finishers suggested, and that the summer cohorts are running at or above the pooled median. It is not evidence of a sudden slowdown in November; it is the same queue seen with more of its cases finished.',
      ],
      table: {
        caption: 'Initial OPT, non-premium: the August receipt-month medians against the November pooled figure.',
        columns: ['Snapshot', 'Cohort', 'Completed cases', 'Median days'],
        rows: [
          ['August 11, 2026', 'February 2026 receipts', '123', '74'],
          ['August 11, 2026', 'March 2026 receipts', '248', '96'],
          ['November 8, 2026', 'All receipt months, pooled', '1,546', '125'],
        ],
      },
      links: [
        {
          label: 'August 2026 snapshot by receipt month',
          href: '/blog/monthly-opt-ead-processing-times-receipt-date',
        },
      ],
      sources: [methodology],
    },
    {
      heading: 'Why a pooled median is not a receipt-month median',
      paragraphs: [
        'A receipt-month median answers "how long did cases filed in March take". A pooled median answers "how long did every finished case take, whenever it was filed". The second number drifts upward as slow cases from older months finish and drifts downward when a fast month’s approvals arrive in bulk. It is a stable planning figure but a poor trend line.',
        'The decision-window tool narrows the pool when it can: if enough cases share your service center and premium status it uses that subset, and it tells you which match level it used. On November 8 the public estimate matched on premium status only, so the figures above are the broad cohort.',
      ],
      bullets: [
        'Use the pooled median to set expectations and travel buffers.',
        'Use the receipt-month breakdown, when a cohort has enough finished cases, to see whether the queue is speeding up or slowing down.',
        'Use USCIS processing times and the e-Request rules to decide when you may ask USCIS about a late case.',
      ],
      links: [
        { label: 'OPT processing time in 2026, updated monthly', href: '/blog/opt-processing-time-2026' },
        { label: 'STEM OPT processing time in 2026', href: '/blog/stem-opt-processing-time-2026' },
      ],
      sources: [processingTimes, decisionWindow],
    },
    {
      heading: 'Reading a megathread without fooling yourself',
      paragraphs: [
        'Reddit megathreads and partner trackers are where most of this data starts, and they are useful. They are also biased in predictable ways. People post when something happens, so approvals and RFEs are over-represented relative to quiet waiting. Premium-processed cases post more because they finish sooner. Students at large schools with active forums post more than everyone else. A thread sorted by newest shows the fastest recent decisions first, which is exactly the right-censoring effect the August post described.',
        'The TrackMyOPT feed does not remove those biases; it pools enough cases that the median is less sensitive to any one of them, and it labels the cohort size so you can judge the weight of the number. When you read a thread, note the case type, premium status, receipt date and approval date for each post, and ignore posts missing any of the four.',
      ],
      numbered: [
        'Case type: initial OPT and STEM OPT have different queues.',
        'Premium or not: premium cases are a separate clock.',
        'Receipt date, not mailing date or biometrics date.',
        'Approval date, not card-received date.',
      ],
    },
    {
      heading: 'What to do with your own case',
      paragraphs: [
        'Record your receipt date, case type and service center, then compare against the matching cohort rather than the headline median. If your case is past the 75th percentile for its cohort, check the USCIS processing-times tool for your form and category; a case outside the posted time qualifies for an "outside normal processing time" inquiry through e-Request. Inside the posted time, the practical steps are to keep the address current, watch for a biometrics or RFE notice, and avoid a job start date that assumes a decision by a particular day.',
        'TrackMyOPT stores your receipt, shows the community range next to the official USCIS status, and emails you when the status changes. Add the receipt once and let the tracker do the refreshing.',
      ],
      links: [
        { label: 'When will USCIS decide my OPT? The decision window', href: '/blog/when-will-uscis-decide-my-opt-decision-window' },
        { label: 'OPT EAD pending: delays in 2026', href: '/blog/opt-ead-pending-processing-delays-2026' },
        { label: 'EAD card status: every message explained', href: '/blog/ead-card-status-check' },
      ],
      sources: [processingTimes, source.opt],
    },
    {
      heading: 'How this series will continue',
      paragraphs: [
        'This snapshot is pooled because the public estimate reports the pooled cohort. The next monthly post will add a receipt-month breakdown for cohorts with at least 15 completed cases, the same threshold the decision-window tool uses before it will show a figure, and a premium-processing line. Each post will state its snapshot date and cohort sizes so the series can be read as a sequence rather than a single number.',
      ],
    },
  ],
  checklist: [
    'Compare your case with the same case type and premium status.',
    'Note the cohort size next to any median you use.',
    'Treat the middle half, not the median, as the planning range.',
    'Keep USCIS status as the official record.',
  ],
  mistakes: [
    'Reading a pooled median as a receipt-month trend.',
    'Comparing a premium case with a non-premium median.',
    'Treating day 125 as a deadline USCIS owes you.',
    'Using a thread sorted by newest to judge current speed.',
  ],
  faq: [
    {
      question: 'How long is OPT taking right now according to users?',
      answer:
        'On November 8, 2026 the TrackMyOPT community feed showed a median of 125 calendar days from receipt to approval for completed, non-premium initial OPT cases (1,546 cases), with the middle half between 90 and 143 days.',
    },
    {
      question: 'How long is STEM OPT taking according to users?',
      answer:
        'A median of 183 days for completed, non-premium STEM OPT extension cases (585 cases), with the middle half between 124 and 186 days, on the same snapshot date.',
    },
    {
      question: 'Are these USCIS processing times?',
      answer:
        'No. They are anonymised self-reported timelines from partner trackers and public threads, pooled and summarised by TrackMyOPT. USCIS publishes its own processing times, which are the figures that matter for an inquiry.',
    },
    {
      question: 'Why is the November median longer than the August one?',
      answer:
        'August measured February and March receipts while many of their slower cases were still pending. November pools every completed case, including that slow tail. The queue did not jump in November; more of it finished.',
    },
    {
      question: 'Where does the OPT megathread data come from?',
      answer:
        'From partner trackers that collect timelines posted in community threads and from users who record their own cases. TrackMyOPT ingests the anonymised dates daily and never stores receipt numbers in the community table.',
    },
  ],
  dataNote:
    'Snapshot date: November 8, 2026. Figures were read from the public decision-window estimate for case types initial_opt and stem_opt with no receipt prefix supplied; the estimate reported match level "premium status only", so each figure is the full completed, non-premium cohort for that case type in the community timeline table. Durations are calendar days from reported receipt date to reported approval date. Cases without both dates are excluded. The feed is self-reported and partner-sourced and may contain reporting errors; cohort sizes are shown so small or skewed samples can be judged. No receipt numbers, names or private tracker data are used.',
  sources: [methodology, decisionWindow, processingTimes, source.opt],
  related: [
    { label: 'August 2026 snapshot by receipt month', href: '/blog/monthly-opt-ead-processing-times-receipt-date' },
    { label: 'Premium processing real-case timelines', href: '/blog/opt-premium-processing-real-case-timelines-2026' },
    { label: 'OPT processing time 2026', href: '/blog/opt-processing-time-2026' },
    { label: 'Track your USCIS case', href: '/blog/uscis-case-status-tracking-guide' },
  ],
});
