import { source } from '../shared';
import { platformGap, platformSources } from './shared';

export const staffingConsultingCompaniesOptStemOptArticle = platformGap({
  slug: 'staffing-consulting-companies-opt-stem-opt',
  title: 'Working for a Staffing or Consulting Company on OPT and STEM OPT',
  seoTitle: 'Staffing & Consulting Companies on OPT and STEM OPT',
  description:
    'Can you work for a staffing agency or IT consulting firm on OPT or STEM OPT? Learn the employer, training-plan, E-Verify, and third-party worksite rules, plus red flags to avoid.',
  category: 'OPT Employment',
  tags: [
    'staffing company OPT',
    'consulting company STEM OPT',
    'third-party placement',
    'OPT employer red flags',
  ],
  readTime: '10 min read',
  cta: 'sponsors',
  imageAlt:
    'Illustrated staffing firm building connected by a dotted path to a client office, with a briefcase',
  imageCaption: 'Conceptual illustration for educational context.',
  directAnswer:
    'On post-completion OPT, you can work for a staffing or consulting company if the job is related to your degree and at least 20 hours a week. STEM OPT is stricter. The company that signs your Form I-983 must be your real employer, enrolled in E-Verify. It must pay you, supervise and train you under the plan, and stay responsible for you even when you work at a client site. Avoid any firm that asks for money for training or placement, offers “benching” without pay, or reports employment that is not real.',
  keyTakeaways: [
    'Initial OPT allows agency and contract employment if the hours and degree-relation rules are met.',
    'For STEM OPT, the I-983 employer must provide the training and keep supervising you at client sites.',
    'Paying an employer for a job, or receiving “paper employment,” can put your status at serious risk.',
    'Unpaid “bench” time on post-completion OPT can count as unemployment.',
  ],
  sections: [
    {
      heading: 'Post-completion OPT: what is allowed',
      paragraphs: [
        'SEVP recognizes several employment types on post-completion OPT, including employment through an agency or consulting firm and contract work. The key requirements are the same as for any OPT job: the role must be directly related to your degree, and to count as employment it must be at least 20 hours a week.',
        'Report the employer that actually employs you, not the end client, along with the worksite address.',
      ],
      links: [
        {
          label: 'OPT job related to degree',
          href: '/blog/opt-job-related-to-degree',
        },
        {
          label: 'Multiple jobs on OPT',
          href: '/blog/multiple-jobs-opt-two-employers',
        },
      ],
      sources: [source.sevpEmployment, platformSources.optReporting],
    },
    {
      heading: 'STEM OPT: the employer must own the training',
      paragraphs: [
        'Under the 2016 STEM OPT rule, the employer on Form I-983 must have a bona fide employer-employee relationship with you, provide compensation comparable to similarly situated U.S. workers, be enrolled in E-Verify, and carry out the training plan. ICE guidance allows training at a client or third-party site, but the employer that signed the I-983 remains responsible for training, supervision, evaluations, and site visits.',
        'Arrangements where the signing company is only an “employer of record” while a client controls your daily work are high risk. The I-983 should truthfully describe who supervises you and where.',
      ],
      links: [
        {
          label: 'I-983 training plan guide',
          href: '/blog/i-983-training-plan-guide',
        },
        {
          label: 'STEM OPT employer site visit preparation',
          href: '/blog/stem-opt-employer-site-visit-preparation',
        },
      ],
      sources: [platformSources.stemRule, platformSources.stemFaq, source.i983],
    },
    {
      heading: 'Red flags to walk away from',
      bullets: [
        'You are asked to pay for training, placement, or “marketing” fees.',
        'The company offers to report you as employed while you are not working or not paid.',
        'Pay starts only when a client project begins, leaving you on an unpaid bench.',
        'Duties are vague, or the title does not match your degree.',
        'The company will not share its E-Verify Company ID or say who will supervise you.',
      ],
      paragraphs: [
        'DHS has publicly targeted OPT fraud schemes involving fake employers. Students who knowingly use false employment records can face SEVIS termination and lasting immigration consequences.',
      ],
      links: [
        {
          label: 'HSI OPT fraud crackdown: guide for legitimate students',
          href: '/blog/hsi-opt-fraud-crackdown-legitimate-students-guide',
        },
        {
          label: 'OPT and STEM OPT job offer verification checklist',
          href: '/blog/opt-stem-opt-job-offer-verification-checklist',
        },
      ],
    },
    {
      heading: 'Questions to ask before you sign',
      paragraphs: [
        'Ask these questions in writing, and keep the answers with your offer letter:',
      ],
      numbered: [
        'Who is my legal employer and who issues my pay stubs?',
        'What is the salary, and is it paid between client projects?',
        'Where will I work, and who will supervise me day to day?',
        'For STEM OPT: will you sign the I-983 and complete evaluations, and are you enrolled in E-Verify?',
        'Has your company sponsored H-1B workers in roles like mine?',
      ],
      links: [
        {
          label: 'Check if an employer uses E-Verify',
          href: '/blog/check-employer-e-verify-stem-opt-offer',
        },
        {
          label: 'How to read H-1B sponsor data',
          href: '/blog/how-to-read-h1b-sponsor-data-lca',
        },
      ],
    },
    {
      heading: 'Fictional example: a client-site placement',
      paragraphs: [
        'Ravi is fictional. He is offered a STEM OPT role at an IT consulting firm, placed at a bank client. The firm pays him a salary even between projects, is enrolled in E-Verify, and names one of its own senior engineers as his supervisor on the I-983, with monthly check-ins at the client site. The arrangement is documented honestly. A competing offer that charges a “training fee” and starts pay only after placement is one he declines.',
      ],
    },
  ],
  checklist: [
    'Confirm the legal employer and pay arrangement.',
    'Confirm the role relates to your degree.',
    'For STEM OPT, confirm E-Verify enrollment and I-983 signatures.',
    'Make sure the I-983 accurately names your supervisor and worksite.',
    'Report the employer and worksite on time.',
    'Never pay for a job or accept paper employment.',
  ],
  mistakes: [
    'Reporting the client as your employer.',
    'Accepting unpaid bench time and assuming it counts as employment.',
    'Signing an I-983 that does not describe the real arrangement.',
    'Paying placement or training fees.',
  ],
  faq: [
    {
      question: 'Can I work for a staffing agency on OPT?',
      answer:
        'Yes, on post-completion OPT, if the job relates to your degree and is at least 20 hours a week. Report the agency as your employer.',
    },
    {
      question: 'Can a consulting company be my STEM OPT employer?',
      answer:
        'It can, if it is enrolled in E-Verify, pays you, signs the I-983, and provides and supervises the training even at client sites.',
    },
    {
      question: 'Does bench time count as employment?',
      answer:
        'Unpaid time without qualifying work generally does not count as employment, and it can use up unemployment days.',
    },
  ],
  sources: [
    source.sevpEmployment,
    platformSources.stemRule,
    platformSources.stemFaq,
    source.i983,
  ],
  related: [
    {
      label: 'STEM OPT employer requirements',
      href: '/blog/stem-opt-employer-requirements',
    },
    {
      label: 'Change employers on STEM OPT',
      href: '/blog/change-employers-stem-opt',
    },
    {
      label: 'OPT and CPT enforcement scrutiny 2026',
      href: '/blog/opt-cpt-enforcement-scrutiny-2026',
    },
  ],
});
