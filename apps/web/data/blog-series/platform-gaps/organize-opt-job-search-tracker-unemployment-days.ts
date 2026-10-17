import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const organizeOptJobSearchTrackerUnemploymentDaysArticle = platformGap({
  slug: 'organize-opt-job-search-tracker-unemployment-days',
  title:
    'How to Organize an OPT Job Search Without Losing Track of Unemployment Days',
  seoTitle: 'Organize Your OPT Job Search and Unemployment Days',
  description:
    'A practical system for OPT job seekers: track applications by stage, plan weekly follow-ups, and keep a separate, accurate record of unemployment days and employment periods.',
  category: 'Career',
  tags: [
    'OPT job search',
    'job tracker',
    'OPT unemployment days',
    'post-completion OPT',
  ],
  readTime: '9 min read',
  cta: 'unemployment',
  imageAlt:
    'Illustration of a job seeker arranging sticky notes in columns on a board beside a day-counter dial',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Run your OPT job search with two separate records. The first is a job tracker that shows every application by stage, with follow-up dates. The second is an unemployment record that counts days from your OPT start date, minus periods of qualifying employment. Applications, interviews, and offers do not stop the unemployment clock. Only qualifying employment of 20 or more hours a week, related to your degree, does. Keep the two records separate and update the employment record whenever a job actually starts or ends.',
  keyTakeaways: [
    'Applying and interviewing do not stop the OPT unemployment clock.',
    'Post-completion OPT allows 90 unemployment days; STEM OPT adds 60 for 150 in total.',
    'Record employment start and end dates precisely and report them on time.',
    'A weekly review rhythm keeps follow-ups from slipping.',
  ],
  sections: [
    {
      heading: 'Two records, two jobs',
      paragraphs: [
        'A job tracker answers “where am I in each hiring process?” An unemployment record answers “how many authorized unemployment days do I have left?” Mixing them causes mistakes, such as assuming a signed offer letter stops the clock before the first day of work.',
        'Your unemployment record should be built from your EAD start date and actual employment periods. Those are the same facts you report to SEVP through the SEVP Portal or your DSO.',
      ],
      links: [
        {
          label: 'When does the OPT unemployment clock start?',
          href: '/blog/when-does-opt-unemployment-clock-start',
        },
        {
          label: 'OPT reporting requirements',
          href: '/blog/opt-reporting-requirements-dso',
        },
      ],
      sources: [platformSources.optReporting],
    },
    {
      heading: 'Set up a tracker by stage',
      paragraphs: [
        'Use clear stages and move each application forward honestly. The TrackMyOPT job tracker uses Wishlist, Applied, Recruiter Screen, Interviewing, Final Round, Offer, and Rejected, and you can add your own columns. It is unlimited on the free plan, and you can switch between board, table, and calendar views.',
      ],
      bullets: [
        'Wishlist: roles worth applying to, saved with the full job description.',
        'Applied: the date, resume version, and referral (if any).',
        'Screens and interviews: dates, interviewer names, and next steps.',
        'Offer: start date, hours, title, salary, and worksite, which you will need for reporting.',
        'Rejected: keep these records to learn which roles and employers respond.',
      ],
      links: [
        {
          label: 'Save jobs from LinkedIn, Indeed, and ATS portals',
          href: '/blog/track-job-applications-chrome-extension-opt',
        },
      ],
    },
    {
      heading: 'Keep the unemployment record accurate',
      paragraphs: [
        'Record each qualifying employment period with a start date and, when it ends, an end date. Use the date work actually started, not the offer date or onboarding paperwork date. If hours drop below 20 a week on post-completion OPT, that period may stop counting as qualifying employment.',
        'The free TrackMyOPT OPT Clock and STEM Clock tools calculate used and remaining days from your OPT dates and the employment periods you enter. Pro adds daily email reminders. The job tracker and the clock are deliberately separate: moving a card to Offer does not change your unemployment count. Add the employment period when work actually begins.',
      ],
      links: [
        {
          label: 'OPT unemployment days calculator guide',
          href: '/blog/opt-unemployment-days-calculator-guide',
        },
        {
          label: 'What counts as 20 hours on OPT',
          href: '/blog/what-counts-as-20-hours-on-opt',
        },
        {
          label: 'STEM OPT unemployment limit',
          href: '/blog/stem-opt-unemployment-limit',
        },
      ],
      sources: [platformSources.stemRule],
    },
    {
      heading: 'A weekly rhythm that works',
      paragraphs: [
        'Thirty focused minutes each week is enough for most searches:',
      ],
      numbered: [
        'Check remaining unemployment days and note any upcoming threshold, such as 30 days left.',
        'Move every application to its true stage and archive dead ends.',
        'Send follow-ups for applications older than 7 to 10 days with no response.',
        'Pick the next week’s target roles from your Wishlist, prioritizing employers with relevant filing history.',
        'Update any employment period that started or ended, and report it within the required window.',
      ],
    },
    {
      heading: 'Fictional example: an offer that starts in three weeks',
      paragraphs: [
        'Aisha is fictional. She is on day 70 of unemployment when she signs an offer starting in 21 days. If she assumed the offer stopped the clock, she would think she had 20 days left. In reality, she will reach day 91 on her start date. She asks the employer to move the start date up by two days, then records the employment period once she begins work.',
      ],
      note: 'If you are close to the limit, talk to your DSO early. Options can depend on your exact dates.',
    },
  ],
  checklist: [
    'Write down your EAD start date and end date.',
    'Create tracker stages and add every active application.',
    'Save the job description for each Wishlist and Applied role.',
    'Enter employment periods only when work actually starts.',
    'Report employer details and changes through the SEVP Portal or your DSO.',
    'Review unemployment days weekly.',
  ],
  mistakes: [
    'Treating an accepted offer as employment before the start date.',
    'Counting a sub-20-hour job as qualifying post-completion employment.',
    'Forgetting to add an end date when a job ends.',
    'Reporting employment late or not at all.',
  ],
  faq: [
    {
      question: 'Does applying for jobs stop the OPT unemployment clock?',
      answer:
        'No. Only qualifying employment stops it. Applications, interviews, and offers do not.',
    },
    {
      question:
        'Does the TrackMyOPT job tracker update my unemployment days automatically?',
      answer:
        'No. The job tracker and the OPT Clock are separate. Add employment periods in the OPT Clock when work starts, so your day count reflects real employment.',
    },
    {
      question: 'How many unemployment days do I get?',
      answer:
        'Post-completion OPT allows up to 90 days. A STEM OPT extension adds 60 days, for 150 days in total across both periods.',
    },
  ],
  sources: [platformSources.optReporting, platformSources.stemRule, source.opt],
  related: [
    {
      label: 'What happens if OPT expires?',
      href: '/blog/what-happens-if-opt-expires',
    },
    {
      label: 'Volunteer work and OPT employment rules',
      href: '/blog/volunteer-work-opt-employment-rules',
    },
    {
      label: 'Laid off on OPT',
      href: '/blog/laid-off-on-opt',
    },
  ],
});
