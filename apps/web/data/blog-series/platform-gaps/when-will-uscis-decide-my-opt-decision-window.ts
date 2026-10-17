import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const whenWillUscisDecideMyOptDecisionWindowArticle = platformGap({
  slug: 'when-will-uscis-decide-my-opt-decision-window',
  title:
    'When Will USCIS Decide My OPT? How the Decision Window Estimate Works',
  seoTitle: 'When Will USCIS Decide My OPT? Decision Window Explained',
  description:
    'Estimate when USCIS may decide your OPT or STEM OPT I-765 using completed community cases: median wait, middle-50% window, sample size, and why it is a planning range, not a promise.',
  category: 'Case Tracking',
  tags: [
    'OPT decision date',
    'OPT processing estimate',
    'I-765 wait time',
    'STEM OPT processing',
  ],
  readTime: '8 min read',
  cta: 'case-status',
  imageAlt:
    'Illustrated calendar with a highlighted range of days beside a clock',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Nobody outside USCIS can tell you the exact day your OPT will be decided. What you can do is compare your receipt date with completed cases like yours. The TrackMyOPT Decision Window does this for free: it uses completed community-reported OPT or STEM OPT cases on regular processing, shows the typical (median) wait and the middle 50% range, and tells you how many cases it used. Treat the result as a planning range, and check your official status on USCIS Case Status Online.',
  keyTakeaways: [
    'USCIS publishes form-level processing times; it does not give individual decision dates.',
    'The Decision Window compares your receipt date with completed community cases of the same type.',
    'Always read the sample size: a small cohort means a less reliable range.',
    'Premium and regular processing cases are never mixed in the estimate.',
  ],
  sections: [
    {
      heading:
        'Why “processing time” and “my decision date” are different questions',
      paragraphs: [
        'The USCIS processing-times page describes how long most I-765 cases take at a given point. It is useful context, but it is a form-level statistic. It cannot tell you where your own receipt sits in the queue, and the published figure often lags what students are seeing right now.',
        'Students therefore swap timelines on forums and spreadsheets. Those reports are useful but scattered, mixed between premium and regular cases, and easy to over-read when a single fast approval gets attention.',
      ],
      links: [
        {
          label: 'OPT processing time in 2026',
          href: '/blog/opt-processing-time-2026',
        },
        {
          label: 'Monthly OPT EAD processing times by receipt date',
          href: '/blog/monthly-opt-ead-processing-times-receipt-date',
        },
      ],
      sources: [platformSources.processingTimes],
    },
    {
      heading: 'How the Decision Window builds an estimate',
      paragraphs: [
        'You choose Initial OPT or STEM OPT and enter the date USCIS received your I-765. You can optionally add the three-letter prefix of your receipt number (for example IOE or EAC). The tool never needs, and asks you never to enter, your full receipt number.',
        'It then looks for completed community-reported cases with the same case type on regular processing. When you give a prefix, it first tries cases from the same service center. If fewer than 15 matching cases are available, it widens to all regular-processing cases of that type. Durations outside a plausible range are excluded, so typos and outliers do not distort the result.',
      ],
      bullets: [
        'Day count: how many days you have been waiting since the receipt date.',
        'Typical decision wait: the median duration of matched completed cases.',
        'Decision window: the middle 50% of matched cases (25th to 75th percentile).',
        'Sample size: the number of completed community reports behind the numbers.',
      ],
      note: 'The estimate is not a USCIS decision date. Use it to plan job start conversations and travel questions, not to make promises to an employer.',
    },
    {
      heading: 'How to read your result',
      paragraphs: [
        'If you are before the window, waiting is normal. Keep checking official status and avoid filing duplicate service requests early.',
        'If you are inside the window, roughly half of comparable completed cases were decided in this range. This is the time to keep your mailing address current and watch for card production notices.',
        'If you are past the window, you are slower than most comparable cases, not necessarily in trouble. Check whether USCIS has posted a case outside normal processing time for your form and whether you received a request for evidence.',
      ],
      links: [
        {
          label: 'USCIS says my case is taking longer than expected',
          href: '/blog/uscis-myprogress-taking-longer-than-expected-opt',
        },
        {
          label: 'OPT EAD pending and processing delays',
          href: '/blog/opt-ead-pending-processing-delays-2026',
        },
      ],
    },
    {
      heading: 'Fictional example: reading a small versus large cohort',
      paragraphs: [
        'Priya is fictional. Her Initial OPT receipt date was 60 days ago. The tool reports a typical wait of about 80 days and a middle-50% window of roughly 70 to 95 days, based on several hundred completed reports. That is a fairly stable planning range: she tells her future employer that a start in five to six weeks is realistic but not guaranteed.',
        'Her friend Mateo (also fictional) adds a rare receipt prefix. The tool cannot find 15 matches for that service center, so it widens to all regular cases. The numbers look similar, but Mateo should remember the estimate no longer reflects his specific service center.',
      ],
    },
    {
      heading: 'Where official status and alerts fit',
      paragraphs: [
        'The Decision Window is free and needs no account. When you want ongoing tracking, you can save your case to the TrackMyOPT case-status dashboard. Free accounts track one case with manual checks. Pro adds daily USCIS checks and alerts when a status change is detected; timing can vary and is not guaranteed.',
        'Your official USCIS status always wins over any estimate. If the two disagree, act on USCIS.',
      ],
      links: [
        {
          label: 'How to track USCIS case status',
          href: '/blog/uscis-case-status-tracking-guide',
        },
        {
          label: 'OPT receipt number not working',
          href: '/blog/opt-receipt-number-not-working',
        },
      ],
      sources: [platformSources.caseStatus],
    },
  ],
  checklist: [
    'Find the received date on your I-797C receipt notice.',
    'Choose the right case type: Initial OPT or STEM OPT.',
    'Add only the three-letter receipt prefix if you want a service-center match.',
    'Note the sample size before trusting the range.',
    'Check official status on USCIS Case Status Online.',
    'Keep your mailing address current while you wait for the card.',
  ],
  mistakes: [
    'Treating the median as a promised decision date.',
    'Comparing your regular-processing case with premium-processing timelines.',
    'Entering a full receipt number into third-party tools that do not need it.',
    'Contacting USCIS before your case is outside normal processing time.',
  ],
  faq: [
    {
      question: 'Is the Decision Window an official USCIS estimate?',
      answer:
        'No. It is a planning estimate built from completed community-reported cases. USCIS Case Status Online is the official source for your case.',
    },
    {
      question: 'Does it include premium processing cases?',
      answer:
        'The public tool uses regular-processing cases only. Premium cases follow a different clock, so mixing them would make the range look faster than it is.',
    },
    {
      question: 'What if it says there are not enough reports?',
      answer:
        'That means there are too few comparable completed cases for a meaningful range. Try again later and keep checking your official USCIS status in the meantime.',
    },
    {
      question: 'Do I need an account?',
      answer:
        'No. The estimate is free without an account. An account is only needed if you want to save your case for ongoing tracking.',
    },
  ],
  sources: [
    platformSources.processingTimes,
    platformSources.caseStatus,
    source.opt,
  ],
  related: [
    {
      label: 'Premium processing real case timelines',
      href: '/blog/opt-premium-processing-real-case-timelines-2026',
    },
    {
      label: 'STEM OPT processing time',
      href: '/blog/stem-opt-processing-time-2026',
    },
    {
      label: 'Can you start work before your EAD arrives?',
      href: '/blog/can-you-start-work-before-opt-ead-arrives',
    },
  ],
});
