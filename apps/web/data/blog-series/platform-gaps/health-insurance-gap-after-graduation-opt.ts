import { platformGap, platformSources } from './shared';

export const healthInsuranceGapAfterGraduationOptArticle = platformGap({
  slug: 'health-insurance-gap-after-graduation-opt',
  title: 'Health Insurance Between Graduation and Your First OPT Job',
  seoTitle: 'Health Insurance Gap After Graduation on OPT',
  description:
    'Your student health plan may end before your OPT job begins. Learn when coverage typically ends, which options OPT students compare, and how to avoid a gap while you search.',
  category: 'Health Insurance',
  tags: [
    'OPT health insurance',
    'insurance after graduation',
    'student health plan ending',
    'OPT coverage gap',
  ],
  readTime: '8 min read',
  cta: 'opt-timeline',
  imageAlt:
    'Illustration of a graduate holding a phone beside a heart shield and a calendar with a gap',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Most university health plans end soon after your last enrolled term, often before your OPT job starts or before employer coverage begins. OPT itself does not require health insurance (J-1 rules are different), but going without coverage exposes you to very high U.S. medical bills. To avoid a gap, check your student plan’s end date, compare OPT or international-graduate plans, check whether you qualify for a state program or Marketplace coverage as a lawfully present immigrant, and plan for the waiting period before employer coverage begins.',
  keyTakeaways: [
    'Find the exact date your student plan ends; it is often tied to the term, not the OPT start date.',
    'Employer plans can have a waiting period after your start date.',
    'Lawfully present immigrants, including many F-1 students, may be able to use the Marketplace; eligibility depends on your situation.',
    'Some states run programs that certain immigrants qualify for. Rules vary by state and change often.',
  ],
  sections: [
    {
      heading: 'When student coverage usually ends',
      paragraphs: [
        'School plans are usually tied to enrollment periods. If you graduate in May, coverage may run through the summer or end soon after commencement, depending on the plan. Some schools let graduating students buy one extra term of coverage. Check your plan documents or ask the student health office.',
        'Write the end date next to your expected OPT start date and job start date. The difference between those dates is your potential gap.',
      ],
      links: [
        {
          label: 'OPT health insurance guide 2026',
          href: '/blog/opt-health-insurance-guide-2026',
        },
      ],
    },
    {
      heading: 'Options OPT students usually compare',
      bullets: [
        'An extension of your school plan, if your school offers one to graduates.',
        'International student or OPT-specific plans from private insurers, often month to month.',
        'Marketplace (ACA) coverage. Many lawfully present immigrants may qualify, and a loss of coverage can open a special enrollment period.',
        'State programs that some immigrants can access. Eligibility differs widely by state.',
        'Employer coverage once you start work, after any waiting period.',
      ],
      paragraphs: [
        'Compare the deductible, out-of-pocket maximum, network, and whether pre-existing conditions are covered. The cheapest monthly premium can become the most expensive plan after one emergency room visit.',
      ],
      sources: [platformSources.healthMarketplace],
    },
    {
      heading: 'How the TrackMyOPT finder helps',
      paragraphs: [
        'The free TrackMyOPT Health Insurance Finder asks for your state, monthly income, visa type, date of birth, and a few health details. It shows whether a state program may be available to you in that state, along with partner plans to compare. Selecting a plan takes you to the partner’s website to enroll.',
        'Use the finder to narrow options, then read each plan’s full documents before buying.',
      ],
      note: 'State eligibility rules change. Treat any result as a starting point and confirm with the program or insurer.',
    },
    {
      heading: 'Fictional example: a ten-week gap',
      paragraphs: [
        'Wei is fictional. His school plan ends on August 15. His OPT job starts September 15, and employer coverage begins after 30 days, on October 15. That is a two-month gap. He compares a month-to-month OPT plan with Marketplace coverage, chooses one with a reasonable out-of-pocket maximum, and sets a reminder to cancel it once employer coverage starts.',
      ],
    },
    {
      heading: 'Don’t forget dependents and travel',
      paragraphs: [
        'F-2 dependents need their own coverage. If you travel during your search, check whether a plan covers care outside the United States, because most domestic plans do not.',
      ],
      links: [
        {
          label: 'F-2 dependent visa rules',
          href: '/blog/f2-dependent-visa-rules-opt-students',
        },
        {
          label: 'Can you travel on OPT?',
          href: '/blog/can-you-travel-on-opt-complete-guide',
        },
      ],
    },
  ],
  checklist: [
    'Find your student plan’s exact end date.',
    'Ask your employer when benefits begin.',
    'Calculate the length of the gap.',
    'Compare deductibles, out-of-pocket maximums, and networks.',
    'Check Marketplace and state program eligibility.',
    'Set a reminder to cancel temporary coverage when employer coverage starts.',
  ],
  mistakes: [
    'Assuming the school plan lasts until your OPT ends.',
    'Choosing a plan only by its monthly premium.',
    'Forgetting the employer waiting period.',
    'Leaving dependents uncovered.',
  ],
  faq: [
    {
      question: 'Is health insurance required on F-1 OPT?',
      answer:
        'Federal F-1 rules do not require it, though some schools require coverage while enrolled. J-1 participants have mandatory insurance rules. Coverage is still strongly recommended.',
    },
    {
      question: 'Can OPT students use HealthCare.gov?',
      answer:
        'Many lawfully present immigrants can, depending on status and circumstances. Check HealthCare.gov’s immigrant eligibility guidance for your situation.',
    },
    {
      question: 'Is the TrackMyOPT insurance finder free?',
      answer:
        'Yes. It is free to use. Enrollment happens on the partner insurer’s website.',
    },
  ],
  sources: [platformSources.healthMarketplace],
  related: [
    {
      label: 'Laid off on OPT',
      href: '/blog/laid-off-on-opt',
    },
    {
      label: 'First U.S. paycheck deductions and W-4',
      href: '/blog/first-us-paycheck-deductions-w4',
    },
    {
      label: 'OPT anxiety and mental health',
      href: '/blog/opt-anxiety-mental-health-international-students',
    },
  ],
});
