import { source } from '../shared';
import { gap, gapSources } from './shared';

export const partTimeOptCompleteGuideArticle = gap({
    slug: 'part-time-opt-complete-guide',
    title: 'Part-Time OPT Explained: Pre-Completion Limits and the 20-Hour Rule',
    seoTitle: 'Part-Time OPT Guide: Pre-Completion and 20-Hour Rules',
    description:
      'Learn when F-1 students can work part-time on OPT, how pre-completion part-time limits work while school is in session, and why post-completion OPT requires 20+ hours.',
    category: 'OPT Basics',
    tags: [
      'part-time OPT',
      'pre-completion OPT',
      '20 hour OPT rule',
      'OPT unemployment',
    ],
    readTime: '9 min read',
    cta: 'unemployment',
    image: '/blog/topic-gaps-2026-10/part-time-opt-complete-guide.webp',
    imageAlt: 'Fictional OPT employee checking a weekly hour tracker beside an EAD card',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      'Part-time OPT usually refers to pre-completion OPT while you are still enrolled: during the academic term, pre-completion OPT is limited to 20 hours per week or fewer. After you begin post-completion OPT, employment must be at least 20 hours per week in a job related to your major; dropping below that can start or continue unemployment-day counting. “Part-time” in an offer letter does not override these immigration hour rules.',
    keyTakeaways: [
      'Pre-completion part-time ≠ post-completion under-20-hours.',
      'Post-completion OPT has a 20-hour minimum for qualifying employment.',
      'Pre-completion time used reduces remaining post-completion months.',
    ],
    sections: [
      {
        heading: 'Pre-completion OPT while school is in session',
        paragraphs: [
          'If you have a pre-completion OPT EAD and school is in session, you are generally limited to part-time work (20 hours or fewer per week). During official school breaks, full-time pre-completion work may be allowed. Always match the dates on your EAD and the school calendar.',
          'CPT is a separate authorization. Do not combine assumptions across CPT and OPT hour rules without DSO confirmation.',
        ],
        links: [
          {
            label: 'Pre-completion OPT vs CPT',
            href: '/blog/pre-completion-opt-vs-cpt',
          },
        ],
        sources: [gapSources.practicalTraining, gapSources.optHub],
      },
      {
        heading: 'Post-completion OPT and the 20-hour floor',
        paragraphs: [
          'On post-completion OPT, qualifying employment is generally at least 20 hours per week. Multiple jobs can sometimes combine to meet the threshold if each is related to your major and properly reported. Falling below 20 hours can consume unemployment days toward the 90-day (or STEM 150-day) limit.',
        ],
        links: [
          {
            label: 'What counts as 20 hours on OPT',
            href: '/blog/what-counts-as-20-hours-on-opt',
          },
          {
            label: '90-day unemployment rule',
            href: '/blog/90-day-unemployment-rule-opt',
          },
          {
            label: 'Multiple jobs on OPT',
            href: '/blog/multiple-jobs-opt-two-employers',
          },
        ],
      },
      {
        heading: 'Fictional example: internship that “goes part-time”',
        paragraphs: [
          'Jonas is fictional and on post-completion OPT. His internship cuts him to 15 hours per week. Unless he adds related work to reach 20 hours or accepts unemployment-day counting, he risks burning OPT unemployment. The employer’s “part-time intern” label does not create a special immigration exception.',
        ],
      },
    ],
    checklist: [
      'Confirm whether your EAD is pre-completion or post-completion.',
      'Map weekly hours to the school-in-session calendar if pre-completion.',
      'Keep paystubs or hour logs that show the 20-hour threshold when required.',
      'Report employer and hour changes through the required portal/DSO process.',
      'Track unemployment days if hours drop below 20 on post-completion OPT.',
    ],
    mistakes: [
      'Working full-time on pre-completion OPT during the academic term.',
      'Assuming unpaid or volunteer roles automatically satisfy hour rules.',
      'Ignoring that pre-completion months reduce post-completion availability.',
    ],
    faq: [
      {
        question: 'Can post-completion OPT be part-time?',
        answer:
          'Post-completion employment must generally be at least 20 hours per week. Less than that typically does not qualify as employment for stopping the unemployment clock.',
      },
      {
        question: 'Do two 10-hour jobs count?',
        answer:
          'They may combine to meet 20 hours if both are related to your major and correctly reported. Keep clear records for each employer.',
      },
      {
        question: 'Does STEM OPT use the same 20-hour idea?',
        answer:
          'STEM OPT also expects qualifying engagement with the employer under the training plan and hour expectations used for unemployment rules. Follow STEM reporting and I-983 duties.',
      },
    ],
    sources: [gapSources.practicalTraining, gapSources.optHub, source.opt],
    related: [
      {
        label: 'Unpaid internships on OPT vs STEM OPT',
        href: '/blog/unpaid-internship-on-opt',
      },
      {
        label: 'Volunteer work and OPT unemployment',
        href: '/blog/volunteer-work-opt-employment-rules',
      },
      {
        label: 'When the OPT unemployment clock starts',
        href: '/blog/when-does-opt-unemployment-clock-start',
      },
      {
        label: 'OPT unemployment days calculator guide',
        href: '/blog/opt-unemployment-days-calculator-guide',
      },
    ],
  });
