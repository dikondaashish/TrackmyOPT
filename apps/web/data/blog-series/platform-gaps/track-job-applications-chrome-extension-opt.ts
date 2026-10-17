import { platformGap } from './shared';

export const trackJobApplicationsChromeExtensionOptArticle = platformGap({
  slug: 'track-job-applications-chrome-extension-opt',
  title:
    'Track OPT Job Applications From LinkedIn, Indeed, and ATS Portals in One Place',
  seoTitle: 'Track OPT Job Applications Across LinkedIn, Indeed & ATS',
  description:
    'How OPT job seekers can save postings from LinkedIn, Indeed, Workday, Greenhouse, and other portals into one tracker, spot explicit sponsorship wording, and keep control of every submission.',
  category: 'Career',
  tags: [
    'OPT job search',
    'job application tracker',
    'Chrome extension',
    'sponsorship jobs',
  ],
  readTime: '7 min read',
  cta: 'extension',
  imageAlt:
    'Illustrated laptop showing a job posting and a saved card, with a browser extension puzzle piece',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'OPT job seekers often apply across LinkedIn, Indeed, Handshake, and dozens of employer ATS portals, then lose track of where they applied and what each posting said about sponsorship. The free TrackMyOPT Chrome extension saves a posting (company, role, location, link, salary text, and description) to your TrackMyOPT job tracker as Wishlist or Applied. It flags whether the posting explicitly mentions or rules out sponsorship, and it never submits an application for you. Saving requires a free account.',
  keyTakeaways: [
    'One tracker beats a dozen browser tabs when your OPT unemployment clock is running.',
    'Saving the job description matters: postings disappear after they close.',
    'A sponsorship signal reflects posting wording only; it is not an employer commitment.',
    'You stay in control. The extension can help prefill, but it never clicks submit.',
  ],
  sections: [
    {
      heading: 'Why application tracking matters more on OPT',
      paragraphs: [
        'U.S. citizens can lose a spreadsheet and only lose time. On post-completion OPT, every week without qualifying employment can count toward your 90-day unemployment limit. A clear record of where you applied, when, and what stage you reached helps you focus follow-ups on the roles that are actually moving.',
        'Saved descriptions are also useful later. If you accept an offer, you may need to explain how the role relates to your degree, and the original posting is a handy starting point.',
      ],
      links: [
        {
          label: '90-day OPT unemployment rule',
          href: '/blog/90-day-unemployment-rule-opt',
        },
        {
          label: 'Is my OPT job related to my degree?',
          href: '/blog/opt-job-related-to-degree',
        },
      ],
    },
    {
      heading: 'Where the extension works',
      paragraphs: [
        'The extension is built for the places international students actually apply:',
      ],
      bullets: [
        'Job boards: LinkedIn Jobs, Indeed, Glassdoor, ZipRecruiter, Handshake, Wellfound, Dice, and many others.',
        'Employer ATS portals: Workday, Greenhouse, Lever, iCIMS, Taleo, SuccessFactors, Ashby, SmartRecruiters, and more.',
        'Supported company career pages with typical careers or jobs URLs.',
      ],
      note: 'Site layouts change often. If a page is not recognized, add the job manually in the dashboard tracker.',
    },
    {
      heading: 'What gets saved, and where it goes',
      paragraphs: [
        'When you save a posting, the extension sends the company name, role title, job link, location, any salary text, and the job description to your TrackMyOPT job tracker, marked Wishlist or Applied. From there you can move it through Recruiter Screen, Interviewing, Final Round, Offer, or Rejected, add custom columns, and switch between board, table, and calendar views.',
        'The extension does not read your messages or your job-site login credentials. Sign-in is optional for browsing but required to save jobs, so they sync to your account.',
      ],
      links: [
        {
          label: 'How to organize an OPT job search',
          href: '/blog/organize-opt-job-search-tracker-unemployment-days',
        },
      ],
    },
    {
      heading: 'Reading the sponsorship signal correctly',
      paragraphs: [
        'Many postings say nothing about visas. Some say “sponsorship available,” and others say “must be authorized to work without sponsorship now or in the future.” The extension classifies the posting text into one of three buckets: mentions sponsorship, rules it out, or does not say.',
        'This is a reading aid, not a confirmation. A posting that mentions sponsorship can still decline an OPT candidate, and many employers that sponsor never say so in the posting. Pair the signal with filing history before you invest hours in an application.',
      ],
      links: [
        {
          label: 'How to answer the sponsorship question',
          href: '/blog/how-to-answer-sponsorship-question',
        },
        {
          label: 'How to read H-1B sponsor data',
          href: '/blog/how-to-read-h1b-sponsor-data-lca',
        },
      ],
    },
    {
      heading: 'Prefill without losing control',
      paragraphs: [
        'Long ATS forms ask for the same details repeatedly. Free accounts get step-by-step prefill that you review field by field. Pro and Dedicated plans add continuous prefill and a guided mode. In every plan, the extension never submits an application; you review and click submit yourself.',
        'Review work-authorization questions especially carefully. Answers about OPT, STEM OPT, and future sponsorship should be accurate for your situation, not auto-filled guesses.',
      ],
    },
    {
      heading: 'OPT dates in the popup',
      paragraphs: [
        'When you are signed in, the extension popup also gives quick access to the OPT and STEM OPT filing-window calculators and unemployment clocks, so you can check your remaining days without leaving the job page.',
      ],
      links: [
        {
          label: 'OPT unemployment days calculator guide',
          href: '/blog/opt-unemployment-days-calculator-guide',
        },
      ],
    },
  ],
  checklist: [
    'Install the extension from the Chrome Web Store link on the TrackMyOPT extension page.',
    'Sign in so saved jobs sync to your dashboard tracker.',
    'Save the posting before you apply, so the description is preserved.',
    'Mark it Applied after you submit, and set a follow-up date.',
    'Check the sponsorship signal, then verify with employer filing history.',
    'Review every prefilled answer, especially work-authorization questions.',
  ],
  mistakes: [
    'Treating “mentions sponsorship” as a guaranteed H-1B commitment.',
    'Letting prefill answer visa questions without reading them.',
    'Applying from many boards without recording which version of your resume you used.',
    'Waiting until an offer to look for the original job description.',
  ],
  faq: [
    {
      question: 'Is the extension free?',
      answer:
        'Yes. Saving jobs and step-by-step prefill are free. Pro and Dedicated add continuous prefill and a guided mode, and none of the plans auto-submit applications.',
    },
    {
      question: 'Does it work on every job site?',
      answer:
        'It supports major job boards, common ATS platforms, and many company career pages. Layouts change, so some pages may not be recognized; you can always add a job manually.',
    },
    {
      question: 'Does it read my LinkedIn messages or passwords?',
      answer:
        'No. It is designed to minimize data collection and does not access your messages or job-site login credentials.',
    },
    {
      question: 'Can it tell me if a company will sponsor me?',
      answer:
        'No tool can promise that. The extension only reports what the posting says. Use employer filing history and direct conversations with recruiters to judge sponsorship.',
    },
  ],
  sources: [
    {
      label: 'TrackMyOPT Chrome extension listing',
      publisher: 'Chrome Web Store',
      url: 'https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm',
    },
  ],
  related: [
    {
      label: 'F-1 visa jobs guide',
      href: '/blog/f1-visa-jobs-guide',
    },
    {
      label: 'ATS resume guide for international students',
      href: '/blog/ats-resume-international-students-2026',
    },
    {
      label: 'Top H-1B sponsor companies',
      href: '/blog/top-h1b-sponsor-companies-2026',
    },
  ],
});
