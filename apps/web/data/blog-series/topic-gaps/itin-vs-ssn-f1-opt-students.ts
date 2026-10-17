import { source } from '../shared';
import { gap, gapSources } from './shared';

export const itinVsSsnF1OptStudentsArticle = gap({
    slug: 'itin-vs-ssn-f1-opt-students',
    title: 'ITIN vs SSN for F-1 and OPT Students: Which Tax ID You Need',
    seoTitle: 'ITIN vs SSN for F-1 / OPT Students',
    description:
      'Learn when F-1 students need a Social Security number versus an ITIN, how OPT work authorization connects to SSN applications, and common tax-filing mix-ups.',
    category: 'Tax & Finance',
    tags: ['ITIN', 'SSN F-1', 'OPT taxes', 'Form W-7'],
    readTime: '9 min read',
    cta: 'opt-timeline',
    image: '/blog/topic-gaps-2026-10/itin-vs-ssn-f1-opt-students.webp',
    imageAlt: 'Fictional F-1 student comparing Social Security and ITIN tax-ID documents for payroll',
    imageCaption: 'Conceptual illustration for educational context; not an official USCIS document.',
    directAnswer:
      'A Social Security number (SSN) is for people authorized to work in the United States and is what most OPT employees use for payroll. An Individual Taxpayer Identification Number (ITIN) is a tax processing number for people who need to file or report U.S. taxes but are not eligible for an SSN. If you are eligible for an SSN, you generally should not apply for an ITIN instead. Work authorization documents and SSA rules control SSN issuance—not a bank’s preference alone.',
    keyTakeaways: [
      'SSN ≠ immigration status proof; it is a tax and wage-reporting number.',
      'ITIN does not authorize employment.',
      'Many F-1 students need Form 8843 even with little or no U.S. income—ask a tax professional about your year.',
    ],
    sections: [
      {
        heading: 'When to apply for an SSN',
        paragraphs: [
          'F-1 students commonly apply for an SSN after they have authorization for on-campus work, CPT, or OPT and the required documentation for the Social Security Administration. For OPT, that usually includes passport, I-20, I-94, and the EAD (or other acceptable evidence per current SSA instructions).',
          'Employers use the SSN for wage reporting. Getting an SSN does not extend OPT or replace SEVIS reporting.',
        ],
        links: [
          {
            label: 'How to get an SSN on OPT',
            href: '/blog/how-to-get-ssn-on-opt',
          },
          {
            label: 'First U.S. paycheck and W-4',
            href: '/blog/first-us-paycheck-deductions-w4',
          },
        ],
        sources: [gapSources.ssn],
      },
      {
        heading: 'When an ITIN appears instead',
        paragraphs: [
          'An ITIN may be relevant when someone must comply with U.S. tax filing or reporting rules but is not eligible for an SSN—for example certain dependents, treaty claimants, or students with specific filing needs before work authorization. ITIN applications generally use Form W-7 and supporting identification documents.',
          'If you later become eligible for an SSN, IRS guidance describes transitioning away from the ITIN for wage reporting. Do not hold two active identification strategies casually; follow IRS instructions.',
        ],
        sources: [gapSources.itin, source.pub519],
      },
      {
        heading: 'Fictional example: bank account vs payroll',
        paragraphs: [
          'Daniel is fictional. A bank asks for a U.S. tax ID to open an account before his OPT EAD arrives. A friend tells him to get an ITIN immediately. Daniel confirms with ISS and a tax preparer that he will be SSN-eligible once the EAD arrives, so he avoids an unnecessary ITIN filing that would not authorize work and might confuse later payroll onboarding.',
        ],
      },
    ],
    checklist: [
      'Confirm whether you are eligible for an SSN before filing Form W-7.',
      'Bring the documents SSA currently lists for F-1/OPT applicants.',
      'Give payroll the SSN only through secure employer channels.',
      'Keep ITIN letters separate from EAD/SSN cards.',
      'Use a qualified tax preparer for 1040-NR vs 1040 questions.',
    ],
    mistakes: [
      'Thinking an ITIN authorizes OPT employment.',
      'Skipping SSA rules and using a made-up number on a W-4.',
      'Sharing SSN images in public chats or unsecured email.',
    ],
    faq: [
      {
        question: 'Can I start OPT work without an SSN?',
        answer:
          'Work authorization comes from the EAD and OPT rules, not the SSN. Payroll may need an SSN soon after hire; follow SSA and employer instructions. Do not work before your EAD start date.',
      },
      {
        question: 'Do F-2 dependents get SSNs?',
        answer:
          'F-2 dependents are generally not employment-authorized and usually are not eligible for SSNs for work. Tax ID needs can differ; verify with SSA/IRS guidance for the dependent’s situation.',
      },
      {
        question: 'Is an ITIN required to file Form 8843?',
        answer:
          'Form 8843 filing requirements depend on your facts. Many students file 8843 with or without wage income. Confirm current IRS instructions for your tax year.',
      },
    ],
    sources: [
      gapSources.ssn,
      gapSources.itin,
      source.pub519,
      source.form8843,
    ],
    related: [
      {
        label: 'Background checks and offer letters for OPT hires',
        href: '/blog/background-check-offer-letter-international-students',
      },
      {
        label: 'F-1 student tax filing guide 2026',
        href: '/blog/f1-student-tax-filing-guide-2026',
      },
      {
        label: 'Form 8843 for F-1 students with zero income',
        href: '/blog/form-8843-f1-students-zero-income',
      },
      {
        label: '1040-NR vs 1040 five-calendar-year rule',
        href: '/blog/1040nr-vs-1040-five-calendar-year-rule-f1',
      },
    ],
  });
