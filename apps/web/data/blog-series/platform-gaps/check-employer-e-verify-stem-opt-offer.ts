import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const checkEmployerEVerifyStemOptOfferArticle = platformGap({
  slug: 'check-employer-e-verify-stem-opt-offer',
  title:
    'Is This Employer Enrolled in E-Verify? How to Check Before a STEM OPT Offer',
  seoTitle: 'Check If an Employer Uses E-Verify Before STEM OPT',
  description:
    'STEM OPT requires an employer enrolled in E-Verify. Learn how to search the public E-Verify employer list, what a missing result means, and what to ask HR before you accept an offer.',
  category: 'STEM OPT',
  tags: [
    'E-Verify employer search',
    'STEM OPT employer',
    'E-Verify company ID',
    'STEM OPT offer',
  ],
  readTime: '7 min read',
  cta: 'opt-timeline',
  imageAlt: 'Illustrated document beside a green shield with a checkmark',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'To qualify for the STEM OPT extension, your employer must be enrolled in E-Verify and in good standing. Before you accept a STEM OPT offer, or before you plan to stay with your current employer into STEM OPT, search the public E-Verify employer list by company name. Then ask HR for the E-Verify Company ID you will need on Form I-765. A missing search result is not proof that the employer is not enrolled, because the public list has limits. A written confirmation from HR is what matters.',
  keyTakeaways: [
    'E-Verify enrollment is a STEM OPT requirement; it is not required for initial OPT.',
    'The public E-Verify list is a quick check, not a final answer.',
    'Your I-765 needs the employer’s E-Verify Company ID, not its EIN.',
    'Ask early, because enrolling in E-Verify can take an employer time.',
  ],
  sections: [
    {
      heading: 'Why E-Verify matters for STEM OPT',
      paragraphs: [
        'DHS rules require STEM OPT employers to be enrolled in E-Verify, sign the Form I-983 training plan, and meet other obligations. If an employer is not enrolled, it cannot be your STEM OPT employer until it enrolls.',
        'Initial post-completion OPT has no E-Verify requirement, which is why some students only discover the issue when they prepare a STEM application.',
      ],
      links: [
        {
          label: 'STEM OPT employer requirements',
          href: '/blog/stem-opt-employer-requirements',
        },
        {
          label: 'Employer refuses Form I-983',
          href: '/blog/employer-refuses-form-i983',
        },
      ],
      sources: [platformSources.everifyStem, source.stem],
    },
    {
      heading: 'How to search the public E-Verify list',
      numbered: [
        'Open the E-Verify Employer Search on TrackMyOPT or e-verify.gov.',
        'Search by the employer’s legal name, and try variations (Inc., LLC, the parent company name).',
        'Look at the location and enrollment details on matching results.',
        'Save a screenshot of the result for your records.',
      ],
      paragraphs: [
        'The TrackMyOPT E-Verify page embeds the official USCIS search with plain-English STEM OPT notes, so you are searching the government list directly.',
      ],
      sources: [platformSources.everifySearch],
    },
    {
      heading: 'What a missing result means',
      paragraphs: [
        'The public list has limits. It covers employers that self-report five or more employees, and names can differ from the brand you know. A large company may enroll under a parent entity or a payroll company. A missing result does not show whether an employer is enrolled.',
        'If you cannot find the employer, ask HR directly. If it is not enrolled, ask whether it will enroll and when. Enrollment is free, but it takes setup time.',
      ],
    },
    {
      heading: 'What to ask HR before accepting',
      paragraphs: [
        'Get these answers in writing, ideally by email, before you sign:',
      ],
      bullets: [
        'Is the company enrolled in E-Verify under the hiring entity, and what is the E-Verify Company ID?',
        'Will the company sign Form I-983 and complete the evaluations?',
        'Is the role paid, at least 20 hours a week, and related to my STEM degree?',
        'Who will supervise my training, and at which worksite?',
      ],
      links: [
        {
          label: 'E-Verify number vs EIN on I-765 and I-983',
          href: '/blog/everify-number-vs-ein-i765-i983',
        },
        {
          label: 'OPT and STEM OPT job offer verification checklist',
          href: '/blog/opt-stem-opt-job-offer-verification-checklist',
        },
      ],
    },
    {
      heading: 'Fictional example: a startup that is not enrolled',
      paragraphs: [
        'Sara is fictional. She works at a 12-person startup on initial OPT, and her EAD ends in five months. The startup does not appear in the E-Verify search, and HR confirms it is not enrolled. Because STEM OPT can be filed up to 90 days before her EAD ends, she raises it immediately. The startup enrolls, gives her the Company ID, and they complete the I-983 before her filing window opens.',
      ],
    },
  ],
  checklist: [
    'Search the employer on the E-Verify Employer Search.',
    'Get the E-Verify Company ID from HR in writing.',
    'Confirm the employer will sign Form I-983.',
    'Confirm the role is paid, related to your degree, and 20+ hours a week.',
    'Plan your STEM OPT filing window.',
  ],
  mistakes: [
    'Assuming every large employer is enrolled.',
    'Treating a missing search result as a final “no.”',
    'Putting the EIN where the E-Verify Company ID belongs.',
    'Waiting until your EAD is about to expire to ask.',
  ],
  faq: [
    {
      question: 'Does initial OPT require an E-Verify employer?',
      answer:
        'No. E-Verify enrollment is a requirement for the STEM OPT extension, not for initial post-completion OPT.',
    },
    {
      question: 'Where do I find the E-Verify Company ID?',
      answer:
        'Your employer gets it when it enrolls in E-Verify. Ask HR, because it is not the same as the EIN.',
    },
    {
      question: 'Can I keep working if my employer enrolls late?',
      answer:
        'You need a qualifying employer, a signed I-983, and a timely STEM OPT application. Talk to your DSO if your EAD end date is close.',
    },
  ],
  sources: [
    platformSources.everifySearch,
    platformSources.everifyStem,
    source.stem,
    source.i983,
  ],
  related: [
    {
      label: 'STEM OPT extension guide',
      href: '/blog/stem-opt-extension-guide',
    },
    {
      label: 'Change employers on STEM OPT',
      href: '/blog/change-employers-stem-opt',
    },
    {
      label: 'I-983 training plan guide',
      href: '/blog/i-983-training-plan-guide',
    },
  ],
});
