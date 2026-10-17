import { platformGap, platformSources } from './shared';

export const unemploymentBenefitsOnOptArticle = platformGap({
  slug: 'unemployment-benefits-on-opt',
  title: 'Can You Get Unemployment Benefits on OPT After a Layoff?',
  seoTitle: 'Unemployment Benefits on OPT: Eligibility After Layoff',
  description:
    'Laid off on OPT or STEM OPT? Learn how state unemployment insurance treats F-1 workers, why many claims are denied, how benefits differ from the OPT unemployment-day limit, and what to do first.',
  category: 'Layoffs',
  tags: [
    'unemployment benefits OPT',
    'laid off OPT',
    'unemployment insurance F-1',
    'STEM OPT layoff',
  ],
  readTime: '8 min read',
  cta: 'unemployment',
  imageAlt: 'Illustrated benefits form beside an open umbrella',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'Unemployment insurance is run by each state, and eligibility depends on that state’s rules, your work authorization, and whether your job was covered. Many F-1 students on OPT find that their wages were not covered, because work by nonresident-alien F-1 students is generally exempt from federal unemployment tax and several states exclude it as well. Some OPT workers are eligible, especially resident aliens for tax purposes. Either way, unemployment benefits do not stop your OPT unemployment clock. Ask your state agency directly and answer every work-authorization question accurately.',
  keyTakeaways: [
    'There is no single federal answer; each state decides eligibility.',
    'Wages of nonresident-alien F-1 students are often exempt from unemployment taxes, which can limit eligibility.',
    'Claimants must usually be able, available, and authorized to work during each week claimed.',
    'Receiving benefits does not pause the 90-day or 150-day OPT unemployment limit.',
  ],
  sections: [
    {
      heading: 'How unemployment insurance works',
      paragraphs: [
        'Unemployment insurance (UI) is a federal-state program funded mainly by employer payroll taxes. Each state sets its own eligibility rules, benefit amounts, and weekly certification process. You generally need covered wages during a base period, a job loss that was not your fault, and ongoing availability to work.',
      ],
      sources: [platformSources.unemploymentInsurance],
    },
    {
      heading: 'Why F-1 OPT workers are often ineligible',
      paragraphs: [
        'Wages paid to nonresident-alien F-1 students for work allowed by their status are generally exempt from FICA taxes and federal unemployment (FUTA) tax. Several states follow a similar exclusion for state unemployment coverage. If your wages were not covered, there may be nothing to claim against.',
        'Once you become a resident alien for tax purposes, usually after five calendar years in F-1 status, these exemptions typically stop applying. Your wages may then be covered.',
      ],
      links: [
        {
          label: 'FICA tax refund for F-1 OPT workers',
          href: '/blog/fica-tax-refund-f1-opt-forms-843-8316',
        },
        {
          label: 'Resident alien for tax, still F-1 for immigration',
          href: '/blog/resident-alien-tax-still-f1-immigration',
        },
      ],
      sources: [platformSources.futaExempt],
    },
    {
      heading: 'Work authorization during the claim',
      paragraphs: [
        'States ask whether you are authorized to work for each week you claim. On OPT you remain authorized while your EAD is valid. After it expires, without a pending STEM OPT application or other authorization, you are no longer available to work and generally cannot certify.',
        'Answer every question truthfully. Misstating your immigration status on a benefits claim can create both repayment obligations and immigration problems.',
      ],
    },
    {
      heading: 'Benefits vs the OPT unemployment limit',
      paragraphs: [
        'These are separate systems. Even if you receive UI benefits, each day without qualifying employment still counts toward your 90-day OPT limit, or 150 days in total with STEM OPT. Benefits do not count as employment.',
      ],
      links: [
        {
          label: '90-day OPT unemployment rule',
          href: '/blog/90-day-unemployment-rule-opt',
        },
        {
          label: 'STEM OPT unemployment limit',
          href: '/blog/stem-opt-unemployment-limit',
        },
      ],
    },
    {
      heading: 'What to do in the first week after a layoff',
      paragraphs: [
        'The first days after a layoff set up both your immigration record and any benefits claim:',
      ],
      numbered: [
        'Ask HR for your official last day of employment, in writing.',
        'Report the end of employment through the SEVP Portal or your DSO as required.',
        'Start counting unemployment days from the day after your last day of work.',
        'Contact your state UI agency to ask whether your wages were covered.',
        'Check severance, final pay, and health coverage dates.',
        'Focus your search on roles that can start before your unemployment limit.',
      ],
      links: [
        {
          label: 'Laid off on OPT',
          href: '/blog/laid-off-on-opt',
        },
        {
          label: 'Laid off on STEM OPT',
          href: '/blog/laid-off-on-stem-opt',
        },
      ],
    },
    {
      heading: 'Is UI a public charge concern?',
      paragraphs: [
        'Unemployment insurance is an earned benefit funded by payroll taxes, and current public charge guidance focuses on specific means-tested programs. Rules can change, so if you are planning a green card application, ask an immigration attorney before you file.',
      ],
    },
  ],
  checklist: [
    'Get your last day of employment in writing.',
    'Report the end of employment on time.',
    'Ask your state agency about coverage before filing.',
    'Check your tax residency status.',
    'Track OPT unemployment days separately from benefit weeks.',
  ],
  mistakes: [
    'Assuming UI benefits stop the OPT unemployment clock.',
    'Answering work-authorization questions inaccurately.',
    'Claiming benefits after your EAD expires.',
    'Delaying the end-of-employment report.',
  ],
  faq: [
    {
      question: 'Can F-1 students on OPT collect unemployment?',
      answer:
        'It depends on the state and on whether your wages were covered. Many nonresident-alien F-1 workers are not covered. Some, including resident aliens for tax purposes, may be.',
    },
    {
      question: 'Do unemployment benefits count as OPT employment?',
      answer: 'No. They do not stop the OPT unemployment-day count.',
    },
    {
      question: 'Who decides if I qualify?',
      answer:
        'Your state unemployment agency. Contact it directly with your employment details.',
    },
  ],
  sources: [
    platformSources.unemploymentInsurance,
    platformSources.futaExempt,
    platformSources.optReporting,
  ],
  related: [
    {
      label: 'OPT unemployment days calculator guide',
      href: '/blog/opt-unemployment-days-calculator-guide',
    },
    {
      label: 'Fall out of F-1 status: your options',
      href: '/blog/fall-out-of-f1-status-options',
    },
    {
      label: '60-day grace period for F-1 students',
      href: '/blog/60-day-grace-period-f1-students',
    },
  ],
});
